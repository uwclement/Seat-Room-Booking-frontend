import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ChartWrapper = ({ chartData, title, subtitle }) => {
  if (!chartData) {
    return (
      <div className="chart-card">
        <div className="chart-header">
          <div className="chart-title">{title || 'Chart'}</div>
          <div className="chart-subtitle">{subtitle || 'No data available'}</div>
        </div>
        <div className="chart-placeholder">
          <i className="fas fa-chart-bar" style={{fontSize: '24px', marginRight: '8px'}}></i>
          No data available
        </div>
      </div>
    );
  }

  const COLORS = ['#1e3a8a', '#3b82f6', '#60a5fa', '#10b981', '#f59e0b', '#ef4444'];

  const formatDataForChart = () => {
    if (!chartData.labels || !chartData.data) return [];
    
    return chartData.labels.map((label, index) => ({
      name: label,
      value: chartData.data[index] || 0
    }));
  };

  const renderChart = () => {
    const data = formatDataForChart();
    
    if (!data.length) {
      return (
        <div className="chart-placeholder">
          <i className="fas fa-chart-bar" style={{fontSize: '24px', marginRight: '8px'}}></i>
          No data available
        </div>
      );
    }

    switch (chartData.type?.toLowerCase()) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={COLORS[0]} 
                strokeWidth={2}
                dot={{ fill: COLORS[0] }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill={COLORS[1]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill={COLORS[1]} />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div className="chart-title">{title || chartData.title}</div>
        <div className="chart-subtitle">{subtitle || chartData.subtitle}</div>
      </div>
      <div className="chart-content">
        {renderChart()}
      </div>
    </div>
  );
};

export default ChartWrapper;