#!/bin/bash

ENV='dev' pipenv install
ENV='dev' pipenv run python generate.py