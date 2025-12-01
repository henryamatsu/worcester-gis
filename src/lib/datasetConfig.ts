export type DatasetFile = {
  path: string;
  propertyValue: string;
};

export type DatasetConfig = {
  id: string;
  name: string;
  propertyKey: string; // possibly don't need anymore
  files: DatasetFile[];
  colors: Record<string, [number, number, number, number]>;
  weights: Record<string, number>;
  percentages: Record<string, number>; // Percentage distribution for pie chart
  aggregatedDataPath?: string; // Path to pre-aggregated town-level data
};

export const datasets: Record<string, DatasetConfig> = {
  battery: {
    id: "battery",
    name: "Battery Analysis",
    propertyKey: "Class",
    aggregatedDataPath:
      "/data/Battery_analysis/Battery_aggregated_suitability_scored.json",
    files: [
      {
        path: "/data/Battery_analysis/Battery_analysis_wgs84_Very_Low_stripped.geojson",
        propertyValue: "Very Low",
      },
      {
        path: "/data/Battery_analysis/Battery_analysis_wgs84_Low_stripped.geojson",
        propertyValue: "Low",
      },
      {
        path: "/data/Battery_analysis/Battery_analysis_wgs84_Moderate_stripped.geojson",
        propertyValue: "Moderate",
      },
      {
        path: "/data/Battery_analysis/Battery_analysis_wgs84_High_stripped.geojson",
        propertyValue: "High",
      },
      {
        path: "/data/Battery_analysis/Battery_analysis_wgs84_Very_High_stripped.geojson",
        propertyValue: "Very High",
      },
    ],
    colors: {
      "Very Low": [255, 255, 204, 100],
      Low: [255, 237, 160, 100],
      Moderate: [254, 217, 118, 100],
      High: [252, 141, 89, 100],
      "Very High": [215, 48, 39, 100],
    },
    weights: {
      "Very Low": 1,
      Low: 2,
      Moderate: 3,
      High: 4,
      "Very High": 5,
    },
    percentages: {
      "Very Low": 19.94,
      Low: 20.05,
      Moderate: 19.77,
      High: 20.22,
      "Very High": 20.03,
    },
  },
  solar: {
    id: "solar",
    name: "Solar Analysis",
    propertyKey: "Class",
    aggregatedDataPath:
      "/data/Solar_analysis/Roof_solar_aggregated_suitability_scored.json",
    files: [
      {
        path: "/data/Solar_analysis/Roof_solar_suitability_OK_wgs84_Very_Low_S_stripped.geojson",
        propertyValue: "Very Low",
      },
      {
        path: "/data/Solar_analysis/Roof_solar_suitability_OK_wgs84_Low_Suitab_stripped.geojson",
        propertyValue: "Low",
      },
      {
        path: "/data/Solar_analysis/Roof_solar_suitability_OK_wgs84_Moderate_S_stripped.geojson",
        propertyValue: "Moderate",
      },
      {
        path: "/data/Solar_analysis/Roof_solar_suitability_OK_wgs84_High_Suita_stripped.geojson",
        propertyValue: "High",
      },
      {
        path: "/data/Solar_analysis/Roof_solar_suitability_OK_wgs84_Very_High_stripped.geojson",
        propertyValue: "Very High",
      },
    ],
    colors: {
      "Very Low": [255, 255, 255, 150],
      Low: [222, 235, 247, 150],
      Moderate: [198, 219, 239, 150],
      High: [158, 202, 225, 150],
      "Very High": [33, 113, 181, 150],
    },
    weights: {
      "Very Low": 1,
      Low: 2,
      Moderate: 3,
      High: 4,
      "Very High": 5,
    },
    percentages: {
      "Very Low": 19.96,
      Low: 20.02,
      Moderate: 20.11,
      High: 19.56,
      "Very High": 20.36,
    },
  },
};
