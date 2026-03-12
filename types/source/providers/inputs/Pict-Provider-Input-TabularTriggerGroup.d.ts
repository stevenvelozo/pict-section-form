export = TabularTriggerGroupInputHandler;
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
declare class TabularTriggerGroupInputHandler extends libPictSectionInputExtension {
    /** @type {import('pict') & { newAnticipate: () => any }} */
    fable: import("pict") & {
        newAnticipate: () => any;
    };
    /** @type {import('pict')} */
    pict: import("pict");
    /**
     * Get the trigger group configuration, normalizing to an array.
     *
     * @param {Object} pInput - The input descriptor.
     * @returns {Array<Record<string, any>>}
     */
    getTriggerGroupConfigurationArray(pInput: any): Array<Record<string, any>>;
    /**
     * Ensure the per-row cache structure exists.
     *
     * @param {string} pTriggerGroupHash - The trigger group hash.
     * @param {number} pRowIndex - The row index.
     * @returns {Object} The cache object for this row.
     */
    ensureRowCache(pTriggerGroupHash: string, pRowIndex: number): any;
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
    gatherEntitySet(fCallback: Function, pEntityInfo: any, pView: any, pInput: any, pValue: any, pRowIndex: number, pTriggerGroupHash: string): any;
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
    gatherCustomDataSet(fCallback: Function, pRequestInfo: any, pView: any, pInput: any, pValue: any, pRowIndex: number, pTriggerGroupHash: string): any;
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
    gatherDataForRow(pView: any, pInput: any, pValue: any, pHTMLSelector: string, pRowIndex: number, pGroupConfig: any, pTransactionGUID: string): Promise<any>;
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
    autoFillFromRowCache(pView: any, pInput: any, pTriggerGroupInfo: any, pHTMLSelector: string, pRowIndex: number): boolean;
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
    onDataChangeTabular(pView: any, pInput: any, pValue: any, pHTMLSelector: string, pRowIndex: number, pTransactionGUID: string): any;
    /**
     * Non-tabular data change handler.
     * TabularTriggerGroup is designed for tabular use, but we support non-tabular
     * as a pass-through for flexibility.
     */
    onDataChange(pView: any, pInput: any, pValue: any, pHTMLSelector: any, pTransactionGUID: any): boolean;
    /**
     * Non-tabular event handler.
     * TabularTriggerGroup events are scoped to tabular, so non-tabular events
     * are ignored.
     */
    onAfterEventCompletion(pView: any, pInput: any, pValue: any, pHTMLSelector: any, pEvent: any, pTransactionGUID: any): boolean;
}
declare namespace TabularTriggerGroupInputHandler {
    export { default_configuration };
}
import libPictSectionInputExtension = require("../Pict-Provider-InputExtension.js");
declare namespace default_configuration {
    let ProviderIdentifier: string;
    let AutoInitialize: boolean;
    let AutoInitializeOrdinal: number;
    let AutoSolveWithApp: boolean;
}
//# sourceMappingURL=Pict-Provider-Input-TabularTriggerGroup.d.ts.map