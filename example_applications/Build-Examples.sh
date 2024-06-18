#!/bin/sh

# Building complex_table
pushd complex_table
npm run build
popd

# Building gradebook
pushd gradebook
npm run build
popd

# Building manifest_testbed
pushd manifest_testbed
npm run build
popd

# Building manyfest_editor
pushd manyfest_editor
npm run build
popd

# Building postcard_example
pushd postcard_example
npm run build
popd

# Building simple_form
pushd simple_form
npm run build
popd

# Building simple_table
pushd simple_table
npm run build
popd

# Building simple_table_from_object
pushd simple_table_from_object
npm run build
popd