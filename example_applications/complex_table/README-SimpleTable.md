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
