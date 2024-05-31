const libPictProvider = require('pict-provider');

// TODO: Pull this back to pict as a core service once we are happy with the shape.
const _DefaultProviderConfiguration = (
{
	"ProviderIdentifier": "Pict-Section-Form-Provider-Informary",

	"AutoInitialize": false,
	"AutoInitializeOrdinal": 0,

	"AutoSolveWithApp": false
});

class PictServiceInformary extends libPictProvider
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(_DefaultProviderConfiguration)), pOptions);

		super(pFable, tmpOptions, pServiceHash);

		this.genericManifest = this.pict.newManyfest({Scope:'GenericInformary'});		
	}

	getFormElements(pFormHash)
	{
		let tmpSelector = `[data-i-form="${pFormHash}"]`;
		this.log.trace(`Getting form elements for form hash selector: ${tmpSelector}`);
		return this.pict.ContentAssignment.getElement(tmpSelector);
	}

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

	// TODO: DRY or bust.  Later.
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

			if (!tmpContainerAddress)
			{
				this.log.trace(`Informary marshalling BrowserForm Data ${tmpBrowserValue} from form element [${tmpDatumAddress}] in container [${tmpContainerAddress}] at index [${tmpIndex}] to the datum address [${tmpDatumAddress}].`);

				if (typeof(tmpBrowserValue) !== 'undefined')
				{
					tmpManifest.setValueAtAddress(pAppStateData, tmpDatumAddress, tmpBrowserValue);
				}
			}
			else
			{

			}
		}
	}

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

				this.log.trace(`Informary marshalling App State data ${tmpAppStateValue} to Browser Form element [${tmpDatumAddress}] in container [${tmpContainerAddress}] at index [${tmpIndex}].`);

				if (typeof(tmpAppStateValue) !== 'undefined')
				{
					this.pict.ContentAssignment.assignContent(this.getContentBrowserAddress(pFormHash, tmpDatumAddress, tmpContainerAddress, tmpIndex), tmpAppStateValue);
				}
			}
		}
	}
}

module.exports = PictServiceInformary;
module.exports.default_configuration = _DefaultProviderConfiguration;