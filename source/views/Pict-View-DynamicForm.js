const libPictViewClass = require('pict-view');

const libInformary = require('../providers/Pict-Provider-Informary.js');
const libDynamicSolver = require('../providers/Pict-Provider-DynamicSolver.js');
const libDynamicInput = require('../providers/Pict-Provider-DynamicInput.js');

const libManifestFactory = require('../services/ManifestFactory.js');

const libMetatemplateGenerator = require('../providers/Pict-Provider-MetatemplateGenerator.js');
const libMetatemplateMacros = require('../providers/Pict-Provider-MetatemplateMacros.js');

const libPictLayoutRecord = require('../providers/layouts/Pict-Layout-Record.js');
const libPictLayoutTabular = require('../providers/layouts/Pict-Layout-Tabular.js');
const libPictLayoutRecordSet = require('../providers/layouts/Pict-Layout-RecordSet.js');
const libPictLayoutChart = require('../providers/layouts/Pict-Layout-Chart.js');
const libPictLayoutTuiGrid = require('../providers/layouts/Pict-Layout-TuiGrid.js');

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

		this.fable.addAndInstantiateSingletonService('ManifestFactory', libManifestFactory.default_configuration, libManifestFactory);

		this.pict.addProviderSingleton('DynamicInput', libDynamicInput.default_configuration, libDynamicInput);
		this.pict.addProviderSingleton('DynamicSolver', libDynamicSolver.default_configuration, libDynamicSolver);

		this.pict.addProviderSingleton('PictFormSectionDefaultTemplateProvider', libFormsTemplateProvider.default_configuration, libFormsTemplateProvider);

		this.pict.addProviderSingleton('MetatemplateGenerator', libMetatemplateGenerator.default_configuration, libMetatemplateGenerator);
		this.pict.addProviderSingleton('MetatemplateMacros', libMetatemplateMacros.default_configuration, libMetatemplateMacros);

		this.pict.addProviderSingleton('Pict-Layout-Record', libPictLayoutRecord.default_configuration, libPictLayoutRecord);
		this.pict.addProviderSingleton('Pict-Layout-Tabular', libPictLayoutTabular.default_configuration, libPictLayoutTabular);
		this.pict.addProviderSingleton('Pict-Layout-RecordSet', libPictLayoutRecordSet.default_configuration, libPictLayoutRecordSet);
		this.pict.addProviderSingleton('Pict-Layout-Chart', libPictLayoutChart.default_configuration, libPictLayoutChart);
		this.pict.addProviderSingleton('Pict-Layout-TuiGrid', libPictLayoutTuiGrid.default_configuration, libPictLayoutTuiGrid);

		this.pict.addProviderSingleton('Informary', libInformary.default_configuration, libInformary);

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
		this.customDefaultTemplatePrefix = false;

		this.formID = `Pict-Form-${this.Hash}-${this.UUID}`;

		this.viewMarshalDestination = false;

		this.fable.ManifestFactory.initializeFormGroups(this);
	}

	get defaultTemplatePrefix()
	{
		if (this.customDefaultTemplatePrefix)
		{
			return this.customDefaultTemplatePrefix;
		}
		else if (this.pict.views.PictFormMetacontroller)
		{
			return this.pict.views.PictFormMetacontroller.formTemplatePrefix;
		}
		else
		{
			return 'Pict-Forms-Basic';
		}
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
				let tmpValue = this.sectionManifest.getValueByHash(tmpMarshalDestinationObject, tmpHashAddress);

				let tmpInputProviderList = this.getInputProviderList(tmpInput);
				for (let i = 0; i < tmpInputProviderList.length; i++)
				{
					if (this.pict.providers[tmpInputProviderList[i]])
					{
						this.pict.providers[tmpInputProviderList[i]].onDataChange(this, tmpInput, tmpValue, tmpInput.Macro.HTMLSelector);
					}
					else
					{
						this.log.error(`Dynamic form [${this.Hash}]::[${this.UUID}] cannot find provider [${tmpInputProviderList[i]}] for input [${tmpInput.Hash}].`);
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
		if 	(
				(typeof(pGroupIndex) != 'undefined')
				&& (typeof(pInputIndex) != 'undefined')
				&& (typeof(pRowIndex) != 'undefined')
				&& (typeof(tmpInput) == 'object')
			)
		{
			// The informary stuff doesn't know the resolution of the hash to address, so do it here.
			let tmpHashAddress = tmpInput.Address;
			try
			{
				let tmpMarshalDestinationObject = this.getMarshalDestinationObject();
				this.pict.providers.Informary.marshalFormToData(tmpMarshalDestinationObject, this.formID, this.sectionManifest, tmpHashAddress, pRowIndex);

				// TODO: Can we simplify this?
				let tmpValueAddress = this.pict.providers.Informary.getComposedContainerAddress(tmpInput.PictForm.InformaryContainerAddress, pRowIndex, tmpInput.PictForm.InformaryDataAddress);
				let tmpValue = this.sectionManifest.getValueByHash(tmpMarshalDestinationObject, tmpValueAddress);
				// Each row has a distinct address!
				let tmpVirtualInformaryHTMLSelector = tmpInput.Macro.HTMLSelectorTabular+`[data-i-index="${pRowIndex}"]`;
				let tmpInputProviderList = this.getInputProviderList(tmpInput);
				for (let i = 0; i < tmpInputProviderList.length; i++)
				{
					if (this.pict.providers[tmpInputProviderList[i]])
					{
						this.pict.providers[tmpInputProviderList[i]].onDataChangeTabular(this, tmpInput, tmpValue, tmpVirtualInformaryHTMLSelector, pRowIndex);
					}
					else
					{
						this.log.error(`Dynamic form [${this.Hash}]::[${this.UUID}] cannot find provider [${tmpInputProviderList[i]}] for input [${tmpInput.Hash}] row ${pRowIndex}.`);
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
		this.runLayoutProviderFunctions('onGroupLayoutInitialize')
		this.runInputProviderFunctions('onInputInitialize');
	}

	runLayoutProviderFunctions(pFunctionName)
	{
		// Check to see if there are any hooks set from the input templates
		for (let i = 0; i < this.sectionDefinition.Groups.length; i++)
		{
			let tmpGroup = this.sectionDefinition.Groups[i];
			
		}		
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
						if (tmpInput && tmpInput.PictForm)
						{
							let tmpInputProviderList = this.getInputProviderList(tmpInput);
							for (let i = 0; i < tmpInputProviderList.length; i++)
							{
								if (this.pict.providers[tmpInputProviderList[i]])
								{
									let tmpHashAddress = this.sectionManifest.resolveHashAddress(tmpInput.Hash);
									let tmpValue = this.sectionManifest.getValueByHash(this.getMarshalDestinationObject(), tmpHashAddress);
									this.pict.providers[tmpInputProviderList[i]][pFunctionName](this, tmpGroup, j, tmpInput, tmpValue, tmpInput.Macro.HTMLSelector);
								}
								else
								{
									this.log.error(`Dynamic form [${this.Hash}]::[${this.UUID}] cannot find provider [${tmpInputProviderList[i]}] for input [${tmpInput.Hash}].`);
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

					if (Array.isArray(tmpTabularRecordSet))
					{
						let tmpInput = tmpGroup.supportingManifest.elementDescriptors[tmpSupportingManifestDescriptorKeys[k]];
						// Now run any providers connected to this input
						if (tmpInput && tmpInput.PictForm)
						{
							let tmpInputProviderList = this.getInputProviderList(tmpInput);
							for (let i = 0; i < tmpInputProviderList.length; i++)
							{
								for (let r = 0; r < tmpTabularRecordSet.length; r++)
								{
									if (this.pict.providers[tmpInputProviderList[i]])
									{
										// There is a provider, we have an input and it is supposed to be run through for a record
										let tmpValueAddress = this.pict.providers.Informary.getComposedContainerAddress(tmpInput.PictForm.InformaryContainerAddress, r, tmpInput.PictForm.InformaryDataAddress);
										let tmpValue = this.sectionManifest.getValueByHash(this.getMarshalDestinationObject(), tmpValueAddress);
										this.pict.providers[tmpInputProviderList[i]][pFunctionName+'Tabular'](this, tmpGroup, tmpInput, tmpValue, tmpInput.Macro.HTMLSelectorTabular, r);
									}
									else
									{
										this.log.error(`Dynamic form [${this.Hash}]::[${this.UUID}] cannot find provider [${tmpInputProviderList[i]}] for input [${tmpInput.Hash}].`);
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
						let tmpInputProviderList = this.getInputProviderList(tmpInput);
						for (let i = 0; i < tmpInputProviderList.length; i++)
						{
							for (let r = 0; r < tmpRecordSetKeys.length; r++)
							{
								if (this.pict.providers[tmpInputProviderList[i]])
								{
									// There is a provider, we have an input and it is supposed to be run through for a record
									let tmpValueAddress = this.pict.providers.Informary.getComposedContainerAddress(tmpInput.PictForm.InformaryContainerAddress, tmpRecordSetKeys[r], tmpInput.PictForm.InformaryDataAddress);
									let tmpValue = this.sectionManifest.getValueByHash(this.getMarshalDestinationObject(), tmpValueAddress);
									this.pict.providers[tmpInputProviderList[i]][pFunctionName+'Tabular'](this, tmpGroup, tmpInput, tmpValue, tmpInput.Macro.HTMLSelectorTabular, tmpRecordSetKeys[r]);
								}
								else
								{
									this.log.error(`Dynamic form [${this.Hash}]::[${this.UUID}] cannot find provider [${tmpInputProviderList[i]}] for input [${tmpInput.Hash}].`);
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

	checkViewSpecificTemplate(pTemplatePostfix)
	{
		// This is here to cut down on complex guards, and, so we can optimize/extend it later if we need to.
		return (this.getViewSpecificTemplateHash(pTemplatePostfix) in this.pict.TemplateProvider.templates);
	}
	getViewSpecificTemplateHash(pTemplatePostfix)
	{
		return `${this.formsTemplateSetPrefix}${pTemplatePostfix}`;	
	}

	checkThemeSpecificTemplate(pTemplatePostfix)
	{
		// This is here to cut down on complex guards, and, so we can optimize/extend it later if we need to.
		return (this.getThemeSpecificTemplateHash(pTemplatePostfix) in this.pict.TemplateProvider.templates);
	}
	getThemeSpecificTemplateHash(pTemplatePostfix)
	{
		// This is here to cut down on complex guards, and, so we can optimize/extend it later if we need to.
		return `${this.defaultTemplatePrefix}${pTemplatePostfix}`;
	}

	rebuildCustomTemplate()
	{
		this.pict.providers.MetatemplateGenerator.rebuildCustomTemplate(this);
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

	getInputProviderList(pInput)
	{
		if (('Providers' in pInput.PictForm) && Array.isArray(pInput.PictForm.Providers))
		{
			return pInput.PictForm.Providers;
		}
		else
		{
			return this.pict.providers.DynamicInput.getDefaultInputProviders(this, pInput);
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
				let tmpValue = this.sectionManifest.getValueByHash(tmpMarshalDestinationObject, tmpHashAddress);
				let tmpInputProviderList = this.getInputProviderList(tmpInput);
				for (let i = 0; i < tmpInputProviderList.length; i++)
				{
					if (this.pict.providers[tmpInputProviderList[i]])
					{
						this.pict.providers[tmpInputProviderList[i]].onDataRequest(this, tmpInput, tmpValue, tmpInput.Macro.HTMLSelector);
					}
					else
					{
						this.log.error(`Dynamic form [${this.Hash}]::[${this.UUID}] inputDataRequest cannot find provider [${tmpInputProviderList[i]}] for input [${tmpInput.Hash}].`);
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

	inputEvent(pInputHash, pEvent)
	{
		let tmpInput = this.getInputFromHash(pInputHash);
		if (pInputHash)
		{
			let tmpHashAddress = this.sectionManifest.resolveHashAddress(pInputHash);
			try
			{
				let tmpMarshalDestinationObject = this.getMarshalDestinationObject();
				let tmpValue = this.sectionManifest.getValueByHash(tmpMarshalDestinationObject, tmpHashAddress);
				let tmpInputProviderList = this.getInputProviderList(tmpInput);
				for (let i = 0; i < tmpInputProviderList.length; i++)
				{
					if (this.pict.providers[tmpInputProviderList[i]])
					{
						this.pict.providers[tmpInputProviderList[i]].onEvent(this, tmpInput, tmpValue, tmpInput.Macro.HTMLSelector, pEvent);
					}
					else
					{
						this.log.error(`Dynamic form [${this.Hash}]::[${this.UUID}] inputEvent ${pEvent} cannot find provider [${tmpInputProviderList[i]}] for input [${tmpInput.Hash}].`);
					}
				}
			}
			catch (pError)
			{
				this.log.error(`Dynamic form [${this.Hash}]::[${this.UUID}] gross error running inputEvent ${pEvent} specific (${pInputHash}) data from view in dataChanged event: ${pError}`);
			}
		}
		else
		{
			this.log.error(`Dynamic form [${this.Hash}]::[${this.UUID}] cannot find input hash [${pInputHash}] for inputEvent ${pEvent} event.`);
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
				// TODO: Can we simplify this?
				let tmpValueAddress = this.pict.providers.Informary.getComposedContainerAddress(tmpInput.PictForm.InformaryContainerAddress, pRowIndex, tmpInput.PictForm.InformaryDataAddress);
				let tmpValue = this.sectionManifest.getValueByHash(tmpMarshalDestinationObject, tmpValueAddress);

				let tmpVirtualInformaryHTMLSelector = tmpInput.Macro.HTMLSelectorTabular+`[data-i-index="${pRowIndex}"]`;
				let tmpInputProviderList = this.getInputProviderList(tmpInput);
				for (let i = 0; i < tmpInputProviderList.length; i++)
				{
					if (this.pict.providers[tmpInputProviderList[i]])
					{
						this.pict.providers[tmpInputProviderList[i]].onDataRequestTabular(this, tmpInput, tmpValue, tmpVirtualInformaryHTMLSelector, pRowIndex);
					}
					else
					{
						this.log.error(`Dynamic form [${this.Hash}]::[${this.UUID}] cannot find provider [${tmpInputProviderList[i]}] for input [${tmpInput.Hash}] row ${pRowIndex}.`);
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

	inputEventTabular(pGroupIndex, pInputIndex, pRowIndex, pEvent)
	{
		let tmpInput = this.getTabularRecordInput(pGroupIndex, pInputIndex);
		if (pGroupIndex && pInputIndex && pRowIndex && tmpInput)
		{
			try
			{
				let tmpMarshalDestinationObject = this.getMarshalDestinationObject();
				
				// TODO: Can we simplify this?
				let tmpValueAddress = this.pict.providers.Informary.getComposedContainerAddress(tmpInput.PictForm.InformaryContainerAddress, pRowIndex, tmpInput.PictForm.InformaryDataAddress);
				let tmpValue = this.sectionManifest.getValueByHash(tmpMarshalDestinationObject, tmpValueAddress);

				let tmpVirtualInformaryHTMLSelector = tmpInput.Macro.HTMLSelectorTabular+`[data-i-index="${pRowIndex}"]`;
				let tmpInputProviderList = this.getInputProviderList(tmpInput);
				for (let i = 0; i < tmpInputProviderList.length; i++)
				{
					if (this.pict.providers[tmpInputProviderList[i]])
					{
						this.pict.providers[tmpInputProviderList[i]].onEventTabular(this, tmpInput, tmpValue, tmpVirtualInformaryHTMLSelector, pRowIndex, pEvent);
					}
					else
					{
						this.log.error(`Dynamic form [${this.Hash}]::[${this.UUID}] cannot find provider [${tmpInputProviderList[i]}] for input [${tmpInput.Hash}] row ${pRowIndex} calling inputEvent ${pEvent}.`);
					}
				}
			}
			catch (pError)
			{
				this.log.error(`Dynamic form [${this.Hash}]::[${this.UUID}] gross error marshaling specific (${pInputHash}) tabular data for group ${pGroupIndex} row ${pRowIndex} from view in calling inputEvent ${pEvent}: ${pError}`);
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
