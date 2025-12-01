"use client";

import { useMemo } from "react";

type PieSlice = {
  label: string;
  percentage: number;
  color: [number, number, number, number];
  enabled: boolean;
};

type PieChartProps = {
  slices: PieSlice[];
  onSliceClick: (label: string) => void;
  size?: number;
};

export default function PieChart({
  slices,
  onSliceClick,
  size = 200,
}: PieChartProps) {
  const radius = size / 2;
  const center = radius;

  // Calculate pie slice paths
  const slicePaths = useMemo(() => {
    let currentAngle = -90; // Start at top (12 o'clock)

    return slices.map((slice) => {
      const angleSize = (slice.percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angleSize;

      // Convert angles to radians
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      // Calculate start and end points on the circle
      const x1 = center + radius * Math.cos(startRad);
      const y1 = center + radius * Math.sin(startRad);
      const x2 = center + radius * Math.cos(endRad);
      const y2 = center + radius * Math.sin(endRad);

      // Determine if we need the large arc flag
      const largeArcFlag = angleSize > 180 ? 1 : 0;

      // Create SVG path
      const path = [
        `M ${center} ${center}`, // Move to center
        `L ${x1} ${y1}`, // Line to start point
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`, // Arc to end point
        "Z", // Close path back to center
      ].join(" ");

      // Calculate label position (middle of the slice)
      const midAngle = startAngle + angleSize / 2;
      const midRad = (midAngle * Math.PI) / 180;
      const labelRadius = radius * 0.7; // Position label at 70% of radius
      const labelX = center + labelRadius * Math.cos(midRad);
      const labelY = center + labelRadius * Math.sin(midRad);

      currentAngle = endAngle;

      return {
        path,
        labelX,
        labelY,
        slice,
      };
    });
  }, [slices, center, radius]);

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="drop-shadow-md"
      >
        {slicePaths.map(({ path, labelX, labelY, slice }, index) => {
          // Create color with opacity
          const baseColor = `rgba(${slice.color[0]}, ${slice.color[1]}, ${slice.color[2]}, ${slice.color[3] / 255})`;
          
          // Subdued color for disabled state (reduce opacity and add gray overlay)
          const subduedColor = slice.enabled
            ? baseColor
            : `rgba(${slice.color[0] * 0.5 + 128 * 0.5}, ${slice.color[1] * 0.5 + 128 * 0.5}, ${slice.color[2] * 0.5 + 128 * 0.5}, ${(slice.color[3] / 255) * 0.4})`;

          return (
            <g key={slice.label}>
              <path
                d={path}
                fill={subduedColor}
                stroke="white"
                strokeWidth="2"
                className="cursor-pointer transition-all duration-200 hover:opacity-80"
                onClick={() => onSliceClick(slice.label)}
                style={{
                  filter: slice.enabled ? "none" : "grayscale(30%)",
                }}
              />
              {/* Label with percentage */}
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-semibold pointer-events-none select-none"
                fill={slice.enabled ? "#1f2937" : "#9ca3af"}
                style={{
                  textShadow: "0 0 3px white, 0 0 3px white, 0 0 3px white",
                }}
              >
                {slice.percentage.toFixed(1)}%
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-4 space-y-1 w-full">
        {slices.map((slice) => {
          const color = `rgba(${slice.color[0]}, ${slice.color[1]}, ${slice.color[2]}, ${slice.color[3] / 255})`;
          const subduedColor = slice.enabled
            ? color
            : `rgba(${slice.color[0] * 0.5 + 128 * 0.5}, ${slice.color[1] * 0.5 + 128 * 0.5}, ${slice.color[2] * 0.5 + 128 * 0.5}, ${(slice.color[3] / 255) * 0.4})`;

          return (
            <button
              key={slice.label}
              onClick={() => onSliceClick(slice.label)}
              className="flex items-center gap-2 w-full p-1 rounded hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div
                className="w-3 h-3 rounded-sm border border-gray-300 flex-shrink-0"
                style={{
                  backgroundColor: subduedColor,
                  filter: slice.enabled ? "none" : "grayscale(30%)",
                }}
              />
              <span
                className={`text-xs ${
                  slice.enabled ? "text-gray-700" : "text-gray-400"
                }`}
              >
                {slice.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

