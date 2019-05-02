import os
import subprocess
import requests
import json
import shutil
import uuid 

with open('config.json', 'r') as infile:
  config = json.load(infile)

DIR_DATASET_INPUT = './dataset'
DIR_ARTIFACTS = './artifacts'
DIR_DATASET_INTERPOLATIONS = './artifacts/interpolations'
DIR_DATASET_GENERATIONS = './artifacts/generations'
DIR_JOB_ENCODE_INTERPOLATE = './jobs/encode-interpolate'
DIR_JOB_DECODE = './jobs/decode'

COMPUTE_ENVIRONMENT = os.environ['COMPUTE_ENVIRONMENT']
PAPERSPACE_API_KEY = config['paperspace']['api_key']
PAPERSPACE_URL = config['paperspace']['url']

def create_dir(path):
	os.makedirs(path, exist_ok=True)

def inject_dataset(source, target):
  create_dir(target)
  files = os.listdir(source)
  for f in files:
    shutil.move(source + '/' + f, target)

def local_generation():
  print('COMPUTE_ENV: local')
  print('------------------')
  create_dir(DIR_JOB_ENCODE_INTERPOLATE + '/data')
  inject_dataset(DIR_DATASET_INPUT, DIR_JOB_ENCODE_INTERPOLATE + '/data/input')
  subprocess.call(['python', 'job.py'], cwd=DIR_JOB_ENCODE_INTERPOLATE)

  create_dir(DIR_JOB_DECODE + '/data')
  inject_dataset(DIR_DATASET_INTERPOLATIONS, DIR_JOB_DECODE + '/data/input')
  subprocess.call(['python', 'job.py'], cwd=DIR_JOB_DECODE)

def paperspace_generation():
  print('COMPUTE_ENV: paperspace')
  print('-----------------------')
  response = requests.post(
		PAPERSPACE_URL,
		params={
			'machineType': 'GPU+',
			'container': 'reidsteven75/sound-gen-n-synth:latest',
			'command': 'python generate.py',
			'workspace': './job'
		},
		headers={'x-api-key': PAPERSPACE_API_KEY}
	)

if __name__ == "__main__":
  print('~~~~~~~')
  print('N-SYNTH')
  print('~~~~~~~')

  os.environ['ARTIFACT_ID'] = uuid.uuid4().hex[:6].upper()
  create_dir(DIR_ARTIFACTS + '/' + os.environ['CURRENT_ARTIFACT_ID'])
  create_dir(DIR_ARTIFACTS + '/' + os.environ['CURRENT_ARTIFACT_ID'] + '/' + DIR_DATASET_INTERPOLATIONS)

  if (COMPUTE_ENVIRONMENT == 'paperspace'):
    paperspace_generation()
  else: 
    local_generation()