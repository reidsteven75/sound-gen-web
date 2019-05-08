import os
import sys
import subprocess
import requests
import json
import shutil
import uuid 
import datetime
import time
import zipfile
import paperspace

COMPUTE_ENVIRONMENT = os.environ['COMPUTE_ENVIRONMENT']
CONFIG_FILE = 'config-%s.json' %(COMPUTE_ENVIRONMENT)
with open(CONFIG_FILE, 'r') as infile:
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
DIR_ZIP = './zip'

FOLDER_DATASET_INTERPOLATIONS = '/interpolations'
FOLDER_DATASET_GENERATIONS = '/generations'
DATASET = './dataset'
STORAGE_COMMON = './storage'

if (COMPUTE_ENVIRONMENT == 'paperspace'):
  PAPERSPACE_API_KEY = config['paperspace']['api_key']
  PAPERSPACE_URL = config['paperspace']['url']

job_metrics = []

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

def inject_config(config_file, job_dir):
  shutil.copy(config_file, job_dir)
  os.rename(job_dir + '/' + config_file, job_dir + '/config.json')

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

  return batch_dir

def run_job_local(job, dataset):

  job_path = DIR_JOBS + '/' + job
  job_data = job_path + '/data'
  job_artifacts = job_path + '/artifacts'
  job_config = config['jobs'][job]

  concurrent_jobs = job_config['concurrent_jobs']

  # inject config
  inject_config(CONFIG_FILE, job_path)

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
    start = time.time()
    subprocess.call(['python', 'job.py'], cwd=job_path)
    end = time.time()
    job_time = str(end - start)
    print('JOB TIME: ' + job_time)
    job_metrics.append(job + '_' + str(i) + ' - execution time (s): ' + job_time)

    # gather artifacts from job
    copy_files(job_artifacts, workflow_artifacts)

def local_generation():
  print('COMPUTE_ENV: local')
  print('------------------')

  run_job_local(JOB_ENCODE_INTERPOLATE, DATASET)
  run_job_local(JOB_DECODE, ARTIFACTS + '/' + JOB_ENCODE_INTERPOLATE)

def get_paperspace_job_state(job_id):
  res = requests.get(
    PAPERSPACE_URL + '/jobs/getJob?jobId=%s' %(job_id),
    headers={'x-api-key': PAPERSPACE_API_KEY},
  )
  res_json = json.loads(res.text)
  job_state = res_json['state']
  return(job_state)

def zip_job(source, target):

  '''
  1) zips entire job directory in 'source' directory
  2) puts zipfile in 'target' directory
  3) returns path to zip file in 'target' directory
  '''

  create_dir(target)
  zip_name = unique_id() + '.zip'
  zip_path = target + '/' + zip_name
  file_paths = [] 
  for root, directories, files in os.walk(source): 
    for filename in files: 
      filepath = os.path.join(root, filename) 
      file_paths.append(filepath)

  with zipfile.ZipFile(zip_path, 'a') as file:
    for file_to_zip in file_paths:
      arcname = file_to_zip.replace(source, '')
      file.write(file_to_zip, arcname)
    file.close()

  return(zip_path)

def run_job_paperspace(job, dataset):
  job_path = DIR_JOBS + '/' + job
  job_data = job_path + '/data'
  job_artifacts = job_path + '/artifacts'
  job_config = config['jobs'][job]

  concurrent_jobs = job_config['concurrent_jobs']

  # inject config
  inject_config(CONFIG_FILE, job_path)

  # job artifacts are gathered into overall workflow artifacts after
  workflow_artifacts = ARTIFACTS + '/' + job
  create_dir(workflow_artifacts)

  # batch dataset for concurrent jobs
  dataset_batch_dir = prepare_batch(dataset, concurrent_jobs)

  for i in range(concurrent_jobs):

    # init job data
    delete_dir(job_data)
    create_dir(job_data)

    # inject batched data into job
    copy_files(dataset_batch_dir + '/batch%i' % i, job_data + '/input')

    # zip job directory
    print('zipping job...')
    job_zip_path = zip_job(job_path, DIR_ZIP)
    print('zipped like a fresh coat zipper')

    # run job
    start = time.time()
    job_id = None
    try:
      res = paperspace.jobs.create({
        'apiKey': PAPERSPACE_API_KEY,
        'name': job,
        'projectId': job_config['project_id'],
        'container': job_config['container'],
        'machineType': job_config['machine_type'],
        'command': job_config['command'],
        'workspace': job_zip_path
      })
      job_id = res['id']
    except:
      print('[ERROR]: jobs_create')
      print(sys.exc_info())
      return

    # get job artifacts
    try:
      paperspace.jobs.artifactsGet({
        'apiKey': PAPERSPACE_API_KEY,
        'jobId': job_id,
        'dest': workflow_artifacts
      })
    except:
      print('[ERROR]: artifacts_get')
      print(sys.exc_info()[0])
      return

    # job metrics
    end = time.time()
    job_time = str(end - start)
    print('JOB TIME: ' + job_time)
    job_metrics.append(job + '_' + str(i) + ' - execution time (s): ' + job_time)

def paperspace_generation():
  print('COMPUTE_ENV: paperspace')
  print('-----------------------')

  run_job_paperspace(JOB_ENCODE_INTERPOLATE, DATASET)
  run_job_paperspace(JOB_DECODE, ARTIFACTS + '/' + JOB_ENCODE_INTERPOLATE)
  # run_job_paperspace(JOB_DECODE, DATASET)

if __name__ == "__main__":
  print('~~~~~~~~~~~~~~~')
  print('N-SYNTH: START')
  print('~~~~~~~~~~~~~~~')
  print('ARTIFACT_ID: %s' %(ARTIFACT_ID))

  start = time.time()

  create_dir(ARTIFACTS)

  if (COMPUTE_ENVIRONMENT == 'paperspace'):
    paperspace_generation()
  else: 
    local_generation()

  end = time.time()
  worflow_time = str(end - start)

  print('~~~~~~~~~~~~~~~')
  print('N-SYNTH: RESULT')
  print('~~~~~~~~~~~~~~~')
  print('ARTIFACT_ID: %s' %(ARTIFACT_ID))
  print('JOB METRICS: ')
  print('\n'.join(job_metrics))
  print('WORKFLOW TIME: ' + worflow_time)