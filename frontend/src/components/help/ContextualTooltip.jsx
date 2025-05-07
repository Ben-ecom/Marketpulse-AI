import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Tooltip,
  Typography,
  Box,
  IconButton,
  Paper,
  Fade,
  Popper,
  ClickAwayListener,
  useTheme
} from '@mui/material';
import {
  HelpOutline as HelpIcon,
  Close as CloseIcon,
  PlayCircleOutline as VideoIcon,
  Link as LinkIcon,
  Info as InfoIcon
} from '@mui/icons-material';

/**
 * ContextualTooltip Component
 * 
 * Een geavanceerde tooltip component die contextuele hulp biedt voor complexe UI-elementen.
 * Ondersteunt tekst, video's, links en meer.
 * 
 * @component
 * @example
 * ```jsx
 * <ContextualTooltip
 *   title="Awareness Distributie"
 *   content="Deze visualisatie toont de verdeling van topics over de verschillende awareness fasen."
 *   videoUrl="https://example.com/video.mp4"
 *   learnMoreUrl="https://docs.example.com/awareness-distribution"
 * >
 *   <Button>Awareness Distributie</Button>
 * </ContextualTooltip>
 * ```
 */
const ContextualTooltip = ({
  children,
  title,
  content,
  videoUrl,
  learnMoreUrl,
  placement = 'top',
  interactive = true,
  icon = <HelpIcon fontSize="small" />,
  iconPosition = 'end',
  iconColor = 'primary',
  maxWidth = 320
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Handler voor het openen van de tooltip
  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };
  
  // Handler voor het sluiten van de tooltip
  const handleClose = () => {
    setOpen(false);
  };
  
  // Render de tooltip inhoud
  const renderTooltipContent = () => (
    <Box sx={{ p: 1 }}>
      {title && (
        <Typography variant="subtitle2" color="primary" gutterBottom>
          {title}
        </Typography>
      )}
      
      {content && (
        <Typography variant="body2" paragraph>
          {content}
        </Typography>
      )}
      
      {(videoUrl || learnMoreUrl) && (
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          {videoUrl && (
            <IconButton
              size="small"
              color="primary"
              onClick={() => window.open(videoUrl, '_blank')}
              aria-label="Bekijk video"
            >
              <VideoIcon fontSize="small" />
            </IconButton>
          )}
          
          {learnMoreUrl && (
            <IconButton
              size="small"
              color="primary"
              onClick={() => window.open(learnMoreUrl, '_blank')}
              aria-label="Meer informatie"
            >
              <LinkIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      )}
    </Box>
  );
  
  // Als interactive is false, gebruik de standaard MUI Tooltip
  if (!interactive) {
    return (
      <Tooltip
        title={renderTooltipContent()}
        placement={placement}
        arrow
      >
        {children}
      </Tooltip>
    );
  }
  
  // Anders gebruik een interactieve Popper
  return (
    <>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          position: 'relative',
          ...(iconPosition === 'start' && { flexDirection: 'row-reverse' })
        }}
      >
        {React.cloneElement(children, {
          ...children.props,
          ref: null,
          style: {
            ...children.props.style,
            margin: iconPosition === 'start' ? '0 8px 0 0' : '0 0 0 8px'
          }
        })}
        
        <IconButton
          size="small"
          color={iconColor}
          onClick={handleOpen}
          sx={{ 
            ml: iconPosition === 'end' ? 0.5 : 0,
            mr: iconPosition === 'start' ? 0.5 : 0
          }}
          aria-label="Toon hulp"
        >
          {icon}
        </IconButton>
      </Box>
      
      <Popper
        open={open}
        anchorEl={anchorEl}
        placement={placement}
        transition
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 10],
            },
          },
        ]}
        sx={{ zIndex: 1300 }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper
              elevation={3}
              sx={{
                maxWidth,
                p: 1,
                borderRadius: 1,
                border: `1px solid ${theme.palette.divider}`
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <InfoIcon fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                      <Typography variant="subtitle2" color="primary">
                        {title}
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={handleClose} aria-label="Sluiten">
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  {content && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {content}
                    </Typography>
                  )}
                  
                  {(videoUrl || learnMoreUrl) && (
                    <Box sx={{ display: 'flex', gap: 1, mt: 1, justifyContent: 'flex-end' }}>
                      {videoUrl && (
                        <Tooltip title="Bekijk video tutorial">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => window.open(videoUrl, '_blank')}
                            aria-label="Bekijk video"
                          >
                            <VideoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {learnMoreUrl && (
                        <Tooltip title="Meer informatie">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => window.open(learnMoreUrl, '_blank')}
                            aria-label="Meer informatie"
                          >
                            <LinkIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  )}
                </Box>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  );
};

ContextualTooltip.propTypes = {
  /**
   * De inhoud waarop de tooltip wordt toegepast
   */
  children: PropTypes.node.isRequired,
  
  /**
   * De titel van de tooltip
   */
  title: PropTypes.string.isRequired,
  
  /**
   * De inhoud van de tooltip
   */
  content: PropTypes.string,
  
  /**
   * URL naar een video tutorial
   */
  videoUrl: PropTypes.string,
  
  /**
   * URL naar meer informatie
   */
  learnMoreUrl: PropTypes.string,
  
  /**
   * Plaatsing van de tooltip
   */
  placement: PropTypes.oneOf(['top', 'bottom', 'left', 'right', 'top-start', 'top-end', 'bottom-start', 'bottom-end', 'left-start', 'left-end', 'right-start', 'right-end']),
  
  /**
   * Of de tooltip interactief is (klikbaar)
   */
  interactive: PropTypes.bool,
  
  /**
   * Het icoon dat wordt gebruikt voor de tooltip trigger
   */
  icon: PropTypes.node,
  
  /**
   * De positie van het icoon ten opzichte van de children
   */
  iconPosition: PropTypes.oneOf(['start', 'end']),
  
  /**
   * De kleur van het icoon
   */
  iconColor: PropTypes.string,
  
  /**
   * De maximale breedte van de tooltip
   */
  maxWidth: PropTypes.number
};

export default ContextualTooltip;
