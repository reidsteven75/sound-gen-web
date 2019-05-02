import sys
import os
import subprocess
import json
import zipfile

from tqdm import tqdm
from itertools import product
from os.path import basename
from utils import *

JOB_NAME = 'ENCODE-INTERPOLATE'

COMPUTE_ENVIRONMENT = os.environ['COMPUTE_ENVIRONMENT']
config = None
with open('config-%s.json' %(COMPUTE_ENVIRONMENT), 'r') as infile:
  config = json.load(infile)

DIR_STORAGE = config['dir']['storage']
DIR_ARTIFACTS = config['dir']['artifacts']
BATCH_SIZE = config['batch_size']
DIR_CHECKPOINT = DIR_STORAGE + '/%s' %(config['checkpoint_name'])
CHECKPOINT_ZIP_FILE = DIR_STORAGE + '/%s.zip' %(config['checkpoint_name'])

def create_dir(path):
	os.makedirs(path, exist_ok=True)

def get_only_files(path):
	files = []
	for file in os.listdir(path):
		if os.path.isfile(os.path.join(path, file)):
			if not file.startswith('.'):
				files.append(file)
	return files

def init():
	print('compute: %s' %(os.environ['COMPUTE_TYPE']))
	print('python: %s' %(sys.version))
	print('current working path: %s' %(os.getcwd()))
	print('DIR_STORAGE: %s' %(DIR_STORAGE))
	print('DIR_ARTIFACTS: %s' %(DIR_ARTIFACTS))
	print('BATCH_SIZE: %s' %(BATCH_SIZE))

	if (os.path.isdir(DIR_CHECKPOINT)):
		print ('checkpoint already extracted')

	else:
		print('extracting checkpoint...')

		zip_ref = zipfile.ZipFile(CHECKPOINT_ZIP_FILE, 'r')
		zip_ref.extractall(DIR_STORAGE)
		zip_ref.close()

		print('extracted')
		print(os.listdir(DIR_CHECKPOINT))



def compute_embeddings():

	print('-------------------------')
	print('START: compute embeddings')

	input_path = 'data/input'
	output_path = 'data/embeddings_raw'
	create_dir(output_path)

	num_input_files = len(os.listdir(input_path))

	subprocess.call(['nsynth_save_embeddings', 
		'--checkpoint_path=%s/model.ckpt-200000' %(DIR_CHECKPOINT), 
		'--source_path=%s' %(input_path), 
		'--save_path=%s' %(output_path), 
		'--log=ERROR',
		'--batch_size=%s' %(BATCH_SIZE)])

	num_output_files = len(get_only_files(output_path))
	print('RESULT: compute embeddings')
	print('-------------------------')
	print('# input wav files: %s' %(num_input_files))
	print('# embeddings generated: %s' %(num_output_files))
	print(get_only_files(output_path))
	
	assert num_input_files==num_output_files, '[compute_embeddings]: different quanity of files generated'

def interpolate_embeddings():

	print('-------------------------------')
	print('START: interpolating embeddings')

	input_path = 'data/embeddings_raw'
	output_path = DIR_ARTIFACTS
	create_dir(output_path)

	#	constants and rearrangement of config vars for processing
	pitches = config['pitches']
	resolution = config['resolution']
	instrument_groups = [config['pads']['NW'], config['pads']['NE'], config['pads']['SE'], config['pads']['SW']]
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

	print('RESULT: interpolating embeddings')
	print('--------------------------------')
	print('# interpolated embeddings generated: %s' %(num_output_files))
	print(get_only_files(output_path))

if __name__ == '__main__':
	print('============================')
	print('JOB:%s:START' %(JOB_NAME))
	print('============================')
	
	init()
	compute_embeddings()
	interpolate_embeddings()

	print('===============================')
	print('JOB:%s:COMPLETE' %(JOB_NAME))
	print('===============================')