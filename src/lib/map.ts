import maplibregl from "maplibre-gl";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { HexagonLayer } from "@deck.gl/aggregation-layers";
import { TextLayer, PolygonLayer } from "@deck.gl/layers";
import { DatasetConfig } from "./datasetConfig";
import { computeCentroidOfGeometry } from "./utils/computeCentroidOfGeometry";

type Feature = {
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
};

type TownFeature = GeoJSON.Feature & {
  properties?: { TOWN?: string; COUNTY?: string };
};

type AggregatedTownData = {
  town: string;
  class_counts: Record<string, number>;
  avg_score: number;
  suitability_label: string;
};

export type MapInstance = {
  map: maplibregl.Map;
  updateLayers: (
    config: DatasetConfig,
    enabledFiles: Set<string>,
    aggregateByTown?: boolean
  ) => Promise<void>;
};

export function generateMap(containerId: string): MapInstance {
  const map = new maplibregl.Map({
    container: containerId,
    style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
    center: [-71.0589, 42.3601],
    zoom: 8,
    minZoom: 6,
    maxZoom: 14,
    maxBounds: [
      [-73.6, 41.1],
      [-69.8, 42.9],
    ],
  });

  let townLabelData: { position: [number, number]; text: string }[] = [];
  let townFeatures: TownFeature[] = [];

  map.on("load", async () => {
    // Remove default place symbol layers
    const layers = map.getStyle().layers ?? [];
    layers.forEach((layer) => {
      if (layer.type === "symbol" && layer.id.startsWith("place_")) {
        if (map.getLayer(layer.id)) map.removeLayer(layer.id);
      }
    });

    try {
      const resp = await fetch(
        "/data/boundaries/TOWNSSURVEY_POLYM_wgs84_worcester_only.geojson"
      );
      const townGeoJson: GeoJSON.FeatureCollection = await resp.json();
      townFeatures = townGeoJson.features as TownFeature[];

      townLabelData = (townGeoJson.features ?? [])
        .map((f) => {
          if (!f.geometry) return null;
          const pos = computeCentroidOfGeometry(f.geometry);
          const name = (f.properties && (f.properties as any).TOWN) || "";
          return { position: pos, text: name };
        })
        .filter(Boolean) as { position: [number, number]; text: string }[];

      if (!map.getSource("worcester-towns")) {
        map.addSource("worcester-towns", {
          type: "geojson",
          data: "/data/boundaries/TOWNSSURVEY_POLYM_wgs84_worcester_only.geojson",
        });
      }

      if (!map.getLayer("worcester-towns-outline")) {
        map.addLayer({
          id: "worcester-towns-outline",
          type: "line",
          source: "worcester-towns",
          paint: {
            "line-color": "#ffffff",
            "line-width": 2,
          },
        });
      }
    } catch (err) {
      console.warn("Could not load town boundaries:", err);
    }
  });

  let overlay: MapboxOverlay | null = null;

  const updateLayers = async (
    config: DatasetConfig,
    enabledFiles: Set<string>,
    aggregateByTown: boolean = false
  ) => {
    if (!map.loaded()) {
      await new Promise<void>((resolve) => {
        map.once("load", () => resolve());
      });
    }

    let displayFeatures: Feature[] = [];
    let displayWeights: number[] = [];

    const weightValues = Object.values(config.weights);
    const minWeight = Math.min(...weightValues);
    const maxWeight = Math.max(...weightValues);

    let hexLayer: HexagonLayer<Feature> | null = null;
    let townLayer: PolygonLayer<TownFeature> | null = null;

    if (aggregateByTown && config.aggregatedDataPath) {
      try {
        const response = await fetch(config.aggregatedDataPath);
        const aggregatedData: AggregatedTownData[] = await response.json();

        townLayer = new PolygonLayer<TownFeature>({
          id: `deck-town-polygons-${config.id}`,
          data: townFeatures,
          getPolygon: (d) =>
            d.geometry?.type === "Polygon" ? d.geometry.coordinates : [],
          getElevation: (d) => {
            const townData = aggregatedData.find(
              (t) => t.town === d.properties?.TOWN
            );
            if (!townData) return 0;

            if (
              !enabledFiles.has(townData.suitability_label) ||
              townData.suitability_label === "Unknown"
            )
              return 0;

            let totalWeight = 0;
            let totalCount = 0;
            for (const [className, count] of Object.entries(
              townData.class_counts
            )) {
              if (className === "Unknown") continue; // skip Unknown
              const weight = config.weights[className] ?? 0;
              totalWeight += weight * count;
              totalCount += count;
            }
            return totalCount > 0 ? (totalWeight / totalCount) * 5 : 0;
          },
          getFillColor: (d) => {
            const townData = aggregatedData.find(
              (t) => t.town === d.properties?.TOWN
            );
            if (!townData) return [128, 128, 128, 0];

            if (
              !enabledFiles.has(townData.suitability_label) ||
              townData.suitability_label === "Unknown"
            )
              return [128, 128, 128, 0];

            let r = 0,
              g = 0,
              b = 0,
              a = 0;
            let totalCount = 0;
            for (const [className, count] of Object.entries(
              townData.class_counts
            )) {
              if (className === "Unknown") continue; // skip Unknown
              const color = config.colors[className] ?? [128, 128, 128, 100];
              r += color[0] * count;
              g += color[1] * count;
              b += color[2] * count;
              a += color[3] * count;
              totalCount += count;
            }
            if (totalCount === 0) return [128, 128, 128, 0];
            return [
              Math.round(r / totalCount),
              Math.round(g / totalCount),
              Math.round(b / totalCount),
              Math.round(a / totalCount),
            ];
          },
          extruded: true,
          wireframe: true,
          pickable: true,
          onClick: (info) => {
            if (info.object) console.log("Clicked town polygon:", info.object);
          },
          updateTriggers: {
            getElevation: [Array.from(enabledFiles).sort().join(",")],
            getFillColor: [Array.from(enabledFiles).sort().join(",")],
          },
        });
      } catch (err) {
        console.warn("Could not load aggregated data:", err);
      }
    } else {
      const includedPropertyValues: string[] = [];
      const filesToLoad = config.files.filter(
        (file) =>
          enabledFiles.has(file.propertyValue) &&
          file.propertyValue !== "Unknown"
      );

      for (const fileConfig of filesToLoad) {
        try {
          const json = await fetch(fileConfig.path).then((res) => res.json());
          const features: Feature[] = (json.features ?? []).filter(
            (f: Feature) => fileConfig.propertyValue !== "Unknown"
          );

          displayFeatures.push(...features);
          const propertyValue = fileConfig.propertyValue;
          if (!includedPropertyValues.includes(propertyValue))
            includedPropertyValues.push(propertyValue);

          const weight = config.weights[propertyValue] ?? 0;
          for (let i = 0; i < features.length; i++) displayWeights.push(weight);
        } catch (err) {
          console.warn(`Could not load file ${fileConfig.path}:`, err);
        }
      }

      // Dynamic hex radius
      const dataSize = displayFeatures.length;
      let hexRadius = 200;
      if (dataSize > 500000) hexRadius = 500;
      else if (dataSize > 200000) hexRadius = 350;
      else if (dataSize > 100000) hexRadius = 250;

      hexLayer = new HexagonLayer<Feature>({
        id: `deck-hexagon-${config.id}`,
        data: displayFeatures,
        getPosition: (d) => d.geometry.coordinates,
        radius: hexRadius,
        extruded: true,
        elevationScale: 5,
        elevationDomain: [minWeight, maxWeight],
        coverage: 1,
        getColorWeight: (_d, { index }) => displayWeights[index] ?? 0,
        colorAggregation: "MEAN",
        colorRange: includedPropertyValues.map(
          (val) => config.colors[val] || [128, 128, 128, 150]
        ),
        getElevationWeight: (_d, { index }) => displayWeights[index] ?? 0,
        elevationAggregation: "MEAN",
        gpuAggregation: false,
      });
    }

    const textLayer = new TextLayer({
      id: "town-labels",
      data: townLabelData,
      getPosition: (d: any) => {
        const basePos = d.position;
        const z = maxWeight * 5 + 5000;
        return [basePos[0], basePos[1], z];
      },
      getText: (d: any) => d.text,
      getSize: 14,
      sizeUnits: "pixels",
      getColor: [255, 255, 255],
      getTextAnchor: "middle",
      getAlignmentBaseline: "center",
      billboard: true,
      pickable: false,
      background: true,
      getBackgroundColor: [0, 0, 0, 120],
      backgroundBorderRadius: 2,
      backgroundPadding: [6, 2, 6, 2],
    });

    const layers = [aggregateByTown ? townLayer : hexLayer, textLayer].filter(
      (layer) => layer !== null
    );

    if (overlay) {
      overlay.setProps({ layers });
    } else {
      overlay = new MapboxOverlay({
        interleaved: true,
        layers,
      });
      map.addControl(overlay);
    }
  };

  return { map, updateLayers };
}
