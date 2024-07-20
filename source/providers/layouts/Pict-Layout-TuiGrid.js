const libPictSectionGroupLayout = require('../Pict-Provider-DynamicLayout.js');

const libPictSectionTuiGrid = require('pict-section-tuigrid');

class TuiGridLayout extends libPictSectionGroupLayout
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
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
		let tmpTemplateSetRecordRowTemplate = '';

		tmpTemplate += tmpMetatemplateGenerator.getMetatemplateTemplateReference(pView, `-TabularTemplate-Group-Prefix`, `getGroup("${pGroup.GroupIndex}")`);
		// Tabular templates only have one "row" for the header in the standard template, and then a row for each record.
		// The row for each record happens as a TemplateSet.
		tmpTemplate += tmpMetatemplateGenerator.getMetatemplateTemplateReference(pView, `-TabularTemplate-RowHeader-Prefix`, `getGroup("${pGroup.GroupIndex}")`);
		tmpTemplate += tmpMetatemplateGenerator.getMetatemplateTemplateReference(pView, `-TabularTemplate-RowHeader-ExtraPrefix`, `getGroup("${pGroup.GroupIndex}")`);

		let tmpGroupTuiGridConfiguration = JSON.parse(JSON.stringify(libPictSectionTuiGrid.default_configuration));

		// Decide how to manage data later...
		tmpGroupTuiGridConfiguration.GridData = [];
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

		for (let j = 0; j < tmpGroup.Rows.length; j++)
		{
			if (!tmpGroup.supportingManifest)
			{
				this.log.error(`PICT Form [${pView.UUID}]::[${pView.Hash}] error generating tuigrid metatemplate: missing group manifest ${tmpGroup.RecordManifest} from supportingManifests.`);
				continue;
			}

			for (let k = 0; k < tmpGroup.supportingManifest.elementAddresses.length; k++)
			{
				let tmpSupportingManifestHash = tmpGroup.supportingManifest.elementAddresses[k];
				let tmpInput = tmpGroup.supportingManifest.elementDescriptors[tmpSupportingManifestHash];
				// Update the InputIndex to match the current render config
				if (!('PictForm' in tmpInput))
				{
					tmpInput.PictForm = {};
				}
				tmpInput.PictForm.InputIndex = k;
				tmpInput.PictForm.GroupIndex = tmpGroup.GroupIndex;

				let tmpTuiGridInput = {
					"header": tmpInput.Name,
					"name": tmpInput.Hash,
					// TODO: Should these all trigger solves?  Seems pretty expensive?
					"PictTriggerSolveOnChange": true,
					"PictSectionFormInput": tmpInput
				};
			}
		}

		tmpTemplate += tmpMetatemplateGenerator.getMetatemplateTemplateReference(pView, `-TabularTemplate-RowHeader-ExtraPostfix`, `getGroup("${pGroup.GroupIndex}")`);
		tmpTemplate += tmpMetatemplateGenerator.getMetatemplateTemplateReference(pView, `-TabularTemplate-RowHeader-Postfix`, `getGroup("${pGroup.GroupIndex}")`);

		// This is the template by which the tabular template includes the rows.
		// The recursion here is difficult to envision without drawing it.
		// TODO: Consider making this function available in manyfest in some fashion it seems dope.
		let tmpTemplateSetVirtualRowTemplate = '';
		tmpTemplateSetVirtualRowTemplate += tmpMetatemplateGenerator.getMetatemplateTemplateReference(pView, `-TabularTemplate-Row-Prefix`, `getGroup("${pGroup.GroupIndex}")`);
		tmpTemplateSetVirtualRowTemplate += tmpMetatemplateGenerator.getMetatemplateTemplateReferenceRaw(pView, `-TabularTemplate-Row-ExtraPrefix`, `Record`);
		tmpTemplateSetVirtualRowTemplate += `\n\n{~T:${tmpGroup.SectionTabularRowTemplateHash}:Record~}\n`;
		tmpTemplateSetVirtualRowTemplate += tmpMetatemplateGenerator.getMetatemplateTemplateReferenceRaw(pView, `-TabularTemplate-Row-ExtraPostfix`, `Record`);
		tmpTemplateSetVirtualRowTemplate += tmpMetatemplateGenerator.getMetatemplateTemplateReference(pView, `-TabularTemplate-Row-Postfix`, `getGroup("${pGroup.GroupIndex}")`);

		// This is a custom template expression
		tmpTemplate += `\n\n{~MTVS:${tmpGroup.SectionTabularRowVirtualTemplateHash}:${tmpGroup.GroupIndex}:${pView.getMarshalDestinationAddress()}.${tmpGroup.RecordSetAddress}~}\n`;

		tmpTemplate += tmpMetatemplateGenerator.getMetatemplateTemplateReference(pView, `-TabularTemplate-Group-Postfix`, `getGroup("${pGroup.GroupIndex}")`);
		// Add the TemplateSetTemplate
		this.pict.TemplateProvider.addTemplate(tmpGroup.SectionTabularRowVirtualTemplateHash, tmpTemplateSetVirtualRowTemplate);
		this.pict.TemplateProvider.addTemplate(tmpGroup.SectionTabularRowTemplateHash, tmpTemplateSetRecordRowTemplate);

		return tmpTemplate;
	}
}

module.exports = TuiGridLayout;
