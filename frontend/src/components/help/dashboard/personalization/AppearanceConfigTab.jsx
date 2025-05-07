/**
 * AppearanceConfigTab.jsx
 * 
 * Component voor het configureren van het uiterlijk van het dashboard.
 * Biedt opties voor layout, thema en real-time updates.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Typography, 
  Paper,
  FormControl,
  FormControlLabel,
  FormLabel,
  RadioGroup,
  Radio,
  Switch,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Divider
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import ViewComfyIcon from '@mui/icons-material/ViewComfy';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';

/**
 * AppearanceConfigTab component
 * @component
 */
const AppearanceConfigTab = ({ appearanceConfig, setAppearanceConfig }) => {
  // Handler voor wijzigen van layout
  const handleLayoutChange = (event) => {
    setAppearanceConfig({
      ...appearanceConfig,
      layout: event.target.value
    });
  };
  
  // Handler voor wijzigen van thema
  const handleThemeChange = (event) => {
    setAppearanceConfig({
      ...appearanceConfig,
      theme: event.target.value
    });
  };
  
  // Handler voor wijzigen van real-time instelling
  const handleRealtimeChange = (event) => {
    setAppearanceConfig({
      ...appearanceConfig,
      realtimeEnabled: event.target.checked
    });
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Dashboard Uiterlijk
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Pas het uiterlijk en gedrag van het dashboard aan volgens je voorkeuren.
      </Typography>
      
      <Grid container spacing={3}>
        {/* Layout opties */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>
              Layout
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                value={appearanceConfig.layout}
                onChange={handleLayoutChange}
              >
                <FormControlLabel 
                  value="default" 
                  control={<Radio />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DashboardIcon sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="body1">Standaard</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Gebalanceerde layout met medium-sized widgets
                        </Typography>
                      </Box>
                    </Box>
                  } 
                />
                <FormControlLabel 
                  value="compact" 
                  control={<Radio />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ViewCompactIcon sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="body1">Compact</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Meer widgets per rij, kleinere grafieken
                        </Typography>
                      </Box>
                    </Box>
                  } 
                />
                <FormControlLabel 
                  value="expanded" 
                  control={<Radio />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ViewComfyIcon sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="body1">Uitgebreid</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Grotere grafieken, minder widgets per rij
                        </Typography>
                      </Box>
                    </Box>
                  } 
                />
              </RadioGroup>
            </FormControl>
          </Paper>
        </Grid>
        
        {/* Thema opties */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>
              Thema
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                value={appearanceConfig.theme}
                onChange={handleThemeChange}
              >
                <FormControlLabel 
                  value="light" 
                  control={<Radio />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LightModeIcon sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="body1">Licht</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Lichte achtergrond, donkere tekst
                        </Typography>
                      </Box>
                    </Box>
                  } 
                />
                <FormControlLabel 
                  value="dark" 
                  control={<Radio />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DarkModeIcon sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="body1">Donker</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Donkere achtergrond, lichte tekst
                        </Typography>
                      </Box>
                    </Box>
                  } 
                />
                <FormControlLabel 
                  value="system" 
                  control={<Radio />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SettingsBrightnessIcon sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="body1">Systeem</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Volgt de systeeminstelling van je apparaat
                        </Typography>
                      </Box>
                    </Box>
                  } 
                />
              </RadioGroup>
            </FormControl>
          </Paper>
        </Grid>
        
        {/* Real-time updates */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Real-time Updates
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body1">Real-time updates inschakelen</Typography>
                <Typography variant="caption" color="text.secondary">
                  Het dashboard wordt automatisch bijgewerkt wanneer er nieuwe gegevens beschikbaar zijn
                </Typography>
              </Box>
              <Switch
                checked={appearanceConfig.realtimeEnabled}
                onChange={handleRealtimeChange}
                inputProps={{ 'aria-label': 'real-time updates' }}
              />
            </Box>
          </Paper>
        </Grid>
        
        {/* Voorbeeld */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Voorbeeld
            </Typography>
            <Typography variant="caption" color="text.secondary" paragraph>
              Zo zal je dashboard eruit zien met de geselecteerde instellingen.
            </Typography>
            
            <Card sx={{ 
              bgcolor: appearanceConfig.theme === 'dark' ? '#121212' : '#fff',
              color: appearanceConfig.theme === 'dark' ? '#fff' : '#121212',
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <CardContent>
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: 
                    appearanceConfig.layout === 'compact' ? 'repeat(3, 1fr)' : 
                    appearanceConfig.layout === 'expanded' ? 'repeat(1, 1fr)' : 
                    'repeat(2, 1fr)',
                  gap: 2
                }}>
                  {[1, 2, 3, 4].map((item) => (
                    <Box 
                      key={item}
                      sx={{ 
                        height: 
                          appearanceConfig.layout === 'compact' ? 100 : 
                          appearanceConfig.layout === 'expanded' ? 200 : 
                          150,
                        bgcolor: appearanceConfig.theme === 'dark' ? '#1e1e1e' : '#f5f5f5',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: appearanceConfig.theme === 'dark' ? '#ddd' : '#333'
                      }}
                    >
                      Widget {item}
                    </Box>
                  ))}
                </Box>
                
                {appearanceConfig.realtimeEnabled && (
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <Typography variant="caption" color="primary">
                      ● Live
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

AppearanceConfigTab.propTypes = {
  /**
   * De huidige uiterlijk configuratie
   */
  appearanceConfig: PropTypes.shape({
    layout: PropTypes.oneOf(['default', 'compact', 'expanded']).isRequired,
    theme: PropTypes.oneOf(['light', 'dark', 'system']).isRequired,
    realtimeEnabled: PropTypes.bool.isRequired
  }).isRequired,
  
  /**
   * Functie voor het bijwerken van de uiterlijk configuratie
   */
  setAppearanceConfig: PropTypes.func.isRequired
};

export default AppearanceConfigTab;