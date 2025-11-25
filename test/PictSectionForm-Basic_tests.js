/*
	Unit tests for PictSectionForm Basic

*/

// This is temporary, but enables unit tests
const libBrowserEnv = require('browser-env')
libBrowserEnv();

const libPictView = require('pict-view');

const Chai = require('chai');
const Expect = Chai.expect;

const libPict = require('pict');

const libPictSectionForm = require('../source/Pict-Section-Form.js');

const manifestPostcard = require('../example_applications/postcard_example/providers/PictProvider-Dynamic-Sections-MockServerResponse.json');

class DoNothingApplication extends libPictSectionForm.PictFormApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.pict.addView('DoNothingView', {}, DoNothingView);
	}

	/**
	 * @param {function} fDone - Callback that finishes the test
	 */
	set testDone(fDone)
	{
		this._testDone = fDone;
	}

	onAfterInitialize()
	{
		this.solve();
		this._testDone();
	}
}

class DoNothingView extends libPictView
{
	constructor(pict, configuration)
	{
		super(pict, configuration);
	}
}

class OrderedSolverApplication extends DoNothingApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.pict.AppData.A = '5';
		this.pict.AppData.B = '3';
	}

	onAfterSolve()
	{
		super.onAfterSolve();
		this.pict.log.info('OrderedSolverApplication onAfterSolve called.');
		this._testDone?.();
	}

	onAfterInitialize()
	{
	}
}

OrderedSolverApplication.default_configuration.pict_configuration.DefaultFormManifest =
{
	Scope: 'OrderedSolverApplicationForm',
	Descriptors: {},
	Sections:
	[
		{
			Name: 'Ordered Solver Section',
			Hash: 'OrderedSolverSection',
			Solvers:
			[
				{ Ordinal: 5, Expression: 'C = A + B' },
				{ Ordinal: 40, Expression: 'D = C - B' },
			],
		},
	],
};

suite
(
	'PictSectionForm Basic',
	() =>
	{
		setup(() => { });

		suite
			(
				'Basic Basic Tests',
				() =>
				{
					test(
							'Basic Initialization',
							(fDone) =>
							{
								let _Pict = new libPict();
								_Pict.LogNoisiness = 1;
								let _PictEnvironment = new libPict.EnvironmentObject(_Pict);


								// The pict view hash
								let tmpViewHash = `PictSectionForm-${manifestPostcard.Sections[0].Hash}`;
								// The configuration is generally pulled from tne manyfest manifest Section array
								let tmpViewConfiguration = JSON.parse(JSON.stringify(manifestPostcard.Sections[0]));

								tmpViewConfiguration.Manifests = { Section: manifestPostcard };

								_Pict.addAndInstantiateSingletonService('PictDynamicFormDependencyManager', libPictSectionForm.PictDynamicFormDependencyManager.default_configuration, libPictSectionForm.PictDynamicFormDependencyManager);

								let _PictSectionForm = _Pict.addView(tmpViewHash, tmpViewConfiguration, libPictSectionForm);

								Expect(_PictSectionForm).to.be.an('object');

								// Test package anthropology
								Expect(_PictSectionForm._PackageFableServiceProvider).to.be.an('object', 'Fable should have a _PackageFableServiceProvider object.');
								Expect(_PictSectionForm._PackageFableServiceProvider.name).equal('fable-serviceproviderbase', 'Fable _PackageFableServiceProvider.package.name should be set.');
								Expect(_PictSectionForm._PackagePictView).to.be.an('object', 'Should have a _PackagePictView object.');
								Expect(_PictSectionForm._PackagePictView.name).to.equal('pict-view', '_PackagePictView.package.name should be set.');
								Expect(_PictSectionForm._Package).to.be.an('object', 'Should have a _Package object.');
								Expect(_PictSectionForm._Package.name).to.equal('pict-section-form', '_Package.package.name should be set.');

								return fDone();
							}
						);
					});
		suite
			(
				'Solver Tests',
				() =>
				{
					test(
							'No-Op Solve',
							(fDone) =>
							{
								//NOTE: code is a clone of Pict.safeLoadPictApplication
								let _Pict;
								if (DoNothingApplication && ('default_configuration' in DoNothingApplication) && ('pict_configuration' in DoNothingApplication.default_configuration))
								{
									_Pict = new libPict(DoNothingApplication.default_configuration.pict_configuration);
								}
								else
								{
									_Pict = new libPict();
								}

								_Pict.LogNoisiness = 1;

								let tmpApplicationHash = 'DefaultApplication';
								let tmpDefaultConfiguration = {};

								if ('default_configuration' in DoNothingApplication)
								{
									tmpDefaultConfiguration = DoNothingApplication.default_configuration;

									if ('Hash' in DoNothingApplication.default_configuration)
									{
										tmpDefaultConfiguration = DoNothingApplication.default_configuration;
										tmpApplicationHash = DoNothingApplication.default_configuration.Hash;
									}
								}
								_Pict.log.info(`Loading the pict application [${tmpApplicationHash}] and associated views.`);

								_Pict.addApplication(tmpApplicationHash, tmpDefaultConfiguration, DoNothingApplication);

								_Pict.PictApplication.testDone = fDone;

								_Pict.PictApplication.initializeAsync(
									function (pError)
									{
										if (pError)
										{
											console.log('Error initializing the pict application: '+pError)
										}
										_Pict.log.info('Loading the Application and associated views.');
									});
							}
						);
					test(
							'Distinct Array Test',
							(fDone) =>
							{
								//NOTE: code is a clone of Pict.safeLoadPictApplication
								let _Pict;
								const tmpApplicationClass = OrderedSolverApplication;
								if (tmpApplicationClass && ('default_configuration' in tmpApplicationClass) && ('pict_configuration' in tmpApplicationClass.default_configuration))
								{
									_Pict = new libPict(tmpApplicationClass.default_configuration.pict_configuration);
								}
								else
								{
									_Pict = new libPict();
								}

								//_Pict.LogNoisiness = 0;

								let tmpApplicationHash = 'DefaultApplication';
								let tmpDefaultConfiguration = {};

								if ('default_configuration' in tmpApplicationClass)
								{
									tmpDefaultConfiguration = tmpApplicationClass.default_configuration;

									if ('Hash' in tmpApplicationClass.default_configuration)
									{
										tmpDefaultConfiguration = tmpApplicationClass.default_configuration;
										tmpApplicationHash = tmpApplicationClass.default_configuration.Hash;
									}
								}
								_Pict.log.info(`Loading the pict application [${tmpApplicationHash}] and associated views.`);

								_Pict.addApplication(tmpApplicationHash, tmpDefaultConfiguration, tmpApplicationClass);

								// Add the pict form service
								_Pict.addServiceType('PictSectionForm', libPictSectionForm);

								// Add the pict form metacontroller service, which provides programmaatic view construction from manifests and render/marshal methods.
								_Pict.addView('PictFormMetacontroller', {}, libPictSectionForm.PictFormMetacontroller);

								const tmpManifest =
								{
									Scope: 'OrderedSolverApplicationForm',
									Descriptors:
									{
										DataTableAddress:
										{
											Hash: 'DataTable',
											Name: 'Data Table',
											DataAddress: 'DataTableAddress',
											DataType: 'Array',
											FormGroup: 'DataTableGroup',
											FormSection: 'DataTableSection',
										},
										'DataTableAddress[].ValueAddress':
										{
											Hash: 'ValueArray',
											Name: 'Data Value',
											DataAddress: 'DataTableAddress[].ValueAddress',
											DataType: 'Array',
											FormGroup: 'DataTableGroup',
											FormSection: 'DataTableSection',
										},
										AggregateValueAddress:
										{
											Hash: 'AggregateValue',
											Name: 'Aggregate Value',
											DataAddress: 'AggregateValueAddress',
											DataType: 'PreciseNumber',
											FormGroup: 'DataTableGroup',
											FormSection: 'DataTableSection',
										},
										AggregateValueAddress2:
										{
											Hash: 'AggregateValue2',
											Name: 'Aggregate Value 2',
											DataAddress: 'AggregateValueAddress2',
											DataType: 'PreciseNumber',
											FormGroup: 'DataTableGroup',
											FormSection: 'DataTableSection',
										},
									},
									Sections:
									[
										{
											Name: 'Ordered Solver Section',
											Hash: 'OrderedSolverSection',
											Solvers:
											[
												{ Ordinal: 5, Expression: 'AggregateValue = SUM(ValueArray)' },
												{ Ordinal: 40, Expression: 'AggregateValue2 = SUM(DataTableAddress[].ValueAddress)' },
											],
										},
									],
								};

								let tmpHashedAggregateValue = null;
								let tmpHashedAggregateValue2 = null;
								_Pict.PictApplication.initializeAsync(
									function (pError)
									{
										if (pError)
										{
											_Pict.log.info('Error initializing the pict application: '+pError)
										}

										try
										{
											_Pict.log.info('Loading the Application and associated views.');
											const tmpDistinctManifest = _Pict.views.PictFormMetacontroller.createDistinctManifest(tmpManifest);
											_Pict.log.info('Distinct Manifest:', tmpDistinctManifest);
											tmpHashedAggregateValue = Object.entries(tmpDistinctManifest.Descriptors).find(([pKey, pValue]) => pValue.OriginalHash == 'AggregateValue')[0];
											tmpHashedAggregateValue2 = Object.entries(tmpDistinctManifest.Descriptors).find(([pKey, pValue]) => pValue.OriginalHash == 'AggregateValue2')[0];
											const tmpInjectedSecionViews = _Pict.views.PictFormMetacontroller.injectManifest(tmpDistinctManifest);
											_Pict.log.info('Injected Section Views:', tmpInjectedSecionViews.length);
											_Pict.views.PictFormMetacontroller.updateMetatemplateInDOM();
											setTimeout(() =>
											{
												for (const tmpView of tmpInjectedSecionViews)
												{
													tmpView.render();
												}
												for (const tmpView of tmpInjectedSecionViews)
												{
													tmpView.marshalToView();
												}
												//TODO: do we need to trigger a solve here?
											}, 0);
											_Pict.PictApplication.testDone = () =>
											{
												try
												{
													_Pict.log.info(`AppData after`, { AppData: _Pict.AppData, tmpHashedAggregateValue, tmpHashedAggregateValue2 });
													Expect(_Pict.AppData[tmpHashedAggregateValue]).to.equal('15', 'AggregateValue should equal 15 (SUM of ValueArray via hash)');
													Expect(_Pict.AppData[tmpHashedAggregateValue2]).to.equal('15', 'AggregateValue should equal 15 (SUM of ValueArray via address)');
												}
												catch (pError)
												{
													return fDone(pError);
												}
												fDone();
											};
											const [ tmpValueArrayKey, tmpValueArrayDescriptor ] = Object.entries(tmpDistinctManifest.Descriptors).find(([pKey, pDescriptor]) => pDescriptor.OriginalHash == 'ValueArray');
											const tmpAddress = tmpValueArrayDescriptor.DataAddress;
											_Pict.log.info('Setting up Distinct Array Test with address:', { tmpValueArrayKey, tmpValueArrayDescriptor, tmpAddress });
											const tmpArrayAddress = tmpAddress.substring(0, tmpAddress.indexOf('[]'));
											const tmpPropertyAddress = tmpAddress.substring(tmpAddress.indexOf('[]') + 3);
											_Pict.manifest.setValueByHash(_Pict.AppData, tmpArrayAddress,
												[
													{ [tmpPropertyAddress]: '1' },
													{ [tmpPropertyAddress]: '2' },
													{ [tmpPropertyAddress]: '3' },
													{ [tmpPropertyAddress]: '4' },
													{ [tmpPropertyAddress]: '5' },
												]);
											_Pict.PictApplication.solve();
										}
										catch (pError)
										{
											_Pict.log.error('Error during Distinct Array Test:', pError);
											return fDone(pError);
										}
									});
							}
						);
					test(
							'Distinct Array Test 2',
							(fDone) =>
							{
								//NOTE: code is a clone of Pict.safeLoadPictApplication
								let _Pict;
								const tmpApplicationClass = OrderedSolverApplication;
								if (tmpApplicationClass && ('default_configuration' in tmpApplicationClass) && ('pict_configuration' in tmpApplicationClass.default_configuration))
								{
									_Pict = new libPict(tmpApplicationClass.default_configuration.pict_configuration);
								}
								else
								{
									_Pict = new libPict();
								}

								//_Pict.LogNoisiness = 0;

								let tmpApplicationHash = 'DefaultApplication';
								let tmpDefaultConfiguration = {};

								if ('default_configuration' in tmpApplicationClass)
								{
									tmpDefaultConfiguration = tmpApplicationClass.default_configuration;

									if ('Hash' in tmpApplicationClass.default_configuration)
									{
										tmpDefaultConfiguration = tmpApplicationClass.default_configuration;
										tmpApplicationHash = tmpApplicationClass.default_configuration.Hash;
									}
								}
								_Pict.log.info(`Loading the pict application [${tmpApplicationHash}] and associated views.`);

								_Pict.addApplication(tmpApplicationHash, tmpDefaultConfiguration, tmpApplicationClass);

								// Add the pict form service
								_Pict.addServiceType('PictSectionForm', libPictSectionForm);

								// Add the pict form metacontroller service, which provides programmaatic view construction from manifests and render/marshal methods.
								_Pict.addView('PictFormMetacontroller', {}, libPictSectionForm.PictFormMetacontroller);

								const tmpManifest =
								{
									Scope: 'OrderedSolverApplicationForm',
									Descriptors:
									{
										'DataTableAddress[].ValueAddress':
										{
											Hash: 'ValueArray',
											Name: 'Data Value',
											DataAddress: 'DataTableAddress[].ValueAddress',
											DataType: 'Array',
											FormGroup: 'DataTableGroup',
											FormSection: 'DataTableSection',
										},
										AggregateValueAddress:
										{
											Hash: 'AggregateValue',
											Name: 'Aggregate Value',
											DataAddress: 'AggregateValueAddress',
											DataType: 'PreciseNumber',
											FormGroup: 'DataTableGroup',
											FormSection: 'DataTableSection',
										},
										AggregateValueAddress2:
										{
											Hash: 'AggregateValue2',
											Name: 'Aggregate Value 2',
											DataAddress: 'AggregateValueAddress2',
											DataType: 'PreciseNumber',
											FormGroup: 'DataTableGroup',
											FormSection: 'DataTableSection',
										},
									},
									Sections:
									[
										{
											Name: 'Ordered Solver Section',
											Hash: 'OrderedSolverSection',
											Solvers:
											[
												{ Ordinal: 5, Expression: 'AggregateValue = SUM(ValueArray)' },
												{ Ordinal: 40, Expression: 'AggregateValue2 = SUM(DataTableAddress[].ValueAddress)' },
											],
										},
									],
								};

								let tmpHashedAggregateValue = null;
								let tmpHashedAggregateValue2 = null;
								_Pict.PictApplication.initializeAsync(
									function (pError)
									{
										if (pError)
										{
											_Pict.log.info('Error initializing the pict application: '+pError)
										}

										try
										{
											_Pict.log.info('Loading the Application and associated views.');
											const tmpDistinctManifest = _Pict.views.PictFormMetacontroller.createDistinctManifest(tmpManifest);
											_Pict.log.info('Distinct Manifest:', tmpDistinctManifest);
											tmpHashedAggregateValue = Object.entries(tmpDistinctManifest.Descriptors).find(([pKey, pValue]) => pValue.OriginalHash == 'AggregateValue')[0];
											tmpHashedAggregateValue2 = Object.entries(tmpDistinctManifest.Descriptors).find(([pKey, pValue]) => pValue.OriginalHash == 'AggregateValue2')[0];
											const tmpInjectedSecionViews = _Pict.views.PictFormMetacontroller.injectManifest(tmpDistinctManifest);
											_Pict.log.info('Injected Section Views:', tmpInjectedSecionViews.length);
											_Pict.views.PictFormMetacontroller.updateMetatemplateInDOM();
											setTimeout(() =>
											{
												for (const tmpView of tmpInjectedSecionViews)
												{
													tmpView.render();
												}
												for (const tmpView of tmpInjectedSecionViews)
												{
													tmpView.marshalToView();
												}
												//TODO: do we need to trigger a solve here?
											}, 0);
											_Pict.PictApplication.testDone = () =>
											{
												try
												{
													_Pict.log.info(`AppData after`, { AppData: _Pict.AppData, tmpHashedAggregateValue, tmpHashedAggregateValue2 });
													Expect(_Pict.AppData[tmpHashedAggregateValue]).to.equal('15', 'AggregateValue should equal 15 (SUM of ValueArray via hash)');
													Expect(_Pict.AppData[tmpHashedAggregateValue2]).to.equal('15', 'AggregateValue should equal 15 (SUM of ValueArray via address)');
												}
												catch (pError)
												{
													return fDone(pError);
												}
												fDone();
											};
											const [ tmpValueArrayKey, tmpValueArrayDescriptor ] = Object.entries(tmpDistinctManifest.Descriptors).find(([pKey, pDescriptor]) => pDescriptor.OriginalHash == 'ValueArray');
											const tmpAddress = tmpValueArrayDescriptor.DataAddress;
											_Pict.log.info('Setting up Distinct Array Test with address:', { tmpValueArrayKey, tmpValueArrayDescriptor, tmpAddress });
											const tmpArrayAddress = tmpAddress.substring(0, tmpAddress.indexOf('[]'));
											const tmpPropertyAddress = tmpAddress.substring(tmpAddress.indexOf('[]') + 3);
											_Pict.manifest.setValueByHash(_Pict.AppData, tmpArrayAddress,
												[
													{ [tmpPropertyAddress]: '1' },
													{ [tmpPropertyAddress]: '2' },
													{ [tmpPropertyAddress]: '3' },
													{ [tmpPropertyAddress]: '4' },
													{ [tmpPropertyAddress]: '5' },
												]);
											_Pict.PictApplication.solve();
										}
										catch (pError)
										{
											_Pict.log.error('Error during Distinct Array Test:', pError);
											return fDone(pError);
										}
									});
							}
						);
					test(
							'Distinct Array Test 3',
							(fDone) =>
							{
								//NOTE: code is a clone of Pict.safeLoadPictApplication
								let _Pict;
								const tmpApplicationClass = OrderedSolverApplication;
								if (tmpApplicationClass && ('default_configuration' in tmpApplicationClass) && ('pict_configuration' in tmpApplicationClass.default_configuration))
								{
									_Pict = new libPict(tmpApplicationClass.default_configuration.pict_configuration);
								}
								else
								{
									_Pict = new libPict();
								}

								//_Pict.LogNoisiness = 0;

								let tmpApplicationHash = 'DefaultApplication';
								let tmpDefaultConfiguration = {};

								if ('default_configuration' in tmpApplicationClass)
								{
									tmpDefaultConfiguration = tmpApplicationClass.default_configuration;

									if ('Hash' in tmpApplicationClass.default_configuration)
									{
										tmpDefaultConfiguration = tmpApplicationClass.default_configuration;
										tmpApplicationHash = tmpApplicationClass.default_configuration.Hash;
									}
								}
								_Pict.log.info(`Loading the pict application [${tmpApplicationHash}] and associated views.`);

								_Pict.addApplication(tmpApplicationHash, tmpDefaultConfiguration, tmpApplicationClass);

								// Add the pict form service
								_Pict.addServiceType('PictSectionForm', libPictSectionForm);

								// Add the pict form metacontroller service, which provides programmaatic view construction from manifests and render/marshal methods.
								_Pict.addView('PictFormMetacontroller', {}, libPictSectionForm.PictFormMetacontroller);

								const tmpManifest =
								{
									Scope: 'OrderedSolverApplicationForm',
									Descriptors:
									{
										'LevelOfIndirection.AggregateValueAddress':
										{
											Hash: 'IndirectAggregateValue',
											Name: 'Indirect Aggregate Value',
											DataAddress: 'LevelOfIndirection.AggregateValueAddress',
											DataType: 'PreciseNumber',
											FormGroup: 'DataTableGroup',
											FormSection: 'DataTableSection',
										},
										'LevelOfIndirection.DataTableAddress[].ValueAddress':
										{
											Hash: 'ValueArray',
											Name: 'Data Value',
											DataAddress: 'LevelOfIndirection.DataTableAddress[].ValueAddress',
											DataType: 'Array',
											FormGroup: 'DataTableGroup',
											FormSection: 'DataTableSection',
										},
										AggregateValueAddress:
										{
											Hash: 'AggregateValue',
											Name: 'Aggregate Value',
											DataAddress: 'AggregateValueAddress',
											DataType: 'PreciseNumber',
											FormGroup: 'DataTableGroup',
											FormSection: 'DataTableSection',
										},
										AggregateValueAddress2:
										{
											Hash: 'AggregateValue2',
											Name: 'Aggregate Value 2',
											DataAddress: 'AggregateValueAddress2',
											DataType: 'PreciseNumber',
											FormGroup: 'DataTableGroup',
											FormSection: 'DataTableSection',
										},
									},
									Sections:
									[
										{
											Name: 'Ordered Solver Section',
											Hash: 'OrderedSolverSection',
											Groups:
											[
												{
													Name: 'Group Name',
													Hash: 'GroupHash',
													RecordSetAddress: 'LevelOfIndirection.DataTableAddress',
												},
											],
											Solvers:
											[
												{ Ordinal: 5, Expression: 'AggregateValue = SUM(ValueArray)' },
												{ Ordinal: 40, Expression: 'AggregateValue2 = SUM(LevelOfIndirection.DataTableAddress[].ValueAddress)' },
												{ Ordinal: 60, Expression: 'IndirectAggregateValue = AggregateValue' },
											],
										},
									],
								};

								let tmpHashedAggregateValue = null;
								let tmpHashedAggregateValue2 = null;
								let tmpHashedAggregateValue3 = null;
								_Pict.PictApplication.initializeAsync(
									function (pError)
									{
										if (pError)
										{
											_Pict.log.info('Error initializing the pict application: '+pError)
										}

										try
										{
											_Pict.log.info('Loading the Application and associated views.');
											const tmpUUID = _Pict.getUUID().substring(0, 8);
											const tmpDistinctManifest = _Pict.views.PictFormMetacontroller.createDistinctManifest(tmpManifest, tmpUUID);
											_Pict.log.info('Distinct Manifest:', tmpDistinctManifest);
											Expect(tmpDistinctManifest.Sections[0].Groups[0].RecordSetAddress).to.equal(`LevelOfIndirection_${tmpUUID}.DataTableAddress`, 'Group RecordSetAddress should be preserved in distinct manifest.');
											tmpHashedAggregateValue = Object.entries(tmpDistinctManifest.Descriptors).find(([pKey, pValue]) => pValue.OriginalHash == 'AggregateValue')[0];
											tmpHashedAggregateValue2 = Object.entries(tmpDistinctManifest.Descriptors).find(([pKey, pValue]) => pValue.OriginalHash == 'AggregateValue2')[0];
											tmpHashedAggregateValue3 = Object.entries(tmpDistinctManifest.Descriptors).find(([pKey, pValue]) => pValue.OriginalHash == 'IndirectAggregateValue')[0];
											const tmpInjectedSecionViews = _Pict.views.PictFormMetacontroller.injectManifest(tmpDistinctManifest);
											_Pict.log.info('Injected Section Views:', tmpInjectedSecionViews.length);
											_Pict.views.PictFormMetacontroller.updateMetatemplateInDOM();
											setTimeout(() =>
											{
												for (const tmpView of tmpInjectedSecionViews)
												{
													tmpView.render();
												}
												for (const tmpView of tmpInjectedSecionViews)
												{
													tmpView.marshalToView();
												}
												//TODO: do we need to trigger a solve here?
											}, 0);
											_Pict.PictApplication.testDone = () =>
											{
												try
												{
													_Pict.log.info(`AppData after`, { AppData: _Pict.AppData, tmpHashedAggregateValue, tmpHashedAggregateValue2, tmpHashedAggregateValue3 });
													Expect(_Pict.AppData[tmpHashedAggregateValue]).to.equal('15', 'AggregateValue should equal 15 (SUM of ValueArray via hash)');
													Expect(_Pict.AppData[tmpHashedAggregateValue2]).to.equal('15', 'AggregateValue should equal 15 (SUM of ValueArray via address)');
													Expect(_Pict.manifest.getValueByHash(_Pict.AppData, tmpHashedAggregateValue3)).to.equal('15', 'IndirectAggregateValue should equal 15 (via indirection) using manifest method');
												}
												catch (pError)
												{
													return fDone(pError);
												}
												fDone();
											};
											const [ tmpValueArrayKey, tmpValueArrayDescriptor ] = Object.entries(tmpDistinctManifest.Descriptors).find(([pKey, pDescriptor]) => pDescriptor.OriginalHash == 'ValueArray');
											const tmpAddress = tmpValueArrayDescriptor.DataAddress;
											_Pict.log.info('Setting up Distinct Array Test with address:', { tmpValueArrayKey, tmpValueArrayDescriptor, tmpAddress });
											const tmpArrayAddress = tmpAddress.substring(0, tmpAddress.indexOf('[]'));
											const tmpPropertyAddress = tmpAddress.substring(tmpAddress.indexOf('[]') + 3);
											_Pict.manifest.setValueByHash(_Pict.AppData, tmpArrayAddress,
												[
													{ [tmpPropertyAddress]: '1' },
													{ [tmpPropertyAddress]: '2' },
													{ [tmpPropertyAddress]: '3' },
													{ [tmpPropertyAddress]: '4' },
													{ [tmpPropertyAddress]: '5' },
												]);
											_Pict.PictApplication.solve();
										}
										catch (pError)
										{
											_Pict.log.error('Error during Distinct Array Test:', pError);
											return fDone(pError);
										}
									});
							}
						);
					test(
							'Distinct Array Test 4',
							(fDone) =>
							{
								//NOTE: code is a clone of Pict.safeLoadPictApplication
								let _Pict;
								const tmpApplicationClass = OrderedSolverApplication;
								if (tmpApplicationClass && ('default_configuration' in tmpApplicationClass) && ('pict_configuration' in tmpApplicationClass.default_configuration))
								{
									_Pict = new libPict(tmpApplicationClass.default_configuration.pict_configuration);
								}
								else
								{
									_Pict = new libPict();
								}

								//_Pict.LogNoisiness = 0;

								let tmpApplicationHash = 'DefaultApplication';
								let tmpDefaultConfiguration = {};

								if ('default_configuration' in tmpApplicationClass)
								{
									tmpDefaultConfiguration = tmpApplicationClass.default_configuration;

									if ('Hash' in tmpApplicationClass.default_configuration)
									{
										tmpDefaultConfiguration = tmpApplicationClass.default_configuration;
										tmpApplicationHash = tmpApplicationClass.default_configuration.Hash;
									}
								}
								_Pict.log.info(`Loading the pict application [${tmpApplicationHash}] and associated views.`);

								_Pict.addApplication(tmpApplicationHash, tmpDefaultConfiguration, tmpApplicationClass);

								// Add the pict form service
								_Pict.addServiceType('PictSectionForm', libPictSectionForm);

								// Add the pict form metacontroller service, which provides programmaatic view construction from manifests and render/marshal methods.
								_Pict.addView('PictFormMetacontroller', {}, libPictSectionForm.PictFormMetacontroller);

								const tmpManifest =
								{
									Scope: 'OrderedSolverApplicationForm',
									Descriptors:
									{
										'LevelOfIndirection.DataTableAddress':
										{
											Hash: 'NestedDataTable',
											Name: 'Nested Data Table',
											DataAddress: 'LevelOfIndirection.DataTableAddress',
											DataType: 'Array',
											FormGroup: 'DataTableGroup',
											FormSection: 'DataTableSection',
										},
										'LevelOfIndirection.AggregateValueAddress':
										{
											Hash: 'IndirectAggregateValue',
											Name: 'Indirect Aggregate Value',
											DataAddress: 'LevelOfIndirection.AggregateValueAddress',
											DataType: 'PreciseNumber',
											FormGroup: 'DataTableGroup',
											FormSection: 'DataTableSection',
										},
										'LevelOfIndirection.DataTableAddress[].ValueAddress':
										{
											Hash: 'ValueArray',
											Name: 'Data Value',
											DataAddress: 'LevelOfIndirection.DataTableAddress[].ValueAddress',
											DataType: 'Array',
											FormGroup: 'DataTableGroup',
											FormSection: 'DataTableSection',
										},
										AggregateValueAddress:
										{
											Hash: 'AggregateValue',
											Name: 'Aggregate Value',
											DataAddress: 'AggregateValueAddress',
											DataType: 'PreciseNumber',
											FormGroup: 'DataTableGroup',
											FormSection: 'DataTableSection',
										},
										AggregateValueAddress2:
										{
											Hash: 'AggregateValue2',
											Name: 'Aggregate Value 2',
											DataAddress: 'AggregateValueAddress2',
											DataType: 'PreciseNumber',
											FormGroup: 'DataTableGroup',
											FormSection: 'DataTableSection',
										},
									},
									Sections:
									[
										{
											Name: 'Ordered Solver Section',
											Hash: 'OrderedSolverSection',
											Groups:
											[
												{
													Name: 'Group Name',
													Hash: 'GroupHash',
													RecordSetAddress: 'LevelOfIndirection.DataTableAddress',
												},
											],
											Solvers:
											[
												{ Ordinal: 5, Expression: 'AggregateValue = SUM(ValueArray)' },
												{ Ordinal: 40, Expression: 'AggregateValue2 = SUM(LevelOfIndirection.DataTableAddress[].ValueAddress)' },
												{ Ordinal: 60, Expression: 'IndirectAggregateValue = AggregateValue' },
											],
										},
									],
								};

								let tmpHashedAggregateValue = null;
								let tmpHashedAggregateValue2 = null;
								let tmpHashedAggregateValue3 = null;
								_Pict.PictApplication.initializeAsync(
									function (pError)
									{
										if (pError)
										{
											_Pict.log.info('Error initializing the pict application: '+pError)
										}

										try
										{
											_Pict.log.info('Loading the Application and associated views.');
											const tmpUUID = _Pict.getUUID().substring(0, 8);
											const tmpDistinctManifest = _Pict.views.PictFormMetacontroller.createDistinctManifest(tmpManifest, tmpUUID);
											_Pict.log.info('Distinct Manifest:', tmpDistinctManifest);
											Expect(tmpDistinctManifest.Sections[0].Groups[0].RecordSetAddress).to.equal(`LevelOfIndirection_${tmpUUID}.DataTableAddress`, 'Group RecordSetAddress should be preserved in distinct manifest.');
											tmpHashedAggregateValue = Object.entries(tmpDistinctManifest.Descriptors).find(([pKey, pValue]) => pValue.OriginalHash == 'AggregateValue')[0];
											tmpHashedAggregateValue2 = Object.entries(tmpDistinctManifest.Descriptors).find(([pKey, pValue]) => pValue.OriginalHash == 'AggregateValue2')[0];
											tmpHashedAggregateValue3 = Object.entries(tmpDistinctManifest.Descriptors).find(([pKey, pValue]) => pValue.OriginalHash == 'IndirectAggregateValue')[0];
											const tmpInjectedSecionViews = _Pict.views.PictFormMetacontroller.injectManifest(tmpDistinctManifest);
											_Pict.log.info('Injected Section Views:', tmpInjectedSecionViews.length);
											_Pict.views.PictFormMetacontroller.updateMetatemplateInDOM();
											setTimeout(() =>
											{
												for (const tmpView of tmpInjectedSecionViews)
												{
													tmpView.render();
												}
												for (const tmpView of tmpInjectedSecionViews)
												{
													tmpView.marshalToView();
												}
												//TODO: do we need to trigger a solve here?
											}, 0);
											_Pict.PictApplication.testDone = () =>
											{
												try
												{
													_Pict.log.info(`AppData after`, { AppData: _Pict.AppData, tmpHashedAggregateValue, tmpHashedAggregateValue2, tmpHashedAggregateValue3 });
													Expect(_Pict.AppData[tmpHashedAggregateValue]).to.equal('15', 'AggregateValue should equal 15 (SUM of ValueArray via hash)');
													Expect(_Pict.AppData[tmpHashedAggregateValue2]).to.equal('15', 'AggregateValue should equal 15 (SUM of ValueArray via address)');
													Expect(_Pict.manifest.getValueByHash(_Pict.AppData, tmpHashedAggregateValue3)).to.equal('15', 'IndirectAggregateValue should equal 15 (via indirection) using manifest method');
												}
												catch (pError)
												{
													return fDone(pError);
												}
												fDone();
											};
											const [ tmpValueArrayKey, tmpValueArrayDescriptor ] = Object.entries(tmpDistinctManifest.Descriptors).find(([pKey, pDescriptor]) => pDescriptor.OriginalHash == 'ValueArray');
											const tmpAddress = tmpValueArrayDescriptor.DataAddress;
											_Pict.log.info('Setting up Distinct Array Test with address:', { tmpValueArrayKey, tmpValueArrayDescriptor, tmpAddress });
											const tmpArrayAddress = tmpAddress.substring(0, tmpAddress.indexOf('[]'));
											const tmpPropertyAddress = tmpAddress.substring(tmpAddress.indexOf('[]') + 3);
											_Pict.manifest.setValueByHash(_Pict.AppData, tmpArrayAddress,
												[
													{ [tmpPropertyAddress]: '1' },
													{ [tmpPropertyAddress]: '2' },
													{ [tmpPropertyAddress]: '3' },
													{ [tmpPropertyAddress]: '4' },
													{ [tmpPropertyAddress]: '5' },
												]);
											_Pict.PictApplication.solve();
										}
										catch (pError)
										{
											_Pict.log.error('Error during Distinct Array Test:', pError);
											return fDone(pError);
										}
									});
							}
						);
					test(
							'Solve Ordinals',
							(fDone) =>
							{
								//NOTE: code is a clone of Pict.safeLoadPictApplication
								let _Pict;
								const tmpApplicationClass = OrderedSolverApplication;
								if (tmpApplicationClass && ('default_configuration' in tmpApplicationClass) && ('pict_configuration' in tmpApplicationClass.default_configuration))
								{
									_Pict = new libPict(tmpApplicationClass.default_configuration.pict_configuration);
								}
								else
								{
									_Pict = new libPict();
								}

								//_Pict.LogNoisiness = 0;

								let tmpApplicationHash = 'DefaultApplication';
								let tmpDefaultConfiguration = {};

								if ('default_configuration' in tmpApplicationClass)
								{
									tmpDefaultConfiguration = tmpApplicationClass.default_configuration;

									if ('Hash' in tmpApplicationClass.default_configuration)
									{
										tmpDefaultConfiguration = tmpApplicationClass.default_configuration;
										tmpApplicationHash = tmpApplicationClass.default_configuration.Hash;
									}
								}
								_Pict.log.info(`Loading the pict application [${tmpApplicationHash}] and associated views.`);

								_Pict.addApplication(tmpApplicationHash, tmpDefaultConfiguration, tmpApplicationClass);

								_Pict.PictApplication.testDone = () =>
								{
									try
									{
										Expect(_Pict.AppData.C).to.equal('8', 'C should equal 8 (A + B)');
										Expect(_Pict.AppData.D).to.equal('5', 'D should equal 5 (C - B)');
									}
									catch (pError)
									{
										return fDone(pError);
									}
									fDone();
								};

								_Pict.PictApplication.initializeAsync(
									function (pError)
									{
										if (pError)
										{
											_Pict.log.info('Error initializing the pict application: '+pError)
										}
										_Pict.log.info('Loading the Application and associated views.');
									});

								// This needs to be explicitly called now that we turned off auto solve
								_Pict.PictApplication.solve();
							}
						);
					test(
							'Disable Solve Ordinals',
							(fDone) =>
							{
								//NOTE: code is a clone of Pict.safeLoadPictApplication
								let _Pict;
								const tmpApplicationClass = OrderedSolverApplication;
								OrderedSolverApplication.default_configuration.pict_configuration.DefaultFormManifest.Sections[0].Solvers.splice(1, 0, { Ordinal: 15, Expression: 'setSolverOrdinalEnabled(40, 0)' });
								if (tmpApplicationClass && ('default_configuration' in tmpApplicationClass) && ('pict_configuration' in tmpApplicationClass.default_configuration))
								{
									_Pict = new libPict(tmpApplicationClass.default_configuration.pict_configuration);
								}
								else
								{
									_Pict = new libPict();
								}

								//_Pict.LogNoisiness = 0;

								let tmpApplicationHash = 'DefaultApplication';
								let tmpDefaultConfiguration = {};

								if ('default_configuration' in tmpApplicationClass)
								{
									tmpDefaultConfiguration = tmpApplicationClass.default_configuration;

									if ('Hash' in tmpApplicationClass.default_configuration)
									{
										tmpDefaultConfiguration = tmpApplicationClass.default_configuration;
										tmpApplicationHash = tmpApplicationClass.default_configuration.Hash;
									}
								}
								_Pict.log.info(`Loading the pict application [${tmpApplicationHash}] and associated views.`);

								_Pict.addApplication(tmpApplicationHash, tmpDefaultConfiguration, tmpApplicationClass);

								_Pict.PictApplication.testDone = () =>
								{
									try
									{
										Expect(_Pict.AppData.C).to.equal('8', 'C should equal 8 (A + B)');
										Expect(_Pict.AppData.D).to.not.exist;
									}
									catch (pError)
									{
										return fDone(pError);
									}
									fDone();
								};

								_Pict.PictApplication.initializeAsync(
									function (pError)
									{
										if (pError)
										{
											_Pict.log.info('Error initializing the pict application: '+pError)
										}
										_Pict.log.info('Loading the Application and associated views.');
									});

								// This needs to be explicitly called now that we turned off auto solve
								_Pict.PictApplication.solve();
							}
						);
				}
			);
	}
);
