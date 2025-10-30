
let libPictCommandLineUtility = require('pict-service-commandlineutility');

let libPictManifestConversionToCSV = require('../../source/services/ManifestConversionToCSV.js');

const libFS = require('fs');
const libPath = require('path');

class ImportCSVCommand extends libPictCommandLineUtility.ServiceCommandLineCommand
{
	constructor(pFable, pSettings, pServiceHash)
	{
		super(pFable, pSettings, pServiceHash);

		this.options.CommandKeyword = 'converttocsv';
		this.options.Description = 'Convert a manifest to a CSV file.';

		this.options.CommandArguments.push({ Name: '<json_manifest_file>', Description: 'The manifest file to convert to a CSV.' });

		this.options.CommandOptions.push({ Name: '-o, --output [filename]', Description: 'The output file to write the csv to; defaults to the [Scope.csv]'});
		this.options.CommandOptions.push({ Name: '-d, --directory [directory]', Description: 'The directory to output the manifest and other export files to.', Default: './data/'});

		this.addCommand();
	}

	onRunAsync(fCallback)
	{
		let tmpManifestFileName = this.ArgumentString;

		if ((!tmpManifestFileName) || (typeof(tmpManifestFileName) != 'string') || (tmpManifestFileName.length === 0))
		{
			this.log.error('No valid manifest filename provided.');
			return fCallback();
		}

		// Do some input file housekeeping
		let tmpManifestFilePath = libPath.resolve(tmpManifestFileName);
		if (!this.fable.FilePersistence.existsSync(tmpManifestFilePath))
		{
			this.fable.log.error(`File [${tmpManifestFilePath}] does not exist.  Checking in the current working directory...`);
			tmpManifestFilePath = libPath.join(process.cwd(), tmpManifestFileName);
			if (!this.fable.FilePersistence.existsSync(tmpManifestFilePath))
			{
				this.fable.log.error(`File [${tmpManifestFilePath}] does not exist in the current working directory.  Could not parse input manifest file.  Aborting.`);
				return fCallback();
			}
		}

		let tmpManifestData = this.fable.FilePersistence.readFileSync(tmpManifestFilePath, { encoding: 'utf8' });
		let tmpManifest = null;
		try
		{
			tmpManifest = JSON.parse(tmpManifestData);
		}
		catch(pError)
		{
			this.fable.log.error(`Could not parse manifest file [${tmpManifestFilePath}] as JSON.  Aborting.`);
			return fCallback();
		}

		// Load the manifest to CSV conversion service
		this.fable.addAndInstantiateServiceType('ManifestConversionToCSV', libPictManifestConversionToCSV);

		let tmpCSVDataArray = this.fable.ManifestConversionToCSV.createTabularArrayFromManifests(tmpManifest);

		// Determine output file name
		let tmpOutputFileName = this.CommandOptions.output;
		if ((!tmpOutputFileName) || (typeof(tmpOutputFileName) != 'string') || (tmpOutputFileName.length === 0))
		{
			let tmpScope = 'Default';
			if ((tmpManifest) && (tmpManifest.Scope))
			{
				tmpScope = tmpManifest.Scope;
			}
			if ((tmpManifest) && (tmpManifest.Form))
			{
				tmpScope = tmpManifest.Form;
			}
			tmpOutputFileName = `${tmpScope}.csv`;
		}
		tmpOutputFileName = libPath.resolve(tmpOutputFileName);

		// Write the CSV data to file -- first take the tabular array and turn it into a CSV string
		let tmpCSVLines = [];
		for (let tmpRowIndex = 0; tmpRowIndex < tmpCSVDataArray.length; tmpRowIndex++)
		{
			let tmpRow = tmpCSVDataArray[tmpRowIndex];
			let tmpEscapedRow = [];
			for (let tmpColumnIndex = 0; tmpColumnIndex < tmpRow.length; tmpColumnIndex++)
			{
				let tmpCell = tmpRow[tmpColumnIndex];
				if ((typeof(tmpCell) === 'string') && ((tmpCell.indexOf(',') >= 0) || (tmpCell.indexOf('"') >= 0) || (tmpCell.indexOf('\n') >= 0)))
				{
					// Escape quotes
					let tmpEscapedCell = tmpCell.replace(/"/g, '""');
					// Wrap in quotes
					tmpEscapedCell = `"${tmpEscapedCell}"`;
					tmpEscapedRow.push(tmpEscapedCell);
				}
				else
				{
					tmpEscapedRow.push(tmpCell);
				}
			}
			tmpCSVLines.push(tmpEscapedRow.join(','));
		}
		let tmpCSVDataString = tmpCSVLines.join('\n');

		this.fable.FilePersistence.writeFileSync(tmpOutputFileName, tmpCSVDataString, { encoding: 'utf8' });
		this.fable.log.info(`Wrote CSV data (length ${tmpCSVDataString.length}) to file [${tmpOutputFileName}].`);

		return fCallback();
	};
}

module.exports = ImportCSVCommand;