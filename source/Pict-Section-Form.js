const libPictViewClass = require('pict-view');

const _DefaultConfiguration =
{
	"RenderOnLoad": true,

	"DefaultRenderable": "Form-Wrap",
	"DefaultDestinationAddress": "#Form-Container-Div",

	"Templates": [
		{
			"Hash": "Form-Container",
			"Template": ""
		}
	],

	"Renderables": [
		{
			"RenderableHash": "Form-Wrap",
			"TemplateHash": "Form-Container",
			"DestinationAddress": "#Form-Container-Div"
		}
	],

	"TargetElementAddress": "#Form-Container-Div"
};

class PictSectionForm extends libPictViewClass
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, _DefaultConfiguration, pOptions);

		super(pFable, tmpOptions, pServiceHash);

		if (!this.options.hasOwnProperty('SectionDefinition'))
		{
			this.log.error('PictSectionForm instantiated without a SectionDefinition in options -- cannot instantiate.');
			return;
		}

		if (!this.options.Manifests.hasOwnProperty('Section'))
		{
			this.log.error('PictSectionForm instantiated without a Section manifest in options.Manifest -- cannot instantiate.');
			return;
		}

		// Pull in the section definition
		this.sectionDefinition = this.options.SectionDefinition;
		// Initialize the section manifest -- instantiated to live only the lifecycle of this view
		this.sectionManifest = this.fable.instantiateServiceProviderWithoutRegistration('Manifest', this.options.Manifests.Section);

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

module.exports.default_configuration = _DefaultConfiguration;

// "What dependency injection in javascript?"
//  -- Ned
/**
 * Instantiates sections from a decorated Manyfest manifest.
 *
 * @param {Object} pPict - The Pict object.
 * @param {Object} pManifest - The manifest object.
 * @returns {Array} - An array of section definitions.
 */
module.exports.bootstrapFormViewsFromManifest = function(pPict, pManifest)
{
	let getSectionDefinition = (pSectionObject) =>
	{
		if (typeof(pSectionObject) != 'object')
		{
			this.log.error('getSectionDefinition() called without a valid section object.');
			return false;
		}

		if (!pSectionObject.hasOwnProperty('Hash'))
		{
			this.log.error('getSectionDefinition() called without a valid section object hash.');
			return false;
		}

		try
		{
			let tmpSectionDefinition = JSON.parse(JSON.stringify(pSectionObject));

			if (!tmpSectionDefinition.hasOwnProperty('Name'))
			{
				// If there isn't a name, use the hash
				tmpSectionDefinition.Name = tmpSectionDefinition.Hash;
			}
			if (!tmpSectionDefinition.hasOwnProperty('Description'))
			{
				// If there isn't a description, use the name
				tmpSectionDefinition.Description = `PICT Section [${tmpSectionDefinition.Name}].`;
			}
			if (!tmpSectionDefinition.hasOwnProperty('Groups'))
			{
				// If there isn't a groups array, create an empty one
				tmpSectionDefinition.Groups = [];
			}

			return tmpSectionDefinition;
		}
		catch(pError)
		{
			this.log.error('getSectionDefinition() failed to parse the section object.');
			return false;
		}
	}
	let tmpSectionList = [];

	if (typeof(pManifest) != 'object')
	{
		this.log.error('getSectionList() called without a valid manifest.');
		return tmpSectionList;
	}

	// Get the list of Explicitly Defined section hashes from the Sections property of the manifest
	if (pManifest.hasOwnProperty('Sections') && Array.isArray(pManifest.Sections))
	{
		for (let i = 0; i < pManifest.Sections.length; i++)
		{
			let tmpSectionDefinition = getSectionDefinition(pManifest.Sections[i]);

			if (tmpSectionDefinition)
			{
				tmpSectionList.push(tmpSectionDefinition);
			}
		}
	}

	// Check if there are any implicitly defined section hashes in the manifest descriptors
	if (pManifest.hasOwnProperty('Descriptors') && typeof(pManifest.Descriptors) == 'object')
	{
		let tmpImplicitSectionHashes = {};

		let tmpDescriptorKeys = Object.keys(pManifest.Descriptors);

		for (let i = 0; i < tmpDescriptorKeys.length; i++)
		{
			let tmpDescriptor = pManifest.Descriptors[tmpDescriptorKeys[i]];

			if (
					// If there is an obect in the descriptor
					typeof(tmpDescriptor) == 'object' &&
					// AND it has a PictForm property
					tmpDescriptor.hasOwnProperty('PictForm') &&
					// AND the PictForm property is an object
					typeof(tmpDescriptor.PictForm) == 'object' &&
					// AND the PictForm object has a Section property
					tmpDescriptor.PictForm.hasOwnProperty('Section') && 
					// AND the Section property is a string
					typeof(tmpDescriptor.PictForm.Section) == 'string'
				)
			{
				tmpImplicitSectionHashes[tmpDescriptor.PictForm.Section] = true;
			}
		}

		let tmpImplicitSectionKeys = Object.keys(tmpImplicitSectionHashes);

		for (let i = 0; i < tmpImplicitSectionKeys.length; i++)
		{
			let tmpExistingSection = tmpSectionList.find((pSection) => { return pSection.Hash == tmpImplicitSectionKeys[i]; });

			if (!tmpExistingSection)
			{
				tmpSectionList.push(getSectionDefinition({Hash: tmpImplicitSectionKeys[i]}));
			}
		}
	}

	// Now load a section view for each section
	for (let i = 0; i < tmpSectionList.length; i++)
	{
		let tmpViewHash = `PictSectionForm-${tmpSectionList[i].Hash}`;

		if (pPict.views.hasOwnProperty(tmpViewHash))
		{
			this.log.info(`getSectionList() found an existing view for section [${tmpSectionList[i].Hash}] so will be skipped.`);
			continue;
		}
		pPict.addView(tmpViewHash, { SectionDefinition: tmpSectionList[i], Manifests: { Section: pManifest } }, PictSectionForm);
	}

	return tmpSectionList;
}