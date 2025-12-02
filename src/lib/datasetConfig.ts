export type DatasetFile = {
  path: string;
  propertyValue: string;
};

export type DatasetConfig = {
  id: string;
  name: string;
  propertyKey: string;
  files: DatasetFile[];
  colors: Record<string, [number, number, number, number]>;
  weights: Record<string, number>;
  percentages: Record<string, number>;
  aggregatedDataPath?: string;
  legendInfo: {
    totalEntries: number;
    reportPath: string;
    description: string;
  };
};

function gradientColors(
  start: [number, number, number],
  end: [number, number, number],
  steps: number,
  alpha: number = 100
) {
  const result: [number, number, number, number][] = [];
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const r = Math.round(start[0] + t * (end[0] - start[0]));
    const g = Math.round(start[1] + t * (end[1] - start[1]));
    const b = Math.round(start[2] + t * (end[2] - start[2]));
    result.push([r, g, b, alpha]);
  }
  return result;
}

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
    colors: (() => {
      const lightBlue: [number, number, number] = [200, 200, 255]; // vibrant light blue
      const darkBlue: [number, number, number] = [50, 50, 200]; // deep blue
      const gradient = gradientColors(lightBlue, darkBlue, 5, 200);
      return {
        "Very Low": gradient[0],
        Low: gradient[1],
        Moderate: gradient[2],
        High: gradient[3],
        "Very High": gradient[4],
      };
    })(),
    weights: { "Very Low": 1, Low: 2, Moderate: 3, High: 4, "Very High": 5 },
    percentages: {
      "Very Low": 19.94,
      Low: 20.05,
      Moderate: 19.77,
      High: 20.22,
      "Very High": 20.03,
    },
    legendInfo: {
      totalEntries: 319619,
      reportPath: "/data/reports/battery_storage_report.pdf",
      description:
        "Analyzes potential locations for battery energy storage systems across Worcester County based on proximity to infrastructure, land use, and grid connectivity.",
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
    colors: (() => {
      const yellow: [number, number, number] = [255, 200, 0]; // light red
      const darkRed: [number, number, number] = [150, 0, 0]; // bright red
      const gradient = gradientColors(yellow, darkRed, 5, 200);
      return {
        "Very Low": gradient[0],
        Low: gradient[1],
        Moderate: gradient[2],
        High: gradient[3],
        "Very High": gradient[4],
      };
    })(),
    weights: { "Very Low": 1, Low: 2, Moderate: 3, High: 4, "Very High": 5 },
    percentages: {
      "Very Low": 19.96,
      Low: 20.02,
      Moderate: 20.11,
      High: 19.56,
      "Very High": 20.36,
    },
    legendInfo: {
      totalEntries: 348668,
      reportPath: "/data/reports/Solar_siting_report.pdf",
      description:
        "Evaluates rooftop solar panel suitability across Worcester County based on infrastructure proximity, environmental constraints, and equity considerations.",
    },
  },

  EV: {
    id: "EV",
    name: "EV Charging Analysis",
    propertyKey: "Class",
    aggregatedDataPath:
      "/data/EV_analysis/EV_aggregated_suitability_scored.json",
    files: [
      {
        path: "/data/EV_analysis/EV_Analysis_wgs84_Very_Low_stripped.geojson",
        propertyValue: "Very Low",
      },
      {
        path: "/data/EV_analysis/EV_Analysis_wgs84_Low_stripped.geojson",
        propertyValue: "Low",
      },
      {
        path: "/data/EV_analysis/EV_Analysis_wgs84_Moderate_stripped.geojson",
        propertyValue: "Moderate",
      },
      {
        path: "/data/EV_analysis/EV_Analysis_wgs84_High_stripped.geojson",
        propertyValue: "High",
      },
      {
        path: "/data/EV_analysis/EV_Analysis_wgs84_Very_High_stripped.geojson",
        propertyValue: "Very High",
      },
      {
        path: "/data/EV_analysis/EV_Analysis_wgs84_Unknown_stripped.geojson",
        propertyValue: "Unknown",
      },
    ],
    colors: (() => {
      const lightGreen: [number, number, number] = [200, 255, 200]; // light green
      const darkGreen: [number, number, number] = [0, 100, 0]; // vivid green
      const gradient = gradientColors(lightGreen, darkGreen, 5, 200);
      return {
        "Very Low": gradient[0],
        Low: gradient[1],
        Moderate: gradient[2],
        High: gradient[3],
        "Very High": gradient[4],
        Unknown: [128, 128, 128, 30],
      };
    })(),
    weights: {
      "Very Low": 1,
      Low: 2,
      Moderate: 3,
      High: 4,
      "Very High": 5,
      Unknown: 0,
    },
    percentages: {
      "Very Low": 18.58,
      Low: 20.96,
      Moderate: 19.64,
      High: 18.51,
      "Very High": 7.45,
      Unknown: 14.87,
    },
    legendInfo: {
      totalEntries: 624520,
      reportPath: "/data/reports/EV_Charging_Siting_Analysis.pdf",
      description:
        "Identifies optimal locations for EV charging stations across Worcester County based on population density.",
    },
  },
};
