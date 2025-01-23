export = DynamicTabularData;
/**
 * @typedef {Object} ElementDescriptor
 * @property {string} Hash - The hash of the element.
 */
/**
 * The DynamicTabularData class is a provider that translates simple list entries into arrays of entries ready to use in drop-down lists and such
 */
declare class DynamicTabularData {
    /**
     * Creates an instance of the DynamicTabularData class.
     *
     * @param {object} pFable - The fable object.
     * @param {object} pOptions - The options object.
     * @param {object} pServiceHash - The service hash object.
     */
    constructor(pFable: object, pOptions: object, pServiceHash: object);
    /** @type {any} */
    options: any;
    /** @type {import('pict')} */
    pict: import("pict");
    /** @type {any} */
    log: any;
    /**
     * Retrieves the tabular record set from the specified view and group index.
     *
     * @param {Object} pView - The view object.
     * @param {number} pGroupIndex - The index of the group.
     * @returns {Array|Object|boolean} - The tabular record set if it exists, otherwise false.
     */
    getTabularRecordSet(pView: any, pGroupIndex: number): any[] | any | boolean;
    /**
     * Retrieves the tabular record input from the specified view, group, and input indexes.
     *
     * @param {Object} pView - The view object.
     * @param {number} pGroupIndex - The index of the group.
     * @param {number} pInputIndex - The index of the input.
     * @returns {ElementDescriptor|boolean} The tabular record input or false if the group is invalid.
     */
    getTabularRecordInput(pView: any, pGroupIndex: number, pInputIndex: number): ElementDescriptor | boolean;
    /**
     * Retrieves tabular record data based on the provided parameters.
     *
     * @param {Object} pView - The view object.
     * @param {number} pGroupIndex - The index of the group.
     * @param {string} pRowIdentifier - The identifier of the row.
     * @returns {boolean|Object} - The tabular record data or false if not found.
     */
    getTabularRecordData(pView: any, pGroupIndex: number, pRowIdentifier: string): boolean | any;
    /**
     * Creates a dynamic table row for the given view and group index.
     *
     * @param {Object} pView - The view object.
     * @param {number} pGroupIndex - The index of the group.
     */
    createDynamicTableRow(pView: any, pGroupIndex: number): void;
    /**
     * Creates a dynamic table row for the given view and group index without firing render or marshal events.
     *
     * @param {Object} pView - The view object.
     * @param {number} pGroupIndex - The index of the group.
     */
    createDynamicTableRowWithoutEvents(pView: any, pGroupIndex: number): void;
    /**
     * Sets the index of a dynamic table row in a view.
     *
     * @param {Object} pView - The view object.
     * @param {number} pGroupIndex - The index of the group.
     * @param {number|string} pRowIndex - The current index of the row.
     * @param {number} pNewRowIndex - The new index to move the row to.
     * @returns {boolean} - Returns false if the index is out of bounds, otherwise returns undefined.
     */
    setDynamicTableRowIndex(pView: any, pGroupIndex: number, pRowIndex: number | string, pNewRowIndex: number): boolean;
    /**
     * Moves a dynamic table row down within a view.
     *
     * @param {Object} pView - The view containing the dynamic table.
     * @param {number} pGroupIndex - The index of the group containing the row.
     * @param {number|string} pRowIndex - The index of the row to be moved.
     * @returns {boolean} - Returns true if the row was successfully moved, false otherwise.
     */
    moveDynamicTableRowDown(pView: any, pGroupIndex: number, pRowIndex: number | string): boolean;
    /**
     * Moves a dynamic table row up.
     *
     * @param {Object} pView - The view object.
     * @param {number} pGroupIndex - The index of the group.
     * @param {number|string} pRowIndex - The index of the row to be moved.
     * @returns {boolean} Returns true if the row was moved successfully, false otherwise.
     */
    moveDynamicTableRowUp(pView: any, pGroupIndex: number, pRowIndex: number | string): boolean;
    /**
     * Deletes a dynamic table row from the specified view.
     *
     * @param {Object} pView - The view from which to delete the row.
     * @param {number} pGroupIndex - The index of the group containing the row.
     * @param {number|string} pRowIndex - The index or key of the row to delete.
     * @returns {boolean} - Returns true if the row was successfully deleted, false otherwise.
     */
    deleteDynamicTableRow(pView: any, pGroupIndex: number, pRowIndex: number | string): boolean;
}
declare namespace DynamicTabularData {
    export { _DefaultProviderConfiguration as default_configuration, ElementDescriptor };
}
declare namespace _DefaultProviderConfiguration {
    let ProviderIdentifier: string;
    let AutoInitialize: boolean;
    let AutoInitializeOrdinal: number;
    let AutoSolveWithApp: boolean;
}
type ElementDescriptor = {
    /**
     * - The hash of the element.
     */
    Hash: string;
};
//# sourceMappingURL=Pict-Provider-DynamicTabularData.d.ts.map