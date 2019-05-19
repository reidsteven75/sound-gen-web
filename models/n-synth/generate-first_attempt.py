import os
import sys
import subprocess
import requests
import json
import shutil
import time
import paperspace

from functools import partial
from multiprocessing.dummy import Pool as ThreadPool
from joblib import Parallel, delayed
from utils_common import *
from utils_workflow import *

CONFIG = os.environ['CONFIG']
CONFIG_FILE = 'config-%s.json' %(CONFIG)
with open(CONFIG_FILE, 'r') as infile:
  config = json.load(infile)

COMPUTE_ENVIRONMENT = os.environ['COMPUTE_ENVIRONMENT']

UTILS_COMMON_FILE = 'utils_common.py'
UTILS_JOB_FILE = 'utils_job.py'
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

def job_command(i, args):
  start = time.time()

  # init job data, artifacts, and storage
  delete_dir(args['job_data'])
  create_dir(args['job_data'])
  copy_files(args['dataset_batch_dir'] + '/batch%i' % i, args['job_data'] + '/input')

  if (COMPUTE_ENVIRONMENT == 'local'):
    # replicate paperspace environment
    delete_dir(args['job_artifacts'])
    create_dir(args['job_artifacts'])
    copy_files(STORAGE_COMMON, args['job_path'] + '/storage')
    # run job
    subprocess.call(['python', 'job.py'], cwd=args['job_path'])
    # get job artifacts
    copy_files(args['job_artifacts'], args['workflow_artifacts'])

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
        'projectId': args['job_config']['project_id'],
        'container': args['job_config']['container'],
        'machineType': args['job_config']['machine_type'],
        'command': args['job_config']['command'],
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
        'jobId': args['job_id'],
        'dest': args['workflow_artifacts']
      })
    except:
      print('[ERROR]: artifacts_get')
      print(sys.exc_info()[0])
      return
      
  # job metrics
  end = time.time()
  job_time = str(end - start)
  print('JOB TIME: ' + job_time)
  job_metrics.append(args['job'] + '_' + str(i) + ' - execution time (s): ' + job_time)
  

def run_job(job, dataset):
  job_path = DIR_JOBS + '/' + job
  job_data = job_path + '/data'
  job_artifacts = job_path + '/artifacts'
  job_config = config['jobs'][job]

  concurrent_jobs = job_config['concurrent_jobs']

  # inject config & utils
  inject_config(CONFIG_FILE, job_path)
  inject_file(UTILS_COMMON_FILE, job_path)
  inject_file(UTILS_JOB_FILE, job_path)

  # job artifacts are gathered into overall workflow artifacts after
  workflow_artifacts = ARTIFACTS + '/' + job
  create_dir(workflow_artifacts)

  # batch dataset for concurrent jobs
  dataset_batch_dir = prepare_batch(DIR_BATCHES, dataset, concurrent_jobs)

  # run jobs in parallel
  args = {
    'job': job,
    'job_path': job_path,
    'job_data': job_data,
    'job_artifacts': job_artifacts,
    'job_config': job_config,
    'job_path': job_path,
    'workflow_artifacts': workflow_artifacts,
    'dataset_batch_dir': dataset_batch_dir
  }
  # Parallel(verbose=100)(delayed(job_command)(i, args) for i in range(1))

  job_command_with_args = partial(job_command, args=args)
  pool = ThreadPool(concurrent_jobs)
  results = pool.map_async(job_command_with_args, range(concurrent_jobs))
  while not results.ready():
    time.sleep(1)
  pool.close()
  pool.join()

def run_workflow():

  run_job(JOB_ENCODE_INTERPOLATE, DATASET)
  run_job(JOB_DECODE, ARTIFACTS + '/' + JOB_ENCODE_INTERPOLATE)

if __name__ == "__main__":
  print('~~~~~~~~~~~~~~~')
  print('N-SYNTH: START')
  print('~~~~~~~~~~~~~~~')
  print('ARTIFACT_ID: %s' %(ARTIFACT_ID))
  print('COMPUTE_ENV: %s' %(COMPUTE_ENVIRONMENT))

  start = time.time()

  create_dir(ARTIFACTS)
  run_workflow()

  end = time.time()
  worflow_time = str(end - start)

  print('~~~~~~~~~~~~~~~')
  print('N-SYNTH: RESULT')
  print('~~~~~~~~~~~~~~~')
  print('ARTIFACT_ID: %s' %(ARTIFACT_ID))
  print('JOB METRICS: ')
  print('\n'.join(job_metrics))
  print('WORKFLOW TIME: ' + worflow_time)