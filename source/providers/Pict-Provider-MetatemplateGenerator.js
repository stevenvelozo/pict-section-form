const libPictProvider = require('pict-provider');

const libPictSectionTuiGrid = require('pict-section-tuigrid');

const _DefaultProviderConfiguration = (
{
	"ProviderIdentifier": "Pict-Section-Form-Provider-MetatemplateGenerator",

	"AutoInitialize": true,
	"AutoInitializeOrdinal": 0,

	"AutoSolveWithApp": false
})

class PictMetatemplateGenerator extends libPictProvider
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(_DefaultProviderConfiguration)), pOptions);
		
		super(pFable, tmpOptions, pServiceHash);
	}

	getMetatemplateAddressFromInput(pView, pDataType, pInputType)
	{
		// Input types are customizable -- there could be 30 different input types for the string data type with special handling and templates
		let tmpTemplateBeginInputTypePostfix = `-TabularTemplate-Begin-Input-InputType-${pInputType}`;
		let tmpTemplateMidInputTypePostfix = `-TabularTemplate-Mid-Input-InputType-${pInputType}`;
		let tmpTemplateEndInputTypePostfix = `-TabularTemplate-End-Input-InputType-${pInputType}`;
		// Data types are not customizable; they are a fixed list based on what is available in Manyfest
		let tmpTemplateBeginDataTypePostfix = `-TabularTemplate-Begin-Input-DataType-${pDataType}`;
		let tmpTemplateMidDataTypePostfix = `-TabularTemplate-Mid-Input-DataType-${pDataType}`;
		let tmpTemplateEndDataTypePostfix = `-TabularTemplate-End-Input-DataType-${pDataType}`;

		// Tabular inputs are done in three parts -- the "begin", the "address" of the data and the "end".

		// This means it is easily extensible to work on JSON objects as well as arrays.
		let tmpMidTemplate = this.getMetatemplateTemplateReference(pView, '-TabularTemplate-Mid-Input', pViewDataAddress, pGroupIndex, pRowIndex);
		let tmpInformaryDataAddressTemplate = this.getMetatemplateTemplateReference(pView, '-TabularTemplate-InformaryAddress-Input', pViewDataAddress, pGroupIndex, pRowIndex);

		// First check if there is an "input type" template available in either the section-specific configuration or in the general
		if (pInputType)
		{
			let tmpBeginTemplate = this.getMetatemplateTemplateReference(pView, tmpTemplateBeginInputTypePostfix, pViewDataAddress);
			let tmpEndTemplate = this.getMetatemplateTemplateReference(pView, tmpTemplateEndInputTypePostfix, pViewDataAddress);
			if (tmpBeginTemplate && tmpEndTemplate)
			{
				return tmpBeginTemplate + tmpMidTemplate + tmpInformaryDataAddressTemplate + tmpEndTemplate;
			}
		}

		// If we didn't find the template for the "input type", check for the "data type"
		let tmpBeginTemplate = this.getMetatemplateTemplateReference(pView, tmpTemplateBeginDataTypePostfix, pViewDataAddress);
		let tmpEndTemplate = this.getMetatemplateTemplateReference(pView, tmpTemplateEndDataTypePostfix, pViewDataAddress);
		if (tmpBeginTemplate && tmpEndTemplate)
		{
			let tmpCustomMidTemplate = this.getMetatemplateTemplateReference(pView, tmpTemplateMidDataTypePostfix, pViewDataAddress, pGroupIndex, pRowIndex);
			tmpMidTemplate = (tmpCustomMidTemplate) ? tmpCustomMidTemplate : tmpMidTemplate;
			return tmpBeginTemplate + tmpMidTemplate + tmpInformaryDataAddressTemplate + tmpEndTemplate;
		}
	


		// If we didn't find the template for the "input type", or the "data type", fall back to the default
		tmpBeginTemplate = this.getMetatemplateTemplateReference(pView, 'TabularTemplate-Begin-Input', pViewDataAddress);
		tmpEndTemplate = this.getMetatemplateTemplateReference(pView, 'TabularTemplate-End-Input', pViewDataAddress);
		if (tmpBeginTemplate && tmpEndTemplate)
		{
			return tmpBeginTemplate + tmpMidTemplate + tmpInformaryDataAddressTemplate + tmpEndTemplate;
		}
	
		// There was some kind of catastrophic failure -- the above templates should always be loaded.
		this.log.error(`PICT Form [${pView.UUID}]::[${pView.Hash}] catastrophic error generating tabular metatemplate: missing input template for Data Type ${pDataType} and Input Type ${pInputType}, Data Address ${pViewDataAddress}, Group Index ${pGroupIndex} and Record Subaddress ${pRowIndex}.`)
		return '';
	}

	getMetatemplateTemplateReferenceRaw(pView, pTemplatePostfix, pRawTemplateDataAddress)
	{
		// 1. Check if there is a section-specific template loaded
		if (pView.checkViewSpecificTemplate(pTemplatePostfix))
		{
			return `\n{~T:${pView.formsTemplateSetPrefix}${pTemplatePostfix}:${pRawTemplateDataAddress}~}`;
		}
		// 2. Check if there is a theme-specific template loaded for this postfix
		else if (pView.checkThemeSpecificTemplate(pTemplatePostfix))
		{
			return `\n{~T:${pView.defaultTemplatePrefix}${pTemplatePostfix}:${pRawTemplateDataAddress}~}`;
		}
		// 3. This shouldn't happen if the template is based on the base class.
		else
		{
			return false;
		}
	}

	getMetatemplateTemplateReference(pView, pTemplatePostfix, pViewDataAddress)
	{
		return this.getMetatemplateTemplateReferenceRaw(pView, pTemplatePostfix, `Pict.views["${pView.Hash}"].${pViewDataAddress}`);
	}

	checkMetatemplateReference(pView, pDataType, pInputType)
	{
		// Input types are customizable -- there could be 30 different input types for the string data type with special handling and templates
		let tmpTemplateInputTypePostfix = `-Template-Input-InputType-${pInputType}`;
		// Data types are not customizable; they are a fixed list based on what is available in Manyfest
		let tmpTemplateDataTypePostfix = `-Template-Input-DataType-${pDataType}`;

		// 1. Check if there is a section-specific template loaded
		if (pView.checkViewSpecificTemplate(tmpTemplateInputTypePostfix))
		{
			return `\n{~T:${pView.formsTemplateSetPrefix}${pTemplatePostfix}:${pRawTemplateDataAddress}~}`;
		}
		// 2. Check if there is a theme-specific template loaded for this postfix
		else if (pView.checkThemeSpecificTemplate(pTemplatePostfix))
		{
			return `\n{~T:${pView.defaultTemplatePrefix}${pTemplatePostfix}:${pRawTemplateDataAddress}~}`;
		}
		// 3. This shouldn't happen if the template is based on the base class.
		else
		{
			return false;
		}
	}

	getInputMetatemplateTemplateReference(pView, pDataType, pInputType, pViewDataAddress)
	{
		// Input types are customizable -- there could be 30 different input types for the string data type with special handling and templates
		let tmpTemplateInputTypePostfix = `-Template-Input-InputType-${pInputType}`;
		// Data types are not customizable; they are a fixed list based on what is available in Manyfest
		let tmpTemplateDataTypePostfix = `-Template-Input-DataType-${pDataType}`;

		// First check if there is an "input type" template available in either the section-specific configuration or in the general
		if (pInputType)
		{
			let tmpTemplate = this.getMetatemplateTemplateReference(pView, tmpTemplateInputTypePostfix, pViewDataAddress);
			if (tmpTemplate)
			{
				return tmpTemplate;
			}
		}

		// If we didn't find the template for the "input type", check for the "data type"
		let tmpTemplate = this.getMetatemplateTemplateReference(pView, tmpTemplateDataTypePostfix, pViewDataAddress);
		if (tmpTemplate)
		{
			return tmpTemplate;
		}
	
		// There wasn't an input type specific or data type specific template, so fall back to the generic input template.
		return this.getMetatemplateTemplateReference(pView, '-Template-Input', pViewDataAddress);
	}

	getTabularInputMetatemplateTemplateReference(pView, pDataType, pInputType, pViewDataAddress, pGroupIndex, pRowIndex)
	{
		// Input types are customizable -- there could be 30 different input types for the string data type with special handling and templates
		let tmpTemplateBeginInputTypePostfix = `-TabularTemplate-Begin-Input-InputType-${pInputType}`;
		let tmpTemplateMidInputTypePostfix = `-TabularTemplate-Mid-Input-InputType-${pInputType}`;
		let tmpTemplateEndInputTypePostfix = `-TabularTemplate-End-Input-InputType-${pInputType}`;
		// Data types are not customizable; they are a fixed list based on what is available in Manyfest
		let tmpTemplateBeginDataTypePostfix = `-TabularTemplate-Begin-Input-DataType-${pDataType}`;
		let tmpTemplateMidDataTypePostfix = `-TabularTemplate-Mid-Input-DataType-${pDataType}`;
		let tmpTemplateEndDataTypePostfix = `-TabularTemplate-End-Input-DataType-${pDataType}`;

		// Tabular inputs are done in three parts -- the "begin", the "address" of the data and the "end".

		// This means it is easily extensible to work on JSON objects as well as arrays.
		let tmpMidTemplate = this.getMetatemplateTemplateReference(pView, '-TabularTemplate-Mid-Input', pViewDataAddress, pGroupIndex, pRowIndex);
		let tmpInformaryDataAddressTemplate = this.getMetatemplateTemplateReference(pView, '-TabularTemplate-InformaryAddress-Input', pViewDataAddress, pGroupIndex, pRowIndex);

		// First check if there is an "input type" template available in either the section-specific configuration or in the general
		if (pInputType)
		{
			let tmpBeginTemplate = this.getMetatemplateTemplateReference(pView, tmpTemplateBeginInputTypePostfix, pViewDataAddress);
			let tmpEndTemplate = this.getMetatemplateTemplateReference(pView, tmpTemplateEndInputTypePostfix, pViewDataAddress);
			let tmpCustomMidTemplate = this.getMetatemplateTemplateReference(pView, tmpTemplateMidInputTypePostfix, pViewDataAddress, pGroupIndex, pRowIndex);
			tmpMidTemplate = (tmpCustomMidTemplate) ? tmpCustomMidTemplate : tmpMidTemplate;
			if (tmpBeginTemplate && tmpEndTemplate)
			{
				return tmpBeginTemplate + tmpMidTemplate + tmpInformaryDataAddressTemplate + tmpEndTemplate;
			}
		}

		// If we didn't find the template for the "input type", check for the "data type"
		let tmpBeginTemplate = this.getMetatemplateTemplateReference(pView, tmpTemplateBeginDataTypePostfix, pViewDataAddress);
		let tmpEndTemplate = this.getMetatemplateTemplateReference(pView, tmpTemplateEndDataTypePostfix, pViewDataAddress);
		if (tmpBeginTemplate && tmpEndTemplate)
		{
			let tmpCustomMidTemplate = this.getMetatemplateTemplateReference(pView, tmpTemplateMidDataTypePostfix, pViewDataAddress, pGroupIndex, pRowIndex);
			tmpMidTemplate = (tmpCustomMidTemplate) ? tmpCustomMidTemplate : tmpMidTemplate;
			return tmpBeginTemplate + tmpMidTemplate + tmpInformaryDataAddressTemplate + tmpEndTemplate;
		}
	


		// If we didn't find the template for the "input type", or the "data type", fall back to the default
		tmpBeginTemplate = this.getMetatemplateTemplateReference(pView, 'TabularTemplate-Begin-Input', pViewDataAddress);
		tmpEndTemplate = this.getMetatemplateTemplateReference(pView, 'TabularTemplate-End-Input', pViewDataAddress);
		if (tmpBeginTemplate && tmpEndTemplate)
		{
			return tmpBeginTemplate + tmpMidTemplate + tmpInformaryDataAddressTemplate + tmpEndTemplate;
		}
	
		// There was some kind of catastrophic failure -- the above templates should always be loaded.
		this.log.error(`PICT Form [${pView.UUID}]::[${pView.Hash}] catastrophic error generating tabular metatemplate: missing input template for Data Type ${pDataType} and Input Type ${pInputType}, Data Address ${pViewDataAddress}, Group Index ${pGroupIndex} and Record Subaddress ${pRowIndex}.`)
		return '';
	}

	rebuildCustomTemplate(pView)
	{
		let tmpTemplate = ``;

		if (this.pict.views.PictFormMetacontroller && ('formTemplatePrefix' in this.pict.views.PictFormMetacontroller) && (!('defaultTemplatePrefix' in pView)))
		{
				pView.defaultTemplatePrefix = this.pict.views.PictFormMetacontroller.formTemplatePrefix;
		}

		tmpTemplate += this.getMetatemplateTemplateReference(pView, `-Template-Wrap-Prefix`, `sectionDefinition`);
		tmpTemplate += this.getMetatemplateTemplateReference(pView, `-Template-Section-Prefix`, `sectionDefinition`);

		for (let i = 0; i < pView.sectionDefinition.Groups.length; i++)
		{
			let tmpGroup = pView.sectionDefinition.Groups[i];

			// Add pView to the group object for metatemplating
			tmpGroup.GroupIndex = i;

			tmpGroup.SectionTabularRowVirtualTemplateHash = `Pict-Form-Template-TabularRow-Virtual-${pView.options.Hash}-G${tmpGroup.GroupIndex}`;
			tmpGroup.SectionTabularRowTemplateHash = `Pict-Form-Template-TabularRow-${pView.options.Hash}-G${tmpGroup.GroupIndex}`;


			// Group layouts are customizable
			// The three basic group layouts:
			// 1. Record (default) - Render the whole address as a singleton record
			//                       placing inputs into rows based on configuration.
			// 2. Tabular          - Expect either an Array of objects or a POJO to
			//                       be rendered one record per row.
			let tmpGroupLayout = (typeof(tmpGroup.Layout) === 'string') ? tmpGroup.Layout :
									(typeof(pView.sectionDefinition.DefaultGroupLayout) === 'string') ? pView.sectionDefinition.DefaultGroupLayout :
									'Record';

			// We won't skip complex layouts even if they don't have rows because the
			// generated metatemplate has n-dimensional columns from the submanifests.
			if (!Array.isArray(tmpGroup.Rows))
			{
				continue;
			}

			switch(tmpGroupLayout)
			{
				case 'Tabular':
					// Tabular layout
					let tmpTemplateSetRecordRowTemplate = '';
					tmpTemplate += this.getMetatemplateTemplateReference(pView, `-TabularTemplate-Group-Prefix`, `getGroup("${i}")`);
					// Tabular templates only have one "row" for the header in the standard template, and then a row for each record.
					// The row for each record happens as a TemplateSet.
					tmpTemplate += this.getMetatemplateTemplateReference(pView, `-TabularTemplate-RowHeader-Prefix`, `getGroup("${i}")`);
					tmpTemplate += this.getMetatemplateTemplateReference(pView, `-TabularTemplate-RowHeader-ExtraPrefix`, `getGroup("${i}")`);

					for (let j = 0; j < tmpGroup.Rows.length; j++)
					{

						let tmpRow = tmpGroup.Rows[j];

						// Tabular are odd in that they have a header row and then a meta TemplateSet for the rows()
						// In this case we are going to load the descriptors from the supportingManifests
						if (!tmpGroup.supportingManifest)
						{
							this.log.error(`PICT Form [${pView.UUID}]::[${pView.Hash}] error generating tabular metatemplate: missing group manifest ${tmpGroup.RecordManifest} from supportingManifests.`);
							continue;
						}

						for (let k = 0; k < tmpGroup.supportingManifest.elementAddresses.length; k++)
						{
							let tmpSupportingManifestHash = tmpGroup.supportingManifest.elementAddresses[k];
							let tmpInput = tmpGroup.supportingManifest.elementDescriptors[tmpSupportingManifestHash];
							// Update the InputIndex to match the current render config
							if (!('PictForm' in tmpInput))
							{
								tmpInput.PictForm = {};
							}
							tmpInput.PictForm.InputIndex = k;
							tmpInput.PictForm.GroupIndex = tmpGroup.GroupIndex;

							tmpTemplate += this.getMetatemplateTemplateReference(pView, `-TabularTemplate-HeaderCell`, `getTabularRecordInput("${i}","${k}")`);

		
							tmpTemplateSetRecordRowTemplate += this.getMetatemplateTemplateReference(pView, `-TabularTemplate-Cell-Prefix`, `getTabularRecordInput("${i}","${k}")`);
							let tmpInputType = (('PictForm' in tmpInput) && tmpInput.PictForm.InputType) ? tmpInput.PictForm.InputType : 'Default';
							tmpTemplateSetRecordRowTemplate += this.getTabularInputMetatemplateTemplateReference(pView, tmpInput.DataType, tmpInputType, `getTabularRecordInput("${i}","${k}")`, i, k);
							tmpTemplateSetRecordRowTemplate += this.getMetatemplateTemplateReference(pView, `-TabularTemplate-Cell-Postfix`, `getTabularRecordInput("${i}","${k}")`);
						}
					}

					tmpTemplate += this.getMetatemplateTemplateReference(pView, `-TabularTemplate-RowHeader-ExtraPostfix`, `getGroup("${i}")`);
					tmpTemplate += this.getMetatemplateTemplateReference(pView, `-TabularTemplate-RowHeader-Postfix`, `getGroup("${i}")`);

					// This is the template by which the tabular template includes the rows.
					// The recursion here is difficult to envision without drawing it.
					// TODO: Consider making this function available in manyfest in some fashion it seems dope.
					let tmpTemplateSetVirtualRowTemplate = '';
					tmpTemplateSetVirtualRowTemplate += this.getMetatemplateTemplateReference(pView, `-TabularTemplate-Row-Prefix`, `getGroup("${i}")`);
					tmpTemplateSetVirtualRowTemplate += this.getMetatemplateTemplateReferenceRaw(pView, `-TabularTemplate-Row-ExtraPrefix`, `Record`);
					tmpTemplateSetVirtualRowTemplate += `\n\n{~T:${tmpGroup.SectionTabularRowTemplateHash}:Record~}\n`;
					tmpTemplateSetVirtualRowTemplate += this.getMetatemplateTemplateReferenceRaw(pView, `-TabularTemplate-Row-ExtraPostfix`, `Record`);
					tmpTemplateSetVirtualRowTemplate += this.getMetatemplateTemplateReference(pView, `-TabularTemplate-Row-Postfix`, `getGroup("${i}")`);

					// This is a custom template expression
					tmpTemplate += `\n\n{~MTVS:${tmpGroup.SectionTabularRowVirtualTemplateHash}:${tmpGroup.GroupIndex}:${pView.getMarshalDestinationAddress()}.${tmpGroup.RecordSetAddress}~}\n`;

					tmpTemplate += this.getMetatemplateTemplateReference(pView, `-TabularTemplate-Group-Postfix`, `getGroup("${i}")`);
					// Add the TemplateSetTemplate
					this.pict.TemplateProvider.addTemplate(tmpGroup.SectionTabularRowVirtualTemplateHash, tmpTemplateSetVirtualRowTemplate);
					this.pict.TemplateProvider.addTemplate(tmpGroup.SectionTabularRowTemplateHash, tmpTemplateSetRecordRowTemplate);
					break;
				case 'Record':
				default:
					tmpTemplate += this.getMetatemplateTemplateReference(pView, `-Template-Group-Prefix`, `getGroup("${i}")`);
					for (let j = 0; j < tmpGroup.Rows.length; j++)
					{
						let tmpRow = tmpGroup.Rows[j];

						tmpTemplate += this.getMetatemplateTemplateReference(pView, `-Template-Row-Prefix`, `getGroup("${i}")`);

						// There are three row layouts: Record, Tabular and Columnar
						for (let k = 0; k < tmpRow.Inputs.length; k++)
						{
							let tmpInput = tmpRow.Inputs[k];
							// Update the InputIndex to match the current render config
							tmpInput.PictForm.InputIndex = k;
							tmpInput.PictForm.GroupIndex = tmpGroup.GroupIndex;

							tmpTemplate += this.getInputMetatemplateTemplateReference(pView, tmpInput.DataType, tmpInput.PictForm.InputType, `getInput("${i}","${j}","${k}")`);
						}
						tmpTemplate += this.getMetatemplateTemplateReference(pView, `-Template-Row-Postfix`, `getGroup("${i}")`);
					}
					tmpTemplate += this.getMetatemplateTemplateReference(pView, `-Template-Group-Postfix`, `getGroup("${i}")`);
					break;
			}
		}

		tmpTemplate += this.getMetatemplateTemplateReference(pView, `-Template-Section-Postfix`, `sectionDefinition`);
		tmpTemplate += this.getMetatemplateTemplateReference(pView, `-Template-Wrap-Postfix`, `sectionDefinition`);

		this.pict.providers.MetatemplateMacros.rebuildMacros(pView);

		this.pict.TemplateProvider.addTemplate(pView.options.SectionTemplateHash, tmpTemplate);
	}
}

module.exports = PictMetatemplateGenerator;
module.exports.default_configuration = _DefaultProviderConfiguration;
