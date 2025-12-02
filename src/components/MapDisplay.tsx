"use client";

import { generateMap, MapInstance } from "@/lib/map";
import { useEffect, useRef, useState } from "react";
import MapSidebar from "./MapSidebar";
import DatasetLegend from "./DatasetLegend";
import { datasets } from "@/lib/datasetConfig";

export default function MapDisplay() {
  const mapElement = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<MapInstance | null>(null);
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mapId = "map";

  const [selectedDatasetId, setSelectedDatasetId] = useState("battery");
  const [enabledFiles, setEnabledFiles] = useState<Set<string>>(
    new Set(datasets.battery.files.map((f) => f.propertyValue))
  );
  const [pendingUpdate, setPendingUpdate] = useState(false);
  const [aggregateByTown, setAggregateByTown] = useState(false);

  useEffect(() => {
    if (!mapElement.current) return;
    const mapInstance = generateMap(mapId);
    mapInstanceRef.current = mapInstance;

    // Load initial dataset when map is ready
    mapInstance.map.on("load", () => {
      mapInstance.updateLayers(
        datasets[selectedDatasetId],
        enabledFiles,
        aggregateByTown
      );
    });

    return () => {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }
      mapInstance.map.remove();
    };
  }, []);

  // Debounced update: wait 1 second after last change before updating map
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear any existing timer
    if (updateTimerRef.current) {
      clearTimeout(updateTimerRef.current);
    }

    // Set pending state to show user that update is queued
    setPendingUpdate(true);

    // Set new timer to update after 1 second of no changes
    updateTimerRef.current = setTimeout(() => {
      const selectedDataset = datasets[selectedDatasetId];
      if (selectedDataset && mapInstanceRef.current) {
        mapInstanceRef.current.updateLayers(
          selectedDataset,
          enabledFiles,
          aggregateByTown
        );
        setPendingUpdate(false);
      }
    }, 1000);

    // Cleanup function
    return () => {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }
    };
  }, [selectedDatasetId, enabledFiles, aggregateByTown]);

  const handleDatasetChange = (datasetId: string) => {
    setSelectedDatasetId(datasetId);
    // Enable all files for the new dataset by default
    const newDataset = datasets[datasetId];
    setEnabledFiles(new Set(newDataset.files.map((f) => f.propertyValue)));
  };

  const handleFileToggle = (propertyValue: string, enabled: boolean) => {
    setEnabledFiles((prev) => {
      const newSet = new Set(prev);
      if (enabled) {
        newSet.add(propertyValue);
      } else {
        newSet.delete(propertyValue);
      }
      return newSet;
    });
  };

  return (
    <div className="relative w-full h-screen">
      <MapSidebar
        datasets={datasets}
        selectedDatasetId={selectedDatasetId}
        onDatasetChange={handleDatasetChange}
        enabledFiles={enabledFiles}
        onFileToggle={handleFileToggle}
        isPendingUpdate={pendingUpdate}
        aggregateByTown={aggregateByTown}
        onAggregationToggle={setAggregateByTown}
      />
      <DatasetLegend dataset={datasets[selectedDatasetId]} />
      <div ref={mapElement} id={mapId} className="w-full h-full"></div>
    </div>
  );
}
