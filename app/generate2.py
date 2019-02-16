import json, os, subprocess
import time

env = os.environ['ENV']

#	preserve the working directory path
source_dir = os.getcwd()

#  load the config file
config = None
with open('config-new.json', 'r') as infile:
  config = json.load(infile)

def compute_embeddings():
	subprocess.call(["nsynth_save_embeddings", 
		"--checkpoint_path=%s/model.ckpt-200000" % config['checkpoint_dir'], 
		"--source_path=%s/audio_input" % source_dir, 
		"--save_path=%s/embeddings_input" % source_dir, 
		"--batch_size=64"])


if __name__ == "__main__":
	print "=================="
	print "ENV: " + env
	print "source_dir: " + source_dir
	print "=================="  
	time.sleep(1)

	print "Computing embeddings"
	print "==================" 
	compute_embeddings()