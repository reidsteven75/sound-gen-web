import os
import sys
import subprocess
import requests
import json
import shutil
import time
import paperspace
import urllib.request
from utils_common import *
from utils_workflow import *

COMPUTE_ENVIRONMENT = os.environ['COMPUTE_ENVIRONMENT']
CONFIG_WORKFLOW = os.environ['CONFIG_WORKFLOW']
CONFIG_WORKFLOW_FILE = 'config-workflow-%s.json' %(CONFIG_WORKFLOW)
with open(CONFIG_WORKFLOW_FILE, 'r') as infile:
  config_workflow = json.load(infile)
CONFIG_SOUND_FILE = 'config-sound.json'
with open(CONFIG_SOUND_FILE, 'r') as infile:
  config_sound = json.load(infile)

if os.environ['HTTPS'] == True:
  HTTP = 'https://'
else:
  HTTP = 'http://'
API = HTTP + os.environ['HOST'] + ':' + os.environ['SERVER_PORT']

UTILS_COMMON_FILE = 'utils_common.py'
UTILS_JOB_FILE = 'utils_job.py'
ARTIFACT_ID = unique_id()
ARTIFACTS = './artifacts/' + ARTIFACT_ID
ARTIFACT_UPLOAD_PATH = 'test_sound_uploads/test_3'
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
  PAPERSPACE_API_KEY = config_workflow['paperspace']['api_key']
  PAPERSPACE_URL = config_workflow['paperspace']['url']

job_metrics = []
sound_space = None

def upload_artifacts(job):

  ARTIFACTS = './artifacts/2019-05-20_23-48-56_FAE9FE/decode'

  contents = urllib.request.urlopen(API + '/test').read()
  print(contents)

  return

  print('uploading artifacts...')
  record = {
    'name': config_sound['name'],
    'user': config_sound['user'],
    'dimensions': 4,
    'resolution': config_sound['resolution'],
    'labels': {
      'NW': config_sound['labels']['NW'],
      'NE': config_sound['labels']['NE'],
      'SW': config_sound['labels']['SW'],
      'SE': config_sound['labels']['SE']
    }
  }
  res = requests.post(API + '/sound-spaces', json=record)
  res_data = res.json()
  if 'err' in res_data:
    print('error creating sound-space with API')
  else:
    sound_space_id = res_data['_id']
    print('sound-space created with ID: %s' %(sound_space_id))
    num_errors = 0
    for file in os.listdir(ARTIFACTS):
      if '.wav' in file:
        latent_space = {
          'NW': None,
          'NE': None,
          'SW': None,
          'SE': None
        }
        latent_space['NW'] = parse_latent_space(file, 'NW')
        latent_space['NE'] = parse_latent_space(file, 'NE')
        latent_space['SW'] = parse_latent_space(file, 'SW')
        latent_space['SE'] = parse_latent_space(file, 'SE')
        parse_success = True
        for key in latent_space:
          if latent_space[key] == None:
            parse_success = False
        if parse_success == False:
          print('[ERROR]: parsing file: %s' %(file))
          print('parse result: %s' %(latent_space))
        else:
          record = {
            'soundSpace': sound_space_id,
            'uploadPath': ARTIFACT_UPLOAD_PATH + '/' + sound_space_id,
            'filePath': ARTIFACTS,
            'fileName': file,
            'latentSpace': latent_space
          }
          print('uploading: %s' %(file))
          res = requests.post(API + '/files', json=record)
          res_data = res.json()
          if 'err' in res_data:
            print('error')
            num_errors += 1
          else:
            print('success')
      
      if num_errors != 0:
        print('[ERROR]: artifact upload, there were errors uploading files')
      else:
        print('[SUCCESS]: artifact upload')
      
      global sound_space
      sound_space = sound_space_id

def run_job(job, dataset):
  job_path = DIR_JOBS + '/' + job
  job_data = job_path + '/data'
  job_artifacts = job_path + '/artifacts'
  job_config_workflow = config_workflow['jobs'][job]

  concurrent_jobs = job_config_workflow['concurrent_jobs']

  # inject config_workflow, config_sound & utils
  inject_config_job(CONFIG_WORKFLOW_FILE, job_path)
  inject_file(CONFIG_SOUND_FILE, job_path)
  inject_file(UTILS_COMMON_FILE, job_path)
  inject_file(UTILS_JOB_FILE, job_path)

  # job artifacts are gathered into overall workflow artifacts after
  workflow_artifacts = ARTIFACTS + '/' + job
  create_dir(workflow_artifacts)

  # batch dataset for concurrent jobs
  dataset_batch_dir = prepare_batch(DIR_BATCHES, dataset, concurrent_jobs)

  for i in range(concurrent_jobs):

    start = time.time()

    # init job data, artifacts, and storage
    delete_dir(job_data)
    create_dir(job_data)
    copy_files(dataset_batch_dir + '/batch%i' % i, job_data + '/input')

    if (COMPUTE_ENVIRONMENT == 'local'):
      # replicate paperspace environment
      delete_dir(job_artifacts)
      create_dir(job_artifacts)
      copy_files(STORAGE_COMMON, job_path + '/storage')
      # run job
      subprocess.call(['python', 'job.py'], cwd=job_path)
      # get job artifacts
      copy_files(job_artifacts, workflow_artifacts)

    if (COMPUTE_ENVIRONMENT == 'paperspace'):
      # zip job directory
      print('zipping job...')
      job_zip_path = zip_job(job_path, DIR_ZIP)
      print('zipped like a fresh coat zipper')
      # run job
      job_id = None
      try:
        res = paperspace.jobs.create({
          'apiKey': PAPERSPACE_API_KEY,
          'name': job,
          'projectId': job_config_workflow['project_id'],
          'container': job_config_workflow['container'],
          'machineType': job_config_workflow['machine_type'],
          'command': job_config_workflow['command'],
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

def run_workflow():

  # run_job(JOB_ENCODE_INTERPOLATE, DATASET)
  # run_job(JOB_DECODE, ARTIFACTS + '/' + JOB_ENCODE_INTERPOLATE)
  upload_artifacts(JOB_DECODE)

if __name__ == "__main__":
  print('~~~~~~~~~~~~~~~')
  print('N-SYNTH: START')
  print('~~~~~~~~~~~~~~~')
  print('ARTIFACT_ID: %s' %(ARTIFACT_ID))
  print('COMPUTE_ENV: %s' %(COMPUTE_ENVIRONMENT))
  print('API: %s' %(API))

  start = time.time()

  create_dir(ARTIFACTS)
  run_workflow()

  end = time.time()
  worflow_time = str(end - start)

  print('~~~~~~~~~~~~~~~')
  print('N-SYNTH: RESULT')
  print('~~~~~~~~~~~~~~~')
  print('ARTIFACT_ID: %s' %(ARTIFACT_ID))
  print('SOUND SPACE ID: %s' %(sound_space))
  print('JOB METRICS: ')
  print('\n'.join(job_metrics))
  print('WORKFLOW TIME: ' + worflow_time)