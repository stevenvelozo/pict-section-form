const libPictProvider = require('pict-provider');

const defaultFormTemplates = [
	// -Form-Template-Wrap-Prefix
	{
		"HashPostfix": "-Template-Wrap-Prefix",
		"Template": /*HTML*/`
<!-- Form Wrap Prefix [{~D:Context[0].UUID~}]::[{~D:Context[0].Hash~}] -->
`
	},
	// -Form-Template-Wrap-Postfix
	{
		"HashPostfix": "-Template-Wrap-Postfix",
		"Template": /*HTML*/`
<!-- Form Wrap Postfix [{~D:Context[0].UUID~}]::[{~D:Context[0].Hash~}] -->
`
	},
	// -Form-Template-Section-Prefix
	{
		"HashPostfix": "-Template-Section-Prefix",
		"Template": /*HTML*/`
<!-- Form Section Prefix [{~D:Context[0].UUID~}]::[{~D:Context[0].Hash~}] {~D:Record.Hash~}::{~D:Record.Name~} -->
<div class="pict-form-section">
<h2>{~D:Record.Name~}</h2>
`
	},
	// -Form-Template-Section-Postfix
	{
		"HashPostfix": "-Template-Section-Postfix",
		"Template": /*HTML*/`
</div>
<!-- Form Section Postfix [{~D:Context[0].UUID~}]::[{~D:Context[0].Hash~}] {~D:Record.Hash~}::{~D:Record.Name~} -->
`
	},

	// -Form-Template-Group-Prefix
	{
		"HashPostfix": "-Template-Group-Prefix",
		"Template": /*HTML*/`
<!-- Form Template Group Prefix [{~D:Context[0].UUID~}]::[{~D:Context[0].Hash~}] {~D:Record.Hash~}::{~D:Record.Name~} -->
<h3>Group: {~D:Record.Name~}</h3>
`
	},
	// -Form-Template-Group-Postfix
	{
		"HashPostfix": "-Template-Group-Postfix",
		"Template": /*HTML*/`
</div>
<!-- Form Template Group Prefix [{~D:Context[0].UUID~}]::[{~D:Context[0].Hash~}] {~D:Record.Hash~}::{~D:Record.Name~} -->
`
	},

	// -Form-Template-Row-Prefix
	{
		"HashPostfix": "-Template-Row-Prefix",
		"Template": /*HTML*/`
<!-- Form Template Row Prefix [{~D:Context[0].UUID~}]::[{~D:Context[0].Hash~}] {~D:Record.Hash~}::{~D:Record.Name~} -->
<div>
`
	},
	// -Form-Template-Group-Postfix
	{
		"HashPostfix": "-Template-Row-Postfix",
		"Template": /*HTML*/`
</div>
<!-- Form Template Row Postfix [{~D:Context[0].UUID~}]::[{~D:Context[0].Hash~}] {~D:Record.Hash~}::{~D:Record.Name~} -->
`
	},

	// -Form-Template-Input
	{
		"HashPostfix": "-Template-Input",
		"Template": /*HTML*/`<!-- Input {~D:Record.Hash~} {~D:Record.DataType~} --><span>{~D:Record.Name~}:</span> <input type="hidden" id="{~D:Context[0].UUID~}-FormInput-{~D:Record.Hash~}" name="{~D:Record.Name~}" value="">`
	},
	// -Form-Template-Input-DataType-String
	{
		"HashPostfix": "-Template-Input-DataType-String",
		"Template": /*HTML*/`<!-- DataType Number {~D:Record.Hash~} {~D:Record.DataType~} --><span>{~D:Record.Name~}:</span> <input type="text" id="{~D:Context[0].UUID~}-FormInput-{~D:Record.Hash~}" name="{~D:Record.Name~}" value="">`
	},
	// -Form-Template-Input-DataType-Number
	{
		"HashPostfix": "-Template-Input-DataType-Number",
		"Template": /*HTML*/`<!-- DataType Number {~D:Record.Hash~} {~D:Record.DataType~} --><span>{~D:Record.Name~}:</span> <input type="Number" id="{~D:Context[0].UUID~}-FormInput-{~D:Record.Hash~}" name="{~D:Record.Name~}" value="">`
	},
	// -Form-Template-Input-InputType-TextArea
	{
		"HashPostfix": "-Template-Input-InputType-TextArea",
		"Template": /*HTML*/`<!-- InputType TextArea {~D:Record.Hash~} {~D:Record.DataType~} --><span>{~D:Record.Name~}:</span> <textarea id="{~D:Context[0].UUID~}-FormInput-{~D:Record.Hash~}" name="{~D:Record.Name~}"></textarea>`
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

		return true;
	}
}

module.exports = PictSectionFormTemplateProvider;
module.exports.default_configuration = require('./Pict-Section-Form-Provider-Templates-DefaultConfiguration.json');


