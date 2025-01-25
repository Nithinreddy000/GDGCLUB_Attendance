import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
} from 'recharts';
import supabase from '../config/supabaseClient';

const Trends = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [timelineData, setTimelineData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all required data separately
      const { data: departments, error: deptError } = await supabase
        .from('departments')
        .select('*');

      if (deptError) throw deptError;

      const { data: members, error: membersError } = await supabase
        .from('members')
        .select('*');

      if (membersError) throw membersError;

      const { data: attendance, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .order('event_date', { ascending: true });

      if (attendanceError) throw attendanceError;

      // Process department statistics
      const deptStats = departments.map(dept => {
        const deptMembers = members.filter(m => m.department_id === dept.id);
        const deptAttendance = attendance.filter(a => a.department_id === dept.id);
        
        let totalPresent = 0;
        let totalPossible = 0;

        deptAttendance.forEach(record => {
          const records = typeof record.attendance_records === 'string' 
            ? JSON.parse(record.attendance_records)
            : record.attendance_records;

          deptMembers.forEach(member => {
            if (records && member.id in records) {
              totalPossible++;
              if (records[member.id] === true) {
                totalPresent++;
              }
            }
          });
        });

        return {
          name: dept.name,
          memberCount: deptMembers.length,
          eventCount: deptAttendance.length,
          attendanceRate: totalPossible ? (totalPresent / totalPossible) * 100 : 0,
        };
      }).filter(dept => dept.memberCount > 0); // Only show departments with members

      // Process timeline data
      const timelineMap = new Map();

      attendance.forEach(record => {
        const date = record.event_date;
        const dept = departments.find(d => d.id === record.department_id);
        if (!dept) return;

        const deptMembers = members.filter(m => m.department_id === dept.id);
        if (deptMembers.length === 0) return; // Skip if no members in department

        const records = typeof record.attendance_records === 'string'
          ? JSON.parse(record.attendance_records)
          : record.attendance_records;

        let present = 0;
        let total = 0;

        deptMembers.forEach(member => {
          if (records && member.id in records) {
            total++;
            if (records[member.id] === true) {
              present++;
            }
          }
        });

        const rate = total ? (present / total) * 100 : 0;

        if (!timelineMap.has(date)) {
          const entry = { date };
          departments.forEach(d => {
            entry[d.name] = d.id === dept.id ? rate : null;
          });
          timelineMap.set(date, entry);
        } else {
          const entry = timelineMap.get(date);
          entry[dept.name] = rate;
        }
      });

      // Convert timeline map to array and fill in missing values
      const timeline = Array.from(timelineMap.values());
      timeline.sort((a, b) => new Date(a.date) - new Date(b.date));

      // Fill in null values with previous values for smoother lines
      departments.forEach(dept => {
        let lastValue = 0;
        timeline.forEach(entry => {
          if (entry[dept.name] === null) {
            entry[dept.name] = lastValue;
          } else {
            lastValue = entry[dept.name];
          }
        });
      });

      setDepartmentStats(deptStats);
      setTimelineData(timeline);

      console.log('Department Stats:', deptStats);
      console.log('Timeline Data:', timeline);
    } catch (err) {
      console.error('Error fetching trend data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
        <Alert severity="error">Error loading trends: {error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Department-wise Attendance Trends
      </Typography>

      <Grid container spacing={3}>
        {/* Department Overview */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Department Overview
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="attendanceRate" name="Attendance Rate (%)" fill="#8884d8" />
                <Bar dataKey="memberCount" name="Member Count" fill="#82ca9d" />
                <Bar dataKey="eventCount" name="Event Count" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Attendance Timeline */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Attendance Timeline
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <Legend />
                {departmentStats.map((dept, index) => (
                  <Line
                    key={dept.name}
                    type="monotone"
                    dataKey={dept.name}
                    name={`${dept.name} Attendance`}
                    stroke={`hsl(${(index * 137.5) % 360}, 70%, 50%)`}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Department Statistics */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Department Statistics
            </Typography>
            <Grid container spacing={2}>
              {departmentStats.map((dept) => (
                <Grid item xs={12} sm={6} md={4} key={dept.name}>
                  <Paper elevation={3} sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {dept.name}
                    </Typography>
                    <Typography>
                      Members: {dept.memberCount}
                    </Typography>
                    <Typography>
                      Events: {dept.eventCount}
                    </Typography>
                    <Typography>
                      Attendance Rate: {dept.attendanceRate.toFixed(1)}%
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Trends;
