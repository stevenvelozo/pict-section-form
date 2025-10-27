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

		this.currentChartObjects = {};
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

		let tmpChartConfiguration = (typeof(tmpPictform.ChartJSOptionsCorePrototype) === 'object') ? tmpPictform.ChartJSOptionsCorePrototype : {};

		// Vet the most important two properties for defaults
		if (!('type' in tmpChartConfiguration))
		{
			tmpChartConfiguration.type = (typeof(tmpPictform.ChartType) === 'string') ? tmpPictform.ChartType : 'bar';
		}
		if (!('data' in tmpChartConfiguration))
		{
			tmpChartConfiguration.data = {};
		}

		// See if there is a data solution configuration

		// Start with Raw / defaults for labels and data
		if (!('labels' in tmpChartConfiguration))
		{
			tmpChartConfiguration.data.labels = [];

			if (Array.isArray(tmpPictform.ChartLabelsRaw))
			{
				tmpChartConfiguration.data.labels = tmpPictform.ChartLabelsRaw;
			}
			// Now do the configuration-based population behaviors

			if (`ChartLabelsSolver` in tmpPictform)
			{
				let tmpSolvedLabels = this.pict.providers.DynamicSolver.runSolver(tmpPictform.ChartLabelsSolver);
				if (Array.isArray(tmpSolvedLabels))
				{
					// TODO: This may need to get complex for multiple sets of labels?
					tmpChartConfiguration.data.labels = tmpSolvedLabels;
				}
			}
		}
		if (!('datasets' in tmpChartConfiguration))
		{
			tmpChartConfiguration.data.datasets = [];
			
			if (Array.isArray(tmpPictform.ChartDatasetsRaw))
			{
				tmpChartConfiguration.data.datasets = tmpChartConfiguration.data.datasets.concat(tmpPictform.ChartDatasetsRaw);
			}

			// Now see if there are any non-raw datasets to add
			if (`ChartDataSolvers` in tmpPictform)
			{
				for (let i = 0; i < tmpPictform.ChartDataSolvers.length; i++)
				{
					let tmpDatasetSolverConfig = tmpPictform.ChartDataSolvers[i];
					// TODO: Cache and check if it's changed before making it initialize data in the control again
					let tmpDataSetSolved = this.pict.providers.DynamicSolver.runSolver(tmpDatasetSolverConfig.DataSolver);
					if (!'Label' in tmpDatasetSolverConfig)
					{
						tmpDatasetSolverConfig.Label = `Dataset ${i+1}`;
					}
					let tmpNewDataset = {
						label: tmpDatasetSolverConfig.Label,
						data: (Array.isArray(tmpDataSetSolved)) ? tmpDataSetSolved : []
					};
					tmpChartConfiguration.data.datasets.push(tmpNewDataset);
				}
			}
		}

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
		if (typeof(window.Chart) !== 'function')
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
