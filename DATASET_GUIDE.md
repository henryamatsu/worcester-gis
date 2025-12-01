# Dataset Configuration Guide

This guide explains how to add new datasets to the GIS map application.

## Adding a New Dataset

To add a new dataset, edit `src/lib/datasetConfig.ts` and add a new entry to the `datasets` object.

### Example: Adding a Solar Panel Dataset

```typescript
export const datasets: Record<string, DatasetConfig> = {
  battery: {
    // ... existing battery config
  },
  solar: {
    id: "solar",
    name: "Solar Panel Analysis",
    propertyKey: "Capacity", // The property name in your GeoJSON features
    files: [
      {
        path: "/data/Solar_analysis/Solar_wgs84_Small.json",
        propertyValue: "Small", // The value of the property for this file
      },
      {
        path: "/data/Solar_analysis/Solar_wgs84_Medium.json",
        propertyValue: "Medium",
      },
      {
        path: "/data/Solar_analysis/Solar_wgs84_Large.json",
        propertyValue: "Large",
      },
    ],
    colors: {
      Small: [255, 255, 200, 150],   // RGBA values
      Medium: [255, 200, 100, 150],
      Large: [255, 150, 0, 150],
    },
    weights: {
      Small: 1,    // Used for elevation and color aggregation
      Medium: 2,
      Large: 3,
    },
  },
};
```

## Dataset Configuration Fields

### `id` (string)
- Unique identifier for the dataset
- Used internally to reference the dataset

### `name` (string)
- Display name shown in the dropdown menu
- Should be human-readable

### `propertyKey` (string)
- The property name in your GeoJSON features that contains the classification
- Example: "Class", "Type", "Capacity", "Risk", etc.
- This is displayed as the header above the checkboxes

### `files` (array)
- Array of file configurations
- Each file should contain features with the same property value

#### File Configuration:
- `path`: Path to the GeoJSON file (relative to public directory)
- `propertyValue`: The value of the property that this file represents

### `colors` (object)
- Maps property values to RGBA colors
- Format: `[red, green, blue, alpha]`
- RGB values: 0-255
- Alpha value: 0-255 (0 = transparent, 255 = opaque)

### `weights` (object)
- Maps property values to numeric weights
- Used for:
  - Color aggregation (determines hexagon color intensity)
  - Elevation (determines hexagon height)
- Higher weights = taller hexagons and more intense colors

## GeoJSON Format Requirements

Your GeoJSON files should follow this structure:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [longitude, latitude]
      },
      "properties": {
        "YourPropertyKey": "PropertyValue",
        // ... other properties
      }
    }
  ]
}
```

## Tips

1. **Consistent Property Keys**: All files in a dataset should use the same property key
2. **Color Selection**: Choose colors that provide good visual contrast
3. **Weight Distribution**: Use a logical progression (1, 2, 3, 4, 5) for weights
4. **File Organization**: Keep related files in the same directory
5. **Testing**: After adding a dataset, test all checkbox combinations to ensure proper loading

## How It Works

1. User selects a dataset from the dropdown
2. Checkboxes appear for each file in the dataset
3. When checkboxes are toggled, the map loads only the selected files
4. Features are aggregated into hexagons
5. Colors and elevations are calculated based on the weights and colors you defined

