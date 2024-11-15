// Example overriding of metacontroller filter functions
const libPictSectionForm = require('../../../source/Pict-Section-Form.js');

class MetacontrollerOverride extends libPictSectionForm.PictFormMetacontroller
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onBeforeFilterViews(pViewConfiguration)
	{
		this.log.trace(`onBeforeFilterViews pViewConfiguration.ViewHashList.length: ${pViewConfiguration.ViewHashList.length}`, pViewConfiguration.ViewHashList);
		return pViewConfiguration;
	}

	onAfterFilterViews(pViewConfiguration)
	{
		this.log.trace(`onAfterFilterViews pViewConfiguration.FilteredViewList.length: ${pViewConfiguration.FilteredViewList.length}`);
		return pViewConfiguration;
	}
}

module.exports = MetacontrollerOverride;