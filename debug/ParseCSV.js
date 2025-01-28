
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
		this.fable.addAndInstantiateServiceType('ManifestFactory', require('./ParseCSV-CustomManifestCSVFactory.js'));
		//this.fable.addAndInstantiateServiceType('ManifestFactory', require('../source/services/ManifestFactory.js'));
		// Initialize the CSV parser
		this.fable.instantiateServiceProvider('CSVParser');
		this.fable.instantiateServiceProvider('FilePersistence');
		// Setup the formatter to clean nonalpha characters to underscores
		this.fable.DataFormat._Value_Clean_formatterCleanNonAlpha = '_';

		///////////////////////////////////////////////////////////////////////////////
		// Parse the CSV file
		const tmpRecords = [];
		this.fable.log.info(`Parsing CSV file [${tmpFileName}]...`);

		const tmpReadline = libReadline.createInterface(
			{
				input: libFS.createReadStream(tmpFileName),
				crlfDelay: Infinity,
			});

		tmpReadline.on('line',
			(pLine) =>
			{
				const tmpRecord = this.fable.CSVParser.parseCSVLine(pLine);
				if (tmpRecord)
				{
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

class ImportExtraDataCSVCommand extends libPictCommandLineUtility.ServiceCommandLineCommand
{
	constructor(pFable, pSettings, pServiceHash)
	{
		super(pFable, pSettings, pServiceHash);

		this.options.CommandKeyword = 'inject';
		this.options.Description = 'Inject default data and content.';

		this.options.CommandOptions.push({ Name: '-m, --manifest [filename]', Description: 'The manifest to inject data into.', Default: './data/MathExampleForm.json'});
		this.options.CommandOptions.push({ Name: '-o, --output [filename]', Description: 'The output manifest to write.', Default: './data/MathExampleForm.json'});
		this.options.CommandOptions.push({ Name: '-d, --directory [directory]', Description: 'The directory that contains input data.', Default: './input_data/'});

		this.addCommand();
	}

	readExtraDataCSV(pFileName, fCallback)
	{
		///////////////////////////////////////////////////////////////////////////////
		// Parse the CSV file
		const tmpRecords = [];
		this.fable.log.info(`Parsing CSV file [${pFileName}]...`);

		const tmpReadline = libReadline.createInterface(
			{
				input: libFS.createReadStream(pFileName),
				crlfDelay: Infinity,
			});

		tmpReadline.on('line',
			(pLine) =>
			{
				const tmpRecord = this.fable.CSVParser.parseCSVLine(pLine);
				if (tmpRecord)
				{
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
	}

	onRunAsync(fCallback)
	{
		// 1. Load the manifest
		let tmpManifestFileName = libPath.join(this.CommandOptions.manifest);
		if (!libFS.existsSync(tmpManifestFileName))
		{
			this.log.warn(`Manifest file not found at [${tmpManifestFileName}] -- checking current working directory.`);
			tmpManifestFileName = libPath.join(process.cwd(), tmpManifestFileName);
		}
		if (!libFS.existsSync(tmpManifestFileName))
		{
			this.log.error(`No valid manifest file found at [${tmpManifestFileName}].`);
			return fCallback();
		}

		this.rawManifest = '';
		this.workingManifest = null;
		try
		{
			this.rawManifest = libFS.readFileSync(tmpManifestFileName, 'utf8');
			this.workingManifest = JSON.parse(this.rawManifest);
		}
		catch(pError)
		{
			this.log.error(`Error parsing manifest file [${tmpManifestFileName}]: ${pError}`);
			return fCallback(pError);
		}

		// 2. Check that the manifest contains the right structures
		if (!this.workingManifest)
		{
			this.log.error(`No valid manifest found at [${tmpManifestFileName}].`);
			return fCallback();
		}
		if (!('Sections' in this.workingManifest))
		{
			this.log.error(`This manifest does not have a Sections object in it -- injection is impossible.`);
			return fCallback();
		}

		// 3. See if there are sections with submanifests
		for (let i = 0; i < this.workingManifest.Sections.length; i++)
		{
			let tmpSection = this.workingManifest.Sections[i];
			if (!('Groups' in tmpSection))
			{
				continue;
			}
			else if (!Array.isArray(tmpSection.Groups))
			{
				continue;
			}

			for (let j = 0; j < tmpSection.Groups.length; j++)
			{
				let tmpGroup = tmpSection.Groups[j];
				if (!('SubManifest' in tmpGroup))
				{
					continue;
				}

				this.log.info(`Checking for extra data SubManifest for Section [${tmpSection.Name}] Group [${tmpGroup.Name}]...`);

				let tmpDefaultRows = [];

				if (libFS.existsSync(libPath.join(this.CommandOptions.directory, tmpGroup.SubManifest)))
				{
					let tmpInputDataPath = libPath.join(this.CommandOptions.directory, tmpGroup.SubManifest)
					this.log.info(`...found SubManifest data  at [${tmpInputDataPath}].`);
				}
				else if (libFS.existsSync(libPath.join(process.cwd(), this.CommandOptions.directory, tmpGroup.SubManifest)))
				{
					let tmpInputDataPath = libPath.join(process.cwd(), this.CommandOptions.directory, tmpGroup.SubManifest);
					this.log.info(`...found SubManifest data  at [${tmpInputDataPath}].`);
				}
			}
		}



	};
}

const _ProgramConfiguration = (
	{
		Product: 'PictSection-TabularCSV-Input',
		Version: '0.0.2',
		
		// The command is very similar to PTSD
		Command: 'pstcsvi',
		Description: 'Pict Section Tabular CSV Input',

		ProgramConfigurationFileName: '.pict-cli-debugharness-config.json',

		DefaultProgramConfiguration: { },

		AutoGatherProgramConfiguration: true,
		AutoAddConfigurationExplanationCommand: true
	});

let _Program = new libPictCommandLineUtility(_ProgramConfiguration, [ ImportCSVCommand, ImportExtraDataCSVCommand ]);

_Program.LogNoisiness = 4;

module.exports = _Program;