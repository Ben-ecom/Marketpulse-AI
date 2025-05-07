import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Card, CardContent, CardHeader, 
  Grid, Tabs, Tab, Paper, Button, 
  Chip, List, ListItem, ListItemText, ListItemIcon,
  Avatar
} from '@mui/material';
import {
  Science as ScienceIcon,
  Biotech as BiotechIcon,
  VerifiedUser as VerifiedUserIcon,
  ArrowBack as ArrowBackIcon,
  MenuBook as MenuBookIcon
} from '@mui/icons-material';

/**
 * Wetenschappelijk Onderzoek Pagina
 * Toont wetenschappelijke inzichten, claim-evidence mapping en marketingclaims
 */
const ScientificResearchPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Ga terug naar het project
  const handleGoBack = () => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
          sx={{ mr: 2 }}
        >
          Terug naar Project
        </Button>
        <Typography variant="h4">Wetenschappelijk Onderzoek</Typography>
      </Box>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Overzicht" icon={<ScienceIcon />} iconPosition="start" />
          <Tab label="Claim-Evidence Mapping" icon={<VerifiedUserIcon />} iconPosition="start" />
          <Tab label="Marketing Claims" icon={<BiotechIcon />} iconPosition="start" />
          <Tab label="Bronnen" icon={<MenuBookIcon />} iconPosition="start" />
        </Tabs>
      </Paper>
      
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title="Wetenschappelijk Onderzoek Overzicht"
                avatar={
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <ScienceIcon />
                  </Avatar>
                }
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="text.primary">
                        25
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Totaal Studies
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="text.primary">
                        8
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Hoge Kwaliteit Studies
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="text.primary">
                        32
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Gem. Citaties
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="text.primary">
                        15
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Recente Studies (&lt;2 jaar)
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
                
                <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                  Belangrijkste Bevindingen
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <VerifiedUserIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Verbeterde huidhydratatie" 
                      secondary="Studies tonen aan dat ingrediënten de huidhydratatie significant verbeteren na 4 weken gebruik."
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <VerifiedUserIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Collageen productie" 
                      secondary="In vitro onderzoek toont aan dat ingrediënten de collageen type I en III productie stimuleren."
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <VerifiedUserIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Anti-inflammatoire effecten" 
                      secondary="Meerdere studies tonen aan dat de ingrediënten ontstekingsmarkers zoals IL-6 en TNF-α significant verlagen."
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title="Claim-Evidence Mapping"
                avatar={
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <VerifiedUserIcon />
                  </Avatar>
                }
              />
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <VerifiedUserIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Verbetert huidhydratatie" 
                      secondary="Klinische studies tonen aan dat het product de huidhydratatie met 37% verbetert na 4 weken gebruik."
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <VerifiedUserIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Stimuleert collageen productie" 
                      secondary="In vitro onderzoek toont aan dat het product de collageen type I en III productie met 42% verhoogt."
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <VerifiedUserIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Vermindert fijne lijntjes" 
                      secondary="Klinische studies tonen aan dat het product fijne lijntjes met 18% vermindert na 8 weken gebruik."
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title="Marketing Claims"
                avatar={
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <BiotechIcon />
                  </Avatar>
                }
              />
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary={
                        <Box>
                          <Typography variant="subtitle1" gutterBottom>
                            <strong>Wetenschappelijke claim:</strong> Verbetert huidhydratatie
                          </Typography>
                          <Typography variant="h6" gutterBottom sx={{ color: 'secondary.main' }}>
                            Klinisch bewezen: Versterkt de huidhydratatie voor een stralende, gezonde huid
                          </Typography>
                          <Chip 
                            label="High" 
                            color="success"
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="body2" color="text.secondary" component="span">
                            Bron: PubMed
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText 
                      primary={
                        <Box>
                          <Typography variant="subtitle1" gutterBottom>
                            <strong>Wetenschappelijke claim:</strong> Stimuleert collageen productie
                          </Typography>
                          <Typography variant="h6" gutterBottom sx={{ color: 'secondary.main' }}>
                            Wetenschappelijk aangetoond: Boost de natuurlijke collageen productie voor een jeugdige uitstraling
                          </Typography>
                          <Chip 
                            label="Medium" 
                            color="primary"
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="body2" color="text.secondary" component="span">
                            Bron: PubMed
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title="Wetenschappelijke Bronnen"
                avatar={
                  <Avatar sx={{ bgcolor: 'info.main' }}>
                    <MenuBookIcon />
                  </Avatar>
                }
              />
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Clinical Evaluation of Topical Antioxidants for Skin Rejuvenation" 
                      secondary="Journal of Dermatological Science, 2020"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Vitamin C and Skin Health: A Systematic Review" 
                      secondary="International Journal of Cosmetic Science, 2021"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Hyaluronic Acid: Molecular Mechanisms and Therapeutic Trajectory in Skin Aging" 
                      secondary="Advances in Dermatology, 2021"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default ScientificResearchPage;
