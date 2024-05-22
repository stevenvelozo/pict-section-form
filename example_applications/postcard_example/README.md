# Example Bookstore Web Application

To run this, install dependencies in the root of the repository with a `npm install`
and then navigate to this folder and run `npx quack build` to build the dist files
(which are not checked in).  Then, you should be able to open index.html locally in
a browser.

This requires the `retold-harness` docker image to be serving endpoints  for data to
fill out (it serves the data on `http://localhost:8086/` by default).  You change it,
you bought it!  :)