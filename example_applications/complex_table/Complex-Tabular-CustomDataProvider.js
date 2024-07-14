const libPictSectionInputExtension = require('../../source/Pict-Section-Form.js').PictInputExtensionProvider;

class CustomInputHandler extends libPictSectionInputExtension
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onInputInitialize(pView, pGroup, pRow, pInput, pValue, pHTMLSelector)
	{
		this.log.trace(`CustomInputHandler.onInputInitializeTabular() for view [${pView.Hash}] called`);
		//this.log.trace(`The input object is: ${JSON.stringify(pInput)}`);
		return super.onInputInitialize(pView, pGroup, pInput, pValue, pHTMLSelector);
	}

	onInputInitializeTabular(pView, pGroup, pInput, pValue, pHTMLSelector)
	{
		this.log.trace(`CustomInputHandler.onInputInitializeTabular() for view [${pView.Hash}] called`);
		//this.log.trace(`The input object is: ${JSON.stringify(pInput)}`);
		return super.onInputInitializeTabular(pView, pGroup, pInput, pValue, pHTMLSelector);
	}
}

module.exports = CustomInputHandler;