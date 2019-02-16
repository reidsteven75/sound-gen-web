#!/bin/bash

paperspace jobs create \
    --machineType 'GPU+' \
    --container 'reidsteven75/sound-generation:latest'\
    --command "ENV='paperspace' python generate.py"\
    --workspace './app'