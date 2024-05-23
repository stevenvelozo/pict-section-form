const libPictApplication = require('pict-application');

const libPictSectionForm = require('../../source/Pict-Section-Form.js');

const libProviderDynamicSection = require('./providers/PictProvider-Dynamic-Sections.js');

class PostcardApplication extends libPictApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.pict.addProvider('Postcard-DynamicSection-Provider', libProviderDynamicSection.default_configuration, libProviderDynamicSection);

		this.pict.addView('Postcard-Navigation', require('./views/PictView-Postcard-Navigation.json'));

		// Add the pict form service
		this.pict.addServiceType('PictSectionForm', libPictSectionForm);

		// Add the pict form metacontroller service, which provides programmaatic view construction from manifests and render/marshal methods.
		this.pict.addView('PictFormMetacontroller', {}, libPictSectionForm.PictFormMetacontroller);
	}
};

module.exports = PostcardApplication

module.exports.default_configuration = require('./Pict-Application-Postcard-Configuration.json');