const libPictViewClass = require('pict-view');

const libInformary = require('./Pict-Provider-Informary.js');
const libFormsTemplateProvider = require('./Pict-Provider-DynamicTemplates.js');

class PictViewDynamicForm extends libPictViewClass
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, require('./Pict-View-DynamicForm-DefaultConfiguration.json'), pOptions);

		if (!tmpOptions.Manifests)
		{
			throw new Error('PictSectionForm instantiation attempt without a Manifests in pOptions.Manifest -- cannot instantiate.');
			return;
		}
		if (!('Section' in tmpOptions.Manifests))
		{
			throw new Error('PictSectionForm instantiation attempt without a Section manifest in pOptions.Manifests -- cannot instantiate.');
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
		// This is for if we decide to abstract metatemplates into a separate provider for code simplification
		// if (!this.pict.providers.PictFormSectionMetatemplateGenerator)
		// {
		// 	let tmpMetatemplateGenerator = this.pict.addProvider('PictFormSectionMetatemplateGenerator', libFormsMetatemplateGenerator.default_configuration, libFormsMetatemplateGenerator);
		// 	tmpMetatemplateGenerator.initialize();
		// }

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

		// Informary is very old and requires jquery.
		// TODO: Refactor informary to be a pict service, eliminating this need entirely.

		this.viewMarshalDestination = false;

		// Initialize the solver service if it isn't up
		this.fable.instantiateServiceProviderIfNotExists('ExpressionParser');

		this.initializeFormGroups();
	}

	addSolver(pSolveFunctionString)
	{
		return (
			{
				"Type": "SingleSolve",
				"Priority": 0,
				"SolveFunction": pSolveFunctionString
			});
	}

	renderToPrimary()
	{
		// Render to the primary view that the 
		let tmpDefaultDestinationAddress = (this.pict.views.PictFormMetacontroller) ? this.pict.views.PictFormMetacontroller.options.DefaultDestinationAddress :
											this.options.DefaultDestinationAddress;
		this.render(this.options.DefaultRenderable, tmpDefaultDestinationAddress);
	}

	dataChanged(pInputHash)
	{
		// This is what is called whenever a hash is changed.  We could marshal from view, solve and remarshal to view.
		// TODO: Determine best pattern for allowing others to override this without subclassing this.  Maybe a registered provider type?
		this.marshalFromView();
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
		try
		{
			let tmpMarshalDestinationObject = this.getMarshalDestinationObject();

			this.pict.providers.Informary.marshalDataToForm(tmpMarshalDestinationObject, this.formID);
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

			this.pict.providers.Informary.marshalFormToData(tmpMarshalDestinationObject, this.formID);
		}
		catch (pError)
		{
			this.log.error(`Gross error marshaling data from view: ${pError}`);
		}
		return super.onMarshalFromView();
	}

	onSolve()
	{
		// Solve the groups
		for (let j = 0; j < this.sectionDefinition.Groups.length; j++)
		{
			let tmpGroup = this.sectionDefinition.Groups[j];

			if (`RecordSetSolvers` in tmpGroup)
			{
				for (let k = 0; k < tmpGroup.RecordSetSolvers.length; k++)
				{
					this.log.trace(`Dynamic View [${this.UUID}]::[${this.Hash}] solving equation ${k} [${tmpGroup.RecordSetSolvers[k]}]`);

					let tmpRecordSet = this.getTabularRecordSet(j);

					if (typeof(tmpRecordSet) == 'object')
					{
						let tmpRecordSetKeys = Object.keys(tmpRecordSet);
						for (let l = 0; l < tmpRecordSetKeys.length; l++)
						{
							let tmpRecord = tmpRecordSet[tmpRecordSetKeys[l]];
							let tmpResultsObject = {};
							let tmpSolutionValue = this.fable.ExpressionParser.solve(tmpGroup.RecordSetSolvers[k], tmpRecord, tmpResultsObject, tmpGroup.supportingManifest, tmpRecord);
							this.log.trace(`Group ${tmpGroup.Hash} solver ${k} [${tmpGroup.RecordSetSolvers[k]}] record ${l} result was ${tmpSolutionValue}`);
						}
					}
					if (typeof(tmpRecordSet) == 'array')
					{
						for (let l = 0; l < tmpRecordSet.length; l++)
						{
							let tmpRecord = tmpRecordSet[l];
							let tmpResultsObject = {};
							let tmpSolutionValue = this.fable.ExpressionParser.solve(tmpGroup.RecordSetSolvers[k], tmpRecord, tmpResultsObject, tmpGroup.supportingManifest, tmpRecord);
							this.log.trace(`Group ${tmpGroup.Hash} solver ${k} [${tmpGroup.RecordSetSolvers[k]}] record ${l} result was ${tmpSolutionValue}`);
						}
					}
				}
			}
		}

		if (Array.isArray(this.options.Solvers))
		{
			for (let i = 0; i < this.options.Solvers.length; i++)
			{
				// TODO: Precompile the solvers (it's super easy)
				this.log.trace(`Dynamic View [${this.UUID}]::[${this.Hash}] solving equation ${i} [${this.options.Solvers[i]}]`);

				let tmpResultsObject = {};

				let tmpSolutionValue = this.fable.ExpressionParser.solve(this.options.Solvers[i], this.getMarshalDestinationObject(), tmpResultsObject, this.sectionManifest, this.getMarshalDestinationObject());

				this.log.trace(`[${this.options.Solvers[i]}] result was ${tmpSolutionValue}`);
			}
		}

		if (this.options.AutoMarshalDataOnSolve)
		{
			this.marshalToView();
		}
		return super.onSolve();
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
		return (`${this.formsTemplateSetPrefix}${pTemplatePostfix}` in this.pict.TemplateProvider.templates)
	}

	checkThemeSpecificTemplate(pTemplatePostfix)
	{
		// This is here to cut down on complex guards, and, so we can optimize/extend it later if we need to.
		return (`${this.defaultTemplatePrefix}${pTemplatePostfix}` in this.pict.TemplateProvider.templates)
	}

	getMetatemplateTemplateReferenceRaw(pTemplatePostfix, pRawTemplateDataAddress)
	{
		// 1. Check if there is a section-specific template loaded
		if (this.checkViewSpecificTemplate(pTemplatePostfix))
		{
			return `\n{~T:${this.formsTemplateSetPrefix}${pTemplatePostfix}:${pRawTemplateDataAddress}~}`
		}
		// 2. Check if there is a theme-specific template loaded for this postfix
		else if (this.checkThemeSpecificTemplate(pTemplatePostfix))
		{
			return `\n{~T:${this.defaultTemplatePrefix}${pTemplatePostfix}:${pRawTemplateDataAddress}~}`
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

	getTabularInputMetatemplateTemplateReference(pDataType, pInputType, pViewDataAddress, pRecordSubAddress)
	{
		// Input types are customizable -- there could be 30 different input types for the string data type with special handling and templates
		let tmpTemplateBeginInputTypePostfix = `-TabularTemplate-Begin-Input-InputType-${pInputType}`;
		let tmpTemplateEndInputTypePostfix = `-TabularTemplate-End-Input-InputType-${pInputType}`;
		// Data types are not customizable; they are a fixed list based on what is available in Manyfest
		let tmpTemplateBeginDataTypePostfix = `-TabularTemplate-Begin-Input-DataType-${pDataType}`;
		let tmpTemplateEndDataTypePostfix = `-TabularTemplate-End-Input-DataType-${pDataType}`;

		// Tabular inputs are done in three parts -- the "begin", the "address" of the data and the "end".

		// This means it is easily extensible to work on JSON objects as well as arrays.
		let tmpAddressTemplate = ` data-i-index="{~D:Record.Key~}" `;

		// First check if there is an "input type" template available in either the section-specific configuration or in the general
		if (pInputType)
		{
			let tmpBeginTemplate = this.getMetatemplateTemplateReference(tmpTemplateBeginInputTypePostfix, pViewDataAddress);
			let tmpEndTemplate = this.getMetatemplateTemplateReference(tmpTemplateEndInputTypePostfix, pViewDataAddress);
			if (tmpBeginTemplate && tmpEndTemplate)
			{
				return tmpBeginTemplate + tmpAddressTemplate + tmpEndTemplate;
			}
		}

		// If we didn't find the template for the "input type", check for the "data type"
		let tmpBeginTemplate = this.getMetatemplateTemplateReference(tmpTemplateBeginDataTypePostfix, pViewDataAddress);
		let tmpEndTemplate = this.getMetatemplateTemplateReference(tmpTemplateEndDataTypePostfix, pViewDataAddress);
		if (tmpBeginTemplate && tmpEndTemplate)
		{
			return tmpBeginTemplate + tmpAddressTemplate + tmpEndTemplate;
		}
	


		// If we didn't find the template for the "input type", or the "data type", fall back to the default
		tmpBeginTemplate = this.getMetatemplateTemplateReference('TabularTemplate-Begin-Input', pViewDataAddress);
		tmpEndTemplate = this.getMetatemplateTemplateReference('TabularTemplate-End-Input', pViewDataAddress);
		if (tmpBeginTemplate && tmpEndTemplate)
		{
			return tmpBeginTemplate + tmpAddressTemplate + tmpEndTemplate;
		}
	
		// There wasn't some k ind of catastrophic failure -- the above templates should always be loaded.
		this.log.error(`PICT Form [${this.UUID}]::[${this.Hash}] catastrophic error generating tabular metatemplate: missing input template for Data Type ${pDataType} and Input Type ${pInputType}, Data Address ${pViewDataAddress} and Record Subaddress ${pRecordSubAddress}}.`)
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

					tmpTemplateSetRecordRowTemplate += this.getMetatemplateTemplateReference(`-TabularTemplate-Row-Prefix`, `getGroup("${i}")`);

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

							tmpTemplate += this.getMetatemplateTemplateReference('-TabularTemplate-HeaderCell', `getTabularRecordInput("${i}","${k}")`);

		
							tmpTemplateSetRecordRowTemplate += this.getMetatemplateTemplateReference(`-TabularTemplate-Cell-Prefix`, `getTabularRecordInput("${i}","${k}")`);
							let tmpInputType = ('PictForm' in tmpInput) ? tmpInput.PictForm.InputType : 'Default';
							tmpTemplateSetRecordRowTemplate += this.getTabularInputMetatemplateTemplateReference(tmpInput.DataType, tmpInputType, `getTabularRecordInput("${i}","${k}")`, k);
							tmpTemplateSetRecordRowTemplate += this.getMetatemplateTemplateReference(`-TabularTemplate-Cell-Postfix`, `getTabularRecordInput("${i}","${k}")`);
						}
					}
					tmpTemplate += this.getMetatemplateTemplateReference(`-TabularTemplate-RowHeader-ExtraPostfix`, `getGroup("${i}")`);
					tmpTemplate += this.getMetatemplateTemplateReference(`-TabularTemplate-RowHeader-Postfix`, `getGroup("${i}")`);

					// This is the template by which the tabular template includes the rows.
					// The recursion here is difficult to envision without drawing it.
					// TODO: Consider making this function available in manyfest in some fashion it seems dope.
					let tmpTemplateSetVirtualRowTemplate = '';
					tmpTemplateSetVirtualRowTemplate += this.getMetatemplateTemplateReferenceRaw(`-TabularTemplate-Row-ExtraPrefix`, `Record`);
					tmpTemplateSetVirtualRowTemplate += `\n\n{~T:${tmpGroup.SectionTabularRowTemplateHash}:Record~}\n`;
					tmpTemplateSetVirtualRowTemplate += this.getMetatemplateTemplateReferenceRaw(`-TabularTemplate-Row-ExtraPostfix`, `Record`);

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

	get isPictSectionForm()
	{
		return true;
	}
}

module.exports = PictViewDynamicForm;