const libPictViewClass = require('pict-view');

const libFormsTemplateProvider = require('./Pict-Section-Form-Provider-Templates.js');

class PictSectionForm extends libPictViewClass
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, require('./Pict-Section-Form-View-DefaultConfiguration.json'), pOptions);

		if (!tmpOptions.Manifests.hasOwnProperty('Section'))
		{
			throw new Error('PictSectionForm instantiation attempt without a Section manifest in pOptions.Manifest -- cannot instantiate.');
			return;
		}

		// Set the default destination address to be based on the section hash if it hasn't been overridden by the manifest section definition
		if (tmpOptions.DefaultDestinationAddress == '#Pict-Form-Container')
		{
			tmpOptions.DefaultDestinationAddress = `#Pict-Form-Container-${tmpOptions.Hash}`;
		}

		if (tmpOptions.DefaultRenderable == 'Form-Main')
		{
			tmpOptions.DefaultRenderable = `Form-${tmpOptions.Hash}`;
		}

		if (!tmpOptions.SectionTemplateHash)
		{
			tmpOptions.SectionTemplateHash = `Pict-Form-Template-${tmpOptions.Hash}`;
		}

		if (tmpOptions.Renderables.length < 1)
		{
			tmpOptions.Renderables.push(
				{
					RenderableHash: tmpOptions.DefaultRenderable,
					TemplateHash: tmpOptions.SectionTemplateHash,
					// one of append, prepend, replace or append_once
					RenderMethod: 'replace'
				});
		}

		if (tmpOptions.Templates.length < 1)
		{
			tmpOptions.Templates.push(
				{
					Hash: tmpOptions.SectionTemplateHash,
					Template: ``
				});
		}

		super(pFable, tmpOptions, pServiceHash);

		// Pull in the section definition
		this.sectionDefinition = this.options;
		// Initialize the section manifest -- instantiated to live only the lifecycle of this view
		this.sectionManifest = this.fable.instantiateServiceProviderWithoutRegistration('Manifest', this.options.Manifests.Section);

		if (!this.pict.providers.PictFormSectionDefaultTemplateProvider)
		{
			let tmpDefaultTemplateProvider = this.pict.addProvider('PictFormSectionDefaultTemplateProvider', libFormsTemplateProvider.default_configuration, libFormsTemplateProvider);
			tmpDefaultTemplateProvider.initialize();
		}

		this.initializeFormGroups();
	}

	initializeFormGroups()
	{
		// Enumerate the manifest and make sure a group exists for each group in the section definition
		let tmpDescriptorKeys = Object.keys(this.options.Manifests.Section.Descriptors);
		for (let i = 0; i < tmpDescriptorKeys.length; i++)
		{
			let tmpDescriptor = this.options.Manifests.Section.Descriptors[tmpDescriptorKeys[i]];

			if (
					// If there is an obect in the descriptor
					typeof(tmpDescriptor) == 'object' &&
					// AND it has a PictForm property
					tmpDescriptor.hasOwnProperty('PictForm') &&
					// AND the PictForm property is an object
					typeof(tmpDescriptor.PictForm) == 'object' &&
					// AND the PictForm object has a Section property
					tmpDescriptor.PictForm.hasOwnProperty('Section') &&
					// AND the Section property matches our section hash
					tmpDescriptor.PictForm.Section == this.sectionDefinition.Hash
				)
			{
				let tmpGroupHash = (typeof(tmpDescriptor.PictForm.Group) == 'string') ? tmpDescriptor.PictForm.Group : 'Default';
				
				let tmpGroup = this.sectionDefinition.Groups.find((pGroup) => { return pGroup.Hash == tmpGroupHash; });

				if (!tmpGroup)
				{
					tmpGroup = { Hash: tmpGroupHash, Name: tmpGroupHash, Description: false, Inputs: [tmpDescriptor] };
					this.sectionDefinition.Groups.push(tmpGroup);
				}
				else
				{
					if (!Array.isArray(tmpGroup.Inputs))
					{
						tmpGroup.Inputs = [];
					}

					tmpGroup.Inputs.push(tmpDescriptor);
				}
			}
		}
	}
}

module.exports = PictSectionForm;