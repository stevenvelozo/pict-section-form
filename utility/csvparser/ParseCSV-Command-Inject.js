
let libPictCommandLineUtility = require('pict-service-commandlineutility');

const libFS = require('fs');
const libPath = require('path');
const libReadline = require('readline');

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
		const tmpCSVParser = this.fable.instantiateServiceProvider('CSVParser');
		this.fable.log.info(`Parsing CSV file [${pFilePath}]...`);

		const tmpReadline = libReadline.createInterface(
			{
				input: libFS.createReadStream(pFilePath),
				crlfDelay: Infinity,
			});

		tmpReadline.on('line',
			(pLine) =>
			{
				const tmpRecord = tmpCSVParser.parseCSVLine(pLine);
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

	readOptionsCSV(pFilePath, fCallback)
	{
		///////////////////////////////////////////////////////////////////////////////
		// Parse the CSV file
		const tmpRecords = [];
		const tmpCSVParser = this.fable.instantiateServiceProvider('CSVParser');
		this.fable.log.info(`Parsing Options CSV file [${pFilePath}]...`);

		const tmpReadline = libReadline.createInterface(
			{
				input: libFS.createReadStream(pFilePath),
				crlfDelay: Infinity,
			});

		tmpReadline.on('line',
			(pLine) =>
			{
				const tmpRecord = tmpCSVParser.parseCSVLine(pLine);
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
		this.fable.instantiateServiceProvider('FilePersistence');

		let tmpAnticipate = this.fable.newAnticipate();


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

		this.optionsData = {};
		// 1.5: See if there are sections with options
		let tmpPotentialOptionsCSVPath = libPath.join(this.CommandOptions.directory, `Pict-OptionsLists.csv`);
		let tmpPotentialOptionsCSVExists = libFS.existsSync(tmpPotentialOptionsCSVPath);
		if (!tmpPotentialOptionsCSVExists)
		{
			this.log.warn(`No Options CSV found at [${tmpPotentialCSVPath}] ... checking with full cwd in path`);
			tmpPotentialOptionsCSVPath = libPath.join(process.cwd(), this.CommandOptions.directory, `${tmpGroup.RecordManifest}.csv`);
			tmpPotentialOptionsCSVExists = libFS.existsSync(tmpPotentialOptionsCSVPath);
		}
		if (tmpPotentialOptionsCSVExists)
		{
			this.log.info(`Options CSV located at [${tmpPotentialOptionsCSVPath}]... loading and checking against options Descriptors.`);
			tmpAnticipate.anticipate(
				function (fNext)
				{
					this.readOptionsCSV(tmpPotentialOptionsCSVPath,
						function (pError, pData)
						{
							if (pError)
							{
								this.log.error(`Error reading options data csv file [${tmpPotentialOptionsCSVPath}]: ${pError}`);
								return fNext(pError);
							}

							if (Array.isArray(pData))
							{
								this.optionsDataRaw = pData;
								// Bucket these by form and then by Input
								for (let i = 0; i < pData.length; i++)
								{
									let tmpRow = pData[i];

									let tmpForm = tmpRow['Form'];
									if (!tmpForm || (tmpForm.length == 0))
									{
										this.log.error(`No form hash found in options data row: ${JSON.stringify(tmpRow)}; skipping this row of the options data.`);
										continue;
									}

									let tmpSection = tmpRow['Section Hash'];
									if (!tmpSection || (tmpSection.length == 0))
									{
										this.log.error(`No section hash found in options data row: ${JSON.stringify(tmpRow)}; skipping this row of the options data.`);
										continue;
									}

									let tmpInputHash = tmpRow['Input Hash'];
									if (!tmpInputHash || (tmpInputHash.length == 0))
									{
										this.log.error(`No input hash found in options data row: ${JSON.stringify(tmpRow)}; skipping this row of the options data.`);
										continue;
									}

									// Check that one of these three is present
									// "Option Value", "Option Text", "List Address"
									if (!('Option Value' in tmpRow) || !('Option Text' in tmpRow) || !('List Source Address' in tmpRow))
									{
										this.log.error(`No Option Value, Option Text, or List Address found in options data row: ${JSON.stringify(tmpRow)}; skipping this row of the options data.`);
										continue;
									}

									// Check that one of these three things is not empty, so we have something to build list data out of.
									if ((tmpRow['Option Value'].length == 0) && (tmpRow['Option Text'].length == 0) && (tmpRow['List Source Address'].length == 0))
									{
										this.log.error(`No Option Value, Option Text, or List Address found in options data row: ${JSON.stringify(tmpRow)}; skipping this row of the options data.`);
										continue;
									}

									if (!(tmpForm in this.optionsData))
									{
										this.optionsData[tmpForm] = {};
									}

									if (!(tmpInputHash in this.optionsData[tmpForm]))
									{
										this.optionsData[tmpForm][tmpInputHash] = [];
									}

									this.optionsData[tmpForm][tmpInputHash].push(tmpRow);
								}
							}

							// Precompile the picklists -- the CSV doesn't contain valid configuration necessarily
							// The this.inputToPicklistMapping mapping declares inputs that need the picklist to be their configuration if it isn't set (based on the CSV)
							// The mapping has Section->InputHash->PickListHash
							this.inputToPicklistMapping = {};
							// The this.pickListConfigurations mapping declares the picklist configurations that need to be injected into each section.
							this.pickListConfigurations = {};

							let tmpFormKeys = Object.keys(this.optionsData);
							for (let i = 0; i < tmpFormKeys.length; i++)
							{
								let tmpForm = tmpFormKeys[i];
								let tmpFormOptions = this.optionsData[tmpForm];
								let tmpSectionOptionsKeys = Object.keys(tmpFormOptions);

								for (let k = 0; k < tmpSectionOptionsKeys.length; k++)
								{
									let tmpOptionsRows = tmpFormOptions[tmpSectionOptionsKeys[k]];

									for (let j = 0; j < tmpOptionsRows.length; j++)
									{
										let tmpOptionsRow = tmpOptionsRows[j];

										let tmpSectionHash = tmpOptionsRow['Section Hash'];
										let tmpInputHash = tmpOptionsRow['Input Hash'];

										// Each list in a section has a unique hash.
										// If the CSV didn't provide one, we'll make one up.
										let tmpPickListHash = tmpOptionsRow['PickList Hash'];
										if (!tmpPickListHash)
										{
											tmpPickListHash = `OPTION_${tmpSectionHash}_${tmpInputHash}`;
										}

										// Funny thing --- list addressses are scoped to Pict and not AppData
										let tmpPickListAddress = tmpOptionsRow['List Address'];
										if (!tmpPickListAddress)
										{
											tmpPickListAddress = `AppData.${tmpPickListHash}_LIST`;
										}

										// The list source address is scoped to AppData
										let tmpPickListSourceAddress = tmpOptionsRow['List Source Address'];
										// Keep track if we have an explicit or implicit source address.
										// If it's not explicit we won't map the values to a location, but will keep them in the picklists config for use that way.
										let tmpExplicitAddress = true;
										if (!tmpPickListSourceAddress)
										{
											tmpPickListSourceAddress = `${tmpPickListHash}_SOURCE`;
											tmpExplicitAddress = false;
										}

										// The list source address is scoped to AppData
										let tmpTextTemplate = tmpOptionsRow['Text Template'];
										if (!tmpTextTemplate)
										{
											tmpTextTemplate = `{~Data:text~}`;
										}
										let tmpIDTemplate = tmpOptionsRow['ID Template'];
										if (!tmpIDTemplate)
										{
											tmpIDTemplate = `{~Data:id~}`;
										}
										let tmpUpdateFrequency = tmpOptionsRow['Update Frequency'];
										if (!tmpUpdateFrequency)
										{
											// TDODO: Is this right?
											tmpUpdateFrequency = 'Always';
										}
										let tmpUnique = ((tmpOptionsRow['Unique'].toLowerCase() == 'x') || (tmpOptionsRow['Unique'].toLowerCase() == 'TRUE'));
										let tmpSorted = ((tmpOptionsRow['Sorted'].toLowerCase() == 'x') || (tmpOptionsRow['Sorted'].toLowerCase() == 'TRUE'));

										// For each picklist hash add it to the PickLists array.
										if (!(tmpSectionHash in this.inputToPicklistMapping))
										{
											this.inputToPicklistMapping[tmpSectionHash] = {};
										}
										if (!(tmpOptionsRow['Input Hash'] in this.inputToPicklistMapping[tmpSectionHash]))
										{
											this.inputToPicklistMapping[tmpSectionHash][tmpOptionsRow['Input Hash']] = tmpPickListHash;
										}

										// Now see if there is already a picklist configuration for this row.  It depends on what the user set -- the CSV can do nonsensicle things for sure.
										if (!(tmpSectionHash in this.pickListConfigurations))
										{
											this.pickListConfigurations[tmpSectionHash] = {};
										}
										if (!(tmpPickListHash in this.pickListConfigurations[tmpSectionHash]))
										{
											this.pickListConfigurations[tmpSectionHash][tmpPickListHash] = {};
										}

										// Now generate the proper config (or update what's there) from each line of the CSV.
										// This does something slightly different the first time since it needs to be
										// a valid picklist configuration, some options will have to be inferred most likely.
										let tmpPickListConfig = this.pickListConfigurations[tmpSectionHash][tmpPickListHash];

										if (!('DefaultListData' in tmpPickListConfig))
										{
											tmpPickListConfig.DefaultListData = [];
										}

										tmpPickListConfig.Hash = tmpPickListHash;

										// If there is a valid List Address, use it.
										tmpPickListConfig.ListAddress = tmpPickListAddress;
										tmpPickListConfig.ListSourceAddress = tmpPickListSourceAddress;
										tmpPickListConfig.ExplicitSourceAddress = tmpExplicitAddress;

										tmpPickListConfig.TextTemplate = tmpTextTemplate;
										tmpPickListConfig.IDTemplate = tmpIDTemplate;

										tmpPickListConfig.Unique = tmpUnique;
										tmpPickListConfig.Sorted = tmpSorted;
										tmpPickListConfig.UpdateFrequency = tmpUpdateFrequency;

										if (tmpOptionsRow['Option Value'] || tmpOptionsRow['Option Text'])
										{
											tmpPickListConfig.DefaultListData.push(
												{
													id: tmpOptionsRow['Option Value'],
													text: tmpOptionsRow['Option Text']
												});
										}
									}
								}
							}

							return fNext();
						}.bind(this)
					);
				}.bind(this));
		}

		tmpAnticipate.anticipate(
			function (fNextStage)
			{
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
						let tmpSectionHash = tmpDescriptor?.PictForm?.Section;
						if (tmpSectionHash)
						{
							if ((tmpSectionHash in this.inputToPicklistMapping) && (tmpDescriptor.Hash in this.inputToPicklistMapping[tmpSectionHash]))
							{
								let tmpPickListHash = this.inputToPicklistMapping[tmpSectionHash][tmpDescriptor.Hash];
								let tmpPickList = this.pickListConfigurations[tmpSectionHash][tmpPickListHash];
								if (tmpPickList.ExplicitSourceAddress)
								{
									// TODO: We can set this even if it has default data...
									// TODO: And we can have it auto marshal values into the location if it's empty but that could get messy.
									tmpDescriptor.PictForm.SelectOptionsPickList = tmpPickList.Hash;
								}
								else
								{
									tmpDescriptor.PictForm.SelectOptions = tmpPickList.DefaultListData;
								}
							}
						}
					}
				}

				// 3. See if there are sections with submanifests, and, any options lists to create.
				for (let i = 0; i < this.workingManifest.Sections.length; i++)
				{
					let tmpSection = this.workingManifest.Sections[i];

					// TODO: Figure out if there are options m anifests to put in this section.

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

						// TODO: Figure out if there are options m anifests to put in any inputs for this section.
						if (tmpSection.Hash in this.pickListConfigurations)
						{
							let tmpSectionOptions = this.pickListConfigurations[tmpSection.Hash];
							let tmpSectionOptionsKeys = Object.keys(tmpSectionOptions);

							if (!('PickLists' in tmpSection))
							{
								tmpSection.PickLists = [];
							}

							if (tmpSectionOptionsKeys.length > 0)
							{
								for (let k = 0; k < tmpSectionOptionsKeys.length; k++)
								{
									let tmpPickList = tmpSectionOptions[tmpSectionOptionsKeys[k]];
									tmpSection.PickLists.push(tmpPickList);
								}
							}
						}

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
							function (fNext)
							{
								this.readExtraDataCSV(tmpPotentialCSVPath,
									function (pError, pData)
									{
										if (pError)
										{
											this.log.error(`Error reading extra data CSV file [${tmpPotentialCSVPath}]: ${pError}`);
											return fNext(pError);
										}
										if (Array.isArray(pData))
										{
											tmpGroup.DefaultRows = pData;
										}
										return fNext();
									}.bind(this)
								);
							}.bind(this));
					}
				}
				return fNextStage();
			}.bind(this));

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

module.exports = ImportExtraDataCSVCommand;