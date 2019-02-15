#!/bin/bash

deploy_dir = job_to_deploy

rm -r deploy_dir
mkdir deploy_dir
rsync -av --exclude='storage' --exclude='.git' --exclude='working_dir' --exclude=deploy_dir --exclude='aif_bkp' /. /deploy_dir
cd deploy_dir
paperspace jobs create --machineType 'GPU+' --container 'reidsteven75/sound-generation:latest' --command "ENV='paperspace' python generate.py"
cd ../