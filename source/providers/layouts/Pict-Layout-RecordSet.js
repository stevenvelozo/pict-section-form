const libPictSectionGroupLayout = require('../Pict-Provider-DynamicLayout.js');

class RecordSetLayout extends libPictSectionGroupLayout
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		/** @type {import('pict')} */
		this.pict;
		/** @type {import('pict')} */
		this.fable;
		/** @type {any} */
		this.log;
	}

	/**
	 * Generate a group layout template for a complex multi-record repeated form view.
	 *
	 * This is the standard name / field entry form that you're used to filling out for addresses
	 * and such, only, it will render itself once for each element in a set.
	 *
	 * @param {object} pView - The view to generate the dynamic group layout for
	 * @param {object} pGroup - The group to generate and inject dynamic layout templates
	 * @returns {string} - The template for the group
	 */
	generateGroupLayoutTemplate(pView, pGroup)
	{
		// TODO: We cheated and this is still tabular.  Gotta change it up!
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
		tmpTemplate += tmpMetatemplateGenerator.getMetatemplateTemplateReference(pView, `-RecordSetTemplate-Group-Prefix`, `getGroup("${pGroup.GroupIndex}")`);

		let tmpMaxRowIndex = 0;
		for (let k = 0; k < pGroup.supportingManifest.elementAddresses.length; k++)
		{
			let tmpSupportingManifestHash = pGroup.supportingManifest.elementAddresses[k];
			let tmpInput = pGroup.supportingManifest.elementDescriptors[tmpSupportingManifestHash];
			// Update the InputIndex to match the current render config
			if (!('PictForm' in tmpInput))
			{
				tmpInput.PictForm = {};
			}
			if (tmpInput.PictForm.TabularHidden)
			{
				continue;
			}
			tmpInput.PictForm.InputIndex = k;
			tmpInput.PictForm.GroupIndex = pGroup.GroupIndex;
			if (tmpInput.PictForm.Row)
			{
				tmpInput.PictForm.RowIndex = tmpInput.PictForm.Row;
				if (tmpInput.PictForm.RowIndex > tmpMaxRowIndex)
				{
					tmpMaxRowIndex = tmpInput.PictForm.RowIndex;
				}
			}
		}

		for (let k = 0; k < pGroup.supportingManifest.elementAddresses.length; k++)
		{
			let tmpSupportingManifestHash = pGroup.supportingManifest.elementAddresses[k];
			let tmpInput = pGroup.supportingManifest.elementDescriptors[tmpSupportingManifestHash];
			// Update the InputIndex to match the current render config
			if (!('PictForm' in tmpInput))
			{
				tmpInput.PictForm = {};
			}
			if (tmpInput.PictForm.TabularHidden)
			{
				continue;
			}
			if (!tmpInput.PictForm.RowIndex)
			{
				tmpInput.PictForm.RowIndex = tmpMaxRowIndex + 1;
			}
		}

		for (let d = 0; d < tmpMaxRowIndex + 1; d++)
		{
			tmpTemplateSetRecordRowTemplate += tmpMetatemplateGenerator.getMetatemplateTemplateReference(pView, `-Template-Row-Prefix`, `getGroup("${pGroup.GroupIndex}")`);
			for (let k = 0; k < pGroup.supportingManifest.elementAddresses.length; k++)
			{
				let tmpSupportingManifestHash = pGroup.supportingManifest.elementAddresses[k];
				let tmpInput = pGroup.supportingManifest.elementDescriptors[tmpSupportingManifestHash];
				// Update the InputIndex to match the current render config
				if (tmpInput.PictForm.TabularHidden)
				{
					continue;
				}

				// tmpTemplate += tmpMetatemplateGenerator.getMetatemplateTemplateReference(pView, `-TabularTemplate-HeaderCell`, `getTabularRecordInput("${pGroup.GroupIndex}","${k}")`);
				if (tmpInput.PictForm.RowIndex == d)
				{
					tmpTemplateSetRecordRowTemplate += tmpMetatemplateGenerator.getMetatemplateTemplateReference(pView, `-RecordSetTemplate-Cell-Prefix`, `getTabularRecordInput("${pGroup.GroupIndex}","${k}")`);
					let tmpInputType = (('PictForm' in tmpInput) && tmpInput.PictForm.InputType) ? tmpInput.PictForm.InputType : 'Default';
					tmpTemplateSetRecordRowTemplate += tmpMetatemplateGenerator.getTabularInputMetatemplateTemplateReference(pView, tmpInput.DataType, tmpInputType, `getTabularRecordInput("${pGroup.GroupIndex}","${k}")`, pGroup.GroupIndex, k);
					tmpTemplateSetRecordRowTemplate += tmpMetatemplateGenerator.getMetatemplateTemplateReference(pView, `-RecordSetTemplate-Cell-Postfix`, `getTabularRecordInput("${pGroup.GroupIndex}","${k}")`);
				}
			}
			tmpTemplateSetRecordRowTemplate += tmpMetatemplateGenerator.getMetatemplateTemplateReference(pView, `-Template-Row-Postfix`, `getGroup("${pGroup.GroupIndex}")`);
		}

		// This is the template by which the tabular template includes the rows.
		// The template recursion here is difficult to envision without drawing it.
		// TODO: Consider making this function available in manyfest in some fashion it seems dope.
		let tmpTemplateSetVirtualRowTemplate = '';
		tmpTemplateSetVirtualRowTemplate += tmpMetatemplateGenerator.getMetatemplateTemplateReference(pView, `-RecordSetTemplate-Row-Prefix`, `getGroup("${pGroup.GroupIndex}")`);
		tmpTemplateSetVirtualRowTemplate += tmpMetatemplateGenerator.getMetatemplateTemplateReferenceRaw(pView, `-RecordSetTemplate-Row-ExtraPrefix`, `Record`);
		tmpTemplateSetVirtualRowTemplate += `\n\n{~T:${pGroup.SectionTabularRowTemplateHash}:Record~}\n`;
		tmpTemplateSetVirtualRowTemplate += tmpMetatemplateGenerator.getMetatemplateTemplateReferenceRaw(pView, `-RecordSetTemplate-Row-ExtraPostfix`, `Record`);
		tmpTemplateSetVirtualRowTemplate += tmpMetatemplateGenerator.getMetatemplateTemplateReference(pView, `-RecordSetTemplate-Row-Postfix`, `getGroup("${pGroup.GroupIndex}")`);

		// This is a custom template expression
		tmpTemplate += `\n\n{~MTVS:${pGroup.SectionTabularRowVirtualTemplateHash}:${pGroup.GroupIndex}:${pView.getMarshalDestinationAddress()}.${pGroup.RecordSetAddress}~}\n`;

		tmpTemplate += tmpMetatemplateGenerator.getMetatemplateTemplateReference(pView, `-RecordSetTemplate-Group-Postfix`, `getGroup("${pGroup.GroupIndex}")`);
		// Add the TemplateSetTemplate
		this.pict.TemplateProvider.addTemplate(pGroup.SectionTabularRowVirtualTemplateHash, tmpTemplateSetVirtualRowTemplate);
		this.pict.TemplateProvider.addTemplate(pGroup.SectionTabularRowTemplateHash, tmpTemplateSetRecordRowTemplate);

		return tmpTemplate;
	}
}

module.exports = RecordSetLayout;
