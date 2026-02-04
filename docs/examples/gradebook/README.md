# Gradebook Example

The Gradebook example (branded as "Grademaster 2000") demonstrates a complete
classroom management application with tabular data entry, persistent storage,
and multiple reference manifests.

## What This Example Demonstrates

- **Multiple Tabular Groups**: Student roster and assignment list in one section
- **localStorage Persistence**: Browser-based data storage with save/load
- **Reference Manifests**: Separate schema definitions for students and assignments
- **Default Row Data**: Pre-populated assignment data with realistic values
- **Row Constraints**: Minimum and maximum row counts for tables
- **Content Views**: About and Legal pages as JSON-configured views

## Key Files

- `source/Gradebook-Application.js` - Main application class
- `source/manifests/Gradebook-Manifest.js` - Main form manifest
- `source/manifests/Student-Manifest.json` - Student field definitions
- `source/manifests/Assignment-Manifest.json` - Assignment field definitions
- `source/providers/Gradebook-Data.js` - localStorage data provider
- `html/index.html` - HTML template

## Configuration Highlights

### Main Manifest with Tabular Groups

```javascript
{
  "Scope": "Gradebook",
  "Sections": [{
    "Hash": "ClassManagement",
    "Name": "My Classroom",
    "Groups": [
      {
        "Hash": "StudentList",
        "Name": "Student List",
        "Layout": "Tabular",
        "MinimumRowCount": 5,
        "MaximumRowCount": 15,
        "RecordSetAddress": "StudentList",
        "RecordManifest": "Student"
      },
      {
        "Hash": "AssignmentList",
        "Name": "Assignment List",
        "Layout": "Tabular",
        "MinimumRowCount": 5,
        "MaximumRowCount": 15,
        "DefaultRows": [/* 10 pre-populated assignments */],
        "RecordSetAddress": "AssignmentList",
        "RecordManifest": "Assignment"
      }
    ]
  }]
}
```

### Student Reference Manifest

```json
{
  "Scope": "Student",
  "Descriptors": {
    "StudentName": {
      "Name": "Full Name",
      "Hash": "StudentName",
      "DataType": "String",
      "Default": "(unnamed student)"
    },
    "StudentID": {
      "Name": "Learning Style",
      "Hash": "StudentID",
      "DataType": "String",
      "Default": "Visual"
    },
    "ShoeSize": {
      "Name": "Shoe Size",
      "Hash": "ShoeSize",
      "DataType": "Number",
      "Default": 7.5
    },
    "StudentAge": {
      "Name": "Age",
      "Hash": "StudentAge",
      "DataType": "Number"
    }
  }
}
```

### Assignment Reference Manifest

```json
{
  "Scope": "Assignment",
  "Descriptors": {
    "Title": {
      "Name": "Title",
      "Hash": "Title",
      "DataType": "String",
      "Default": "(unnamed assignment)",
      "PictForm": { "ReadOnly": true }
    },
    "Weight": {
      "Name": "Weight",
      "Hash": "Weight",
      "DataType": "String",
      "Default": "1.0"
    },
    "Points": {
      "Name": "Points",
      "Hash": "Points",
      "DataType": "String",
      "Default": "100"
    }
  }
}
```

### Default Assignment Data

```javascript
"DefaultRows": [
  {"Title": "Assignment 1: Addition", "Points": 425, "Weight": 0.25},
  {"Title": "Assignment 2: Subtraction", "Weight": 0.95},
  {"Title": "Assignment 3: Multiplication", "Points": 125, "Weight": 0.75},
  // ... through Assignment 10: Quantum Physics
]
```

### Data Provider with localStorage

```javascript
class ManyfestDataProvider extends libFableServiceProviderBase {
  onInitialize() {
    this.AppData.StudentList = [];
    this.AppData.AssignmentList = [];
    this.loadData();
  }

  saveData() {
    this.storageProvider.setItem('StudentList',
      JSON.stringify(this.pict.AppData.StudentList));
    this.storageProvider.setItem('AssignmentList',
      JSON.stringify(this.pict.AppData.AssignmentList));
  }

  loadData() {
    let tmpStudentJSON = this.storageProvider.getItem('StudentList');
    if (tmpStudentJSON) {
      this.pict.AppData.StudentList = JSON.parse(tmpStudentJSON);
    }
    let tmpAssignmentJSON = this.storageProvider.getItem('AssignmentList');
    if (tmpAssignmentJSON) {
      this.pict.AppData.AssignmentList = JSON.parse(tmpAssignmentJSON);
    }
  }
}
```

### Application Bootstrap

```javascript
class Gradebook extends libPictSectionForm.PictFormApplication {
  constructor(pFable, pOptions, pServiceHash) {
    super(pFable, pOptions, pServiceHash);
    this.pict.addProvider('Gradebook-Data-Provider', {},
      require('./providers/Gradebook-Data.js'));
  }
}
```

## Running the Example

```bash
cd example_applications/gradebook
npm install
npm run build
# Open html/index.html in a browser
```

## Key Concepts Illustrated

1. **Multi-Table Sections**: Multiple tabular groups sharing one section
2. **Persistent Storage**: localStorage integration for browser-based persistence
3. **Reference Manifests**: Modular schema definitions for reuse
4. **Default Data**: Pre-populated tables with sample data
5. **Row Constraints**: Enforcing minimum/maximum row counts
