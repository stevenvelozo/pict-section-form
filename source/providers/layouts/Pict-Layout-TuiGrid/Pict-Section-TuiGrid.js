const libPictSectionTuiGrid = require('pict-section-tuigrid');

class TuiGridLayout extends libPictSectionTuiGrid
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.viewGridConfigurations = {};

		this.cachedGridData = [];
	}

	customConfigureGridSettings()
	{
		// Set the grid data to the cached grid data
		this.gridSettings.data = this.cachedGridData;
		return super.customConfigureGridSettings();
	}

	changeHandler(pChangeData)
	{
		// Update the state in our model based on the grid

		for (let i = 0; i < pChangeData.changes.length; i++)
		{
			let tmpChange = pChangeData.changes[i];
			let tmpRowIndex = pChangeData.instance.getValue(tmpChange.rowKey, 'RecordIndex');
			// TODO: Right now each of these calls runs a solve() on the entire form.  This is not ideal.
			pChangeData.instance.View.setDataTabularByHash(pChangeData.instance.Group.GroupIndex, tmpChange.columnName, tmpRowIndex, tmpChange.value);
		}

		return super.changeHandler(pChangeData);
	}
}

module.exports = TuiGridLayout;