import os
import requests
import json
import shutil

from utils_common import *

API = 'http://0.0.0.0:4001/api'
ENDPOINT = '/files'
ARTIFACT_DIR_TO_UPLOAD = './artifacts/2019-05-19_17-23-26_D75B20/decode'

if __name__ == "__main__":
  for file in os.listdir(ARTIFACT_DIR_TO_UPLOAD):
    if '.wav' in file:

      data = {
        'soundSpace': '5ce21e7eeceadfbba5a75431',
        'uploadPath': 'test_sound_uploads/test_1',
        'filePath': ARTIFACT_DIR_TO_UPLOAD,
        'fileName': file,
        'latentSpace': [ 0.1 , 1.0 , 0.2 , 0.5 ]
      }

      print('uploading: %s' %(file))
      r = requests.post(API + ENDPOINT, data=data)
      # print(r.text)

    