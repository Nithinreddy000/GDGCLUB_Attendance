import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Skeleton,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import supabase from '../config/supabaseClient';

const MotionContainer = motion(Container);
const MotionCard = motion(Card);

const MembersTable = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departments, setDepartments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [recordAttendanceLoading, setRecordAttendanceLoading] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [loadingAddEdit, setLoadingAddEdit] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    department_id: '',
  });

  useEffect(() => {
    fetchMembers();
    fetchDepartments();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select(`
          id,
          name,
          department_id,
          departments (
            id,
            name
          )
        `)
        .order('name');

      if (membersError) throw membersError;
      setMembers(membersData);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');

      if (error) throw error;
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.departments?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (member = null) => {
    if (member) {
      setFormData({
        name: member.name,
        department_id: member.department_id,
      });
      setSelectedMember(member);
      setEditMode(true);
    } else {
      setFormData({
        name: '',
        department_id: '',
      });
      setSelectedMember(null);
      setEditMode(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMember(null);
    setEditMode(false);
    setFormData({
      name: '',
      department_id: '',
    });
  };

  const handleDeleteClick = (memberId) => {
    setSelectedMemberId(memberId);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedMemberId(null);
  };

  const handleConfirmDelete = async () => {
    setLoadingDelete(true);
    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', selectedMemberId);

      if (error) throw error;
      fetchMembers();
    } catch (error) {
      console.error('Error deleting member:', error);
    } finally {
      setLoadingDelete(false);
      handleCloseDeleteDialog();
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoadingAddEdit(true);
    try {
      if (editMode) {
        const { error } = await supabase
          .from('members')
          .update(formData)
          .eq('id', selectedMember.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('members')
          .insert([{ name: formData.name, department_id: formData.department_id }]);

        if (error) throw error;
      }

      handleCloseDialog();
      fetchMembers();
    } catch (error) {
      console.error('Error saving member:', error);
    } finally {
      setLoadingAddEdit(false);
    }
  };

  const handleRecordAttendance = async () => {
    setRecordAttendanceLoading(true);
    try {
      // Logic to record attendance goes here
      await recordAttendance(); // Replace with your actual function to record attendance
      setSuccessDialogOpen(true);
    } catch (error) {
      console.error('Error recording attendance:', error);
    } finally {
      setRecordAttendanceLoading(false);
    }
  };

  return (
    <MotionContainer
      maxWidth="lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
            Members Overview
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ ml: 2 }}
          >
            Add Member
          </Button>
          <Button onClick={handleRecordAttendance} disabled={recordAttendanceLoading} variant="contained" sx={{ ml: 2 }}>
            {recordAttendanceLoading ? 'Recording...' : 'Record Attendance'}
          </Button>
        </Box>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search members..."
              value={searchTerm}
              onChange={handleSearch}
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

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Department</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from(new Array(5)).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton animation="wave" /></TableCell>
                    <TableCell><Skeleton animation="wave" /></TableCell>
                    <TableCell><Skeleton animation="wave" /></TableCell>
                  </TableRow>
                ))
              ) : (
                filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={member.departments?.name} 
                        sx={{ 
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main
                        }} 
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(member)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(member.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Member' : 'Add New Member'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Department</InputLabel>
              <Select
                name="department_id"
                value={formData.department_id}
                onChange={handleInputChange}
                label="Department"
              >
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loadingAddEdit} variant="contained">
            {loadingAddEdit ? 'Saving...' : (editMode ? 'Save Changes' : 'Add Member')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this member?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} disabled={loadingDelete} color="secondary">
            {loadingDelete ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={successDialogOpen} onClose={() => setSuccessDialogOpen(false)}>
        <DialogTitle>Success</DialogTitle>
        <DialogContent>
          Attendance recorded successfully!
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setSuccessDialogOpen(false);
            navigate('/dashboard');
          }} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </MotionContainer>
  );
};

export default MembersTable;

