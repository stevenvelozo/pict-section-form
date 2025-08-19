const libPictSectionGroupLayout = require('../Pict-Provider-DynamicLayout.js');

class RecordLayout extends libPictSectionGroupLayout
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
		let tmpMetatemplateGenerator = this.pict.providers.MetatemplateGenerator;
		let tmpTemplate = '';

		if (!('Rows' in pGroup))
		{
			pGroup.Rows = [];
		}

		tmpTemplate += tmpMetatemplateGenerator.getMetatemplateTemplateReference(pView, `-Template-Group-Prefix`, `getGroup("${pGroup.GroupIndex}")`);
		for (let j = 0; j < pGroup.Rows.length; j++)
		{
			let tmpRow = pGroup.Rows[j];

			tmpTemplate += tmpMetatemplateGenerator.getMetatemplateTemplateReference(pView, `-Template-Row-Prefix`, `getGroup("${pGroup.GroupIndex}")`);

			for (let k = 0; k < tmpRow.Inputs.length; k++)
			{
				let tmpInput = tmpRow.Inputs[k];
				// Update the InputIndex to match the current render config
				tmpInput.PictForm.InputIndex = k;
				tmpInput.PictForm.GroupIndex = pGroup.GroupIndex;
				tmpInput.PictForm.RowIndex = j;

				tmpTemplate += tmpMetatemplateGenerator.getInputMetatemplateTemplateReference(pView, tmpInput.DataType, tmpInput.PictForm.InputType, `getInput("${pGroup.GroupIndex}","${j}","${k}")`);
			}
			tmpTemplate += tmpMetatemplateGenerator.getMetatemplateTemplateReference(pView, `-Template-Row-Postfix`, `getGroup("${pGroup.GroupIndex}")`);
		}
		tmpTemplate += tmpMetatemplateGenerator.getMetatemplateTemplateReference(pView, `-Template-Group-Postfix`, `getGroup("${pGroup.GroupIndex}")`);

		return tmpTemplate;
	}
}

module.exports = RecordLayout;
