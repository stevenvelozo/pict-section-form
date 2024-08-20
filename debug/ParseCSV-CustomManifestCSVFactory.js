const libManifestFactory = require('../source/services/ManifestFactory.js');

class CustomManifestCSVFactory extends libManifestFactory
{
	constructor(pFable, pSettings, pServiceHash)
	{
		super(pFable, pSettings, pServiceHash);
	}

	onTabularRowAddDescriptor(pIncomingDescriptor, pSection, pGroup, pNewDescriptor)
	{
		if (pIncomingDescriptor.Units)
		{
			pNewDescriptor.PictForm.Units = pIncomingDescriptor.Units;
		}
		if (pIncomingDescriptor['External Database ID'])
		{
			pNewDescriptor.PictForm.ExternalDatabaseID = pIncomingDescriptor['External Database ID'];
		}
		if (pIncomingDescriptor['New'])
		{
			pNewDescriptor.PictForm.New = pIncomingDescriptor['New'];
		}
	}
}

module.exports = CustomManifestCSVFactory;