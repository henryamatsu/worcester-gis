"use client";

import { useState, useEffect } from "react";
import { DatasetConfig } from "@/lib/datasetConfig";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PieChart from "./PieChart";

type MapSidebarProps = {
  datasets: Record<string, DatasetConfig>;
  selectedDatasetId: string;
  onDatasetChange: (datasetId: string) => void;
  enabledFiles: Set<string>;
  onFileToggle: (propertyValue: string, enabled: boolean) => void;
  isPendingUpdate?: boolean;
  aggregateByTown: boolean;
  onAggregationToggle: (enabled: boolean) => void;
};

export default function MapSidebar({
  datasets,
  selectedDatasetId,
  onDatasetChange,
  enabledFiles,
  onFileToggle,
  isPendingUpdate = false,
  aggregateByTown,
  onAggregationToggle,
}: MapSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(true);

  const selectedDataset = datasets[selectedDatasetId];

  const handleCheckboxChange = (propertyValue: string, checked: boolean) => {
    onFileToggle(propertyValue, checked);
  };

  const handleSelectAll = () => {
    selectedDataset.files.forEach((file) => {
      onFileToggle(file.propertyValue, true);
    });
  };

  const handleDeselectAll = () => {
    selectedDataset.files.forEach((file) => {
      onFileToggle(file.propertyValue, false);
    });
  };

  // Toggle collapse with delayed content population
  const toggleCollapse = () => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setTimeout(() => setIsContentVisible(true), 300); // delay matches transition duration
    } else {
      setIsContentVisible(false); // hide content immediately
      setIsCollapsed(true);
    }
  };

  return (
    <div
      className={`absolute top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 z-10 ${
        isCollapsed ? "w-12" : "w-80"
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleCollapse}
        className="absolute -right-3 top-4 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {/* Sidebar Content */}
      {isContentVisible && (
        <div className="p-4 h-full overflow-y-auto">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            Layer Controls
          </h2>

          {/* Dataset Selector */}
          <div className="mb-6">
            <label
              htmlFor="dataset-select"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Select Dataset
            </label>
            <select
              id="dataset-select"
              value={selectedDatasetId}
              onChange={(e) => onDatasetChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            >
              {Object.values(datasets).map((dataset) => (
                <option key={dataset.id} value={dataset.id}>
                  {dataset.name}
                </option>
              ))}
            </select>
          </div>

          {/* Aggregation Toggle */}
          <div className="mb-6 p-3 bg-gray-50 rounded-md border border-gray-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={aggregateByTown}
                onChange={(e) => onAggregationToggle(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Aggregate by Town
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  Show combined suitability data for each town
                </p>
              </div>
            </label>
          </div>

          {/* Pie Chart */}
          {selectedDataset && (
            <div className="mb-6 p-4 bg-gray-50 rounded-md border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Suitability Distribution
              </h3>
              <PieChart
                slices={selectedDataset.files.map((file) => ({
                  label: file.propertyValue,
                  percentage:
                    selectedDataset.percentages[file.propertyValue] || 0,
                  color: selectedDataset.colors[file.propertyValue],
                  enabled: enabledFiles.has(file.propertyValue),
                }))}
                onSliceClick={(label) => {
                  const isCurrentlyEnabled = enabledFiles.has(label);
                  onFileToggle(label, !isCurrentlyEnabled);
                }}
              />
            </div>
          )}

          {/* Loading Indicator */}
          {isPendingUpdate ? (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-yellow-800">Updating map layers...</p>
            </div>
          ) : (
            <div className="mt-6 p-3 bg-blue-50 rounded-md">
              <p className="text-xs text-gray-600">
                <strong>Tip:</strong> Select different property values to
                visualize specific data layers on the map.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
