import json, os, subprocess
import time
import shutil

import numpy as np
from multiprocessing.dummy import Pool as ThreadPool

from tqdm import tqdm
from itertools import product
from os.path import basename
from utils import *

import sys
import zipfile

from dask import compute, delayed
from dask.distributed import Client
import joblib

CONFIG_FILE = os.environ['CONFIG_FILE']
settings = None
with open(CONFIG_FILE, 'r') as infile:
  settings = json.load(infile)

STORAGE_DIR = settings['storage_dir']
ARTIFACTS_DIR = settings['artifacts_dir']
BATCH_SIZE_SAVE_EMBEDDINGS = settings['batch_size_save_embeddings']
BATCH_SIZE_GENERATE_SOUNDS = settings['batch_size_generate_sounds']
SAMPLE_LENGTH_GENERATE_SOUNDS = settings['sample_length_generate_sounds']

checkpoint_dir = STORAGE_DIR + '/%s' %(settings['checkpoint_name'])
checkpoint_zip_file = STORAGE_DIR + '/%s.zip' %(settings['checkpoint_name'])
output_dir = ARTIFACTS_DIR

# Out of memory error
# - nsynth generate needs sample length cut down to avoid this

#	preserve the working directory path
source_dir = os.getcwd()

def get_only_files(path):
	files = []
	for file in os.listdir(path):
		if os.path.isfile(os.path.join(path, file)):
			if not file.startswith('.'):
				files.append(file)
	return files

def init():
	print("compute: %s" %(os.environ['COMPUTE_TYPE']))
	print("python: %s" %(sys.version))
	print("current working path: %s" %(os.getcwd()))
	print("STORAGE_DIR: %s" %(STORAGE_DIR))
	print("ARTIFACTS_DIR: %s" %(ARTIFACTS_DIR))
	print("BATCH_SIZE_SAVE_EMBEDDINGS: %s" %(BATCH_SIZE_SAVE_EMBEDDINGS))
	if (os.path.isdir(checkpoint_dir)):
		print ("checkpoint already extracted")

	else:
		print("extracting checkpoint...")

		zip_ref = zipfile.ZipFile(checkpoint_zip_file, 'r')
		zip_ref.extractall(STORAGE_DIR)
		zip_ref.close()

		print("extracted")
		print(os.listdir(checkpoint_dir))

def compute_embeddings():

	print("-----------------------------")
	print("Computing sound embeddings...")

	input_path = 'data/input'
	output_path = 'data/embeddings_raw'
	num_input_files = len(os.listdir(input_path))

	subprocess.call(["nsynth_save_embeddings", 
		"--checkpoint_path=%s/model.ckpt-200000" %(checkpoint_dir), 
		"--source_path=%s" %(input_path), 
		"--save_path=%s" %(output_path), 
		"--log=ERROR",
		"--batch_size=%s" %(BATCH_SIZE_SAVE_EMBEDDINGS)])

	num_output_files = len(get_only_files(output_path))
	print('------------------------')
	print('RESULT')
	print('# input wav files: %s' %(num_input_files))
	print('# embeddings generated: %s' %(num_output_files))
	print(get_only_files(output_path))
	
	assert num_input_files==num_output_files, '[compute_embeddings]: different quanity of files generated'

def interpolate_embeddings():

	print("---------------------------")
	print("Interpolating embeddings...")

	input_path = 'data/embeddings_raw'
	output_path = 'data/embeddings_interpolated'

	#	constants and rearrangement of settings vars for processing
	pitches = settings['pitches']
	resolution = settings['resolution']
	instrument_groups = [settings['pads']['NW'], settings['pads']['NE'], settings['pads']['SE'], settings['pads']['SW']]
	combinations = sorted(product(*instrument_groups))
	xy_grid = make_grid(resolution)

	#	cache all embeddings
	embeddings_lookup = {}

	for filename in os.listdir(input_path):
		# ignore all non-npy files
		if '.npy' in  filename:
			#	convert filename to reference key
			parts = basename(filename).split('_')
			reference = '{}_{}'.format(parts[0], parts[1])

			#	load the saved embedding
			embeddings_lookup[reference] = np.load(input_path + '/' + filename)

	def get_embedding(instrument, pitch):
		reference = '{}_{}'.format(instrument, pitch)
		return embeddings_lookup[reference]

	done = set()
	all_names = []
	all_embeddings = []

	for combination in tqdm(combinations):
		for pitch in  pitches:
			embeddings = np.asarray([get_embedding(instrument, pitch) for instrument in combination])
			
			for xy in xy_grid:
				weights = get_weights(xy)
				interpolated = (embeddings.T * weights).T.sum(axis=0)

				#	avoid repetition
				meta = get_description(combination, weights, pitch)
				if meta in done:
					continue
				done.add(meta)

				name = description_to_name(meta)

				#	reshape array
				# interpolated = np.reshape(interpolated, (1,) + interpolated.shape)

				np.save(output_path + '/' + name + '.npy', interpolated.astype(np.float32))
	

	num_output_files = len(get_only_files(output_path))
	print('------------------------')
	print('RESULT')
	print('# interpolated embeddings generated: %s' %(num_output_files))
	print(get_only_files(output_path))

def batch_embeddings():

	print("---------------------")
	print("Batching embeddings...")

	num_embeddings = len(os.listdir('data/embeddings_interpolated'))
	batch_size = num_embeddings / settings['gpus']
	#	split the embeddings per gpu in folders
	for i in range(0, settings['gpus']):
		foldername = 'data/embeddings_batched/batch%i' % i
		if not os.path.exists(foldername):
			os.mkdir(foldername)
		output_foldername = 'data/audio_output/batch%i' % i
		if not os.path.exists(output_foldername):
			os.mkdir(output_foldername)

	#	shuffle to the folders
	batch = 0
	for filename in os.listdir('data/embeddings_interpolated'):
		target_folder = 'data/embeddings_batched/batch%i/' % batch
		batch += 1
		if batch >= settings['gpus']:
			batch = 0

		os.rename('data/embeddings_interpolated/' + filename, target_folder + filename)

def gen_call(gpu):
	return subprocess.call(["nsynth_generate",
		"--checkpoint_path=%s/model.ckpt-200000" %(checkpoint_dir),
		"--source_path=data/embeddings_batched/batch%i" % gpu,
		"--save_path=data/audio_output/batch%i" % gpu,
		"--sample_length=%s" %(SAMPLE_LENGTH_GENERATE_SOUNDS),
		"--encodings=true",
		"--log=INFO",
		"--batch_size=%s" %(BATCH_SIZE_GENERATE_SOUNDS)])

def generate_audio():

	print("--------------------")
	print("Generating sounds...")

	#  map calls to gpu threads
	# pool = ThreadPool(settings['gpus'])
	# results = pool.map_async(gen_call, range(settings['gpus']))
	# time.sleep(5)
	# pbar = tqdm(total=sum([len(os.listdir('embeddings_batched/batch%s'%(i))) for i in range(settings['gpus'])]))
	# pbar = tqdm(len(os.listdir('embeddings_interpolated')))
	# pbar.set_description("Number of files for which processing has started")
	# while not results.ready():
	# 	num_files = sum([len(os.listdir('data/audio_output/batch%s' %(i))) for i in range(settings['gpus'])])
	# 	num_files = len(os.listdir('data/audio_output'))
	# 	pbar.update(num_files - pbar.n)
	# 	time.sleep(1)
	# pbar.close()
	# pool.close()
	# pool.join()

	client = Client(processes=False)
	with joblib.parallel_backend('dask'):
		joblib.Parallel(verbose=10)(joblib.delayed(gen_call)(core) for core in range(settings['gpus']))

	for i in range(0, settings['gpus']):
		source = 'data/audio_output/batch%i/' % i
		files = os.listdir(source)
		for f in files:
			shutil.move(source + f, output_dir)
	

if __name__ == "__main__":
	print("=======")
	print("N-SYNTH")
	print("-------")
	
	init()
	# compute_embeddings()
	interpolate_embeddings()
	batch_embeddings()
	generate_audio()

	print("--------")
	print("COMPLETE")
	print("========")