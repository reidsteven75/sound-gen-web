import os
import subprocess
import requests
import json
import shutil
import uuid 
import datetime

with open('config.json', 'r') as infile:
  config = json.load(infile)

def unique_id():
  return datetime.datetime.now().strftime('%Y-%m-%d_%H-%M-%S') + \
          '_' + \
          uuid.uuid4().hex[:6].upper()

ARTIFACT_ID = unique_id()
ARTIFACTS = './artifacts/' + ARTIFACT_ID

DIR_JOBS = './jobs'
JOB_ENCODE_INTERPOLATE = 'encode-interpolate'
JOB_DECODE = 'decode'

DIR_BATCHES = './batches'

FOLDER_DATASET_INTERPOLATIONS = '/interpolations'
FOLDER_DATASET_GENERATIONS = '/generations'
DATASET = './dataset'
STORAGE_COMMON = './storage'

COMPUTE_ENVIRONMENT = os.environ['COMPUTE_ENVIRONMENT']
PAPERSPACE_API_KEY = config['paperspace']['api_key']
PAPERSPACE_URL = config['paperspace']['url']

def delete_dir(path):
  if (os.path.exists(path)):
    shutil.rmtree(path)

def create_dir(path):
	os.makedirs(path, exist_ok=True)

def get_only_files(path):
	files = []
	for file in os.listdir(path):
		if os.path.isfile(os.path.join(path, file)):
			if not file.startswith('.'):
				files.append(file)
	return files

def copy_files(source, target):
  create_dir(target)
  files = os.listdir(source)
  for f in files:
    shutil.copy(source + '/' + f, target)

def prepare_batch(dataset, num_batches):
  create_dir(DIR_BATCHES)
  batch_dir = DIR_BATCHES + '/' + unique_id()
  batch_size = len(get_only_files(dataset)) / num_batches

  copy_files(dataset, batch_dir)

  # create batch folders
  for i in range(0, num_batches):
    batch_folder = batch_dir + '/batch%i' % i
    create_dir(batch_folder)

  #	move files into batch folders
  batch = 0
  files = get_only_files(batch_dir) 
  for filename in files:
    target_folder = batch_dir + '/batch%i' % batch
    batch += 1
    if batch >= num_batches:
      batch = 0
    shutil.move(batch_dir + '/' + filename, target_folder)
    # print('move-->')
    # print(get_only_files(target_folder))
    # print(get_only_files(batch_dir))

  return batch_dir

def run_job_local(job, dataset, concurrent_jobs):

  job_path = DIR_JOBS + '/' + job
  job_data = job_path + '/data'
  job_artifacts = job_path + '/artifacts'

  # job artifacts are gathered into overall workflow artifacts after
  workflow_artifacts = ARTIFACTS + '/' + job
  create_dir(workflow_artifacts)

  # batch dataset for concurrent jobs
  dataset_batch_dir = prepare_batch(dataset, concurrent_jobs)

  for i in range(concurrent_jobs):

    # init job data & artifacts
    delete_dir(job_data)
    delete_dir(job_artifacts)
    create_dir(job_data)
    create_dir(job_artifacts)

    # inject batched data into job
    copy_files(dataset_batch_dir + '/batch%i' % i, job_data + '/input')
    
    # ensure job has common storage files
    copy_files(STORAGE_COMMON, job_path + '/storage')

    # run job
    subprocess.call(['python', 'job.py'], cwd=job_path)

    # gather artifacts from job
    copy_files(job_artifacts, workflow_artifacts)

def local_generation():
  print('COMPUTE_ENV: local')
  print('------------------')

  concurrent_jobs = 1
  run_job_local(JOB_ENCODE_INTERPOLATE, DATASET, concurrent_jobs)

  concurrent_jobs = 4
  run_job_local(JOB_DECODE, ARTIFACTS + '/' + JOB_ENCODE_INTERPOLATE, concurrent_jobs)

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
  print('~~~~~~~~~~~~~~~')
  print('N-SYNTH: START')
  print('~~~~~~~~~~~~~~~')
  print('ARTIFACT_ID: %s' %(ARTIFACT_ID))

  create_dir(ARTIFACTS)

  if (COMPUTE_ENVIRONMENT == 'paperspace'):
    paperspace_generation()
  else: 
    local_generation()

  print('~~~~~~~~~~~~~~~')
  print('N-SYNTH: RESULT')
  print('~~~~~~~~~~~~~~~')
  print('ARTIFACT_ID: %s' %(ARTIFACT_ID))