const libPictProvider = require('pict-provider');

// TODO: Pull this back to pict as a core service once we are happy with the shape.
const _DefaultProviderConfiguration = (
{
	"ProviderIdentifier": "Pict-DynamicForms-Informary",

	"AutoInitialize": false,
	"AutoInitializeOrdinal": 0,

	"AutoSolveWithApp": false
});

/**
 * Represents a provider for dynamic forms in the PICT system.
 * Extends the `libPictProvider` class.
 */
class PictDynamicFormsInformary extends libPictProvider
{
	/**
	 * Creates an instance of the `PictDynamicFormsInformary` class.
	 * @param {object} pFable - The fable object.
	 * @param {object} pOptions - The options object.
	 * @param {object} pServiceHash - The service hash object.
	 */
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(_DefaultProviderConfiguration)), pOptions);

		super(pFable, tmpOptions, pServiceHash);

		this.genericManifest = this.pict.newManyfest({Scope:'GenericInformary'});		
	}

	/**
	 * Retrieves all form elements for a given form hash.
	 *
	 * @param {string} pFormHash - The hash of the form.
	 * @returns {HTMLElement[]} - An array of HTML elements representing the form elements.
	 */
	getFormElements(pFormHash)
	{
		let tmpSelector = `[data-i-form="${pFormHash}"]`;
		//this.log.trace(`Getting form elements for form hash selector: ${tmpSelector}`);
		return this.pict.ContentAssignment.getElement(tmpSelector);
	}

	/**
	 * Get a full content browser address based on the form, datum and optionally the container and index.
	 * 
	 * This can be used in getDomElementByAddress or jquery selectors to return the element.
	 *
	 * @param {string} pFormHash - The form hash.
	 * @param {string} pDatumHash - The datum hash.
	 * @param {string|null} pContainer - The container (optional).
	 * @param {number} pIndex - The index.
	 * @returns {string} The content browser address.
	 */
	getContentBrowserAddress(pFormHash, pDatumHash, pContainer, pIndex)
	{
		// TODO: Need some guards, yo
		if (pContainer)
		{
			return `[data-i-form="${pFormHash}"][data-i-datum="${pDatumHash}"][data-i-container="${pContainer}"][data-i-index="${pIndex}"]`;
		}
		else
		{
			return `[data-i-form="${pFormHash}"][data-i-datum="${pDatumHash}"]`;
		}
	}

	/**
	 * Returns the composed container address string for a given container, index, and datum hash.
	 *
	 * @param {string} pContainer - The container name.
	 * @param {number} pIndex - The index of the container.
	 * @param {string} pDatumHash - The datum hash.
	 * @returns {string} The composed container address.
	 */
	getComposedContainerAddress(pContainer, pIndex, pDatumHash)
	{
		return `${pContainer}[${pIndex}].${pDatumHash}`;
	}

	/**
	 * Marshals form data to the provided application state data object using the given form hash and manifest.
	 *
	 * @param {object} pAppStateData - The application state data object to marshal the form data to.
	 * @param {string} pFormHash - The form hash representing the form elements.
	 * @param {object} pManifest - The manifest object used to map form data to the application state data.
	 */
	marshalFormToData(pAppStateData, pFormHash, pManifest)
	{
		let tmpManifest = typeof(pManifest) === 'object' ? pManifest : this.genericManifest;
		let tmpFormElements = this.getFormElements(pFormHash);

		// Enumerate the form elements, and put data in them for each address
		for (let i = 0; i < tmpFormElements.length; i++)
		{
			let tmpDatumAddress = tmpFormElements[i].getAttribute('data-i-datum');

			let tmpContainerAddress = tmpFormElements[i].getAttribute('data-i-container');
			let tmpIndex = tmpFormElements[i].getAttribute('data-i-index');

			let tmpBrowserValue = this.pict.ContentAssignment.readContent(this.getContentBrowserAddress(pFormHash, tmpDatumAddress, tmpContainerAddress, tmpIndex));

			if (this.pict.LogNoisiness > 3)
			{
				this.log.trace(`Informary marshalling BrowserForm Data ${tmpBrowserValue} from form element [${tmpDatumAddress}] in container [${tmpContainerAddress}] at index [${tmpIndex}] to the datum address [${tmpDatumAddress}].`);
			}

			if (typeof(tmpBrowserValue) === 'undefined')
			{
				continue;
			}

			if (!tmpContainerAddress)
			{
				tmpManifest.setValueAtAddress(pAppStateData, tmpDatumAddress, tmpBrowserValue);
			}
			else
			{
				// Compose the address .. right now only arrays
				tmpManifest.setValueAtAddress(pAppStateData, this.getComposedContainerAddress(tmpContainerAddress, tmpIndex, tmpDatumAddress), tmpBrowserValue);
			}
		}
	}

	/**
	 * Marshals data from some application state object to a specific subset of browser form elements.
	 *
	 * @param {object} pAppStateData - The application state data to marshal into the form.  Usually AppData but can be other objects.
	 * @param {string} pFormHash - The hash of the form to marshal data into.  This is the data-i-form attribute.
	 * @param {object} pManifest - The manifest object.  If not provided, the generic manifest is used.
	 */
	marshalDataToForm(pAppStateData, pFormHash, pManifest)
	{
		let tmpManifest = typeof(pManifest) === 'object' ? pManifest : this.genericManifest;
		let tmpFormElements = this.getFormElements(pFormHash);

		// Enumerate the form elements, and put data in them for each address
		for (let i = 0; i < tmpFormElements.length; i++)
		{
			let tmpDatumAddress = tmpFormElements[i].getAttribute('data-i-datum');

			let tmpContainerAddress = tmpFormElements[i].getAttribute('data-i-container');
			let tmpIndex = tmpFormElements[i].getAttribute('data-i-index');

			if (!tmpContainerAddress)
			{
				let tmpAppStateValue = tmpManifest.getValueAtAddress(pAppStateData, tmpDatumAddress);

				if (this.pict.LogNoisiness > 3)
				{
					this.log.trace(`Informary marshalling App State data ${tmpAppStateValue} to Browser Form element [${tmpDatumAddress}] in container [${tmpContainerAddress}] at index [${tmpIndex}].`);
				}

				if (typeof(tmpAppStateValue) !== 'undefined')
				{
					this.pict.ContentAssignment.assignContent(this.getContentBrowserAddress(pFormHash, tmpDatumAddress, tmpContainerAddress, tmpIndex), tmpAppStateValue);
				}
			}
			else
			{
				let tmpAppStateValue = tmpManifest.getValueAtAddress(pAppStateData, this.getComposedContainerAddress(tmpContainerAddress, tmpIndex, tmpDatumAddress));

				if (this.pict.LogNoisiness > 3)
				{
					this.log.trace(`Informary marshalling App State data ${tmpAppStateValue} to Browser Form element [${tmpDatumAddress}] in container [${tmpContainerAddress}] at index [${tmpIndex}].`);
				}

				if (typeof(tmpAppStateValue) !== 'undefined')
				{
					this.pict.ContentAssignment.assignContent(this.getContentBrowserAddress(pFormHash, tmpDatumAddress, tmpContainerAddress, tmpIndex), tmpAppStateValue);
				}
			}
		}
	}
}

module.exports = PictDynamicFormsInformary;
module.exports.default_configuration = _DefaultProviderConfiguration;