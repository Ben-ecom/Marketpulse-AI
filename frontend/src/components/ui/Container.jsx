import React from 'react';
import PropTypes from 'prop-types';

/**
 * Premium Container component for layout structure
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Container content
 * @param {string} props.size - Container size (sm, md, lg, xl, full)
 * @param {string} props.padding - Container padding (none, xs, sm, md, lg, xl)
 * @param {boolean} props.centered - Whether to center the container horizontally
 * @param {string} props.className - Additional CSS class names
 * @returns {JSX.Element} - Rendered component
 */
const Container = ({
  children,
  size = 'lg',
  padding = 'md',
  centered = true,
  className = '',
  ...props
}) => {
  // Map size to CSS class
  const sizeClasses = {
    sm: 'premium-container--sm',
    md: 'premium-container--md',
    lg: 'premium-container--lg',
    xl: 'premium-container--xl',
    full: 'premium-container--full',
  };
  
  // Map padding to CSS class
  const paddingClasses = {
    none: 'premium-container--padding-none',
    xs: 'premium-container--padding-xs',
    sm: 'premium-container--padding-sm',
    md: 'premium-container--padding-md',
    lg: 'premium-container--padding-lg',
    xl: 'premium-container--padding-xl',
  };
  
  return (
    <div
      className={`premium-container ${sizeClasses[size]} ${paddingClasses[padding]} ${centered ? 'premium-container--centered' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

Container.propTypes = {
  children: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  padding: PropTypes.oneOf(['none', 'xs', 'sm', 'md', 'lg', 'xl']),
  centered: PropTypes.bool,
  className: PropTypes.string,
};

export default Container;
