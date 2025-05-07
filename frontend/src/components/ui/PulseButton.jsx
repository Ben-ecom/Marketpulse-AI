import React from 'react';
import { Button } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

// Pulse animation met de nieuwe kleur #485563
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(72, 85, 99, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(72, 85, 99, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(72, 85, 99, 0);
  }
`;

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
const StyledButton = styled(Button)(({ theme, variant, color }) => {
  const baseStyles = {
    position: 'relative',
    borderRadius: theme.shape.borderRadius * 1.5,
    padding: '10px 24px',
    fontWeight: 600,
    textTransform: 'none',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[4],
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  };

  // Different button variants
  const variants = {
    // Gradient button with shimmer effect met de nieuwe kleuren
    gradient: {
      ...baseStyles,
      background: `linear-gradient(135deg, #485563, #29323c)`,
      color: '#ffffff',
      border: 'none',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '200%',
        height: '100%',
        background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.3), transparent)',
        backgroundSize: '200% 100%',
        animation: `${shimmer} 3s infinite linear`,
      },
    },

    // Pulse button with animation met de nieuwe kleur
    pulse: {
      ...baseStyles,
      backgroundColor: '#485563',
      color: '#ffffff',
      animation: `${pulse} 2s infinite`,
    },

    // Outline button with gradient border
    outline: {
      ...baseStyles,
      backgroundColor: 'transparent',
      color: theme.palette.primary.main,
      position: 'relative',
      border: 'none',
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        borderRadius: theme.shape.borderRadius * 1.5,
        padding: 1,
        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
      },
    },
  };

  return variants[variant] || baseStyles;
});

/**
 * Premium button component with animation effects
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.variant - Button style variant: 'gradient', 'pulse', or 'outline'
 * @param {string} props.color - Button color (from theme palette)
 * @param {Object} props.sx - Additional styling
 */
const PulseButton = ({ 
  children, 
  variant = 'gradient', 
  color = 'primary',
  sx = {},
  ...props 
}) => {
  return (
    <StyledButton
      variant={variant}
      color={color}
      sx={sx}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default PulseButton;
