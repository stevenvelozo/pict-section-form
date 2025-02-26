#!/bin/bash

# Execute Step-1 and Step-2 build files
node ./Step-1-GenerateJSON.js
node ./Step-2-InjectContent.js
node ./Step-3-BuildDistilling.js

# Navigate to the data folder
cd data

# Build the configuration
npm run copymath

# Build the app
npm run build

# Navigate back to the debug folder
cd ..