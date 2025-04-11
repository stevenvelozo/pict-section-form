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
		// loop over descriptors that have my group set?
		// set their GroupIndex from pGroup
		for (let j = 0; j < pGroup.Rows.length; j++)
		{
			let tmpRow = pGroup.Rows[j];

			// There are three row layouts: Record, Tabular and Columnar
			for (let k = 0; k < tmpRow.Inputs.length; k++)
			{
				let tmpInput = tmpRow.Inputs[k];
				// Update the InputIndex to match the current render config
				tmpInput.PictForm.InputIndex = k;
				tmpInput.PictForm.GroupIndex = pGroup.GroupIndex;
				if (!('Row' in tmpInput.PictForm))
				{
					tmpInput.PictForm.Row = j;
				}
			}
		}
		const hash = pGroup.CustomLayoutTemplateHash;
		if (hash)
		{
			const template = this.pict.TemplateProvider.getTemplate(hash);
			if (template)
			{
				return template;
			}
			this.log.warn(`Custom layout template not found for hash: ${hash}`);
		}
		return pGroup.CustomLayoutTemplate || '';
	}
}

module.exports = RecordLayout;
