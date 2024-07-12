const libPictFormSection = require('../../../source/Pict-Section-Form.js');

class CustomInputHandler extends libPictFormSection.PictInputExtensionProvider
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onEvent(pView, pInput, pValue, pHTMLSelector, pEvent)
	{
		console.log(`Alert alert event happened for ${pInput}: ${pEvent}`);
		return super.onEvent(pView, pInput, pValue, pHTMLSelector, pEvent);
	}

	onEventTabular(pView, pInput, pValue, pHTMLSelector, pRowIndex, pEvent)
	{
		console.log(`Alert alert event happened for ${pInput} row ${pRowIndex}: ${pEvent}`);
		return super.onEventTabular(pView, pInput, pValue, pHTMLSelector, pRowIndex, pEvent);
	}
}

module.exports = CustomInputHandler;