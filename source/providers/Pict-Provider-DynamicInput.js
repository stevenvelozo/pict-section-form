const libPictProvider = require('pict-provider');

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
	 * Creates an instance of the PictDynamicLayout class.
	 * 
	 * @param {object} pFable - The fable object.
	 * @param {object} pOptions - The options object.
	 * @param {object} pServiceHash - The service hash object.
	 */
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(_DefaultProviderConfiguration)), pOptions);
		super(pFable, tmpOptions, pServiceHash);

		// A map of strings for each input template, mapping it to arrays of default providers.
		this.templateProviderMap = {};
	}

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

	getDefaultInputProviders(pTemplateFullHash)
	{
		if (!(pTemplateFullHash in this.templateProviderMap))
		{
			return [];
		}
		return this.templateProviderMap[pTemplateFullHash];
	}
}

module.exports = PictDynamicInput;
module.exports.default_configuration = _DefaultProviderConfiguration;