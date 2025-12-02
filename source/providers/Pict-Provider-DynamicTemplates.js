const libPictProvider = require('pict-provider');

const libDynamicInput = require('../providers/Pict-Provider-DynamicInput.js');

const templateSetDefaultFormTemplates = require('./dynamictemplates/Pict-DynamicTemplates-DefaultFormTemplates.js');
const templateSetReadOnlyTemplates = require('./dynamictemplates/Pict-DynamicTemplates-DefaultFormTemplates-ReadOnly.js');

const libTemplateValueSetWithGroup = require('../templates/Pict-Template-Metacontroller-ValueSetWithGroup.js');
const libTemplateDynamicInput = require('../templates/Pict-Template-Metatemplate-Input.js');
const libTemplateDynamicInputWithHashAddress = require('../templates/Pict-Template-Metatemplate-InputWithHashAddress.js');
const libTemplateDynamicInputWithView = require('../templates/Pict-Template-Metatemplate-InputWithView.js');
const libTemplateDynamicInputWithViewAndHashAddress = require('../templates/Pict-Template-Metatemplate-InputWithViewAndHashAddress.js');
const libTemplateDynamicInputWithViewAndDescriptorAddress = require('../templates/Pict-Template-Metatemplate-InputWithViewAndDescriptorAddress.js');
const libTemplateControlFromDynamicManifest = require('../templates/Pict-Template-ControlFromDynamicManifest.js');
const libTemplateControlFromDynamicManifestForHash = require('../templates/Pict-Template-ControlFromDynamicManifestForHash.js');
const libTemplateGetViewSchemaValue = require('../templates/Pict-Template-DyanmicView-Value.js');
const libTemplateGetViewSchemaValueByHash = require('../templates/Pict-Template-DyanmicView-ValueByHash.js');


// TODO: This is temporary until we publish new pict
const libTemplatePluckJoinUnique = require('../templates/Pict-Template-Proxy-PluckJoinUnique.js');

/** @type {Record<string, any>} */
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
	 *
	 * @param {import('fable')} pFable - The Fable instance.
	 * @param {Record<string, any>} [pOptions] - The options for the provider.
	 * @param {string} [pServiceHash] - The service hash for the provider.
	 */
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(_DefaultProviderConfiguration)), pOptions);

		super(pFable, tmpOptions, pServiceHash);

		/** @type {any} */
		this.options;
		/** @type {import('pict')} */
		this.pict;
		/** @type {any} */
		this.log;

		this.pict.addProviderSingleton('DynamicInput', libDynamicInput.default_configuration, libDynamicInput);

		this.pict.addTemplate(libTemplateValueSetWithGroup);
		this.pict.addTemplate(libTemplateDynamicInput);
		this.pict.addTemplate(libTemplateDynamicInputWithHashAddress);
		this.pict.addTemplate(libTemplateDynamicInputWithView);
		this.pict.addTemplate(libTemplateDynamicInputWithViewAndHashAddress);
		this.pict.addTemplate(libTemplateDynamicInputWithViewAndDescriptorAddress);
		this.pict.addTemplate(libTemplatePluckJoinUnique);
		this.pict.addTemplate(libTemplateControlFromDynamicManifest);
		this.pict.addTemplate(libTemplateControlFromDynamicManifestForHash);
		this.pict.addTemplate(libTemplateGetViewSchemaValue);
		this.pict.addTemplate(libTemplateGetViewSchemaValueByHash);

		if (this.options?.MetaTemplateSet && typeof(this.options.MetaTemplateSet) === 'object')
		{
			this.injectTemplateSet(this.options.MetaTemplateSet);
		}
		else
		{
			this.injectTemplateSet(templateSetDefaultFormTemplates);
		}
		this.injectTemplateSet(templateSetReadOnlyTemplates);
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
			if (tmpMetaTemplate.hasOwnProperty('DefaultInputExtensions'))
			{
				tmpTemplateSet[tmpMetaTemplateHash].DefaultInputExtensions = JSON.parse(JSON.stringify(tmpMetaTemplate.DefaultInputExtensions));
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
				if (tmpTemplate.hasOwnProperty('DefaultInputExtensions'))
				{
					tmpTemplateSet[tmpTemplateHash].DefaultInputExtensions = JSON.parse(JSON.stringify(tmpTemplate.DefaultInputExtensions));
				}
			}
		}

		let tmpTemplateList = Object.keys(tmpTemplateSet);
		this.log.info(`Pict Form Section Provider for [${tmpTemplatePrefix}] Loaded ${tmpTemplateList.length} templates.`);
		for (let i = 0; i < tmpTemplateList.length; i++)
		{
			let tmpMetaTemplate = tmpTemplateSet[tmpTemplateList[i]];
			this.pict.TemplateProvider.addTemplate(tmpMetaTemplate.Hash, tmpMetaTemplate.Template);
			if (tmpMetaTemplate.hasOwnProperty('DefaultInputExtensions'))
			{
				for (let i = 0; i < tmpMetaTemplate.DefaultInputExtensions.length; i++)
				{
					this.pict.providers.DynamicInput.addDefaultInputProvider(tmpMetaTemplate.Hash, tmpMetaTemplate.DefaultInputExtensions[i]);
				}
			}
		}
	}
}

module.exports = PictDynamicFormsTemplates;
module.exports.default_configuration = _DefaultProviderConfiguration;
