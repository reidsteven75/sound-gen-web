# Dev
Run from root
```
docker-compose up --build
```

# Deployment 
Deployed as a job that runs in Paperspace which pulls down docker container uses an AI model checkpoint that has been upload as .zip file to Paperspace 'storage' (common persistant storage)

1) Deploy Docker
$ ./deploy-docker.sh

2) Deploy Checkpoint
Checkpoints are accessed through the Paperspace 'storage' directory, which can be accessed on Paperspace in the 'Notebooks' section under the container named 'COMMON STORAGE'. The 'storage' directory is common accross all jobs running on Paperspace.

3) Deploy Job
$ ./deploy-job.sh

# Paperspace
CLI/API
https://paperspace.github.io/paperspace-node/

GPU & CPU Types
https://support.paperspace.com/hc/en-us/articles/360007742114-Gradient-Instance-Types