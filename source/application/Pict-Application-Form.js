const libPictApplication = require('pict-application');

const libPictSectionForm = require('../Pict-Section-Form.js');

/**
 * Represents a PictSectionFormApplication.
 *
 * This is the automagic controller for a dyncamic form application.
 *
 * @class
 * @extends libPictApplication
 */
class PictSectionFormApplication extends libPictApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		/** @type {import('pict') & import('fable')} */
		this.pict;
		// Add the pict form service
		this.pict.addServiceType('PictSectionForm', libPictSectionForm);

		// Add the pict form metacontroller service, which provides programmaatic view construction from manifests and render/marshal methods.
		this.pict.addView('PictFormMetacontroller', {}, libPictSectionForm.PictFormMetacontroller);
	}

	/**
	 * Marshals data from any rendered dynamic views to application data.
	 */
	marshalDataFromDynamicViewsToAppData()
	{
		this.pict.views.PictFormMetacontroller.marshalFromView();
	}

	/**
	 * Marshals data from the application data to any rendered dynamic views.
	 */
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
