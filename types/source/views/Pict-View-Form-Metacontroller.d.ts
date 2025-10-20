export = PictFormMetacontroller;
/**
 * @typedef {(a: any, b: any) => number} SortFunction
 */
/**
 * Class representing a PictFormMetacontroller.
 *
 * The metacontroller creates, manages and runs dynamic views and their lifecycle events.
 *
 * @extends libPictViewClass
 */
declare class PictFormMetacontroller extends libPictViewClass {
    constructor(pFable: any, pOptions: any, pServiceHash: any);
    lastRenderedViews: any[];
    formTemplatePrefix: any;
    manifest: any;
    SupportViewPrototypes: {
        LifecycleVisualization: typeof import("./support/Pict-View-PSF-LifeCycle-Visualization.js");
        DebugViewer: typeof import("./support/Pict-View-PSF-DebugViewer.js");
    };
    set viewMarshalDestination(pValue: any);
    get viewMarshalDestination(): any;
    /**
     * Marshals data from the view to the model, usually AppData (or configured data store).
     *
     * @returns {any} The result of the superclass's onMarshalFromView method.
     */
    onMarshalFromView(): any;
    /**
     * Marshals the data to the view from the model, usually AppData (or configured data store).
     *
     * @returns {any} The result of the super.onMarshalToView() method.
     */
    onMarshalToView(): any;
    gatherInitialBundle(fCallback: any): any;
    /**
     * Executes after the initialization of the object.
     *
     * @param {ErrorCallback} fCallback - The callback function to be executed after the initialization.
     * @returns {void}
     */
    onAfterInitializeAsync(fCallback: ErrorCallback): void;
    /**
     * Executes the solve operation -- automatically solves all dynamic views that are present.
     *
     * @returns {any} The result of the solve operation.
     */
    onSolve(): any;
    onBeforeFilterViews(pViewFilterState: any): any;
    onAfterFilterViews(pViewFilterState: any): any;
    /**
     * @param {string} pSectionManifestHash - The hash of the section to find.
     *
     * @return {Record<string, any>} The section definition object, or undefined if not found.
     */
    findDynamicSectionManifestDefinition(pSectionManifestHash: string): Record<string, any>;
    /**
     * @param {Record<string, any>} pManifest - The manifest to add
     * @param {string} [pAfterSectionHash] - The hash of the section to add after. Omit to add to the start.
     */
    injectManifest(pManifest: Record<string, any>, pAfterSectionHash?: string): void;
    /**
     * Changes:
     *   * The hashes of each section+group to be globally unique.
     *   * The data address of each element to map to a unique location.
     *
     * @param {Record<string, any>} pManifest - The manifest to create a distinct copy of.
     * @param {string} [pUUID] - (optional) The UUID to use for uniqueness. If not provided, a new one will be generated.
     *
     * @return {Record<string, any>} A distinct copy of the manifest.
     */
    createDistinctManifest(pManifest: Record<string, any>, pUUID?: string): Record<string, any>;
    /**
     * @param {Array<string>} pManifestHashes - The hashes of the manifests to add.
     * @param {string} [pAfterSectionHash] - The hash of the section to add after. Omit to add to the start.
     * @param {string} [pUUID] - (optional) The UUID to use for uniqueness. If not provided, a new one will be generated.
     */
    injectManifestsByHash(pManifestHashes: Array<string>, pAfterSectionHash?: string, pUUID?: string): void;
    /**
     * @param {Record<string, any>} pSectionsManifest - The section definition object.
     * @param {string} [pAfterSectionHash] - The hash of the section to add after. Omit to add to the start.
     */
    bootstrapAdditiveManifest(pSectionsManifest: Record<string, any>, pAfterSectionHash?: string): any[];
    /**
     * Filters the views based on the provided filter and sort functions.
     *
     * By default, filters views based on the provided filter function and sorts them based on the provided sort function.
     *
     * @param {Function} [fFilterFunction] - The filter function used to determine if a view should be included.
     * @param {SortFunction} [fSortFunction] - The sort function used to sort the filtered views.
     * @returns {Array} - The filtered and sorted views.
     */
    filterViews(fFilterFunction?: Function, fSortFunction?: SortFunction): any[];
    /**
     * Renders a specific dynamic form section based on the provided form section hash.
     *
     * For this to work, we need the container for the section to be available on the form.
     *
     * @param {string} pFormSectionHash - The hash of the form section to render.
     * @returns {void}
     */
    renderSpecificFormSection(pFormSectionHash: string): void;
    /**
     * Renders the default dynamic form sections based on the provided form section hash.
     *
     * @returns {void}
     */
    renderDefaultFormSections(): void;
    /**
     * Renders the form sections based on the provided filter and sort functions.
     *
     * If no filter and sort functions are provided, render all form sections.
     *
     * @param {Function} [fFilterFunction] - The filter function used to filter the views.
     * @param {SortFunction} [fSortFunction] - The sort function used to sort the views.
     */
    renderFormSections(fFilterFunction?: Function, fSortFunction?: SortFunction): void;
    /**
     * Regenerates the DyunamicForm section templates based on the provided filter and sort function.
     *
     * @param {Function} [fFormSectionFilter] - (optional) The filter function used to determine which views to include in the regeneration.
     * @param {SortFunction} [fSortFunction] - (optional) The sort function used to determine the order of the views in the regeneration.
     */
    regenerateFormSectionTemplates(fFormSectionFilter?: Function, fSortFunction?: SortFunction): void;
    /**
     * Generates a meta template for the DynamicForm views managed by this Metacontroller.
     *
     * @param {Function} [fFormSectionFilter] - (optional) The filter function to apply on the form section.
     * @param {SortFunction} [fSortFunction] - (optional) The sort function to apply on the form section.
     * @returns {void}
     */
    generateMetatemplate(fFormSectionFilter?: Function, fSortFunction?: SortFunction): void;
    /**
     * Generates a meta template for the DynamicForm views managed by this Metacontroller.
     *
     * @param {Function} [fFormSectionFilter] - (optional) The filter function to apply on the form section.
     * @param {SortFunction} [fSortFunction] - (optional) The sort function to apply on the form section.
     *
     * @return {void}
     */
    updateMetatemplateInDOM(fFormSectionFilter?: Function, fSortFunction?: SortFunction): void;
    /**
     * Retrieves a safe clone of the section definition for a given manyfest section description object.
     *
     * @param {object} pSectionObject - The section object.
     * @returns {object|boolean} - The section definition if successful, otherwise false.
     */
    getSectionDefinition(pSectionObject: object): object | boolean;
    getSectionViewFromHash(pSectionHash: any): any;
    /**
     * Bootstraps Pict DynamicForm views from a Manyfest description JSON object.
     *
     * @param {Object} pManifestDescription - The manifest description object.
     * @param {string} [pAfterSectionHash] - The hash of the section to add after. Omit to add to the start.
     *
     * @returns {Array<Record<string, any>>} - An array of section definitions added.
     */
    bootstrapPictFormViewsFromManifest(pManifestDescription: any, pAfterSectionHash?: string): Array<Record<string, any>>;
    stashedManifestDescription: any;
    manifestDescription: any;
    /**
     * Trigger an event on all inputs on all views.
     * @param {string} pEvent - The event to trigger
     * @param {string} [pTransactionGUID] - (optional) The transaction GUID to use for the event.
     */
    triggerGlobalInputEvent(pEvent: string, pTransactionGUID?: string): void;
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
    showSupportViewInlineEditor(): void;
    /**
     * Returns whether the object is a Pict Metacontroller.
     *
     * @returns {boolean} True if the object is a Pict Metacontroller, false otherwise.
     */
    get isPictMetacontroller(): boolean;
}
declare namespace PictFormMetacontroller {
    export { default_configuration, SortFunction };
}
import libPictViewClass = require("pict-view");
declare const default_configuration: Record<string, any>;
type SortFunction = (a: any, b: any) => number;
//# sourceMappingURL=Pict-View-Form-Metacontroller.d.ts.map