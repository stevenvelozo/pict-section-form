const libPictSectionGroupLayout = require('../Pict-Provider-DynamicLayout.js');

const libPictSectionTuiGrid = require('pict-section-tuigrid');

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
		// Patch in a custom initialize function...
		// TODO: Fix the TuiGrid to not need this.
		tmpGridView.customConfigureGridSettings = () => 
		{
			tmpGridView.gridData = this.generateDataRepresentation(pView, pGroup);
			tmpGridView.gridSettings.data = tmpGridView.gridData;
		};
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

			for (let j = 0; j < pGroup.Rows.length; j++)
			{
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
					tmpGroupTuiGridConfiguration.TuiColumnSchema.push(tmpTuiGridInput);
				}
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
		// TODO: This feels dirty and out of pattern, but, aaaaagh the id generation is kinda messy because of the layer comms to this layout.  DISCUSS
		tmpTemplate += `<div id="${this.getGridHtmlID(pView, pGroup)}"></div>`;
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
				let tmpTuiRowData = {RecordIndex:j};
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
		return true;
	}

	onDataMarshalToForm(pView, pGroup)
	{
		let tmpTuiGridView = this.getViewGrid(pView, pGroup);
		if (!tmpTuiGridView)
		{
			this.log.error(`PICT Form [${pView.UUID}]::[${pView.Hash}] error marshalling data to form: missing TuiGrid for group ${pGroup.GroupIndex}.`);
			return false;
		}

		return true;
	}
}

module.exports = TuiGridLayout;
