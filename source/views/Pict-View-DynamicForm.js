const libPictViewClass = require('pict-view');

const libManifestFactory = require('../services/ManifestFactory.js');

const libDynamicSolver = require('../providers/Pict-Provider-DynamicSolver.js');
const libDynamicInput = require('../providers/Pict-Provider-DynamicInput.js');
const libDynamicInputEvents = require('../providers/Pict-Provider-DynamicInputEvents.js');
const libDynamicTabularData = require('../providers/Pict-Provider-DynamicTabularData.js');

const libFormsTemplateProvider = require('../providers/Pict-Provider-DynamicTemplates.js');

const libMetatemplateGenerator = require('../providers/Pict-Provider-MetatemplateGenerator.js');
const libMetatemplateMacros = require('../providers/Pict-Provider-MetatemplateMacros.js');

const libPictLayoutRecord = require('../providers/layouts/Pict-Layout-Record.js');
const libPictLayoutTabular = require('../providers/layouts/Pict-Layout-Tabular.js');
const libPictLayoutRecordSet = require('../providers/layouts/Pict-Layout-RecordSet.js');
const libPictLayoutChart = require('../providers/layouts/Pict-Layout-Chart.js');
const libPictLayoutTuiGrid = require('../providers/layouts/Pict-Layout-TuiGrid.js');

const libInformary = require('../providers/Pict-Provider-Informary.js');

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
		this.pict.addProviderSingleton('DynamicInputEvents', libDynamicInputEvents.default_configuration, libDynamicInputEvents);
		this.pict.addProviderSingleton('DynamicSolver', libDynamicSolver.default_configuration, libDynamicSolver);
		this.pict.addProviderSingleton('DynamicTabularData', libDynamicTabularData.default_configuration, libDynamicTabularData);

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
			this.runLayoutProviderFunctions('onDataMarshalToForm');
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

	onAfterMarshalToForm()
	{
		// Check to see if there are any hooks set from the input templates
		this.runInputProviderFunctions('onAfterMarshalToForm');
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
			let tmpLayoutProvider = this.pict.providers.MetatemplateGenerator.getGroupLayoutProvider(this, tmpGroup);
			if (tmpLayoutProvider && (pFunctionName in tmpLayoutProvider))
			{
				let tmpFunction = tmpLayoutProvider[pFunctionName];
				tmpFunction.call(tmpLayoutProvider, this, tmpGroup);
			}
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
	getInputFromHash(pInputHash)
	{
		return this.sectionManifest.getDescriptorByHash(pInputHash);
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
		return this.pict.providers.DynamicInputEvents.inputDataRequest(this, pInputHash);
	}
	inputEvent(pInputHash, pEvent)
	{
		return this.pict.providers.DynamicInputEvents.inputEvent(this, pInputHash, pEvent);
	}

	inputDataRequestTabular(pGroupIndex, pInputIndex, pRowIndex)
	{
		return this.pict.providers.DynamicInputEvents.inputDataRequestTabular(this, pGroupIndex, pInputIndex, pRowIndex);
	}
	inputEventTabular(pGroupIndex, pInputIndex, pRowIndex, pEvent)
	{
		return this.pict.providers.DynamicInputEvents.inputEventTabular(this, pGroupIndex, pInputIndex, pRowIndex, pEvent);
	}

	getTabularRecordInput(pGroupIndex, pInputIndex)
	{
		return this.pict.providers.DynamicTabularData.getTabularRecordInput(this, pGroupIndex, pInputIndex);
	}
	getTabularRecordData(pGroupIndex, pRowIdentifier)
	{
		return this.pict.providers.DynamicTabularData.getTabularRecordData(this, pGroupIndex, pRowIdentifier);
	}
	getTabularRecordSet(pGroupIndex)
	{
		return this.pict.providers.DynamicTabularData.getTabularRecordSet(this, pGroupIndex);
	}
	createDynamicTableRow(pGroupIndex)
	{
		return this.pict.providers.DynamicTabularData.createDynamicTableRow(this, pGroupIndex);
	}
	setDynamicTableRowIndex(pGroupIndex, pRowIndex, pNewRowIndex)
	{
		return this.pict.providers.DynamicTabularData.setDynamicTableRowIndex(this, pGroupIndex, pRowIndex, pNewRowIndex);
	}
	moveDynamicTableRowDown(pGroupIndex, pRowIndex)
	{
		return this.pict.providers.DynamicTabularData.moveDynamicTableRowDown(this, pGroupIndex, pRowIndex);
	}
	moveDynamicTableRowUp(pGroupIndex, pRowIndex)
	{
		return this.pict.providers.DynamicTabularData.moveDynamicTableRowUp(this, pGroupIndex, pRowIndex);
	}
	deleteDynamicTableRow(pGroupIndex, pRowIndex)
	{
		return this.pict.providers.DynamicTabularData.deleteDynamicTableRow(this, pGroupIndex, pRowIndex);
	}

	get isPictSectionForm()
	{
		return true;
	}
}

module.exports = PictViewDynamicForm;
