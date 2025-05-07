import React from 'react';
import PropTypes from 'prop-types';

/**
 * Premium Grid component for responsive layouts
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Grid content
 * @param {number} props.columns - Number of columns (1-12)
 * @param {string} props.gap - Gap between grid items (xs, sm, md, lg, xl)
 * @param {boolean} props.fluid - Whether the grid should be fluid width
 * @param {string} props.className - Additional CSS class names
 * @returns {JSX.Element} - Rendered component
 */
const Grid = ({
  children,
  columns = 12,
  gap = 'md',
  fluid = false,
  className = '',
  ...props
}) => {
  // Map gap size to CSS class
  const gapClasses = {
    xs: 'premium-grid--gap-xs',
    sm: 'premium-grid--gap-sm',
    md: 'premium-grid--gap-md',
    lg: 'premium-grid--gap-lg',
    xl: 'premium-grid--gap-xl',
  };
  
  // Map columns to CSS class
  const columnClasses = {
    1: 'premium-grid--cols-1',
    2: 'premium-grid--cols-2',
    3: 'premium-grid--cols-3',
    4: 'premium-grid--cols-4',
    5: 'premium-grid--cols-5',
    6: 'premium-grid--cols-6',
    7: 'premium-grid--cols-7',
    8: 'premium-grid--cols-8',
    9: 'premium-grid--cols-9',
    10: 'premium-grid--cols-10',
    11: 'premium-grid--cols-11',
    12: 'premium-grid--cols-12',
  };
  
  return (
    <div
      className={`premium-grid ${columnClasses[columns]} ${gapClasses[gap]} ${fluid ? 'premium-grid--fluid' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

Grid.propTypes = {
  children: PropTypes.node,
  columns: PropTypes.oneOf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
  gap: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  fluid: PropTypes.bool,
  className: PropTypes.string,
};

/**
 * Grid Item component for use within Grid
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Grid item content
 * @param {number} props.span - Number of columns to span (1-12)
 * @param {number} props.spanSm - Number of columns to span on small screens
 * @param {number} props.spanMd - Number of columns to span on medium screens
 * @param {number} props.spanLg - Number of columns to span on large screens
 * @param {number} props.spanXl - Number of columns to span on extra large screens
 * @param {string} props.className - Additional CSS class names
 * @returns {JSX.Element} - Rendered component
 */
export const GridItem = ({
  children,
  span = 12,
  spanSm,
  spanMd,
  spanLg,
  spanXl,
  className = '',
  ...props
}) => {
  // Create responsive class names
  const classes = [
    `premium-grid-item--span-${span}`,
    spanSm && `premium-grid-item--span-sm-${spanSm}`,
    spanMd && `premium-grid-item--span-md-${spanMd}`,
    spanLg && `premium-grid-item--span-lg-${spanLg}`,
    spanXl && `premium-grid-item--span-xl-${spanXl}`,
  ].filter(Boolean).join(' ');
  
  return (
    <div
      className={`premium-grid-item ${classes} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

GridItem.propTypes = {
  children: PropTypes.node,
  span: PropTypes.oneOf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
  spanSm: PropTypes.oneOf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
  spanMd: PropTypes.oneOf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
  spanLg: PropTypes.oneOf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
  spanXl: PropTypes.oneOf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
  className: PropTypes.string,
};

export default Grid;
