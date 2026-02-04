import React from 'react';
import { Box, Typography, LinearProgress, Card, CardContent, List, ListItem, ListItemText, Chip } from '@mui/material';

const COLORS = {
  'Food': '#4caf50',
  'Rent': '#f44336',
  'Transport': '#ff9800',
  'Entertainment': '#2196f3',
  'Shopping': '#9c27b0',
  'General': '#795548',
};

function CategoryBreakdown({ data }) {
  const totalSpending = data.reduce((sum, item) => sum + item.total, 0);

  // Sort by amount descending
  const sortedData = [...data].sort((a, b) => b.total - a.total);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Category Breakdown
        </Typography>
        
        {data.length === 0 ? (
          <Typography color="textSecondary" sx={{ py: 2 }}>
            No spending data for this month
          </Typography>
        ) : (
          <>
            {/* Progress bars view */}
            <Box sx={{ mb: 3 }}>
              {sortedData.map((item) => {
                const percentage = (item.total / totalSpending) * 100;
                return (
                  <Box key={item.category} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: COLORS[item.category] || '#795548',
                          }}
                        />
                        <Typography variant="body2">{item.category}</Typography>
                      </Box>
                      <Typography variant="body2">
                        ${item.total.toFixed(2)} ({percentage.toFixed(1)}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: COLORS[item.category] || '#795548',
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                );
              })}
            </Box>

            {/* List view */}
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              Transaction Count by Category
            </Typography>
            <List dense>
              {sortedData.map((item) => (
                <ListItem key={item.category}>
                  <ListItemText
                    primary={item.category}
                    secondary={`${item.count} transaction${item.count !== 1 ? 's' : ''}`}
                  />
                  <Chip 
                    label={`$${item.total.toFixed(2)}`} 
                    size="small"
                    sx={{ 
                      backgroundColor: COLORS[item.category] || '#795548',
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default CategoryBreakdown;

