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
					let tmpInput = tmpRow.Inputs[k];
					// Input Macros
					let tmpInputMacroKeys = Object.keys(pView.options.MacroTemplates.Input);
					if (!('Macro' in tmpInput))
					{
						tmpInput.Macro = {};
					}
					for (let n = 0; n < tmpInputMacroKeys.length; n++)
					{
						tmpInput.Macro[tmpInputMacroKeys[n]] = pView.pict.parseTemplate (pView.options.MacroTemplates.Input[tmpInputMacroKeys[n]], tmpInput, null, [pView]);
					}
				}
			}

			if (tmpGroup.supportingManifest)
			{
				let tmpSupportingManifestDescriptorKeys = Object.keys(tmpGroup.supportingManifest.elementDescriptors);
				for (let k = 0; k < tmpSupportingManifestDescriptorKeys.length; k++)
				{
					let tmpInput = tmpGroup.supportingManifest.elementDescriptors[tmpSupportingManifestDescriptorKeys[k]];

					// Input Macros
					let tmpInputMacroKeys = Object.keys(pView.options.MacroTemplates.Input);
					if (!('Macro' in tmpInput))
					{
						tmpInput.Macro = {};
					}
					for (let n = 0; n < tmpInputMacroKeys.length; n++)
					{
						tmpInput.Macro[tmpInputMacroKeys[n]] = pView.pict.parseTemplate (pView.options.MacroTemplates.Input[tmpInputMacroKeys[n]], tmpInput, null, [pView]);
					}
				}
			}

			if (tmpGroup.RecordSetAddress)
			{
				// Check if there is a record set address
				let tmpMarshalDestinationObject = pView.getMarshalDestinationObject();
				let tmpRecordSetDataObjectExists = pView.sectionManifest.checkAddressExistsByHash(tmpMarshalDestinationObject, tmpGroup.RecordSetAddress);
				let tmpRecordSetDataObject = pView.sectionManifest.getValueAtAddress(tmpMarshalDestinationObject, tmpGroup.RecordSetAddress);
				if (!tmpRecordSetDataObjectExists)
				{
					pView.log.warn(`Automatically setting an empty array at [${tmpGroup.RecordSetAddress}].`);
					pView.sectionManifest.setValueByHash(tmpMarshalDestinationObject, tmpGroup.RecordSetAddress, []);
				}
				else if (Array.isArray(tmpRecordSetDataObject))
				{
					pView.log.trace(`RecordSetAddress is an Array for [${tmpGroup.Hash}]`);
				}
				else if (typeof(tmpRecordSetDataObject) === 'object')
				{
					pView.log.trace(`RecordSetAddress is an Object for [${tmpGroup.Hash}]`);
				}
				else
				{
					pView.log.error(`RecordSetAddress is not an Array or Object for [${tmpGroup.Hash}]; it is a [${typeof(tmpRecordSetDataObject)}] -- likely the data shape will cause erratic problems.`);
				}
			}
		}
	}
}

module.exports = PictMetatemplateMacros;
module.exports.default_configuration = _DefaultProviderConfiguration;


