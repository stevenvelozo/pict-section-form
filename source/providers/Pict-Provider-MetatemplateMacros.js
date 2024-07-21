const libPictProvider = require('pict-provider');

const _DefaultProviderConfiguration = (
{
	"ProviderIdentifier": "Pict-Section-Form-Provider-MetatemplateMacros",

	"AutoInitialize": true,
	"AutoInitializeOrdinal": 0,

	"AutoSolveWithApp": false
})

class PictMetatemplateMacros extends libPictProvider
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(_DefaultProviderConfiguration)), pOptions);
		
		super(pFable, tmpOptions, pServiceHash);
	}

	buildInputMacros(pView, pInput)
	{
		let tmpInputMacroKeys = Object.keys(pView.options.MacroTemplates.Input);
		if (!('Macro' in pInput))
		{
			pInput.Macro = {};
		}
		for (let n = 0; n < tmpInputMacroKeys.length; n++)
		{
			pInput.Macro[tmpInputMacroKeys[n]] = pView.pict.parseTemplate(pView.options.MacroTemplates.Input[tmpInputMacroKeys[n]], pInput, null, [pView]);
		}
	}

	rebuildMacros(pView)
	{
		if (!('MacroTemplates' in pView.options))
		{
			return false;
		}

		// Section macros
		let tmpSectionMacroKeys = Object.keys(pView.options.MacroTemplates.Section);
		if (typeof(pView.sectionDefinition.Macro) !== 'object')
		{
			pView.sectionDefinition.Macro = {};
		}
		for (let n = 0; n < tmpSectionMacroKeys.length; n++)
		{
			pView.sectionDefinition.Macro[tmpSectionMacroKeys[n]] = pView.pict.parseTemplate (pView.options.MacroTemplates.Section[tmpSectionMacroKeys[n]], pView.sectionDefinition, null, [pView]);
		}
		for (let i = 0; i < pView.sectionDefinition.Groups.length; i++)
		{
			let tmpGroup = pView.sectionDefinition.Groups[i];

			// Group Macros
			let tmpGroupMacroKeys = Object.keys(pView.options.MacroTemplates.Group);
			if (!('Macro'  in tmpGroup))
			{
				tmpGroup.Macro = {};
			}
			for (let n = 0; n < tmpGroupMacroKeys.length; n++)
			{
				tmpGroup.Macro[tmpGroupMacroKeys[n]] = pView.pict.parseTemplate(pView.options.MacroTemplates.Group[tmpGroupMacroKeys[n]], tmpGroup, null, [pView]);
			}

			if (!Array.isArray(tmpGroup.Rows))
			{
				tmpGroup.Rows = [];
			}
			for (let j = 0; j < tmpGroup.Rows.length; j++)
			{
				// TODO: Do we want row macros?  Let's be still and find out.
				let tmpRow = tmpGroup.Rows[j];
				for (let k = 0; k < tmpRow.Inputs.length; k++)
				{
					this.buildInputMacros(pView, tmpRow.Inputs[k]);
				}
			}

			if (tmpGroup.supportingManifest)
			{
				let tmpSupportingManifestDescriptorKeys = Object.keys(tmpGroup.supportingManifest.elementDescriptors);
				for (let k = 0; k < tmpSupportingManifestDescriptorKeys.length; k++)
				{
					this.buildInputMacros(pView, tmpGroup.supportingManifest.elementDescriptors[tmpSupportingManifestDescriptorKeys[k]]);
				}
			}
		}
	}
}

module.exports = PictMetatemplateMacros;
module.exports.default_configuration = _DefaultProviderConfiguration;


