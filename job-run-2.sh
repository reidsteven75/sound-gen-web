#!/bin/bash

cd app
ENV='dev' pipenv run python generate2.py
cd ..