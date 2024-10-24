const libPictProvider = require('pict-provider');

const _DefaultProviderConfiguration = (
{
	"ProviderIdentifier": "Pict-DynamicForms-MetatemplateMacros",

	"AutoInitialize": true,
	"AutoInitializeOrdinal": 0,

	"AutoSolveWithApp": false
})

/**
 * Class representing PictMetatemplateMacros.
 * @extends libPictProvider
 */
class PictMetatemplateMacros extends libPictProvider
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(_DefaultProviderConfiguration)), pOptions);
		
		super(pFable, tmpOptions, pServiceHash);

		this.additionalInputMacros = {};
		if ('AdditionalInputMacros' in this.options)
		{
			this.additionalInputMacros = Object.assign(this.additionalInputMacros, this.options.AdditionalInputMacros);
		}
		if ('CustomInputMacros' in this.pict.settings)
		{
			this.AdditionalInputMacros = Object.assign(this.additionalInputMacros, this.pict.settings.CustomInputMacros);
		}

		this.additionalGroupMacros = {};
		if ('AdditionalGroupMacros' in this.options)
		{
			this.additionalGroupMacros = Object.assign(this.additionalGroupMacros, this.options.AdditionalGroupMacros);
		}
		if ('CustomGroupMacros' in this.pict.settings)
		{
			this.additionalGroupMacros = Object.assign(this.additionalGroupMacros, this.pict.settings.CustomGroupMacros);
		}

		this.additionalSectionMacros = {};
		if ('AdditionalSectionMacros' in this.options)
		{
			this.additionalSectionMacros = Object.assign(this.additionalSectionMacros, this.options.AdditionalSectionMacros);
		}
		if ('CustomSectionMacros' in this.pict.settings)
		{
			this.additionalSectionMacros = Object.assign(this.additionalSectionMacros, this.pict.settings.CustomSectionMacros);
		}
	}

	/**
	 * Builds macros for the given input.
	 * 
	 * @param {Object} pView - The view object.
	 * @param {Object} pInput - The input object.
	 */
	buildInputMacros(pView, pInput)
	{
		let tmpInputMacroKeys = Object.keys(pView.options.MacroTemplates.Input);
		let tmpAdditionalInputMacroKeys = Object.keys(this.additionalInputMacros);
		if (!('Macro' in pInput))
		{
			pInput.Macro = {};
		}
		for (let n = 0; n < tmpInputMacroKeys.length; n++)
		{
			pInput.Macro[tmpInputMacroKeys[n]] = pView.pict.parseTemplate(pView.options.MacroTemplates.Input[tmpInputMacroKeys[n]], pInput, null, [pView]);
		}
		for (let n = 0; n < tmpAdditionalInputMacroKeys.length; n++)
		{
			pInput.Macro[tmpAdditionalInputMacroKeys[n]] = pView.pict.parseTemplate(this.additionalInputMacros[tmpAdditionalInputMacroKeys[n]], pInput, null, [pView]);
		}
	}

	/**
	 * Rebuilds macros for the given view.
	 * 
	 * @param {Object} pView - The view object.
	 * @returns {boolean} - Returns false if MacroTemplates is not present in pView.options.
	 */
	rebuildMacros(pView)
	{
		if (!('MacroTemplates' in pView.options))
		{
			return false;
		}

		// Section macros
		let tmpSectionMacroKeys = Object.keys(pView.options.MacroTemplates.Section);
		let tmpAdditionalSectionMacroKeys = Object.keys(this.additionalSectionMacros);
		if (typeof(pView.sectionDefinition.Macro) !== 'object')
		{
			pView.sectionDefinition.Macro = {};
		}
		for (let n = 0; n < tmpSectionMacroKeys.length; n++)
		{
			pView.sectionDefinition.Macro[tmpSectionMacroKeys[n]] = pView.pict.parseTemplate (pView.options.MacroTemplates.Section[tmpSectionMacroKeys[n]], pView.sectionDefinition, null, [pView]);
		}
		for (let n = 0; n < tmpAdditionalSectionMacroKeys.length; n++)
		{
			pView.sectionDefinition.Macro[tmpAdditionalSectionMacroKeys[n]] = pView.pict.parseTemplate (this.additionalSectionMacros[tmpAdditionalSectionMacroKeys[n]], pView.sectionDefinition, null, [pView]);
		}
		for (let i = 0; i < pView.sectionDefinition.Groups.length; i++)
		{
			let tmpGroup = pView.sectionDefinition.Groups[i];

			// Group Macros
			let tmpGroupMacroKeys = Object.keys(pView.options.MacroTemplates.Group);
			let tmpAdditionalGroupMacroKeys = Object.keys(this.additionalGroupMacros);
			if (!('Macro'  in tmpGroup))
			{
				tmpGroup.Macro = {};
			}
			for (let n = 0; n < tmpGroupMacroKeys.length; n++)
			{
				tmpGroup.Macro[tmpGroupMacroKeys[n]] = pView.pict.parseTemplate(pView.options.MacroTemplates.Group[tmpGroupMacroKeys[n]], tmpGroup, null, [pView]);
			}
			for (let n = 0; n < tmpAdditionalGroupMacroKeys.length; n++)
			{
				tmpGroup.Macro[tmpAdditionalGroupMacroKeys[n]] = pView.pict.parseTemplate(this.additionalGroupMacros[tmpAdditionalGroupMacroKeys[n]], tmpGroup, null, [pView]);
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


