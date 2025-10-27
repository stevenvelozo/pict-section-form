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
			// TODO: Validate that the row exists?  Bootstrap seems to have it here.
			let tmpRow = pGroup.Rows[j]
			tmpRow.WidthTotalRaw = 0;

			tmpTemplate += tmpMetatemplateGenerator.getMetatemplateTemplateReference(pView, `-Template-Row-Prefix`, `getGroup("${pGroup.GroupIndex}")`);

			for (let k = 0; k < tmpRow.Inputs.length; k++)
			{
				let tmpInput = tmpRow.Inputs[k];
				// Update the InputIndex to match the current render config
				tmpInput.PictForm.InputIndex = k;
				tmpInput.PictForm.GroupIndex = pGroup.GroupIndex;
				tmpInput.PictForm.RowIndex = j;
				let tmpInputWidth = 1;
				try
				{
					tmpInputWidth = Math.abs(parseFloat(tmpInput.PictForm.Width));
				}
				catch (pParseError)
				{
					tmpInputWidth = 1;
				}
				if (!tmpInputWidth || isNaN(tmpInputWidth) || tmpInputWidth <= 0)
				{
					tmpInputWidth = 1;
				}
				tmpInput.PictForm.RawWidth = tmpInputWidth;
				tmpRow.WidthTotalRaw += tmpInputWidth;

				//tmpTemplate += tmpMetatemplateGenerator.getInputMetatemplateTemplateReference(pView, tmpInput.DataType, tmpInput.PictForm.InputType, `getInput("${pGroup.GroupIndex}","${j}","${k}")`);
			}
			// Now that we've gotten all the raw widths for the row, quantize them properly.
			// Default by quantizing to 99 percentage units wide
			let tmpGroupQuantizedWidth = 95;
			if ('WidthQuantization' in pGroup)
			{
				try
				{
					tmpGroupQuantizedWidth = Math.abs(parseInt(pGroup.WidthQuantization));
					if (!tmpGroupQuantizedWidth || isNaN(tmpGroupQuantizedWidth) || tmpGroupQuantizedWidth <= 0)
					{
						tmpGroupQuantizedWidth = 95;
					}
				}
				catch(pParseError)
				{
					// TODO: UGH THIS IS NaN at the moment.......
					tmpGroupQuantizedWidth = 95;
				}
			}
			else if ('WidthQuantization' in this.pict.PictApplication.options)
			{
				tmpGroupQuantizedWidth = this.pict.PictApplication.options.WidthQuantization;
			}
			for (let k = 0; k < tmpRow.Inputs.length; k++)
			{
				let tmpInput = tmpRow.Inputs[k];
				tmpInput.PictForm.QuantizedWidth = Math.round((tmpInput.PictForm.RawWidth / tmpRow.WidthTotalRaw) * tmpGroupQuantizedWidth);
				//this.fable.log.trace(`Quantized input width for Group ${pGroup.GroupIndex} Row ${j} Input ${k} (${tmpInput.Name}) to ${tmpInput.PictForm.QuantizedWidth} (Raw: ${tmpInput.PictForm.RawWidth} / Total Raw: ${tmpRow.WidthTotalRaw} / Group Quantization: ${tmpGroupQuantizedWidth})`);

				tmpTemplate += tmpMetatemplateGenerator.getInputMetatemplateTemplateReference(pView, tmpInput.DataType, tmpInput.PictForm.InputType, `getInput("${pGroup.GroupIndex}","${j}","${k}")`);
			}

			tmpTemplate += tmpMetatemplateGenerator.getMetatemplateTemplateReference(pView, `-Template-Row-Postfix`, `getGroup("${pGroup.GroupIndex}")`);
		}
		tmpTemplate += tmpMetatemplateGenerator.getMetatemplateTemplateReference(pView, `-Template-Group-Postfix`, `getGroup("${pGroup.GroupIndex}")`);

		return tmpTemplate;
	}
}

module.exports = RecordLayout;
