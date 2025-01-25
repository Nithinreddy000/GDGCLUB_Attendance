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
  TablePagination,
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [departments, setDepartments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    department_id: '',
    phone: ''
  });

  useEffect(() => {
    fetchMembers();
    fetchDepartments();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('members')
        .select(`
          *,
          departments:department_id (
            id,
            name
          )
        `)
        .order('name');

      if (error) throw error;
      setMembers(data);
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.departments.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMember = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .insert([{
          name: newMember.name,
          email: newMember.email,
          department_id: newMember.department_id,
          phone: newMember.phone
        }]);

      if (error) throw error;
      
      fetchMembers();
      setOpenDialog(false);
      setNewMember({ name: '', email: '', department_id: '', phone: '' });
    } catch (error) {
      console.error('Error adding member:', error);
    }
  };

  const handleEditMember = async () => {
    try {
      const { error } = await supabase
        .from('members')
        .update({
          name: editMember.name,
          email: editMember.email,
          department_id: editMember.department_id,
          phone: editMember.phone
        })
        .eq('id', editMember.id);

      if (error) throw error;
      
      fetchMembers();
      setOpenDialog(false);
      setEditMember(null);
    } catch (error) {
      console.error('Error updating member:', error);
    }
  };

  const handleDeleteMember = async (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        const { error } = await supabase
          .from('members')
          .delete()
          .eq('id', id);

        if (error) throw error;
        fetchMembers();
      } catch (error) {
        console.error('Error deleting member:', error);
      }
    }
  };

  return (
    <MotionContainer 
      maxWidth="lg" 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
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
          Members Overview
        </Typography>
      </Box>

      <MotionCard
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        sx={{
          mb: 4,
          borderRadius: 3,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        <CardContent>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            mb: 3,
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between'
          }}>
            <TextField
              placeholder="Search members..."
              value={searchTerm}
              onChange={handleSearch}
              variant="outlined"
              size="small"
              sx={{ flexGrow: 1, maxWidth: { sm: 300 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditMember(null);
                setOpenDialog(true);
              }}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 3
              }}
            >
              Add Member
            </Button>
          </Box>

          <TableContainer component={Paper} elevation={0}>
            {loading ? (
              [...Array(5)].map((_, index) => (
                <Skeleton
                  key={index}
                  variant="rectangular"
                  height={53}
                  sx={{ my: 0.5 }}
                />
              ))
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    {!isMobile && <TableCell>Email</TableCell>}
                    <TableCell>Department</TableCell>
                    {!isMobile && <TableCell>Phone</TableCell>}
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <AnimatePresence>
                    {filteredMembers
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((member) => (
                        <motion.tr
                          key={member.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <TableCell component="th" scope="row">
                            {member.name}
                          </TableCell>
                          {!isMobile && <TableCell>{member.email}</TableCell>}
                          <TableCell>
                            <Chip
                              label={member.departments.name}
                              size="small"
                              sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: 'primary.main'
                              }}
                            />
                          </TableCell>
                          {!isMobile && <TableCell>{member.phone}</TableCell>}
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setEditMember(member);
                                setOpenDialog(true);
                              }}
                              sx={{ color: 'primary.main' }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteMember(member.id)}
                              sx={{ color: 'error.main' }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </motion.tr>
                      ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            )}
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredMembers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </CardContent>
      </MotionCard>

      <Dialog 
        open={openDialog} 
        onClose={() => {
          setOpenDialog(false);
          setEditMember(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editMember ? 'Edit Member' : 'Add New Member'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ 
            display: 'grid', 
            gap: 2,
            pt: 2
          }}>
            <TextField
              label="Name"
              fullWidth
              value={editMember ? editMember.name : newMember.name}
              onChange={(e) => {
                if (editMember) {
                  setEditMember({ ...editMember, name: e.target.value });
                } else {
                  setNewMember({ ...newMember, name: e.target.value });
                }
              }}
            />
            <TextField
              label="Email"
              fullWidth
              value={editMember ? editMember.email : newMember.email}
              onChange={(e) => {
                if (editMember) {
                  setEditMember({ ...editMember, email: e.target.value });
                } else {
                  setNewMember({ ...newMember, email: e.target.value });
                }
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={editMember ? editMember.department_id : newMember.department_id}
                label="Department"
                onChange={(e) => {
                  if (editMember) {
                    setEditMember({ ...editMember, department_id: e.target.value });
                  } else {
                    setNewMember({ ...newMember, department_id: e.target.value });
                  }
                }}
              >
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Phone"
              fullWidth
              value={editMember ? editMember.phone : newMember.phone}
              onChange={(e) => {
                if (editMember) {
                  setEditMember({ ...editMember, phone: e.target.value });
                } else {
                  setNewMember({ ...newMember, phone: e.target.value });
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setOpenDialog(false);
              setEditMember(null);
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={editMember ? handleEditMember : handleAddMember}
          >
            {editMember ? 'Save Changes' : 'Add Member'}
          </Button>
        </DialogActions>
      </Dialog>
    </MotionContainer>
  );
};

export default MembersTable;
