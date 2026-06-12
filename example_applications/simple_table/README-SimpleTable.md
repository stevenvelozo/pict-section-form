# Example Table Application

To run this, install dependencies in the root of the repository with a `npm install`
and then navigate to this folder and run `npm run build` to build the dist files
(which are not checked in).  Then, you should be able to open index.html in the dist
foder from your favorite browser.

This form exercises a configuration-only table.

Technically there is an extension to the base class, but that is just to load the
static data into `AppData` in a way that the table can render from.

```json
class FruityGrid extends libPictSectionForm.PictFormApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onBeforeInitialize()
	{
		this.log.trace(`Loading the fruitiest data ever!`);
		this.AppData.FruitData = require('./FruitData.json');
		this.log.trace(`... LOADED THE FRUIT!`);
		return super.onBeforeInitialize();
	}
}
```

> Data thanks to [https://www.fruityvice.com/]

## Column chooser

The `FruitGrid` group sets `"ColumnChooser": true`, which puts a **Columns**
button above the table. It opens a menu of checkboxes — one per column — to
hide and show columns. The hidden set is stored in the form data at
`FruitGrid_HiddenColumns` (an array of column hashes), so saving and reloading
the form data restores the user's column choices. Hiding a column never
touches the row data; showing it again brings the values back intact.
