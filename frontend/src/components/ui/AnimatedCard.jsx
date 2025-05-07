import React from 'react';
import { Card, CardContent, Box } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

// Shimmer animation
const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

// Styled components
const StyledCard = styled(Card)(({ theme, variant }) => {
  const isDark = theme.palette.mode === 'dark';
  
  const baseStyles = {
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[8],
    },
  };
  
  // Different card variants met de gewenste gradiëntkleuren (#304352 en #d7d2cc)
  const variants = {
    // Default premium card with subtle gradient border
    default: {
      ...baseStyles,
      background: isDark 
        ? `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.grey[900]})`
        : `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.grey[50]})`,
      borderRadius: theme.shape.borderRadius * 2,
      padding: 1,
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        borderRadius: theme.shape.borderRadius * 2,
        padding: 1,
        background: `linear-gradient(135deg, #485563, #29323c)`,
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
      },
    },
    
    // Glass card with blur effect
    glass: {
      ...baseStyles,
      background: isDark 
        ? 'rgba(72, 85, 99, 0.6)' // Gebaseerd op #485563 met transparantie
        : 'rgba(41, 50, 60, 0.6)', // Gebaseerd op #29323c met transparantie
      backdropFilter: 'blur(8px)',
      borderRadius: theme.shape.borderRadius * 2,
      border: `1px solid ${isDark ? 'rgba(72, 85, 99, 0.2)' : 'rgba(41, 50, 60, 0.1)'}`,
    },
    
    // Gradient card with animated shimmer effect
    gradient: {
      ...baseStyles,
      background: `linear-gradient(135deg, #485563, #29323c)`,
      borderRadius: theme.shape.borderRadius * 2,
      color: '#ffffff', // Witte tekst voor betere leesbaarheid op de gradiënt
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '200%',
        height: '100%',
        background: `linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent)`,
        backgroundSize: '200% 100%',
        animation: `${shimmer} 3s infinite linear`,
      },
    },
  };
  
  return variants[variant] || variants.default;
});

// Inner content container
const ContentContainer = styled(CardContent)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  padding: theme.spacing(3),
}));

/**
 * Premium animated card component with multiple style variants
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.variant - Card style variant: 'default', 'glass', or 'gradient'
 * @param {Object} props.sx - Additional styling
 */
const AnimatedCard = ({ children, variant = 'default', sx = {}, ...props }) => {
  return (
    <StyledCard variant={variant} sx={sx} {...props}>
      <ContentContainer>
        {children}
      </ContentContainer>
    </StyledCard>
  );
};

export default AnimatedCard;
