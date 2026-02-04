# Simple Form Example

The Simple Form example is the most basic forms application in the Pict Section Form
framework. It demonstrates core concepts including form layout, calculated fields,
conditional visibility, and dynamic styling.

## What This Example Demonstrates

- **Rectangular Area Calculator**: A micro-app that calculates area by multiplying
  height × width
- **Form Sections and Groups**: Organizing inputs across multiple sections with
  visibility controls
- **Solver Expressions**: Automatic calculations triggered when inputs change
- **Dynamic UI Controls**: Conditional visibility of sections and groups based on
  calculated values
- **Data Type Marshaling**: Different numeric display formats (PreciseNumber,
  formatted numbers with prefixes/postfixes)
- **Custom CSS Styling**: Applying custom styles to sections
- **Meta-templates**: Adding custom HTML and interactive elements

## Key Files

- `Simple-Form-Application.js` - Main application entry point
- `Simple-Form_Default_Manifest.json` - Form configuration manifest
- `html/index.html` - HTML template

## Configuration Highlights

### Sections

The manifest defines multiple sections:
- **Area**: Main calculator section with custom purple heading CSS
- **Marshaling**: Demonstrates data type rendering (hidden when Area < 10,000)
- **DisplayControl**: Controls visibility of other sections via string parsing
- **SectionA-E**: Template sections for dynamic show/hide functionality

### Solvers

The example includes 11 solver expressions:

```json
"Solvers": [
  "Area = Height * Width",
  "WidthCubeArea = Width ^ 3",
  "HeightCubeArea = Height ^ 3",
  "SetGroupVisibility('Area', 'Help', Height > 99)",
  "SetSectionVisibility('Marshaling', ITPRO >= 10000)",
  "ColorSectionBackground('Marshaling', '#ff00ff')",
  "ColorGroupBackground('Area', 'Help', ContentBackgroundColor)"
]
```

### Custom CSS in Sections

```json
{
  "Hash": "Area",
  "Name": "Area",
  "CustomCSS": "h3 { color: #ff00ff; font-size: 1.5em; }"
}
```

### Meta-Templates

Custom HTML injection with interactive elements:

```json
"MetaTemplates": [{
  "HashPostfix": "-Template-Wrap-Prefix",
  "Template": "<h1>Rectangular Area Solver Micro-app</h1><div><a href=\"#\" onclick=\"{~P~}.PictApplication.solve()\">[ solve ]</a> <a href=\"#\" onclick=\"{~P~}.views.PictFormMetacontroller.showSupportViewInlineEditor()\">[ debug ]</a></div><hr />"
}]
```

## Descriptor Examples

### Basic Numeric Input with Default

```json
"Width": {
  "Name": "Width",
  "Hash": "Width",
  "DataType": "Number",
  "Default": 100,
  "PictForm": { "Section": "Area", "Row": 2, "Width": 1 }
}
```

### Readonly Display with Formatting

```json
"ITPNRO": {
  "Name": "InputType PreciseNumberReadOnly",
  "Hash": "ITPNRO",
  "DataType": "PreciseNumber",
  "PictForm": {
    "InputType": "PreciseNumberReadOnly",
    "DecimalPrecision": 2,
    "AddCommas": false,
    "DigitsPrefix": "$",
    "DigitsPostfix": " (estimated)",
    "Section": "Marshaling",
    "Row": 1,
    "Width": 3
  }
}
```

### HTML Content Input

```json
"Help.Content": {
  "Name": "Area of a Rectangle",
  "InputType": "HTML",
  "Default": "<p>To calculate the area of a rectangle...</p>"
}
```

### Color Picker Input

```json
"ContentBackgroundColor": {
  "Name": "Content Background Color",
  "InputType": "Color",
  "Default": "#FFFFEE"
}
```

## Running the Example

```bash
cd example_applications/simple_form
npm install
npm run build
# Open html/index.html in a browser
```

## Key Concepts Illustrated

1. **Manifest-Driven Forms**: The entire form structure is defined in JSON
2. **Two-Way Data Binding**: Changes automatically propagate between UI and data
3. **Expression Solver**: Mathematical and logical expressions compute values
4. **Visibility Control**: Show/hide sections based on data conditions
5. **Template Customization**: Inject custom HTML without modifying core code
