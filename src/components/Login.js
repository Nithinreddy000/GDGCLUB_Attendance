import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import supabase from '../config/supabaseClient';
import logo from '../assests/gdglogo.jpg';

const updateUserDisplayName = async (displayName) => {
  try {
    const { data: { user }, error } = await supabase.auth.updateUser({
      data: { display_name: displayName }
    });

    if (error) throw error;
    return { user, error: null };
  } catch (error) {
    return { user: null, error };
  }
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getDisplayName = (email) => {
    const displayNameMap = {
      'nidhiiyer22@ifheindia.org': 'Nidhi Iyer',
      'ksahithi22@ifheindia.org': 'Sahithi',
      'ramdassarayu22@ifheindia.org': 'Sarayu',
      'nithinreddy3630@gmail.com': 'Nithin'
    };
    return displayNameMap[email.toLowerCase()] || '';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Try to sign in first
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // If sign in succeeds, update display name and proceed with login
      if (!signInError && signInData?.user) {
        const displayName = getDisplayName(email);
        if (displayName) {
          const { error: updateError } = await supabase.auth.updateUser({
            data: { display_name: displayName }
          });
          if (updateError) {
            console.error('Error updating display name:', updateError.message);
          }
        }
        await handleSuccessfulLogin(signInData.user);
        return;
      }

      // If sign in fails with invalid credentials, try to sign up
      if (signInError.message.includes('Invalid login credentials')) {
        const displayName = getDisplayName(email);
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              display_name: displayName
            }
          }
        });

        if (signUpError) {
          throw signUpError;
        }

        // If signup is successful but needs email confirmation
        if (signUpData?.user && !signUpData?.session) {
          setError('Please check your email for the confirmation link.');
          return;
        }

        // If signup and auto-confirmation successful
        if (signUpData?.user && signUpData?.session) {
          await handleSuccessfulLogin(signUpData.user);
          return;
        }
      } else {
        throw signInError;
      }
    } catch (error) {
      console.error('Auth error:', error);
      if (error.message.includes('Email not confirmed')) {
        // Try to auto-confirm the email
        try {
          const { error: confirmError } = await supabase.rpc('confirm_user', {
            target_user_id: email
          });

          if (!confirmError) {
            // Try signing in again after confirmation
            const { data: confirmedSignIn, error: confirmedSignInError } = await supabase.auth.signInWithPassword({
              email,
              password,
            });

            if (!confirmedSignInError && confirmedSignIn?.user) {
              await handleSuccessfulLogin(confirmedSignIn.user);
              return;
            }
          }
        } catch (confirmError) {
          console.error('Confirmation error:', confirmError);
        }
        setError('Please check your email for the confirmation link or try again in a few moments.');
      } else {
        setError(error.message || 'An error occurred during authentication.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessfulLogin = async (user) => {
    try {
      // Check if user exists in members table
      const { data: members, error: memberError } = await supabase
        .from('members')
        .select()
        .eq('user_id', user.id);

      if (memberError) {
        throw memberError;
      }

      const existingMember = members?.[0];

      if (!existingMember) {
        // Get the first department for new users
        const { data: departments, error: deptError } = await supabase
          .from('departments')
          .select('id')
          .limit(1);

        if (deptError) {
          throw deptError;
        }

        const defaultDepartmentId = departments?.[0]?.id;
        if (!defaultDepartmentId) {
          throw new Error('No departments found. Please contact administrator.');
        }

        // Add user to members table if they don't exist
        const { error: insertError } = await supabase
          .from('members')
          .insert([
            {
              user_id: user.id,
              name: user.user_metadata?.name || email.split('@')[0],
              email: user.email,
              department_id: defaultDepartmentId,
            }
          ]);

        if (insertError) {
          throw insertError;
        }
      }

      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || email.split('@')[0]
      }));

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Profile setup error:', error);
      setError('Error setting up user profile. Please try again.');
      // Clean up the auth session since profile setup failed
      await supabase.auth.signOut();
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(120deg, #e0f2f1 0%, #f5f5f5 100%)',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: isMobile ? 3 : 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="IFHE Logo"
            sx={{
              width: isMobile ? 200 : 250,
              height: 'auto',
              mb: 8,
            }}
          />
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleLogin}
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
            }}
          >
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              autoComplete="email"
              sx={{ mb: 1 }}
            />

            <TextField
              fullWidth
              label="Password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              type="password"
              autoComplete="current-password"
              sx={{ mb: 2 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                boxShadow: '0 4px 6px rgba(25, 118, 210, 0.25)',
                '&:hover': {
                  boxShadow: '0 6px 8px rgba(25, 118, 210, 0.35)',
                },
              }}
            >
              {loading ? 'Please wait...' : 'Sign In'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
