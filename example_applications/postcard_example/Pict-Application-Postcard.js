const libPictApplication = require('pict-application');

const libProviderDynamicSection = require('./providers/PictProvider-Dynamic-Sections.js');

class PostcardApplication extends libPictApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.pict.addProvider('Postcard-DynamicSection-Provider', libProviderDynamicSection.default_configuration, libProviderDynamicSection);

		this.pict.addView('Postcard-Navigation', require('./views/PictView-Postcard-Navigation.json'));
	}

	onAfterInitializeAsync(fCallBack)
	{
		this.log.info('PostcardApplication.onAfterInitializeAsync()');

		// The navigation is initialized, now initialize the dynamic views.

		return fCallBack();
	}
};

module.exports = PostcardApplication

module.exports.default_configuration = (
	{
		"Name": "A Simple Postcard Application",
		"MainViewportViewIdentifier": 'Postcard-Navigation'
	});

module.exports.pict_configuration = { Application: 'Postcard-Pict-Application' };