
let libPictCommandLineUtility = require('pict-service-commandlineutility');

const libFS = require('fs');
const libPath = require('path');
const libReadline = require('readline');

class ImportExtraDataCSVCommand extends libPictCommandLineUtility.ServiceCommandLineCommand
{
	constructor(pFable, pSettings, pServiceHash)
	{
		super(pFable, pSettings, pServiceHash);

		this.options.CommandKeyword = 'intersect';
		this.options.Description = 'Build distilling graph from csv tabular intersection files.';

		this.options.CommandOptions.push({ Name: '-m, --manifest [filename]', Description: 'The manifest to inject data into.', Default: './data/MathExampleForm.json'});
		this.options.CommandOptions.push({ Name: '-o, --output [filename]', Description: 'The output manifest to write.', Default: './data/MathExampleForm.json'});
		this.options.CommandOptions.push({ Name: '-d, --directory [directory]', Description: 'The directory that contains distilling input data.', Default: './input_data_intersections/'});

		this.addCommand();
	}

	getJoinEntityName(pFirstEntity, pSecondEntity)
	{
		return `${pFirstEntity}${pSecondEntity}Join`;
	}

	/**
	 * Take a set of records and generate an intersection comprehension from it.
	 * FirstEntity is the left side of the table.
	 * SecondEntity is the top side of the table.
	 * @param {string} pFirstEntity 
	 * @param {string} pSecondEntity 
	 * @param {Array} pRecords 
	 * @param {Object} pComprehension 
	 */
	intersectTabularData(pFirstEntity, pSecondEntity, pRecords, pComprehension)
	{
		// If there isn't at least one row, there are no joins defined
		if (pRecords.length < 1)
		{
			return pComprehension;
		}

		let tmpJoinEntityName = this.getJoinEntityName(pFirstEntity, pSecondEntity);
		let tmpJoinEntityGUIDName = `GUID${tmpJoinEntityName}`;

		if (!pComprehension[tmpJoinEntityName])
		{
			pComprehension[tmpJoinEntityName] = {};
		}

		let tmpFirstLeftEntityKey = `__GUID__`;
		for (let i = 0; i < pRecords.length; i++)
		{
			let tmpRecord = pRecords[i];

			// Now see if there is data .. there should be at least 2 keys
			let tmpRecordKeys = Object.keys(tmpRecord);
			if (tmpRecordKeys.length < 2)
			{
				continue;
			}

			// Get the left side of the join, which is stable for the whole record
			tmpFirstLeftEntityKey = `GUID${pFirstEntity}`;
			let tmpFirstLeftEntityValue = tmpRecord[tmpRecordKeys[0]];

			// Enumerate each column and see if there is something that warrants creating a record
			for (let j = 1; j < tmpRecordKeys.length; j++)
			{
				let tmpRecordValue = tmpRecord[tmpRecordKeys[j]];
				if ((tmpRecordValue.toLowerCase() === 'x') || (tmpRecordValue.toLowerCase() === 'true') || (tmpRecordValue.toLowerCase() === '1'))
				{
					let tmpSecondTopEntityKey = `GUID${pSecondEntity}`;
					let tmpSecondTopEntityValue = tmpRecordKeys[j];
					let tmpJoinRecordGUID = `L-${tmpFirstLeftEntityValue}-T-${tmpSecondTopEntityValue}`;

					let tmpJoinRecord = {};
					tmpJoinRecord[tmpJoinEntityGUIDName] = tmpJoinRecordGUID;
					tmpJoinRecord[tmpFirstLeftEntityKey] = tmpFirstLeftEntityValue;
					tmpJoinRecord[tmpSecondTopEntityKey] = tmpSecondTopEntityValue;

					if (!pComprehension[tmpJoinEntityName][tmpJoinRecordGUID])
					{
						pComprehension[tmpJoinEntityName][tmpJoinRecordGUID] = tmpJoinRecord;
					}
					else
					{
						// This is a duplicate record
						this.fable.log.warn(`Duplicate record detected for ${tmpJoinEntityName} with GUID ${tmpJoinRecordGUID}.  Merging.`);
						pComprehension[tmpJoinEntityName][tmpJoinRecordGUID] = Object.assign({}, pComprehension[tmpJoinEntityName][tmpJoinRecordGUID], tmpJoinRecord);
					}
				}
			}
		}
	}

	loadIntersectionFile(pFileToLoad, fCallback)
	{
		let tmpFile = libPath.join(pFileToLoad.Directory, pFileToLoad.FileName);
		if ((!tmpFile) || (typeof(tmpFile) != 'string') || (tmpFile.length === 0))
		{
			this.log.error('No valid filename provided.');
			return fCallback();
		}

		const tmpIntersectionOutcome = (
			{
				Comprehension: {},
				RawRecords: [],
				CommandConfiguration:
					{
//						FirstEntity: false,
//						SecondEntity: false
					},
				Configuration: false,
				ParsedRowCount: 0,
				BadRecords: []
			});

		if (pFileToLoad.MatchedDescriptorKeys.length != 2)
		{
			this.log.error(`File [${tmpFile}] does not match exactly two descriptors.  Odd things might happen.  Descriptors found: ${pFileToLoad.MatchedDescriptorKeys.join(', ')}`);
		}

		if (pFileToLoad.MatchedDescriptorKeys.length < 2)
		{
			tmpIntersectionOutcome.CommandConfiguration.SecondEntity = 'SecondEntity';
		}
		else
		{
			tmpIntersectionOutcome.CommandConfiguration.SecondEntity = pFileToLoad.MatchedDescriptorKeys[1];
		}

		if (pFileToLoad.MatchedDescriptorKeys.length < 1)
		{
			tmpIntersectionOutcome.CommandConfiguration.FirstEntity = 'FirstEntity';
		}
		else
		{
			tmpIntersectionOutcome.CommandConfiguration.FirstEntity = pFileToLoad.MatchedDescriptorKeys[0];
		}

		// Initialize the fable CSV parser
		this.fable.instantiateServiceProvider('CSVParser');
		this.fable.instantiateServiceProvider('FilePersistence');

		// Do some input file housekeeping
		if (!this.fable.FilePersistence.existsSync(tmpFile))
		{
			this.fable.log.error(`File [${tmpFile}] does not exist.  Checking in the current working directory...`);
			tmpFile = libPath.join(process.cwd(), tmpFile);
			if (!this.fable.FilePersistence.existsSync(tmpFile))
			{
				this.fable.log.error(`File [${tmpFile}] does not exist in the current working directory.  Could not parse input CSV file.  Aborting.`);
				return fCallback();
			}
		}

		this.fable.log.info(`Parsing CSV file [${tmpFile}]...`);
		const tmpReadline = libReadline.createInterface(
			{
				input: libFS.createReadStream(tmpFile),
				crlfDelay: Infinity,
			});

		tmpReadline.on('line',
			(pLine) =>
			{
				const tmpIncomingRecord = this.fable.CSVParser.parseCSVLine(pLine);

				tmpIntersectionOutcome.ParsedRowCount++;
				tmpIntersectionOutcome.RawRecords.push(tmpIncomingRecord);
			});

		tmpReadline.on('close',
			() =>
			{
				// Now perform the intersection
				this.intersectTabularData(tmpIntersectionOutcome.CommandConfiguration.FirstEntity, tmpIntersectionOutcome.CommandConfiguration.SecondEntity, tmpIntersectionOutcome.RawRecords, tmpIntersectionOutcome.Comprehension);

				// Now decorate the descriptor with the data
				pFileToLoad.IntersectionOutcome = tmpIntersectionOutcome;
				
				for (let i = 0; i < pFileToLoad.MatchedDescriptors.length; i++)
				{
					let tmpDescriptor = pFileToLoad.MatchedDescriptors[i];
					let tmpSectionHash = tmpDescriptor.PictForm.Section;

					for (let j = 0; j < this.workingManifest.Sections.length; j++)
					{
						let tmpSection = this.workingManifest.Sections[j];
						if (tmpSection.Hash === tmpSectionHash)
						{
							if (!tmpSection.Intersections)
							{
								tmpSection.Intersections = {};
							}

							// Put the intersection data into the section, keyed by the descriptor hash
							tmpSection.Intersections[tmpDescriptor.Hash] = pFileToLoad.IntersectionOutcome.Comprehension;
						}
					}
				}

				return fCallback();
			});
	}

	onRunAsync(fCallback)
	{
		this.fable.instantiateServiceProvider('FilePersistence');

		let tmpAnticipate = this.fable.newAnticipate();

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

		tmpAnticipate.anticipate(
			function (fLoadStageComplete)
			{
				// 2. Check that the manifest contains the right structures
				if (!this.workingManifest)
				{
					this.log.error(`No valid manifest found at [${tmpManifestFileName}].`);
					return fCallback();
				}
				if (!('Sections' in this.workingManifest))
				{
					this.log.error(`This manifest does not have a Sections object in it -- distilling build and bundle is impossible.`);
					return fCallback();
				}

				// Get the list of input hashes we need to look for in filenames -- it's just the keys for the descriptors
				let tmpDescriptorKeys = Object.keys(this.workingManifest.Descriptors);
				let tmpDescriptorHashList = [];
				// Yes, there is a way to get this from the manyfest but it is less clear what is going on to a dev in this script
				let tmpDescriptorHashKeyMap = {};

				for (let i = 0; i < tmpDescriptorKeys.length; i++)
				{
					tmpDescriptorHashList.push(this.workingManifest.Descriptors[tmpDescriptorKeys[i]].Hash);
					tmpDescriptorHashKeyMap[this.workingManifest.Descriptors[tmpDescriptorKeys[i]].Hash] = tmpDescriptorKeys[i];
				}

				// List all files in the passed-in directory
				let tmpDirectory = libPath.resolve(this.CommandOptions.directory);
				if (!libFS.existsSync(tmpDirectory))
				{
					this.log.error(`No valid directory found at [${tmpDirectory}]; checking with cwd.`);
					let tmpDirectory = libPath.join(process.cwd(), tmpDirectory);
					if (!libFS.existsSync(tmpDirectory))
					{
						this.log.error(`No valid directory found at [${tmpDirectory}].`);
						return fCallback();
					}
				}

				let tmpFiles = libFS.readdirSync(tmpDirectory);
				if (!tmpFiles)
				{
					this.log.error(`No files found in directory [${tmpDirectory}].`);
					return fCallback();
				}

				// 3. For each file in the directory, check if it matches a descriptor key
				let tmpFilesToLoad = {};
				for (let i = 0; i < tmpFiles.length; i++)
				{
					let tmpFile = tmpFiles[i];
					let tmpCleanedFileName = this.fable.DataFormat.cleanNonAlphaCharacters(this.fable.DataFormat.capitalizeEachWord(libPath.basename(tmpFile, libPath.extname(tmpFile))));
					let tmpFileNameParts = libPath.basename(tmpFile, libPath.extname(tmpFile)).split('-');

					for (let j = 0; j < tmpFileNameParts.length; j++)
					{
						// TODO: We know includes is slow, but in this case it might be fast enough?
						if (tmpDescriptorHashList.includes(tmpFileNameParts[j]))
						{
							if (tmpFile in tmpFilesToLoad)
							{
								tmpFilesToLoad[tmpFile].MatchedDescriptorKeys.push(tmpFileNameParts[j]);
								tmpFilesToLoad[tmpFile].MatchedDescriptors.push(this.workingManifest.Descriptors[tmpDescriptorHashKeyMap[tmpFileNameParts[j]]]);
							}
							else
							{
								tmpFilesToLoad[tmpFile] = (
									{
										FileName:tmpFile,
										FileNameParts:tmpFileNameParts,
										CleanedFileName:tmpCleanedFileName,
										Directory:tmpDirectory,
										MatchedDescriptorKeys:[tmpFileNameParts[j]],
										MatchedDescriptors: [this.workingManifest.Descriptors[tmpDescriptorHashKeyMap[tmpFileNameParts[j]]]]
									});
							}
						}
					}
				}

				// 4. For each file that matches a descriptor key, load it and inject it into the manifest
				let tmpFilesToLoadKeys = Object.keys(tmpFilesToLoad);
				for (let i = 0; i < tmpFilesToLoadKeys.length; i++)
				{
					tmpAnticipate.anticipate(
						function (fNext)
						{
							this.loadIntersectionFile(tmpFilesToLoad[tmpFilesToLoadKeys[i]], fNext);
						}.bind(this));
				}
				return fLoadStageComplete();
			}.bind(this));

		tmpAnticipate.wait(
			function (pError)
			{
				if (pError)
				{
					this.log.error(`Error building distilling bundles from csv files: ${pError}`);
					return fCallback(pError);
				}

				// Write the whole manifests thingy out here locally
				libFS.writeFileSync(this.CommandOptions.output, JSON.stringify(this.workingManifest, null, 4), 'utf8');

				return fCallback();
			}.bind(this));

	};
}

module.exports = ImportExtraDataCSVCommand;