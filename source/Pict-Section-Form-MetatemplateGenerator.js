const libPictProvider = require('pict-provider');

const _DefaultProviderConfiguration = (
{
	"ProviderIdentifier": "Pict-Section-Form-Provider-MetatemplateGenerator",

	"AutoInitialize": true,
	"AutoInitializeOrdinal": 0,

	"AutoSolveWithApp": false
})

class PictSectionFormMetatemplateGenerator extends libPictProvider
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(_DefaultProviderConfiguration)), pOptions);
		
		super(pFable, tmpOptions, pServiceHash);
	}
}

module.exports = PictSectionFormMetatemplateGenerator;
module.exports.default_configuration = _DefaultProviderConfiguration;


