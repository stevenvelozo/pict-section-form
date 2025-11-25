const libPictProvider = require('pict-provider');

/** @type {Record<string, any>} */
const _DefaultProviderConfiguration = (
{
	"ProviderIdentifier": "Pict-DynamicForms-Input",

	"AutoInitialize": true,
	"AutoInitializeOrdinal": 0,

	"AutoSolveWithApp": false
});

/**
 * The PictDynamicInput class is a provider that manages data brokering and provider mappings for dynamic inputs.
 */
class PictDynamicInput extends libPictProvider
{
	/**
	 * Creates an instance of the PictDynamicInput class.
	 *
	 * @param {import('pict')} pFable - The fable object.
	 * @param {any} [pOptions={}] - The options object.
	 * @param {string} [pServiceHash] - The service hash object.
	 */
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(_DefaultProviderConfiguration)), pOptions);
		super(pFable, tmpOptions, pServiceHash);
		// A map of strings for each input template, mapping it to arrays of default providers.
		this.templateProviderMap = {};
		/** @type {Record<string, boolean>} */
		this.ignoredEventHashes = {};
	}

	/**
	 * @param {string} pEventHash
	 */
	registerIgnoredEventHash(pEventHash)
	{
		this.ignoredEventHashes[pEventHash] = true;
	}

	/**
	 * Retrieves the template hash for the input based on the provided view and input.
	 *
	 * @param {import('../views/Pict-View-DynamicForm')} pView - The view object.
	 * @param {any} pInput - The input object.
	 * @returns {string|boolean} - The template hash if found, otherwise false.
	 */
	getInputTemplateHash(pView, pInput)
	{
		if (pInput.IsTabular)
		{
			let tmpTemplateBeginInputTypePostfix = `-TabularTemplate-Begin-Input-InputType-${pInput.PictForm.InputType}`;
			let tmpTemplateEndInputTypePostfix = `-TabularTemplate-End-Input-InputType-${pInput.PictForm.InputType}`;

			let tmpTemplateBeginDataTypePostfix = `-TabularTemplate-Begin-Input-DataType-${pInput.DataType}`;
			let tmpTemplateEndDataTypePostfix = `-TabularTemplate-End-Input-DataType-${pInput.DataType}`;
			if (pView.checkViewSpecificTemplate(tmpTemplateBeginInputTypePostfix) && pView.checkViewSpecificTemplate(tmpTemplateEndInputTypePostfix))
			{
				return pView.getViewSpecificTemplateHash(tmpTemplateBeginInputTypePostfix);
			}
			else if (pView.checkThemeSpecificTemplate(tmpTemplateBeginInputTypePostfix) && pView.checkThemeSpecificTemplate(tmpTemplateEndInputTypePostfix))
			{
				return pView.getThemeSpecificTemplateHash(tmpTemplateBeginInputTypePostfix);
			}
			else if (pView.checkViewSpecificTemplate(tmpTemplateBeginDataTypePostfix) && pView.checkViewSpecificTemplate(tmpTemplateEndDataTypePostfix))
			{
				return pView.getViewSpecificTemplateHash(tmpTemplateBeginDataTypePostfix);
			}
			else if (pView.checkThemeSpecificTemplate(tmpTemplateBeginDataTypePostfix) && pView.checkThemeSpecificTemplate(tmpTemplateEndDataTypePostfix))
			{
				return pView.getThemeSpecificTemplateHash(tmpTemplateBeginDataTypePostfix);
			}
		}
		else
		{
			let tmpTemplateInputTypePostfix = `-Template-Input-InputType-${pInput.PictForm.InputType}`;
			let tmpTemplateDataTypePostfix = `-Template-Input-DataType-${pInput.DataType}`;
			if (pView.checkViewSpecificTemplate(tmpTemplateInputTypePostfix))
			{
				return pView.getViewSpecificTemplateHash(tmpTemplateInputTypePostfix);
			}
			else if (pView.checkThemeSpecificTemplate(tmpTemplateInputTypePostfix))
			{
				return pView.getThemeSpecificTemplateHash(tmpTemplateInputTypePostfix);
			}
			else if (pView.checkViewSpecificTemplate(tmpTemplateDataTypePostfix))
			{
				return pView.getViewSpecificTemplateHash(tmpTemplateDataTypePostfix);
			}
			else if (pView.checkThemeSpecificTemplate(tmpTemplateDataTypePostfix))
			{
				return pView.getThemeSpecificTemplateHash(tmpTemplateDataTypePostfix);
			}
		}
		return false;
	}

	/**
	 * Adds a default input provider for a given template full hash.
	 *
	 * @param {string} pTemplateFullHash - The full hash of the template.
	 * @param {any} pProvider - The provider to be added.
	 */
	addDefaultInputProvider(pTemplateFullHash, pProvider)
	{
		if (!(pTemplateFullHash in this.templateProviderMap))
		{
			this.templateProviderMap[pTemplateFullHash] = [];
		}
		if (this.templateProviderMap[pTemplateFullHash].indexOf(pProvider) < 0)
		{
			this.templateProviderMap[pTemplateFullHash].push(pProvider);
		}
	}

	/**
	 * Retrieves the default input providers based on the given view and input.
	 *
	 * @param {import('../views/Pict-View-DynamicForm')} pView - The view object.
	 * @param {string} pInput - The input to retrieve input providers for.
	 * @returns {Array} An array of default input providers.
	 */
	getDefaultInputProviders(pView, pInput)
	{
		let tmpTemplateHash = this.getInputTemplateHash(pView, pInput);
		if (tmpTemplateHash && this.templateProviderMap[tmpTemplateHash])
		{
			return this.templateProviderMap[tmpTemplateHash];
		}
		return [];
	}
}

module.exports = PictDynamicInput;
module.exports.default_configuration = _DefaultProviderConfiguration;
