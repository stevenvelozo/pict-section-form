const libPictSectionForm = require('../../source/Pict-Section-Form.js');
//const libPictSectionForm = require('pict-section-form');
class ManifestTestbed extends libPictSectionForm.PictFormApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	deleteCurrentlyLoadedDynamicViews()
	{
		// TODO: Potentially fable could use a `RemoveLoadedServiceProvicer(pProviderHash)` or some such.
		// For now we are going to be really terrible about it.
		// As in we know this leaks views to the underlying fable services layer.
		// So if you do this a million times it will take actual megabytes of memory.
		// Megabytes.
		// Call the cops.
		let tmpViewList = Object.keys(this.pict.views);

		for (let i = 0; i < tmpViewList.length; i++)
		{
			// Delete *ALL* the dynamic sections.  Horrible.
			if (this.pict.views[tmpViewList[i]].isPictSectionForm)
			{
				delete this.pict.views[tmpViewList[i]];
			}
		}
	}

	loadManifestFromAppata()
	{
		// Delete the dynamic views that may currently be loaded.
		this.deleteCurrentlyLoadedDynamicViews();
		// Now load and bootstrap a NEW GENERATION OF VIEWS that's gonna gotta wear shades.
		this.pict.views.PictFormMetacontroller.bootstrapPictFormViewsFromManifest(this.AppData.Manyfest);
		// Generate the metatemplate (the container for each section) now that we've regenerated the views
		this.pict.views.PictFormMetacontroller.generateMetatemplate();
	}

	onAfterInitialize()
	{
		// TODO: Take this out after publishing pict
		if (!this.AppData.Manyfest)
		{
			this.AppData.Manyfest = this.fable.settings.Testbed_DefaultFormManifest;
		}
		this.loadManifestFromAppata();
		this.pict.views.PictFormMetacontroller.render();
		return super.onBeforeInitialize();
	}
}

module.exports = ManifestTestbed;

module.exports.default_configuration.pict_configuration = (
		{
			"Product": "Simple",
			"Testbed_DefaultFormManifest": require('../simple_form/Simple-Form_Default_Manifest.json')
		});