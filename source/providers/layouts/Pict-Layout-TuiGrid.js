const libPictSectionGroupLayout = require('../Pict-Provider-DynamicLayout.js');

const libPictSectionTuiGrid = require('pict-section-tuigrid');

class TuiGridLayout extends libPictSectionGroupLayout
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.views = {};
	}

	getViewTuiHtmlID(pView, pGroup)
	{
		return `${pView.UUID}-GroupTuiGrid-${pGroup.GroupIndex}`;
	}

	getViewTuiConfiguration(pView, pGroup)
	{
		// If there isn't yet a tui configuration, make a new one.
		if (!this.views.hasOwnProperty(pView.UUID))
		{
			this.views[pView.UUID] = {};
		}

		// If there was a grid config created with this group index already, just use that.
		if (this.views[pView.UUID].hasOwnProperty(pGroup.GroupIndex))
		{
			return this.views[pView.UUID][pGroup.GroupIndex];
		}
		else
		{
			// Generate a unique destination for the TuiGrid
			let tmpGroupTuiGridConfiguration = JSON.parse(JSON.stringify(libPictSectionTuiGrid.default_configuration));
			tmpGroupTuiGridConfiguration.GridData = [];
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
	}

	/**
	 * Generate a group layout template for a single-record dynamically generated group view.
	 * 
	 * This is the standard name / field entry form that you're used to filling out for addresses
	 * and such.
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
		tmpTemplate += `<div id="${this.getViewTuiHtmlID(pView, pGroup)}"></div>`;
		tmpTemplate += tmpMetatemplateGenerator.getMetatemplateTemplateReference(pView, `-Template-Group-Postfix`, `getGroup("${pGroup.GroupIndex}")`);

		return tmpTemplate;
	}
}

module.exports = TuiGridLayout;
