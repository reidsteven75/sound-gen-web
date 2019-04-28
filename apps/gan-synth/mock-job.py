# Replicates the environment of Paperspace jobs

import subprocess
import os

print("========")
print("MOCK JOB")
print("--------")
src = os.getcwd() + '/storage'
dst = os.getcwd() + '/job/storage'
os.symlink(src, dst)

src = os.getcwd() + '/artifacts'
dst = os.getcwd() + '/job/artifacts'
os.symlink(src, dst)

subprocess.call(["python", "generate.py"], cwd="job")