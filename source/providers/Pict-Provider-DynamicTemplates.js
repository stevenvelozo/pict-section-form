const libPictProvider = require('pict-provider');

const libDynamicInput = require('../providers/Pict-Provider-DynamicInput.js');

const templateSetDefaultFormTemplates = require('./dynamictemplates/Pict-DynamicTemplates-DefaultFormTemplates.js');

const _DefaultProviderConfiguration = (
{
	"ProviderIdentifier": "Pict-DynamicForms-MetaTemplates-Basic",

	"AutoInitialize": true,
	"AutoInitializeOrdinal": 0,

	"AutoSolveWithApp": false
});

/**
 * Represents a class that provides dynamic templates for the Pict form section provider.
 * @extends libPictProvider
 */
class PictDynamicFormsTemplates extends libPictProvider
{
	/**
	 * Constructs a new instance of the PictProviderDynamicTemplates class.
	 * @param {Object} pFable - The pFable object.
	 * @param {Object} pOptions - The options object.
	 * @param {Object} pServiceHash - The service hash object.
	 */
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(_DefaultProviderConfiguration)), pOptions);
		
		super(pFable, tmpOptions, pServiceHash);

		this.pict.addProviderSingleton('DynamicInput', libDynamicInput.default_configuration, libDynamicInput);

		this.pict.addTemplate(require('../templates/Pict-Template-Metacontroller-ValueSetWithGroup.js'));

		if (this.options?.MetaTemplateSet && typeof(this.options.MetaTemplateSet) === 'object')
		{
			this.injectTemplateSet(this.options.MetaTemplateSet);
		}
		else
		{
			this.injectTemplateSet(templateSetDefaultFormTemplates);
		}
		this.injectTemplateSet(require('./dynamictemplates/Pict-DynamicTemplates-DefaultFormTemplates-ReadOnly.js'));
	}

	/**
	 * Injects a template set into Pict for the Dynamic Form Section Provider.
	 * 
	 * The TemplateSet object expects to have a `TemplatePrefix` and `Templates` property.
	 * 
	 * The `TemplatePrefix` is used to prefix the hash of the template.
	 * 
	 * The `Templates` property is an array of objects with the following properties:
	 * - `HashPostfix` - The postfix to be added to the template hash.  This defines which dynamic template in the Layout it represents.
	 * - `Template` - The template string to be injected.
	 * - `DefaultInputExtensions` - An optional array of default input extensions to be added to the Dynamic Input provider.
	 * 
	 * The context of the template *is not the data*.  The template context is one of these five things depending on the layout layer:
	 * - `Form` - The form object.
	 * - `Section` - The section object.
	 * - `Group` - The group object.
	 * - `Row` - The row object.
	 * - `Input` - The input object.
	 * 
	 * @param {Object} pTemplateSet - The template set to be injected.
	 */
	injectTemplateSet(pTemplateSet)
	{
		let tmpTemplatePrefix = 'PictFormsUnknown';
		let tmpTemplates = [];
		let tmpTemplateSet = {};

		tmpTemplatePrefix = this.options?.MetaTemplateSet ?? tmpTemplatePrefix;
		tmpTemplates = this.options?.MetaTemplateSet?.Templates ?? tmpTemplates;

		tmpTemplatePrefix = pTemplateSet?.TemplatePrefix ?? tmpTemplatePrefix;
		tmpTemplates = pTemplateSet?.Templates ?? tmpTemplates;

		for (let i = 0; i < tmpTemplates.length; i++)
		{
			let tmpMetaTemplate = tmpTemplates[i];
			let tmpMetaTemplateHash = `${tmpTemplatePrefix}${tmpMetaTemplate.HashPostfix}`;
			tmpTemplateSet[tmpMetaTemplateHash] = (
				{
					Hash: tmpMetaTemplateHash,
					Template: tmpMetaTemplate.Template
				});
			// If there is an array of default input extensions, add them to the DynamicInput provider as a default set
			if ('DefaultInputExtensions' in tmpMetaTemplate)
			{
				tmpTemplateSet[tmpMetaTemplateHash].DefaultInputExtensions = tmpMetaTemplate.DefaultInputExtensions;
				for (let i = 0; i < tmpMetaTemplate.DefaultInputExtensions.length; i++)
				{
					this.pict.providers.DynamicInput.addDefaultInputProvider(tmpMetaTemplateHash, tmpMetaTemplate.DefaultInputExtensions[i]);
				}
			}
		}

		for (let i = 0; i < templateSetDefaultFormTemplates.Templates.length; i++)
		{
			let tmpTemplate = templateSetDefaultFormTemplates.Templates[i];
			let tmpTemplateHash = `${tmpTemplatePrefix}${tmpTemplate.HashPostfix}`;
			// Only load default templates if they are not already defined in the options
			if (!(tmpTemplateHash in tmpTemplateSet))
			{
				tmpTemplateSet[tmpTemplateHash] = (
					{
						Hash: tmpTemplateHash,
						Template: tmpTemplate.Template
					});
			}
		}

		let tmpTemplateList = Object.keys(tmpTemplateSet);
		this.log.info(`Pict Form Section Provider for [${tmpTemplatePrefix}] Loaded ${tmpTemplateList.length} templates.`);
		for (let i = 0; i < tmpTemplateList.length; i++)
		{
			this.pict.TemplateProvider.addTemplate(tmpTemplateSet[tmpTemplateList[i]].Hash, tmpTemplateSet[tmpTemplateList[i]].Template);
		}
	}
}

module.exports = PictDynamicFormsTemplates;
module.exports.default_configuration = _DefaultProviderConfiguration;