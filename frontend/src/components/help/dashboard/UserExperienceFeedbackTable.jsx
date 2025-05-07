/**
 * UserExperienceFeedbackTable.jsx
 * 
 * Component voor het weergeven van gebruikerservaring feedback in tabelvorm.
 * Toont gedetailleerde feedback inclusief commentaar en ratings.
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Skeleton,
  Typography,
  Rating,
  Chip,
  Tooltip,
  useTheme
} from '@mui/material';
import { format, parseISO } from 'date-fns';
import { nl } from 'date-fns/locale';

/**
 * UserExperienceFeedbackTable Component
 * 
 * Toont gebruikerservaring feedback in een sorteerbare en pagineerbare tabel.
 * 
 * @component
 */
const UserExperienceFeedbackTable = ({ data, loading }) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('created_at');
  
  // Kolom definities
  const columns = [
    { id: 'created_at', label: 'Datum', sortable: true },
    { id: 'page_context', label: 'Pagina', sortable: true },
    { id: 'user_role', label: 'Gebruikersrol', sortable: true },
    { id: 'experience_level', label: 'Ervaringsniveau', sortable: true },
    { id: 'rating', label: 'Beoordeling', sortable: true },
    { id: 'comments', label: 'Opmerkingen', sortable: false }
  ];
  
  // Helper functie voor het formatteren van gebruikersrollen
  const formatUserRole = (role) => {
    const roleMap = {
      'marketeer': 'Marketeer',
      'analyst': 'Analist',
      'product_manager': 'Product Manager',
      'general': 'Algemeen'
    };
    
    return roleMap[role] || role;
  };
  
  // Helper functie voor het formatteren van ervaringsniveaus
  const formatExperienceLevel = (level) => {
    const levelMap = {
      'beginner': 'Beginner',
      'intermediate': 'Gemiddeld',
      'advanced': 'Gevorderd'
    };
    
    return levelMap[level] || level;
  };
  
  // Helper functie voor het formatteren van pagina namen
  const formatPageName = (page) => {
    const pageMap = {
      'dashboard': 'Dashboard',
      'report': 'Rapportage',
      'sentiment': 'Sentiment Analyse',
      'trends': 'Trends',
      'awareness': 'Topic Awareness',
      'market-insights': 'Markt Inzichten'
    };
    
    return pageMap[page] || page;
  };
  
  // Helper functie voor het bepalen van de kleur op basis van de rating
  const getRatingColor = (rating) => {
    if (rating >= 4) return 'success';
    if (rating >= 3) return 'warning';
    return 'error';
  };
  
  // Handlers voor paginering en sortering
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  // Sorteer functie
  const sortData = (data) => {
    return data.sort((a, b) => {
      let valueA = a[orderBy];
      let valueB = b[orderBy];
      
      // Speciale behandeling voor datums
      if (orderBy === 'created_at') {
        valueA = new Date(valueA);
        valueB = new Date(valueB);
      }
      
      if (valueA < valueB) {
        return order === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };
  
  // Als er geen data is of als we aan het laden zijn, toon een skeleton
  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <Skeleton variant="rectangular" width="100%" height={50} sx={{ mb: 1 }} />
        {Array.from(new Array(5)).map((_, index) => (
          <Skeleton key={index} variant="rectangular" width="100%" height={40} sx={{ mb: 1 }} />
        ))}
      </Box>
    );
  }
  
  // Als er geen data is, toon een melding
  if (!data || data.length === 0) {
    return (
      <Box sx={{ width: '100%', p: 2, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Geen gebruikerservaring feedback beschikbaar voor de geselecteerde filters.
        </Typography>
      </Box>
    );
  }
  
  // Sorteer en pagineer de data
  const sortedData = sortData(data);
  const paginatedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  
  return (
    <Box sx={{ width: '100%' }}>
      <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell 
                  key={column.id}
                  sortDirection={orderBy === column.id ? order : false}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleRequestSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>
                  {format(parseISO(row.created_at), 'dd MMM yyyy HH:mm', { locale: nl })}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={formatPageName(row.page_context)} 
                    size="small" 
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{formatUserRole(row.user_role)}</TableCell>
                <TableCell>{formatExperienceLevel(row.experience_level)}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Rating 
                      value={row.rating} 
                      readOnly 
                      precision={0.5} 
                      size="small"
                      sx={{
                        '& .MuiRating-iconFilled': {
                          color: theme.palette[getRatingColor(row.rating)].main,
                        }
                      }}
                    />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {row.rating}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {row.comments ? (
                    <Tooltip title={row.comments} arrow>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          maxWidth: 250, 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap' 
                        }}
                      >
                        {row.comments}
                      </Typography>
                    </Tooltip>
                  ) : (
                    <Typography variant="body2" color="text.secondary" fontStyle="italic">
                      Geen opmerkingen
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Rijen per pagina:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} van ${count}`}
      />
    </Box>
  );
};

UserExperienceFeedbackTable.propTypes = {
  /**
   * Data voor de tabel
   */
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      created_at: PropTypes.string.isRequired,
      page_context: PropTypes.string.isRequired,
      user_role: PropTypes.string.isRequired,
      experience_level: PropTypes.string.isRequired,
      rating: PropTypes.number.isRequired,
      comments: PropTypes.string
    })
  ),
  
  /**
   * Loading state
   */
  loading: PropTypes.bool
};

UserExperienceFeedbackTable.defaultProps = {
  loading: false
};

export default UserExperienceFeedbackTable;
