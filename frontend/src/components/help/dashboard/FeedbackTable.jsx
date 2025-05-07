/**
 * FeedbackTable.jsx
 * 
 * Component voor het weergeven van feedback in tabelvorm.
 * Kan feedback per help item, gebruikersrol of ervaringsniveau weergeven.
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
  LinearProgress,
  Chip,
  useTheme
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';

/**
 * FeedbackTable Component
 * 
 * Toont feedback gegevens in een sorteerbare en pagineerbare tabel.
 * 
 * @component
 */
const FeedbackTable = ({ data, loading, type }) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('total');
  
  // Helper functie voor het formatteren van kolom headers op basis van type
  const getColumnHeaders = () => {
    switch (type) {
      case 'help-item':
        return [
          { id: 'id', label: 'Help Item ID', sortable: true },
          { id: 'type', label: 'Type', sortable: true },
          { id: 'positive', label: 'Positief', sortable: true },
          { id: 'negative', label: 'Negatief', sortable: true },
          { id: 'total', label: 'Totaal', sortable: true },
          { id: 'positiveRatio', label: 'Positieve Ratio', sortable: true }
        ];
      case 'user-role':
        return [
          { id: 'role', label: 'Gebruikersrol', sortable: true },
          { id: 'positive', label: 'Positief', sortable: true },
          { id: 'negative', label: 'Negatief', sortable: true },
          { id: 'total', label: 'Totaal', sortable: true },
          { id: 'positiveRatio', label: 'Positieve Ratio', sortable: true }
        ];
      case 'experience-level':
        return [
          { id: 'level', label: 'Ervaringsniveau', sortable: true },
          { id: 'positive', label: 'Positief', sortable: true },
          { id: 'negative', label: 'Negatief', sortable: true },
          { id: 'total', label: 'Totaal', sortable: true },
          { id: 'positiveRatio', label: 'Positieve Ratio', sortable: true }
        ];
      default:
        return [];
    }
  };
  
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
  
  // Helper functie voor het formatteren van help item types
  const formatHelpItemType = (type) => {
    const typeMap = {
      'tooltip': 'Tooltip',
      'overlay': 'Overlay',
      'wizard': 'Wizard',
      'help_point': 'Help Punt',
      'video': 'Video',
      'learn_more': 'Meer Info',
      'general': 'Algemeen'
    };
    
    return typeMap[type] || type;
  };
  
  // Helper functie voor het bepalen van de kleur op basis van de positieve ratio
  const getColorForRatio = (ratio) => {
    if (ratio >= 80) return 'success';
    if (ratio >= 60) return 'warning';
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
      const valueA = a[orderBy];
      const valueB = b[orderBy];
      
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
          Geen feedback data beschikbaar voor de geselecteerde filters.
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
              {getColumnHeaders().map((column) => (
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
            {paginatedData.map((row, index) => {
              // Bepaal de juiste row key op basis van type
              let rowKey;
              switch (type) {
                case 'help-item':
                  rowKey = row.id;
                  break;
                case 'user-role':
                  rowKey = row.role;
                  break;
                case 'experience-level':
                  rowKey = row.level;
                  break;
                default:
                  rowKey = index;
              }
              
              return (
                <TableRow key={rowKey} hover>
                  {/* Eerste kolom is verschillend per type */}
                  {type === 'help-item' && (
                    <TableCell>{row.id}</TableCell>
                  )}
                  {type === 'user-role' && (
                    <TableCell>{formatUserRole(row.role)}</TableCell>
                  )}
                  {type === 'experience-level' && (
                    <TableCell>{formatExperienceLevel(row.level)}</TableCell>
                  )}
                  
                  {/* Type kolom alleen voor help-item */}
                  {type === 'help-item' && (
                    <TableCell>
                      <Chip 
                        label={formatHelpItemType(row.type)} 
                        size="small" 
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                  )}
                  
                  {/* Gemeenschappelijke kolommen */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ThumbUpIcon 
                        fontSize="small" 
                        sx={{ color: theme.palette.success.main, mr: 1 }} 
                      />
                      {row.positive}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ThumbDownIcon 
                        fontSize="small" 
                        sx={{ color: theme.palette.error.main, mr: 1 }} 
                      />
                      {row.negative}
                    </Box>
                  </TableCell>
                  <TableCell>{row.total}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={row.positiveRatio}
                          color={getColorForRatio(row.positiveRatio)}
                          sx={{ height: 10, borderRadius: 5 }}
                        />
                      </Box>
                      <Box sx={{ minWidth: 35 }}>
                        <Typography variant="body2" color="text.secondary">
                          {`${Math.round(row.positiveRatio)}%`}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
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

FeedbackTable.propTypes = {
  /**
   * Data voor de tabel
   */
  data: PropTypes.array,
  
  /**
   * Loading state
   */
  loading: PropTypes.bool,
  
  /**
   * Type van de feedback tabel
   */
  type: PropTypes.oneOf(['help-item', 'user-role', 'experience-level']).isRequired
};

FeedbackTable.defaultProps = {
  loading: false
};

export default FeedbackTable;
