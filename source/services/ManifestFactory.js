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
		const tmpGroup = { Name: pGroupHash, Hash: pGroupHash, Rows: [] };
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

		if ((`SubManifest` in tmpRecord) && (tmpRecord.SubManifest))
		{
			if (!(tmpRecord.SubManifest in this.manifest.ReferenceManifests))
			{
				// Build a reference manifest if it doesn't exist
				this.referenceManifestFactories[tmpRecord.SubManifest] = this.fable.instantiateServiceProviderWithoutRegistration('ManifestFactory', { Manifest: { Scope: tmpRecord.SubManifest } }, `${this.UUID}-${tmpRecord.SubManifest}`);
				// Pointer arithmatic?
				this.manifest.ReferenceManifests[tmpRecord.SubManifest] = this.referenceManifestFactories[tmpRecord.SubManifest].manifest;
			}
			pManifestFactory = this.referenceManifestFactories[tmpRecord.SubManifest];
		}

		// Setup the Section and the Group
		const tmpSectionName = tmpRecord['Section Name'] ?? 'Default_Section';
		const tmpSectionHash = this.fable.DataFormat.cleanNonAlphaCharacters(tmpSectionName);
		tmpDescriptor.PictForm.Section = tmpSectionHash;
		const tmpSection = pManifestFactory.getManifestSection(tmpSectionHash);
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
		const tmpGroup = pManifestFactory.getManifestGroup(tmpSection, tmpGroupHash);
		if (tmpRecord['Group Name'])
		{
			tmpGroup.Name = tmpRecord['Group Name'];
		}
		if (tmpDescriptor.Hash in pManifestFactory.manifest.Descriptors)
		{
			console.info(`[ERROR] Duplicate descriptor hash found ${tmpDescriptor.Hash}.  This will overwrite the original descriptor.`);
		}

		pManifestFactory.addDescriptor(tmpDescriptor);

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