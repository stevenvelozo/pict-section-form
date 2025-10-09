export = PictViewDynamicForm;
/**
 * Represents a dynamic form view for the Pict application.
 *
 * This is the code that maintains the lifecycle with the Pict application and
 * the data handling methods for a dynamic forms view (or set of views).
 *
 * @extends libPictViewClass
 */
declare class PictViewDynamicForm extends libPictViewClass {
    constructor(pFable: any, pOptions: any, pServiceHash: any);
    transactionTracking: import("pict/types/source/services/Fable-Service-TransactionTracking");
    /** @type {Record<string, any>} */
    _PackagePictView: Record<string, any>;
    sectionDefinition: any;
    sectionManifest: any;
    sectionSolvers: any[];
    formsTemplateSetPrefix: string;
    customDefaultTemplatePrefix: any;
    formID: string;
    viewMarshalDestination: any;
    initialBundleLoaded: boolean;
    /**
     * Returns the default template prefix.
     *
     * @returns {string} The default template prefix.
     */
    get defaultTemplatePrefix(): string;
    /**
     * This method is called whenever data is changed within an input.
     *
     * It handles the data marshaling from the view to the data model,
     * runs any providers connected to the input, solves the Pict application,
     * then marshals data back to the view.
     *
     * @param {string} pInputHash - The hash of the input that triggered the data change.
     */
    dataChanged(pInputHash: string): void;
    /**
     * Called whenever tabular data is changed.
     *
     * @param {number} pGroupIndex - the index of the group
     * @param {number} pInputIndex - the index of the input
     * @param {number} pRowIndex - the index of the row where the data was changed
     */
    dataChangedTabular(pGroupIndex: number, pInputIndex: number, pRowIndex: number): void;
    /**
     * Sets the data in a specific form input based on the provided input object
     *
     * FIXME: does this need to have a transaction GUID passed in?
     *
     * @param {object} pInput - The input object.
     * @param {any} pValue - The value to set.
     * @returns {boolean} Returns true if the data was set successfully, false otherwise.
     */
    setDataByInput(pInput: object, pValue: any): boolean;
    /**
     * Sets the data in a specific tabular form input based on the provided hash, group and row.
     *
     * FIXME: does this need to have a transaction GUID passed in?
     *
     * @param {number} pGroupIndex - The index of the group.
     * @param {string} pInputHash - The hash of the input.
     * @param {number} pRowIndex - The index of the row.
     * @param {any} pValue - The value to set.
     * @returns {boolean} Returns true if the data was set successfully, false otherwise.
     */
    setDataTabularByHash(pGroupIndex: number, pInputHash: string, pRowIndex: number, pValue: any): boolean;
    /**
     * Retrieves the marshal destination address.
     *
     * @returns {string} The marshal destination address.
     */
    getMarshalDestinationAddress(): string;
    /**
     * Retrieves the marshal destination object.  This is where the model data is stored.
     *
     * @return {Record<string, any>} The marshal destination object.
     */
    getMarshalDestinationObject(): Record<string, any>;
    /**
     * Gets a value by hash address.
     * @param {string} pHashAddress
     */
    getValueByHash(pHashAddress: string, pRowIndex: any): any;
    /**
     * Gets a value by hash address.
     *
     * @param {number} pGroupIndex
     * @param {number} pInputIndex
     * @param {number} pRowIndex
     */
    getTabularValueByHash(pGroupIndex: number, pInputIndex: number, pRowIndex: number): any;
    /**
     * Marshals data to the view.
     *
     * @returns {any} The result of calling the superclass's onMarshalToView method.
     */
    onMarshalToView(): any;
    manualMarshalDataToViewByInput(pInput: any, pTransactionGUID: any): void;
    manualMarshalTabularDataToViewByInput(pInput: any, pRowIndex: any, pTransactionGUID: any): void;
    /**
     * Marshals data from the view to the destination object.
     * @returns {any} The result of calling the superclass's onMarshalFromView method.
     */
    onMarshalFromView(): any;
    /**
     * Executes after marshaling the data to the form.
     * Checks if there are any hooks set from the input providers (from custom InputType handler hooks) and runs them.
     */
    onAfterMarshalToForm(): void;
    /**
     * Executes the solve operation for the dynamic views, then auto marshals data if options.AutoMarshalDataOnSolve is set to true.
     *
     * @returns {any} The result of the solve operation.
     */
    onSolve(): any;
    /**
     * Executes layout provider functions based on the given function name.
     *
     * These were TODO items that are now done but..  leaving them here to document complexity of why it works this way.
     *
     * --> This happens based on markers in the DOM, since we don't know which layout providers are active for which groups.
     *
     * --> This is easy to make happen with a macro on groups that gives us the data.
     *
     * --> THIS IS NOW SCOPED TO A PARTICULAR GROUP.  That is ... only one layout for a group at a time.
     *
     * The easiest way (and a speed up for other queries as such) is to scope it within the view container element
     *
     * @param {string} pFunctionName - The name of the function to execute.
     * @param {string} [pTransactionGUID] - The transaction GUID to use for logging.
     */
    runLayoutProviderFunctions(pFunctionName: string, pTransactionGUID?: string): void;
    /**
     * Runs the input provider functions.
     *
     * @param {string} pFunctionName - The name of the function to run for each input provider.
     * @param {string} [pInputHash] - The hash of the input to run the function for.
     * @param {number} [pRowIndex] - The index of the row to run the
     * @param {string} [pTransactionGUID] - The transaction GUID to use for logging.
     */
    runInputProviderFunctions(pFunctionName: string, pInputHash?: string, pRowIndex?: number, pTransactionGUID?: string): void;
    /**
     * Checks if a view-specific template exists based on the given template postfix.
     * @param {string} pTemplatePostfix - The postfix of the template to check.
     * @returns {boolean} - Returns true if the view-specific template exists, otherwise false.
     */
    checkViewSpecificTemplate(pTemplatePostfix: string): boolean;
    /**
     * Returns the template hash for the view specific template.
     *
     * @param {string} pTemplatePostfix - The postfix for the template.
     * @returns {string} The template hash for the view specific template.
     */
    getViewSpecificTemplateHash(pTemplatePostfix: string): string;
    /**
     * Checks if a theme-specific template exists.
     *
     * @param {string} pTemplatePostfix - The postfix of the template.
     * @returns {boolean} - Returns true if the theme-specific template exists, otherwise false.
     */
    checkThemeSpecificTemplate(pTemplatePostfix: string): boolean;
    /**
     * Returns the theme-specific template hash based on the given template postfix.
     *
     * @param {string} pTemplatePostfix - The postfix to be appended to the default template prefix.
     * @returns {string} The theme-specific template hash.
     */
    getThemeSpecificTemplateHash(pTemplatePostfix: string): string;
    /**
     * Rebuilds the custom template fore the dynamic form..
     */
    rebuildCustomTemplate(): void;
    /**
     * Retrieves a group from the PICT View Metatemplate Helper based on the provided group index.
     *
     * @param {number} pGroupIndex - The index of the group to retrieve.
     * @returns {object|boolean} - The group object if found, or false if the group index is invalid.
     */
    getGroup(pGroupIndex: number): object | boolean;
    /**
     * Get a row for an input form group.
     *
     * Rows are a horizontal collection of inputs.
     *
     * @param {number} pGroupIndex
     * @param {number} pRowIndex
     * @returns
     */
    getRow(pGroupIndex: number, pRowIndex: number): any;
    /**
     * Get a customized key value pair object for a specific row.
     *
     * @param {number} pGroupIndex - The index of the group.
     * @param {number} pRowIndex - The index of the row.
     * @returns {Object} a key value pair for a specific row, used in metatemplating.
     */
    getRowKeyValuePair(pGroupIndex: number, pRowIndex: number): any;
    /**
     *
     * @param {number} pGroupIndex - The index of the group.
     * @param {number} pRowIndex - The index of the row.
     * @param {number} pInputIndex - The index of the input.
     * @returns {Object|boolean} The input object if found, or false if the input index is invalid.
     */
    getInput(pGroupIndex: number, pRowIndex: number, pInputIndex: number): any | boolean;
    /**
     * Retrieves the input provider list for the given input object.
     *
     * @param {Object} pInput - The input object.
     * @returns {Array} The input provider list.
     */
    getInputProviderList(pInput: any): any[];
    /**
     * Retrieves the input object for a specific hash.
     *
     * @param {string} pInputHash - The string hash for an input (not the address).
     * @returns {Object} The input Object for the given hash.
     */
    getInputFromHash(pInputHash: string): any;
    /**
     * Triggers a DataRequest event for an Input Provider
     *
     * @param {String} pInputHash - The input hash.
     * @returns {boolean} Whether or not the data request was successful.
     */
    inputDataRequest(pInputHash: string): boolean;
    /**
     * Handles the generic Input Event for an Input Provider
     *
     * @param {String} pInputHash - The input hash object.
     * @param {string} pEvent - The input event string.
     * @param {string} [pTransactionGUID] - The transaction GUID.
     * @returns {any} - The result of the input event handling.
     */
    inputEvent(pInputHash: string, pEvent: string, pTransactionGUID?: string): any;
    /**
     * @deprecated
     * @param {string} pEvent - The input event string.
     * @param {Object} pCompletedHashes - the hashes that have already signaled the event
     * @param {string} [pTransactionGUID] - The transaction GUID.
     */
    globalInputEvent(pEvent: string, pCompletedHashes: any, pTransactionGUID?: string): void;
    /**
     *
     * @param {string} pEvent - The input event string.
     * @param {Object} pCompletedHashes - the hashes that have already signaled the event
     * @param {string} [pTransactionGUID] - The transaction GUID.
     */
    manifestInputEvent(pEvent: string, pCompletedHashes: any, pTransactionGUID?: string): void;
    /**
     * Triggers a DataRequest event for an Input Provider
     *
     * @param {number} pGroupIndex - The index of the group.
     * @param {number} pInputIndex - The index of the input.
     * @param {number} pRowIndex - The index of the row.
     * @returns {Promise<any>} A promise that resolves with the input data.
     */
    inputDataRequestTabular(pGroupIndex: number, pInputIndex: number, pRowIndex: number): Promise<any>;
    /**
     * Handles the generic Tabular Input Event for an Input Provider
     *
     * @param {number} pGroupIndex - The index of the group.
     * @param {number} pInputIndex - The index of the input.
     * @param {number} pRowIndex - The index of the row.
     * @param {string} pEvent - The input event object.
     * @param {string} [pTransactionGUID] - The transaction GUID.
     * @returns {any} - The result of the input event handling.
     */
    inputEventTabular(pGroupIndex: number, pInputIndex: number, pRowIndex: number, pEvent: string, pTransactionGUID?: string): any;
    /**
     * @param {string} pTransactionGUID - The transaction GUID.
     * @param {string} pAsyncOperationHash - The hash of the async operation.
     */
    registerEventTransactionAsyncOperation(pTransactionGUID: string, pAsyncOperationHash: string): void;
    /**
     * @param {string} pTransactionGUID - The transaction GUID.
     * @param {string} pAsyncOperationHash - The hash of the async operation.
     *
     * @return {boolean} - Returns true if the async operation was found and marked as complete, otherwise false.
     */
    eventTransactionAsyncOperationComplete(pTransactionGUID: string, pAsyncOperationHash: string): boolean;
    /**
     * @param {string} pTransactionGUID - The transaction GUID.
     *
     * @return {boolean} - Returns true if the transaction was found and able to be finalized, otherwise false.
     */
    finalizeTransaction(pTransactionGUID: string): boolean;
    /**
     * @param {string} pTransactionGUID - The transaction GUID.
     * @param {Function} fCallback - The callback to call when the transaction is complete.
     */
    registerOnTransactionCompleteCallback(pTransactionGUID: string, fCallback: Function): void;
    /**
     *
     * @param {number} pGroupIndex - The index of the group.
     * @param {string} pEvent - The input event string.
     * @param {Object} pCompletedHashes - the hashes that have already signaled the event
     * @param {string} [pTransactionGUID] - The transaction GUID.
     */
    groupInputEvent(pGroupIndex: number, pEvent: string, pCompletedHashes: any, pTransactionGUID?: string): void;
    /**
     *
     * @param {string} pEvent - The input event string.
     * @param {Object} pCompletedHashes - the hashes that have already signaled the event
     * @param {string} [pTransactionGUID] - The transaction GUID.
     */
    sectionInputEvent(pEvent: string, pCompletedHashes: any, pTransactionGUID?: string): void;
    /**
     * Get the input object for a specific tabular record group and index.
     *
     * Input objects are not distinct among rows.
     *
     * @param {number} pGroupIndex - The index of the group.
     * @param {number} pInputIndex - The index of the input.
     * @returns
     */
    getTabularRecordInput(pGroupIndex: number, pInputIndex: number): any;
    /**
     * Get the tabular record object for a particular row in a group.
     *
     * @param {number} pGroupIndex
     * @param {number} pRowIdentifier - The row number
     * @returns {Object} The record for the particular row
     */
    getTabularRecordData(pGroupIndex: number, pRowIdentifier: number): any;
    /**
     * Get the tabular record set for a particular group.
     *
     * @param {number} pGroupIndex
     * @returns {Array} The record set for the group.
     */
    getTabularRecordSet(pGroupIndex: number): any[];
    /**
     * Add a new data row to the end of a dynamic tabular group.
     *
     * This will generate any defaults in the SubManifest.
     *
     * @param {number} pGroupIndex
     * @returns
     */
    createDynamicTableRow(pGroupIndex: number): any;
    /**
     * Move a dynamic table row to an arbitrary position in the array.
     *
     * @param {number} pGroupIndex - The group to manage the dynamic table row for
     * @param {number} pRowIndex - The row to move
     * @param {number} pNewRowIndex - The new position for the row
     * @returns {boolean} True if the move was successful, or false if it wasn't.
     */
    setDynamicTableRowIndex(pGroupIndex: number, pRowIndex: number, pNewRowIndex: number): boolean;
    /**
     * Move a dynamic table row down
     *
     * @param {number} pGroupIndex - The group to manage the dynamic table row for
     * @param {number} pRowIndex - The row to move down
     * @returns {boolean} True if the move was successful, or false if it wasn't.
     */
    moveDynamicTableRowDown(pGroupIndex: number, pRowIndex: number): boolean;
    /**
     * Move a dynamic table row up
     *
     * @param {number} pGroupIndex - The group to manage the dynamic table row for
     * @param {number} pRowIndex - The row to move up
     * @returns {boolean} True if the move was successful, or false if it wasn't.
     */
    moveDynamicTableRowUp(pGroupIndex: number, pRowIndex: number): boolean;
    /**
     * Deletes a dynamic table row.
     *
     * @param {number} pGroupIndex - The index of the group.
     * @param {number} pRowIndex - The index of the row.
     * @returns {Promise} A promise that resolves when the row is deleted.
     */
    deleteDynamicTableRow(pGroupIndex: number, pRowIndex: number): Promise<any>;
    /**
     * Returns whether the current form is a Pict Section form.
     * @returns {boolean} True if the form is a Pict Section form, false otherwise.
     */
    get isPictSectionForm(): boolean;
}
declare namespace PictViewDynamicForm {
    export { _DefaultConfiguration as default_configuration };
}
import libPictViewClass = require("pict-view");
/** @type {Record<string, any>} */
declare const _DefaultConfiguration: Record<string, any>;
//# sourceMappingURL=Pict-View-DynamicForm.d.ts.map