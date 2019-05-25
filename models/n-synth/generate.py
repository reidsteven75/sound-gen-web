import os
import sys
import subprocess
import requests
import json
import shutil
import time
import paperspace
import urllib.request
import tabulate
from pydub import AudioSegment
from utils_common import *
from utils_workflow import *

COMPUTE_ENVIRONMENT = os.environ['COMPUTE_ENVIRONMENT']
CONFIG_WORKFLOW = os.environ['CONFIG_WORKFLOW']
CONFIG_WORKFLOW_FILE = 'config-workflow-%s.json' %(CONFIG_WORKFLOW)
with open(CONFIG_WORKFLOW_FILE, 'r') as infile:
  config_workflow = json.load(infile)

if CONFIG_WORKFLOW == 'test':
  CONFIG_SOUND_FILE = 'config-sound-test.json'
  GOOGLE_STORAGE_UPLOAD_PATH = os.environ['GOOGLE_STORAGE_UPLOAD_PATH_TEST']
else:
  CONFIG_SOUND_FILE = 'config-sound.json'
  GOOGLE_STORAGE_UPLOAD_PATH = os.environ['GOOGLE_STORAGE_UPLOAD_PATH_REAL']
with open(CONFIG_SOUND_FILE, 'r') as infile:
  config_sound = json.load(infile)

if os.environ['HTTPS'] == True:
  HTTP = 'https://'
else:
  HTTP = 'http://'

API = HTTP + os.environ['HOST_ALIAS'] + ':' + os.environ['SERVER_PORT'] + '/api'

UTILS_COMMON_FILE = 'utils_common.py'
UTILS_JOB_FILE = 'utils_job.py'
ARTIFACT_ID = unique_id()
ARTIFACTS = './artifacts/' + ARTIFACT_ID
ARTIFACT_UPLOAD_PATH = GOOGLE_STORAGE_UPLOAD_PATH
ARTIFACT_TYPES = ['.wav','.mp3']
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

def print_job_metrics(job_metrics):
  header = job_metrics[0].keys()
  rows =  [x.values() for x in job_metrics]
  print(tabulate.tabulate(rows, header, tablefmt='fancy_grid'))

def save_job_metrics(job, start, end, status):
  job_time = '{0:.2f}'.format(end - start)
  job_metrics.append({
    'job': job,
    'time':  job_time,
    'status': status
  })
  print('[%s]: %s' %(job, status))

def convert_wav_to_mp3(path, file):
  print('generating mp3...')
  file_name = get_filename(file)
  AudioSegment.from_wav(path + '/' + file).export(path + '/' + file_name + '.mp3', format='mp3')
  print('success')

def convert_artifacts(job):
  print('[convert_artifacts]: start')
  start = time.time()
  status = 'started'

  file_path = ARTIFACTS + '/' + job
  dir_status = check_dir(file_path)
  if 'err' in dir_status.keys():
    print(dir_status)
    status = 'error'
  else:
    for file in os.listdir(file_path):
      if '.wav' in file:
        print('file: %s' %(file))
        convert_wav_to_mp3(file_path, file)

  # job metrics
  if (status != 'error'):
    status = 'success'
  end = time.time()
  save_job_metrics('convert_wav_to_mp3', start, end, status)

def run_artifact_upload(job, file, sound_space_id):
  print('parsing...')
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
  file_type = get_filetype(file)
  parse_success = True
  for key in latent_space:
    if latent_space[key] == None:
      parse_success = False
  if parse_success == False:
    print('error')
    print('parse result: %s' %(latent_space))
  else:
    print('success')
    record = {
      'soundSpace': sound_space_id,
      'uploadPath': ARTIFACT_UPLOAD_PATH + '/' + sound_space_id,
      'filePath': ARTIFACTS + '/' + job,
      'file': file,
      'type': file_type,
      'latentSpace': latent_space
    }
    print('uploading...')
    res = requests.post(API + '/files', json=record)
    return(res.json())

def upload_artifacts(job):

  print('[upload_artifacts]: start')

  start = time.time()
  status = 'started'

  file_path = ARTIFACTS + '/' + job
  record = {
    'name': config_sound['name'],
    'user': config_sound['user'],
    'dimensions': 4,
    'resolution': config_sound['resolution'],
    'labels': {
      'NW': config_sound['labels']['NW'][0],
      'NE': config_sound['labels']['NE'][0],
      'SW': config_sound['labels']['SW'][0],
      'SE': config_sound['labels']['SE'][0]
    }
  }
  res = requests.post(API + '/sound-spaces', json=record)
  res_data = res.json()
  if 'err' in res_data:
    print('error creating sound-space with API')
    status = 'error'
  else:
    sound_space_id = res_data['_id']
    print('sound-space created with ID: %s' %(sound_space_id))
    num_errors = 0

    dir_status = check_dir(file_path)
    if 'err' in dir_status.keys():
      print(dir_status)
      status = 'error'
    else:
      for file in os.listdir(file_path):
        if any(x in file for x in ARTIFACT_TYPES):
          print('file: %s' %(file))
          res = run_artifact_upload(job, file, sound_space_id)
          if 'err' in res:
            print('error')
            num_errors += 1
          else:
            print('success')
    
    global sound_space
    sound_space = sound_space_id

    if num_errors != 0:
      status = 'error'

  # job metrics
  if (status != 'error'):
    status = 'success'
  end = time.time()
  save_job_metrics('upload_artifacts', start, end, status)

def run_job(job, dataset):
  job_path = DIR_JOBS + '/' + job
  job_data = job_path + '/data'
  job_artifacts = job_path + '/artifacts'
  job_config_workflow = config_workflow['jobs'][job]

  concurrent_jobs = job_config_workflow['concurrent_jobs']

  # inject config_workflow, config_sound & utils
  inject_config_job(CONFIG_WORKFLOW_FILE, job_path)
  inject_config_sound(CONFIG_SOUND_FILE, job_path)
  inject_file(UTILS_COMMON_FILE, job_path)
  inject_file(UTILS_JOB_FILE, job_path)

  # job artifacts are gathered into overall workflow artifacts after
  workflow_artifacts = ARTIFACTS + '/' + job
  create_dir(workflow_artifacts)

  # batch dataset for concurrent jobs
  dataset_batch_dir = prepare_batch(DIR_BATCHES, dataset, concurrent_jobs)

  for i in range(concurrent_jobs):

    start = time.time()
    status = 'started'

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
        status = 'error'
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
        status = 'error'
        return
    
    # job metrics
    if (status != 'error'):
      status = 'success'
        
    end = time.time()
    save_job_metrics(job + '_' + str(i), start, end, status)

def run_workflow():

  run_job(JOB_ENCODE_INTERPOLATE, DATASET)
  run_job(JOB_DECODE, ARTIFACTS + '/' + JOB_ENCODE_INTERPOLATE)
  convert_artifacts(JOB_DECODE)
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
  worflow_time = '{0:.2f}'.format(end - start)

  print('~~~~~~~~~~~~~~~')
  print('N-SYNTH: RESULT')
  print('~~~~~~~~~~~~~~~')
  print('ARTIFACT_ID: %s' %(ARTIFACT_ID))
  print('SOUND SPACE ID: %s' %(sound_space))
  print('ARTIFACT UPLOAD PATH: %s' %(ARTIFACT_UPLOAD_PATH))
  print('WORKFLOW TIME: ' + worflow_time)
  print('JOB METRICS: ')
  print_job_metrics(job_metrics)
  