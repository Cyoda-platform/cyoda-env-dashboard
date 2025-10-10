#!/bin/sh

ROOT_DIR=/app

# Replace env vars in JavaScript files
echo "Replacing env constants in JS"
for file in $ROOT_DIR/js/* $ROOT_DIR/index.html $ROOT_DIR/css/*
do
  echo "Processing $file ...";
  sed -i 's~VITE_APP_API_BASE_value~'$VITE_APP_API_BASE_value'~g' $file
  sed -i 's~VITE_APP_API_BASE_PROCESSING_value~'$VITE_APP_API_BASE_PROCESSING_value'~g' $file
  sed -i 's~VITE_PUBLIC_PATH_value~'$VITE_PUBLIC_PATH_value'~g' $file

done

echo "Starting Nginx"
nginx -g 'daemon off;'
