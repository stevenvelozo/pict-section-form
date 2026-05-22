const libPictTemplate = require('pict-template');

/**
 * Template tag that renders the left-side row-label <td> cells for one row
 * of a tabular group with `RowLabels` configured.
 *
 * Usage in a tabular row template:
 *
 *   {~TabularRowLabels:<ViewHash>~}
 *   {~TRL:<ViewHash>~}
 *
 * The current Record context is expected to be the MTVS wrapper
 * (`{ Value, Key, Group }`); the tag reads `Record.Group` and `Record.Key`
 * to look up the group's precomputed `RowLabelMetadata[Record.Key].Cells`
 * and renders one `<td rowspan>` per non-skipped cell.
 *
 * This is implemented as a dedicated tag (rather than `{~F:~}`) so it works
 * on the older pict versions some hosts ship with.
 */
class PictTemplateTabularRowLabels extends libPictTemplate
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

		this.addPattern('{~TabularRowLabels:', '~}');
		this.addPattern('{~TRL:', '~}');
	}

	render(pTemplateHash, pRecord, pContextArray, pScope, pState)
	{
		let tmpHash = pTemplateHash.trim();
		if (!tmpHash || !pRecord)
		{
			return '';
		}
		let tmpView = this.pict.views[tmpHash];
		if (!tmpView)
		{
			return '';
		}
		let tmpGroupIndex = pRecord.Group;
		let tmpRowKey = pRecord.Key;
		let tmpLayout = this.pict.providers['Pict-Layout-Tabular'];
		if (!tmpLayout || typeof tmpLayout._renderTabularRowLabelsHTML !== 'function')
		{
			return '';
		}
		return tmpLayout._renderTabularRowLabelsHTML(tmpView, tmpGroupIndex, tmpRowKey);
	}
}

module.exports = PictTemplateTabularRowLabels;
