import os
import json
import requests
import re
import uuid 
import datetime

JOB_NAME = 'BULK-SOUND-UPLOAD'
CONFIG_FILE = 'config.json'
with open(CONFIG_FILE, 'r') as infile:
  config = json.load(infile)

API = config['dev']['api']['http'] + config['dev']['api']['host'] + ':' + config['dev']['api']['port'] + '/api'
GOOGLE_STORAGE_UPLOAD_PATH = config['dev']['googleStorage']['uploadPath']
FILE_PATH = './sounds'

def unique_id():
  return datetime.datetime.now().strftime('%Y-%m-%d_%H-%M-%S') + \
          '_' + \
          uuid.uuid4().hex[:6].upper()

def parse_latent_space(string, vector):
  match = re.search(vector + r'_(...)', string)
  if match:
    return float(match.group(1))
  else:
    return None

def get_filetype(file):
  return os.path.splitext(file)[1].replace('.', '')

def upload_sound(file, sound_space_id):
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
    uuid = unique_id()
    record = {
      'soundSpace': sound_space_id,
      'uploadPath': GOOGLE_STORAGE_UPLOAD_PATH + '/' + sound_space_id,
      'filePath': FILE_PATH,
      'file': file,
      'type': file_type,
      'latentSpace': latent_space
    }
    print('uploading...')
    res = requests.post(API + '/files', json=record)
    return(res.json())

def bulk_upload():
	record = {
		'name': config['name'],
		'user': config['user'],
		'dimensions': 4,
		'resolution': config['resolution'],
		'labels': {
			'NW': config['labels']['NW'][0],
			'NE': config['labels']['NE'][0],
			'SW': config['labels']['SW'][0],
			'SE': config['labels']['SE'][0]
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
		for file in os.listdir(FILE_PATH):
			print('file: %s' %(file))
			res = upload_sound(file, sound_space_id)
			if 'err' in res:
				print('error')
				num_errors += 1
			else:
				print('success')

def init():
	print('init')

if __name__ == '__main__':
	print('============================')
	print('JOB:%s:START' %(JOB_NAME))
	print('============================')
	
	init()
	bulk_upload()

	print('===============================')
	print('JOB:%s:COMPLETE' %(JOB_NAME))
	print('===============================')