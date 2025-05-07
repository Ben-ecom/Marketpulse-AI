import React from 'react';
import PropTypes from 'prop-types';

/**
 * Responsive component that renders different content based on screen size
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Default content (shown on all screens)
 * @param {React.ReactNode} props.mobile - Content to show only on mobile screens
 * @param {React.ReactNode} props.tablet - Content to show only on tablet screens
 * @param {React.ReactNode} props.desktop - Content to show only on desktop screens
 * @param {string} props.className - Additional CSS class names
 * @returns {JSX.Element} - Rendered component
 */
export const Responsive = ({
  children,
  mobile,
  tablet,
  desktop,
  className = '',
}) => {
  return (
    <>
      {/* Default content (visible on all screens if no specific content provided) */}
      {!mobile && !tablet && !desktop && (
        <div className={className}>
          {children}
        </div>
      )}
      
      {/* Mobile specific content */}
      {mobile && (
        <div className={`premium-responsive premium-responsive--mobile ${className}`}>
          {mobile}
        </div>
      )}
      
      {/* Tablet specific content */}
      {tablet && (
        <div className={`premium-responsive premium-responsive--tablet ${className}`}>
          {tablet}
        </div>
      )}
      
      {/* Desktop specific content */}
      {desktop && (
        <div className={`premium-responsive premium-responsive--desktop ${className}`}>
          {desktop}
        </div>
      )}
    </>
  );
};

Responsive.propTypes = {
  children: PropTypes.node,
  mobile: PropTypes.node,
  tablet: PropTypes.node,
  desktop: PropTypes.node,
  className: PropTypes.string,
};

/**
 * Hide component that conditionally renders content based on screen size
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to conditionally show/hide
 * @param {boolean} props.xs - Whether to hide on extra small screens
 * @param {boolean} props.sm - Whether to hide on small screens
 * @param {boolean} props.md - Whether to hide on medium screens
 * @param {boolean} props.lg - Whether to hide on large screens
 * @param {boolean} props.xl - Whether to hide on extra large screens
 * @param {string} props.className - Additional CSS class names
 * @returns {JSX.Element} - Rendered component
 */
export const Hide = ({
  children,
  xs = false,
  sm = false,
  md = false,
  lg = false,
  xl = false,
  className = '',
}) => {
  // Create responsive class names
  const classes = [
    xs && 'premium-hide--xs',
    sm && 'premium-hide--sm',
    md && 'premium-hide--md',
    lg && 'premium-hide--lg',
    xl && 'premium-hide--xl',
  ].filter(Boolean).join(' ');
  
  return (
    <div className={`premium-hide ${classes} ${className}`}>
      {children}
    </div>
  );
};

Hide.propTypes = {
  children: PropTypes.node,
  xs: PropTypes.bool,
  sm: PropTypes.bool,
  md: PropTypes.bool,
  lg: PropTypes.bool,
  xl: PropTypes.bool,
  className: PropTypes.string,
};

/**
 * Show component that conditionally renders content based on screen size
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to conditionally show/hide
 * @param {boolean} props.xs - Whether to show only on extra small screens
 * @param {boolean} props.sm - Whether to show only on small screens
 * @param {boolean} props.md - Whether to show only on medium screens
 * @param {boolean} props.lg - Whether to show only on large screens
 * @param {boolean} props.xl - Whether to show only on extra large screens
 * @param {string} props.className - Additional CSS class names
 * @returns {JSX.Element} - Rendered component
 */
export const Show = ({
  children,
  xs = false,
  sm = false,
  md = false,
  lg = false,
  xl = false,
  className = '',
}) => {
  // Create responsive class names
  const classes = [
    xs && 'premium-show--xs',
    sm && 'premium-show--sm',
    md && 'premium-show--md',
    lg && 'premium-show--lg',
    xl && 'premium-show--xl',
  ].filter(Boolean).join(' ');
  
  return (
    <div className={`premium-show ${classes} ${className}`}>
      {children}
    </div>
  );
};

Show.propTypes = {
  children: PropTypes.node,
  xs: PropTypes.bool,
  sm: PropTypes.bool,
  md: PropTypes.bool,
  lg: PropTypes.bool,
  xl: PropTypes.bool,
  className: PropTypes.string,
};

/**
 * Spacer component for adding vertical or horizontal space
 * 
 * @param {Object} props - Component props
 * @param {string} props.size - Spacer size (xs, sm, md, lg, xl)
 * @param {string} props.direction - Spacer direction (vertical, horizontal)
 * @param {boolean} props.responsive - Whether the spacer should be responsive
 * @param {string} props.className - Additional CSS class names
 * @returns {JSX.Element} - Rendered component
 */
export const Spacer = ({
  size = 'md',
  direction = 'vertical',
  responsive = true,
  className = '',
}) => {
  // Map size to CSS class
  const sizeClasses = {
    xs: 'premium-spacer--xs',
    sm: 'premium-spacer--sm',
    md: 'premium-spacer--md',
    lg: 'premium-spacer--lg',
    xl: 'premium-spacer--xl',
  };
  
  return (
    <div
      className={`premium-spacer premium-spacer--${direction} ${sizeClasses[size]} ${responsive ? 'premium-spacer--responsive' : ''} ${className}`}
    />
  );
};

Spacer.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  direction: PropTypes.oneOf(['vertical', 'horizontal']),
  responsive: PropTypes.bool,
  className: PropTypes.string,
};

/**
 * Flex container component for flexible layouts
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Flex container content
 * @param {string} props.direction - Flex direction (row, column, row-reverse, column-reverse)
 * @param {string} props.justify - Justify content (start, end, center, between, around, evenly)
 * @param {string} props.align - Align items (start, end, center, baseline, stretch)
 * @param {string} props.wrap - Flex wrap (nowrap, wrap, wrap-reverse)
 * @param {string} props.gap - Gap between flex items (xs, sm, md, lg, xl)
 * @param {string} props.className - Additional CSS class names
 * @returns {JSX.Element} - Rendered component
 */
export const Flex = ({
  children,
  direction = 'row',
  justify = 'start',
  align = 'center',
  wrap = 'nowrap',
  gap = 'md',
  className = '',
  ...props
}) => {
  // Map justify content values to CSS classes
  const justifyClasses = {
    start: 'premium-flex--justify-start',
    end: 'premium-flex--justify-end',
    center: 'premium-flex--justify-center',
    between: 'premium-flex--justify-between',
    around: 'premium-flex--justify-around',
    evenly: 'premium-flex--justify-evenly',
  };
  
  // Map align items values to CSS classes
  const alignClasses = {
    start: 'premium-flex--align-start',
    end: 'premium-flex--align-end',
    center: 'premium-flex--align-center',
    baseline: 'premium-flex--align-baseline',
    stretch: 'premium-flex--align-stretch',
  };
  
  // Map gap values to CSS classes
  const gapClasses = {
    xs: 'premium-flex--gap-xs',
    sm: 'premium-flex--gap-sm',
    md: 'premium-flex--gap-md',
    lg: 'premium-flex--gap-lg',
    xl: 'premium-flex--gap-xl',
  };
  
  return (
    <div
      className={`premium-flex premium-flex--${direction} ${justifyClasses[justify]} ${alignClasses[align]} premium-flex--${wrap} ${gapClasses[gap]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

Flex.propTypes = {
  children: PropTypes.node,
  direction: PropTypes.oneOf(['row', 'column', 'row-reverse', 'column-reverse']),
  justify: PropTypes.oneOf(['start', 'end', 'center', 'between', 'around', 'evenly']),
  align: PropTypes.oneOf(['start', 'end', 'center', 'baseline', 'stretch']),
  wrap: PropTypes.oneOf(['nowrap', 'wrap', 'wrap-reverse']),
  gap: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  className: PropTypes.string,
};

export default {
  Responsive,
  Hide,
  Show,
  Spacer,
  Flex,
};
