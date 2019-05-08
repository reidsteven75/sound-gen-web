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
