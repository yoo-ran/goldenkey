#!/bin/bash

# Define variables
HOSTINGER_USER="u909776080"               # Your Hostinger username
HOSTINGER_HOST="156.67.75.22"            # Hostinger Server IP
REMOTE_PATH="/home/u909776080/public_html" # Path to `public_html` on Hostinger
LOCAL_BUILD_PATH="./dist"                # Local build folder

echo "Building React app..."
npm run build

echo "Removing old files from Hostinger..."
ssh -p 65002 $HOSTINGER_USER@$HOSTINGER_HOST "rm -rf $REMOTE_PATH/*"

echo "Uploading new build files to Hostinger..."
scp -P 65002 -r $LOCAL_BUILD_PATH/* $HOSTINGER_USER@$HOSTINGER_HOST:$REMOTE_PATH

echo "Deployment complete!"
