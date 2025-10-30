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
        tmpRow[this.CSV_COLUMN_MAP["DataOnly"]] = '';
        tmpRow[this.CSV_COLUMN_MAP["Section Name"]] = '';
        tmpRow[this.CSV_COLUMN_MAP["Section Hash"]] = (tmpPictForm && tmpPictForm.Section) ? tmpPictForm.Section : '';
        tmpRow[this.CSV_COLUMN_MAP["Group Name"]] = '';
        tmpRow[this.CSV_COLUMN_MAP["Group Hash"]] = (tmpPictForm && tmpPictForm.Group) ? tmpPictForm.Group : '';
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
        tmpRow[this.CSV_COLUMN_MAP["Input Notes"]] = '';
        tmpRow[this.CSV_COLUMN_MAP["Entity"]] = '';
        tmpRow[this.CSV_COLUMN_MAP["EntityColumnFilter"]] = '';
        tmpRow[this.CSV_COLUMN_MAP["EntityDestination"]] = '';
        tmpRow[this.CSV_COLUMN_MAP["SingleRecord"]] = '';
        tmpRow[this.CSV_COLUMN_MAP["TriggerGroup"]] = '';
        tmpRow[this.CSV_COLUMN_MAP["TriggerAddress"]] = '';
        tmpRow[this.CSV_COLUMN_MAP["TriggerAllInputs"]] = '';
        tmpRow[this.CSV_COLUMN_MAP["MarshalEmptyValues"]] = '';
        tmpRow[this.CSV_COLUMN_MAP["ChartType"]] = (tmpPictForm && tmpPictForm.ChartType) ? tmpPictForm.ChartType : '';
        tmpRow[this.CSV_COLUMN_MAP["ChartLabelsAddress"]] = (tmpPictForm && tmpPictForm.ChartLabelsAddress) ? tmpPictForm.ChartLabelsAddress : '';
        tmpRow[this.CSV_COLUMN_MAP["ChartLabelsSolver"]] = (tmpPictForm && tmpPictForm.ChartLabelsSolver) ? tmpPictForm.ChartLabelsSolver : '';
        tmpRow[this.CSV_COLUMN_MAP["ChartDatasetsAddress"]] = (tmpPictForm && tmpPictForm.ChartDatasetsAddress) ? tmpPictForm.ChartDatasetsAddress : '';
        tmpRow[this.CSV_COLUMN_MAP["ChartDatasetsLabel"]] = (tmpPictForm && tmpPictForm.ChartDatasetsSolvers && Array.isArray(tmpPictForm.ChartDatasetsSolvers) && tmpPictForm.ChartDatasetsSolvers.length > 0) ? tmpPictForm.ChartDatasetsSolvers[0].Label : '';
        tmpRow[this.CSV_COLUMN_MAP["ChartDatasetsSolvers"]] = (tmpPictForm && tmpPictForm.ChartDatasetsSolvers && Array.isArray(tmpPictForm.ChartDatasetsSolvers) && tmpPictForm.ChartDatasetsSolvers.length > 0) ? tmpPictForm.ChartDatasetsSolvers[0].DataSolver : '';

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

            // See if there is a section name and decorate the manifest entry with the name
            for (let j = 0; j < tmpCSVRows.length; j++)
            {
                let tmpRow = tmpCSVRows[j];
                if ((tmpRow) && (Array.isArray(tmpRow)) && (tmpRow.length >= this.CSV_HEADER.length))
                {
                    let tmpRowSectionHash = tmpRow[this.CSV_COLUMN_MAP["Section Hash"]];
                    if (tmpRowSectionHash === tmpSectionHash)
                    {
                        // This is the row for this section
                        tmpRow[this.CSV_COLUMN_MAP["Section Name"]] = tmpSection.Name || '';
                    }
                }
            }

            // See if the group has a name and decorate the manifest entry with the group name
            if (tmpSection.Groups && Array.isArray(tmpSection.Groups))
            {
                for (let j = 0; j < tmpSection.Groups.length; j++)
                {
                    let tmpGroup = tmpSection.Groups[j];
                    let tmpGroupHash = tmpGroup.Hash;

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
                                    tmpRow[this.CSV_COLUMN_MAP["Group Name"]] = tmpGroup.Name || '';
                                }
                            }
                        }
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