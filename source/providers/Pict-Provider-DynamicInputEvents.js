const libPictProvider = require('pict-provider');

/** @type {Record<string, any>} */
const _DefaultProviderConfiguration = (
{
	"ProviderIdentifier": "Pict-DynamicForms-InputEvents",

	"AutoInitialize": true,
	"AutoInitializeOrdinal": 0,

	"AutoSolveWithApp": false
});

/**
 * The PictDynamicInputEvents class is a provider that manages data brokering and provider mappings for dynamic inputs.
 */
class PictDynamicInputEvents extends libPictProvider
{
	/**
	 * Creates an instance of the PictDynamicInputEvents class.
	 *
	 * @param {object} pFable - The fable object.
	 * @param {object} pOptions - The options object.
	 * @param {object} pServiceHash - The service hash object.
	 */
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(_DefaultProviderConfiguration)), pOptions);
		super(pFable, tmpOptions, pServiceHash);
	}

	/**
	 * Requests input data from the view based on the provided input hash.
	 *
	 * @param {Object} pView - The view object.
	 * @param {string} pInputHash - The input hash.
	 * @param {any} [pEvent] - The input event.
	 */
	inputDataRequest(pView, pInputHash, pEvent)
	{
		if (pInputHash)
		{
			let tmpInput = pView.getInputFromHash(pInputHash);
			if (pEvent && this.pict.providers.DynamicInput.ignoredEventHashes[pEvent])
			{
				return;
			}
			let tmpHashAddress = pView.sectionManifest.resolveHashAddress(pInputHash);
			try
			{
				let tmpMarshalDestinationObject = pView.getMarshalDestinationObject();
				let tmpValue = pView.sectionManifest.getValueByHash(tmpMarshalDestinationObject, tmpHashAddress);
				let tmpInputProviderList = pView.getInputProviderList(tmpInput);
				for (let i = 0; i < tmpInputProviderList.length; i++)
				{
					if (pView.pict.providers[tmpInputProviderList[i]])
					{
						pView.pict.providers[tmpInputProviderList[i]].onDataRequest(pView, tmpInput, tmpValue, tmpInput.Macro.HTMLSelector);
					}
					else
					{
						pView.log.error(`Dynamic form [${pView.Hash}]::[${pView.UUID}] inputDataRequest cannot find embedded provider [${tmpInputProviderList[i]}] for input [${tmpInput.Hash}].`);
					}
				}
			}
			catch (pError)
			{
				pView.log.error(`Dynamic form [${pView.Hash}]::[${pView.UUID}] gross error running inputDataRequest specific (${pInputHash}) data from view in dataChanged event: ${pError}`);
			}
		}
		else
		{
			pView.log.error(`Dynamic form [${pView.Hash}]::[${pView.UUID}] cannot find input hash [${pInputHash}] for inputDataRequest event.`);
		}
	}

	/**
	 * Handles the input event for a dynamic form.
	 *
	 * @param {Object} pView - The view object.
	 * @param {string} pInputHash - The input hash.
	 * @param {string} pEvent - The input event.
	 * @param {string} [pTransactionGUID] - (optional) The active transaction GUID.
	 */
	inputEvent(pView, pInputHash, pEvent, pTransactionGUID)
	{
		const tmpTransactionGUID = (pTransactionGUID && typeof pTransactionGUID === 'string') ? pTransactionGUID : this.pict.getUUID();
		let tmpInput = pView.getInputFromHash(pInputHash);
		if (pInputHash)
		{
			let tmpHashAddress = pView.sectionManifest.resolveHashAddress(pInputHash);
			try
			{
				let tmpMarshalDestinationObject = pView.getMarshalDestinationObject();
				let tmpValue = pView.sectionManifest.getValueByHash(tmpMarshalDestinationObject, tmpHashAddress);
				let tmpInputProviderList = pView.getInputProviderList(tmpInput);
				for (let i = 0; i < tmpInputProviderList.length; i++)
				{
					if (pView.pict.providers[tmpInputProviderList[i]])
					{
						// we may find uninitialized inputs here, so we do not send events to those
						if (tmpInput.Macro)
						{
							pView.pict.providers[tmpInputProviderList[i]].onEvent(pView, tmpInput, tmpValue, tmpInput.Macro.HTMLSelector, pEvent, tmpTransactionGUID);
							pView.registerOnTransactionCompleteCallback(tmpTransactionGUID, () =>
							{
								pView.pict.providers[tmpInputProviderList[i]].onAfterEventCompletion(pView, tmpInput, tmpValue, tmpInput.Macro.HTMLSelector, pEvent, tmpTransactionGUID);
							});
						}
					}
					else
					{
						pView.log.error(`Dynamic form [${pView.Hash}]::[${pView.UUID}] inputEvent ${pEvent} cannot find embedded provider [${tmpInputProviderList[i]}] for input [${tmpInput.Hash}].`);
					}
				}
				if (pTransactionGUID !== tmpTransactionGUID)
				{
					// since we synthesized this transaction, finalize it
					pView.finalizeTransaction(tmpTransactionGUID);
				}
			}
			catch (pError)
			{
				pView.log.error(`Dynamic form [${pView.Hash}]::[${pView.UUID}] gross error running inputEvent ${pEvent} specific (${pInputHash}) data from view in dataChanged event: ${pError}`);
			}
		}
		else
		{
			pView.log.error(`Dynamic form [${pView.Hash}]::[${pView.UUID}] cannot find input hash [${pInputHash}] for inputEvent ${pEvent} event.`);
		}
	}

	/**
	 * Requests input data for a tabular record.
	 *
	 * @param {import('../views/Pict-View-DynamicForm')} pView - The view object.
	 * @param {number} pGroupIndex - The index of the group.
	 * @param {number} pInputIndex - The index of the input.
	 * @param {number} pRowIndex - The index of the row.
	 * @param {any} [pEvent] - The input event.
	 */
	inputDataRequestTabular(pView, pGroupIndex, pInputIndex, pRowIndex, pEvent)
	{
		let tmpInput = pView.getTabularRecordInput(pGroupIndex, pInputIndex);
		if (pGroupIndex && pInputIndex && pRowIndex && tmpInput)
		{
			try
			{
				let tmpMarshalDestinationObject = pView.getMarshalDestinationObject();
				// TODO: Can we simplify pView?
				let tmpValueAddress = pView.pict.providers.Informary.getComposedContainerAddress(tmpInput.PictForm.InformaryContainerAddress, pRowIndex, tmpInput.PictForm.InformaryDataAddress);
				let tmpValue = pView.sectionManifest.getValueByHash(tmpMarshalDestinationObject, tmpValueAddress);

				let tmpVirtualInformaryHTMLSelector = tmpInput.Macro.HTMLSelectorTabular+`[data-i-index="${pRowIndex}"]`;
				let tmpInputProviderList = pView.getInputProviderList(tmpInput);
				for (let i = 0; i < tmpInputProviderList.length; i++)
				{
					if (pView.pict.providers[tmpInputProviderList[i]])
					{
						pView.pict.providers[tmpInputProviderList[i]].onDataRequestTabular(pView, tmpInput, tmpValue, tmpVirtualInformaryHTMLSelector, pRowIndex);
					}
					else
					{
						pView.log.error(`Dynamic form [${pView.Hash}]::[${pView.UUID}] cannot find embedded provider [${tmpInputProviderList[i]}] for input [${tmpInput.Hash}] row ${pRowIndex}.`);
					}
				}
			}
			catch (pError)
			{
				pView.log.error(`Dynamic form [${pView.Hash}]::[${pView.UUID}] gross error marshaling specific (${pGroupIndex} | ${pInputIndex} | ${pRowIndex}) tabular data for group ${pGroupIndex} row ${pRowIndex} from view in dataChanged event: ${pError}`);
			}
		}
		else
		{
			// pView is what is called whenever a hash is changed.  We could marshal from view, solve and remarshal to view.
			pView.marshalFromView();
		}
		// Run any dynamic input providers for the input hash.
		pView.pict.PictApplication.solve();
		pView.marshalToView();
	}

	/**
	 * Handles the tabular input event.
	 *
	 * @param {Object} pView - The view object.
	 * @param {number} pGroupIndex - The index of the group.
	 * @param {number} pInputIndex - The index of the input.
	 * @param {number} pRowIndex - The index of the row.
	 * @param {string} pEvent - The input event.
	 * @param {string} [pTransactionGUID] - (optional) The active transaction GUID.
	 */
	inputEventTabular(pView, pGroupIndex, pInputIndex, pRowIndex, pEvent, pTransactionGUID)
	{
		const tmpTransactionGUID = (pTransactionGUID && typeof pTransactionGUID === 'string') ? pTransactionGUID : this.pict.getUUID();
		let tmpInput = pView.getTabularRecordInput(pGroupIndex, pInputIndex);
		if (pGroupIndex != null && pInputIndex != null && pRowIndex != null && tmpInput)
		{
			try
			{
				let tmpMarshalDestinationObject = pView.getMarshalDestinationObject();

				// TODO: Can we simplify pView?
				let tmpValueAddress = pView.pict.providers.Informary.getComposedContainerAddress(tmpInput.PictForm.InformaryContainerAddress, pRowIndex, tmpInput.PictForm.InformaryDataAddress);
				let tmpValue = pView.sectionManifest.getValueByHash(tmpMarshalDestinationObject, tmpValueAddress);

				let tmpVirtualInformaryHTMLSelector = tmpInput.Macro.HTMLSelectorTabular+`[data-i-index="${pRowIndex}"]`;
				let tmpInputProviderList = pView.getInputProviderList(tmpInput);
				for (let i = 0; i < tmpInputProviderList.length; i++)
				{
					if (pView.pict.providers[tmpInputProviderList[i]])
					{
						pView.pict.providers[tmpInputProviderList[i]].onEventTabular(pView, tmpInput, tmpValue, tmpVirtualInformaryHTMLSelector, pRowIndex, pEvent, tmpTransactionGUID);
						pView.registerOnTransactionCompleteCallback(tmpTransactionGUID, () =>
						{
							pView.pict.providers[tmpInputProviderList[i]].onAfterEventTabularCompletion(pView, tmpInput, tmpValue, tmpVirtualInformaryHTMLSelector, pRowIndex, pEvent, tmpTransactionGUID);
						});
					}
					else
					{
						pView.log.error(`Dynamic form [${pView.Hash}]::[${pView.UUID}] cannot find embedded provider [${tmpInputProviderList[i]}] for input [${tmpInput.Hash}] row ${pRowIndex} calling inputEvent ${pEvent}.`);
					}
				}
				if (pTransactionGUID !== tmpTransactionGUID)
				{
					// since we synthesized this transaction, finalize it
					pView.finalizeTransaction(tmpTransactionGUID);
				}
			}
			catch (pError)
			{
				pView.log.error(`Dynamic form [${pView.Hash}]::[${pView.UUID}] gross error marshaling specific (${pGroupIndex} | ${pInputIndex} | ${pRowIndex}) tabular data for group ${pGroupIndex} row ${pRowIndex} from view in calling inputEvent ${pEvent}: ${pError}`);
			}
		}
	}
}

module.exports = PictDynamicInputEvents;
module.exports.default_configuration = _DefaultProviderConfiguration;
