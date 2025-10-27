const libPictSectionInputExtension = require('../Pict-Provider-InputExtension.js');

/**
 * CustomInputHandler class.
 *
 * @class
 * @extends libPictSectionInputExtension
 * @memberof providers.inputs
 */
class CustomInputHandler extends libPictSectionInputExtension
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		/** @type {import('pict')} */
		this.pict;
		/** @type {import('pict')} */
		this.fable;
		/** @type {any} */
		this.log;

		// Manage the the configuration parsing configurations -- these can be overridden in the object or even per-input
		if (!this.options.DefaultCoreParsingConfiguration || !Array.isArray(this.options.DefaultCoreParsingConfiguration))
		{
			this.options.DefaultCoreParsingConfiguration = (
				{
					AddressInObject: '',
					ObjectType: 'object',
					MergeMethod: 'Object',
					Steps: [
						{
							InputProperty: false,
							Method: `Initialize`,
							Merge: false
						},
						{
							InputProperty: 'PictForm.ChartConfigCorePrototypeRaw',
							Method: `Raw`,
							Merge: true
						},
						{
							InputProperty: 'PictForm.ChartConfigCorePrototypeAddress',
							Method: `Address`,
							Merge: true
						},
						{
							InputProperty: `PictForm.ChartConfigCorePrototype`,
							Method: 'SingleSolver',
							Merge: true
						}
					]
				});
		}
		this.defaultCoreParsingConfiguration = JSON.parse(JSON.stringify(this.options.DefaultCoreParsingConfiguration));

		if (typeof (this.options.DefaultLabelParsingConfiguration) !== 'object' || !Array.isArray(this.options.DefaultLabelParsingConfiguration.Steps))
		{
			this.options.DefaultLabelParsingConfiguration = (
				{
					AddressInObject: 'data.labels',
					ObjectType: 'array',
					MergeMethod: 'Array',
					Steps: [
						{
							InputProperty: false,
							Method: `Initialize`,
							Merge: false
						},
						{
							InputProperty: 'PictForm.ChartLabelsRaw',
							Method: `Raw`,
							Merge: false
						},
						{
							InputProperty: 'PictForm.ChartLabelsAddress',
							Method: `Address`,
							Merge: false
						},
						{
							InputProperty: `PictForm.ChartLabelsSolver`,
							Method: 'SingleSolver',
							Merge: false
						}
					]
				});
		}
		this.defaultLabelParsingConfiguration = JSON.parse(JSON.stringify(this.options.DefaultLabelParsingConfiguration));

		if (typeof (this.options.DefaultDataParsingConfiguration) !== 'object' || !Array.isArray(this.options.DefaultDataParsingConfiguration.Steps))
		{
			this.options.DefaultDataParsingConfiguration = (
				{
					AddressInObject: 'data.datasets',
					ObjectType: 'array',
					MergeMethod: 'Array',
					Steps: [
						{
							InputProperty: false,
							Method: `Initialize`,
							Merge: false
						},
						{
							InputProperty: 'PictForm.ChartDatasetsRaw',
							Method: `Raw`,
							Merge: false
						},
						{
							InputProperty: 'PictForm.ChartDatasetsAddress',
							Method: `Address`,
							Merge: false
						},
						{
							InputProperty: 'PictForm.ChartDatasetsSolvers',
							Method: `ArrayOfSolvers`,
							Merge: true
						}
					]
				});
		}
		this.defaultDataParsingConfiguration = JSON.parse(JSON.stringify(this.options.DefaultDataParsingConfiguration));

		this.currentChartObjects = {};
	}

	/**
	 * 
	 * @param {Object} pInput - The PictForm input object
	 * @param {*} pChartConfiguration - The current configuration object for the form
	 * @param {*} pParsingConfiguration - The parsing configuration to apply
	 * @param {*} pInputParsingConfigurationScope - The input-specific parsing configuration string address for additional configuration
	 * @returns 
	 */
	applyInputParsingConfiguration(pInput, pChartConfiguration, pParsingConfiguration, pInputParsingConfigurationScope)
	{
		// TODO: There is a ton of DRY to be had in this function when we break it out to the base class
		let tmpInput = pInput;
		let tmpInputParsingConfigurationScope = pInputParsingConfigurationScope;

		let tmpChartConfiguration = pChartConfiguration;
		let tmpParsingConfiguration = pParsingConfiguration;

		if (typeof (pInput) !== 'object')
		{
			return false;
		}
		if (typeof (pInputParsingConfigurationScope) !== 'string' || (pInputParsingConfigurationScope.length < 1))
		{
			return false;
		}
		if (typeof (tmpParsingConfiguration) !== 'object')
		{
			return false;
		}

		if (typeof (tmpChartConfiguration) !== 'object')
		{
			tmpChartConfiguration = {};
		}

		// 1. Check if there is any custom configurtion for how to parse the config for this input (dynamic dynamic)
		let tmpInputCustomConfiguration = this.pict.manifest.getValueByHash(tmpInput, tmpInputParsingConfigurationScope);
		if (typeof (tmpInputCustomConfiguration) === 'object')
		{
			// Merge the custom configuration into the base configuration
			tmpParsingConfiguration = Object.assign(tmpParsingConfiguration, tmpInputCustomConfiguration);
		}

		// Get existing data
		let tmpExistingData;
		if (!tmpParsingConfiguration.AddressInObject || (tmpParsingConfiguration.AddressInObject == ''))
		{
			tmpExistingData = tmpChartConfiguration;
		}
		else
		{
			tmpExistingData = this.pict.manifest.getValueByHash(tmpChartConfiguration, tmpParsingConfiguration.AddressInObject);
		}

		// 2. Enumerate through each step and apply them consistently
		for (let i = 0; i < tmpParsingConfiguration.Steps.length; i++)
		{
			let tmpCurrentStep = tmpParsingConfiguration.Steps[i];

			switch (tmpCurrentStep.Method)
			{
				case 'Initialize':
					// Do nothing, already initialized
					if (tmpParsingConfiguration.AddressInObject && (typeof (tmpParsingConfiguration.AddressInObject) === 'string') && (tmpParsingConfiguration.AddressInObject.length > 0))
					{
						let tmpCurrentStepData = this.pict.manifest.getValueByHash(tmpChartConfiguration, tmpParsingConfiguration.AddressInObject);
						// see if the address exists and if it's the type we expect
						if (tmpParsingConfiguration.ObjectType === 'array')
						{
							if (!tmpCurrentStepData || !Array.isArray(tmpCurrentStepData))
							{
								this.pict.manifest.setValueByHash(tmpChartConfiguration, tmpParsingConfiguration.AddressInObject, []);
							}
						}
						else if (tmpParsingConfiguration.ObjectType === 'object')
						{
							if (!tmpCurrentStepData || (typeof (tmpCurrentStepData) !== 'object'))
							{
								this.pict.manifest.setValueByHash(tmpChartConfiguration, tmpParsingConfiguration.AddressInObject, {});
							}
						}
						else
						{
							this.pict.log.warn(`Unsupported ObjectType ${tmpParsingConfiguration.ObjectType} parsing chart Initialize configuration for input ${tmpInput.Macro.RawHTMLID}`);
						}
					}
					break;
				case 'Raw':
					// Check if the Raw is in there
					let tmpRawDataExists = this.pict.manifest.checkAddressExists(tmpInput, tmpCurrentStep.InputProperty);
					if (!tmpRawDataExists)
					{
						break;
					}

					// Get the raw data from the input
					let tmpRawData = this.pict.manifest.getValueByHash(tmpInput, tmpCurrentStep.InputProperty);
					let tmpRawDataType = typeof(tmpRawData);

					// We only support objects as configuration
					if (tmpRawDataType !== 'object')
					{
						break;
					}

					if (tmpParsingConfiguration.ObjectType === 'array')
					{
						if (Array.isArray(tmpRawData))
						{
							if (tmpCurrentStep.Merge)
							{
								// Get existing data
								if (!Array.isArray(tmpExistingData))
								{
									tmpExistingData = [];
								}
								// Merge in the arrays
								let tmpMergedData = tmpExistingData.concat(tmpRawData);
								this.pict.manifest.setValueByHash(tmpChartConfiguration, tmpParsingConfiguration.AddressInObject, tmpMergedData);
							}
							else
							{
								// Just set the value
								this.pict.manifest.setValueByHash(tmpChartConfiguration, tmpParsingConfiguration.AddressInObject, tmpRawData);
							}
						}
					}
					else if (tmpParsingConfiguration.ObjectType === 'object')
					{
						if (tmpCurrentStep.Merge)
						{
							if (!tmpParsingConfiguration.AddressInObject || (tmpParsingConfiguration.AddressInObject == ''))
							{
								// This is the "root" object, so we need to merge or set directly
								if (tmpCurrentStep.Merge)
								{
									tmpChartConfiguration = Object.assign(tmpChartConfiguration, tmpRawData);
								}
								else
								{
									tmpChartConfiguration = tmpRawData;
								}
							}
							else
							{
								if ((typeof(tmpExistingData) != 'object') || (tmpExistingData == null))
								{
									tmpExistingData = {};
								}
								if (tmpCurrentStep.Merge)
								{
									// Merge the objects
									let tmpMergedData = Object.assign(tmpExistingData, tmpRawData);
									this.pict.manifest.setValueByHash(tmpChartConfiguration, tmpParsingConfiguration.AddressInObject, tmpMergedData);
								}
								else
								{
									// Just set the value
									this.pict.manifest.setValueByHash(tmpChartConfiguration, tmpParsingConfiguration.AddressInObject, tmpRawData);
								}
							}
						}
						else
						{
							// Just set the value?
							this.pict.manifest.setValueByHash(tmpChartConfiguration, tmpParsingConfiguration.AddressInObject, tmpRawData);
						}
					}
					break;
				case 'Address':
					let tmpAddress = this.pict.manifest.getValueByHash(tmpInput, tmpCurrentStep.InputProperty);
					// Input is the Record in the resolution chain
					if (!tmpAddress)
					{
						break;
					}

					let tmpPotentialConfigurationObject = this.pict.resolveStateFromAddress(tmpAddress, pInput);

					if (typeof (tmpPotentialConfigurationObject) !== 'object')
					{
						break;
					}

					if (tmpParsingConfiguration.ObjectType === 'array')
					{
						if (Array.isArray(tmpRawData))
						{
							if (tmpCurrentStep.Merge)
							{
								// Get existing data
								if (!Array.isArray(tmpExistingData))
								{
									tmpExistingData = [];
								}
								// Merge in the arrays
								let tmpMergedData = tmpExistingData.concat(tmpRawData);
								this.pict.manifest.setValueByHash(tmpChartConfiguration, tmpParsingConfiguration.AddressInObject, tmpMergedData);
							}
							else
							{
								// Just set the value
								this.pict.manifest.setValueByHash(tmpChartConfiguration, tmpParsingConfiguration.AddressInObject, tmpRawData);
							}
						}
					}
					else if (tmpParsingConfiguration.ObjectType === 'object')
					{
						if (tmpCurrentStep.Merge)
						{
							if (!tmpParsingConfiguration.AddressInObject || (tmpParsingConfiguration.AddressInObject == ''))
							{
								// This is the "root" object, so we need to merge or set directly
								if (tmpCurrentStep.Merge)
								{
									tmpChartConfiguration = Object.assign(tmpChartConfiguration, tmpRawData);
								}
								else
								{
									tmpChartConfiguration = tmpRawData;
								}
							}
							else
							{
								if ((typeof(tmpExistingData) != 'object') || (tmpExistingData == null))
								{
									tmpExistingData = {};
								}
								if (tmpCurrentStep.Merge)
								{
									// Merge the objects
									let tmpMergedData = Object.assign(tmpExistingData, tmpRawData);
									this.pict.manifest.setValueByHash(tmpChartConfiguration, tmpParsingConfiguration.AddressInObject, tmpMergedData);
								}
								else
								{
									// Just set the value
									this.pict.manifest.setValueByHash(tmpChartConfiguration, tmpParsingConfiguration.AddressInObject, tmpRawData);
								}
							}
						}
						else
						{
							// Just set the value?
							this.pict.manifest.setValueByHash(tmpChartConfiguration, tmpParsingConfiguration.AddressInObject, tmpRawData);
						}
					}
					break;
				case 'SingleSolver':
					let tmpSolverExpression = this.pict.manifest.getValueByHash(tmpInput, tmpCurrentStep.InputProperty);
					// Check that the expression is a string
					if (typeof (tmpSolverExpression) !== 'string')
					{
						break;
					}

					let tmpSolvedConfiguration = this.pict.providers.DynamicSolver.runSolver(tmpSolverExpression);

					if (tmpParsingConfiguration.ObjectType === 'array')
					{
						if (Array.isArray(tmpSolvedConfiguration))
						{
							if (tmpCurrentStep.Merge)
							{
								// Get existing data
								if (!Array.isArray(tmpExistingData))
								{
									tmpExistingData = [];
								}
								// Merge in the arrays
								let tmpMergedData = tmpExistingData.concat(tmpSolvedConfiguration);
								this.pict.manifest.setValueByHash(tmpChartConfiguration, tmpParsingConfiguration.AddressInObject, tmpMergedData);
							}
							else
							{
								// Just set the value
								this.pict.manifest.setValueByHash(tmpChartConfiguration, tmpParsingConfiguration.AddressInObject, tmpSolvedConfiguration);
							}
						}
					}
					else if (tmpParsingConfiguration.ObjectType === 'object')
					{
						if (tmpCurrentStep.Merge)
						{
							if (!tmpParsingConfiguration.AddressInObject || (tmpParsingConfiguration.AddressInObject == ''))
							{
								// This is the "root" object, so we need to merge or set directly
								if (tmpCurrentStep.Merge)
								{
									tmpChartConfiguration = Object.assign(tmpChartConfiguration, tmpSolvedConfiguration);
								}
								else
								{
									tmpChartConfiguration = tmpSolvedConfiguration;
								}
							}
							else
							{
								if ((typeof(tmpExistingData) != 'object') || (tmpExistingData == null))
								{
									tmpExistingData = {};
								}
								if (tmpCurrentStep.Merge)
								{
									// Merge the objects
									let tmpMergedData = Object.assign(tmpExistingData, tmpSolvedConfiguration);
									this.pict.manifest.setValueByHash(tmpChartConfiguration, tmpParsingConfiguration.AddressInObject, tmpMergedData);
								}
								else
								{
									// Just set the value
									this.pict.manifest.setValueByHash(tmpChartConfiguration, tmpParsingConfiguration.AddressInObject, tmpRawData);
								}
							}
						}
						else
						{
							// Just set the value?
							this.pict.manifest.setValueByHash(tmpChartConfiguration, tmpParsingConfiguration.AddressInObject, tmpRawData);
						}
					}
					break;

				case 'ArrayOfSolvers':
					let tmpSolverExpressionList = this.pict.manifest.getValueByHash(tmpInput, tmpCurrentStep.InputProperty);

					// Check that the expression is a string
					if (!Array.isArray(tmpSolverExpressionList))
					{
						break;
					}

					for (let i = 0; i < tmpSolverExpressionList.length; i++)
					{
						let tmpCurrentSolverExpression = tmpSolverExpressionList[i];
						if (typeof(tmpCurrentSolverExpression) !== 'object')
						{
							continue;
						}

						let tmpSolverLabel = tmpCurrentSolverExpression.Label;
						let tmpSolverExpression = tmpCurrentSolverExpression.DataSolver;
						let tmpSolvedDataSet = this.pict.providers.DynamicSolver.runSolver(tmpSolverExpression);

						let tmpDataObject = (
							{
								label: tmpSolverLabel,
								data: (Array.isArray(tmpSolvedDataSet)) ? tmpSolvedDataSet : []
							});

						if (tmpParsingConfiguration.ObjectType === 'array')
						{
							if (Array.isArray(tmpSolvedDataSet))
							{
								if (tmpCurrentStep.Merge)
								{
									// Get existing data
									if (!Array.isArray(tmpExistingData))
									{
										tmpExistingData = [];
									}
									tmpExistingData.push(tmpDataObject);
									this.pict.manifest.setValueByHash(tmpChartConfiguration, tmpParsingConfiguration.AddressInObject, tmpExistingData);
								}
								else
								{
									this.pict.manifest.setValueByHash(tmpChartConfiguration, tmpParsingConfiguration.AddressInObject, [tmpDataObject]);
								}
							}
						}
						else if (tmpParsingConfiguration.ObjectType === 'object')
						{
							if (tmpCurrentStep.Merge)
							{
								if (!tmpParsingConfiguration.AddressInObject || (tmpParsingConfiguration.AddressInObject == ''))
								{
									// This is the "root" object, so we need to merge or set directly
									if (tmpCurrentStep.Merge)
									{
										tmpChartConfiguration = Object.assign(tmpChartConfiguration, tmpSolvedDataSet);
									}
									else
									{
										tmpChartConfiguration = tmpSolvedDataSet;
									}
								}
								else
								{
									if ((typeof(tmpExistingData) != 'object') || (tmpExistingData == null))
									{
										tmpExistingData = {};
									}
									if (tmpCurrentStep.Merge)
									{
										// Merge the objects
										let tmpMergedData = Object.assign(tmpExistingData, tmpSolvedDataSet);
										this.pict.manifest.setValueByHash(tmpChartConfiguration, tmpParsingConfiguration.AddressInObject, tmpMergedData);
									}
									else
									{
										// Just set the value
										this.pict.manifest.setValueByHash(tmpChartConfiguration, tmpParsingConfiguration.AddressInObject, tmpRawData);
									}
								}
							}
							else
							{
								// Just set the value?
								this.pict.manifest.setValueByHash(tmpChartConfiguration, tmpParsingConfiguration.AddressInObject, tmpRawData);
							}
						}
					}
					break;
			}
		}
	}

	getInputChartConfiguration(pView, pInput, pValue)
	{
		let tmpView = pView;
		let tmpInput = pInput;
		let tmpValue = pValue;

		if (!('PictForm' in tmpInput))
		{
			return false;
		}

		let tmpPictform = pInput.PictForm;

		let tmpChartConfiguration = (typeof (tmpPictform.ChartJSOptionsCorePrototype) === 'object') ? tmpPictform.ChartJSOptionsCorePrototype : {};

		this.applyInputParsingConfiguration(pInput, tmpChartConfiguration, this.defaultCoreParsingConfiguration, 'PictForm.ChartConfigCoreParsingConfigurationOverride');
		if (!('type' in tmpChartConfiguration))
		{
			tmpChartConfiguration.type = (typeof (tmpPictform.ChartType) === 'string') ? tmpPictform.ChartType : 'bar';
		}
		this.applyInputParsingConfiguration(pInput, tmpChartConfiguration, this.defaultLabelParsingConfiguration, 'PictForm.ChartLabelsParsingConfigurationOverride');
		this.applyInputParsingConfiguration(pInput, tmpChartConfiguration, this.defaultDataParsingConfiguration, 'PictForm.ChartDataParsingConfigurationOverride');

		return tmpChartConfiguration;
	}

	initializeChartVisualization(pView, pGroup, pRow, pInput, pValue, pHTMLSelector)
	{
		// Stuff the config into a hidden element for reference
		let tmpConfigStorageLocation = `#CONFIG-FOR-${pInput.Macro.RawHTMLID}`;
		let tmpChartConfiguration = this.getInputChartConfiguration(pView, pInput, pValue);
		this.pict.ContentAssignment.assignContent(tmpConfigStorageLocation, JSON.stringify(tmpChartConfiguration));

		let tmpChartCanvasElementSelector = `#CANVAS-FOR-${pInput.Macro.RawHTMLID}`;
		let tmpChartCanvasElement = this.pict.ContentAssignment.getElement(tmpChartCanvasElementSelector);
		if ((!Array.isArray(tmpChartCanvasElement)) || (tmpChartCanvasElement.length < 1))
		{
			this.log.warn(`Chart canvas element not found for input ${tmpChartCanvasElementSelector}`);
			return false;
		}
		tmpChartCanvasElement = tmpChartCanvasElement[0]

		// Check if there is a window.Chart which is the Chart.js library
		if (typeof (window.Chart) !== 'function')
		{
			this.log.warn(`Chart.js library not loaded for input ${tmpChartCanvasElementSelector}`);
		}
		else
		{
			this.currentChartObjects[`Object-For-${pInput.Macro.RawHTMLID}`] = new window.Chart(tmpChartCanvasElement, tmpChartConfiguration);
		}
	}

	/**
	 * Initializes the input element for the Pict provider select input.
	 *
	 * @param {Object} pView - The view object.
	 * @param {Object} pGroup - The group object.
	 * @param {Object} pRow - The row object.
	 * @param {Object} pInput - The input object.
	 * @param {any} pValue - The input value.
	 * @param {string} pHTMLSelector - The HTML selector.
	 * @param {string} pTransactionGUID - The transaction GUID for the event dispatch.
	 * @returns {boolean} - Returns true if the input element is successfully initialized, false otherwise.
	 */
	onInputInitialize(pView, pGroup, pRow, pInput, pValue, pHTMLSelector, pTransactionGUID)
	{
		this.initializeChartVisualization(pView, pGroup, pRow, pInput, pValue, pHTMLSelector);
		return super.onInputInitialize(pView, pGroup, pRow, pInput, pValue, pHTMLSelector, pTransactionGUID);
	}

	/**
	 * Initializes a tabular input element.
	 *
	 * @param {Object} pView - The view object.
	 * @param {Object} pGroup - The group object.
	 * @param {Object} pInput - The input object.
	 * @param {any} pValue - The input value.
	 * @param {string} pHTMLSelector - The HTML selector.
	 * @param {number} pRowIndex - The index of the row.
	 * @param {string} pTransactionGUID - The transaction GUID for the event dispatch.
	 * @returns {any} - The result of the initialization.
	 */
	onInputInitializeTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex, pTransactionGUID)
	{
		return super.onInputInitializeTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex, pTransactionGUID);
	}

	/**
	 * Handles the change event for the data in the select input.
	 *
	 * @param {Object} pView - The view object.
	 * @param {Object} pInput - The input object.
	 * @param {any} pValue - The new value of the input.
	 * @param {string} pHTMLSelector - The HTML selector of the input.
	 * @param {string} pTransactionGUID - The transaction GUID for the event dispatch.
	 * @returns {any} - The result of the super.onDataChange method.
	 */
	onDataChange(pView, pInput, pValue, pHTMLSelector, pTransactionGUID)
	{
		return super.onDataChange(pView, pInput, pValue, pHTMLSelector, pTransactionGUID);
	}

	/**
	 * Handles the change event for tabular data.
	 *
	 * @param {Object} pView - The view object.
	 * @param {Object} pInput - The input object.
	 * @param {any} pValue - The new value.
	 * @param {string} pHTMLSelector - The HTML selector.
	 * @param {number} pRowIndex - The index of the row.
	 * @param {string} pTransactionGUID - The transaction GUID for the event dispatch.
	 * @returns {any} - The result of the super method.
	 */
	onDataChangeTabular(pView, pInput, pValue, pHTMLSelector, pRowIndex, pTransactionGUID)
	{
		return super.onDataChangeTabular(pView, pInput, pValue, pHTMLSelector, pRowIndex, pTransactionGUID);
	}

	/**
	 * Marshals data to the form for the given input.
	 *
	 * @param {Object} pView - The view object.
	 * @param {Object} pGroup - The group object.
	 * @param {Object} pRow - The row object.
	 * @param {Object} pInput - The input object.
	 * @param {any} pValue - The value to be marshaled.
	 * @param {string} pHTMLSelector - The HTML selector.
	 * @param {string} pTransactionGUID - The transaction GUID for the event dispatch.
	 * @returns {boolean} - Returns true if the value is successfully marshaled to the form, otherwise false.
	 */
	onDataMarshalToForm(pView, pGroup, pRow, pInput, pValue, pHTMLSelector, pTransactionGUID)
	{
		return super.onDataMarshalToForm(pView, pGroup, pRow, pInput, pValue, pHTMLSelector, pTransactionGUID);
	}

	/**
	 * Marshals data to a form in tabular format.
	 *
	 * @param {Object} pView - The view object.
	 * @param {Object} pGroup - The group object.
	 * @param {Object} pInput - The input object.
	 * @param {any} pValue - The value parameter.
	 * @param {string} pHTMLSelector - The HTML selector parameter.
	 * @param {number} pRowIndex - The row index parameter.
	 * @param {string} pTransactionGUID - The transaction GUID for the event dispatch.
	 * @returns {any} - The result of the data marshaling.
	 */
	onDataMarshalToFormTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex, pTransactionGUID)
	{
		return super.onDataMarshalToFormTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex, pTransactionGUID);
	}

	/**
	 * Handles the data request event for a select input in the PictProviderInputSelect class.
	 *
	 * @param {Object} pView - The view object.
	 * @param {Object} pInput - The input object.
	 * @param {any} pValue - The value object.
	 * @param {string} pHTMLSelector - The HTML selector object.
	 * @returns {any} - The result of the onDataRequest method.
	 */
	onDataRequest(pView, pInput, pValue, pHTMLSelector)
	{
		return super.onDataRequest(pView, pInput, pValue, pHTMLSelector);
	}

	/**
	 * Handles the data request event for a tabular input.
	 *
	 * @param {Object} pView - The view object.
	 * @param {Object} pInput - The input object.
	 * @param {any} pValue - The value object.
	 * @param {string} pHTMLSelector - The HTML selector.
	 * @param {number} pRowIndex - The row index.
	 * @returns {any} - The result of the data request.
	 */
	onDataRequestTabular(pView, pInput, pValue, pHTMLSelector, pRowIndex)
	{
		return super.onDataRequestTabular(pView, pInput, pValue, pHTMLSelector, pRowIndex);
	}
}

module.exports = CustomInputHandler;
