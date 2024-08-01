# Manyfest Editor

Simple app for editing manifests, and, transliterating them between a flat
tabular format and the structured dimensional JSON.

## HTML View Configurations

Some of the simple views in this application (e.g. the Navigation view)
are just html templates.  They use the (currently experimental and in
development) quackage html packaging technology, and can be built by
navigating into the `views` folder and running the following command:

```shell
npx quack ajv ./basic-html/ -p "Manyfest-Basic"
```

This command takes all the `.html` files in that folder and puts them into
a plain javascript object with configurations for each.

There is a second file in this pattern:

`Manyfest-Basic-View-Template-Adjustments.js`

This is used to alter any of the defaults that are generated.  The most
common change to default is the destination address (as is done in this
example for the Navigation bar).
