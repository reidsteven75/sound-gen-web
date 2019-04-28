#!/bin/bash

paperspace jobs create \
    --machineType 'GPU+' \
    --container 'reidsteven75/sound-gen-gan-synth:latest'\
    --command "ENV='paperspace' python generate.py"\
    --workspace './job'