import os
import shutil
import uuid 
import datetime

def unique_id():
  return datetime.datetime.now().strftime('%Y-%m-%d_%H-%M-%S') + \
          '_' + \
          uuid.uuid4().hex[:6].upper()

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

def list_all_files(directory, extensions=None):
  for root, dirnames, filenames in os.walk(directory):
    for filename in filenames:
      base, ext = os.path.splitext(filename)
      joined = os.path.join(root, filename)
      if extensions is None or ( len(ext) and ext.lower() in extensions ):
        yield joined

def copy_files(source, target):
  create_dir(target)
  files = os.listdir(source)
  for f in files:
    shutil.copy(source + '/' + f, target)