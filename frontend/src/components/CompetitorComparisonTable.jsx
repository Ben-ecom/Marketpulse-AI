import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';

/**
 * Vergelijkingstabel component voor concurrentieanalyse
 * @param {object} props - Component properties
 * @param {array} props.competitors - Array met concurrentanalyses
 * @param {object} props.comparativeAnalysis - Vergelijkende analyse
 * @returns {JSX.Element} Vergelijkingstabel component
 */
const CompetitorComparisonTable = ({ competitors, comparativeAnalysis }) => {
  const [selectedCompetitors, setSelectedCompetitors] = useState([]);
  const [comparisonCategory, setComparisonCategory] = useState('overall');

  if (!competitors || competitors.length === 0 || !comparativeAnalysis) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Geen analysegegevens beschikbaar voor vergelijking
        </Typography>
      </Box>
    );
  }

  // Sorteer concurrenten op overall score
  const sortedCompetitors = [...competitors].sort((a, b) => {
    const scoreA = comparativeAnalysis.overallScores.find(s => s.name === a.name)?.overallScore || 0;
    const scoreB = comparativeAnalysis.overallScores.find(s => s.name === b.name)?.overallScore || 0;
    return scoreB - scoreA;
  });

  // Bereken gemiddelde scores
  const avgMessagingScore = comparativeAnalysis.overallScores.reduce(
    (sum, score) => sum + score.messagingScore, 0
  ) / comparativeAnalysis.overallScores.length;
  
  const avgGapScore = comparativeAnalysis.overallScores.reduce(
    (sum, score) => sum + score.gapScore, 0
  ) / comparativeAnalysis.overallScores.length;

  // Bepaal welke concurrenten te tonen
  const competitorsToShow = selectedCompetitors.length > 0
    ? sortedCompetitors.filter(c => selectedCompetitors.includes(c.name))
    : sortedCompetitors;

  // Bepaal vergelijkingscategorieën
  const getComparisonRows = () => {
    switch (comparisonCategory) {
      case 'overall':
        return [
          {
            name: 'Overall Score',
            getValue: (competitor) => {
              const score = comparativeAnalysis.overallScores.find(
                s => s.name === competitor.name
              )?.overallScore || 0;
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Rating value={score * 5} precision={0.5} readOnly size="small" />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    ({(score * 100).toFixed(0)}%)
                  </Typography>
                </Box>
              );
            }
          },
          {
            name: 'Messaging Effectiviteit',
            getValue: (competitor) => {
              const score = comparativeAnalysis.overallScores.find(
                s => s.name === competitor.name
              )?.messagingScore || 0;
              const isAboveAvg = score > avgMessagingScore;
              
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    {(score * 100).toFixed(0)}%
                  </Typography>
                  {isAboveAvg ? (
                    <TrendingUpIcon color="success" fontSize="small" />
                  ) : (
                    <TrendingDownIcon color="error" fontSize="small" />
                  )}
                </Box>
              );
            }
          },
          {
            name: 'Gap Dekking',
            getValue: (competitor) => {
              const score = comparativeAnalysis.overallScores.find(
                s => s.name === competitor.name
              )?.gapScore || 0;
              const isAboveAvg = score > avgGapScore;
              
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    {(score * 100).toFixed(0)}%
                  </Typography>
                  {isAboveAvg ? (
                    <TrendingUpIcon color="success" fontSize="small" />
                  ) : (
                    <TrendingDownIcon color="error" fontSize="small" />
                  )}
                </Box>
              );
            }
          }
        ];
      
      case 'messaging':
        return [
          {
            name: 'Toon',
            getValue: (competitor) => (
              <Typography variant="body2">
                {competitor.messaging?.toneOfVoice || 'Niet beschikbaar'}
              </Typography>
            )
          },
          {
            name: 'Belangrijkste Boodschappen',
            getValue: (competitor) => (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {competitor.messaging?.keyMessages?.slice(0, 2).map((message, idx) => (
                  <Typography key={idx} variant="body2" noWrap sx={{ maxWidth: 200 }}>
                    • {message}
                  </Typography>
                ))}
              </Box>
            )
          },
          {
            name: 'Effectiviteit',
            getValue: (competitor) => {
              const score = competitor.messaging?.overallEffectiveness || 0;
              return (
                <Rating value={score * 5} precision={0.5} readOnly size="small" />
              );
            }
          }
        ];
      
      case 'swot':
        return [
          {
            name: 'Sterke Punten',
            getValue: (competitor) => (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {competitor.swot?.strengths?.slice(0, 2).map((strength, idx) => (
                  <Chip 
                    key={idx} 
                    label={strength} 
                    size="small" 
                    color="success" 
                    variant="outlined"
                    sx={{ maxWidth: 200 }}
                  />
                ))}
              </Box>
            )
          },
          {
            name: 'Zwakke Punten',
            getValue: (competitor) => (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {competitor.swot?.weaknesses?.slice(0, 2).map((weakness, idx) => (
                  <Chip 
                    key={idx} 
                    label={weakness} 
                    size="small" 
                    color="error" 
                    variant="outlined"
                    sx={{ maxWidth: 200 }}
                  />
                ))}
              </Box>
            )
          },
          {
            name: 'Kansen',
            getValue: (competitor) => (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {competitor.swot?.opportunities?.slice(0, 2).map((opportunity, idx) => (
                  <Chip 
                    key={idx} 
                    label={opportunity} 
                    size="small" 
                    color="info" 
                    variant="outlined"
                    sx={{ maxWidth: 200 }}
                  />
                ))}
              </Box>
            )
          }
        ];
      
      case 'gaps':
        return [
          {
            name: 'Gap Score',
            getValue: (competitor) => (
              <Typography variant="body2">
                {(competitor.gaps?.overallGapScore * 100).toFixed(0)}%
              </Typography>
            )
          },
          {
            name: 'Niet-aangepakte Pijnpunten',
            getValue: (competitor) => (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {competitor.gaps?.unaddressedPainPoints?.slice(0, 2).map((point, idx) => (
                  <Typography key={idx} variant="body2" noWrap sx={{ maxWidth: 200 }}>
                    • {point.title}
                  </Typography>
                ))}
                {(!competitor.gaps?.unaddressedPainPoints || competitor.gaps.unaddressedPainPoints.length === 0) && (
                  <Typography variant="body2" color="text.secondary">
                    Geen gevonden
                  </Typography>
                )}
              </Box>
            )
          },
          {
            name: 'Niet-aangepakte Verlangens',
            getValue: (competitor) => (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {competitor.gaps?.unaddressedDesires?.slice(0, 2).map((desire, idx) => (
                  <Typography key={idx} variant="body2" noWrap sx={{ maxWidth: 200 }}>
                    • {desire.title}
                  </Typography>
                ))}
                {(!competitor.gaps?.unaddressedDesires || competitor.gaps.unaddressedDesires.length === 0) && (
                  <Typography variant="body2" color="text.secondary">
                    Geen gevonden
                  </Typography>
                )}
              </Box>
            )
          }
        ];
      
      default:
        return [];
    }
  };

  const comparisonRows = getComparisonRows();

  // Handlers
  const handleCompetitorChange = (event) => {
    setSelectedCompetitors(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setComparisonCategory(event.target.value);
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">
          Concurrent Vergelijking
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Concurrenten</InputLabel>
            <Select
              multiple
              value={selectedCompetitors}
              onChange={handleCompetitorChange}
              label="Concurrenten"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {sortedCompetitors.map((competitor) => (
                <MenuItem key={competitor.name} value={competitor.name}>
                  {competitor.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Categorie</InputLabel>
            <Select
              value={comparisonCategory}
              onChange={handleCategoryChange}
              label="Categorie"
            >
              <MenuItem value="overall">Overall</MenuItem>
              <MenuItem value="messaging">Messaging</MenuItem>
              <MenuItem value="swot">SWOT</MenuItem>
              <MenuItem value="gaps">Gaps</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Vergelijking</TableCell>
              {competitorsToShow.map((competitor) => (
                <TableCell key={competitor.name} align="center">
                  <Typography variant="subtitle2">{competitor.name}</Typography>
                  <Typography variant="caption" component="div" color="text.secondary">
                    <a href={competitor.url} target="_blank" rel="noopener noreferrer">
                      {competitor.url}
                    </a>
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {comparisonRows.map((row, index) => (
              <TableRow key={index}>
                <TableCell component="th" scope="row">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2">{row.name}</Typography>
                    <Tooltip title={`Vergelijking van ${row.name.toLowerCase()} tussen concurrenten`}>
                      <IconButton size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
                {competitorsToShow.map((competitor) => (
                  <TableCell key={`${competitor.name}-${index}`} align="center">
                    {row.getValue(competitor)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CompetitorComparisonTable;
