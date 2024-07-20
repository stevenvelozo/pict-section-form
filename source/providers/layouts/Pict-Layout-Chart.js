const libPictSectionGroupLayout = require('../Pict-Provider-DynamicLayout.js');

class ChartLayout extends libPictSectionGroupLayout
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	/**
	 * Generate a group layout template for a Configuration-based Chart.
	 * 
	 * @param {object} pView - The view to generate the dynamic group layout for
	 * @param {object} pGroup - The group to generate and inject dynamic layout templates
	 * @returns {string} - The template for the group
	 */
	generateGroupLayoutTemplate(pView, pGroup)
	{
		let tmpMetatemplateGenerator = this.pict.providers.MetatemplateGenerator;
		let tmpTemplate = '';

		tmpTemplate += tmpMetatemplateGenerator.getMetatemplateTemplateReference(pView, `-Template-Group-Prefix`, `getGroup("${pGroup.GroupIndex}")`);
		// Chart Parameters!!!
		tmpTemplate += 'No really... this is a chart.';
		tmpTemplate += tmpMetatemplateGenerator.getMetatemplateTemplateReference(pView, `-Template-Group-Postfix`, `getGroup("${pGroup.GroupIndex}")`);

		return tmpTemplate;
	}
}

module.exports = ChartLayout;