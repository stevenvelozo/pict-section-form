const libPictSectionInputExtension = require('../Pict-Provider-InputExtension.js');

const libMarked = require('marked');

/**
 * CustomInputHandler class.
 *
 * @class
 * @extends libPictSectionInputExtension
 * @memberof providers.inputs
 */
class CustomInputHandler extends libPictSectionInputExtension
{
	/**
	 * @param {import('fable')} pFable - The Fable instance.
	 * @param {Record<string, any>} [pOptions] - The options for the provider.
	 * @param {string} [pServiceHash] - The service hash for the provider.
	 */
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		/** @type {import('pict')} */
		this.pict;
		/** @type {import('pict') & { newAnticipate: () => any }} */
		this.fable;
		/** @type {any} */
		this.log;
	}

	/**
	 * Generates the HTML ID for a content display input element.
	 *
	 * @param {string} pInputHTMLID - The HTML ID of the input element.
	 * @returns {string} - The generated HTML ID for the content display input element.
	 */
	getContentDisplayHTMLID(pInputHTMLID)
	{
		return `#DISPLAY-FOR-${pInputHTMLID}`;
	}

	/**
	 * Generates a tabular content display input ID based on the provided input HTML ID and row index.
	 *
	 * @param {string} pInputHTMLID - The input HTML ID.
	 * @param {number} pRowIndex - The row index.
	 * @returns {string} - The generated tabular content display input ID.
	 */
	getTabularContentDisplayInputID(pInputHTMLID, pRowIndex)
	{
		return `#${pInputHTMLID}-${pRowIndex}`;
	}

	/**
	 * 
	 * @param {String} pDisplayID 
	 * @param {Object} pInput - The PictForm Input Object
	 * @param {any} pValue 
	 */
	assignDisplayEntityData(pDisplayID, pInput, pValue)
	{
		// 0. Manage state
		let tmpDisplayTemplate = (typeof(pInput.PictForm.TemplatedEntityLookup.Template) === "string") ? pInput.PictForm.TemplatedEntityLookup.Template : "";
		let tmpDisplayContent = '';

		if (typeof(pInput) != "object")
		{
			this.log.error("Error in assignDisplayEntityData: pInput is not an object");
			return;
		}
		if (!(`PictForm` in pInput))
		{
			this.log.error("Error in assignDisplayEntityData: pInput.PictForm is not an object");
			return;
		}
		if (!(`TemplatedEntityLookup` in pInput.PictForm))
		{
			this.log.error("Error in assignDisplayEntityData: pInput.PictForm.TemplatedEntityLookup is not in the PictForm object");
			return;
		}
		if (!Array.isArray(pInput.PictForm.TemplatedEntityLookup.EntitiesBundle))
		{
			this.log.error("Error in assignDisplayEntityData: pInput.PictForm.TemplatedEntityLookup.EntitiesBundle is not an array");
			return;
		}

		const tmpAnticipate = this.fable.newAnticipate();

		// 1. Get the entities
		tmpAnticipate.anticipate(
			function (fNext)
			{
				this.pict.EntityProvider.gatherDataFromServer(pInput.PictForm.TemplatedEntityLookup.EntitiesBundle, fNext);
			}.bind(this));

		// 2. Check the Empty Value Test List

		// 3. Render the Template
		tmpAnticipate.anticipate(
			function (fNext)
			{
				this.pict.parseTemplate(tmpDisplayTemplate, {Value: pValue},
					function (pError, pResult)
					{
						if (pError)
						{
							this.log.error("Error rendering template in assignDisplayEntityData", pError);
							return;
						}
						tmpDisplayContent = pResult;
						return fNext();
					}.bind(this));
			}.bind(this));

		// 4. Assign the Content to the display element
		tmpAnticipate.wait(
			function (pError)
			{
				if (pError)
				{
					this.log.error("Error in assignDisplayEntityData", pError);
					return;
				}
				this.pict.ContentAssignment.assignContent(pDisplayID, tmpDisplayContent);
			}.bind(this));
	}

	/**
	 * Initializes the input element for the Pict provider select input.
	 *
	 * @param {Object} pView - The view object.
	 * @param {Object} pGroup - The group object.
	 * @param {Object} pRow - The row object.
	 * @param {Object} pInput - The input object.
	 * @param {any} pValue - The input value.
	 * @param {string} pHTMLSelector - The HTML selector.
	 * @param {string} pTransactionGUID - The transaction GUID for the event dispatch.
	 * @returns {boolean} - Returns true if the input element is successfully initialized, false otherwise.
	 */
	onInputInitialize(pView, pGroup, pRow, pInput, pValue, pHTMLSelector, pTransactionGUID)
	{
		this.assignDisplayEntityData(this.getContentDisplayHTMLID(pInput.Macro.RawHTMLID), pInput, pValue);
		return super.onInputInitialize(pView, pGroup, pRow, pInput, pValue, pHTMLSelector, pTransactionGUID);
	}

	/**
	 * Initializes a tabular input element.
	 *
	 * @param {Object} pView - The view object.
	 * @param {Object} pGroup - The group object.
	 * @param {Object} pInput - The input object.
	 * @param {any} pValue - The input value.
	 * @param {string} pHTMLSelector - The HTML selector.
	 * @param {number} pRowIndex - The index of the row.
	 * @param {string} pTransactionGUID - The transaction GUID for the event dispatch.
	 * @returns {any} - The result of the initialization.
	 */
	onInputInitializeTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex, pTransactionGUID)
	{
		this.assignDisplayEntityData(this.getTabularContentDisplayInputID(pInput.Macro.RawHTMLID, pRowIndex), pInput, pValue);
		return super.onInputInitializeTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex, pTransactionGUID);
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
	 * @param {string} pTransactionGUID - The transaction GUID for the event dispatch.
	 * @returns {boolean} - Returns true if the value is successfully marshaled to the form, otherwise false.
	 */
	onDataMarshalToForm(pView, pGroup, pRow, pInput, pValue, pHTMLSelector, pTransactionGUID)
	{
		//FIXME: this should use a trigger group + event
		this.assignDisplayEntityData(this.getContentDisplayHTMLID(pInput.Macro.RawHTMLID), pInput, pValue);
		return super.onDataMarshalToForm(pView, pGroup, pRow, pInput, pValue, pHTMLSelector, pTransactionGUID);
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
	 * @param {string} pTransactionGUID - The transaction GUID for the event dispatch.
	 * @returns {any} - The result of the data marshaling.
	 */
	onDataMarshalToFormTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex, pTransactionGUID)
	{
		//FIXME: this should use a trigger group + event
		this.assignDisplayEntityData(this.getTabularContentDisplayInputID(pInput.Macro.RawHTMLID, pRowIndex), pInput, pValue);
		return super.onDataMarshalToFormTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex, pTransactionGUID);
	}
}

module.exports = CustomInputHandler;
