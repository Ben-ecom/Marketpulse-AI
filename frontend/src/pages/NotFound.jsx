import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';

const NotFound = () => {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          py: 5,
        }}
      >
        <Typography variant="h1" component="h1" sx={{ fontSize: '8rem', fontWeight: 700, color: 'primary.main' }}>
          404
        </Typography>
        <Typography variant="h4" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
          Pagina niet gevonden
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: '600px' }}>
          De pagina die je probeert te bezoeken bestaat niet of is verplaatst.
          Controleer de URL of ga terug naar de startpagina.
        </Typography>
        <Button
          component={RouterLink}
          to="/"
          variant="contained"
          startIcon={<HomeIcon />}
          size="large"
        >
          Terug naar startpagina
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;
