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

		/** @type {import('pict') & { instantiateServiceProviderWithoutRegistration: (hash: string, options?: any, uuid?: string) => any }} */
		this.fable;
		/** @type {any} */
		this.log;
		/** @type {string} */
		this.UUID;

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

		this._SanitizeObjectKeyRegex = /[^a-zA-Z0-9_]/gi;
		this._SanitizeObjectKeyReplacement = '_';
		this._SanitizeObjectKeyInvalid = 'INVALID';
	}

	/**
	 * Clean a string of any characters to create a consistent object key.
	 *
	 * @param {string} pString = The string to clean.
	 * @return {string} the cleaned string, or a placeholder if the input is invalid
	 */
	sanitizeObjectKey(pString)
	{
		console.info('HELLOOOOO');
		if (typeof pString !== 'string' || pString.length < 1)
		{
			return this._SanitizeObjectKeyInvalid;
		}
		return pString.replace(this._SanitizeObjectKeyRegex, this._SanitizeObjectKeyReplacement);
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

				if (!('Groups' in pView.sectionDefinition))
				{
					pView.sectionDefinition.Groups = [];
				}
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
			tmpGroup.GroupIndex = i;
			if (!tmpGroup.hasOwnProperty('Layout'))
			{
				tmpGroup.Layout = 'Record';
			}
			// Check if the group has a Rows array.
			// TODO: Is no rows valid?  Maaaaaybe?  Layouts makes this compelling.
			if (!tmpGroup.hasOwnProperty('Rows') || !Array.isArray(tmpGroup.Rows))
			{
				tmpGroup.Rows = [];
			}

			// Check if the group has a supporting manifest and load it.
			if ('RecordManifest' in tmpGroup)
			{
				tmpGroup.supportingManifest = pView.fable.instantiateServiceProviderWithoutRegistration('Manifest', pView.options.Manifests.Section.ReferenceManifests[tmpGroup.RecordManifest]);
			}
			if (tmpGroup.supportingManifest)
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
					if (typeof(tmpGroup.RecordSetAddress) == 'string')
					{
						tmpInput.PictForm.InformaryContainerAddress = tmpGroup.RecordSetAddress;
					}
					tmpInput.RowIdentifierTemplateHash = '{~D:Record.RowID~}';
				}
			}

			// Check if there is a record set address; initialize it if it doesn't exist
			if (tmpGroup.RecordSetAddress)
			{
				let tmpMarshalDestinationObject = pView.getMarshalDestinationObject();
				let tmpRecordSetDataObjectExists = pView.sectionManifest.checkAddressExistsByHash(tmpMarshalDestinationObject, tmpGroup.RecordSetAddress);
				let tmpRecordSetDataObject = pView.sectionManifest.getValueAtAddress(tmpMarshalDestinationObject, tmpGroup.RecordSetAddress);
				if (!tmpRecordSetDataObjectExists)
				{
					pView.log.warn(`Automatically setting an empty array at [${tmpGroup.RecordSetAddress}].`);
					pView.sectionManifest.setValueByHash(tmpMarshalDestinationObject, tmpGroup.RecordSetAddress, []);
				}
				else if (Array.isArray(tmpRecordSetDataObject))
				{
					pView.log.trace(`RecordSetAddress is an Array for [${tmpGroup.Hash}]`);
				}
				else if (typeof(tmpRecordSetDataObject) === 'object')
				{
					pView.log.trace(`RecordSetAddress is an Object for [${tmpGroup.Hash}]`);
				}
				else
				{
					pView.log.error(`RecordSetAddress is not an Array or Object for [${tmpGroup.Hash}]; it is a [${typeof(tmpRecordSetDataObject)}] -- likely the data shape will cause erratic problems.`);
				}
			}
		}
	}

	/**
	 * Adds a manifest descriptor to the manifest.
	 *
	 * @param {Object} pManifestDescriptor - The manifest descriptor to add.
	 */
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
			this.log.error('Record is missing from record:', pRecord);
			return false;
		}
		if (!pRecord.Form)
		{
			this.log.error('Form is missing from record:', pRecord);
			return false;
		}
		return true;
	}

	/**
	 * Add a manifest descriptor from a tabular row.
	 *
	 * @param {Object} pManifestFactory - The manifest factory
	 * @param {Object} pRecord - The tabular row record -- expected to have at least a 'Form'
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

		if (tmpRecord['Input Notes'])
		{
			tmpDescriptor.PictForm.SpreadsheetNotes = tmpRecord['Input Notes'];
		}

		if ((tmpDescriptor.PictForm.InputType == 'Option') && (tmpRecord['Input Extra']))
		{
			let tmpOptionSet = [];
			let tmpOptionSetValues = tmpRecord['Input Extra'].split(',');

			for (let i = 0; i < tmpOptionSetValues.length; i++)
			{
				if (tmpOptionSetValues[i].trim() != '')
				{
					let tmpOptionSetValuePair = tmpOptionSetValues[i].split('^');
					if (tmpOptionSetValuePair.length == 2)
					{
						tmpOptionSet.push({ id:tmpOptionSetValuePair[0].trim(), text:tmpOptionSetValuePair[1].trim() });
					}
					else
					{
						tmpOptionSet.push({ id:tmpOptionSetValues[i].trim(), text:tmpOptionSetValues[i].trim() });
					}
				}
			}

			if (tmpOptionSet.length > 0)
			{
				tmpDescriptor.PictForm.SelectOptions = tmpOptionSet;
			}
		}

		// Verbose obtuse data validation.
		if ((`TriggerGroup` in tmpRecord) && (typeof(tmpRecord.TriggerGroup) === 'string') && (tmpRecord.TriggerGroup != '')
			&& (`TriggerAddress` in tmpRecord) && (typeof(tmpRecord.TriggerAddress) === 'string') && (tmpRecord.TriggerAddress != ''))
		{
			if (!Array.isArray(tmpDescriptor.PictForm.Providers))
			{
				tmpDescriptor.PictForm.Providers = [];
			}

			tmpDescriptor.PictForm.Providers.push('AutofillTriggerGroup')
			tmpDescriptor.PictForm.AutofillTriggerGroup = (
				{
					TriggerGroup: tmpRecord.TriggerGroup,
					TriggerAddress: tmpRecord.TriggerAddress,
					MarshalEmptyValues: tmpRecord.MarshalEmptyValues ? true : false
				});
		}

		if ((`Entity` in tmpRecord) && (typeof(tmpRecord.Entity) === 'string') && (tmpRecord.Entity != '')
			&& (`EntityColumnFilter` in tmpRecord) && (typeof(tmpRecord.EntityColumnFilter) === 'string') && (tmpRecord.EntityColumnFilter != '')
			&& (`EntityDestination` in tmpRecord) && (typeof(tmpRecord.EntityDestination) === 'string') && (tmpRecord.EntityDestination != ''))
		{
			if (!Array.isArray(tmpDescriptor.PictForm.Providers))
			{
				tmpDescriptor.PictForm.Providers = [];
			}

			tmpDescriptor.PictForm.Providers.push('AutofillTriggerGroup')
			tmpDescriptor.PictForm.EntitiesBundle = [
				{
					"Entity": tmpRecord.Entity,
					"Filter": `FBV~${tmpRecord.EntityColumnFilter}~EQ~{~D:Record.Value~}`,
					"Destination": tmpRecord.EntityDestination,
					// This marshals a single record
					"SingleRecord": tmpRecord.EntitySingleRecord ? true : false
				}
			]
		}

		// This is used for Section and Group, regardless of where the Descriptor goes.
		let tmpCoreManifestFactory = pManifestFactory;
		if ((`SubManifest` in tmpRecord) && (tmpRecord.SubManifest) && (tmpRecord.InputType != 'TabularAddress'))
		{
			tmpDescriptor.IsTabular = true;
			// Below is what amounts to complex pointer arithmatic.
			if (!(tmpRecord.SubManifest in pManifestFactory.manifest.ReferenceManifests))
			{
				// Build a reference manifest if it doesn't exist
				pManifestFactory.referenceManifestFactories[tmpRecord.SubManifest] = this.fable.instantiateServiceProviderWithoutRegistration('ManifestFactory', { Manifest: { Scope: tmpRecord.SubManifest } }, `${this.UUID}-${tmpRecord.SubManifest}`);
				pManifestFactory.manifest.ReferenceManifests[tmpRecord.SubManifest] = pManifestFactory.referenceManifestFactories[tmpRecord.SubManifest].manifest;
			}
			pManifestFactory = pManifestFactory.referenceManifestFactories[tmpRecord.SubManifest];
		}

		// Setup the Section and the Group
		const tmpSectionName = tmpRecord['Section Name'] ?? 'Default_Section';
		const tmpSectionHash = this.sanitizeObjectKey(tmpSectionName);
		tmpDescriptor.PictForm.Section = tmpSectionHash;
		const tmpSection = tmpCoreManifestFactory.getManifestSection(tmpSectionHash);
		if (tmpRecord['Section Name'])
		{
			tmpSection.Name = tmpRecord['Section Name'];
		}

		const tmpGroupName = tmpRecord['Group Name'] ?? 'Default_Group';
		const tmpGroupHash = this.sanitizeObjectKey(tmpGroupName);
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

		if (tmpRecord['Equation'])
		{
			this.log.trace(`Adding solver to ${tmpRecord.Form} --> ${tmpGroup.Name} for ${tmpRecord['Input Hash']}: ${tmpRecord['Equation']}`);
			if (tmpGroup.Layout == 'Tabular')
			{
				tmpGroup.RecordSetSolvers.push(tmpRecord['Equation']);
			}
			else
			{
				tmpSection.Solvers.push(tmpRecord['Equation']);
			}
		}

		this.onTabularRowAddDescriptor(tmpRecord, tmpSection, tmpGroup, tmpDescriptor);

		if (tmpRecord.DataOnly && tmpDescriptor.PictForm)
		{
			delete tmpDescriptor.PictForm;
		}

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
	 * This fires whenever a Tabular Row is adding a Descriptor to the Manifest.
	 *
	 * If you want to extend how descriptors are built, the code belongs in here.
	 *
	 * @param {Object} pIncomingDescriptor - The record for the descriptor being added (from a CSV or other source)
	 * @param {Object} pSection - The section object
	 * @param {Object} pGroup - The group object
	 * @param {Object} pNewDescriptor - The descriptor object
	 */
	onTabularRowAddDescriptor(pIncomingDescriptor, pSection, pGroup, pNewDescriptor)
	{
		// This is meant to be overloaded by the parent class
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
			this.log.info('Invalid records passed to generateManifests.');
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

		this.log.info(`Generated ${Object.keys(tmpManifests).length} manifests.`);

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
ManifestFactory.default_configuration = { };
