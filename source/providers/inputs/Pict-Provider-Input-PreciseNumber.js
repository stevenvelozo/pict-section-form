const libPictSectionInputExtension = require('../Pict-Provider-InputExtension.js');

/**
 * CustomInputHandler class.
 *
 * @class
 * @extends libPictSectionInputExtension
 * @memberof providers.inputs
 */
class CustomInputHandler extends libPictSectionInputExtension
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		/** @type {import('pict')} */
		this.pict;
		/** @type {import('pict') & { Math: any } & { DataFormat: any }} */
		this.fable;
		/** @type {any} */
		this.log;
	}

	roundValue(pInput, pValue)
	{
		let tmpValue = pValue;

		if ('DecimalPrecision' in pInput.PictForm)
		{
			let tmpRoundingMethod = this.fable.Math.roundHalfUp;
			if ('RoundingMethod' in pInput.PictForm)
			{
				try
				{
					tmpRoundingMethod = parseInt(pInput.PictForm.RoundingMethod);
				}
				catch(pError)
				{
					this.log.error(`Error parsing rounding method onDataMarshalToForm for input ${pInput.Hash}`, pError);
				}
			}
			tmpValue = this.fable.Math.roundPrecise(tmpValue, pInput.PictForm.DecimalPrecision, tmpRoundingMethod);
		}

		if (('AddCommas' in pInput.PictForm) && pInput.PictForm.AddCommas)
		{
			tmpValue = this.fable.DataFormat.formatterAddCommasToNumber(tmpValue);
		}

		if ('DigitsPrefix' in pInput.PictForm)
		{
			tmpValue = pInput.PictForm.DigitsPrefix + tmpValue;
		}
		if ('DigitsPostfix' in pInput.PictForm)
		{
			tmpValue = tmpValue + pInput.PictForm.DigitsPostfix;
		}

		return tmpValue;
	}

	/**
	 * Marshals data to the form for the given input.
	 *
	 * @param {Object} pView - The view object.
	 * @param {Object} pGroup - The group object.
	 * @param {Object} pRow - The row object.
	 * @param {Object} pInput - The input object.
	 * @param {any} pValue - The value to be marshaled.
	 * @param {string} pHTMLSelector - The HTML selector.
	 * @returns {boolean} - Returns true if the value is successfully marshaled to the form, otherwise false.
	 */
	onDataMarshalToForm(pView, pGroup, pRow, pInput, pValue, pHTMLSelector)
	{
		this.pict.ContentAssignment.assignContent(this.getInputHTMLID(pInput.Macro.RawHTMLID), this.roundValue(pInput, pValue));
		return super.onDataMarshalToForm(pView, pGroup, pRow, pInput, pValue, pHTMLSelector);
	}

	/**
	 * Marshals data to a form in tabular format.
	 *
	 * @param {Object} pView - The view object.
	 * @param {Object} pGroup - The group object.
	 * @param {Object} pInput - The input object.
	 * @param {any} pValue - The value parameter.
	 * @param {string} pHTMLSelector - The HTML selector parameter.
	 * @param {number} pRowIndex - The row index parameter.
	 * @returns {any} - The result of the data marshaling.
	 */
	onDataMarshalToFormTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex)
	{
		this.pict.ContentAssignment.assignContent('PRECISE-' + this.getTabularInputHTMLID(pInput.Macro.RawHTMLID, pRowIndex), pValue);
		this.pict.ContentAssignment.assignContent(this.getTabularInputHTMLID(pInput.Macro.RawHTMLID, pRowIndex), this.roundValue(pInput, pValue));
		return super.onDataMarshalToFormTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex);
	}
}

module.exports = CustomInputHandler;
