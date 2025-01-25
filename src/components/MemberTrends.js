import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  LinearProgress,
  InputAdornment,
  IconButton,
  CircularProgress,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingUpIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import supabase from '../config/supabaseClient';

const MemberTrends = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data: membersData, error } = await supabase
        .from('member_attendance_stats')
        .select('*')
        .order('department_name, member_name');

      if (error) throw error;
      setMembers(membersData || []);
    } catch (error) {
      console.error('Error fetching members:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member =>
    member.member_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.department_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = [
      '#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e',
      '#16a085', '#27ae60', '#2980b9', '#8e44ad', '#2c3e50',
      '#f1c40f', '#e67e22', '#e74c3c', '#95a5a6', '#f39c12',
      '#d35400', '#c0392b', '#7f8c8d',
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const getStatusColor = (attendanceRate) => {
    if (attendanceRate >= 75) return theme.palette.success.main;
    if (attendanceRate >= 50) return theme.palette.warning.main;
    return theme.palette.error.main;
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
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton
          onClick={() => navigate('/dashboard')}
          sx={{
            bgcolor: 'background.paper',
            '&:hover': { bgcolor: 'action.hover' },
            boxShadow: 1
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          <TrendingUpIcon /> Member Attendance Trends
        </Typography>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search members by name or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {filteredMembers.map((member) => (
          <Grid item xs={12} sm={6} md={4} key={member.member_id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: getAvatarColor(member.member_name),
                        width: 56,
                        height: 56,
                        mr: 2,
                      }}
                    >
                      {getInitials(member.member_name)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {member.member_name}
                      </Typography>
                      <Chip
                        label={member.department_name}
                        size="small"
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          mt: 0.5,
                        }}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Attendance Rate
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={member.attendance_rate}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: alpha(getStatusColor(member.attendance_rate), 0.1),
                            '& .MuiLinearProgress-bar': {
                              bgcolor: getStatusColor(member.attendance_rate),
                            },
                          }}
                        />
                      </Box>
                      <Typography variant="body2" fontWeight="bold">
                        {member.attendance_rate}%
                      </Typography>
                    </Box>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Card
                        sx={{
                          bgcolor: alpha(theme.palette.success.main, 0.1),
                          p: 1.5,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <EventIcon
                          sx={{
                            color: theme.palette.success.main,
                            fontSize: 28,
                            mb: 1,
                          }}
                        />
                        <Typography
                          variant="h6"
                          sx={{
                            color: theme.palette.success.dark,
                            fontWeight: 'bold',
                            textAlign: 'center',
                          }}
                        >
                          {member.total_events}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: theme.palette.success.dark,
                            textAlign: 'center',
                            fontWeight: 500,
                          }}
                        >
                          Total
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={4}>
                      <Card
                        sx={{
                          bgcolor: alpha(theme.palette.success.main, 0.1),
                          p: 1.5,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CheckCircleIcon
                          sx={{
                            color: theme.palette.success.main,
                            fontSize: 28,
                            mb: 1,
                          }}
                        />
                        <Typography
                          variant="h6"
                          sx={{
                            color: theme.palette.success.dark,
                            fontWeight: 'bold',
                            textAlign: 'center',
                          }}
                        >
                          {member.events_attended}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: theme.palette.success.dark,
                            textAlign: 'center',
                            fontWeight: 500,
                          }}
                        >
                          Attended
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={4}>
                      <Card
                        sx={{
                          bgcolor: alpha(theme.palette.error.main, 0.1),
                          p: 1.5,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CancelIcon
                          sx={{
                            color: theme.palette.error.main,
                            fontSize: 28,
                            mb: 1,
                          }}
                        />
                        <Typography
                          variant="h6"
                          sx={{
                            color: theme.palette.error.dark,
                            fontWeight: 'bold',
                            textAlign: 'center',
                          }}
                        >
                          {member.events_missed}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: theme.palette.error.dark,
                            textAlign: 'center',
                            fontWeight: 500,
                          }}
                        >
                          Missed
                        </Typography>
                      </Card>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default MemberTrends;
