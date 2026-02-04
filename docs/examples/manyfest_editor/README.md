# Manyfest Editor Example

The Manyfest Editor is a sophisticated manifest/schema management tool that
demonstrates building a configuration editing application using Pict Section Form.
It enables creating, editing, saving, and loading manifest configurations.

## What This Example Demonstrates

- **Form-Driven Manifest Editing**: Edit data schemas through forms
- **Multiple View Paradigms**: Form editor, tabular grid, JSON code editor, overview
- **Persistent Storage**: localStorage-based save/load functionality
- **Client-Side Routing**: Hash-based navigation between views
- **TuiGrid Integration**: Advanced spreadsheet-style editing
- **Dynamic View Switching**: Same data displayed in different formats

## Key Files

- `application/Manyfest-Editor.js` - Main application class
- `manifests/Manifest-Manyfest.json` - Manifest editing schema
- `manifests/Manifest-Default.json` - Default manifest template
- `providers/Manyfest-Router.js` - Hash-based routing
- `providers/Manyfest-Data-Provider.js` - localStorage persistence
- `views/Manyfest-Code-View.js` - JSON editor view
- `views/Manyfest-Overview-View.js` - Overview display

## Configuration Highlights

### Main Manifest Structure

```json
{
  "Scope": "Manyfest",
  "Sections": [
    {
      "Hash": "MainManyfest",
      "Name": "Main Manyfest Data",
      "Groups": [{ "Hash": "Description", "Name": "Description" }]
    },
    {
      "Hash": "ManyfestSections",
      "Name": "Form Interface Sections",
      "Groups": [{
        "Hash": "FormSections",
        "Layout": "Tabular",
        "RecordSetAddress": "ManyfestRecord.Sections",
        "RecordManifest": "ManyfestSection"
      }]
    },
    {
      "Hash": "ManyfestDescriptors",
      "Name": "Data Descriptors",
      "Groups": [{
        "Hash": "DescriptorGrid",
        "Layout": "Tabular",
        "RecordSetAddress": "ManyfestRecord.Descriptors",
        "RecordManifest": "ManyfestDescriptor"
      }]
    },
    {
      "Hash": "ManyfestTabular",
      "Name": "Tabular Manyfest Representation",
      "IncludeInDefaultDynamicRender": false,
      "Groups": [{
        "Hash": "ManyfestTabular",
        "Layout": "TuiGrid",
        "RecordSetAddress": "ManyfestRecord.Descriptors",
        "RecordManifest": "ManyfestTabular"
      }]
    }
  ]
}
```

### Descriptor Reference Manifest

```json
{
  "Scope": "ManyfestDescriptor",
  "Descriptors": {
    "Name": {
      "Name": "Data Property Name",
      "Hash": "Name",
      "DataType": "String"
    },
    "DataType": {
      "Name": "Data Type",
      "Hash": "DataType",
      "DataType": "String",
      "PictForm": {
        "InputType": "SelectList",
        "SelectOptions": [
          "String", "Integer", "Float", "Number",
          "Boolean", "DateTime", "Array", "Object", "Null"
        ]
      }
    },
    "Default": {
      "Name": "Default Value",
      "Hash": "DefaultValue",
      "DataType": "String"
    }
  }
}
```

### Router Configuration

```javascript
class ManyfestRouter extends libFableServiceProviderBase {
  onInitialize() {
    this.router = new Navigo('/');

    this.router.on('/Manyfest/Overview/:Scope', (pData) => {
      this.pict.views.ManyfestOverview.render();
    });

    this.router.on('/Manyfest/Save/:Scope', (pData) => {
      this.pict.providers.DataProvider.saveManyfest();
    });

    this.router.on('/Manyfest/Load/:Scope', (pData) => {
      this.pict.providers.DataProvider.loadManyfest(pData.data.Scope);
    });

    this.router.resolve();
  }
}
```

### JSON Editor Integration

```javascript
class ManyfestCodeView extends libPictView {
  onAfterRender() {
    let tmpEditorContainer = this.pict.ContentAssignment
      .getElement("#manyfest-jsoneditor");
    this.jsonEditor = new JSONEditor(tmpEditorContainer, {});
    this.jsonEditor.set(this.pict.AppData);
  }

  onMarshalFromView() {
    let tmpCode = this.jsonEditor.get();
    this.pict.AppData = JSON.parse(tmpCode);
  }
}
```

### Data Provider Pattern

```javascript
class ManyfestDataProvider extends libFableServiceProviderBase {
  get ManyfestMetaDataKey() {
    return 'Manyfest_Meta';
  }

  ManyfestScopedDataKey(pScope) {
    return `Manyfest_Scoped_As_${pScope}`;
  }

  listManyfests() {
    let tmpMetaData = JSON.parse(
      this.storageProvider.getItem(this.ManyfestMetaDataKey) || '{}'
    );
    return tmpMetaData.Scopes || [];
  }

  saveManyfest() {
    let tmpScope = this.pict.AppData.ManyfestRecord.Scope;
    this.storageProvider.setItem(
      this.ManyfestScopedDataKey(tmpScope),
      JSON.stringify(this.pict.AppData.ManyfestRecord)
    );
  }
}
```

### Dynamic Template Rendering

```javascript
{
  "Template": "{~TS:Manyfest-LoadList-Entry-Template:Context[0].pict.providers.DataProvider.listManyfests()~}"
}
```

## Running the Example

```bash
cd example_applications/manyfest_editor
npm install
npm run build
# Open html/index.html in a browser
```

## Key Concepts Illustrated

1. **Meta-Configuration**: Using forms to edit form configurations
2. **Multiple View Types**: Form, table, JSON editor for same data
3. **Routing**: Hash-based navigation with Navigo
4. **Persistence**: localStorage with metadata tracking
5. **TuiGrid**: Advanced tabular editing capabilities
