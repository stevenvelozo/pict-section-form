export = TuiGridLayout;
declare class TuiGridLayout extends libPictSectionGroupLayout {
    /**
     * @param {import('pict')} pFable - The Fable instance.
     * @param {any} [pOptions={}] - The options for the TuiGrid layout.
     * @param {string} [pServiceHash] - The service hash.
     */
    constructor(pFable: import("pict"), pOptions?: any, pServiceHash?: string);
    /** @type {any} */
    options: any;
    /** @type {import('pict')} */
    pict: import("pict");
    /** @type {any} */
    log: any;
    viewGridConfigurations: {};
    viewTuiGrids: {};
    viewGridState: {};
    /**
     * Generates the HTML ID for a TuiGrid group within a specific view.
     *
     * @param {Object} pView - The view object.
     * @param {Object} pGroup - The group object.
     * @returns {string} - The generated HTML ID.
     */
    getGridHtmlID(pView: any, pGroup: any): string;
    /**
     * Returns the HTML ID of the Tui view in the specified group.
     *
     * @param {string} pView - The Tui view.
     * @param {string} pGroup - The group.
     * @returns {string} - The HTML ID of the Tui view.
     */
    getViewTuiHtmlID(pView: string, pGroup: string): string;
    /**
     * Retrieves the TuiGrid view for a given view and group.
     *
     * @param {string} pView - The view name.
     * @param {string} pGroup - The group name.
     * @returns {libPictSectionTuiGridLayout} - The TuiGrid view if it exists, otherwise false.
     */
    getViewGrid(pView: string, pGroup: string): libPictSectionTuiGridLayout;
    /**
     * Creates a TuiGrid view for the specified view and group.
     *
     * @param {any} pView - The view object.
     * @param {any} pGroup - The group object.
     * @return {libPictSectionTuiGridLayout} - The created TuiGrid view.
     */
    createViewTuiGrid(pView: any, pGroup: any): libPictSectionTuiGridLayout;
    /**
     * Retrieves the TuiGrid configuration for a specific view and group.
     *
     * @param {any} pView - The view identifier.
     * @param {any} pGroup - The group identifier.
     * @returns {object} - The TuiGrid configuration for the specified view and group.
     */
    getViewTuiConfiguration(pView: any, pGroup: any): object;
    /**
     * Generates a data representation for the given view and group.
     *
     * @param {any} pView - The view object.
     * @param {any} pGroup - The group object.
     * @returns {Array<any>} - The generated data representation.
     */
    generateDataRepresentation(pView: any, pGroup: any): Array<any>;
    /**
     * Adds a new row to the Pict-Layout-TuiGrid.
     *
     * @param {string} pViewHash - The hash of the PICT form view.
     * @param {number} pGroupIndex - The index of the group in the view.
     * @returns {boolean} Returns false if there is an error adding the row, otherwise returns true.
     */
    addRow(pViewHash: string, pGroupIndex: number): boolean;
}
import libPictSectionGroupLayout = require("../Pict-Provider-DynamicLayout.js");
import libPictSectionTuiGridLayout = require("./Pict-Layout-TuiGrid/Pict-Section-TuiGrid.js");
//# sourceMappingURL=Pict-Layout-TuiGrid.d.ts.map