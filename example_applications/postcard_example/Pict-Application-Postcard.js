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

		// The navigation is initialized, now render the dynamic views.
		// OH THE HORRAH!
		let tmpPictViewHashes = Object.keys(this.pict.views);
		for (let i = 0; i < tmpPictViewHashes.length; i++)
		{
			if (this.pict.views[tmpPictViewHashes[i]].isPictSectionForm)
			{
				this.pict.views[tmpPictViewHashes[i]].render();
			}
		}
		fCallBack();
	}
};

module.exports = PostcardApplication

module.exports.default_configuration = (
	{
		"Name": "A Simple Postcard Application",
		"MainViewportViewIdentifier": 'Postcard-Navigation'
	});

module.exports.pict_configuration = { Application: 'Postcard-Pict-Application' };