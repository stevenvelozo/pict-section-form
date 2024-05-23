# For Pict-Applications

If you want to initialize this manually, rather than use the default objects
that the metacontroller provides you can do this:

```js
	onAfterInitializeAsync(fCallBack)
	{
		// The metacontroller does this on after initialize already.
		// These next two lines are synonymous, since our provider loads the manifests into the DefaultFormManifest settings location
		//this.pict.PictFormMetacontroller.bootstrapPictFormViewsFromManifest();
		//this.PictFormMetacontroller.bootstrapFormManifests(this.pict.settings.DefaultFormManifest);

		// The metacontroller does this as well on after initialize
		//this.pict.PictFormMetacontroller.renderAllFormSections();

		return super.onAfterInitializeAsync(fCallBack);
	}
```