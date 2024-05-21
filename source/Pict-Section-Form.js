const libPictViewClass = require('pict-view');

class PictSectionForm extends libPictViewClass
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, require('./Pict-Section-Form-DefaultConfiguration.json'), pOptions);

		super(pFable, tmpOptions, pServiceHash);

		this.initialRenderComplete = false;
	}
}

module.exports = PictSectionForm;

module.exports.default_configuration = require('./Pict-Section-Form-DefaultConfiguration.json');
