const libFableServiceProviderBase = require('fable-serviceproviderbase');

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

        this.CSV_HEADER = [
            "Form",
            "Form Name",
            "SubManifest",
			"HideTabularEditingControls",
			"GroupRecordSetAddress",
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

        // Generate the header to column mapping
        this.CSV_COLUMN_MAP = {};
        for (let i = 0; i < this.CSV_HEADER.length; i++)
        {
            let tmpColumnName = this.CSV_HEADER[i];
            this.CSV_COLUMN_MAP[tmpColumnName] = i;
        }
    }

    getRowFromDescriptor(pForm, pDescriptorKey, pDescriptor)
    {
        let tmpRow = new Array(this.CSV_HEADER.length).fill('');

        if ((!pDescriptor) || (typeof(pDescriptor) !== 'object') || !pDescriptorKey || (typeof(pDescriptorKey) !== 'string'))
        {
            return false;
        }

        let tmpPictForm = pDescriptor.PictForm;

        tmpRow[this.CSV_COLUMN_MAP["Form"]] = pForm;
        tmpRow[this.CSV_COLUMN_MAP["Form Name"]] = pDescriptor.FormName || '';
        tmpRow[this.CSV_COLUMN_MAP["SubManifest"]] = '';
        tmpRow[this.CSV_COLUMN_MAP["DataOnly"]] = (typeof(tmpPictForm) === 'undefined') ? '1' : '';
        tmpRow[this.CSV_COLUMN_MAP["Section Name"]] = '';
        tmpRow[this.CSV_COLUMN_MAP["Section Hash"]] = (tmpPictForm && tmpPictForm.Section) ? tmpPictForm.Section
														: (pDescriptor.FormSection) ? pDescriptor.FormSection
														: '';
        tmpRow[this.CSV_COLUMN_MAP["Group Name"]] = '';
        tmpRow[this.CSV_COLUMN_MAP["Group Hash"]] = (tmpPictForm && tmpPictForm.Group) ? tmpPictForm.Group
														: (pDescriptor.FormGroup) ? pDescriptor.FormGroup
														: '';
        tmpRow[this.CSV_COLUMN_MAP["Group Layout"]] = '';
        tmpRow[this.CSV_COLUMN_MAP["Group CSS"]] = '';
        tmpRow[this.CSV_COLUMN_MAP["Group Show Title"]] = '';
        tmpRow[this.CSV_COLUMN_MAP["Row"]] = (tmpPictForm && tmpPictForm.Row) ? tmpPictForm.Row : '';
        tmpRow[this.CSV_COLUMN_MAP["Width"]] = (tmpPictForm && tmpPictForm.Width) ? tmpPictForm.Width : '';
        tmpRow[this.CSV_COLUMN_MAP["Minimum Row Count"]] = '';
        tmpRow[this.CSV_COLUMN_MAP["Maximum Row Count"]] = '';
        tmpRow[this.CSV_COLUMN_MAP["Input Address"]] = (pDescriptor.DataAddress) ? pDescriptor.DataAddress : pDescriptorKey;
        tmpRow[this.CSV_COLUMN_MAP["Input Name"]] = pDescriptor.Name || pDescriptor.DataAddress || pDescriptorKey;
        tmpRow[this.CSV_COLUMN_MAP["Input Hash"]] = pDescriptor.Hash || pDescriptorKey;
        tmpRow[this.CSV_COLUMN_MAP["Input Extra"]] = '';
        tmpRow[this.CSV_COLUMN_MAP["Units"]] = (tmpPictForm && tmpPictForm.Units) ? tmpPictForm.Units : '';
        tmpRow[this.CSV_COLUMN_MAP["DataType"]] = pDescriptor.DataType || 'String';
        tmpRow[this.CSV_COLUMN_MAP["Decimal Precision"]] = (tmpPictForm && tmpPictForm.DecimalPrecision) ? tmpPictForm.DecimalPrecision : '';
        tmpRow[this.CSV_COLUMN_MAP["InputType"]] = (tmpPictForm && tmpPictForm.InputType) ? tmpPictForm.InputType : '';
        tmpRow[this.CSV_COLUMN_MAP["Equation"]] = '';
        tmpRow[this.CSV_COLUMN_MAP["Equation Ordinal"]] = '';
        tmpRow[this.CSV_COLUMN_MAP["Default"]] = (pDescriptor.Default !== undefined) ? pDescriptor.Default : '';
        tmpRow[this.CSV_COLUMN_MAP["Description"]] = (pDescriptor.Description) ? pDescriptor.Description : '';
        tmpRow[this.CSV_COLUMN_MAP["Tooltip"]] = (tmpPictForm && tmpPictForm.Tooltip) ? tmpPictForm.Tooltip : '';
        tmpRow[this.CSV_COLUMN_MAP["Input Notes"]] = (tmpPictForm && tmpPictForm.SpreadsheetNotes) ? tmpPictForm.SpreadsheetNotes : '';

        tmpRow[this.CSV_COLUMN_MAP["Entity"]] = '';
        tmpRow[this.CSV_COLUMN_MAP["EntityColumnFilter"]] = '';
        tmpRow[this.CSV_COLUMN_MAP["EntityDestination"]] = '';
        tmpRow[this.CSV_COLUMN_MAP["SingleRecord"]] = '';
		/**
		tmpDescriptor.PictForm.EntitiesBundle = [
				{
					"Entity": tmpRecord.Entity,
					"Filter": `FBV~${tmpRecord.EntityColumnFilter}~EQ~{~D:Record.Value~}`,
					"Destination": tmpRecord.EntityDestination,
					// This marshals a single record
					"SingleRecord": tmpRecord.EntitySingleRecord ? true : false
				}
			]
		 */
		if (tmpPictForm && tmpPictForm.EntitiesBundle && Array.isArray(tmpPictForm.EntitiesBundle) && tmpPictForm.EntitiesBundle.length > 0)
		{
			let tmpEntityBundle = tmpPictForm.EntitiesBundle[0];
			if (tmpEntityBundle.Entity)
			{
				tmpRow[this.CSV_COLUMN_MAP["Entity"]] = tmpEntityBundle.Entity;
			}
			// Pull the filter column out if we can; we only want what's between "FBV~" and "~EQ~"
			if (tmpEntityBundle.Filter)
			{
				let tmpFilter = tmpEntityBundle.Filter;
				let tmpFilterStart = tmpFilter.indexOf('FBV~');
				let tmpFilterEnd = tmpFilter.indexOf('~EQ~');
				if ((tmpFilterStart >= 0) && (tmpFilterEnd > tmpFilterStart))
				{
					let tmpColumnFilter = tmpFilter.substring(tmpFilterStart + 4, tmpFilterEnd);
					tmpRow[this.CSV_COLUMN_MAP["EntityColumnFilter"]] = tmpColumnFilter;
				}
			}
			if (tmpEntityBundle.Destination)
			{
				tmpRow[this.CSV_COLUMN_MAP["EntityDestination"]] = tmpEntityBundle.Destination;
			}
			if (tmpEntityBundle.SingleRecord)
			{
				tmpRow[this.CSV_COLUMN_MAP["SingleRecord"]] = 'true';
			}
		}

        tmpRow[this.CSV_COLUMN_MAP["TriggerGroup"]] = '';
        tmpRow[this.CSV_COLUMN_MAP["TriggerAddress"]] = '';
        tmpRow[this.CSV_COLUMN_MAP["TriggerAllInputs"]] = '';
        tmpRow[this.CSV_COLUMN_MAP["MarshalEmptyValues"]] = '';
		if (tmpPictForm && tmpPictForm.AutofillTriggerGroup)
		{
			// Grab the first trigger group and put it in here.
			let tmpTriggerGroup;
			if (Array.isArray(tmpPictForm.AutofillTriggerGroup) && tmpPictForm.AutofillTriggerGroup.length > 0)
			{
				tmpTriggerGroup = tmpPictForm.AutofillTriggerGroup[0];
			}
			else if (typeof(tmpPictForm.AutofillTriggerGroup) === 'object')
			{
				tmpTriggerGroup = tmpPictForm.AutofillTriggerGroup;
			}
			if (tmpTriggerGroup)
			{
				if (tmpTriggerGroup.TriggerGroupHash)
				{
					tmpRow[this.CSV_COLUMN_MAP["TriggerGroup"]] = tmpTriggerGroup.TriggerGroupHash;
				}
				if (tmpTriggerGroup.TriggerAllInputs)
				{
					tmpRow[this.CSV_COLUMN_MAP["TriggerAllInputs"]] = 'true';
				}
				if (tmpTriggerGroup.TriggerAddress)
				{
					tmpRow[this.CSV_COLUMN_MAP["TriggerAddress"]] = tmpTriggerGroup.TriggerAddress;
				}
				if (tmpTriggerGroup.MarshalEmptyValues)
				{
					tmpRow[this.CSV_COLUMN_MAP["MarshalEmptyValues"]] = 'true';
				}
			}
		}
        tmpRow[this.CSV_COLUMN_MAP["ChartType"]] = (tmpPictForm && tmpPictForm.ChartType) ? tmpPictForm.ChartType : '';
        tmpRow[this.CSV_COLUMN_MAP["ChartLabelsAddress"]] = (tmpPictForm && tmpPictForm.ChartLabelsAddress) ? tmpPictForm.ChartLabelsAddress : '';
        tmpRow[this.CSV_COLUMN_MAP["ChartLabelsSolver"]] = (tmpPictForm && tmpPictForm.ChartLabelsSolver) ? tmpPictForm.ChartLabelsSolver : '';
        tmpRow[this.CSV_COLUMN_MAP["ChartDatasetsAddress"]] = (tmpPictForm && tmpPictForm.ChartDatasetsAddress) ? tmpPictForm.ChartDatasetsAddress : '';
        tmpRow[this.CSV_COLUMN_MAP["ChartDatasetsLabel"]] = (tmpPictForm && tmpPictForm.ChartDatasetsSolvers && Array.isArray(tmpPictForm.ChartDatasetsSolvers) && tmpPictForm.ChartDatasetsSolvers.length > 0) ? tmpPictForm.ChartDatasetsSolvers[0].Label : '';
        tmpRow[this.CSV_COLUMN_MAP["ChartDatasetsSolvers"]] = (tmpPictForm && tmpPictForm.ChartDatasetsSolvers && Array.isArray(tmpPictForm.ChartDatasetsSolvers) && tmpPictForm.ChartDatasetsSolvers.length > 0) ? tmpPictForm.ChartDatasetsSolvers[0].DataSolver : '';

		if (tmpPictForm && (tmpPictForm.InputType == 'Option') && tmpPictForm.SelectOptions && Array.isArray(tmpPictForm.SelectOptions))
		{
			// Pull the select options into the Input Extra field as a comma-delimited list
			let tmpInputExtraOptions = '';

			for (let i = 0; i < tmpPictForm.SelectOptions.length; i++)
			{
				let tmpOption = tmpPictForm.SelectOptions[i];

				if (tmpOption.id && tmpOption.text)
				{
					if (tmpInputExtraOptions.length > 0)
					{
						tmpInputExtraOptions += ',';
					}
					tmpInputExtraOptions += `${tmpOption.id}^${tmpOption.text}`;
				}
			}

            tmpRow[this.CSV_COLUMN_MAP["Input Extra"]] = tmpInputExtraOptions;
		}

        return tmpRow;
    }

    createTabularArrayFromManifests(pManifest)
    {
        // CSV_COLUMN_MAP is already initialized in constructor

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
        tmpCSVRows.push(this.CSV_HEADER);

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

            // See if the group has a name and decorate the manifest entry with the group name
            if (tmpSection.Groups && Array.isArray(tmpSection.Groups))
            {
                for (let j = 0; j < tmpSection.Groups.length; j++)
                {
                    let tmpGroup = tmpSection.Groups[j];
                    let tmpGroupHash = tmpGroup.Hash;

					if ((tmpGroup.Layout == 'Tabular') || (tmpGroup.Layout == 'RecordSet'))
					{
						// Pull in the reference manifest for this tabular set
						/*
							{
								"Name": "Boxes",
								"Hash": "BoxCollGrp",
								"Rows": [],
								"RecordSetSolvers": [
									"BoxFloorspace = BoxWidth * BoxDepth",
									"BoxVolume = BoxFloorspace * BoxHeight"
								],
								"MinimumRowCount": 3,
								"MaximumRowCount": 10,
								"ShowTitle": true,
								"Layout": "Tabular",
								"RecordSetAddress": "Boxes",
								"RecordManifest": "BoxCollectionData"
							}
						*/
			   			// Validate there is a RecordSetAddress and RecordManifest
						if (tmpGroup.RecordSetAddress && tmpGroup.RecordManifest)
						{
							// Find the Array placeholder in the CSV
							let tmpGroupArrayPlaceholderIndex = -1;
							for (let k = 0; k < tmpCSVRows.length; k++)
							{
								let tmpRow = tmpCSVRows[k];
								if ((tmpRow) && (Array.isArray(tmpRow)) && (tmpRow.length >= this.CSV_HEADER.length))
								{
									let tmpRowSectionHash = tmpRow[this.CSV_COLUMN_MAP["Section Hash"]];
									let tmpRowGroupHash = tmpRow[this.CSV_COLUMN_MAP["Group Hash"]];
									if ((tmpRowSectionHash === tmpSectionHash) && (tmpRowGroupHash === tmpGroupHash))
									{
										// This is the row for this group
										tmpGroupArrayPlaceholderIndex = k;
										break;
									}

									// Try to match on the Input Address as a fallback
									let tmpRowInputAddress = tmpRow[this.CSV_COLUMN_MAP["Input Address"]];
									if (tmpRowInputAddress === tmpGroup.RecordSetAddress)
									{
										// Set the section and group hash here, this is an old manifest
										tmpRow[this.CSV_COLUMN_MAP["Section Hash"]] = tmpSectionHash;
										tmpRow[this.CSV_COLUMN_MAP["Group Hash"]] = tmpGroupHash;
										tmpGroupArrayPlaceholderIndex = k;
										break;
									}
								}
							}
							if (tmpGroupArrayPlaceholderIndex >= 0)
							{
								let tmpRow = tmpCSVRows[tmpGroupArrayPlaceholderIndex];

								// Set the SubManifest on the placeholder row
								tmpRow[this.CSV_COLUMN_MAP["SubManifest"]] = tmpGroup.RecordManifest;
								tmpRow[this.CSV_COLUMN_MAP["GroupRecordSetAddress"]] = tmpGroup.RecordSetAddress;
								tmpRow[this.CSV_COLUMN_MAP["HideTabularEditingControls"]] = tmpGroup.HideTabularEditingControls;

								// Now set the Minimum and Maximum Row Counts
								if (tmpGroup.MinimumRowCount)
								{
									tmpRow[this.CSV_COLUMN_MAP["Minimum Row Count"]] = tmpGroup.MinimumRowCount;
								}
								if (tmpGroup.MaximumRowCount)
								{
									tmpRow[this.CSV_COLUMN_MAP["Maximum Row Count"]] = tmpGroup.MaximumRowCount;
								}

								// Find the reference manifest, pull in the descriptors, and create rows for each
								let tmpReferenceManifest = pManifest.ReferenceManifests[tmpGroup.RecordManifest];
								let tmpReferenceManifestDescriptorKeys = Object.keys(tmpReferenceManifest.Descriptors);
								for (let m = 0; m < tmpReferenceManifestDescriptorKeys.length; m++)
								{
									let tmpReferenceDescriptorKey = tmpReferenceManifestDescriptorKeys[m];
									let tmpReferenceDescriptor = tmpReferenceManifest.Descriptors[tmpReferenceDescriptorKey];

									if ((!tmpReferenceDescriptor) || (typeof(tmpReferenceDescriptor) !== 'object'))
									{
										continue;
									}

									let tmpReferenceCSVRow = this.getRowFromDescriptor(tmpForm, tmpReferenceDescriptorKey, tmpReferenceDescriptor);
									if (tmpReferenceCSVRow)
									{
										// Set the Section and Group Hashes on this row
										tmpReferenceCSVRow[this.CSV_COLUMN_MAP["Section Hash"]] = tmpSectionHash;
										tmpReferenceCSVRow[this.CSV_COLUMN_MAP["Group Hash"]] = tmpGroupHash;

										// Set the SubManifest on this row
										tmpReferenceCSVRow[this.CSV_COLUMN_MAP["SubManifest"]] = tmpGroup.RecordManifest;

										// Insert this row after the placeholder
										tmpCSVRows.splice(tmpGroupArrayPlaceholderIndex + 1, 0, tmpReferenceCSVRow);
									}
								}
							}
						}
					}

                    if (tmpGroupHash)
                    {
                        for (let k = 0; k < tmpCSVRows.length; k++)
                        {
                            let tmpRow = tmpCSVRows[k];
                            if ((tmpRow) && (Array.isArray(tmpRow)) && (tmpRow.length >= this.CSV_HEADER.length))
                            {
                                let tmpRowGroupHash = tmpRow[this.CSV_COLUMN_MAP["Group Hash"]];
                                if (tmpRowGroupHash === tmpGroupHash)
                                {
                                    // This is the row for this group
                                    tmpRow[this.CSV_COLUMN_MAP["Group Name"]] = tmpGroup.Name || tmpGroupHash;
									if (tmpGroup.Layout)
									{
										tmpRow[this.CSV_COLUMN_MAP["Group Layout"]] = tmpGroup.Layout;
									}
									if (tmpGroup.hasOwnProperty('ShowTitle'))
									{
										tmpRow[this.CSV_COLUMN_MAP["Group Show Title"]] = tmpGroup.ShowTitle;
									}
									if (tmpGroup.hasOwnProperty('CSSClass'))
									{
										tmpRow[this.CSV_COLUMN_MAP["Group CSS"]] = tmpGroup.CSSClass;
									}
                                }
                            }
                        }
                    }
                }
            }

			// See if there is a section name and decorate the manifest entries with the name
            for (let j = 0; j < tmpCSVRows.length; j++)
            {
                let tmpRow = tmpCSVRows[j];
                if ((tmpRow) && (Array.isArray(tmpRow)) && (tmpRow.length >= this.CSV_HEADER.length))
                {
                    let tmpRowSectionHash = tmpRow[this.CSV_COLUMN_MAP["Section Hash"]];
                    if (tmpRowSectionHash === tmpSectionHash)
                    {
                        // This is the row for this section
                        tmpRow[this.CSV_COLUMN_MAP["Section Name"]] = tmpSection.Name || tmpSectionHash;
                    }
                }
            }

			// Now go through the section and group solvers, and decorate the appropriate rows
			if (tmpSection.Solvers && Array.isArray(tmpSection.Solvers))
			{
				for (let j = 0; j < tmpSection.Solvers.length; j++)
				{
					let tmpSolver = tmpSection.Solvers[j];
					let tmpSolverAssigned = false;

					// find an unused row in this section to decorate
					for (let k = 0; k < tmpCSVRows.length; k++)
					{
						let tmpRow = tmpCSVRows[k];
						if ((tmpRow) && (Array.isArray(tmpRow)) && (tmpRow.length >= this.CSV_HEADER.length))
						{
							let tmpRowSectionHash = tmpRow[this.CSV_COLUMN_MAP["Section Hash"]];
							let tmpRowEquation = tmpRow[this.CSV_COLUMN_MAP["Equation"]];
							let tmpRowSubManifest = tmpRow[this.CSV_COLUMN_MAP["SubManifest"]];
							// If it's in the section
							if ((tmpRowSectionHash === tmpSectionHash)
									// And it isn't a tabular row
									&& (!tmpRowSubManifest || (tmpRowSubManifest == ''))
									// And an equation hasn't been set already
									&& (!tmpRowEquation || (tmpRowEquation.length == 0)))
							{
								// This is an unused row for this section
								if (typeof(tmpSolver) === 'string')
								{
									tmpRow[this.CSV_COLUMN_MAP["Equation"]] = tmpSolver;
									tmpRow[this.CSV_COLUMN_MAP["Equation Ordinal"]] = 1;
								}
								else if (typeof(tmpSolver) === 'object' && tmpSolver.Expression)
								{
									tmpRow[this.CSV_COLUMN_MAP["Equation"]] = tmpSolver.Expression;
									tmpRow[this.CSV_COLUMN_MAP["Equation Ordinal"]] = tmpSolver.Ordinal || 1;
								}
								tmpSolverAssigned = true;
								break;
							}
						}
					}
					// If the solver wasn't assigned, we have to create a hidden data only row for it and splice it in
					if (!tmpSolverAssigned)
					{
						let tmpHiddenSolverRow = new Array(this.CSV_HEADER.length).fill('');
						tmpHiddenSolverRow[this.CSV_COLUMN_MAP["Form"]] = tmpForm;
						tmpHiddenSolverRow[this.CSV_COLUMN_MAP["Section Hash"]] = tmpSectionHash;
						// Set DataOnly
						tmpHiddenSolverRow[this.CSV_COLUMN_MAP["DataOnly"]] = '1';
						tmpHiddenSolverRow[this.CSV_COLUMN_MAP["DataType"]] = 'String';
						tmpHiddenSolverRow[this.CSV_COLUMN_MAP["InputType"]] = 'Hidden';
						// Generate an input hash and name that show its for a solver
						let tmpSolverInputHash = `Solver_for_${tmpSectionHash}_${j + 1}`;
						tmpHiddenSolverRow[this.CSV_COLUMN_MAP["Input Hash"]] = tmpSolverInputHash;
						tmpHiddenSolverRow[this.CSV_COLUMN_MAP["Input Name"]] = `Auto gen hidden solver entry for ${tmpSection.Name || tmpSectionHash} #${j + 1}`;
						tmpHiddenSolverRow[this.CSV_COLUMN_MAP["Input Address"]] = tmpSolverInputHash;
						if (typeof(tmpSolver) === 'string')
						{
							tmpHiddenSolverRow[this.CSV_COLUMN_MAP["Equation"]] = tmpSolver;
							tmpHiddenSolverRow[this.CSV_COLUMN_MAP["Equation Ordinal"]] = 1;
						}
						else if (typeof(tmpSolver) === 'object' && tmpSolver.Expression)
						{
							tmpHiddenSolverRow[this.CSV_COLUMN_MAP["Equation"]] = tmpSolver.Expression;
							tmpHiddenSolverRow[this.CSV_COLUMN_MAP["Equation Ordinal"]] = tmpSolver.Ordinal || 1;
						}
						// Splice this row after the last row for this section
						let tmpLastSectionRowIndex = -1;
						for (let k = 0; k < tmpCSVRows.length; k++)
						{
							let tmpRow = tmpCSVRows[k];
							if ((tmpRow) && (Array.isArray(tmpRow)) && (tmpRow.length >= this.CSV_HEADER.length))
							{
								let tmpRowSectionHash = tmpRow[this.CSV_COLUMN_MAP["Section Hash"]];
								if (tmpRowSectionHash === tmpSectionHash)
								{
									tmpLastSectionRowIndex = k;
								}
							}
						}
						if (tmpLastSectionRowIndex >= 0)
						{
							tmpCSVRows.splice(tmpLastSectionRowIndex + 1, 0, tmpHiddenSolverRow);
						}
						else
						{
							// Just push it on the end
							tmpCSVRows.push(tmpHiddenSolverRow);
						}
					}
				}
			}

			// Lastly enumerate the group solvers
			if (tmpSection.Groups && Array.isArray(tmpSection.Groups))
			{
				for (let j = 0; j < tmpSection.Groups.length; j++)
				{
					let tmpGroup = tmpSection.Groups[j];
					let tmpGroupHash = tmpGroup.Hash;

					if (tmpGroup.RecordSetSolvers && Array.isArray(tmpGroup.RecordSetSolvers))
					{
						for (let m = 0; m < tmpGroup.RecordSetSolvers.length; m++)
						{
							let tmpSolver = tmpGroup.RecordSetSolvers[m];
							let tmpSolverAssigned = false;

							// find an unused row in this group to decorate
							for (let k = 0; k < tmpCSVRows.length; k++)
							{
								let tmpRow = tmpCSVRows[k];
								if ((tmpRow) && (Array.isArray(tmpRow)) && (tmpRow.length >= this.CSV_HEADER.length))
								{
									let tmpRowGroupHash = tmpRow[this.CSV_COLUMN_MAP["Group Hash"]];
									let tmpRowEquation = tmpRow[this.CSV_COLUMN_MAP["Equation"]];
									let tmpRowSubManifest = tmpRow[this.CSV_COLUMN_MAP["SubManifest"]];
									// If it's in the group
									if ((tmpRowGroupHash === tmpGroupHash)
											// And it is a tabular row
											&& (tmpRowSubManifest == tmpGroup.RecordManifest)
											// And an equation hasn't been set already
											&& (!tmpRowEquation || (tmpRowEquation.length == 0)))
									{
										// This is an unused row for this group
										if (typeof(tmpSolver) === 'string')
										{
											tmpRow[this.CSV_COLUMN_MAP["Equation"]] = tmpSolver;
											tmpRow[this.CSV_COLUMN_MAP["Equation Ordinal"]] = 1;
										}
										else if (typeof(tmpSolver) === 'object' && tmpSolver.Expression)
										{
											tmpRow[this.CSV_COLUMN_MAP["Equation"]] = tmpSolver.Expression;
											tmpRow[this.CSV_COLUMN_MAP["Equation Ordinal"]] = tmpSolver.Ordinal || 1;
										}
										tmpSolverAssigned = true;
										break;
									}
								}
							}
							// If the solver wasn't assigned, we have to create a hidden data only row for it and splice it in
							if (!tmpSolverAssigned)
							{
								let tmpHiddenSolverRow = new Array(this.CSV_HEADER.length).fill('');
								tmpHiddenSolverRow[this.CSV_COLUMN_MAP["Form"]] = tmpForm;
								tmpHiddenSolverRow[this.CSV_COLUMN_MAP["Section Hash"]] = tmpSectionHash;
								tmpHiddenSolverRow[this.CSV_COLUMN_MAP["Group Hash"]] = tmpGroupHash;
								// Set the submanifest on the row
								tmpHiddenSolverRow[this.CSV_COLUMN_MAP["SubManifest"]] = tmpGroup.RecordManifest;
								// Set DataOnly
								tmpHiddenSolverRow[this.CSV_COLUMN_MAP["DataOnly"]] = '1';
								// Generate an input hash and name that show its for a solver
								let tmpSolverInputHash = `Solver_for_${tmpGroupHash}_${m + 1}`;
								tmpHiddenSolverRow[this.CSV_COLUMN_MAP["Input Hash"]] = tmpSolverInputHash;
								tmpHiddenSolverRow[this.CSV_COLUMN_MAP["Input Name"]] = `Auto gen hidden solver entry for ${tmpGroup.Name || tmpGroupHash} #${m + 1}`;
								tmpHiddenSolverRow[this.CSV_COLUMN_MAP["Input Address"]] = tmpSolverInputHash;
								tmpHiddenSolverRow[this.CSV_COLUMN_MAP["DataType"]] = 'String';
								tmpHiddenSolverRow[this.CSV_COLUMN_MAP["InputType"]] = 'Hidden';
								if (typeof(tmpSolver) === 'string')
								{
									tmpHiddenSolverRow[this.CSV_COLUMN_MAP["Equation"]] = tmpSolver;
									tmpHiddenSolverRow[this.CSV_COLUMN_MAP["Equation Ordinal"]] = 1;
								}
								else if (typeof(tmpSolver) === 'object' && tmpSolver.Expression)
								{
									tmpHiddenSolverRow[this.CSV_COLUMN_MAP["Equation"]] = tmpSolver.Expression;
									tmpHiddenSolverRow[this.CSV_COLUMN_MAP["Equation Ordinal"]] = tmpSolver.Ordinal || 1;
								}
								// Splice this row after the last row for this group
								let tmpLastGroupRowIndex = -1;
								for (let k = 0; k < tmpCSVRows.length; k++)
								{
									let tmpRow = tmpCSVRows[k];
									if ((tmpRow) && (Array.isArray(tmpRow)) && (tmpRow.length >= this.CSV_HEADER.length))
									{
										let tmpRowGroupHash = tmpRow[this.CSV_COLUMN_MAP["Group Hash"]];
										if (tmpRowGroupHash === tmpGroupHash)
										{
											tmpLastGroupRowIndex = k;
										}
									}
								}
								if (tmpLastGroupRowIndex >= 0)
								{
									tmpCSVRows.splice(tmpLastGroupRowIndex + 1, 0, tmpHiddenSolverRow);
								}
								else
								{
									// Just push it on the end
									tmpCSVRows.push(tmpHiddenSolverRow);
								}
							}
						}
					}
				}
			}
        }

		if (tmpCSVRows.length > 1)
		{
			// Add the FormName from the root of the manifest to the first row Form Name column
			let tmpFirstDataRow = tmpCSVRows[1];
			if (tmpFirstDataRow && pManifest.FormName)
			{
				tmpFirstDataRow[this.CSV_COLUMN_MAP["Form Name"]] = pManifest.FormName || tmpFirstDataRow[this.CSV_COLUMN_MAP["Form Name"]];
			}
		}

        return tmpCSVRows;
    }
}

module.exports = ManifestConversionToCSV;