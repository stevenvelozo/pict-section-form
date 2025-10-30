const libFableServiceProviderBase = require('fable-serviceproviderbase');

const _CSV_HEADER = [
						"Form",
						"Form Name",
						"SubManifest",
						"DataOnly",
						"Section Name",
						"Section Hash",
						"Group Name",
						"Group Hash",
						"Group Layout",
						"Group CSS",
						"Group Show Title",
						"Row",
						"Width",
						"Minimum Row Count",
						"Maximum Row Count",
						"Input Address",
						"Input Name",
						"Input Hash",
						"Input Extra",
						"Units",
						"DataType",
						"Decimal Precision",
						"InputType",
						"Equation",
						"Equation Ordinal",
						"Default",
						"Description",
						"Tooltip",
						"Input Notes",
						"Entity",
						"EntityColumnFilter",
						"EntityDestination",
						"SingleRecord",
						"TriggerGroup",
						"TriggerAddress",
						"TriggerAllInputs",
						"MarshalEmptyValues",
						"ChartType",
						"ChartLabelsAddress",
						"ChartLabelsSolver",
						"ChartDatasetsAddress",
						"ChartDatasetsLabel",
						"ChartDatasetsSolvers"
					];

class ManifestConversionToCSV extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		/** @type {import('pict') & { instantiateServiceProviderWithoutRegistration: (hash: string, options?: any, uuid?: string) => any }} */
		this.fable;
		/** @type {any} */
		this.log;
		/** @type {string} */
		this.UUID;
	}

	getRowFromDescriptor(pForm, pDescriptorKey, pDescriptor)
	{
		let tmpRow = [];

		if ((!pDescriptor) || (typeof(pDescriptor) !== 'object') || !pDescriptorKey || (typeof(pDescriptorKey) !== 'string'))
		{
			return false;
		}

		let tmpPictForm = pDescriptor.PictForm;

		// "Form",
		tmpRow.push(pForm);
		// "Form Name",
		tmpRow.push(pDescriptor.FormName || '');
		// "SubManifest",
		tmpRow.push('');
		// "DataOnly",
		tmpRow.push('');
		// "Section Name",
		tmpRow.push('');
		// "Section Hash",
		tmpRow.push((tmpPictForm && tmpPictForm.Section) ? tmpPictForm.Section : '');
		// "Group Name",
		tmpRow.push('');
		// "Group Hash",
		tmpRow.push((tmpPictForm && tmpPictForm.Group) ? tmpPictForm.Group : '');
		// "Group Layout",
		tmpRow.push('');
		// "Group CSS",
		tmpRow.push('');
		// "Group Show Title",
		tmpRow.push('');
		// "Row",
		tmpRow.push((tmpPictForm && tmpPictForm.Row) ? tmpPictForm.Row : '');
		// "Width",
		tmpRow.push((tmpPictForm && tmpPictForm.Width) ? tmpPictForm.Width : '');
		// "Minimum Row Count",
		tmpRow.push('');
		// "Maximum Row Count",
		tmpRow.push('');
		// "Input Address",
		tmpRow.push((pDescriptor.DataAddress) ? pDescriptor.DataAddress : pDescriptorKey);
		// "Input Name",
		tmpRow.push(pDescriptor.Name || pDescriptor.DataAddress || pDescriptorKey);
		// "Input Hash",
		tmpRow.push(pDescriptor.Hash || pDescriptorKey);
		// "Input Extra",
		tmpRow.push('');
		// "Units",
		tmpRow.push((tmpPictForm && tmpPictForm.Units) ? tmpPictForm.Units : '');
		// "DataType",
		tmpRow.push(pDescriptor.DataType || 'String');
		// "Decimal Precision",
		tmpRow.push((tmpPictForm && tmpPictForm.DecimalPrecision) ? tmpPictForm.DecimalPrecision : '');
		// "InputType",
		tmpRow.push((tmpPictForm && tmpPictForm.InputType) ? tmpPictForm.InputType : '');
		// "Equation",
		tmpRow.push('');
		// "Equation Ordinal",
		tmpRow.push('');
		// "Default",
		tmpRow.push((pDescriptor.Default !== undefined) ? pDescriptor.Default : '');
		// "Description",
		tmpRow.push((pDescriptor.Description) ? pDescriptor.Description : '');
		// "Tooltip",
		tmpRow.push((tmpPictForm && tmpPictForm.Tooltip) ? tmpPictForm.Tooltip : '');
		// "Input Notes",
		tmpRow.push('');
		// "Entity",
		tmpRow.push('');
		// "EntityColumnFilter",
		tmpRow.push('');
		// "EntityDestination",
		tmpRow.push('');
		// "SingleRecord",
		tmpRow.push('');
		// "TriggerGroup",
		tmpRow.push('');
		// "TriggerAddress",
		tmpRow.push('');
		// "TriggerAllInputs",
		tmpRow.push('');
		// "MarshalEmptyValues",
		tmpRow.push('');
		// "ChartType",
		tmpRow.push((tmpPictForm && tmpPictForm.ChartType) ? tmpPictForm.ChartType : '');
		// "ChartLabelsAddress",
		tmpRow.push((tmpPictForm && tmpPictForm.ChartLabelsAddress) ? tmpPictForm.ChartLabelsAddress : '');
		// "ChartLabelsSolver",
		tmpRow.push((tmpPictForm && tmpPictForm.ChartLabelsSolver) ? tmpPictForm.ChartLabelsSolver : '');
		// "ChartDatasetsAddress",
		tmpRow.push((tmpPictForm && tmpPictForm.ChartDatasetsAddress) ? tmpPictForm.ChartDatasetsAddress : '');
		// "ChartDatasetsLabel",
		tmpRow.push((tmpPictForm && tmpPictForm.ChartDatasetsSolvers && Array.isArray(tmpPictForm.ChartDatasetsSolvers) && tmpPictForm.ChartDatasetsSolvers.length > 0) ? tmpPictForm.ChartDatasetsSolvers[0].Label : '');
		// "ChartDatasetsSolvers"
		tmpRow.push((tmpPictForm && tmpPictForm.ChartDatasetsSolvers && Array.isArray(tmpPictForm.ChartDatasetsSolvers) && tmpPictForm.ChartDatasetsSolvers.length > 0) ? tmpPictForm.ChartDatasetsSolvers[0].DataSolver : '');

		

		return tmpRow;
	}

	createTabularArrayFromManifests(pManifest)
	{
		// Convert the manifest to an array of CSV rows
		let tmpCSVRows = [];

		// Figure out the form
		let tmpForm = 'Default';
		if ((pManifest) && (pManifest.Scope) && (typeof(pManifest.Scope) === 'string'))
		{
			tmpForm = pManifest.Scope;
		}
		if ((pManifest) && (pManifest.Form) && (typeof(pManifest.Form) === 'string'))
		{
			tmpForm = pManifest.Form;
		}

		// Add the header row
		tmpCSVRows.push(_CSV_HEADER);

		if (typeof(pManifest) !== 'object')
		{
			this.log.error('ManifestConversionToCSV: Provided manifest is not an object; cannot convert to CSV.');
			return tmpCSVRows;
		}

		if (!pManifest.Descriptors || (typeof(pManifest.Descriptors) !== 'object'))
		{
			this.log.error('ManifestConversionToCSV: Provided manifest does not have a valid Descriptors property; cannot convert to CSV.');
			return tmpCSVRows;
		}

		let tmpDescriptorKeys = Object.keys(pManifest.Descriptors);
		for (let i = 0; i < tmpDescriptorKeys.length; i++)
		{
			let tmpDescriptorKey = tmpDescriptorKeys[i];
			let tmpDescriptor = pManifest.Descriptors[tmpDescriptorKey];

			if ((!tmpDescriptor) || (typeof(tmpDescriptor) !== 'object'))
			{
				continue;
			}

			let tmpCSVRow = this.getRowFromDescriptor(tmpForm, tmpDescriptorKey, tmpDescriptor);
			if (tmpCSVRow)
			{
				tmpCSVRows.push(tmpCSVRow);
			}
		}

		for (let i = 0; i < pManifest.Sections.length; i++)
		{
			let tmpSection = pManifest.Sections[i];
			let tmpSectionHash = tmpSection.Hash || 'DEFAULT_SECTION_HASH';

			if ((!tmpSection) || (typeof(tmpSection) !== 'object'))
			{
				continue;
			}

			// See if there is a name and decorate the manifest entry with the name
			for (let j = 0; j < tmpCSVRows.length; j++)
			{
				let tmpRow = tmpCSVRows[j];
				if ((tmpRow) && (Array.isArray(tmpRow)) && (tmpRow.length >= 6))
				{
					let tmpRowSectionHash = tmpRow[5];
					if (tmpRowSectionHash === tmpSectionHash)
					{
						// This is the row for this section
						tmpRow[4] = tmpSection.Name || '';
					}
				}
			}

			if ((!tmpSection.Groups) || (typeof(tmpSection.Groups) !== 'object'))
			{
				continue;
			}

			let tmpGroupKeys = Object.keys(tmpSection.Groups);
			for (let j = 0; j < tmpGroupKeys.length; j++)
			{
				let tmpGroupKey = tmpGroupKeys[j];
			}
		}

		return tmpCSVRows;
	}
}

module.exports = ManifestConversionToCSV;