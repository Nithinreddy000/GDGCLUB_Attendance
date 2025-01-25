import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
  IconButton,
  Card,
  CardContent,
  Grid,
  useTheme,
  useMediaQuery,
  Chip,
  alpha,
  Divider,
  Paper,
  InputAdornment,
  Collapse
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Check as CheckIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { motion, AnimatePresence } from 'framer-motion';
import supabase from '../config/supabaseClient';

const MotionContainer = motion(Container);
const MotionCard = motion(Card);

const AttendanceForm = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState(null);
  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDept, setExpandedDept] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select(`
          *,
          departments:department_id (
            id,
            name
          )
        `)
        .order('departments(name)', { ascending: true })
        .order('name');

      if (membersError) throw membersError;

      setMembers(membersData);
      const initialAttendance = {};
      membersData.forEach(member => {
        initialAttendance[member.id] = false;
      });
      setAttendance(initialAttendance);
    } catch (err) {
      console.error('Error fetching members:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!eventName || !eventDate) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(false);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const checkedMembers = Object.entries(attendance)
        .filter(([_, isPresent]) => isPresent)
        .map(([memberId]) => memberId);

      if (checkedMembers.length === 0) {
        setError('Please select at least one member');
        return;
      }

      // Group members by department
      const departmentAttendance = {};
      members.forEach(member => {
        if (attendance[member.id]) {
          const deptId = member.departments.id;
          if (!departmentAttendance[deptId]) {
            departmentAttendance[deptId] = {
              attendance_records: {},
              event_date: eventDate.toISOString().split('T')[0],
              event_name: eventName,
              department_id: deptId,
              created_by: user.id,
              present_count: 0
            };
          }
          departmentAttendance[deptId].attendance_records[member.id] = true;
          departmentAttendance[deptId].present_count++;
        }
      });

      // Insert attendance records for each department
      for (const deptId in departmentAttendance) {
        const { error: insertError } = await supabase
          .from('attendance_records')
          .insert([departmentAttendance[deptId]]);

        if (insertError) throw insertError;
      }

      setSuccess(true);
      setEventName('');
      setEventDate(null);
      setAttendance({});
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Error recording attendance:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectAll = (deptId) => {
    const deptMembers = members.filter(m => m.departments.id === deptId);
    const allSelected = deptMembers.every(m => attendance[m.id]);
    
    const newAttendance = { ...attendance };
    deptMembers.forEach(member => {
      newAttendance[member.id] = !allSelected;
    });
    setAttendance(newAttendance);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (value.trim()) {
      // Find the first department that has a matching member
      const matchingDept = members.find(member => 
        (member.name.toLowerCase().includes(value.toLowerCase()) ||
         member.departments.name.toLowerCase().includes(value.toLowerCase()))
      )?.departments?.id;
      
      if (matchingDept) {
        setExpandedDept(matchingDept);
      }
    }
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.departments.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedMembers = filteredMembers.reduce((acc, member) => {
    const deptId = member.departments.id;
    if (!acc[deptId]) {
      acc[deptId] = {
        name: member.departments.name,
        members: []
      };
    }
    acc[deptId].members.push(member);
    return acc;
  }, {});

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  return (
    <MotionContainer 
      maxWidth="lg" 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      sx={{ py: 4 }}
    >
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
          Record Attendance
        </Typography>
      </Box>

      <MotionCard
        variants={containerVariants}
        sx={{
          borderRadius: 3,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}
      >
        <CardContent>
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert 
              severity="success" 
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() => setSuccess(false)}
            >
              Attendance recorded successfully!
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Event Name"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  fullWidth
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Event Date"
                  value={eventDate}
                  onChange={setEventDate}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth required />
                  )}
                  maxDate={new Date()}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Select Present Members
              </Typography>
              <TextField
                placeholder="Search members or departments..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                fullWidth
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box>
                  {Object.entries(groupedMembers).map(([deptId, dept]) => (
                    <Paper
                      key={deptId}
                      sx={{
                        mb: 2,
                        borderRadius: 2,
                        overflow: 'hidden',
                        boxShadow: 'none',
                        border: 1,
                        borderColor: 'divider'
                      }}
                    >
                      <Box
                        sx={{
                          p: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          bgcolor: expandedDept === deptId ? 'action.hover' : 'transparent',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                        onClick={() => setExpandedDept(expandedDept === deptId ? null : deptId)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {dept.name}
                          </Typography>
                          <Chip
                            size="small"
                            label={`${dept.members.filter(m => attendance[m.id]).length}/${dept.members.length}`}
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: 'primary.main'
                            }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Button
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectAll(deptId);
                            }}
                            startIcon={dept.members.every(m => attendance[m.id]) ? <ClearIcon /> : <CheckIcon />}
                          >
                            {dept.members.every(m => attendance[m.id]) ? 'Unselect All' : 'Select All'}
                          </Button>
                          <ExpandMoreIcon
                            sx={{
                              transform: expandedDept === deptId ? 'rotate(180deg)' : 'rotate(0)',
                              transition: 'transform 0.3s'
                            }}
                          />
                        </Box>
                      </Box>
                      <Collapse in={expandedDept === deptId}>
                        <Divider />
                        <Box sx={{ p: 2 }}>
                          <Grid container spacing={2}>
                            {dept.members.map((member) => (
                              <Grid item xs={12} sm={6} md={4} key={member.id}>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={attendance[member.id] || false}
                                      onChange={(e) =>
                                        setAttendance({
                                          ...attendance,
                                          [member.id]: e.target.checked,
                                        })
                                      }
                                    />
                                  }
                                  label={member.name}
                                  sx={{
                                    width: '100%',
                                    m: 0,
                                    p: 1,
                                    borderRadius: 1,
                                    bgcolor: attendance[member.id] 
                                      ? alpha(theme.palette.primary.main, 0.1)
                                      : 'transparent',
                                    '&:hover': {
                                      bgcolor: attendance[member.id]
                                        ? alpha(theme.palette.primary.main, 0.15)
                                        : 'action.hover'
                                    }
                                  }}
                                />
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      </Collapse>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>

            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              mt: 4,
              flexDirection: { xs: 'column', sm: 'row' }
            }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/dashboard')}
                fullWidth={isMobile}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                fullWidth={isMobile}
              >
                {submitting ? 'Recording...' : 'Record Attendance'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </MotionCard>
    </MotionContainer>
  );
};

export default AttendanceForm;
