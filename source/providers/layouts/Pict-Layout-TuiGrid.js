const libPictSectionGroupLayout = require('../Pict-Provider-DynamicLayout.js');

const libPictSectionTuiGridLayout = require('./Pict-Layout-TuiGrid/Pict-Section-TuiGrid.js');

class TuiGridLayout extends libPictSectionGroupLayout
{
	/**
	 * @param {import('pict')} pFable - The Fable instance.
	 * @param {any} [pOptions={}] - The options for the TuiGrid layout.
	 * @param {string} [pServiceHash] - The service hash.
	 */
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		/** @type {any} */
		this.options;
		/** @type {import('pict')} */
		this.pict;
		/** @type {any} */
		this.log;

		this.viewGridConfigurations = {};

		this.viewTuiGrids = {};
		this.viewGridState = {};
	}

	/**
	 * Generates the HTML ID for a TuiGrid group within a specific view.
	 *
	 * @param {Object} pView - The view object.
	 * @param {Object} pGroup - The group object.
	 * @returns {string} - The generated HTML ID.
	 */
	getGridHtmlID(pView, pGroup)
	{
		return `View-${pView.UUID}-GroupTuiGrid-${pGroup.GroupIndex}`;
	}

	/**
	 * Returns the HTML ID of the Tui view in the specified group.
	 *
	 * @param {string} pView - The Tui view.
	 * @param {string} pGroup - The group.
	 * @returns {string} - The HTML ID of the Tui view.
	 */
	getViewTuiHtmlID(pView, pGroup)
	{
		return `#${this.getGridHtmlID(pView, pGroup)}`;
	}

	/**
	 * Retrieves the TuiGrid view for a given view and group.
	 *
	 * @param {string} pView - The view name.
	 * @param {string} pGroup - The group name.
	 * @returns {libPictSectionTuiGridLayout} - The TuiGrid view if it exists, otherwise false.
	 */
	getViewGrid(pView, pGroup)
	{
		let tmpGridUUID = this.getGridHtmlID(pView, pGroup);
		if (!this.viewTuiGrids.hasOwnProperty(tmpGridUUID))
		{
			return null;
		}
		return this.viewTuiGrids[tmpGridUUID];
	}

	/**
	 * Creates a TuiGrid view for the specified view and group.
	 *
	 * @param {any} pView - The view object.
	 * @param {any} pGroup - The group object.
	 * @return {libPictSectionTuiGridLayout} - The created TuiGrid view.
	 */
	createViewTuiGrid(pView, pGroup)
	{
		let tmpGridUUID = this.getGridHtmlID(pView, pGroup);
		if (this.viewTuiGrids.hasOwnProperty(tmpGridUUID))
		{
			// Purely for information for now.
			this.log.info(`Dynamic TuiGrid view [${pView.UUID}]::[${pView.Hash}] is reinitializing a TuiGrid in group ${pGroup.GroupIndex} TuiGrid UUID [${tmpGridUUID}].`);
			// ...we need to clear out the littered tuiGrid views probably.
		}
		// Generate the pict view
		let tmpGridConfiguration = this.getViewTuiConfiguration(pView, pGroup);
		/** @type {libPictSectionTuiGridLayout} */
		let tmpGridView = this.pict.addView(tmpGridUUID, tmpGridConfiguration, libPictSectionTuiGridLayout);
		// Manually initialize the view
		tmpGridView.cachedGridData = this.generateDataRepresentation(pView, pGroup);

		tmpGridView.initialize();

		this.viewTuiGrids[tmpGridUUID] = tmpGridView;
		return tmpGridView;
	}

	/**
	 * Retrieves the TuiGrid configuration for a specific view and group.
	 *
	 * @param {any} pView - The view identifier.
	 * @param {any} pGroup - The group identifier.
	 * @returns {object} - The TuiGrid configuration for the specified view and group.
	 */
	getViewTuiConfiguration(pView, pGroup)
	{
		let tmpGridUUID = this.getGridHtmlID(pView, pGroup);
		// If there isn't yet a tui configuration, make a new one.
		if (!this.viewGridConfigurations.hasOwnProperty(tmpGridUUID))
		{
			// Generate a unique destination for the TuiGrid
			let tmpGroupTuiGridConfiguration = JSON.parse(JSON.stringify(libPictSectionTuiGridLayout.default_configuration));
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
				tmpInput.PictForm.RowIndex = 0;

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
					{
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

	/**
	 * Generates a data representation for the given view and group.
	 *
	 * @param {any} pView - The view object.
	 * @param {any} pGroup - The group object.
	 * @returns {Array<any>} - The generated data representation.
	 */
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
	 * @param {any} pView  - The view to initialize the newly rendered control for
	 * @param {any} pGroup - The group to initialize the newly rendered control for
	 * @returns {boolean} - Returns true if the initialization is successful, false otherwise.
	 */
	onGroupLayoutInitialize(pView, pGroup)
	{
		// We do this at the last minute to avoid extraneous creation of these.
		let tmpTuiGridView = this.createViewTuiGrid(pView, pGroup);

		// TODO: Guard?
		tmpTuiGridView.render();

		if (tmpTuiGridView.tuiGrid)
		{
			//FIXME: masking the type from the underlying tui-grid so we can decorate it here
			//       would be better to decorate the type from the upstream package.
			/** @type {any} */
			const tmpControl = tmpTuiGridView.tuiGrid;
			tmpControl.View = pView;
			tmpControl.Group = pGroup;
		}

		return true;
	}

	/**
	 * Marshals data from a view to a form in the TuiGrid layout.
	 *
	 * @param {Object} pView - The view object.
	 * @param {Object} pGroup - The group object.
	 * @returns {boolean} - Returns true if the data marshaling is successful, false otherwise.
	 */
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

		return true;
	}

	/**
	 * Adds a new row to the Pict-Layout-TuiGrid.
	 *
	 * @param {string} pViewHash - The hash of the PICT form view.
	 * @param {number} pGroupIndex - The index of the group in the view.
	 * @returns {boolean} Returns false if there is an error adding the row, otherwise returns true.
	 */
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
			let tmpRowIndex = tmpView.fable.getUUID();
			tmpDestinationObject[tmpRowIndex] = tmpNewObject;
		}

		// Add it to the TUIGrid
		let tmpTuiGridView = this.getViewGrid(tmpView, tmpGroup);
		if (tmpTuiGridView)
		{
			tmpTuiGridView.tuiGrid.appendRow(JSON.parse(JSON.stringify(tmpNewObject)));
		}
	}
}

module.exports = TuiGridLayout;
