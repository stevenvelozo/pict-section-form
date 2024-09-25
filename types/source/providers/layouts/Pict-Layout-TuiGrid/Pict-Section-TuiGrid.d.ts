export = TuiGridLayout;
/**
 * TuiGridLayout class represents a layout for TuiGrid in the Pict-Layout-TuiGrid module.
 * @extends libPictSectionTuiGrid
 */
declare class TuiGridLayout {
    constructor(pFable: any, pOptions: any, pServiceHash: any);
    viewGridConfigurations: {};
    cachedGridData: any[];
    /**
     * Custom configuration for the grid settings -- fires when
     *
     * Sets the grid data to the cached grid data for the tuigrid.
     *
     * @returns {any} The result of the super.customConfigureGridSettings() method.
     */
    customConfigureGridSettings(): any;
    /**
     * Handles the change event in the Pict-Section-TuiGrid component.
     *
     * Updates the state in the model based on the grid changes.  This is
     *
     * @param {Object} pChangeData - The change data object.
     * @returns {any} - The result of the super changeHandler method.
     */
    changeHandler(pChangeData: any): any;
}
//# sourceMappingURL=Pict-Section-TuiGrid.d.ts.map