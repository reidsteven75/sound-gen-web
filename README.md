Init
----------------
```
$ ./init.sh
```
- install Google Cloud SDK: https://cloud.google.com/sdk/docs/downloads-interactive#mac

Dev
----------------

all
```
$ docker-compose up --build
```

client
```
$ docker-compose up --build client
```

server
```
$ docker-compose up --build server
```

Build
-----
dev
```
$ ./build.sh .env
```

prod
```
$ ./build.sh .env.prod
```

Deploy
------
```
$ ./deploy.sh
```
- uses 'server/app.yml' for Google Apps Engine config
- uses 'server/Dockerfile' for Google Apps Engine container

Node Modules
------------
- install & uninstalls should be done locally
- when changing node_modules run the following command:
```
$ docker-compose down
```

Environment Variables
---------------------
- set in root .env files
- changing environment variable names requires updates to:
  - deploy.sh
  - client/webpack.*.js files
  - client/App.js
  - server/server.js

DB Service
----------
https://cloud.mongodb.com

Google Storage
--------------
Cloud Cors
```
$ gsutil cors set google-storage-cors.json gs://augmented-music-generation-dev
$ gsutil cors get gs://augmented-music-generation-dev
```

# Dev
n-synth
```
docker-compose -f docker-compose-n-synth.yml up --build
```

cleanup docker 
```
docker volume prune
docker image prune
```

25f8821c308a51e267d6765e88ce28

# Deployment 
Deployed as a job that runs in Paperspace. Job runs in a configurable docker container and uses configurable AI model checkpoint(s) that has been upload as .zip file to Paperspace 'storage' (common persistant storage)

1) Deploy Docker
$ ./deploy-docker.sh

2) Deploy Checkpoint
Checkpoints are accessed through the Paperspace 'storage' directory, which can be accessed on Paperspace in the 'Notebooks' section under the container named 'COMMON STORAGE'. The 'storage' directory is common accross all jobs running on Paperspace.

3) Deploy Job
$ ./deploy-job.sh

# Paperspace
CLI/API
https://paperspace.github.io/paperspace-node/
https://docs.paperspace.com/gradient/experiments/run-experiments

GPU & CPU Types
https://support.paperspace.com/hc/en-us/articles/360007742114-Gradient-Instance-Types

GPU Kubernetes
https://github.com/Paperspace/GPU-Kubernetes-Guide

dev private network:
10.30.141.0/24

master: 
10.30.141.4
kubeadm join --token 245126.c4204c198296da2f 10.30.141.4:6443

worker: 
10.30.141.2

kubectl get nodes



