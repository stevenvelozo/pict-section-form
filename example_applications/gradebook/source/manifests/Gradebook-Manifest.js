module.exports = (
{
	"Scope": "Gradebook",

	"Sections": [
		{
			"Hash": "ClassManagement",
			"Name": "Class",
			"Groups": [
				{
					"Hash": "StudentList",
					"Name": "My Classroom",

					"Layout": "Tabular",
					"RecordSetAddress": "StudentList",
					"RecordManifest": "Student"
				}
			]
		},
	],

	"Descriptors":
	{
		"Students":
			{
				"Name": "Student Roster",
				"Hash": "StudentData",
				"DataType": "Array",
				"Default": []
				, "PictForm": { "Section":"ClassManagement", "Group":"StudentList" }
			}
	},

	"ReferenceManifests":
	{
		"Student": require(`./Student-Manifest.json`),
		"Assignment": require(`./Assignment-Manifest.json`)
	}
});