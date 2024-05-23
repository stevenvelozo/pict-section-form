const libPictProvider = require('pict-provider');

const defaultFormTemplates = require('./Pict-Section-Form-Provider-Templates-DefaultFormTemplates.js');

class PictSectionFormTemplateProvider extends libPictProvider
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(require('./Pict-Section-Form-Provider-Templates-DefaultConfiguration.json'))), pOptions);
		
		// This is all you're expected to overload in this provider
		if (!tmpOptions.hasOwnProperty('MetaTemplateSet'))
		{
			tmpOptions.MetaTemplateSet = JSON.parse(JSON.stringify(defaultFormTemplates));
		}

		super(pFable, tmpOptions, pServiceHash);

		this.formsTemplateSetPrefix = '';
		this.formsTemplateSet = {};

		if (!this.options.MetaTemplateSet.hasOwnProperty('TemplatePrefix') && (this.options.ProviderIdentifier == 'Pict-Section-Form-Provider-Templates-Basic'))
		{
			// The default template prefix is 'Pict-Forms-Basic'
			this.formsTemplateSetPrefix = defaultFormTemplates.TemplatePrefix;
		}
		else if (!this.options.MetaTemplateSet.hasOwnProperty('TemplatePrefix') && (this.options.ProviderIdentifier != 'Pict-Section-Form-Provider-Templates-Basic'))
		{
			this.log.error(`No TemplatePrefix defined in the provider options.MetaTemplateSet.TemplatePrefix -- Provider [${this.UUID}]::[${this.Hash}].  Templates will not be loaded.`);
		}
		else
		{
			this.formsTemplateSetPrefix = this.options.MetaTemplateSet.TemplatePrefix;
		}

		if (!this.options.MetaTemplateSet.hasOwnProperty('Templates'))
		{
			this.log.warn(`No Templates defined in the provider options.MetaTemplateSet.Templates -- Provider [${this.UUID}]::[${this.Hash}].  Using default templates only.`);
			this.options.MetaTemplateSet.Templates = [];
		}

		for (let i = 0; i < this.options.MetaTemplateSet.Templates.length; i++)
		{
			let tmpTemplate = this.options.MetaTemplateSet.Templates[i];
			let tmpTemplateHash = `${this.formsTemplateSetPrefix}${tmpTemplate.HashPostfix}`;
			this.formsTemplateSet[tmpTemplateHash] = (
				{
					Hash: tmpTemplateHash,
					Template: tmpTemplate.Template
				});
		}

		for (let i = 0; i < defaultFormTemplates.Templates.length; i++)
		{
			let tmpTemplate = defaultFormTemplates.Templates[i];
			let tmpTemplateHash = `${this.formsTemplateSetPrefix}${tmpTemplate.HashPostfix}`;
			// Only load default templates if they are not already defined in the options
			if (!this.formsTemplateSet.hasOwnProperty(tmpTemplateHash))
			{
				this.formsTemplateSet[tmpTemplateHash] = (
					{
						Hash: tmpTemplateHash,
						Template: tmpTemplate.Template
					});
			}
		}

		let tmpTemplateList = Object.keys(this.formsTemplateSet);
		this.log.info(`Pict Form Section Provider for [${this.formsTemplateSetPrefix}] Loaded ${tmpTemplateList.length} templates.`);
		for (let i = 0; i < tmpTemplateList.length; i++)
		{
			this.pict.TemplateProvider.addTemplate(this.formsTemplateSet[tmpTemplateList[i]].Hash, this.formsTemplateSet[tmpTemplateList[i]].Template);
		}
	}
}

module.exports = PictSectionFormTemplateProvider;
module.exports.default_configuration = require('./Pict-Section-Form-Provider-Templates-DefaultConfiguration.json');


