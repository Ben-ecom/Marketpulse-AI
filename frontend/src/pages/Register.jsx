import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  Paper,
  Container,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { supabase } from '../api/supabase';
import { useAuthStore } from '../store/authStore';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const validateForm = () => {
    if (!name.trim()) {
      setError('Vul je naam in');
      return false;
    }
    if (!email.trim()) {
      setError('Vul je e-mailadres in');
      return false;
    }
    if (password.length < 6) {
      setError('Wachtwoord moet minimaal 6 tekens bevatten');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Registreer gebruiker met Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        throw error;
      }

      // Als er een bevestigingsmail is verzonden
      if (data.user && !data.user.confirmed_at) {
        navigate('/login', { 
          state: { 
            message: 'Registratie succesvol! Controleer je e-mail om je account te bevestigen.' 
          } 
        });
        return;
      }

      // Als de gebruiker direct is ingelogd
      setUser(data.user);

      // Maak profiel aan in de profieltabel
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            name,
            email,
            created_at: new Date().toISOString(),
          },
        ]);

      if (profileError) {
        console.error('Fout bij aanmaken profiel:', profileError.message);
        // We gaan door, omdat de auth wel is aangemaakt
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Registratie error:', error.message);
      if (error.message.includes('already registered')) {
        setError('Dit e-mailadres is al geregistreerd. Probeer in te loggen.');
      } else {
        setError('Er is een fout opgetreden bij het registreren. Probeer het later opnieuw.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
            width: '100%',
          }}
          className="slide-up"
        >
          <Typography component="h1" variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
            MarketPulse AI
          </Typography>
          <Typography component="h2" variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            Maak een nieuw account aan
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Naam"
              name="name"
              autoComplete="name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="E-mailadres"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Wachtwoord"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Bevestig wachtwoord"
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Registreren'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2">
                Heb je al een account? Log hier in
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
