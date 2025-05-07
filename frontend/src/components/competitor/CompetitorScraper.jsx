import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Instagram as InstagramIcon,
  Facebook as FacebookIcon,
  YouTube as YouTubeIcon,
  Language as WebsiteIcon,
  ShoppingCart as ProductIcon,
  Visibility as ViewsIcon,
  Comment as CommentIcon,
  ThumbUp as LikeIcon
} from '@mui/icons-material';
import TikTokIcon from '../icons/TikTokIcon';
import { dataApi } from '../../api/apiClient';

const PLATFORM_TYPES = [
  { id: 'website', name: 'Website', icon: <WebsiteIcon /> },
  { id: 'product', name: 'Product Pagina', icon: <ProductIcon /> },
  { id: 'tiktok', name: 'TikTok', icon: <TikTokIcon /> },
  { id: 'instagram', name: 'Instagram', icon: <InstagramIcon /> },
  { id: 'facebook', name: 'Facebook', icon: <FacebookIcon /> },
  { id: 'youtube', name: 'YouTube', icon: <YouTubeIcon /> }
];

const CompetitorScraper = ({ projectId, onAnalysisComplete }) => {
  const [competitors, setCompetitors] = useState([
    { id: 1, name: '', links: [{ id: 1, url: '', platform: 'product' }] }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Voeg een nieuwe concurrent toe
  const addCompetitor = () => {
    const newId = competitors.length > 0 ? Math.max(...competitors.map(c => c.id)) + 1 : 1;
    setCompetitors([...competitors, { id: newId, name: '', links: [{ id: 1, url: '', platform: 'product' }] }]);
  };

  // Verwijder een concurrent
  const removeCompetitor = (id) => {
    if (competitors.length <= 1) {
      setError('Je moet minimaal één concurrent hebben');
      return;
    }
    setCompetitors(competitors.filter(c => c.id !== id));
  };

  // Update concurrent naam
  const updateCompetitorName = (id, name) => {
    setCompetitors(competitors.map(c => 
      c.id === id ? { ...c, name } : c
    ));
  };

  // Voeg een nieuwe link toe aan een concurrent
  const addLink = (competitorId) => {
    setCompetitors(competitors.map(c => {
      if (c.id === competitorId) {
        const newLinkId = c.links.length > 0 ? Math.max(...c.links.map(l => l.id)) + 1 : 1;
        return {
          ...c,
          links: [...c.links, { id: newLinkId, url: '', platform: 'product' }]
        };
      }
      return c;
    }));
  };

  // Verwijder een link van een concurrent
  const removeLink = (competitorId, linkId) => {
    setCompetitors(competitors.map(c => {
      if (c.id === competitorId) {
        if (c.links.length <= 1) {
          setError('Elke concurrent moet minimaal één link hebben');
          return c;
        }
        return {
          ...c,
          links: c.links.filter(l => l.id !== linkId)
        };
      }
      return c;
    }));
  };

  // Update link URL
  const updateLinkUrl = (competitorId, linkId, url) => {
    setCompetitors(competitors.map(c => 
      c.id === competitorId ? {
        ...c,
        links: c.links.map(l => 
          l.id === linkId ? { ...l, url } : l
        )
      } : c
    ));
  };

  // Update link platform
  const updateLinkPlatform = (competitorId, linkId, platform) => {
    setCompetitors(competitors.map(c => 
      c.id === competitorId ? {
        ...c,
        links: c.links.map(l => 
          l.id === linkId ? { ...l, platform } : l
        )
      } : c
    ));
  };

  // Valideer de invoer
  const validateInput = () => {
    // Controleer of alle concurrenten een naam hebben
    const emptyNames = competitors.some(c => !c.name.trim());
    if (emptyNames) {
      setError('Alle concurrenten moeten een naam hebben');
      return false;
    }

    // Controleer of alle links een URL hebben
    const emptyUrls = competitors.some(c => c.links.some(l => !l.url.trim()));
    if (emptyUrls) {
      setError('Alle links moeten een URL hebben');
      return false;
    }

    // Controleer of alle URLs geldig zijn
    const invalidUrls = competitors.some(c => 
      c.links.some(l => {
        try {
          new URL(l.url);
          return false;
        } catch (e) {
          return true;
        }
      })
    );
    if (invalidUrls) {
      setError('Alle URLs moeten geldig zijn (inclusief http:// of https://)');
      return false;
    }

    return true;
  };

  // Start de analyse
  const startAnalysis = async () => {
    if (!validateInput()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Formatteer de data voor de API
      const payload = {
        project_id: projectId,
        competitors: competitors.map(c => ({
          name: c.name,
          links: c.links.map(l => ({
            url: l.url,
            platform: l.platform
          }))
        }))
      };

      // Stuur naar de API
      const response = await dataApi.analyzeCompetitors(payload);
      
      setSuccess('Analyse succesvol gestart! Dit kan enkele minuten duren.');
      
      // Als er een callback is, roep deze aan met de resultaten
      if (onAnalysisComplete) {
        onAnalysisComplete(response.data);
      }
    } catch (err) {
      console.error('Fout bij analyseren van concurrenten:', err);
      setError(`Er is een fout opgetreden: ${err.message || 'Onbekende fout'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Concurrenten Analyse
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<AddIcon />} 
          onClick={addCompetitor}
          disabled={competitors.length >= 3}
        >
          Concurrent Toevoegen
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Typography variant="body2" color="text.secondary" paragraph>
        Voeg maximaal 3 concurrenten toe en hun links naar product pagina's en sociale media accounts. 
        We zullen deze analyseren op views, comments, likes en andere engagement metrics.
      </Typography>

      {competitors.map((competitor, index) => (
        <Card key={competitor.id} sx={{ mb: 3, position: 'relative' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Concurrent {index + 1}
              </Typography>
              <IconButton 
                color="error" 
                onClick={() => removeCompetitor(competitor.id)}
                disabled={competitors.length <= 1}
              >
                <DeleteIcon />
              </IconButton>
            </Box>

            <TextField
              fullWidth
              label="Naam concurrent"
              value={competitor.name}
              onChange={(e) => updateCompetitorName(competitor.id, e.target.value)}
              margin="normal"
              placeholder="Bijv. 'Competitor Inc.'"
            />

            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              Links
            </Typography>

            {competitor.links.map((link) => (
              <Grid container spacing={2} key={link.id} alignItems="center" sx={{ mb: 1 }}>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel id={`platform-label-${competitor.id}-${link.id}`}>Platform</InputLabel>
                    <Select
                      labelId={`platform-label-${competitor.id}-${link.id}`}
                      value={link.platform}
                      onChange={(e) => updateLinkPlatform(competitor.id, link.id, e.target.value)}
                      label="Platform"
                    >
                      {PLATFORM_TYPES.map(platform => (
                        <MenuItem key={platform.id} value={platform.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ mr: 1 }}>{platform.icon}</Box>
                            {platform.name}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={10} sm={8}>
                  <TextField
                    fullWidth
                    size="small"
                    label="URL"
                    value={link.url}
                    onChange={(e) => updateLinkUrl(competitor.id, link.id, e.target.value)}
                    placeholder="https://..."
                  />
                </Grid>
                <Grid item xs={2} sm={1}>
                  <IconButton 
                    color="error" 
                    onClick={() => removeLink(competitor.id, link.id)}
                    disabled={competitor.links.length <= 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}

            <Button
              variant="text"
              startIcon={<AddIcon />}
              onClick={() => addLink(competitor.id)}
              disabled={competitor.links.length >= 5}
              sx={{ mt: 1 }}
            >
              Link toevoegen
            </Button>
          </CardContent>
        </Card>
      ))}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          onClick={startAnalysis}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Bezig met analyseren...' : 'Start Analyse'}
        </Button>
      </Box>

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Tip:</strong> Voor de beste resultaten, voeg zowel product pagina's als sociale media accounts toe. 
          We zullen automatisch engagement metrics verzamelen zoals views, likes, comments en meer.
        </Typography>
      </Alert>
    </Box>
  );
};

export default CompetitorScraper;
