import os
import requests
import json
import shutil

from utils_common import *
from google.cloud import storage

API = 'http://0.0.0.0:4001/api'
ENDPOINT = '/sounds'
ARTIFACT_DIR_TO_UPLOAD = './artifacts/2019-05-19_00-40-05_22893F/decode'

client = storage.Client(project='pragmatic-lead-234421')
bucket = client.get_bucket('sound-gen-dev')

if __name__ == "__main__":
  for file in os.listdir(ARTIFACT_DIR_TO_UPLOAD):

    blob = bucket.blob('test-sound-uploads/' + file)
    upload = blob.upload_from_filename(ARTIFACT_DIR_TO_UPLOAD + '/' + file)
    print(upload)

    # blob = Blob('test_sound_uploads/' + file, bucket)
    # with open(ARTIFACT_DIR_TO_UPLOAD + '/' + file, "rb") as artifact:
    #   blob.upload_from_file(artifact)

    # file_to_upload = {'file': open(, 'rb')}

    # print('uploading: %s' %(file))
    # r = requests.post(API + ENDPOINT, files=file_to_upload)
    # print(r.text)

    