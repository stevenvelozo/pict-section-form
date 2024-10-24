const libFableServiceProviderBase = require('fable-serviceproviderbase');

const libManifestFactory = require('../services/ManifestFactory.js');

const libDynamicSolver = require('../providers/Pict-Provider-DynamicSolver.js');
const libDynamicInput = require('../providers/Pict-Provider-DynamicInput.js');
const libDynamicInputEvents = require('../providers/Pict-Provider-DynamicInputEvents.js');
const libDynamicTabularData = require('../providers/Pict-Provider-DynamicTabularData.js');
const libDynamicRecordSet = require('../providers/Pict-Provider-DynamicRecordSet.js');

const libFormsTemplateProvider = require('../providers/Pict-Provider-DynamicTemplates.js');

const libMetatemplateGenerator = require('../providers/Pict-Provider-MetatemplateGenerator.js');
const libMetatemplateMacros = require('../providers/Pict-Provider-MetatemplateMacros.js');

const libPictLayoutRecord = require('../providers/layouts/Pict-Layout-Record.js');
const libPictLayoutTabular = require('../providers/layouts/Pict-Layout-Tabular.js');
const libPictLayoutRecordSet = require('../providers/layouts/Pict-Layout-RecordSet.js');
const libPictLayoutChart = require('../providers/layouts/Pict-Layout-Chart.js');
const libPictLayoutTuiGrid = require('../providers/layouts/Pict-Layout-TuiGrid.js');

const libInformary = require('../providers/Pict-Provider-Informary.js');

class PictDynamicApplication extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		// Intersect default options, parent constructor, service information
		//let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(_DefaultManifestSettings)), pOptions);
		super(pFable, pOptions, pServiceHash);

		this.fable.addAndInstantiateSingletonService('ManifestFactory', libManifestFactory.default_configuration, libManifestFactory);

		this.fable.addProviderSingleton('DynamicInput', libDynamicInput.default_configuration, libDynamicInput);
		this.fable.addProviderSingleton('DynamicInputEvents', libDynamicInputEvents.default_configuration, libDynamicInputEvents);
		this.fable.addProviderSingleton('DynamicSolver', libDynamicSolver.default_configuration, libDynamicSolver);
		this.fable.addProviderSingleton('DynamicTabularData', libDynamicTabularData.default_configuration, libDynamicTabularData);
		this.fable.addProviderSingleton('DynamicRecordSet', libDynamicRecordSet.default_configuration, libDynamicRecordSet);

		this.fable.addProviderSingleton('PictFormSectionDefaultTemplateProvider', libFormsTemplateProvider.default_configuration, libFormsTemplateProvider);

		this.fable.addProviderSingleton('MetatemplateGenerator', libMetatemplateGenerator.default_configuration, libMetatemplateGenerator);
		this.fable.addProviderSingleton('MetatemplateMacros', libMetatemplateMacros.default_configuration, libMetatemplateMacros);

		this.fable.addProviderSingleton('Pict-Layout-Record', libPictLayoutRecord.default_configuration, libPictLayoutRecord);
		this.fable.addProviderSingleton('Pict-Layout-Tabular', libPictLayoutTabular.default_configuration, libPictLayoutTabular);
		this.fable.addProviderSingleton('Pict-Layout-RecordSet', libPictLayoutRecordSet.default_configuration, libPictLayoutRecordSet);
		this.fable.addProviderSingleton('Pict-Layout-Chart', libPictLayoutChart.default_configuration, libPictLayoutChart);
		this.fable.addProviderSingleton('Pict-Layout-TuiGrid', libPictLayoutTuiGrid.default_configuration, libPictLayoutTuiGrid);

		this.fable.addProviderSingleton('Informary', libInformary.default_configuration, libInformary);
	}
}

module.exports = PictDynamicApplication;