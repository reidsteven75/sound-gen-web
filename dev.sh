#!/bin/bash

cd app
ENV='dev' pipenv install
ENV='dev' pipenv run python generate.py
cd ..