import React from 'react';
import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled component with gradient text
const GradientTypography = styled(Typography)(({ theme, gradient, animate }) => {
  // Default gradient gebruikt de nieuwe kleuren #485563 en #29323c
  const defaultGradient = `linear-gradient(135deg, #485563, #29323c)`;
  
  return {
    backgroundImage: gradient || defaultGradient,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    display: 'inline-block',
    backgroundSize: animate === 'true' || animate === true ? '200% 200%' : '100% 100%',
    animation: animate === 'true' || animate === true ? 'gradientAnimation 6s ease infinite' : 'none',
    '@keyframes gradientAnimation': {
      '0%': {
        backgroundPosition: '0% 50%',
      },
      '50%': {
        backgroundPosition: '100% 50%',
      },
      '100%': {
        backgroundPosition: '0% 50%',
      },
    },
  };
});

/**
 * Text component with gradient colors
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Text content
 * @param {string} props.gradient - CSS gradient string (optional)
 * @param {boolean} props.animate - Whether to animate the gradient (default: false)
 * @param {string} props.variant - Typography variant (default: 'h4')
 * @param {Object} props.sx - Additional styling
 */
const TextGradient = ({
  children,
  gradient,
  animate = false,
  variant = 'h4',
  sx = {},
  ...props
}) => {
  return (
    <GradientTypography
      variant={variant}
      gradient={gradient}
      animate={animate ? 'true' : 'false'}
      sx={sx}
      {...props}
    >
      {children}
    </GradientTypography>
  );
};

export default TextGradient;
