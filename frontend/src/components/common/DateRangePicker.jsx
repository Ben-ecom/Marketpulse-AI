import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Button, 
  TextField, 
  Popover, 
  Typography, 
  Stack,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import { 
  DateRange as DateRangeIcon,
  CalendarToday as CalendarIcon,
  ArrowForward as ArrowForwardIcon,
  Info as InfoIcon
} from '@mui/icons-material';

/**
 * DateRangePicker Component
 * 
 * Een toegankelijke component voor het selecteren van een datumbereik.
 * Biedt een gebruiksvriendelijke interface met voorgedefinieerde periodes en
 * de mogelijkheid om een aangepast datumbereik te selecteren.
 * 
 * @component
 * @example
 * ```jsx
 * <DateRangePicker 
 *   value={{ startDate: new Date(), endDate: new Date() }} 
 *   onChange={handleDateRangeChange}
 *   aria-label="Selecteer datumbereik"
 * />
 * ```
 */
const DateRangePicker = ({ 
  value, 
  onChange, 
  disabled = false,
  ...props 
}) => {
  // State voor de popover
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Voorgedefinieerde periodes
  const predefinedRanges = [
    { label: 'Afgelopen 7 dagen', days: 7 },
    { label: 'Afgelopen 30 dagen', days: 30 },
    { label: 'Afgelopen 90 dagen', days: 90 },
    { label: 'Afgelopen 12 maanden', days: 365 },
    { label: 'Jaar tot nu toe', type: 'ytd' },
    { label: 'Aangepast bereik', type: 'custom' }
  ];
  
  // Tijdelijke state voor aangepast datumbereik
  const [tempDateRange, setTempDateRange] = useState({
    startDate: value.startDate,
    endDate: value.endDate
  });
  
  // Formatteert een datum naar een string (YYYY-MM-DD)
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Formatteert een datum naar een leesbare string (DD-MM-YYYY)
  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  // Handler voor het openen van de popover
  const handleClick = (event) => {
    if (!disabled) {
      setAnchorEl(event.currentTarget);
    }
  };
  
  // Handler voor het sluiten van de popover
  const handleClose = () => {
    setAnchorEl(null);
    // Reset tijdelijke datumbereik
    setTempDateRange({
      startDate: value.startDate,
      endDate: value.endDate
    });
  };
  
  // Handler voor het toepassen van het geselecteerde datumbereik
  const handleApply = () => {
    onChange(tempDateRange);
    handleClose();
  };
  
  // Handler voor het selecteren van een voorgedefinieerde periode
  const handleSelectPredefinedRange = (range) => {
    let startDate = new Date();
    let endDate = new Date();
    
    if (range.type === 'ytd') {
      // Jaar tot nu toe
      startDate = new Date(new Date().getFullYear(), 0, 1); // 1 januari van het huidige jaar
    } else if (range.type === 'custom') {
      // Aangepast bereik - doe niets, laat de gebruiker de datums selecteren
      return;
    } else {
      // Afgelopen X dagen
      startDate = new Date();
      startDate.setDate(startDate.getDate() - range.days);
    }
    
    setTempDateRange({ startDate, endDate });
  };
  
  // Handler voor het wijzigen van de startdatum
  const handleStartDateChange = (event) => {
    const newStartDate = new Date(event.target.value);
    setTempDateRange(prev => ({
      ...prev,
      startDate: newStartDate
    }));
  };
  
  // Handler voor het wijzigen van de einddatum
  const handleEndDateChange = (event) => {
    const newEndDate = new Date(event.target.value);
    setTempDateRange(prev => ({
      ...prev,
      endDate: newEndDate
    }));
  };
  
  // Bepaal of de popover open is
  const open = Boolean(anchorEl);
  const id = open ? 'date-range-popover' : undefined;
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Button
        variant="outlined"
        startIcon={<DateRangeIcon />}
        onClick={handleClick}
        disabled={disabled}
        aria-describedby={id}
        size="small"
        sx={{ minWidth: 200 }}
        {...props}
      >
        {formatDisplayDate(value.startDate)} - {formatDisplayDate(value.endDate)}
      </Button>
      
      <Tooltip 
        title="Selecteer een datumbereik voor de analyse. Dit filtert de data op basis van de geselecteerde periode."
        arrow
      >
        <IconButton size="small" sx={{ ml: 1 }} aria-label="Meer informatie over datumbereik">
          <InfoIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, width: 320 }}>
          <Typography variant="subtitle1" gutterBottom>
            <CalendarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Selecteer datumbereik
          </Typography>
          
          <Divider sx={{ my: 1 }} />
          
          {/* Voorgedefinieerde periodes */}
          <Stack spacing={1} sx={{ mb: 2 }}>
            {predefinedRanges.map((range) => (
              <Button 
                key={range.label}
                variant="text"
                size="small"
                onClick={() => handleSelectPredefinedRange(range)}
                sx={{ justifyContent: 'flex-start' }}
              >
                {range.label}
              </Button>
            ))}
          </Stack>
          
          <Divider sx={{ my: 1 }} />
          
          {/* Aangepast datumbereik */}
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                label="Startdatum"
                type="date"
                size="small"
                value={formatDate(tempDateRange.startDate)}
                onChange={handleStartDateChange}
                InputLabelProps={{ shrink: true }}
                inputProps={{ 
                  'aria-label': 'Startdatum',
                  max: formatDate(tempDateRange.endDate)
                }}
                fullWidth
              />
              
              <ArrowForwardIcon />
              
              <TextField
                label="Einddatum"
                type="date"
                size="small"
                value={formatDate(tempDateRange.endDate)}
                onChange={handleEndDateChange}
                InputLabelProps={{ shrink: true }}
                inputProps={{ 
                  'aria-label': 'Einddatum',
                  min: formatDate(tempDateRange.startDate)
                }}
                fullWidth
              />
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
              <Button variant="text" onClick={handleClose}>
                Annuleren
              </Button>
              <Button 
                variant="contained" 
                onClick={handleApply}
                disabled={tempDateRange.startDate > tempDateRange.endDate}
              >
                Toepassen
              </Button>
            </Box>
          </Stack>
        </Box>
      </Popover>
    </Box>
  );
};

DateRangePicker.propTypes = {
  /**
   * Het huidige geselecteerde datumbereik
   */
  value: PropTypes.shape({
    startDate: PropTypes.instanceOf(Date).isRequired,
    endDate: PropTypes.instanceOf(Date).isRequired
  }).isRequired,
  
  /**
   * Callback functie die wordt aangeroepen wanneer het datumbereik verandert
   * @param {Object} newValue - Het nieuwe datumbereik { startDate, endDate }
   */
  onChange: PropTypes.func.isRequired,
  
  /**
   * Of de component uitgeschakeld moet worden
   */
  disabled: PropTypes.bool
};

export default DateRangePicker;
