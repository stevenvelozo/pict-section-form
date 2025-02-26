#!/bin/sh

# Building complex_table
pushd complex_table
npm install && npm run build
popd

# Building complex_tuigrid
pushd complex_tuigrid
npm install && npm run build
popd

# Building gradebook
pushd gradebook
npm install && npm run build
popd

# Building manyfest_editor
pushd manyfest_editor
npm install && npm run build
popd

# Building postcard_example
pushd postcard_example
npm install && npm run build
popd

# Building simple_form
pushd simple_form
npm install && npm run build
popd

# Building simple_table
pushd simple_table
npm install && npm run build
popd
