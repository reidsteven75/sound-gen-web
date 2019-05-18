#!/bin/bash

source .env.prod

echo '~~~~~~~~~~~~~~~~~~~~~~~'
echo '~= Sound Web: Deploy =~'
echo '~~~~~~~~~~~~~~~~~~~~~~~'

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
echo 'moving build...'
echo '---------------'
rm -r $SERVER_CLIENT_DIR 
cp -r $CLIENT_BUILD_DIR $SERVER_CLIENT_DIR
echo 'moved:' $CLIENT_BUILD_DIR '->' $SERVER_CLIENT_DIR 

# echo ''
# echo 'deploying...'
# echo '------------'
# cd server
# gcloud app deploy --project $GOOGLE_APP_PROJECT_ID

echo '~~~~~~~~~~~~~~~~~~~~~~~~~'
echo '~= Sound Web: Deployed =~'
echo '~~~~~~~~~~~~~~~~~~~~~~~~~'
echo 'http://'$GOOGLE_APP_PROJECT_ID'.appspot.com'