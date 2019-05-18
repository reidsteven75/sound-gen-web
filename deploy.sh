#!/bin/bash

# set env from .env file
ENV_FILE=.env.prod
source $ENV_FILE

echo '~~~~~~~~~~~~~~~~~~~~~~~'
echo '~= Sound Web: Deploy =~'
echo '~~~~~~~~~~~~~~~~~~~~~~~'

echo ''
echo 'deploying...'
echo '------------'
cd server
gcloud app deploy --quiet --project $GOOGLE_APP_PROJECT_ID

echo '~~~~~~~~~~~~~~~~~~~~~~~~~'
echo '~= Sound Web: Deployed =~'
echo '~~~~~~~~~~~~~~~~~~~~~~~~~'
echo 'http://'$GOOGLE_APP_PROJECT_ID'.appspot.com'