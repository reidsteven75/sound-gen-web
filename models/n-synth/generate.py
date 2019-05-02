import os
import subprocess
import requests
import json
import shutil
import uuid 
import datetime

with open('config.json', 'r') as infile:
  config = json.load(infile)

ARTIFACT_ID = datetime.datetime.now().strftime('%Y-%m-%d_%H-%M-%S') + '_' + uuid.uuid4().hex[:6].upper()
ARTIFACTS = './artifacts/' + ARTIFACT_ID

DIR_JOBS = './jobs'
JOB_ENCODE_INTERPOLATE = 'encode-interpolate'
JOB_DECODE = 'decode'

FOLDER_DATASET_INTERPOLATIONS = '/interpolations'
FOLDER_DATASET_GENERATIONS = '/generations'
DATASET = './dataset'
STORAGE_COMMON = './storage'

COMPUTE_ENVIRONMENT = os.environ['COMPUTE_ENVIRONMENT']
PAPERSPACE_API_KEY = config['paperspace']['api_key']
PAPERSPACE_URL = config['paperspace']['url']

def create_dir(path):
	os.makedirs(path, exist_ok=True)

def copy_files(source, target):
  create_dir(target)
  files = os.listdir(source)
  for f in files:
    shutil.copy(source + '/' + f, target)

def run_job_local(job, dataset):
  path_job = DIR_JOBS + '/' + job
  create_dir(ARTIFACTS + '/' + job)
  create_dir(path_job + '/data')
  create_dir(path_job + '/artifacts')
  copy_files(dataset, path_job + '/data/input')
  copy_files(STORAGE_COMMON, path_job + '/storage')
  subprocess.call(['python', 'job.py'], cwd=path_job)
  copy_files(path_job + '/artifacts', ARTIFACTS + '/' + job)

def local_generation():
  print('COMPUTE_ENV: local')
  print('------------------')
  run_job_local(JOB_ENCODE_INTERPOLATE, DATASET)
  run_job_local(JOB_DECODE, ARTIFACTS + '/' + JOB_ENCODE_INTERPOLATE)

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
  print('ARTIFACT_ID: %s' %(ARTIFACT_ID))

  create_dir(ARTIFACTS)

  if (COMPUTE_ENVIRONMENT == 'paperspace'):
    paperspace_generation()
  else: 
    local_generation()