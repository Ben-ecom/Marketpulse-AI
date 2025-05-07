import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

/**
 * ErrorBoundary component voor het afvangen en tonen van fouten in React componenten
 * Gebaseerd op de React documentatie: https://reactjs.org/docs/error-boundaries.html
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state zodat de volgende render de fallback UI toont
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log de fout naar een error reporting service
    console.error("Component Error:", error);
    console.error("Component Stack:", errorInfo.componentStack);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Toon een fallback UI
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          bgcolor: 'background.default',
          p: 2
        }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              maxWidth: 600, 
              textAlign: 'center',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'error.light'
            }}
          >
            <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
            
            <Typography variant="h5" color="error" gutterBottom>
              Er is iets misgegaan
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 3 }}>
              Er is een fout opgetreden bij het laden van deze component. 
              Probeer de pagina te vernieuwen of ga terug naar de startpagina.
            </Typography>
            
            {this.props.showDetails && this.state.error && (
              <Box sx={{ 
                mt: 2, 
                p: 2, 
                bgcolor: 'grey.100', 
                borderRadius: 1,
                textAlign: 'left',
                overflow: 'auto',
                maxHeight: 200
              }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Foutdetails:
                </Typography>
                <Typography variant="body2" component="pre" sx={{ fontSize: '0.8rem' }}>
                  {this.state.error.toString()}
                </Typography>
                {this.state.errorInfo && (
                  <Typography variant="body2" component="pre" sx={{ fontSize: '0.8rem', mt: 1 }}>
                    {this.state.errorInfo.componentStack}
                  </Typography>
                )}
              </Box>
            )}
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => window.location.href = '/'}
              >
                Ga naar startpagina
              </Button>
              <Button 
                variant="contained" 
                onClick={() => window.location.reload()}
              >
                Pagina vernieuwen
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    // Als er geen fout is, render de children normaal
    return this.props.children;
  }
}

export default ErrorBoundary;
