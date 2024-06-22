const libPictProvider = require('pict-provider');

const _DefaultProviderConfiguration = (
{
	"ProviderIdentifier": "Pict-DynamicForms-InputExtension",

	"AutoInitialize": true,
	"AutoInitializeOrdinal": 0,

	"AutoSolveWithApp": false
});

/**
 * The PictInputExtensionProvider class is a provider that allows extensions to the input fields of a form.
 * 
 * Can be mapped in via the PictForm property of a descriptor.
 */
class PictInputExtensionProvider extends libPictProvider
{
	/**
	 * Creates an instance of the PictInputExtensionProvider class.
	 * 
	 * @param {object} pFable - The fable object.
	 * @param {object} pOptions - The options object.
	 * @param {object} pServiceHash - The service hash object.
	 */
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(_DefaultProviderConfiguration)), pOptions);
		super(pFable, tmpOptions, pServiceHash);
	}

	/**
	 * An input has been initialized (rendered into the DOM)
	 * 
	 * Called when an input has this Provider hash in its 'Providers' array.
	 *
	 * @param {Object} pView - The view object.
	 * @param {Object} pGroup - The group definition object.
	 * @param {Object} pRow - The Row index.
	 * @param {Object} pInput - The input object.
	 * @param {string} pValue - The value of the input object
	 * @param {string} pHTMLSelector - The HTML selector for the input object
	 */
	onInputInitialize(pView, pGroup, pRow, pInput, pValue, pHTMLSelector)
	{
		return true;
	}

	/**
	 * A tabular input has been initialized (rendered into the DOM)
	 * 
	 * Called when an input has this Provider hash in its 'Providers' array.
	 *
	 * @param {Object} pView - The view object.
	 * @param {Object} pGroup - The group definition object.
	 * @param {Object} pInput - The input object.
	 * @param {string} pValue - The value of the input object
	 * @param {string} pHTMLSelector - The HTML selector for the input object (it will return an array).
	 */
	onInputInitializeTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex)
	{
		return true;
	}

	/**
	 * Called when the data change function is called
	 * 
	 * Called when an input has this Provider hash in its 'Providers' array.
	 *
	 * @param {Object} pView - The view object.
	 * @param {Object} pInput - The input object.
	 * @param {any} pValue - The new value of the input object
	 * @param {string} pHTMLSelector - The HTML selector for the input object
	 */
	onDataChange(pView, pInput, pValue, pHTMLSelector)
	{
		return true;
	}

	/**
	 * Called when an input has this Provider hash in its 'Providers' array.
	 *
	 * @param {Object} pView - The view object.
	 * @param {Object} pInput - The input object.
	 * @param {any} pValue - The new value of the input object
	 * @param {string} pHTMLSelector - The HTML selector for the input object
	 * @param {number} pRowIndex - The row index of the tabular data
	 */
	onDataChangeTabular(pView, pInput, pValue, pHTMLSelector, pRowIndex)
	{
		return true;
	}

	/**
	 * Fires when data is marshaled to the form for this input.
	 *
	 * @param {Object} pView - The view object.
	 * @param {Object} pGroup - The group definition object.
	 * @param {number} pRow - The Row index.
	 * @param {Object} pInput - The input object.
	 * @param {any} pValue - The value to marshal.
	 * @param {string} pHTMLSelector - The HTML selector.
	 * @returns {boolean} - Returns true if the data was successfully marshaled to the form.
	 */
	onDataMarshalToForm(pView, pGroup, pRow, pInput, pValue, pHTMLSelector)
	{
		return true;
	}

	/**
	 * Fires when data is marshaled to the form for this input.
	 *
	 * @param {Object} pView - The view object.
	 * @param {Object} pGroup - The group definition object.
	 * @param {Object} pInput - The input object.
	 * @param {any} pValue - The value to marshal.
	 * @param {string} pHTMLSelector - The HTML selector.
	 * @param {number} pRowIndex - The index of the input in the row columns.
	 * @returns {boolean} - Returns true if the data was successfully marshaled to the form.
	 */
	onDataMarshalToFormTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex)
	{
		return true;
	}

	/**
	 * Handles data requests for the Pict-Provider-InputExtension.
	 *
	 * @param {Object} pView - The view object.
	 * @param {Object} pInput - The input object.
	 * @param {string} pValue - The value from AppData.
	 * @param {string} pHTMLSelector - The HTML selector.
	 * @returns {boolean} - Returns true.
	 */
	onDataRequest(pView, pInput, pValue, pHTMLSelector)
	{
		return true;
	}

	/**
	 * Handles data requests for the Pict-Provider-InputExtension.
	 *
	 * @param {Object} pView - The view object.
	 * @param {Object} pInput - The input object.
	 * @param {string} pValue - The value from AppData.
	 * @param {string} pHTMLSelector - The HTML selector.
	 * @param {number} pRowIndex - The row index of the tabular data.
	 * @returns {boolean} - Returns true.
	 */
	onDataRequestTabular(pView, pInput, pValue, pHTMLSelector, pRowIndex)
	{
		return true;
	}
}

module.exports = PictInputExtensionProvider;
module.exports.default_configuration = _DefaultProviderConfiguration;
