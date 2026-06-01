# Simple Table - A Tabular Layout from a Manifest

<!-- docuserve:example-launch:start -->
> **[Launch the live app](examples/simple%5Ftable/index.html)** - runs in your browser, opens in a new tab.
<!-- docuserve:example-launch:end -->


The Simple Table example is the smallest useful Pict Section Form application:
it renders an array of 49 fruit-nutrition records as an HTML table - and it
does so with **no view code at all**. The application file re-exports the
framework's stock form application unchanged and attaches a single manifest.
Everything you see is configuration.

It is the natural starting point for the [Gradebook](../gradebook/README.md)
case study: the same `Tabular` layout, stripped to its essentials.

## What it demonstrates

| Capability | Where you see it |
|------------|------------------|
| Class-free bootstrap | The app re-exports `PictFormApplication` and only attaches config |
| Seeded application data | `FruitData.json` is loaded as `DefaultAppData` |
| Section / group skeleton | One `Section` containing one `Group` |
| Tabular layout | `Layout: "Tabular"` turns an array into an HTML table |
| Reference manifests | `FruitEditor` defines the table's columns |
| Dot-notation data addresses | The Calories column reads `nutritions.calories` |
| Per-field types & defaults | Each column declares a `DataType` and optional `Default` |

## Key files

- `Simple-Tabular-Application.js` - the entire app: a manifest, zero view code
- `FruitData.json` - seed data (`DefaultAppData`)
- `html/index.html` - HTML shell + theme CSS

## The data model

`FruitData.json` holds a single object. The table reads the array at
`FruitData.FruityVice` - 49 records, each one a fruit:

```js
{
    "name": "Persimmon",
    "id": 52,
    "family": "Ebenaceae",
    "order": "Rosales",
    "genus": "Diospyros",
    "nutritions": { "calories": 81, "fat": 0, "sugar": 18, "carbohydrates": 18, "protein": 0 }
}
```

Note the flat fields (`name`, `family`, ...) alongside a **nested** `nutritions`
object - the table pulls columns from both levels.

---

## Feature 1 - A class-free bootstrap

Most example apps subclass `PictFormApplication`. Simple Table does not even do
that. The application file re-exports the stock class and attaches a
`pict_configuration` block to its `default_configuration`:

```js
module.exports = libPictSectionForm.PictFormApplication;
module.exports.default_configuration = libPictSectionForm.PictFormApplication.default_configuration;
module.exports.default_configuration.pict_configuration = {
    "Product": "SimpleTable",
    "DefaultAppData": require('./FruitData.json'),
    "DefaultFormManifest": { /* the manifest */ }
};
```

`DefaultAppData` seeds the application's data at load time, so the table is
populated the moment the page opens - no fetch, no `onBeforeInitialize` hook.
`DefaultFormManifest` is the form definition the rest of this page walks
through.

---

## Feature 2 - Sections and groups

Every Pict Section Form manifest is a tree: `Sections` contain `Groups`, and
each carries a `Hash` (its identity) and a `Name` (its label). Simple Table has
exactly one of each:

```js
"Sections": [
    {
        "Hash": "FruitGrid",
        "Name": "Fruits of the World",
        "Groups": [
            { "Hash": "FruitGrid", "Name": "FruitGrid", "Layout": "Tabular", /* ... */ }
        ]
    }
]
```

A group is the unit that actually renders inputs. Give it the default (stacked)
layout and it draws a column of form fields; give it `Tabular` and it draws a
table.

---

## Feature 3 - The Tabular layout group

Three properties turn a group into a table:

```js
{
    "Hash": "FruitGrid",
    "Name": "FruitGrid",
    "Layout": "Tabular",
    "RecordSetAddress": "FruitData.FruityVice",
    "RecordManifest": "FruitEditor"
}
```

- `Layout: "Tabular"` - render records as an HTML table rather than a stacked form
- `RecordSetAddress` - the address of the array to render, one row per element
- `RecordManifest` - the name of the reference manifest that defines the columns

---

## Feature 4 - Reference manifests define the columns

A `Tabular` group does not list its own columns. It points at a **reference
manifest** - a named, reusable sub-manifest under `ReferenceManifests`. The
group's `RecordManifest: "FruitEditor"` selects this one:

```js
"ReferenceManifests": {
    "FruitEditor": {
        "Scope": "FruitEditor",
        "Descriptors": {
            "name":   { "Name": "Fruit Name", "Hash": "Name", "DataType": "String", "Default": "(unnamed fruit)" },
            "family": { "Name": "Family", "Hash": "Family", "DataType": "String" },
            "nutritions.calories": { "Name": "Calories", "Hash": "Calories", "DataType": "Number" }
        }
    }
}
```

Each descriptor under the reference manifest becomes one column. Because the
manifest is *named and reusable*, the same column definition can drive several
grids - see [Gradebook](../gradebook/README.md), where one reference manifest
shape is reused across three tabs.

---

## Feature 5 - Dot-notation into nested record data

A descriptor key is an address into the record, and that address can be
**dotted**. The `Calories` column does not read a top-level field - it reaches
into each record's nested `nutritions` object:

```js
"nutritions.calories": {
    "Name": "Calories",
    "Hash": "Calories",
    "DataType": "Number"
}
```

This resolves to `FruitData.FruityVice[n].nutritions.calories` for every row. A
column can sit at any depth of the record; the descriptor key is the only thing
that changes.

---

## Feature 6 - Per-field types and defaults

Every descriptor declares a `DataType` (`String`, `Number`, `Array`, ...) and may
declare a `Default`. The type tells the framework how to render and coerce the
value; the default fills in for records that lack the field:

```js
"name": {
    "Name": "Fruit Name",
    "Hash": "Name",
    "DataType": "String",
    "Default": "(unnamed fruit)"
}
```

A fruit record with no `name` shows `(unnamed fruit)` rather than a blank cell.

## Running the example

```bash
cd example_applications/simple_table
npm run build
# serve ./dist and open index.html
```

## Takeaways

1. **A table is just a manifest.** One `Section`, one `Group`, and
   `Layout: "Tabular"` - 49 records become a grid with no view code.
2. **Data is seeded, not fetched.** `DefaultAppData` populates the form at load
   time, so the example runs entirely offline.
3. **Columns live in a reference manifest.** `RecordManifest` points the grid
   at a named, reusable column definition under `ReferenceManifests`.
4. **Addresses can be dotted.** A descriptor key like `nutritions.calories`
   pulls a column straight out of nested record data.
5. **Start here, then scale up.** The [Gradebook](../gradebook/README.md)
   example takes this same `Tabular` layout and adds dynamic columns, row
   labels, selection, and sorting.

## Related documentation

- [Layouts](../../Layouts.md) - the `Tabular` layout and its properties
- [Configuration](../../Configuration.md) - manifest, section, and group reference
- [Input Types](../../Input_Types.md) - descriptor `DataType` and input options
