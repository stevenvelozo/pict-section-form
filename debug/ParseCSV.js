
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

	readExtraDataCSV(pFilePath, fCallback)
	{
		///////////////////////////////////////////////////////////////////////////////
		// Parse the CSV file
		const tmpRecords = [];
		this.fable.log.info(`Parsing CSV file [${pFilePath}]...`);

		const tmpReadline = libReadline.createInterface(
			{
				input: libFS.createReadStream(pFilePath),
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
				return fCallback(null, tmpRecords);
			});
	}

	onRunAsync(fCallback)
	{
		this.fable.instantiateServiceProvider('CSVParser');
		this.fable.instantiateServiceProvider('FilePersistence');

		// 1. Load the manifest
		let tmpManifestFileName = libPath.join(this.CommandOptions.manifest);
		if (!libFS.existsSync(tmpManifestFileName))
		{
			this.log.warn(`Manifest file not found at [${tmpManifestFileName}] -- checking current working directory.`);
			tmpManifestFileName = libPath.join(process.cwd, tmpManifestFileName);
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

		let tmpAnticipate = this.fable.newAnticipate();

		// Check to see if there are any markdown files that need to be injected
		let tmpDescriptorKeys = Object.keys(this.workingManifest.Descriptors);
		for (let i = 0; i < tmpDescriptorKeys.length; i++)
		{
			let tmpDescriptor = this.workingManifest.Descriptors[tmpDescriptorKeys[i]];
			if ('PictForm' in tmpDescriptor)
			{
				if (tmpDescriptor.PictForm.InputType == 'Markdown')
				{
					this.log.info(`Checking for extra data Markdown for Descriptor [${tmpDescriptor.Hash}]...`);

					let tmpPotentialMarkdownPath = libPath.join(this.CommandOptions.directory, `${tmpDescriptor.Hash}.md`);
					if (!libFS.existsSync(tmpPotentialMarkdownPath))
					{
						this.log.warn(`No extra data Markdown found at [${tmpPotentialMarkdownPath}] ... checking with full cwd in path`);
						tmpPotentialMarkdownPath = libPath.join(process.cwd(), this.CommandOptions.directory, `${tmpDescriptor.Hash}.md`);
					}
					if (!libFS.existsSync(tmpPotentialMarkdownPath))
					{
						this.log.warn(`No extra data Markdown found at [${tmpPotentialMarkdownPath}]`);
						continue;
					}

					this.log.info(`...found extra data Markdown at [${tmpPotentialMarkdownPath}].`);
					let tmpMarkdownContent = libFS.readFileSync(tmpPotentialMarkdownPath, 'utf8');
					this.log.info(`...[${tmpPotentialMarkdownPath}] had ${tmpMarkdownContent.length} characters; assigning to Content`);
					tmpDescriptor.Content = tmpMarkdownContent;
				}
				if (tmpDescriptor.PictForm.InputType == 'HTML')
				{
					this.log.info(`Checking for extra data HTML for Descriptor [${tmpDescriptor.Hash}]...`);

					let tmpPotentialHTMLPath = libPath.join(this.CommandOptions.directory, `${tmpDescriptor.Hash}.html`);
					if (!libFS.existsSync(tmpPotentialHTMLPath))
					{
						this.log.warn(`No extra data HTML found at [${tmpPotentialHTMLPath}] ... checking with full cwd in path`);
						tmpPotentialHTMLPath = libPath.join(process.cwd(), this.CommandOptions.directory, `${tmpDescriptor.Hash}.html`);
					}
					if (!libFS.existsSync(tmpPotentialHTMLPath))
					{
						this.log.warn(`No extra data HTML found at [${tmpPotentialHTMLPath}]`);
						continue;
					}

					this.log.info(`...found extra data HTML at [${tmpPotentialHTMLPath}].`);
					let tmpMarkdownContent = libFS.readFileSync(tmpPotentialHTMLPath, 'utf8');
					this.log.info(`...[${tmpPotentialHTMLPath}] had ${tmpMarkdownContent.length} characters; assigning to Content`);
					tmpDescriptor.Content = tmpMarkdownContent;
				}
			}
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
				if (!('RecordManifest' in tmpGroup))
				{
					continue;
				}

				this.log.info(`Checking for extra data RecordManifest [${tmpGroup.RecordManifest}] for Section [${tmpSection.Name}] Group [${tmpGroup.Name}]...`);

				let tmpPotentialCSVPath = libPath.join(this.CommandOptions.directory, `${tmpGroup.RecordManifest}.csv`);
				if (!libFS.existsSync(tmpPotentialCSVPath))
				{
					this.log.warn(`No extra data CSV found at [${tmpPotentialCSVPath}] ... checking with full cwd in path`);
					tmpPotentialCSVPath = libPath.join(process.cwd(), this.CommandOptions.directory, `${tmpGroup.RecordManifest}.csv`);
				}
				if (!libFS.existsSync(tmpPotentialCSVPath))
				{
					this.log.warn(`No extra data CSV found at [${tmpPotentialCSVPath}]`);
					continue;
				}

				this.log.info(`...found RecordManifest data at [${tmpPotentialCSVPath}].`);

				tmpAnticipate.anticipate(
					function (fCallback)
					{
						this.readExtraDataCSV(tmpPotentialCSVPath,
							function (pError, pData)
							{
								if (pError)
								{
									this.log.error(`Error reading extra data CSV file [${tmpPotentialCSVPath}]: ${pError}`);
									return fCallback(pError);
								}
								if (Array.isArray(pData))
								{
									tmpGroup.DefaultRows = pData;
								}
								return fCallback();
							}.bind(this)
						);
					}.bind(this));
			}
		}

		tmpAnticipate.wait(
			function (pError)
			{
				if (pError)
				{
					this.log.error(`Error reading extra data CSV or content file: ${pError}`);
					return fCallback(pError);
				}

				// Write the whole manifests thingy out here locally
				libFS.writeFileSync(this.CommandOptions.output, JSON.stringify(this.workingManifest, null, 4), 'utf8');

				return fCallback();
			}.bind(this));

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