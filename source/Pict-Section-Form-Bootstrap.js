// "What dependency injection in javascript?"
//  -- Ned
/**
 * Instantiates sections from a decorated Manyfest manifest.
 *
 * @param {Object} pPict - The Pict object.
 * @param {Object} pManifest - The manifest object.
 * @returns {Array} - An array of section definitions.
 */

module.exports = function(pPict, pManifest)
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
		let tmpViewConfiguration = JSON.parse(JSON.stringify(tmpSectionList[i]));
		if (!tmpViewConfiguration.hasOwnProperty('Manifests'))
		{
			tmpViewConfiguration.Manifests = {};
		}
		tmpViewConfiguration.Manifests.Section = pManifest;
		pPict.addView(tmpViewHash, tmpViewConfiguration, require('./Pict-Section-Form-View.js'));
	}

	return tmpSectionList;
};