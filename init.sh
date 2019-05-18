#!/bin/bash

echo '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
echo '~= Sound Web SDK: Initializing =~'
echo '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'

echo 'installing client modules...'
echo '----------------------------'
cd client
npm install

echo ''
echo 'installing server modules...'
echo '----------------------------'
cd ..
cd server
npm install

echo '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
echo '~= Sound Web SDK: Ready =~'
echo '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
