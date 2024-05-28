const libPictApplication = require('pict-application');

const libPictSectionForm = require('./Pict-Section-Form.js');

class PictSectionFormApplication extends libPictApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		// Add the pict form service
		this.pict.addServiceType('PictSectionForm', libPictSectionForm);

		// Add the pict form metacontroller service, which provides programmaatic view construction from manifests and render/marshal methods.
		this.pict.addView('PictFormMetacontroller', {}, libPictSectionForm.PictFormMetacontroller);
	}

	onAfterInitialize()
	{
		super.onAfterInitialize();
	}

	marshalDataFromDynamicViewsToAppData()
	{
		this.pict.views.PictFormMetacontroller.marshalFromView();
	}

	marshalDataFromAppDataToDynamicViews()
	{
		this.pict.views.PictFormMetacontroller.marshalToView();
	}
};

module.exports = PictSectionFormApplication

module.exports.default_configuration = (
{
	"Name": "A Simple Pict Forms Application",
	"Hash": "PictFormsApp",

	"MainViewportViewIdentifier": "PictFormMetacontroller",

	"pict_configuration":
		{
			"Product": "PictDefaultFormsApp"
		}
});