#!/bin/bash

cd app
ENV='dev' pipenv run python generate.py
cd ..