const libPictProvider = require('pict-provider');

const defaultFormTemplates = [
	// 1. -Form-Template-Wrap
	{
		"HashPostfix": "-Template-Wrap",
		"Template": /*HTML*/`
<div class="pict-form-wrap">
</div>
`
	},
	// 2. -Form-Template-Section
	{
		"HashPostfix": "-Template-Section",
		"Template": /*HTML*/`
<div class="pict-form-section">
<h2>~
{~TS:Pict-Form-Template-Group:Record.Groups~}
</div>
`
	},
	// 3. -Form-Template-Group
	{
		"HashPostfix": "-Template-Group",
		"Template": /*HTML*/`
<div class="pict-form-group">
</div>
`
	},
	// 4. -Form-Template-Input
	{
		"HashPostfix": "-Template-Input",
		"Template": /*HTML*/`<input type="hidden" id="" name="" value="">`
	},
	// 6. -Form-Template-Input-DataType-String
	{
		"HashPostfix": "-Template-Input-DataType-String",
		"Template": /*HTML*/`<input type="text" id="" name="" value="">`
	},
	// 6. -Form-Template-Input-DataType-Number
	{
		"HashPostfix": "-Template-Input-DataType-Number",
		"Template": /*HTML*/``
	}
];

class PictSectionFormTemplateProvider extends libPictProvider
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(require('./Pict-Section-Form-Provider-Templates-DefaultConfiguration.json'))), pOptions);
		super(pFable, tmpOptions, pServiceHash);
	}

	onInitialize()
	{
		this.log.info('Loading template set.');

		if (!this.options.hasOwnProperty('FormsTemplateSetPrefix') && (this.options.ProviderIdentifier == 'Pict-Section-Form-Provider-Templates-Basic'))
		{
			this.options.formsTemplateSetPrefix = 'Pict-Forms-Basic';
		}
		else if (!this.options.hasOwnProperty('FormsTemplateSetPrefix') && (this.options.ProviderIdentifier == 'Pict-Section-Form-Provider-Templates-Basic'))
		{
			this.log.error(`No FormsTemplateSetPrefix defined in the provider options -- Provider [${this.UUID}]::[${this.Hash}].  Templates will not be loaded.`);
			return false;
		}

		this.formsTemplateSetPrefix = this.options.formsTemplateSetPrefix;

		if (!this.options.hasOwnProperty('FormsTemplateSet'))
		{
			this.log.warn(`No FormsTemplateSet defined in the provider options -- Provider [${this.UUID}]::[${this.Hash}].  Using default templates only.`);
			this.formsTemplateSet = {};
		}
		else
		{
			this.formsTemplateSet = this.options.formsTemplateSet;
		}

		for (let i = 0; i < defaultFormTemplates.length; i++)
		{
			let tmpDefaultTemplateHash = `${this.formsTemplateSetPrefix}${defaultFormTemplates[i].HashPostfix}`;
			if (!this.formsTemplateSet.hasOwnProperty(tmpDefaultTemplateHash))
			{
				this.formsTemplateSet[tmpDefaultTemplateHash] = (
					{
						Hash: tmpDefaultTemplateHash,
						Template: defaultFormTemplates[i].Template
					});
			}
		}

		// Now load the templates if they aren't in the template provider already.
		let tmpTemplateSetHashes = Object.keys(this.formsTemplateSet);

		for (let i = 0; i < tmpTemplateSetHashes.length; i++)
		{
			let tmpTemplate = this.formsTemplateSet[tmpTemplateSetHashes[i]];

			if (!this.pict.TemplateProvider.getTemplate(tmpTemplate.Hash))
			{
				this.log.info(`Adding template [${tmpTemplate.Hash}] to the Template Provider [${this.UUID}]::[${this.Hash}].`);
				this.pict.TemplateProvider.addTemplate(tmpTemplate.Hash, tmpTemplate.Template);
			}
		}

		return false;
	}
}

module.exports = PictSectionFormTemplateProvider;
module.exports.default_configuration = require('./Pict-Section-Form-Provider-Templates-DefaultConfiguration.json');


