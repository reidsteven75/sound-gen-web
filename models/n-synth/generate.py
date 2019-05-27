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
from functools import partial
from pydub import AudioSegment
from utils_common import *
from utils_workflow import *
from joblib import Parallel, delayed
import asyncio
from multiprocessing import Process
import concurrent.futures
from multiprocessing.dummy import Pool as ThreadPool

COMPUTE_ENVIRONMENT = os.environ['COMPUTE_ENVIRONMENT']

CONFIG_WORKFLOW_FILE = 'config-workflow-%s.json' %(COMPUTE_ENVIRONMENT)
with open(CONFIG_WORKFLOW_FILE, 'r') as infile:
  config_workflow = json.load(infile)

TEST = os.environ['TEST']
print("TEST: " + TEST)
if TEST == 'standard':
  with open('config-workflow-test.json', 'r') as infile:
    config_override = json.load(infile)
    config_workflow['jobs']['encode-interpolate']['batch_size'] = config_override['jobs']['encode-interpolate']['batch_size']
    config_workflow['jobs']['encode-interpolate']['concurrent_jobs'] = config_override['jobs']['encode-interpolate']['concurrent_jobs']
    config_workflow['jobs']['decode']['gpus'] = config_override['jobs']['decode']['gpus']
    config_workflow['jobs']['decode']['batch_size'] = config_override['jobs']['decode']['batch_size']
    config_workflow['jobs']['decode']['sample_length'] = config_override['jobs']['decode']['sample_length']
    config_workflow['jobs']['decode']['concurrent_jobs'] = config_override['jobs']['decode']['concurrent_jobs']
       
  CONFIG_SOUND_FILE = 'config-sound-test.json'
  GOOGLE_STORAGE_UPLOAD_PATH = os.environ['GOOGLE_STORAGE_UPLOAD_PATH_TEST']
else:
  CONFIG_SOUND_FILE = 'config-sound.json'
  GOOGLE_STORAGE_UPLOAD_PATH = os.environ['GOOGLE_STORAGE_UPLOAD_PATH_REAL']
with open(CONFIG_SOUND_FILE, 'r') as infile:
  config_sound = json.load(infile)

print(config_workflow)

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

def generate_mp3(job):
  print('[generate_mp3]: start')
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
  save_job_metrics('generate_mp3', start, end, status)

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
  dir_status = check_dir(file_path)
  if 'err' in dir_status.keys():
    print(dir_status)
    status = 'error'
  else:
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

child_processes = []

def job_command(i, args):
  time.sleep(i)
  start = time.time()
  status = 'started'
  print('[%s_%s]: %s' %(args['job'], str(i), status))

  print('batch files')
  print(get_only_files(args['dataset_batch_dir'] + '/job%i' % i))

  # init job data and artifacts
  delete_dir(args['job_data'])
  create_dir(args['job_data'])
  copy_files(args['dataset_batch_dir'] + '/job%i' % i, args['job_data'] + '/job%i/' % i + 'input')

  if (COMPUTE_ENVIRONMENT == 'local'):
    # replicate paperspace environment
    delete_dir(args['job_artifacts'] + '/job%i' % i)
    create_dir(args['job_artifacts'] + '/job%i' % i)
    # run job
    p = subprocess.call(['python', 'job.py', '--job', str(i)], cwd=args['job_path'])
    # get job artifacts
    copy_files(args['job_artifacts'] + '/job%i' % i, args['workflow_artifacts'])

  if (COMPUTE_ENVIRONMENT == 'paperspace'):
    # zip job directory
    print('zipping job...')
    job_zip_path = zip_job(args['job_path'], DIR_ZIP)
    print('zipped like a fresh coat zipper')
    # run job
    job_id = None
    try:
      res = paperspace.jobs.create({
        'apiKey': PAPERSPACE_API_KEY,
        'name': args['job'],
        'projectId': args['job_config_workflow']['project_id'],
        'container': args['job_config_workflow']['container'],
        'machineType': args['job_config_workflow']['machine_type'],
        'command': 'python job.py --batch ' + str(i) ,
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
        'dest': args['workflow_artifacts']
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
  save_job_metrics(args['job'] + '_' + str(i), start, end, status)

def job_run(job, dataset):

  status = 'config'
  print('[%s]: %s' %(job, status))

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
  print('batches')
  batches = get_only_directories(dataset_batch_dir)
  print(batches)
  for batch in batches:
    print(batch)
    files = get_only_files(dataset_batch_dir + '/' + batch)
    print(files)

  # env specific
  if (COMPUTE_ENVIRONMENT == 'local'):
    copy_files(STORAGE_COMMON, job_path + '/storage')

  args = {
    'job': job,
    'job_path': job_path,
    'job_data': job_data,
    'job_artifacts': job_artifacts,
    'job_config_workflow': job_config_workflow,
    'job_path': job_path,
    'workflow_artifacts': workflow_artifacts,
    'dataset_batch_dir': dataset_batch_dir
  }

  # if job == JOB_ENCODE_INTERPOLATE:
  #   print('encode')
  #   runInParallel(
  #     job_command(0, args)
  #   )

  # if job == JOB_DECODE:
  #   print('decode')
  #   with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
  #     future_to_url = {executor.submit(job_command, i, args): i for i in range(4)}
  #     for future in concurrent.futures.as_completed(future_to_url):
  #       url = future_to_url[future]
  #       print(url)

  # run jobs async
  # loop = asyncio.get_event_loop()

  # if job == JOB_ENCODE_INTERPOLATE:
  #   print('encode')
  #   parallelFunc(1, args)

  # if job == JOB_DECODE:
  #   print('decode')
  #   loop.run_until_complete(parallelFunc(4, args))

  # loop.close()

  # run jobs in parallel
  job_command_with_args = partial(job_command, args=args)
  Parallel(n_jobs=int(concurrent_jobs), verbose=10)(delayed(job_command_with_args)(i) for i in range(int(concurrent_jobs)))

  # run jobs in series
  # for i in range(concurrent_jobs):
  #   job_command(i, args)

  # job_command_with_args = partial(job_command, args=args)
  # pool = ThreadPool(int(concurrent_jobs))
  # results = pool.map_async(job_command_with_args, range(int(concurrent_jobs)))
  # while not results.ready():
  #   time.sleep(1)
  # pool.close()
  # pool.join()

def run_workflow():

  job_run(JOB_ENCODE_INTERPOLATE, DATASET)
  job_run(JOB_DECODE, ARTIFACTS + '/' + JOB_ENCODE_INTERPOLATE)
  generate_mp3(JOB_DECODE)
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
  