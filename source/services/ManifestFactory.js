const libFableServiceProviderBase = require('fable-serviceproviderbase');

const _DefaultManifestSettings = (
	{
		Manifest: { Scope: 'Default' }
	});

class ManifestFactory extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		// Intersect default options, parent constructor, service information
		let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(_DefaultManifestSettings)), pOptions);

		super(pFable, pOptions, pServiceHash);

		this.manifest = tmpOptions.Manifest;

		if (!('Descriptors' in this.manifest))
		{
			this.manifest.Descriptors = {};
		}
		if (!('Sections' in this.manifest))
		{
			this.manifest.Sections = [];
		}
		if (!('ReferenceManifests' in this.manifest))
		{
			this.manifest.ReferenceManifests = {};
		}
		this.referenceManifestFactories = {};

		let tmpReferenceManifestKeys = Object.keys(this.manifest.ReferenceManifests);
		for (let i = 0; i < tmpReferenceManifestKeys.length; i++)
		{
			this.referenceManifestFactories[tmpReferenceManifestKeys[i]] = this.fable.instantiateServiceProviderWithoutRegistration('ManifestFactory', this.manifest.ReferenceManifests[tmpReferenceManifestKeys[i]], `${this.UUID}-${tmpReferenceManifestKeys[i]}`);
		}

		// Keep track of a numeric index that's unique to this form, for autogenerating identifiers.
		this.defaultHashCounter = 0;
	}

	/**
	 * Initialize the form groups.
	 * 
	 * This function will initialize the form groups of a view based on the manifest.
	 * 
	 * TODO: Figure out if this is the best place for this.  It *is* pretty useful for
	 * inferring manifests, so has uses outside of the view lifecycle.
	 * 
	 * @param {Object} pView - The view to initialize form groups for
	 */
	initializeFormGroups(pView)
	{
		// Enumerate the manifest and make sure a group exists for each group in the section definition
		let tmpDescriptorKeys = Object.keys(pView.options.Manifests.Section.Descriptors);
		for (let i = 0; i < tmpDescriptorKeys.length; i++)
		{
			// TODO: Change this to use the parsed sectionManifest rather than parsing the manifest itself
			let tmpDescriptor = pView.options.Manifests.Section.Descriptors[tmpDescriptorKeys[i]];

			if (
					// If there is an obect in the descriptor
					typeof(tmpDescriptor) == 'object' &&
					// AND it has a PictForm property
					('PictForm' in tmpDescriptor) &&
					// AND the PictForm property is an object
					typeof(tmpDescriptor.PictForm) == 'object' &&
					// AND the PictForm object has a Section property
					('Section' in tmpDescriptor.PictForm) &&
					// AND the Section property matches our section hash
					tmpDescriptor.PictForm.Section == pView.sectionDefinition.Hash
				)
			{
				tmpDescriptor.PictForm.InformaryDataAddress = tmpDescriptorKeys[i];

				let tmpGroupHash = (typeof(tmpDescriptor.PictForm.Group) == 'string') ? tmpDescriptor.PictForm.Group : 'Default';
				let tmpGroup = pView.sectionDefinition.Groups.find((pGroup) => { return pGroup.Hash == tmpGroupHash; });
				if (!tmpGroup)
				{
					tmpGroup = { Hash: tmpGroupHash, Name: tmpGroupHash, Description: false, Rows: [] };
					pView.sectionDefinition.Groups.push(tmpGroup);
				}
				else if (!Array.isArray(tmpGroup.Rows))
				{
					tmpGroup.Rows = [];
				}

				let tmpRowHash = (typeof(tmpDescriptor.PictForm.Row) == 'string') ? tmpDescriptor.PictForm.Row :
								(typeof(tmpDescriptor.PictForm.Row) == 'number') ? `Row_${tmpDescriptor.PictForm.Row.toString()}` :
								'Row_Default';

				tmpDescriptor.PictForm.RowHash = tmpRowHash;

				let tmpRow = tmpGroup.Rows.find((pRow) => { return pRow.Hash == tmpRowHash; });

				if (!tmpRow)
				{
					tmpRow = { Hash: tmpRowHash, Name: tmpRowHash, Inputs: [] };
					tmpGroup.Rows.push(tmpRow);
					tmpRow.Inputs.push(tmpDescriptor);
				}
				else
				{
					tmpRow.Inputs.push(tmpDescriptor);
				}
			}
		}

		// Now check to see if we need to build group
		for (let i = 0; i < pView.sectionDefinition.Groups.length; i++)
		{
			let tmpGroup = pView.sectionDefinition.Groups[i];
			// Check the Group type and get the manifest if it is a RECORDSET-based group.
			// The three built-in set groups (Record, Tabular, Columnar) will do this or the
			// developer can set a property on Group called "GroupType" to "RecordSet" for
			// custom layouts.
			if ((tmpGroup.Layout === 'Tabular') ||
				(tmpGroup.GroupType === 'RecordSet'))
			{
				// Check for the supporting manifest
				if (!('RecordManifest' in tmpGroup))
				{
					pView.pict.log.error(`Dynamic View [${pView.UUID}]::[${pView.Hash}] Group ${tmpGroup.Hash} is classified as a RecordSet group but thee Group does not contain a RecordManifest property.`);
					tmpGroup.supportingManifest  = pView.fable.instantiateServiceProviderWithoutRegistration('Manifest');
				}
				else if (!('ReferenceManifests' in pView.options.Manifests.Section))
				{
					pView.pict.log.error(`Dynamic View [${pView.UUID}]::[${pView.Hash}] Group ${tmpGroup.Hash} is classified as a RecordSet group but there are no ReferenceManifests in the Section description Manifest.`);
					tmpGroup.supportingManifest  = pView.fable.instantiateServiceProviderWithoutRegistration('Manifest');
				}
				else if (!(tmpGroup.RecordManifest in pView.options.Manifests.Section.ReferenceManifests))
				{
					pView.pict.log.error(`Dynamic View [${pView.UUID}]::[${pView.Hash}] Group ${tmpGroup.Hash} is classified as a RecordSet group and has a RecordManifest of [${tmpGroup.RecordManifest}] but the Section.ReferenceManifests object does not contain the referred to manifest.`);
					tmpGroup.supportingManifest  = pView.fable.instantiateServiceProviderWithoutRegistration('Manifest');
				}
				else
				{
					tmpGroup.supportingManifest = pView.fable.instantiateServiceProviderWithoutRegistration('Manifest', pView.options.Manifests.Section.ReferenceManifests[tmpGroup.RecordManifest]);
				}
			}
			if (tmpGroup.supportingManifest && (typeof(tmpGroup.RecordSetAddress) == 'string'))
			{
				let tmpSupportingManifestDescriptorKeys = Object.keys(tmpGroup.supportingManifest.elementDescriptors);
				for (let k = 0; k < tmpSupportingManifestDescriptorKeys.length; k++)
				{
					let tmpInput = tmpGroup.supportingManifest.elementDescriptors[tmpSupportingManifestDescriptorKeys[k]];

					if (!('PictForm' in tmpInput))
					{
						tmpInput.PictForm = {};
					}

					tmpInput.PictForm.InformaryDataAddress = tmpSupportingManifestDescriptorKeys[k];
					tmpInput.PictForm.InformaryContainerAddress = tmpGroup.RecordSetAddress;
					tmpInput.RowIdentifierTemplateHash = '{~D:Record.RowID~}';
				}
			}
		}
	}

	addDescriptor(pManifestDescriptor)
	{
		if (pManifestDescriptor.DataAddress in this.manifest.Descriptors)
		{
			console.info('[ERROR] Duplicate descriptor hash found:', pManifestDescriptor);
		}
		this.manifest.Descriptors[pManifestDescriptor.DataAddress] = pManifestDescriptor;
	}

	/**
	 * Get a section from the manifest.
	 *
	 * @param {string} pSectionHash - The section Hash
	 *
	 * @return {Object} The manifest section object
	 */
	getManifestSection(pSectionHash)
	{
		for (const tmpSection of this.manifest.Sections)
		{
			if (tmpSection.Hash === pSectionHash)
			{
				return tmpSection;
			}
		}
		// Add the section if it do no exist
		const tmpSection = { Name:pSectionHash, Hash:pSectionHash, Solvers:[], Groups:[] };
		this.manifest.Sections.push(tmpSection);
		return tmpSection;
	}

	/**
	 * Get a group from a section.
	 *
	 * @param {string|Object} pManifestSection - The manifest Section -- either a Hash string or the object itself
	 * @param {string} pGroupHash - The group Hash
	 *
	 * @return {Object} The group object
	 */
	getManifestGroup(pManifestSection, pGroupHash)
	{
		let tmpManifestSection = (typeof(pManifestSection) === 'string') ? this.getManifestSection(pManifestSection) : pManifestSection;
		for (const tmpGroup of tmpManifestSection.Groups)
		{
			if (tmpGroup.Hash === pGroupHash)
			{
				return tmpGroup;
			}
		}
		// Add the group if it do no exist
		const tmpGroup = { Name:pGroupHash, Hash:pGroupHash, Rows:[], RecordSetSolvers:[] };
		tmpManifestSection.Groups.push(tmpGroup);
		return tmpGroup;
	}

	/**
	 * Lints a manifest record row.
	 * @param {Object} pRecord - The record to be linted.
	 * @returns {boolean} - Returns true if the record is valid, false otherwise.
	 */
	tabularRowLint(pRecord)
	{
		if (!pRecord)
		{
			this.fable.log.error('Record is missing from record:', pRecord);
			return false;
		}
		if (!pRecord.Form)
		{
			this.fable.log.error('Form is missing from record:', pRecord);
			return false;
		}
		return true;
	}

	/**
	 * Add a manifest descriptor from a tabular row.
	 *
	 * @param {Object} tmpRecord - The tabular row record -- expected to have at least a 'Form'
	 *
	 * @return {Object} the descriptor
	 */
	tabularRowAddDescriptor(pManifestFactory, pRecord)
	{
		if (typeof(pRecord) !== 'object')
		{
			this.log.error(`Invalid record passed to addManifestDescriptor: ${pRecord}`);
			return false;
		}

		let tmpRecord = JSON.parse(JSON.stringify(pRecord));

		// Fill out required defaults on the row
		tmpRecord['Input Hash'] = tmpRecord['Input Hash'] ?? `DefaultHash${this.defaultHashCounter++}`;
		tmpRecord['Input Address'] = tmpRecord['Input Address'] ?? `DefaultData.InputHash_${tmpRecord['Input Hash']}`;
		tmpRecord['Input Name'] = tmpRecord['Input Name'] ?? `Auto Input ${tmpRecord['Input Hash']}`;
		tmpRecord.DataType = tmpRecord.DataType ?? 'String';

		const tmpDescriptor = (
			{
				Hash: tmpRecord['Input Hash'],
				Name: tmpRecord['Input Name'],
				DataAddress: tmpRecord['Input Address'],
				DataType: tmpRecord.DataType,
				PictForm: {},
			});

		if (tmpRecord.Default)
		{
			tmpDescriptor.Default = tmpRecord.Default;
		}

		// Set the optional settings if they are present on the record
		if (tmpRecord.InputType)
		{
			tmpDescriptor.PictForm.InputType = tmpRecord.InputType;
		}
		if (tmpRecord.Row)
		{
			tmpDescriptor.PictForm.Row = tmpRecord.Row;
		}
		if (tmpRecord.Width)
		{
			tmpDescriptor.PictForm.Width = tmpRecord.Width;
		}

		if (tmpRecord.Units)
		{
			tmpDescriptor.PictForm.Units = tmpRecord.Units;
		}
		if (tmpRecord['Input Notes'])
		{
			tmpDescriptor.PictForm.SpreadsheetNotes = tmpRecord['Input Notes'];
		}

		let tmpIsTabular = false;
		// This is used for Section and Group, regardless of where the Descriptor goes.
		let tmpCoreManifestFactory = pManifestFactory;
		if ((`SubManifest` in tmpRecord) && (tmpRecord.SubManifest) && (tmpRecord.InputType != 'TabularAddress'))
		{
			// Below is what amounts to complex pointer arithmatic.
			if (!(tmpRecord.SubManifest in pManifestFactory.manifest.ReferenceManifests))
			{
				// Build a reference manifest if it doesn't exist
				pManifestFactory.referenceManifestFactories[tmpRecord.SubManifest] = this.fable.instantiateServiceProviderWithoutRegistration('ManifestFactory', { Manifest: { Scope: tmpRecord.SubManifest } }, `${this.UUID}-${tmpRecord.SubManifest}`);
				pManifestFactory.manifest.ReferenceManifests[tmpRecord.SubManifest] = pManifestFactory.referenceManifestFactories[tmpRecord.SubManifest].manifest;
			}
			pManifestFactory = pManifestFactory.referenceManifestFactories[tmpRecord.SubManifest];
			tmpIsTabular = true;
		}

		// Setup the Section and the Group
		const tmpSectionName = tmpRecord['Section Name'] ?? 'Default_Section';
		const tmpSectionHash = this.fable.DataFormat.cleanNonAlphaCharacters(tmpSectionName);
		tmpDescriptor.PictForm.Section = tmpSectionHash;
		const tmpSection = tmpCoreManifestFactory.getManifestSection(tmpSectionHash);
		if (tmpRecord['Section Name'])
		{
			tmpSection.Name = tmpRecord['Section Name'];
		}
		if (tmpRecord['Equation'])
		{
			tmpSection.Solvers.push(tmpRecord['Equation']);
		}

		const tmpGroupName = tmpRecord['Group Name'] ?? 'Default_Group';
		const tmpGroupHash = this.fable.DataFormat.cleanNonAlphaCharacters(tmpGroupName);
		tmpDescriptor.PictForm.Group = tmpGroupHash;
		const tmpGroup = tmpCoreManifestFactory.getManifestGroup(tmpSection, tmpGroupHash);
		if (tmpRecord['Group Name'])
		{
			tmpGroup.Name = tmpRecord['Group Name'];
		}
		if (tmpDescriptor.Hash in pManifestFactory.manifest.Descriptors)
		{
			console.info(`[ERROR] Duplicate descriptor hash found ${tmpDescriptor.Hash}.  This will overwrite the original descriptor.`);
		}
		// Now checking if the group is Tabular -- if it is we need to set some extra values on the Group and have solvers occur inline
		// Layout: "Tabular",
		// RecordSetSolvers: [
		// 	{
		// 		Ordinal: 0,
		// 		Expression: "PercentTotalFat = (Fat * 9) / Calories",
		// 	},
		// ],
		// RecordSetAddress: "FruitData.FruityVice",
		// RecordManifest: "FruitEditor",
		if (tmpRecord.InputType == 'TabularAddress')
		{
			tmpGroup.Layout = 'Tabular';
			tmpGroup.RecordSetAddress = tmpDescriptor.DataAddress;
			tmpGroup.RecordManifest = tmpRecord.SubManifest;
		}

		// if (tmpRecord.DataOnly)
		// {
		// 	delete tmpDescriptor.PictForm;
		// }

		if (tmpRecord.InputType != 'TabularAddress')
		{
			pManifestFactory.addDescriptor(tmpDescriptor);
		}
		else
		{
			tmpCoreManifestFactory.addDescriptor(tmpDescriptor);
		}

		return tmpDescriptor;
	}

	/**
	 * Create some manifests with a "factory" pattern.
	 *
	 * @param {any} pRecords - The records as an array of objects
	 *
	 * @return {any} the manifests
	 */
	createManifestsFromTabularArray(pRecords)
	{
		if (!pRecords || !Array.isArray(pRecords))
		{
			this.fable.log.info('Invalid records passed to generateManifests.');
			return {};
		}

		const tmpManifests = {};

		for (let i = 0; i < pRecords.length; i++)
		{
			let tmpRecord = pRecords[i];

			// Lint the row we are parsing
			if (!this.tabularRowLint(tmpRecord))
			{
				continue;
			}

			if (!tmpManifests[tmpRecord.Form])
			{
				// Create the manifest if one doesn't exist
				tmpManifests[tmpRecord.Form] = this.fable.instantiateServiceProviderWithoutRegistration('ManifestFactory',
					{
						Manifest: 
							{
								Form:tmpRecord.Form
							}
					}, `${this.UUID}-${tmpRecord.Form}`);
			}

			const tmpManifest = tmpManifests[tmpRecord.Form];

			// Check if there is a Form Name to be set
			if (tmpRecord['Form Name'])
			{
				tmpManifest.FormName = tmpRecord['Form Name'];
			}
			if (tmpRecord['Input Hash'])
			{
				this.tabularRowAddDescriptor(tmpManifest, tmpRecord);
			}
		}

		this.fable.log.info(`Generated ${Object.keys(tmpManifests).length} manifests.`);

		let tmpManifestKeys = Object.keys(tmpManifests);
		let tmpOutputManifests = {};
		for (let i = 0; i < tmpManifestKeys.length; i++)
		{
			tmpOutputManifests[tmpManifestKeys[i]] = tmpManifests[tmpManifestKeys[i]].manifest;
		}
		return tmpOutputManifests;
	}
}

module.exports = ManifestFactory;