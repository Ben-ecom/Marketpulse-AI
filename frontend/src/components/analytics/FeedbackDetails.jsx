import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  Tabs,
  Tab,
  Chip,
  Card,
  CardContent,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import { 
  ThumbUp, 
  ThumbDown, 
  Comment, 
  StarRate, 
  FilterList,
  Search,
  Person,
  AccessTime,
  Label
} from '@mui/icons-material';
import ContextualTooltip from '../help/ContextualTooltip';
import { HelpOutline } from '@mui/icons-material';

/**
 * FeedbackDetails Component
 * 
 * Toont gedetailleerde feedback items met paginatie en filtering.
 */
const FeedbackDetails = ({ data, pagination, onPaginationChange }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0); // 0: Help Feedback, 1: User Experience
  
  // Als er geen data is, toon een bericht
  if (!data) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1">Geen gedetailleerde feedback data beschikbaar.</Typography>
      </Box>
    );
  }
  
  // Verwerk help feedback details
  const helpFeedback = data.helpFeedback || { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
  
  // Verwerk user experience feedback details
  const userExperience = data.userExperience || { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
  
  // Verander actieve tab
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Verander pagina
  const handleChangePage = (event, newPage) => {
    onPaginationChange({ page: newPage + 1 });
  };
  
  // Verander aantal items per pagina
  const handleChangeRowsPerPage = (event) => {
    onPaginationChange({ page: 1, pageSize: parseInt(event.target.value, 10) });
  };
  
  // Converteer datum naar leesbaar formaat
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };
  
  // Converteer gebruikersrol naar leesbaar formaat
  const formatUserRole = (role) => {
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  
  // Converteer ervaringsniveau naar leesbaar formaat
  const formatExperienceLevel = (level) => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };
  
  // Genereer avatar voor gebruikersrol
  const getRoleAvatar = (role) => {
    const colors = {
      marketing_manager: theme.palette.primary.main,
      market_analyst: theme.palette.secondary.main,
      content_creator: theme.palette.info.main,
      executive: theme.palette.warning.main,
      product_manager: theme.palette.success.main
    };
    
    return (
      <Avatar 
        sx={{ 
          bgcolor: colors[role] || theme.palette.grey[500],
          width: 32,
          height: 32,
          fontSize: '0.875rem'
        }}
      >
        {role.split('_').map(word => word[0].toUpperCase()).join('')}
      </Avatar>
    );
  };
  
  return (
    <Box>
      {/* Tabs voor verschillende feedback types */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="feedback details tabs"
          variant="fullWidth"
        >
          <Tab 
            label={`Help Feedback (${helpFeedback.total})`} 
            id="tab-0"
            aria-controls="tabpanel-0"
          />
          <Tab 
            label={`Gebruikerservaring (${userExperience.total})`} 
            id="tab-1"
            aria-controls="tabpanel-1"
          />
        </Tabs>
      </Paper>
      
      {/* Help Feedback Details */}
      <TabPanel value={activeTab} index={0}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Help Feedback Details
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Gedetailleerde feedback items over specifieke help elementen in de applicatie.
          </Typography>
        </Box>
        
        {helpFeedback.items.length > 0 ? (
          <>
            <Box sx={{ mb: 3 }}>
              {helpFeedback.items.map((item, index) => (
                <Card key={item.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box display="flex" alignItems="center">
                        {getRoleAvatar(item.user_role)}
                        <Box ml={1}>
                          <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                            {formatUserRole(item.user_role)}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {formatExperienceLevel(item.experience_level)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <Tooltip title={item.feedback_value ? 'Positief' : 'Negatief'}>
                          <Chip 
                            icon={item.feedback_value ? <ThumbUp fontSize="small" /> : <ThumbDown fontSize="small" />} 
                            label={item.feedback_value ? 'Positief' : 'Negatief'} 
                            color={item.feedback_value ? 'success' : 'error'} 
                            size="small"
                            sx={{ mr: 1 }}
                          />
                        </Tooltip>
                        <Tooltip title={formatDate(item.created_at)}>
                          <Chip 
                            icon={<AccessTime fontSize="small" />} 
                            label={formatDate(item.created_at)} 
                            variant="outlined" 
                            size="small"
                          />
                        </Tooltip>
                      </Box>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Label fontSize="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="textSecondary">
                          Help Item: 
                        </Typography>
                        <Typography variant="body2" sx={{ ml: 1, textTransform: 'capitalize' }}>
                          {item.help_item_id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" mb={1}>
                        <Label fontSize="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="textSecondary">
                          Type: 
                        </Typography>
                        <Typography variant="body2" sx={{ ml: 1, textTransform: 'capitalize' }}>
                          {item.help_item_type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </Typography>
                      </Box>
                      
                      {item.comments && (
                        <Box mt={2}>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            Opmerkingen:
                          </Typography>
                          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                            <Typography variant="body2">
                              {item.comments}
                            </Typography>
                          </Paper>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
            
            <TablePagination
              component="div"
              count={helpFeedback.total}
              page={helpFeedback.page - 1}
              onPageChange={handleChangePage}
              rowsPerPage={helpFeedback.pageSize}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Items per pagina:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} van ${count}`}
            />
          </>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1">Geen help feedback items gevonden.</Typography>
          </Box>
        )}
      </TabPanel>
      
      {/* User Experience Feedback Details */}
      <TabPanel value={activeTab} index={1}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Gebruikerservaring Feedback Details
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Gedetailleerde feedback items over de algemene gebruikerservaring van de applicatie.
          </Typography>
        </Box>
        
        {userExperience.items.length > 0 ? (
          <>
            <Box sx={{ mb: 3 }}>
              {userExperience.items.map((item, index) => (
                <Card key={item.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box display="flex" alignItems="center">
                        {getRoleAvatar(item.user_role)}
                        <Box ml={1}>
                          <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                            {formatUserRole(item.user_role)}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {formatExperienceLevel(item.experience_level)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <Tooltip title={`Rating: ${item.rating}/5`}>
                          <Chip 
                            icon={<StarRate fontSize="small" />} 
                            label={`${item.rating}/5`} 
                            color={item.rating >= 4 ? 'success' : item.rating >= 3 ? 'info' : 'error'} 
                            size="small"
                            sx={{ mr: 1 }}
                          />
                        </Tooltip>
                        <Tooltip title={formatDate(item.created_at)}>
                          <Chip 
                            icon={<AccessTime fontSize="small" />} 
                            label={formatDate(item.created_at)} 
                            variant="outlined" 
                            size="small"
                          />
                        </Tooltip>
                      </Box>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Label fontSize="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="textSecondary">
                          Pagina Context: 
                        </Typography>
                        <Typography variant="body2" sx={{ ml: 1, textTransform: 'capitalize' }}>
                          {item.page_context.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </Typography>
                      </Box>
                      
                      {item.aspects && item.aspects.length > 0 && (
                        <Box display="flex" alignItems="center" mb={1}>
                          <Label fontSize="small" color="primary" sx={{ mr: 1 }} />
                          <Typography variant="body2" color="textSecondary">
                            Aspecten: 
                          </Typography>
                          <Box sx={{ ml: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {item.aspects.map((aspect, i) => (
                              <Chip 
                                key={i} 
                                label={aspect.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} 
                                size="small" 
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                      
                      {item.feedback && (
                        <Box mt={2}>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            Feedback:
                          </Typography>
                          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                            <Typography variant="body2">
                              {item.feedback}
                            </Typography>
                          </Paper>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
            
            <TablePagination
              component="div"
              count={userExperience.total}
              page={userExperience.page - 1}
              onPageChange={handleChangePage}
              rowsPerPage={userExperience.pageSize}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Items per pagina:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} van ${count}`}
            />
          </>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1">Geen gebruikerservaring feedback items gevonden.</Typography>
          </Box>
        )}
      </TabPanel>
    </Box>
  );
};

// TabPanel component voor het tonen van tab inhoud
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
};

export default FeedbackDetails;