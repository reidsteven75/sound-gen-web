#!/bin/bash

CLIENT_BUILD_DIR=client/build
SERVER_BUILD_DIR=server/build

NODE_ENV=production
HTTPS=true
HOST=sound-gen-files-prod

# set env from .env file
ENV_FILE=$1
source $ENV_FILE

echo '~~~~~~~~~~~~~~~~~~~~~~~'
echo '~= Sound Web: Build =~'
echo '~~~~~~~~~~~~~~~~~~~~~~~'
echo 'ENV: '$NODE_ENV

echo 'building client...'
echo '------------------'
cd client
env NODE_ENV=$NODE_ENV \
    HTTPS=$HTTPS \
    HOST=$HOST \
    SERVER_PORT=$SERVER_PORT \
    npm run build
cd ..

echo ''
echo 'moving files for build...'
echo '-------------------------'
rm -r $SERVER_BUILD_DIR 
mkdir -p $SERVER_BUILD_DIR
# client build
cp -r $CLIENT_BUILD_DIR $SERVER_BUILD_DIR/client
echo 'moved:' $CLIENT_BUILD_DIR '->' $SERVER_BUILD_DIR 
# production env files
cp $ENV_FILE $SERVER_BUILD_DIR/.env
echo 'moved:' $ENV_FILE '->' $SERVER_BUILD_DIR 

echo '~~~~~~~~~~~~~~~~~~~~~~'
echo '~= Sound Web: Built =~'
echo '~~~~~~~~~~~~~~~~~~~~~~'