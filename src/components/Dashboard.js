import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  IconButton,
  Paper,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Assessment as AssessmentIcon,
  EventNote as EventNoteIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import logo from '../assests/gdglogo.jpg';
import supabase from '../config/supabaseClient';

const MotionCard = motion(Card);

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isHovered, setIsHovered] = useState(null);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user?.user_metadata?.display_name) {
        setDisplayName(user.user_metadata.display_name);
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const menuItems = [
    {
      title: 'Record Attendance',
      icon: <EventNoteIcon sx={{ fontSize: 40 }} />,
      description: 'Take attendance for events and meetings',
      path: '/attendance',
      color: theme.palette.primary.main
    },
    {
      title: 'Members Overview',
      icon: <PersonIcon sx={{ fontSize: 40 }} />,
      description: 'View and manage all registered members',
      path: '/members',
      color: theme.palette.secondary.main
    },
    {
      title: 'View Trends',
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      description: 'Analyze attendance patterns and statistics',
      path: '/trends',
      color: '#00bcd4'
    },
    {
      title: 'Member Trends',
      icon: <PersonAddIcon sx={{ fontSize: 40 }} />,
      description: 'View individual member statistics',
      path: '/member-trends',
      color: '#f59e0b'
    }
  ];

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          mb: 4
        }}
      >
        <Toolbar>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <img src={logo} alt="Logo" style={{ height: '40px', marginRight: '16px' }} />
            <Typography variant="h6" component="div" sx={{ color: 'text.primary', display: { xs: 'none', sm: 'block' } }}>
              GDG IFHE
            </Typography>
          </Box>
          <IconButton 
            onClick={handleLogout} 
            sx={{ 
              color: 'text.primary',
              ml: isMobile ? 0 : 2,
              padding: isMobile ? '8px' : '12px'
            }}
          >
            <LogoutIcon sx={{ fontSize: isMobile ? 20 : 24 }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography
            component={motion.h1}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            variant="h3"
            sx={{
              fontWeight: 600,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              textAlign: 'center',
              mb: 2
            }}
          >
            Welcome, {displayName || 'User'}!
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {menuItems.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={item.title}>
              <MotionCard
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  bgcolor: 'background.paper',
                  borderRadius: 3,
                  boxShadow: isHovered === item.title 
                    ? `0 8px 32px ${alpha(item.color, 0.2)}`
                    : '0 2px 12px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease-in-out',
                }}
                onMouseEnter={() => setIsHovered(item.title)}
                onMouseLeave={() => setIsHovered(null)}
                onClick={() => navigate(item.path)}
              >
                <CardContent sx={{ 
                  p: 4,
                  '&:last-child': { pb: 4 },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center'
                }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '50%',
                      bgcolor: alpha(item.color, 0.1),
                      color: item.color,
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography 
                    variant="h5" 
                    component="h2"
                    sx={{ 
                      mb: 1,
                      fontWeight: 600,
                      color: 'text.primary'
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography 
                    variant="body1"
                    color="text.secondary"
                    sx={{ 
                      lineHeight: 1.6,
                      maxWidth: '80%'
                    }}
                  >
                    {item.description}
                  </Typography>
                </CardContent>
              </MotionCard>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;
