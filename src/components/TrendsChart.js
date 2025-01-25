import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import supabase from '../config/supabaseClient';

const TrendsChart = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [departmentStats, setDepartmentStats] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get departments
      const { data: deptData, error: deptError } = await supabase
        .from('departments')
        .select('*');

      if (deptError) throw deptError;

      // Get members
      const { data: members, error: membersError } = await supabase
        .from('members')
        .select('*');

      if (membersError) throw membersError;

      // Get all attendance records
      const { data: attendanceRecords, error: attendanceError } = await supabase
        .from('attendance')
        .select('*');

      if (attendanceError) throw attendanceError;

      // Calculate department statistics
      const stats = deptData.map(dept => {
        const deptMembers = members.filter(m => m.department_id === dept.id);
        const totalMembers = deptMembers.length;
        
        if (totalMembers === 0) return null;

        let totalPresentCount = 0;
        let totalPossibleCount = 0;

        // Calculate attendance for all events
        attendanceRecords.forEach(record => {
          if (record.department_id === dept.id) {
            const records = typeof record.attendance_records === 'string'
              ? JSON.parse(record.attendance_records)
              : record.attendance_records;

            deptMembers.forEach(member => {
              totalPossibleCount++; // Each member could attend each event
              if (records && records[member.id] === true) {
                totalPresentCount++;
              }
            });
          }
        });

        const attendanceRate = totalPossibleCount > 0 
          ? (totalPresentCount / totalPossibleCount) * 100 
          : 0;

        return {
          name: dept.name,
          memberCount: totalMembers,
          totalEvents: attendanceRecords.filter(r => r.department_id === dept.id).length,
          presentCount: totalPresentCount,
          possibleCount: totalPossibleCount,
          attendanceRate: attendanceRate
        };
      }).filter(Boolean); // Remove null entries

      setDepartmentStats(stats);
      console.log('Department Stats:', stats);
    } catch (err) {
      console.error('Error fetching trend data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error loading trends: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 }, 
      maxWidth: '100%',
      overflow: 'hidden'
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 3,
        gap: 1
      }}>
        <IconButton 
          onClick={() => navigate(-1)}
          sx={{ 
            mr: 1,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1">
          Department-wise Attendance Statistics
        </Typography>
      </Box>

      {/* Bar Chart */}
      <Box sx={{ 
        width: '100%', 
        height: { xs: 400, sm: 500 }, 
        mb: 4,
        mt: 2
      }}>
        <ResponsiveContainer>
          <BarChart 
            data={departmentStats}
            margin={{
              top: 20,
              right: isMobile ? 10 : 30,
              left: isMobile ? 20 : 40,
              bottom: isMobile ? 80 : 100
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              label={{ 
                value: 'Departments', 
                position: 'bottom',
                offset: 0
              }}
              tick={{
                angle: -45,
                textAnchor: 'end',
                dominantBaseline: 'auto',
                fontSize: isMobile ? 10 : 12
              }}
              height={isMobile ? 80 : 100}
            />
            <YAxis
              label={{ 
                value: 'Attendance Rate (%)', 
                angle: -90, 
                position: 'insideLeft',
                offset: -10
              }}
              domain={[0, 100]}
            />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'attendanceRate') return [`${value.toFixed(1)}%`, 'Attendance Rate'];
                return [value, name];
              }}
            />
            <Legend 
              verticalAlign="top"
              height={36}
            />
            <Bar 
              dataKey="attendanceRate" 
              name="Overall Attendance Rate" 
              fill="#8884d8" 
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* Detailed Statistics */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Detailed Department Statistics
      </Typography>
      <Grid container spacing={2}>
        {departmentStats.map((dept) => (
          <Grid item xs={12} sm={6} md={4} key={dept.name}>
            <Paper 
              elevation={2}
              sx={{ 
                p: 2.5,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                '&:hover': {
                  boxShadow: 3
                }
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {dept.name}
              </Typography>
              <Typography variant="body2">
                Total Members: {dept.memberCount}
              </Typography>
              <Typography variant="body2">
                Total Events: {dept.totalEvents}
              </Typography>
              <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 'medium' }}>
                Attendance Rate: {dept.attendanceRate.toFixed(1)}%
              </Typography>
              <Typography variant="body2">
                Total Attended: {dept.presentCount} / {dept.possibleCount}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TrendsChart;
