const libPictSectionForm = require('../../../source/Pict-Section-Form.js');

class FruityGrid extends libPictSectionForm.PictFormApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.pict.addProvider('Gradebook-Data-Provider', {}, require('./providers/Gradebook-Data.js'));
	}

	onBeforeInitialize()
	{
		return super.onBeforeInitialize();
	}
}

module.exports = FruityGrid;

module.exports.default_configuration = libPictSectionForm.PictFormApplication.default_configuration;
module.exports.default_configuration.pict_configuration = (
	{
		"Product": "Grademaster",

		"DefaultFormManifest": require(`./manifests/Gradebook-Manifest.js`)
	});