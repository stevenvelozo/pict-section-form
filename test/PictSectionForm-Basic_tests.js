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
		this?._testDone?.();
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
											console.log('Error initializing the pict application: '+pError)
										}
										_Pict.log.info('Loading the Application and associated views.');
									});
							}
						);
				}
			);
	}
);
