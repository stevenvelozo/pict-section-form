const libPictTemplate = require('pict-template');

/**
 * Template tag that renders the editing-controls <td> (del / up / down) for
 * one row of a tabular group when EditingControlsPosition is "left".
 *
 * Usage in a tabular row template:
 *
 *   {~TabularEditingControls:<ViewHash>~}
 *   {~TEC:<ViewHash>~}
 *
 * Reads Record.Group and Record.Key from the MTVS row wrapper, then calls
 * the layout provider's `_renderTabularEditingControlsHTML(view, gi, rk)`.
 *
 * Implemented as a dedicated tag (rather than `{~F:~}`) so it works on the
 * older pict versions some hosts ship with.
 */
class PictTemplateTabularEditingControls extends libPictTemplate
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

		this.addPattern('{~TabularEditingControls:', '~}');
		this.addPattern('{~TEC:', '~}');
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
		if (!tmpLayout || typeof tmpLayout._renderTabularEditingControlsHTML !== 'function')
		{
			return '';
		}
		return tmpLayout._renderTabularEditingControlsHTML(tmpView, tmpGroupIndex, tmpRowKey);
	}
}

module.exports = PictTemplateTabularEditingControls;
