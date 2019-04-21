#!/bin/bash

cd app
ENV='local' pipenv run python generate.py
cd ..