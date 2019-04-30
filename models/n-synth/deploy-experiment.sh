#!/bin/bash

paperspace-python experiments createAndStart multinode \
    --machineType 'GPU+' \
    --container 'reidsteven75/sound-gen-n-synth:latest'\
    --command "ENV='paperspace' python generate.py"\
    --workspace './job'