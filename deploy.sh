#!/bin/bash

echo '~~~~~~~~~~~~~~~~~~~~~~~~~~~'
echo '~= Sound Gen Web: Deploy =~'
echo '~~~~~~~~~~~~~~~~~~~~~~~~~~~'

echo ''
echo 'deploying...'
echo '------------'
git push heroku master

echo '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
echo '~= Sound Gen Web: Deployed =~'
echo '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
echo 'https://sound-gen-prod.herokuapp.com/'