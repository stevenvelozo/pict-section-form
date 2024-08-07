const libPictSectionGroupLayout = require('../Pict-Provider-DynamicLayout.js');

const libPictSectionTuiGrid = require('./Pict-Layout-TuiGrid/Pict-Section-TuiGrid.js');

class TuiGridLayout extends libPictSectionGroupLayout
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.viewGridConfigurations = {};

		this.viewTuiGrids = {};
		this.viewGridState = {};
	}

	getGridHtmlID(pView, pGroup)
	{
		return `View-${pView.UUID}-GroupTuiGrid-${pGroup.GroupIndex}`;
	}

	getViewTuiHtmlID(pView, pGroup)
	{
		return `#${this.getGridHtmlID(pView, pGroup)}`;
	}

	getViewGrid(pView, pGroup)
	{
		let tmpGridUUID = this.getGridHtmlID(pView, pGroup);
		if (!this.viewTuiGrids.hasOwnProperty(tmpGridUUID))
		{
			return false;
		}
		return this.viewTuiGrids[tmpGridUUID];
	}

	createViewTuiGrid(pView, pGroup)
	{
		let tmpGridUUID = this.getGridHtmlID(pView, pGroup);
		if (this.viewTuiGrids.hasOwnProperty(tmpGridUUID))
		{
			// Purely for information for now.
			this.pict.log.info(`Dynamic TuiGrid view [${pView.UUID}]::[${pView.Hash}] is reinitializing a TuiGrid in group ${pGroup.GroupIndex} TuiGrid UUID [${tmpGridUUID}].`);
			// ...we need to clear out the littered tuiGrid views probably.
		}
		// Generate the pict view
		let tmpGridConfiguration = this.getViewTuiConfiguration(pView, pGroup);
		let tmpGridView = this.pict.addView(tmpGridUUID, tmpGridConfiguration, libPictSectionTuiGrid);
		// Manually initialize the view
		tmpGridView.cachedGridData = this.generateDataRepresentation(pView, pGroup);

		tmpGridView.initialize();

		this.viewTuiGrids[tmpGridUUID] = tmpGridView;
		return tmpGridView;
	}

	getViewTuiConfiguration(pView, pGroup)
	{
		let tmpGridUUID = this.getGridHtmlID(pView, pGroup);
		// If there isn't yet a tui configuration, make a new one.
		if (!this.viewGridConfigurations.hasOwnProperty(tmpGridUUID))
		{
			// Generate a unique destination for the TuiGrid
			let tmpGroupTuiGridConfiguration = JSON.parse(JSON.stringify(libPictSectionTuiGrid.default_configuration));
			this.viewGridConfigurations[tmpGridUUID] = tmpGroupTuiGridConfiguration;

			tmpGroupTuiGridConfiguration.DefaultDestinationAddress = this.getViewTuiHtmlID(pView, pGroup);
			tmpGroupTuiGridConfiguration.TargetElementAddress = this.getViewTuiHtmlID(pView, pGroup);
			tmpGroupTuiGridConfiguration.TuiColumnSchema = [];
			/*
				{
					"header": "IDRecord",
					"name": "idrecord",
					"PictTriggerSolveOnChange": true
				},
				{
					"header": "Description",
					"name": "description",
					"editor": "text"
				}
			*/

			for (let k = 0; k < pGroup.supportingManifest.elementAddresses.length; k++)
			{
				let tmpSupportingManifestHash = pGroup.supportingManifest.elementAddresses[k];
				let tmpInput = pGroup.supportingManifest.elementDescriptors[tmpSupportingManifestHash];
				// Update the InputIndex to match the current render config
				if (!('PictForm' in tmpInput))
				{
					tmpInput.PictForm = {};
				}
				tmpInput.PictForm.InputIndex = k;
				tmpInput.PictForm.GroupIndex = pGroup.GroupIndex;

				let tmpTuiGridInput = {
					"header": tmpInput.Name,
					"name": tmpInput.Hash,
					// TODO: Should these all trigger solves?  Seems pretty expensive?
					"PictTriggerSolveOnChange": true,
					"PictSectionFormInput": tmpInput
				};
				switch (tmpInput.DataType)
				{
					case 'Number':
					case 'PreciseNumber':
						tmpTuiGridInput.editor = (
							{
								"type": "EditorNumber",
								"options": {}
							});
						tmpTuiGridInput.editor.options.decimalPrecision = tmpInput?.PictForm?.DecimalPrecision ?? 10;
						break;
					case 'String':
						tmpTuiGridInput.editor = 'text';
						break;
					case 'DateTime':
						tmpTuiGridInput.editor = {
							type: 'datePicker',
							options: {
								format: 'yyyy-MM-dd'
							}
						};
						break;
				}
				switch (tmpInput.PictForm.InputType)
				{
					case 'Option':
						tmpTuiGridInput.editor = (
							{
								"type": "select",
								"options": {
									"listItems": []
								}
							});
						let tmpDefaultData = tmpInput.PictForm.SelectOptions;
						if (tmpInput.PictForm.SelectOptionsPickList && this.pict.providers.DynamicMetaLists.hasList(pView.Hash, tmpInput.PictForm.SelectOptionsPickList))
						{
							tmpDefaultData = this.pict.providers.DynamicMetaLists.getList(pView.Hash, tmpInput.PictForm.SelectOptionsPickList);
						}
						if (tmpDefaultData && Array.isArray(tmpDefaultData))
						{
							for (let i = 0; i < tmpDefaultData.length; i++)
							{
								let tmpOption = (
									{
										"value": tmpDefaultData[i].id,
										"text": tmpDefaultData[i].text
									});
								tmpTuiGridInput.editor.options.listItems.push(tmpOption);
							}
						}
						break;
				}
				tmpGroupTuiGridConfiguration.TuiColumnSchema.push(tmpTuiGridInput);
			}
		}

		return this.viewGridConfigurations[tmpGridUUID];
	}

	/**
	 * Generate a group layout template for a TuiGrid dynamically generated group view.
	 * 
	 * @param {object} pView - The view to generate the dynamic group layout for
	 * @param {object} pGroup - The group to generate and inject dynamic layout templates
	 * @returns {string} - The template for the group
	 */
	generateGroupLayoutTemplate(pView, pGroup)
	{
		// Tabular are odd in that they have a header row and then a meta TemplateSet for the rows()
		// In this case we are going to load the descriptors from the supportingManifests
		if (!pGroup.supportingManifest)
		{
			this.log.error(`PICT Form [${pView.UUID}]::[${pView.Hash}] error generating tabular metatemplate: missing group manifest ${pGroup.RecordManifest} from supportingManifests.`);
			return '';
		}

		let tmpMetatemplateGenerator = this.pict.providers.MetatemplateGenerator;
		let tmpTemplate = '';

		tmpTemplate += tmpMetatemplateGenerator.getMetatemplateTemplateReference(pView, `-Template-Group-Prefix`, `getGroup("${pGroup.GroupIndex}")`);
		pGroup.TuiGridHTMLID = this.getGridHtmlID(pView, pGroup);
		tmpTemplate += tmpMetatemplateGenerator.getMetatemplateTemplateReference(pView, `-TuiGrid-Container`, `getGroup("${pGroup.GroupIndex}")`);
		tmpTemplate += tmpMetatemplateGenerator.getMetatemplateTemplateReference(pView, `-TuiGrid-Controls`, `getGroup("${pGroup.GroupIndex}")`);
		//tmpTemplate += `<div id="${this.getGridHtmlID(pView, pGroup)}"></div>`;
		tmpTemplate += tmpMetatemplateGenerator.getMetatemplateTemplateReference(pView, `-Template-Group-Postfix`, `getGroup("${pGroup.GroupIndex}")`);

		return tmpTemplate;
	}

	generateDataRepresentation(pView, pGroup)
	{
		let tmpData = [];
		this.viewGridState[this.getGridHtmlID(pView, pGroup)] = tmpData;

		let tmpTabularRecordSet = pView.getTabularRecordSet(pGroup.GroupIndex);

		if (Array.isArray(tmpTabularRecordSet))
		{
			for (let j = 0; j < tmpTabularRecordSet.length; j++)
			{
				let tmpTuiRowData = { RecordIndex: j };
				let tmpTabularRecord = tmpTabularRecordSet[j];
				for (let k = 0; k < pGroup.supportingManifest.elementAddresses.length; k++)
				{
					let tmpElementDescriptor = pGroup.supportingManifest.elementDescriptors[pGroup.supportingManifest.elementAddresses[k]];
					if (tmpElementDescriptor)
					{
						pGroup.supportingManifest.setValueAtAddress(tmpTuiRowData, tmpElementDescriptor.Hash, pGroup.supportingManifest.getValueByHash(tmpTabularRecord, tmpElementDescriptor.Hash));
					}
				}
				tmpData.push(tmpTuiRowData);
			}
		}
		return tmpData;
	}

	/**
	 * Initialize the TuiGrid!
	 * 
	 * @param {object} pView  - The view to initialize the newly rendered control for
	 * @param {object} pGroup - The group to initialize the newly rendered control for
	 * @returns 
	 */
	onGroupLayoutInitialize(pView, pGroup)
	{
		// We do this at the last minute to avoid extraneous creation of these.
		let tmpTuiGridView = this.createViewTuiGrid(pView, pGroup);

		// TODO: Guard?
		tmpTuiGridView.render();

		if (tmpTuiGridView.tuiGrid)
		{
			tmpTuiGridView.tuiGrid.View = pView;
			tmpTuiGridView.tuiGrid.Group = pGroup;
		}

		return true;
	}

	onDataMarshalToForm(pView, pGroup)
	{
		let tmpTuiGridView = this.getViewGrid(pView, pGroup);

		if (!tmpTuiGridView)
		{
			this.log.error(`PICT Form TuiGrid [${pView.UUID}]::[${pView.Hash}] error marshalling data to form: missing TuiGrid for group ${pGroup.GroupIndex}; skipping marshal.`);
			return false;
		}

		// painstakingly compare each value for now.
		let tmpTabularRecordSet = pView.getTabularRecordSet(pGroup.GroupIndex);
		let tmpBrowserRecordSet = tmpTuiGridView.tuiGrid.getData();

		if (Array.isArray(tmpTabularRecordSet))
		{
			for (let j = 0; j < tmpTabularRecordSet.length; j++)
			{
				try
				{
					let tmpStoredRowData = tmpTabularRecordSet[j];
					// Get the tuigrid row that represents AppData
					let tmpBrowserRowData = tmpBrowserRecordSet[j];
					// Enumerate each entry in the manifest and see if changes happened
					for (let k = 0; k < pGroup.supportingManifest.elementAddresses.length; k++)
					{
						let tmpElementDescriptor = pGroup.supportingManifest.elementDescriptors[pGroup.supportingManifest.elementAddresses[k]];
						if (tmpElementDescriptor)
						{
							let tmpBrowserValue = pGroup.supportingManifest.getValueAtAddress(tmpBrowserRowData, tmpElementDescriptor.Hash);
							let tmpAppStateValue = pGroup.supportingManifest.getValueByHash(tmpStoredRowData, tmpElementDescriptor.Hash);
							if (tmpBrowserValue !== tmpAppStateValue)
							{
								this.log.trace(`PICT Form TuiGrid Dynamic View [${pView.UUID}]::[${pView.Hash}] updating tabular record ${j} element ${tmpElementDescriptor.Hash} from [${tmpBrowserValue}] to [${tmpAppStateValue}].`);
								tmpTuiGridView.tuiGrid.setValue(j, tmpElementDescriptor.Hash, tmpAppStateValue);
							}
						}
					}
				}
				catch (pError)
				{
					this.log.error(`PICT Form TuiGrid [${pView.UUID}]::[${pView.Hash}] gross error marshalling data to form: ${pError}`);
				}
			}
		}

		if (!tmpTuiGridView)
		{
			this.log.error(`PICT Form [${pView.UUID}]::[${pView.Hash}] error marshalling data to form: missing TuiGrid for group ${pGroup.GroupIndex}.`);
			return false;
		}

		return true;
	}

	addRow(pViewHash, pGroupIndex)
	{
		if (!(pViewHash in this.pict.views))
		{
			this.log.error(`PICT Form View [${pViewHash}] error adding row: no matching view found in pict.`);
			return false;
		}
		let tmpView = this.pict.views[pViewHash];
		let tmpGroup = tmpView.getGroup(pGroupIndex);
		if (!tmpGroup)
		{
			this.log.error(`PICT Form View [${pViewHash}] error adding row: no matching group index ${pGroupIndex} found in view.`);
			return false;
		}

		let tmpDestinationObject = tmpView.sectionManifest.getValueByHash(tmpView.getMarshalDestinationObject(), tmpGroup.RecordSetAddress);
		let tmpNewObject = tmpGroup.supportingManifest.populateDefaults({});

		if (Array.isArray(tmpDestinationObject))
		{
			tmpDestinationObject.push(tmpNewObject);
		}
		else if (typeof(tmpDestinationObject) === 'object')
		{
			let tmpRowIndex = pView.fable.getUUID();
			tmpDestinationObject[tmpRowIndex] = tmpNewObject;
		}

		// Add it to the TUIGrid
		let tmpTuiGridView = this.getViewGrid(tmpView, tmpGroup);
		if (tmpTuiGridView)
		{
			tmpTuiGridView.appendRow(JSON.parse(JSON.stringify(tmpNewObject)));
		}
	}
}

module.exports = TuiGridLayout;
