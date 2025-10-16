
let libPictCommandLineUtility = require('pict-service-commandlineutility');

const libFS = require('fs');
const libPath = require('path');
const libReadline = require('readline');

class ImportCSVCommand extends libPictCommandLineUtility.ServiceCommandLineCommand
{
	constructor(pFable, pSettings, pServiceHash)
	{
		super(pFable, pSettings, pServiceHash);

		this.options.CommandKeyword = 'import';
		this.options.Description = 'Importing the data.';

		this.options.CommandOptions.push({ Name: '-f, --filename [filename]', Description: 'The tabular csv file to import.', Default: './TabularManifestCSV.csv'});
		this.options.CommandOptions.push({ Name: '-o, --output [filename]', Description: 'The output file to write the manifest to.', Default: './PICTSection-TabularManifests.json'});
		this.options.CommandOptions.push({ Name: '-d, --directory [directory]', Description: 'The manifest directory to output the manifests to individually.', Default: './data/'});

		this.addCommand();
	}

	onRunAsync(fCallback)
	{
		let tmpFileName = this.CommandOptions.filename;
		if ((!tmpFileName) || (typeof(tmpFileName) != 'string') || (tmpFileName.length === 0))
		{
			this.log.error('No valid filename provided.');
			return fCallback();
		}

		// Do some input file housekeeping
		if (!this.fable.FilePersistence.existsSync(tmpFileName))
		{
			this.fable.log.error(`File [${tmpFileName}] does not exist.  Checking in the current working directory...`);
			tmpFileName = libPath.join(process.cwd(), tmpFileName);
			if (!this.fable.FilePersistence.existsSync(tmpFileName))
			{
				this.fable.log.error(`File [${tmpFileName}] does not exist in the current working directory.  Could not parse input CSV file.  Aborting.`);
				return fCallback();
			}
		}
		let tmpOutputFileName = this.CommandOptions.output;
		if ((!tmpOutputFileName) || (typeof(tmpOutputFileName) != 'string') || (tmpOutputFileName.length === 0))
		{
			this.log.error('No valid output filename provided.');
			return fCallback();
		}
		let tmpManifestDirectory = libPath.resolve(this.CommandOptions.directory);
		if ((!tmpManifestDirectory) || (typeof(tmpManifestDirectory) != 'string') || (tmpManifestDirectory.length === 0))
		{
			this.log.error('No valid manifest directory provided.');
			return fCallback();
		}
	
		// The ManifestFactory gives us a programmatic way to manage Manifest config consistently
		//this.fable.addAndInstantiateServiceType('ManifestFactory', require('./ParseCSV-CustomManifestCSVFactory.js'));
		this.fable.addAndInstantiateServiceType('ManifestFactory', require('../../source/services/ManifestFactory.js'));
		// Initialize the CSV parser
		this.fable.instantiateServiceProvider('CSVParser');
		this.fable.instantiateServiceProvider('FilePersistence');
		// Setup the formatter to clean nonalpha characters to underscores
		this.fable.DataFormat._Value_Clean_formatterCleanNonAlpha = '_';

		///////////////////////////////////////////////////////////////////////////////
		// Parse the CSV file
		const tmpRecords = [];
		const tmpCSVParser = this.fable.instantiateServiceProvider('CSVParser');
		tmpCSVParser.EscapedQuoteString = '"';

		this.fable.log.info(`Parsing CSV file [${tmpFileName}]...`);

		const tmpReadline = libReadline.createInterface(
			{
				input: libFS.createReadStream(tmpFileName),
				crlfDelay: Infinity,
			});

		tmpReadline.on('line',
			(pLine) =>
			{
				const tmpRecord = tmpCSVParser.parseCSVLine(pLine);
				if (tmpRecord)
				{
					tmpRecord.Equation = tmpRecord.Equation.replace(/&quot;/g, '"');
					tmpRecords.push(tmpRecord);
				}
			});

		tmpReadline.on('close',
			() =>
			{
				this.fable.log.info(`...CSV parser completed, pulled ${tmpRecords.length} rows.`);

				// Write the whole manifests thingy out here locally
				const tmpManifests = this.fable.ManifestFactory.createManifestsFromTabularArray(tmpRecords);
				libFS.writeFileSync(tmpOutputFileName, JSON.stringify(tmpManifests, null, 4), 'utf8');

				// Write the individual manifests out to the output directory
				this.fable.log.info(`Writing individual manifests to [${tmpManifestDirectory}]...`);
				this.fable.FilePersistence.makeFolderRecursive(tmpManifestDirectory,
					(pError)=>
					{
						const tmpManifestKeys = Object.keys(tmpManifests);
						for (let i = 0; i < tmpManifestKeys.length; i++)
						{
							const tmpManifest = tmpManifests[tmpManifestKeys[i]];
							this.fable.log.info(`Manifest: ${tmpManifestKeys[i]} has ${Object.keys(tmpManifest.Descriptors).length} descriptors.. writing it to ${tmpManifestKeys[i]}.json and to ${tmpManifestKeys[i]}.sql`);
							libFS.writeFileSync(libPath.join(tmpManifestDirectory,`${tmpManifestKeys[i]}.json`), JSON.stringify(tmpManifest, null, 4), 'utf8');
						}
						return fCallback(pError);
					});
			});

	};
}

module.exports = ImportCSVCommand;