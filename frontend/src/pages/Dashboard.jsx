import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Skeleton,
  Chip,
  Divider,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  DataObject as DataIcon,
  Insights as InsightsIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { supabase } from '../api/supabase';
import { useAuthStore } from '../store/authStore';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [deleteError, setDeleteError] = useState('');

  // Ophalen van projecten
  const {
    data: projects,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery(
    ['projects'],
    async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    {
      enabled: !!user,
      staleTime: 1000 * 60 * 5, // 5 minuten
    }
  );

  // Project verwijderen
  const handleDeleteProject = async (projectId) => {
    try {
      setDeleteError('');
      
      // Verwijder project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      
      // Ververs projectenlijst
      refetch();
    } catch (error) {
      console.error('Fout bij verwijderen project:', error.message);
      setDeleteError('Er is een fout opgetreden bij het verwijderen van het project.');
    }
  };

  // Formatteren van datum
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('nl-NL', options);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Dashboard
        </Typography>
        <Box>
          <Tooltip title="Ververs projecten">
            <IconButton onClick={() => refetch()} sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/projects/new')}
          >
            Nieuw Project
          </Button>
        </Box>
      </Box>

      {deleteError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setDeleteError('')}>
          {deleteError}
        </Alert>
      )}

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Er is een fout opgetreden bij het ophalen van projecten: {error.message}
        </Alert>
      )}

      {isLoading ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} md={6} lg={4} key={item}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Skeleton variant="text" width="60%" height={40} />
                  <Skeleton variant="text" width="40%" height={20} sx={{ mb: 2 }} />
                  <Skeleton variant="rectangular" height={100} />
                </CardContent>
                <CardActions>
                  <Skeleton variant="rectangular" width={100} height={36} />
                  <Skeleton variant="rectangular" width={100} height={36} sx={{ ml: 1 }} />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : projects && projects.length > 0 ? (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} md={6} lg={4} key={project.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {project.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Aangemaakt op {formatDate(project.created_at)}
                  </Typography>
                  <Chip 
                    label={project.category} 
                    size="small" 
                    sx={{ mb: 2 }} 
                    color="primary" 
                    variant="outlined" 
                  />
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="body2">
                    {project.product_details?.description || 'Geen beschrijving beschikbaar'}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <Box>
                    <Button 
                      size="small" 
                      startIcon={<DataIcon />}
                      onClick={() => navigate(`/projects/${project.id}/data`)}
                      sx={{ mr: 1 }}
                    >
                      Data
                    </Button>
                    <Button 
                      size="small" 
                      startIcon={<InsightsIcon />}
                      onClick={() => navigate(`/projects/${project.id}/insights`)}
                    >
                      Inzichten
                    </Button>
                  </Box>
                  <Tooltip title="Verwijder project">
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteProject(project.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 8, 
            px: 3,
            backgroundColor: 'background.paper',
            borderRadius: 2,
            border: '1px dashed',
            borderColor: 'divider'
          }}
        >
          <Typography variant="h6" paragraph>
            Je hebt nog geen projecten
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Maak je eerste project aan om marktonderzoek en consumenteninzichten te verzamelen.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/projects/new')}
            sx={{ mt: 2 }}
          >
            Nieuw Project
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;
