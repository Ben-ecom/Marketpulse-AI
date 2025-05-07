import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * Premium gradient background component with subtle animation
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render on top of the background
 * @param {Object} props.sx - Additional styling for the container
 */
const GradientBackground = ({ children, sx = {} }) => {
  const theme = useTheme();
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width = window.innerWidth;
    const height = canvas.height = window.innerHeight;
    
    // Premium color palette met de nieuwe gradiëntkleuren
    const colors = {
      primary: '#485563', // Donker grijsblauw
      secondary: '#29323c', // Nog donkerder grijsblauw
      accent1: '#3d4a57', // Middel grijsblauw
      accent2: '#323c47', // Donker grijsblauw variant
      accent3: '#566575', // Lichter grijsblauw
      dark: theme.palette.mode === 'dark' ? '#1c2128' : '#f8f9fa',
    };
    
    // Create gradient points
    const gradientPoints = [
      { x: 0, y: 0, color: colors.primary, radius: width * 0.6, speed: 0.0002 },
      { x: width, y: 0, color: colors.secondary, radius: width * 0.5, speed: 0.0003 },
      { x: 0, y: height, color: colors.accent1, radius: width * 0.4, speed: 0.0004 },
      { x: width, y: height, color: colors.accent3, radius: width * 0.5, speed: 0.0002 },
      { x: width / 2, y: height / 2, color: colors.accent2, radius: width * 0.6, speed: 0.0003 },
    ];
    
    // Animation variables
    let animationFrameId;
    let time = 0;
    
    // Render function
    const render = () => {
      time += 1;
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Fill with background color
      ctx.fillStyle = colors.dark;
      ctx.fillRect(0, 0, width, height);
      
      // Update gradient points
      gradientPoints.forEach(point => {
        point.x += Math.sin(time * point.speed) * 0.5;
        point.y += Math.cos(time * point.speed) * 0.5;
      });
      
      // Create radial gradients
      gradientPoints.forEach(point => {
        const gradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, point.radius
        );
        
        gradient.addColorStop(0, `${point.color}40`); // 25% opacity
        gradient.addColorStop(1, `${point.color}00`); // 0% opacity
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      });
      
      // Add subtle noise texture
      addNoiseTexture(ctx, width, height, 0.02);
      
      // Continue animation
      animationFrameId = window.requestAnimationFrame(render);
    };
    
    // Add subtle noise texture
    const addNoiseTexture = (ctx, width, height, opacity) => {
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 255 * opacity;
        data[i] = Math.min(data[i] + noise, 255);
        data[i + 1] = Math.min(data[i + 1] + noise, 255);
        data[i + 2] = Math.min(data[i + 2] + noise, 255);
      }
      
      ctx.putImageData(imageData, 0, 0);
    };
    
    // Handle resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    // Start animation
    render();
    
    // Cleanup
    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);
  
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        ...sx
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
        }}
      />
      {children}
    </Box>
  );
};

export default GradientBackground;
