const libPictSectionInputExtension = require('../Pict-Provider-InputExtension.js');

/**
 * TabularTriggerGroup input provider.
 *
 * This provider enables per-row trigger group behavior in tabular layouts.
 * Unlike the global AutofillTriggerGroup (which fills ALL rows with the same
 * data), this provider fetches entity data scoped to a specific row and only
 * updates inputs within that same row.
 *
 * It combines the entity-fetching capability of EntityBundleRequest with
 * the autofill behavior of AutofillTriggerGroup, but scoped to individual
 * tabular rows.
 *
 * Triggering input configuration:
 *
 *   Providers: ["Pict-Input-TabularTriggerGroup"],
 *   TabularTriggerGroup:
 *     {
 *       TriggerGroupHash: "AuthorRowTrigger",
 *       TriggerAllInputs: true,
 *       EntitiesBundle: [
 *         {
 *           "Entity": "Author",
 *           "Filter": "FBV~IDAuthor~EQ~{~D:Record.Value~}",
 *           "Destination": "CurrentAuthor",
 *           "SingleRecord": true
 *         }
 *       ]
 *     }
 *
 * Receiving input configuration:
 *
 *   Providers: ["Pict-Input-TabularTriggerGroup"],
 *   TabularTriggerGroup:
 *     {
 *       TriggerGroupHash: "AuthorRowTrigger",
 *       TriggerAddress: "CurrentAuthor.Name",
 *       MarshalEmptyValues: true
 *     }
 *
 * The provider stores fetched entity data in a per-row cache at:
 *   AppData._TabularTriggerCache.{TriggerGroupHash}[{RowIndex}]
 *
 * @class
 * @extends libPictSectionInputExtension
 * @memberof providers.inputs
 */
class TabularTriggerGroupInputHandler extends libPictSectionInputExtension
{
	/**
	 * @param {import('fable')} pFable - The Fable instance.
	 * @param {Record<string, any>} [pOptions] - The options for the provider.
	 * @param {string} [pServiceHash] - The service hash for the provider.
	 */
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		/** @type {import('pict') & { newAnticipate: () => any }} */
		this.fable;
		/** @type {import('pict')} */
		this.pict;
		/** @type {any} */
		this.log;
	}

	/**
	 * Get the trigger group configuration, normalizing to an array.
	 *
	 * @param {Object} pInput - The input descriptor.
	 * @returns {Array<Record<string, any>>}
	 */
	getTriggerGroupConfigurationArray(pInput)
	{
		let tmpConfigs = pInput.PictForm.TabularTriggerGroup;
		if (!tmpConfigs)
		{
			return [];
		}
		if (!Array.isArray(tmpConfigs))
		{
			tmpConfigs = [tmpConfigs];
		}
		return tmpConfigs;
	}

	/**
	 * Ensure the per-row cache structure exists.
	 *
	 * @param {string} pTriggerGroupHash - The trigger group hash.
	 * @param {number} pRowIndex - The row index.
	 * @returns {Object} The cache object for this row.
	 */
	ensureRowCache(pTriggerGroupHash, pRowIndex)
	{
		if (!this.pict.AppData._TabularTriggerCache)
		{
			this.pict.AppData._TabularTriggerCache = {};
		}
		if (!this.pict.AppData._TabularTriggerCache[pTriggerGroupHash])
		{
			this.pict.AppData._TabularTriggerCache[pTriggerGroupHash] = {};
		}
		if (!this.pict.AppData._TabularTriggerCache[pTriggerGroupHash][pRowIndex])
		{
			this.pict.AppData._TabularTriggerCache[pTriggerGroupHash][pRowIndex] = {};
		}
		return this.pict.AppData._TabularTriggerCache[pTriggerGroupHash][pRowIndex];
	}

	/**
	 * Gather a single entity set from the server.
	 *
	 * @param {Function} fCallback - Callback when done.
	 * @param {Object} pEntityInfo - The entity bundle entry.
	 * @param {Object} pView - The view object.
	 * @param {Object} pInput - The input descriptor.
	 * @param {any} pValue - The current value of the triggering input.
	 * @param {number} pRowIndex - The row index.
	 * @param {string} pTriggerGroupHash - The trigger group hash.
	 */
	gatherEntitySet(fCallback, pEntityInfo, pView, pInput, pValue, pRowIndex, pTriggerGroupHash)
	{
		if (!pEntityInfo.Entity || typeof(pEntityInfo.Entity) !== 'string')
		{
			this.log.warn(`TabularTriggerGroup failed to parse entity request: missing Entity string.`);
			return fCallback();
		}
		if (!pEntityInfo.Filter || typeof(pEntityInfo.Filter) !== 'string')
		{
			this.log.warn(`TabularTriggerGroup failed to parse entity request: missing Filter string.`);
			return fCallback();
		}
		if (!pEntityInfo.Destination || typeof(pEntityInfo.Destination) !== 'string')
		{
			this.log.warn(`TabularTriggerGroup failed to parse entity request: missing Destination string.`);
			return fCallback();
		}

		let tmpFilterTemplateRecord = { Value: pValue, Input: pInput, View: pView };
		let tmpFilterString = this.pict.parseTemplate(pEntityInfo.Filter, tmpFilterTemplateRecord);

		if (tmpFilterString === '')
		{
			this.log.warn(`TabularTriggerGroup: entity Filter did not return a string for FilterBy`);
		}

		let tmpRecordStartCursor = null;
		let tmpRecordCount = null;
		if (pEntityInfo.RecordCount)
		{
			tmpRecordStartCursor = pEntityInfo.RecordStartCursor != null ? pEntityInfo.RecordStartCursor : 0;
			tmpRecordCount = pEntityInfo.RecordCount != null ? pEntityInfo.RecordCount : null;
		}

		let tmpCallback = (pError, pRecordSet) =>
		{
			if (pError)
			{
				this.log.error(`TabularTriggerGroup error getting entity set for [${pEntityInfo.Entity}] row ${pRowIndex}: ${pError}`, pError);
				return fCallback(pError);
			}

			this.log.trace(`TabularTriggerGroup found ${pRecordSet.length} records for ${pEntityInfo.Entity} row ${pRowIndex}`);

			let tmpRowCache = this.ensureRowCache(pTriggerGroupHash, pRowIndex);

			if (pEntityInfo.SingleRecord)
			{
				if (pRecordSet.length < 1)
				{
					this.pict.manifest.setValueByHash(tmpRowCache, pEntityInfo.Destination, false);
				}
				else
				{
					this.pict.manifest.setValueByHash(tmpRowCache, pEntityInfo.Destination, pRecordSet[0]);
				}
			}
			else
			{
				this.pict.manifest.setValueByHash(tmpRowCache, pEntityInfo.Destination, pRecordSet);
			}

			return fCallback();
		};

		if (tmpRecordCount)
		{
			this.pict.EntityProvider.getEntitySetPage(pEntityInfo.Entity, tmpFilterString, tmpRecordStartCursor, tmpRecordCount, tmpCallback);
		}
		else
		{
			this.pict.EntityProvider.getEntitySet(pEntityInfo.Entity, tmpFilterString, tmpCallback);
		}
	}

	/**
	 * Gather a custom data set from the server.
	 *
	 * @param {Function} fCallback - Callback when done.
	 * @param {Object} pRequestInfo - The custom request info.
	 * @param {Object} pView - The view object.
	 * @param {Object} pInput - The input descriptor.
	 * @param {any} pValue - The current value.
	 * @param {number} pRowIndex - The row index.
	 * @param {string} pTriggerGroupHash - The trigger group hash.
	 */
	gatherCustomDataSet(fCallback, pRequestInfo, pView, pInput, pValue, pRowIndex, pTriggerGroupHash)
	{
		if (!pRequestInfo.URL || typeof(pRequestInfo.URL) !== 'string')
		{
			this.log.warn(`TabularTriggerGroup failed to parse custom request: missing URL string.`);
			return fCallback();
		}

		let tmpURLTemplateRecord = { Value: pValue, Input: pInput, View: pView };
		let tmpURLTemplateString = this.pict.parseTemplate(pRequestInfo.URL, tmpURLTemplateRecord);

		let tmpURLPrefix = '';
		let tmpCustomURIHost = pRequestInfo.Host ? pRequestInfo.Host : false;
		let tmpCustomURIProtocol = pRequestInfo.Protocol ? pRequestInfo.Protocol : 'https';
		let tmpCustomURIPort = pRequestInfo.Port ? pRequestInfo.Port : false;

		if (tmpCustomURIHost)
		{
			tmpURLPrefix = `${tmpCustomURIProtocol}://${tmpCustomURIHost}`;
			if (tmpCustomURIPort)
			{
				tmpURLPrefix += `:${tmpCustomURIPort}`;
			}
		}
		else
		{
			tmpURLPrefix = this.pict.EntityProvider.options.urlPrefix;
		}

		let tmpCallback = (pError, pResponse, pData) =>
		{
			if (pError)
			{
				this.log.error(`TabularTriggerGroup error getting custom data for row ${pRowIndex}: ${pError}`, pError);
				return fCallback(pError);
			}

			if (pRequestInfo.Destination)
			{
				let tmpRowCache = this.ensureRowCache(pTriggerGroupHash, pRowIndex);
				this.pict.manifest.setValueByHash(tmpRowCache, pRequestInfo.Destination, pData);
			}

			return fCallback();
		};

		let tmpOptions = { url: `${tmpURLPrefix}${tmpURLTemplateString}` };
		tmpOptions = this.pict.EntityProvider.prepareRequestOptions(tmpOptions);
		return this.pict.EntityProvider.restClient.getJSON(tmpOptions, tmpCallback);
	}

	/**
	 * Fetch entity data for a specific tabular row.
	 *
	 * @param {Object} pView - The view object.
	 * @param {Object} pInput - The input descriptor.
	 * @param {any} pValue - The current value.
	 * @param {string} pHTMLSelector - The HTML selector.
	 * @param {number} pRowIndex - The row index.
	 * @param {Object} pGroupConfig - The trigger group configuration.
	 * @param {string} pTransactionGUID - The transaction GUID.
	 * @returns {Promise}
	 */
	async gatherDataForRow(pView, pInput, pValue, pHTMLSelector, pRowIndex, pGroupConfig, pTransactionGUID)
	{
		if (!Array.isArray(pGroupConfig.EntitiesBundle) || pGroupConfig.EntitiesBundle.length < 1)
		{
			this.log.warn(`TabularTriggerGroup: no EntitiesBundle array found for triggering input [${pInput.Hash}] row ${pRowIndex}`);
			return null;
		}

		let tmpTriggerGroupHash = pGroupConfig.TriggerGroupHash;
		let tmpLoadGUID = `TabularBundleLoad-${this.pict.getUUID()}`;

		if (pTransactionGUID)
		{
			pView.registerEventTransactionAsyncOperation(pTransactionGUID, tmpLoadGUID);
		}

		let tmpAnticipate = this.fable.newAnticipate();

		for (let i = 0; i < pGroupConfig.EntitiesBundle.length; i++)
		{
			let tmpEntityBundleEntry = pGroupConfig.EntitiesBundle[i];
			tmpAnticipate.anticipate(
				(fNext) =>
				{
					try
					{
						switch (tmpEntityBundleEntry.Type)
						{
							case 'Custom':
								return this.gatherCustomDataSet(fNext, tmpEntityBundleEntry, pView, pInput, pValue, pRowIndex, tmpTriggerGroupHash);
							case 'MeadowEntity':
							default:
								return this.gatherEntitySet(fNext, tmpEntityBundleEntry, pView, pInput, pValue, pRowIndex, tmpTriggerGroupHash);
						}
					}
					catch (pError)
					{
						this.log.error(`TabularTriggerGroup error gathering entity set for row ${pRowIndex}: ${pError}`, pError);
					}
					return fNext();
				});
		}

		// Ensure we wait at least one tick for event ordering
		tmpAnticipate.anticipate((fNext) => setTimeout(fNext, 0));

		// After all data is gathered, fire the row-scoped trigger event
		tmpAnticipate.anticipate(
			(fNext) =>
			{
				if (this.pict.views.PictFormMetacontroller)
				{
					// Fire row-scoped event: TabularTriggerGroup:{GroupHash}:DataChange:{InputHash}:{RowIndex}:{UUID}
					this.pict.views.PictFormMetacontroller.triggerGlobalInputEvent(
						`TabularTriggerGroup:${tmpTriggerGroupHash}:DataChange:${pInput.Hash || pInput.DataAddress}:${pRowIndex}:${this.pict.getUUID()}`,
						pTransactionGUID);
				}

				if (pGroupConfig.PostSolvers && Array.isArray(pGroupConfig.PostSolvers))
				{
					this.pict.providers.DynamicSolver.executeSolvers(pView, pGroupConfig.PostSolvers, `TabularTriggerGroup hash ${tmpTriggerGroupHash} row ${pRowIndex} post-trigger`);
				}

				fNext();
			});

		return new Promise((pResolve, pReject) =>
		{
			tmpAnticipate.wait(
				(pError) =>
				{
					if (pError)
					{
						this.log.error(`TabularTriggerGroup error gathering data for row ${pRowIndex}: ${pError}`, pError);
					}
					if (pTransactionGUID)
					{
						pView.eventTransactionAsyncOperationComplete(pTransactionGUID, tmpLoadGUID);
					}
					return pResolve(pError);
				});
		});
	}

	/**
	 * Autofill a tabular input from the row cache.
	 *
	 * @param {Object} pView - The view object.
	 * @param {Object} pInput - The input descriptor.
	 * @param {Object} pTriggerGroupInfo - The trigger group configuration.
	 * @param {string} pHTMLSelector - The HTML selector.
	 * @param {number} pRowIndex - The row index.
	 * @returns {boolean}
	 */
	autoFillFromRowCache(pView, pInput, pTriggerGroupInfo, pHTMLSelector, pRowIndex)
	{
		if (!pTriggerGroupInfo.TriggerGroupHash || typeof(pTriggerGroupInfo.TriggerGroupHash) !== 'string')
		{
			this.log.warn(`TabularTriggerGroup failed to autofill: missing TriggerGroupHash string.`);
			return false;
		}
		if (!pTriggerGroupInfo.TriggerAddress || typeof(pTriggerGroupInfo.TriggerAddress) !== 'string')
		{
			this.log.warn(`TabularTriggerGroup failed to autofill: missing TriggerAddress string.`);
			return false;
		}

		let tmpRowCache = this.ensureRowCache(pTriggerGroupInfo.TriggerGroupHash, pRowIndex);
		let tmpValue = this.pict.manifest.getValueByHash(tmpRowCache, pTriggerGroupInfo.TriggerAddress);

		if ((!tmpValue) && !pTriggerGroupInfo.MarshalEmptyValues)
		{
			return false;
		}

		pView.setDataTabularByHash(pInput.PictForm.GroupIndex, pInput.Hash, pRowIndex, tmpValue);
		pView.manualMarshalTabularDataToViewByInput(pInput, pRowIndex);
		return true;
	}

	/**
	 * Handle data changes in tabular inputs.
	 * If this is a triggering input, fetch data and fire row-scoped event.
	 *
	 * @param {Object} pView - The view object.
	 * @param {Object} pInput - The input descriptor.
	 * @param {any} pValue - The new value.
	 * @param {string} pHTMLSelector - The HTML selector.
	 * @param {number} pRowIndex - The row index.
	 * @param {string} pTransactionGUID - The transaction GUID.
	 * @returns {any}
	 */
	onDataChangeTabular(pView, pInput, pValue, pHTMLSelector, pRowIndex, pTransactionGUID)
	{
		let tmpConfigs = this.getTriggerGroupConfigurationArray(pInput);

		for (let i = 0; i < tmpConfigs.length; i++)
		{
			let tmpConfig = tmpConfigs[i];
			if (tmpConfig.TriggerAllInputs)
			{
				if (tmpConfig.PreSolvers && Array.isArray(tmpConfig.PreSolvers))
				{
					this.pict.providers.DynamicSolver.executeSolvers(pView, tmpConfig.PreSolvers, `TabularTriggerGroup hash ${tmpConfig.TriggerGroupHash} row ${pRowIndex} pre-trigger`);
				}

				this.gatherDataForRow(pView, pInput, pValue, pHTMLSelector, pRowIndex, tmpConfig, pTransactionGUID);
			}
		}

		return super.onDataChangeTabular(pView, pInput, pValue, pHTMLSelector, pRowIndex, pTransactionGUID);
	}

	/**
	 * Handle events after completion for tabular inputs.
	 * If this is a receiving input, autofill from the row cache only if the
	 * event's row index matches.
	 *
	 * @param {Object} pView - The view object.
	 * @param {Object} pInput - The input descriptor.
	 * @param {any} pValue - The value from AppData.
	 * @param {string} pHTMLSelector - The HTML selector.
	 * @param {number} pRowIndex - The row index of this input.
	 * @param {string} pEvent - The event string.
	 * @param {string} pTransactionGUID - The transaction GUID.
	 * @returns {boolean}
	 */
	onAfterEventTabularCompletion(pView, pInput, pValue, pHTMLSelector, pRowIndex, pEvent, pTransactionGUID)
	{
		let tmpPayload = typeof pEvent === 'string' ? pEvent : '';
		let tmpParts = tmpPayload.split(':');
		// Expected format: TabularTriggerGroup:{GroupHash}:DataChange:{InputHash}:{RowIndex}:{UUID}
		let tmpType = tmpParts[0];
		let tmpGroupHash = tmpParts[1];
		let tmpEventType = tmpParts[2];
		let tmpInputHash = tmpParts[3];
		let tmpEventRowIndex = parseInt(tmpParts[4], 10);

		if (tmpType !== 'TabularTriggerGroup')
		{
			return super.onAfterEventTabularCompletion(pView, pInput, pValue, pHTMLSelector, pRowIndex, pEvent, pTransactionGUID);
		}

		// Skip if this is the triggering input itself
		if ((pInput.Hash || pInput.DataAddress) === tmpInputHash)
		{
			return super.onAfterEventTabularCompletion(pView, pInput, pValue, pHTMLSelector, pRowIndex, pEvent, pTransactionGUID);
		}

		// Only process if the row index matches
		if (pRowIndex !== tmpEventRowIndex)
		{
			return super.onAfterEventTabularCompletion(pView, pInput, pValue, pHTMLSelector, pRowIndex, pEvent, pTransactionGUID);
		}

		let tmpConfigs = this.getTriggerGroupConfigurationArray(pInput);

		for (let i = 0; i < tmpConfigs.length; i++)
		{
			let tmpConfig = tmpConfigs[i];
			if (tmpConfig.TriggerGroupHash !== tmpGroupHash)
			{
				continue;
			}

			if (tmpConfig.TriggerAddress)
			{
				this.autoFillFromRowCache(pView, pInput, tmpConfig, pHTMLSelector, pRowIndex);
			}

			if (tmpConfig.SelectOptionsRefresh)
			{
				let tmpInputView = this.pict.views[pInput.PictForm.ViewHash];
				if (tmpInputView && pInput.PictForm.SelectOptionsPickList)
				{
					this.pict.providers.DynamicMetaLists.rebuildListByHash(pInput.PictForm.SelectOptionsPickList);
					this.pict.providers['Pict-Input-Select'].refreshSelectListTabular(tmpInputView, tmpInputView.getGroup(pInput.PictForm.GroupIndex), tmpInputView.getRow(pInput.PictForm.GroupIndex, pInput.PictForm.Row), pInput, pValue, pHTMLSelector, pRowIndex);
					tmpInputView.manualMarshalTabularDataToViewByInput(pInput, pRowIndex);
				}
			}
		}

		return super.onAfterEventTabularCompletion(pView, pInput, pValue, pHTMLSelector, pRowIndex, pEvent, pTransactionGUID);
	}

	/**
	 * Non-tabular data change handler.
	 * TabularTriggerGroup is designed for tabular use, but we support non-tabular
	 * as a pass-through for flexibility.
	 */
	onDataChange(pView, pInput, pValue, pHTMLSelector, pTransactionGUID)
	{
		return super.onDataChange(pView, pInput, pValue, pHTMLSelector, pTransactionGUID);
	}

	/**
	 * Non-tabular event handler.
	 * TabularTriggerGroup events are scoped to tabular, so non-tabular events
	 * are ignored.
	 */
	onAfterEventCompletion(pView, pInput, pValue, pHTMLSelector, pEvent, pTransactionGUID)
	{
		return super.onAfterEventCompletion(pView, pInput, pValue, pHTMLSelector, pEvent, pTransactionGUID);
	}
}

module.exports = TabularTriggerGroupInputHandler;

module.exports.default_configuration = (
{
	"ProviderIdentifier": "Pict-Input-TabularTriggerGroup",
	"AutoInitialize": true,
	"AutoInitializeOrdinal": 0,
	"AutoSolveWithApp": false
});
