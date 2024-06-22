const libPictViewClass = require('pict-view');

const libInformary = require('../providers/Pict-Provider-Informary.js');
const libDynamicSolver = require('../providers/Pict-Provider-DynamicSolver.js');
const libFormsTemplateProvider = require('../providers/Pict-Provider-DynamicTemplates.js');

class PictViewDynamicForm extends libPictViewClass
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, require('./Pict-View-DynamicForm-DefaultConfiguration.json'), pOptions);

		if (!tmpOptions.Manifests)
		{
			throw new Error('PictSectionForm instantiation attempt without a Manifests in pOptions.Manifest -- cannot instantiate.');
		}
		if (!('Section' in tmpOptions.Manifests))
		{
			throw new Error('PictSectionForm instantiation attempt without a Section manifest in pOptions.Manifests -- cannot instantiate.');
		}

		// Set the default destination address to be based on the section hash if it hasn't been overridden by the manifest section definition
		if (tmpOptions.DefaultDestinationAddress === '#Pict-Form-Container')
		{
			tmpOptions.DefaultDestinationAddress = `#Pict-Form-Container-${tmpOptions.Hash}`;
		}

		// Set the default renderable to be based on the section hash if it hasn't been overridden by the manifest section definition
		if (tmpOptions.DefaultRenderable === 'Form-Main')
		{
			tmpOptions.DefaultRenderable = `Form-${tmpOptions.Hash}`;
		}

		// Set the template hash (which is the section-specific template prefix) if it hasn't been overridden by the manifest section definition
		if (!tmpOptions.SectionTemplateHash)
		{
			tmpOptions.SectionTemplateHash = `Pict-Form-Template-${tmpOptions.Hash}`;
		}

		// Create a renderable if none exist
		if (tmpOptions.Renderables.length < 1)
		{
			tmpOptions.Renderables.push(
				{
					RenderableHash: tmpOptions.DefaultRenderable,
					TemplateHash: tmpOptions.SectionTemplateHash,
					RenderMethod: 'replace'
				});
		}

		// Now construct the view.
		super(pFable, tmpOptions, pServiceHash);

		// Pull in the section definition
		this.sectionDefinition = this.options;
	
		// Initialize the section manifest -- instantiated to live only the lifecycle of this view
		this.sectionManifest = this.fable.instantiateServiceProviderWithoutRegistration('Manifest', this.options.Manifests.Section);

		// Shift solvers to an array of tasks
		this.sectionSolvers = [];
		// Pull in solvers
		if (('Solvers' in this.options) && Array.isArray(this.options.Solvers))
		{
			for (let i = 0; i < this.options.Solvers.length; i++)
			{
				if (typeof(this.options.Solvers[i]) === 'string')
				{
					this.sectionSolvers.push(this.options.Solvers[i]);
				}
			}
		}

		if (!this.pict.providers.PictFormSectionDefaultTemplateProvider)
		{
			let tmpDefaultTemplateProvider = this.pict.addProvider('PictFormSectionDefaultTemplateProvider', libFormsTemplateProvider.default_configuration, libFormsTemplateProvider);
			tmpDefaultTemplateProvider.initialize();
		}
		if (!this.pict.providers.Informary)
		{
			let tmpInformary = this.pict.addProvider('Informary', libInformary.default_configuration, libInformary);
			tmpInformary.initialize();
		}
		if (!this.pict.providers.DynamicSolver)
		{
			let tmpDynamicSolver = this.pict.addProvider('DynamicSolver', libDynamicSolver.default_configuration, libDynamicSolver);
			tmpDynamicSolver.initialize();
		}

		// Load any view section-specific templates
		this.formsTemplateSetPrefix = `PFT-${this.Hash}-${this.UUID}`;
		if (('MetaTemplates' in this.options) && Array.isArray(this.options.MetaTemplates))
		{
			for (let i = 0; i < this.options.MetaTemplates.length; i++)
			{
				let tmpMetaTemplate = this.options.MetaTemplates[i];

				if (('HashPostfix' in tmpMetaTemplate) && ('Template' in tmpMetaTemplate))
				{
					let tmpTemplateHash = `${this.formsTemplateSetPrefix}${tmpMetaTemplate.HashPostfix}`;
					this.pict.TemplateProvider.addTemplate(tmpTemplateHash, tmpMetaTemplate.Template);
				}
				else
				{
					this.log.warn(`MetaTemplate entry ${i} in PictSectionForm [${this.UUID}]::[${this.Hash}] does not have a Hash and Template property; custom template skipped.`);
				}
			}
		}
		// The default template prefix
		this.defaultTemplatePrefix = 'Pict-Forms-Basic';

		this.formID = `Pict-Form-${this.Hash}-${this.UUID}`;

		this.viewMarshalDestination = false;

		this.initializeFormGroups();
	}

	dataChanged(pInputHash)
	{
		let tmpInput = this.getInputFromHash(pInputHash);
 		// This is what is called whenever a hash is changed.  We could marshal from view, solve and remarshal to view.
		// TODO: Make this more specific to the input hash.  Should be trivial with new informary.
		if (pInputHash)
		{
			// The informary stuff doesn't know the resolution of the hash to address, so do it here.
			let tmpHashAddress = this.sectionManifest.resolveHashAddress(pInputHash);
			try
			{
				let tmpMarshalDestinationObject = this.getMarshalDestinationObject();
				this.pict.providers.Informary.marshalFormToData(tmpMarshalDestinationObject, this.formID, this.sectionManifest, tmpHashAddress);
				// Now run any providers connected to this input
				if (tmpInput && tmpInput.PictForm && ('Providers' in tmpInput.PictForm) && Array.isArray(tmpInput.PictForm.Providers))
				{
					let tmpValue = this.sectionManifest.getValueByHash(tmpMarshalDestinationObject, tmpHashAddress);
					for (let i = 0; i < tmpInput.PictForm.Providers.length; i++)
					{
						if (this.pict.providers[tmpInput.PictForm.Providers[i]])
						{
							this.pict.providers[tmpInput.PictForm.Providers[i]].onDataChange(this, tmpInput, tmpValue, tmpInput.Macro.HTMLSelector);
						}
						else
						{
							this.log.error(`Dynamic form [${this.Hash}]::[${this.UUID}] cannot find provider [${tmpInput.PictForm.Providers[i]}] for input [${tmpInput.Hash}].`);
						}
					}
				}
			}
			catch (pError)
			{
				this.log.error(`Dynamic form [${this.Hash}]::[${this.UUID}] gross error marshaling specific (${pInputHash}) data from view in dataChanged event: ${pError}`);
			}
		}
		else
		{
			this.marshalFromView();
		}
		// Run any dynamic input providers for the input hash.
		this.pict.PictApplication.solve();
		this.marshalToView();
	}

	dataChangedTabular(pGroupIndex, pInputIndex, pRowIndex)
	{
		let tmpInput = this.getTabularRecordInput(pGroupIndex, pInputIndex);
		if (pGroupIndex && pInputIndex && pRowIndex && tmpInput)
		{
			// The informary stuff doesn't know the resolution of the hash to address, so do it here.
			let tmpHashAddress = tmpInput.Address;
			try
			{
				let tmpMarshalDestinationObject = this.getMarshalDestinationObject();
				this.pict.providers.Informary.marshalFormToData(tmpMarshalDestinationObject, this.formID, this.sectionManifest, tmpHashAddress, pRowIndex);

				// Now run any providers connected to this input
				if (tmpInput && tmpInput.PictForm && ('Providers' in tmpInput.PictForm) && Array.isArray(tmpInput.PictForm.Providers))
				{
					// TODO: Can we simplify this?
					let tmpValueAddress = this.pict.providers.Informary.getComposedContainerAddress(tmpInput.PictForm.InformaryContainerAddress, pRowIndex, tmpInput.PictForm.InformaryDataAddress);
					let tmpValue = this.sectionManifest.getValueByHash(tmpMarshalDestinationObject, tmpValueAddress);
					// Each row has a distinct address!
					let tmpVirtualInformaryHTMLSelector = tmpInput.Macro.HTMLSelectorTabular+`[data-i-index="${pRowIndex}"]`;
					for (let i = 0; i < tmpInput.PictForm.Providers.length; i++)
					{
						if (this.pict.providers[tmpInput.PictForm.Providers[i]])
						{
							this.pict.providers[tmpInput.PictForm.Providers[i]].onDataChangeTabular(this, tmpInput, tmpValue, tmpVirtualInformaryHTMLSelector, pRowIndex);
						}
						else
						{
							this.log.error(`Dynamic form [${this.Hash}]::[${this.UUID}] cannot find provider [${tmpInput.PictForm.Providers[i]}] for input [${tmpInput.Hash}] row ${pRowIndex}.`);
						}
					}
				}
			}
			catch (pError)
			{
				this.log.error(`Dynamic form [${this.Hash}]::[${this.UUID}] gross error marshaling specific (${pInputHash}) tabular data for group ${pGroupIndex} row ${pRowIndex} from view in dataChanged event: ${pError}`);
			}
		}
		else
		{
			// This is what is called whenever a hash is changed.  We could marshal from view, solve and remarshal to view.
			this.marshalFromView();
		}
		// Run any dynamic input providers for the input hash.
		this.pict.PictApplication.solve();
		this.marshalToView();
	}

	getMarshalDestinationAddress()
	{
		if (this.viewMarshalDestination)
		{
			return this.viewMarshalDestination;
		}
		else if (this.pict.views.PictFormMetacontroller && this.pict.views.PictFormMetacontroller.viewMarshalDestination)
		{
			return this.pict.views.PictFormMetacontroller.viewMarshalDestination;
		}
		else
		{
			return 'AppData';
		}
	}

	getMarshalDestinationObject()
	{
		let tmpMarshalDestinationObject = false;
		if (this.viewMarshalDestination)
		{
			tmpMarshalDestinationObject = this.sectionManifest.getValueAtAddress(this, this.viewMarshalDestination);
		}
		else if (this.pict.views.PictFormMetacontroller && this.pict.views.PictFormMetacontroller.viewMarshalDestination)
		{
			tmpMarshalDestinationObject = this.sectionManifest.getValueAtAddress(this, this.pict.views.PictFormMetacontroller.viewMarshalDestination);

			if (!tmpMarshalDestinationObject)
			{
				// Try to create an empty object.
				if (this.sectionManifest.setValueAtAddress(this, this.pict.views.PictFormMetacontroller.viewMarshalDestination, {}))
				{
					// And try to load it once more!
					tmpMarshalDestinationObject = this.sectionManifest.getValueAtAddress(this, this.pict.views.PictFormMetacontroller.viewMarshalDestination);
				}
			}
		}

		if (typeof(tmpMarshalDestinationObject) != 'object')
		{
			this.log.error(`Marshal destination object is not an object; if you initialize the view yourself you must set the viewMarshalDestination property to a valid address within the view.  Falling back to AppData.`);
			tmpMarshalDestinationObject = this.pict.AppData;
		}

		return tmpMarshalDestinationObject;
	}

	onMarshalToView()
	{
		// TODO: Only marshal data that has changed since the last marshal.  Thought experiment: who decides what changes happened?
		try
		{
			let tmpMarshalDestinationObject = this.getMarshalDestinationObject();
			this.pict.providers.Informary.marshalDataToForm(tmpMarshalDestinationObject, this.formID, this.sectionManifest);
			this.runInputProviderFunctions('onDataMarshalToForm');
		}
		catch (pError)
		{
			this.log.error(`Gross error marshaling data to view: ${pError}`);
		}
		return super.onMarshalToView();
	}

	onMarshalFromView()
	{
		try
		{
			let tmpMarshalDestinationObject = this.getMarshalDestinationObject();
			this.pict.providers.Informary.marshalFormToData(tmpMarshalDestinationObject, this.formID, this.sectionManifest);
		}
		catch (pError)
		{
			this.log.error(`Gross error marshaling data from view: ${pError}`);
		}
		return super.onMarshalFromView();
	}

	onSolve()
	{
		this.pict.providers.DynamicSolver.solveViews([this.Hash]);

		if (this.options.AutoMarshalDataOnSolve)
		{
			this.marshalToView();
		}
		return super.onSolve();
	}

	onAfterRender()
	{
		this.runInputProviderFunctions('onInputInitialize');
	}

	runInputProviderFunctions(pFunctionName)
	{
		// Check to see if there are any hooks set from the input templates
		for (let i = 0; i < this.sectionDefinition.Groups.length; i++)
		{
			let tmpGroup = this.sectionDefinition.Groups[i];

			if (Array.isArray(tmpGroup.Rows))
			{
				for (let j = 0; j < tmpGroup.Rows.length; j++)
				{
					// TODO: Do we want row macros?  Let's be still and find out.
					let tmpRow = tmpGroup.Rows[j];
					for (let k = 0; k < tmpRow.Inputs.length; k++)
					{
						let tmpInput = tmpRow.Inputs[k];
						// Now run any providers connected to this input
						if (tmpInput && tmpInput.PictForm && ('Providers' in tmpInput.PictForm) && Array.isArray(tmpInput.PictForm.Providers))
						{
							for (let i = 0; i < tmpInput.PictForm.Providers.length; i++)
							{
								if (this.pict.providers[tmpInput.PictForm.Providers[i]])
								{
									let tmpHashAddress = this.sectionManifest.resolveHashAddress(tmpInput.Hash);
									let tmpValue = this.sectionManifest.getValueByHash(this.getMarshalDestinationObject(), tmpHashAddress);
									this.pict.providers[tmpInput.PictForm.Providers[i]][pFunctionName](this, tmpGroup, j, tmpInput, tmpValue, tmpInput.Macro.HTMLSelector);
								}
								else
								{
									this.log.error(`Dynamic form [${this.Hash}]::[${this.UUID}] cannot find provider [${tmpInput.PictForm.Providers[i]}] for input [${tmpInput.Hash}].`);
								}
							}
						}
					}
				}
			}

			if (tmpGroup.supportingManifest)
			{
				let tmpSupportingManifestDescriptorKeys = Object.keys(tmpGroup.supportingManifest.elementDescriptors);
				for (let k = 0; k < tmpSupportingManifestDescriptorKeys.length; k++)
				{
					let tmpTabularRecordSet = this.getTabularRecordSet(tmpGroup.GroupIndex);
					// No data in the record set, no events to push to providers.
					if (!tmpTabularRecordSet)
					{
						continue;
					}

					let tmpTabularRecordSetLength = 0;

					if (Array.isArray(tmpTabularRecordSet))
					{
						let tmpInput = tmpGroup.supportingManifest.elementDescriptors[tmpSupportingManifestDescriptorKeys[k]];
						// Now run any providers connected to this input
						if (tmpInput && tmpInput.PictForm && ('Providers' in tmpInput.PictForm))
						{
							for (let i = 0; i < tmpInput.PictForm.Providers.length; i++)
							{
								for (let r = 0; r < tmpTabularRecordSet.length; r++)
								{
									if (this.pict.providers[tmpInput.PictForm.Providers[i]])
									{
										// There is a provider, we have an input and it is supposed to be run through for a record
										let tmpValueAddress = this.pict.providers.Informary.getComposedContainerAddress(tmpInput.PictForm.InformaryContainerAddress, r, tmpInput.PictForm.InformaryDataAddress);
										let tmpValue = this.sectionManifest.getValueByHash(this.getMarshalDestinationObject(), tmpValueAddress);
										this.pict.providers[tmpInput.PictForm.Providers[i]][pFunctionName+'Tabular'](this, tmpGroup, tmpInput, tmpValue, tmpInput.Macro.HTMLSelectorTabular, r);
									}
									else
									{
										this.log.error(`Dynamic form [${this.Hash}]::[${this.UUID}] cannot find provider [${tmpInput.PictForm.Providers[i]}] for input [${tmpInput.Hash}].`);
									}
								}
							}
						}
					}
					else if (typeof(tmpTabularRecordSet) === 'object')
					{
						let tmpRecordSetKeys = Object.keys(tmpTabularRecordSet);
						let tmpInput = tmpGroup.supportingManifest.elementDescriptors[tmpSupportingManifestDescriptorKeys[k]];
						// Now run any providers connected to this input
						if (tmpInput && tmpInput.PictForm && ('Providers' in tmpInput.PictForm))
						{
							for (let i = 0; i < tmpInput.PictForm.Providers.length; i++)
							{
								for (let r = 0; r < tmpRecordSetKeys.length; r++)
								{
									if (this.pict.providers[tmpInput.PictForm.Providers[i]])
									{
										// There is a provider, we have an input and it is supposed to be run through for a record
										let tmpValueAddress = this.pict.providers.Informary.getComposedContainerAddress(tmpInput.PictForm.InformaryContainerAddress, tmpRecordSetKeys[r], tmpInput.PictForm.InformaryDataAddress);
										let tmpValue = this.sectionManifest.getValueByHash(this.getMarshalDestinationObject(), tmpValueAddress);
										this.pict.providers[tmpInput.PictForm.Providers[i]][pFunctionName+'Tabular'](this, tmpGroup, tmpInput, tmpValue, tmpInput.Macro.HTMLSelectorTabular, tmpRecordSetKeys[r]);
									}
									else
									{
										this.log.error(`Dynamic form [${this.Hash}]::[${this.UUID}] cannot find provider [${tmpInput.PictForm.Providers[i]}] for input [${tmpInput.Hash}].`);
									}
								}
							}
						}
					}

				}
			}
		}		
	}

	onAfterMarshalToForm()
	{
		// Check to see if there are any hooks set from the input templates
		this.runInputProviderFunctions('onAfterMarshalToForm');
	}

	initializeFormGroups()
	{
		// Enumerate the manifest and make sure a group exists for each group in the section definition
		let tmpDescriptorKeys = Object.keys(this.options.Manifests.Section.Descriptors);
		for (let i = 0; i < tmpDescriptorKeys.length; i++)
		{
			// TODO: Change this to use the parsed sectionManifest rather than parsing the manifest itself
			let tmpDescriptor = this.options.Manifests.Section.Descriptors[tmpDescriptorKeys[i]];

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
					tmpDescriptor.PictForm.Section == this.sectionDefinition.Hash
				)
			{
				tmpDescriptor.PictForm.InformaryDataAddress = tmpDescriptorKeys[i];

				let tmpGroupHash = (typeof(tmpDescriptor.PictForm.Group) == 'string') ? tmpDescriptor.PictForm.Group : 'Default';
				
				let tmpGroup = this.sectionDefinition.Groups.find((pGroup) => { return pGroup.Hash == tmpGroupHash; });

				if (!tmpGroup)
				{
					tmpGroup = { Hash: tmpGroupHash, Name: tmpGroupHash, Description: false, Rows: [] };
					this.sectionDefinition.Groups.push(tmpGroup);
				}
				else if (!Array.isArray(tmpGroup.Rows))
				{
					tmpGroup.Rows = [];
				}

				// Check the Group type and get the manifest if it is a RECORDSET-based group.
				// The three built-in set groups (Record, Tabular, Columnar) will do this or the
				// developer can set a property on Group called "GroupType" to "RecordSet" for
				// custom layouts.
				if (((tmpGroup.Layout === 'Tabular') || (tmpGroup.Layout === 'Tabular') || (tmpGroup.Layout === 'Tabular')) ||
					(tmpGroup.GroupType === 'RecordSet'))
				{
					// Check for the supporting manifest
					if (!('RecordManifest' in tmpGroup))
					{
						this.pict.log.error(`Dynamic View [${this.UUID}]::[${this.Hash}] Group ${tmpGroup.Hash} is classified as a RecordSet group but thee Group does not contain a RecordManifest property.`);
						tmpGroup.supportingManifest  = this.fable.instantiateServiceProviderWithoutRegistration('Manifest');
					}
					else if (!('ReferenceManifests' in this.options.Manifests.Section))
					{
						this.pict.log.error(`Dynamic View [${this.UUID}]::[${this.Hash}] Group ${tmpGroup.Hash} is classified as a RecordSet group but there are no ReferenceManifests in the Section description Manifest.`);
						tmpGroup.supportingManifest  = this.fable.instantiateServiceProviderWithoutRegistration('Manifest');
					}
					else if (!(tmpGroup.RecordManifest in this.options.Manifests.Section.ReferenceManifests))
					{
						this.pict.log.error(`Dynamic View [${this.UUID}]::[${this.Hash}] Group ${tmpGroup.Hash} is classified as a RecordSet group and has a RecordManifest of [${tmpGroup.RecordManifest}] but the Section.ReferenceManifests object does not contain the referred to manifest.`);
						tmpGroup.supportingManifest  = this.fable.instantiateServiceProviderWithoutRegistration('Manifest');
					}
					else
					{
						tmpGroup.supportingManifest = this.fable.instantiateServiceProviderWithoutRegistration('Manifest', this.options.Manifests.Section.ReferenceManifests[tmpGroup.RecordManifest]);
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
	}

	rebuildMacros()
	{
		if (!('MacroTemplates' in this.options))
		{
			return false;
		}

		// Section macros
		let tmpSectionMacroKeys = Object.keys(this.options.MacroTemplates.Section);
		if (typeof(this.sectionDefinition.Macro) !== 'object')
		{
			this.sectionDefinition.Macro = {};
		}
		for (let n = 0; n < tmpSectionMacroKeys.length; n++)
		{
			this.sectionDefinition.Macro[tmpSectionMacroKeys[n]] = this.pict.parseTemplate (this.options.MacroTemplates.Section[tmpSectionMacroKeys[n]], this.sectionDefinition, null, [this]);
		}
		for (let i = 0; i < this.sectionDefinition.Groups.length; i++)
		{
			let tmpGroup = this.sectionDefinition.Groups[i];
			// Group Macros
			let tmpGroupMacroKeys = Object.keys(this.options.MacroTemplates.Group);
			if (!('Macro'  in tmpGroup))
			{
				tmpGroup.Macro = {};
			}
			for (let n = 0; n < tmpGroupMacroKeys.length; n++)
			{
				tmpGroup.Macro[tmpGroupMacroKeys[n]] = this.pict.parseTemplate (this.options.MacroTemplates.Group[tmpGroupMacroKeys[n]], tmpGroup, null, [this]);
			}

			if (!Array.isArray(tmpGroup.Rows))
			{
				continue;
			}

			for (let j = 0; j < tmpGroup.Rows.length; j++)
			{
				// TODO: Do we want row macros?  Let's be still and find out.
				let tmpRow = tmpGroup.Rows[j];
				for (let k = 0; k < tmpRow.Inputs.length; k++)
				{
					let tmpInput = tmpRow.Inputs[k];
					// Input Macros
					let tmpInputMacroKeys = Object.keys(this.options.MacroTemplates.Input);
					if (!('Macro' in tmpInput))
					{
						tmpInput.Macro = {};
					}
					for (let n = 0; n < tmpInputMacroKeys.length; n++)
					{
						tmpInput.Macro[tmpInputMacroKeys[n]] = this.pict.parseTemplate (this.options.MacroTemplates.Input[tmpInputMacroKeys[n]], tmpInput, null, [this]);
					}
				}
			}

			if (tmpGroup.supportingManifest)
			{
				let tmpSupportingManifestDescriptorKeys = Object.keys(tmpGroup.supportingManifest.elementDescriptors);
				for (let k = 0; k < tmpSupportingManifestDescriptorKeys.length; k++)
				{
					let tmpInput = tmpGroup.supportingManifest.elementDescriptors[tmpSupportingManifestDescriptorKeys[k]];

					// Input Macros
					let tmpInputMacroKeys = Object.keys(this.options.MacroTemplates.Input);
					if (!('Macro' in tmpInput))
					{
						tmpInput.Macro = {};
					}
					for (let n = 0; n < tmpInputMacroKeys.length; n++)
					{
						tmpInput.Macro[tmpInputMacroKeys[n]] = this.pict.parseTemplate (this.options.MacroTemplates.Input[tmpInputMacroKeys[n]], tmpInput, null, [this]);
					}
				}
			}
		}
	}

	checkViewSpecificTemplate(pTemplatePostfix)
	{
		// This is here to cut down on complex guards, and, so we can optimize/extend it later if we need to.
		return (`${this.formsTemplateSetPrefix}${pTemplatePostfix}` in this.pict.TemplateProvider.templates);
	}

	checkThemeSpecificTemplate(pTemplatePostfix)
	{
		// This is here to cut down on complex guards, and, so we can optimize/extend it later if we need to.
		return (`${this.defaultTemplatePrefix}${pTemplatePostfix}` in this.pict.TemplateProvider.templates);
	}

	getMetatemplateTemplateReferenceRaw(pTemplatePostfix, pRawTemplateDataAddress)
	{
		// 1. Check if there is a section-specific template loaded
		if (this.checkViewSpecificTemplate(pTemplatePostfix))
		{
			return `\n{~T:${this.formsTemplateSetPrefix}${pTemplatePostfix}:${pRawTemplateDataAddress}~}`;
		}
		// 2. Check if there is a theme-specific template loaded for this postfix
		else if (this.checkThemeSpecificTemplate(pTemplatePostfix))
		{
			return `\n{~T:${this.defaultTemplatePrefix}${pTemplatePostfix}:${pRawTemplateDataAddress}~}`;
		}
		// 3. This shouldn't happen if the template is based on the base class.
		else
		{
			return false;
		}
	}

	getMetatemplateTemplateReference(pTemplatePostfix, pViewDataAddress)
	{
		return this.getMetatemplateTemplateReferenceRaw(pTemplatePostfix, `Pict.views["${this.Hash}"].${pViewDataAddress}`);
	}

	getInputMetatemplateTemplateReference(pDataType, pInputType, pViewDataAddress)
	{
		// Input types are customizable -- there could be 30 different input types for the string data type with special handling and templates
		let tmpTemplateInputTypePostfix = `-Template-Input-InputType-${pInputType}`;
		// Data types are not customizable; they are a fixed list based on what is available in Manyfest
		let tmpTemplateDataTypePostfix = `-Template-Input-DataType-${pDataType}`;

		// First check if there is an "input type" template available in either the section-specific configuration or in the general
		if (pInputType)
		{
			let tmpTemplate = this.getMetatemplateTemplateReference(tmpTemplateInputTypePostfix, pViewDataAddress);
			if (tmpTemplate)
			{
				return tmpTemplate;
			}
		}

		// If we didn't find the template for the "input type", check for the "data type"
		let tmpTemplate = this.getMetatemplateTemplateReference(tmpTemplateDataTypePostfix, pViewDataAddress);
		if (tmpTemplate)
		{
			return tmpTemplate;
		}
	
		// There wasn't an input type specific or data type specific template, so fall back to the generic input template.
		return this.getMetatemplateTemplateReference('-Template-Input', pViewDataAddress);
	}

	getTabularInputMetatemplateTemplateReference(pDataType, pInputType, pViewDataAddress, pGroupIndex, pRowIndex)
	{
		// Input types are customizable -- there could be 30 different input types for the string data type with special handling and templates
		let tmpTemplateBeginInputTypePostfix = `-TabularTemplate-Begin-Input-InputType-${pInputType}`;
		let tmpTemplateMidInputTypePostfix = `-TabularTemplate-Mid-Input-InputType-${pInputType}`;
		let tmpTemplateEndInputTypePostfix = `-TabularTemplate-End-Input-InputType-${pInputType}`;
		// Data types are not customizable; they are a fixed list based on what is available in Manyfest
		let tmpTemplateBeginDataTypePostfix = `-TabularTemplate-Begin-Input-DataType-${pDataType}`;
		let tmpTemplateMidDataTypePostfix = `-TabularTemplate-Mid-Input-DataType-${pDataType}`;
		let tmpTemplateEndDataTypePostfix = `-TabularTemplate-End-Input-DataType-${pDataType}`;

		// Tabular inputs are done in three parts -- the "begin", the "address" of the data and the "end".

		// This means it is easily extensible to work on JSON objects as well as arrays.
		let tmpMidTemplate = this.getMetatemplateTemplateReference('-TabularTemplate-Mid-Input', pViewDataAddress, pGroupIndex, pRowIndex);
		let tmpInformaryDataAddressTemplate = this.getMetatemplateTemplateReference('-TabularTemplate-InformaryAddress-Input', pViewDataAddress, pGroupIndex, pRowIndex);

		// First check if there is an "input type" template available in either the section-specific configuration or in the general
		if (pInputType)
		{
			let tmpBeginTemplate = this.getMetatemplateTemplateReference(tmpTemplateBeginInputTypePostfix, pViewDataAddress);
			let tmpEndTemplate = this.getMetatemplateTemplateReference(tmpTemplateEndInputTypePostfix, pViewDataAddress);
			let tmpCustomMidTemplate = this.getMetatemplateTemplateReference(tmpTemplateMidInputTypePostfix, pViewDataAddress, pGroupIndex, pRowIndex);
			tmpMidTemplate = (tmpCustomMidTemplate) ? tmpCustomMidTemplate : tmpMidTemplate;
			if (tmpBeginTemplate && tmpEndTemplate)
			{
				return tmpBeginTemplate + tmpMidTemplate + tmpInformaryDataAddressTemplate + tmpEndTemplate;
			}
		}

		// If we didn't find the template for the "input type", check for the "data type"
		let tmpBeginTemplate = this.getMetatemplateTemplateReference(tmpTemplateBeginDataTypePostfix, pViewDataAddress);
		let tmpEndTemplate = this.getMetatemplateTemplateReference(tmpTemplateEndDataTypePostfix, pViewDataAddress);
		if (tmpBeginTemplate && tmpEndTemplate)
		{
			let tmpCustomMidTemplate = this.getMetatemplateTemplateReference(tmpTemplateMidDataTypePostfix, pViewDataAddress, pGroupIndex, pRowIndex);
			tmpMidTemplate = (tmpCustomMidTemplate) ? tmpCustomMidTemplate : tmpMidTemplate;
			return tmpBeginTemplate + tmpMidTemplate + tmpInformaryDataAddressTemplate + tmpEndTemplate;
		}
	


		// If we didn't find the template for the "input type", or the "data type", fall back to the default
		tmpBeginTemplate = this.getMetatemplateTemplateReference('TabularTemplate-Begin-Input', pViewDataAddress);
		tmpEndTemplate = this.getMetatemplateTemplateReference('TabularTemplate-End-Input', pViewDataAddress);
		if (tmpBeginTemplate && tmpEndTemplate)
		{
			return tmpBeginTemplate + tmpMidTemplate + tmpInformaryDataAddressTemplate + tmpEndTemplate;
		}
	
		// There was some kind of catastrophic failure -- the above templates should always be loaded.
		this.log.error(`PICT Form [${this.UUID}]::[${this.Hash}] catastrophic error generating tabular metatemplate: missing input template for Data Type ${pDataType} and Input Type ${pInputType}, Data Address ${pViewDataAddress}, Group Index ${pGroupIndex} and Record Subaddress ${pRowIndex}}.`)
		return '';
	}

	rebuildCustomTemplate()
	{
		let tmpTemplate = ``;

		if (this.pict.views.PictFormMetacontroller)
		{
			if ('formTemplatePrefix' in this.pict.views.PictFormMetacontroller)
			{
				this.defaultTemplatePrefix = this.pict.views.PictFormMetacontroller.formTemplatePrefix;
			}
		}

		tmpTemplate += this.getMetatemplateTemplateReference(`-Template-Wrap-Prefix`, `sectionDefinition`);
		tmpTemplate += this.getMetatemplateTemplateReference(`-Template-Section-Prefix`, `sectionDefinition`);

		for (let i = 0; i < this.sectionDefinition.Groups.length; i++)
		{
			let tmpGroup = this.sectionDefinition.Groups[i];

			// Add this to the group object for metatemplating
			tmpGroup.GroupIndex = i;

			tmpGroup.SectionTabularRowVirtualTemplateHash = `Pict-Form-Template-TabularRow-Virtual-${this.options.Hash}-G${tmpGroup.GroupIndex}`;
			tmpGroup.SectionTabularRowTemplateHash = `Pict-Form-Template-TabularRow-${this.options.Hash}-G${tmpGroup.GroupIndex}`;


			// Group layouts are customizable
			// The three basic group layouts:
			// 1. Record (default) - Render the whole address as a singleton record
			//                       placing inputs into rows based on configuration.
			// 2. Tabular          - Expect either an Array of objects or a POJO to
			//                       be rendered one record per row.
			let tmpGroupLayout = (typeof(tmpGroup.Layout) === 'string') ? tmpGroup.Layout :
									(typeof(this.sectionDefinition.DefaultGroupLayout) === 'string') ? this.sectionDefinition.DefaultGroupLayout :
									'Record';

			// We won't skip complex layouts even if they don't have rows because the
			// generated metatemplate has n-dimensional columns from the submanifests.
			if (!Array.isArray(tmpGroup.Rows))
			{
				continue;
			}

			switch(tmpGroupLayout)
			{
				case 'Tabular':
					// Tabular layout
					let tmpTemplateSetRecordRowTemplate = '';
					tmpTemplate += this.getMetatemplateTemplateReference(`-TabularTemplate-Group-Prefix`, `getGroup("${i}")`);
					// Tabular templates only have one "row" for the header in the standard template, and then a row for each record.
					// The row for each record happens as a TemplateSet.
					tmpTemplate += this.getMetatemplateTemplateReference(`-TabularTemplate-RowHeader-Prefix`, `getGroup("${i}")`);
					tmpTemplate += this.getMetatemplateTemplateReference(`-TabularTemplate-RowHeader-ExtraPrefix`, `getGroup("${i}")`);

					for (let j = 0; j < tmpGroup.Rows.length; j++)
					{

						let tmpRow = tmpGroup.Rows[j];

						// Tabular are odd in that they have a header row and then a meta TemplateSet for the rows()

						// In this case we are going to load the descriptors from the supportingManifests
						if (!tmpGroup.supportingManifest)
						{
							this.log.error(`PICT Form [${this.UUID}]::[${this.Hash}] error generating tabular metatemplate: missing group manifest ${tmpGroup.RecordManifest} from supportingManifests.`);
							continue;
						}

						for (let k = 0; k < tmpGroup.supportingManifest.elementAddresses.length; k++)
						{
							let tmpSupportingManifestHash = tmpGroup.supportingManifest.elementAddresses[k];
							let tmpInput = tmpGroup.supportingManifest.elementDescriptors[tmpSupportingManifestHash];
							// Update the InputIndex to match the current render config
							tmpInput.PictForm.InputIndex = k;
							tmpInput.PictForm.GroupIndex = tmpGroup.GroupIndex;

							tmpTemplate += this.getMetatemplateTemplateReference('-TabularTemplate-HeaderCell', `getTabularRecordInput("${i}","${k}")`);

		
							tmpTemplateSetRecordRowTemplate += this.getMetatemplateTemplateReference(`-TabularTemplate-Cell-Prefix`, `getTabularRecordInput("${i}","${k}")`);
							let tmpInputType = (('PictForm' in tmpInput) && tmpInput.PictForm.InputType) ? tmpInput.PictForm.InputType : 'Default';
							tmpTemplateSetRecordRowTemplate += this.getTabularInputMetatemplateTemplateReference(tmpInput.DataType, tmpInputType, `getTabularRecordInput("${i}","${k}")`, i, k);
							tmpTemplateSetRecordRowTemplate += this.getMetatemplateTemplateReference(`-TabularTemplate-Cell-Postfix`, `getTabularRecordInput("${i}","${k}")`);
						}
					}

					tmpTemplate += this.getMetatemplateTemplateReference(`-TabularTemplate-RowHeader-ExtraPostfix`, `getGroup("${i}")`);
					tmpTemplate += this.getMetatemplateTemplateReference(`-TabularTemplate-RowHeader-Postfix`, `getGroup("${i}")`);

					// This is the template by which the tabular template includes the rows.
					// The recursion here is difficult to envision without drawing it.
					// TODO: Consider making this function available in manyfest in some fashion it seems dope.
					let tmpTemplateSetVirtualRowTemplate = '';
					tmpTemplateSetVirtualRowTemplate += this.getMetatemplateTemplateReference(`-TabularTemplate-Row-Prefix`, `getGroup("${i}")`);
					tmpTemplateSetVirtualRowTemplate += this.getMetatemplateTemplateReferenceRaw(`-TabularTemplate-Row-ExtraPrefix`, `Record`);
					tmpTemplateSetVirtualRowTemplate += `\n\n{~T:${tmpGroup.SectionTabularRowTemplateHash}:Record~}\n`;
					tmpTemplateSetVirtualRowTemplate += this.getMetatemplateTemplateReferenceRaw(`-TabularTemplate-Row-ExtraPostfix`, `Record`);
					tmpTemplateSetVirtualRowTemplate += this.getMetatemplateTemplateReference(`-TabularTemplate-Row-Postfix`, `getGroup("${i}")`);

					// This is a custom template expression
					tmpTemplate += `\n\n{~MTVS:${tmpGroup.SectionTabularRowVirtualTemplateHash}:${tmpGroup.GroupIndex}:${this.getMarshalDestinationAddress()}.${tmpGroup.RecordSetAddress}~}\n`;

					tmpTemplate += this.getMetatemplateTemplateReference(`-TabularTemplate-Group-Postfix`, `getGroup("${i}")`);
					// Add the TemplateSetTemplate
					this.pict.TemplateProvider.addTemplate(tmpGroup.SectionTabularRowVirtualTemplateHash, tmpTemplateSetVirtualRowTemplate);
					this.pict.TemplateProvider.addTemplate(tmpGroup.SectionTabularRowTemplateHash, tmpTemplateSetRecordRowTemplate);
					break;
				case 'Record':
				default:
					tmpTemplate += this.getMetatemplateTemplateReference(`-Template-Group-Prefix`, `getGroup("${i}")`);
					for (let j = 0; j < tmpGroup.Rows.length; j++)
					{
						let tmpRow = tmpGroup.Rows[j];

						tmpTemplate += this.getMetatemplateTemplateReference(`-Template-Row-Prefix`, `getGroup("${i}")`);

						// There are three row layouts: Record, Tabular and Columnar
						for (let k = 0; k < tmpRow.Inputs.length; k++)
						{
							let tmpInput = tmpRow.Inputs[k];
							// Update the InputIndex to match the current render config
							tmpInput.PictForm.InputIndex = k;
							tmpInput.PictForm.GroupIndex = tmpGroup.GroupIndex;

							tmpTemplate += this.getInputMetatemplateTemplateReference(tmpInput.DataType, tmpInput.PictForm.InputType, `getInput("${i}","${j}","${k}")`);
						}
						tmpTemplate += this.getMetatemplateTemplateReference(`-Template-Row-Postfix`, `getGroup("${i}")`);
					}
					tmpTemplate += this.getMetatemplateTemplateReference(`-Template-Group-Postfix`, `getGroup("${i}")`);
					break;
			}
		}

		tmpTemplate += this.getMetatemplateTemplateReference(`-Template-Section-Postfix`, `sectionDefinition`);
		tmpTemplate += this.getMetatemplateTemplateReference(`-Template-Wrap-Postfix`, `sectionDefinition`);

		this.rebuildMacros();

		this.pict.TemplateProvider.addTemplate(this.options.SectionTemplateHash, tmpTemplate);
	}


	// Metatemplate Helper Functions
	getTabularRecordInput(pGroupIndex, pInputIndex)
	{
		// The neat thing about how the tabular groups work is that we can make it clever about whether it's an object or an array.
		let tmpGroup = this.getGroup(pGroupIndex);

		if (!tmpGroup)
		{
			this.log.warn(`PICT View Metatemplate Helper getTabularRowData ${pGroupIndex} was not a valid group.`);
			return false;
		}

		// Now get the supporting manifest and the input element
		// This needs more guards
		let tmpSupportingManifestHash = tmpGroup.supportingManifest.elementAddresses[pInputIndex];
		return tmpGroup.supportingManifest.elementDescriptors[tmpSupportingManifestHash];
	}
	
	getTabularRecordData(pGroupIndex, pRowIdentifier)
	{
		// The neat thing about how the tabular groups work is that we can make it clever about whether it's an object or an array.
		let tmpGroup = this.getGroup(pGroupIndex);

		if (!tmpGroup)
		{
			this.log.warn(`PICT View Metatemplate Helper getTabularRowData ${pGroupIndex} was not a valid group.`);
			return false;
		}

		// Now identify the group
		let tmpRowSourceRecord =  this.sectionManifest.getValueByHash(this.getMarshalDestinationObject(), tmpGroup.RecordSetAddress);

		if (!tmpRowSourceRecord)
		{
			// Try the address
			tmpRowSourceRecord = this.sectionManifest.getValueAtAddress(this.getMarshalDestinationObject(), tmpGroup.RecordSetAddress);
		}
		
		if (!tmpRowSourceRecord)
		{
			this.log.warn(`PICT View Metatemplate Helper getTabularRowData ${pGroupIndex} could not find the record set for ${tmpGroup.RecordSetAddress}.`);
			return false;
		}

		// Now we have the source record let's see what it is
		try
		{
			if (Array.isArray(tmpRowSourceRecord))
			{
				return tmpRowSourceRecord[pRowIdentifier];
			}
			else if (typeof(tmpRowSourceRecord) === 'object')
			{
				return tmpRowSourceRecord[pRowIdentifier];
			}
			else
			{
				this.log.warn(`PICT View Metatemplate Helper getTabularRowData ${pGroupIndex} could not determine the type of the record set for ${tmpGroup.RecordSetAddress}.`);
				return false;
			}
		}
		catch (pError)
		{
			this.log.error(`PICT View Metatemplate Helper getTabularRowData ${pGroupIndex} encountered an error: ${pError}`);
			return false;
		}
	}

	getTabularRecordSet(pGroupIndex)
	{
		// The neat thing about how the tabular groups work is that we can make it clever about whether it's an object or an array.
		let tmpGroup = this.getGroup(pGroupIndex);
		if (!tmpGroup)
		{
			this.log.warn(`PICT View Metatemplate Helper getTabularRecordSet ${pGroupIndex} was not a valid group.`);
			return false;
		}
		return this.sectionManifest.getValueByHash(this.getMarshalDestinationObject(), tmpGroup.RecordSetAddress);
	}

	getGroup(pGroupIndex)
	{
		if (isNaN(pGroupIndex))
		{
			this.log.warn(`PICT View Metatemplate Helper getGroup ${pGroupIndex} was expecting a number.`);
			return false;
		}
		if (pGroupIndex > this.sectionDefinition.Groups.length)
		{
			this.log.warn(`PICT View Metatemplate Helper getGroup ${pGroupIndex} was out of bounds.`);
			return false;
		}

		return this.sectionDefinition.Groups[pGroupIndex];
	}

	createDynamicTableRow(pGroupIndex)
	{
		let tmpGroup = this.getGroup(pGroupIndex);

		if (tmpGroup)
		{
			let tmpDestinationObject = this.sectionManifest.getValueByHash(this.getMarshalDestinationObject(), tmpGroup.RecordSetAddress);

			if (Array.isArray(tmpDestinationObject))
			{
				tmpDestinationObject.push(tmpGroup.supportingManifest.populateDefaults({}))
				this.render();
				this.marshalToView();
			}
			else if (typeof(tmpDestinationObject) === 'object')
			{
				let tmpRowIndex = this.fable.getUUID();
				tmpDestinationObject[tmpRowIndex] = tmpGroup.supportingManifest.populateDefaults({});
				this.render();
				this.marshalToView();
			}
		}
	}

	setDynamicTableRowIndex(pGroupIndex, pRowIndex, pNewRowIndex)
	{
		let tmpGroup = this.getGroup(pGroupIndex);

		if (tmpGroup)
		{
			let tmpDestinationObject = this.sectionManifest.getValueByHash(this.getMarshalDestinationObject(), tmpGroup.RecordSetAddress);

			if (Array.isArray(tmpDestinationObject))
			{
				let tmpRowIndex = parseInt(pRowIndex, 10);
				let tmpNewRowIndex = parseInt(pNewRowIndex, 10);
				if ((tmpDestinationObject.length <= tmpRowIndex) || (tmpRowIndex < 0))
				{
					this.pict.log.error(`Dynamic View [${this.UUID}]::[${this.Hash}] Group ${tmpGroup.Hash} attempting to move row [${pRowIndex}] to [${pNewRowIndex}] but the index is out of bounds.`);
					return false;
				}
				let tmpElementToBeMoved = tmpDestinationObject.splice(tmpRowIndex, 1);
				tmpDestinationObject.splice(tmpNewRowIndex, 0, tmpElementToBeMoved[0]);
				this.render();
				this.marshalToView();
			}
			else if (typeof(tmpDestinationObject) === 'object')
			{
				this.pict.log.error(`Dynamic View [${this.UUID}]::[${this.Hash}] Group ${tmpGroup.Hash} attempting to move row [${pRowIndex}] to [${pNewRowIndex}] but it's an object not an array; order isn't controllable.`);
			}
		}
	}

	moveDynamicTableRowDown(pGroupIndex, pRowIndex)
	{
		let tmpGroup = this.getGroup(pGroupIndex);

		if (tmpGroup)
		{
			let tmpDestinationObject = this.sectionManifest.getValueByHash(this.getMarshalDestinationObject(), tmpGroup.RecordSetAddress);

			if (Array.isArray(tmpDestinationObject))
			{
				let tmpRowIndex = parseInt(pRowIndex, 10);
				if (tmpDestinationObject.length <= tmpRowIndex)
				{
					this.pict.log.error(`Dynamic View [${this.UUID}]::[${this.Hash}] Group ${tmpGroup.Hash} attempting to move row [${pRowIndex}] down but it's already at the bottom.`);
					return false;
				}
				let tmpElementToBeMoved = tmpDestinationObject.splice(tmpRowIndex, 1);
				tmpDestinationObject.splice(tmpRowIndex + 1, 0, tmpElementToBeMoved[0]);
				this.render();
				this.marshalToView();
			}
			else if (typeof(tmpDestinationObject) === 'object')
			{
				this.pict.log.error(`Dynamic View [${this.UUID}]::[${this.Hash}] Group ${tmpGroup.Hash} attempting to move row [${pRowIndex}] but it's an object not an array; order isn't controllable.`);
			}
		}
	}

	moveDynamicTableRowUp(pGroupIndex, pRowIndex)
	{
		let tmpGroup = this.getGroup(pGroupIndex);

		if (tmpGroup)
		{
			let tmpDestinationObject = this.sectionManifest.getValueByHash(this.getMarshalDestinationObject(), tmpGroup.RecordSetAddress);

			if (Array.isArray(tmpDestinationObject))
			{
				let tmpRowIndex = parseInt(pRowIndex, 10);
				if (tmpRowIndex == 0)
				{
					this.pict.log.error(`Dynamic View [${this.UUID}]::[${this.Hash}] Group ${tmpGroup.Hash} attempting to move row [${pRowIndex}] up but it's already at the top.`);
					return false;
				}
				if (tmpDestinationObject.length <= tmpRowIndex)
				{
					this.pict.log.error(`Dynamic View [${this.UUID}]::[${this.Hash}] Group ${tmpGroup.Hash} attempting to move row [${pRowIndex}] but the index is out of bounds.`);
					return false;
				}
				let tmpElementToBeMoved = tmpDestinationObject.splice(tmpRowIndex, 1);
				tmpDestinationObject.splice(tmpRowIndex - 1, 0, tmpElementToBeMoved[0]);
				this.render();
				this.marshalToView();
			}
			else if (typeof(tmpDestinationObject) === 'object')
			{
				this.pict.log.error(`Dynamic View [${this.UUID}]::[${this.Hash}] Group ${tmpGroup.Hash} attempting to move row [${pRowIndex}] but it's an object not an array; order isn't controllable.`);
			}
		}
	}


	deleteDynamicTableRow(pGroupIndex, pRowIndex)
	{
		let tmpGroup = this.getGroup(pGroupIndex);

		if (tmpGroup)
		{
			let tmpDestinationObject = this.sectionManifest.getValueByHash(this.getMarshalDestinationObject(), tmpGroup.RecordSetAddress);

			if (Array.isArray(tmpDestinationObject))
			{
				let tmpRowIndex = parseInt(pRowIndex, 10);
				if (tmpDestinationObject.length <= tmpRowIndex)
				{
					this.pict.log.error(`Dynamic View [${this.UUID}]::[${this.Hash}] Group ${tmpGroup.Hash} attempting to delete row [${pRowIndex}] but the index is out of bounds.`);
					return false;
				}
				tmpDestinationObject.splice(tmpRowIndex, 1);
				this.render();
				this.marshalToView();
			}
			else if (typeof(tmpDestinationObject) === 'object')
			{
				let tmpRowIndex = pRowIndex.toString();
				if (!(tmpRowIndex in tmpDestinationObject))
				{
					this.pict.log.error(`Dynamic View [${this.UUID}]::[${this.Hash}] Group ${tmpGroup.Hash} attempting to delete row [${pRowIndex}] but the object does not contain this entry.`);
					return false;
				}
				delete tmpDestinationObject[tmpRowIndex]
				this.render();
				this.marshalToView();
			}
		}
	}

	getRow(pGroupIndex, pRowIndex)
	{
		let tmpGroup = this.getGroup(pGroupIndex);

		if (tmpGroup)
		{
			if (isNaN(pRowIndex))
			{
				this.log.warn(`PICT View Metatemplate Helper getRow ${pRowIndex} was expecting a number.`);
				return false;	
			}
			if (pRowIndex > tmpGroup.Rows.length)
			{
				this.log.warn(`PICT View Metatemplate Helper getRow ${pRowIndex} was out of bounds.`);
				return false;
			}
			return tmpGroup.Rows[pRowIndex];
		}
		else
		{
			return false;
		}
	}

	getRowKeyValuePair(pGroupIndex, pRowIndex)
	{
		return { Key:pGroupIndex, Value:this.getRow(pGroupIndex, pRowIndex), Group:this.getGroup(pGroupIndex) };
	}

	getInputFromHash(pInputHash)
	{
		return this.sectionManifest.getDescriptorByHash(pInputHash);
	}

	getInput(pGroupIndex, pRowIndex, pInputIndex)
	{
		let tmpRow = this.getRow(pGroupIndex, pRowIndex);

		if (tmpRow)
		{
			if (isNaN(pInputIndex))
			{
				this.log.warn(`PICT View Metatemplate Helper getInput ${pInputIndex} was expecting a number.`);
				return false;	
			}
			if (pInputIndex > tmpRow.Inputs.length)
			{
				this.log.warn(`PICT View Metatemplate Helper getInput ${pInputIndex} was out of bounds.`);
				return false;
			}
			return tmpRow.Inputs[pInputIndex];
		}
		else
		{
			return false;
		}
	}

	inputDataRequest(pInputHash)
	{
		let tmpInput = this.getInputFromHash(pInputHash);
		if (pInputHash)
		{
			let tmpHashAddress = this.sectionManifest.resolveHashAddress(pInputHash);
			try
			{
				let tmpMarshalDestinationObject = this.getMarshalDestinationObject();
				if (tmpInput && tmpInput.PictForm && ('Providers' in tmpInput.PictForm) && Array.isArray(tmpInput.PictForm.Providers))
				{
					let tmpValue = this.sectionManifest.getValueByHash(tmpMarshalDestinationObject, tmpHashAddress);
					for (let i = 0; i < tmpInput.PictForm.Providers.length; i++)
					{
						if (this.pict.providers[tmpInput.PictForm.Providers[i]])
						{
							this.pict.providers[tmpInput.PictForm.Providers[i]].onDataRequest(this, tmpInput, tmpValue, tmpInput.Macro.HTMLSelector);
						}
						else
						{
							this.log.error(`Dynamic form [${this.Hash}]::[${this.UUID}] inputDataRequest cannot find provider [${tmpInput.PictForm.Providers[i]}] for input [${tmpInput.Hash}].`);
						}
					}
				}
			}
			catch (pError)
			{
				this.log.error(`Dynamic form [${this.Hash}]::[${this.UUID}] gross error running inputDataRequest specific (${pInputHash}) data from view in dataChanged event: ${pError}`);
			}
		}
		else
		{
			this.log.error(`Dynamic form [${this.Hash}]::[${this.UUID}] cannot find input hash [${pInputHash}] for inputDataRequest event.`);
		}
	}

	inputDataRequestTabular(pGroupIndex, pInputIndex, pRowIndex)
	{
		let tmpInput = this.getTabularRecordInput(pGroupIndex, pInputIndex);
		if (pGroupIndex && pInputIndex && pRowIndex && tmpInput)
		{
			try
			{
				let tmpMarshalDestinationObject = this.getMarshalDestinationObject();
				if (tmpInput && tmpInput.PictForm && ('Providers' in tmpInput.PictForm) && Array.isArray(tmpInput.PictForm.Providers))
				{
					// TODO: Can we simplify this?
					let tmpValueAddress = this.pict.providers.Informary.getComposedContainerAddress(tmpInput.PictForm.InformaryContainerAddress, pRowIndex, tmpInput.PictForm.InformaryDataAddress);
					let tmpValue = this.sectionManifest.getValueByHash(tmpMarshalDestinationObject, tmpValueAddress);

					let tmpVirtualInformaryHTMLSelector = tmpInput.Macro.HTMLSelectorTabular+`[data-i-index="${pRowIndex}"]`;
					for (let i = 0; i < tmpInput.PictForm.Providers.length; i++)
					{
						if (this.pict.providers[tmpInput.PictForm.Providers[i]])
						{
							this.pict.providers[tmpInput.PictForm.Providers[i]].onDataRequestTabular(this, tmpInput, tmpValue, tmpVirtualInformaryHTMLSelector, pRowIndex);
						}
						else
						{
							this.log.error(`Dynamic form [${this.Hash}]::[${this.UUID}] cannot find provider [${tmpInput.PictForm.Providers[i]}] for input [${tmpInput.Hash}] row ${pRowIndex}.`);
						}
					}
				}
			}
			catch (pError)
			{
				this.log.error(`Dynamic form [${this.Hash}]::[${this.UUID}] gross error marshaling specific (${pInputHash}) tabular data for group ${pGroupIndex} row ${pRowIndex} from view in dataChanged event: ${pError}`);
			}
		}
		else
		{
			// This is what is called whenever a hash is changed.  We could marshal from view, solve and remarshal to view.
			this.marshalFromView();
		}
		// Run any dynamic input providers for the input hash.
		this.pict.PictApplication.solve();
		this.marshalToView();
	}

	get isPictSectionForm()
	{
		return true;
	}
}

module.exports = PictViewDynamicForm;
