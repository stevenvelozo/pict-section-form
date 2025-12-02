export = PictRecordSet;
/**
 * The PictRecordSet class is a provider to read and write record sets.
 *
 * Record sets are bodies of records that are larger than what we would want to
 * be projected into a view.
 */
declare class PictRecordSet extends libPictProvider {
    recordProviders: {};
    /**
     * Returns the count for a specific dynamic record set.
     *
     * @param {Object} pFilter - The filter object.
     * @param {Function} fCallback - The callback function to be called after the count is returned.
     * @returns {any} - The result of the callback function.
     */
    count(pFilter: any, fCallback: Function): any;
    /**
     * Reads a record list.
     *
     * @param {Object} pFilter - The filter object.
     * @param {Function} fCallback - The callback function to be called after the record list is read.
     * @returns {any} - The result of the callback function.
     */
    readRecordList(pFilter: any, fCallback: Function): any;
    /**
     * Reads a record.
     *
     * @param {Object} pFilter - The filter object.
     * @param {Function} fCallback - The callback function to be called after the record is read.
     * @returns {any} - The result of the callback function.
     */
    readRecord(pFilter: any, fCallback: Function): any;
    /**
     * Writes a record.
     *
     * @param {Object} pRecord - The record to be written.
     * @param {Function} fCallback - The callback function to be called after the record is written.
     * @returns {any} - The result of the callback function.
     */
    writeRecord(pRecord: any, fCallback: Function): any;
    /**
     * Deletes a record.
     *
     * @param {Object} pRecord - The record to be deleted.
     * @param {Function} fCallback - The callback function to be called after the record is deleted.
     * @returns {any} - The result of the callback function.
     */
    deleteRecord(pRecord: any, fCallback: Function): any;
}
declare namespace PictRecordSet {
    export { _DefaultProviderConfiguration as default_configuration };
}
import libPictProvider = require("pict-provider");
/** @type {Record<string, any>} */
declare const _DefaultProviderConfiguration: Record<string, any>;
//# sourceMappingURL=Pict-Provider-DynamicRecordSet.d.ts.map