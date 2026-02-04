import React from 'react';
import { Box, Typography } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#4caf50', '#f44336', '#ff9800', '#2196f3', '#9c27b0', '#795548', '#00bcd4', '#e91e63'];

function SpendingChart({ data }) {
  // Filter out zero values and format data
  const chartData = data
    .filter(item => item.total > 0)
    .map(item => ({
      name: item.category,
      value: item.total,
    }));

  const totalSpending = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Box sx={{ width: '100%', height: 480 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 50 }}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `$${value.toFixed(2)}`}
            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
          />
          <Legend verticalAlign="bottom" height={40} />
        </PieChart>
      </ResponsiveContainer>
      {chartData.length > 0 && (
        <Box sx={{ textAlign: 'center', mt: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            Total Spending: ${totalSpending.toFixed(2)}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default SpendingChart;

