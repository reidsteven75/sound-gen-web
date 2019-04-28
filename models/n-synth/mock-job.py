# Replicates the environment of Paperspace jobs

import subprocess
import os

print("========")
print("MOCK JOB")
print("--------")

# Replicate mounted directories in paperspace

# Storage = AI model checkpoint(s)
src = os.getcwd() + '/storage'
dst = os.getcwd() + '/job/storage'
os.symlink(src, dst)

# Artifact = job output
src = os.getcwd() + '/artifacts'
dst = os.getcwd() + '/job/artifacts'
os.symlink(src, dst)

# Start job
subprocess.call(["python", "generate.py"], cwd="job")