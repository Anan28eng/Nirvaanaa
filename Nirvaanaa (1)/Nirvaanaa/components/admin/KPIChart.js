'use client';

import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Title } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Title);

export default function KPIChart({ type = 'line', data = { labels: [], datasets: [] }, options = {} }) {
  const commonOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Sales Analytics' },
    },
    ...options,
  };

  if (type === 'bar') return <Bar data={data} options={commonOptions} />;
  if (type === 'doughnut') return <Doughnut data={data} options={commonOptions} />;
  return <Line data={data} options={commonOptions} />;
}
