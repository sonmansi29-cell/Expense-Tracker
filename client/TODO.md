# TODO - Client Fixes

## Task: Fix 401 Errors and Loading Screen

### Changes Required:

- [x] 1. Fix useQuery hooks in App.jsx - Change `enabled: isAuthenticated.current` to `enabled: !!localStorage.getItem('token')`
- [x] 2. Remove unused isAuthenticated ref and useEffect from App.jsx
- [x] 3. Remove unused useRef and useEffect imports from App.jsx
- [x] 4. Wrap Income Pie Chart ResponsiveContainer in Box with height={350}
- [x] 5. Wrap Expense Pie Chart ResponsiveContainer in Box with height={350}
- [x] 6. Wrap Cash Flow Trend ResponsiveContainer in Box with height={350}
- [x] 7. Fix SpendingChart.jsx - Add proper height container with Box

### Completed Fixes:

1. **Axios Interceptor (api.js)** - Already implemented with token attachment
2. **useQuery hooks** - Now using `enabled: !!localStorage.getItem('token')` 
3. **Chart Wrappers** - All charts wrapped in Box with height={350}

