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

#  load the config file
settings = None
with open('config.json', 'r') as infile:
  settings = json.load(infile)

storage_dir = '/storage'
if os.environ['STORAGE_DIR']:
	storage_dir = os.environ['STORAGE_DIR']

artifacts_dir = '/artifacts'
if os.environ['ARTIFACTS_DIR']:
	artifacts_dir = os.environ['ARTIFACTS_DIR']

checkpoint_dir = storage_dir + '/%s' %(settings['checkpoint_name'])
checkpoint_zip_file = storage_dir + '/%s.zip' %(settings['checkpoint_name'])
output_dir = artifacts_dir

# Out of memory error
# - nsynth generate needs sample length cut down to avoid this

#	preserve the working directory path
source_dir = os.getcwd()

def init():
	print("compute: %s" %(os.environ['COMPUTE_TYPE']))
	print("python version: %s" %(sys.version))
	print("storage: %s" %(storage_dir))
	print("artifacts: %s" %(artifacts_dir))
	if (os.path.isdir(checkpoint_dir)):
		print ("checkpoint already extracted")

	else:
		print("extracting checkpoint...")

		zip_ref = zipfile.ZipFile(checkpoint_zip_file, 'r')
		zip_ref.extractall(storage_dir)
		zip_ref.close()

		print("extracted")
		print(os.listdir(checkpoint_dir))

def compute_embeddings():
	subprocess.call(["nsynth_save_embeddings", 
		"--checkpoint_path=%s/model.ckpt-200000" %(checkpoint_dir), 
		"--source_path=input", 
		"--save_path=embeddings_input", 
		"--batch_size=32"])

def compute_new_embeddings():
	#	constants and rearrangement of settings vars for processing
	pitches = settings['pitches']
	resolution = settings['resolution']
	final_length = settings['final_length']
	instrument_groups = [settings['pads']['NW'], settings['pads']['NE'], settings['pads']['SE'], settings['pads']['SW']]
	combinations = sorted(product(*instrument_groups))
	xy_grid = make_grid(resolution)

	#	cache all embeddings
	embeddings_lookup = {}

	for filename in os.listdir('embeddings_input/'):
		# ignore all non-npy files
		if '.npy' in  filename:
			#	convert filename to reference key
			parts = basename(filename).split('_')
			reference = '{}_{}'.format(parts[0], parts[1])

			#	load the saved embedding
			embeddings_lookup[reference] = np.load("embeddings_input/%s" % filename)

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

				np.save('embeddings_output/' + name + '.npy', interpolated.astype(np.float32))

def batch_embeddings():
	num_embeddings = len(os.listdir('embeddings_output'))
	batch_size = num_embeddings / settings['gpus']
	#	split the embeddings per gpu in folders
	for i in range(0, settings['gpus']):
		foldername = 'embeddings_batched/batch%i' % i
		if not os.path.exists(foldername):
			os.mkdir(foldername)
		output_foldername = 'audio_output/batch%i' % i
		if not os.path.exists(output_foldername):
			os.mkdir(output_foldername)

	#	shuffle to the folders
	batch = 0
	for filename in os.listdir('embeddings_output'):
		target_folder = 'embeddings_batched/batch%i/' % batch
		batch += 1
		if batch >= settings['gpus']:
			batch = 0

		os.rename('embeddings_output/' + filename, target_folder + filename)

def gen_call(gpu):
	return subprocess.call(["nsynth_generate",
		"--checkpoint_path=%s/model.ckpt-200000" %(checkpoint_dir),
		"--source_path=embeddings_batched/batch%i" % gpu,
		"--save_path=audio_output/batch%i" % gpu,
		"--sample_length=100",
		"--encodings=true",
		"--log=INFO",
		"--batch_size=512"])

def generate_audio():
	#  map calls to gpu threads
	pool = ThreadPool(settings['gpus'])
	results = pool.map_async(gen_call, range(settings['gpus']))
	time.sleep(5)
	pbar = tqdm(total=sum([len(os.listdir('embeddings_batched/batch%s'%(i))) for i in range(settings['gpus'])]))
	pbar = tqdm(len(os.listdir('embeddings_output')))
	pbar.set_description("Number of files for which processing has started")
	while not results.ready():
		num_files = sum([len(os.listdir('audio_output/batch%s' %(i))) for i in range(settings['gpus'])])
		num_files = len(os.listdir('audio_output'))
		pbar.update(num_files - pbar.n)
		time.sleep(1)
	pbar.close()
	pool.close()
	pool.join()

	for i in range(0, settings['gpus']):
		source = 'audio_output/batch%i/' % i
		files = os.listdir(source)
		for f in files:
			shutil.move(source + f, output_dir)
	

if __name__ == "__main__":
	print("============================")
	print("N-SYNTH")
	print("-------------------")
	print("initializing...")
	init()

	print("-------------------")
	print("Computing input embeddings...")
	compute_embeddings()

	print("-------------------")
	print("Computing new embeddings...")
	compute_new_embeddings()

	print("-------------------")
	print("Batching embeddings...")
	batch_embeddings()

	print("-------------------")
	print("Generating sounds...")
	generate_audio()

	print("Done")