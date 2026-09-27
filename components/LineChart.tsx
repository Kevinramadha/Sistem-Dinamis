"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LineChartProps {
  years: number[];
  data: Record<string, number[]>;
  title: string;
  yAxisLabel: string;
  colors?: string[];
  heightPx?: number;
}

export default function LineChart({
  years,
  data,
  title,
  yAxisLabel,
  colors = ["#2196F3", "#4CAF50", "#FF5722", "#9C27B0", "#FF9800"],
  heightPx = 450,
}: LineChartProps) {
  const labels = years.map((y) => y.toString());

  let colorIndex = 0;
  const datasets = Object.entries(data).map((entry) => {
    const isHistorical = entry[0].includes("(Aktual");
    if (isHistorical) {
      return {
        label: entry[0],
        data: entry[1],
        borderColor: "#64748b",
        backgroundColor: "#64748b1A",
        borderWidth: 2,
        borderDash: [5, 4],
        pointRadius: 2,
        pointHoverRadius: 6,
        tension: 0,
        fill: false,
      };
    }
    const color = colors[colorIndex % colors.length];
    colorIndex++;
    return {
      label: entry[0],
      data: entry[1],
      borderColor: color,
      backgroundColor: color + "1A",
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 6,
      tension: 0.4,
      fill: false,
    };
  });

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: title,
        font: { size: heightPx < 300 ? 13 : 18, weight: 600 },
        padding: { bottom: 20 },
      },
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 12 },
          boxWidth: 8,
          boxHeight: 8,
        },
        align: "center" as const,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        backgroundColor: "rgba(0,0,0,0.8)",
        padding: 12,
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: yAxisLabel,
          font: { size: 13, weight: 600 },
        },
        ticks: {
          font: { size: 12 },
        },
        grid: {
          drawBorder: true,
          color: "rgba(0,0,0,0.1)",
        },
      },
      x: {
        ticks: {
          font: { size: 12 },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="w-full" style={{ height: `${heightPx}px` }}>
      <Line data={{ labels, datasets }} options={options} />
    </div>
  );
}
