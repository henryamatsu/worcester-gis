"use client";

import { useState, useEffect } from "react";
import { DatasetConfig } from "@/lib/datasetConfig";
import { ChevronLeft, ChevronRight, FileText, Database } from "lucide-react";

type DatasetLegendProps = {
  dataset: DatasetConfig;
};

export default function DatasetLegend({ dataset }: DatasetLegendProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(true);

  const toggleCollapse = () => {
    if (isCollapsed) {
      // Start expanding
      setIsCollapsed(false);
      // Show content after transition duration (300ms)
      setTimeout(() => setIsContentVisible(true), 300);
    } else {
      // Start collapsing
      setIsContentVisible(false); // hide content immediately
      setIsCollapsed(true);
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString("en-US");
  };

  return (
    <div
      className={`absolute top-4 right-4 bg-white shadow-lg rounded-lg transition-all duration-300 z-10 ${
        isCollapsed ? "w-12" : "w-80"
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleCollapse}
        className="absolute -left-3 top-4 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
        aria-label={isCollapsed ? "Expand legend" : "Collapse legend"}
      >
        {isCollapsed ? (
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {/* Legend Content / Collapsed State */}
      {isCollapsed ? (
        <div className="p-3 flex items-center justify-center">
          <FileText className="w-6 h-6 text-gray-600" />
        </div>
      ) : (
        <div className="p-5">
          {isContentVisible && (
            <>
              {/* Title */}
              <h2 className="text-lg font-bold mb-3 text-gray-800 border-b pb-2">
                {dataset.name}
              </h2>

              {/* Total Entries */}
              <div className="mb-4 flex items-start gap-3">
                <Database className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Data Points
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(dataset.legendInfo.totalEntries)}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {dataset.legendInfo.description}
                </p>
              </div>

              {/* Report Link */}
              <a
                href={dataset.legendInfo.reportPath}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium shadow-sm"
              >
                <FileText className="w-4 h-4" />
                View Full Report
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
}
