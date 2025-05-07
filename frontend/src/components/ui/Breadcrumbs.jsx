import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Premium Breadcrumbs component for navigation hierarchy
 * 
 * @param {Object} props - Component props
 * @param {Array} props.items - Breadcrumb items [{label, href, icon}]
 * @param {string} props.separator - Separator between items
 * @param {boolean} props.showHomeIcon - Whether to show home icon for first item
 * @param {boolean} props.collapsed - Whether to collapse middle items when there are many
 * @param {number} props.maxItems - Maximum number of items to show when collapsed
 * @param {string} props.className - Additional CSS class names
 * @returns {JSX.Element} - Rendered component
 */
const Breadcrumbs = ({
  items = [],
  separator = '/',
  showHomeIcon = true,
  collapsed = true,
  maxItems = 3,
  className = '',
}) => {
  // Don't collapse if we have fewer items than the max
  const shouldCollapse = collapsed && items.length > maxItems;
  
  // Calculate which items to show when collapsed
  const visibleItems = shouldCollapse
    ? [
        // First item
        items[0],
        // Ellipsis item (placeholder)
        { label: '...', href: null, isEllipsis: true },
        // Last item
        items[items.length - 1],
      ]
    : items;
  
  // Animation variants for container
  const containerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
      },
    },
  };
  
  // Animation variants for items
  const itemVariants = {
    hidden: { opacity: 0, x: -5 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.2,
      },
    },
  };
  
  // Custom separator component
  const Separator = () => {
    if (typeof separator === 'string') {
      return <span className="premium-breadcrumbs__separator">{separator}</span>;
    }
    return <div className="premium-breadcrumbs__separator">{separator}</div>;
  };
  
  // Home icon
  const HomeIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="premium-breadcrumbs__home-icon"
    >
      <path
        d="M8.00001 1.33334L1.33334 6.66667V14H5.33334V9.33334H10.6667V14H14.6667V6.66667L8.00001 1.33334Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
  
  return (
    <motion.nav
      className={`premium-breadcrumbs ${className}`}
      aria-label="Breadcrumbs"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <ol className="premium-breadcrumbs__list">
        {visibleItems.map((item, index) => {
          const isLast = index === visibleItems.length - 1;
          const isFirst = index === 0;
          
          return (
            <motion.li
              key={index}
              className={`premium-breadcrumbs__item ${isLast ? 'premium-breadcrumbs__item--active' : ''}`}
              variants={itemVariants}
            >
              {index > 0 && <Separator />}
              
              {item.isEllipsis ? (
                <span className="premium-breadcrumbs__ellipsis">{item.label}</span>
              ) : (
                <React.Fragment>
                  {isLast ? (
                    <span className="premium-breadcrumbs__current">
                      {item.icon && (
                        <span className="premium-breadcrumbs__icon">
                          {item.icon}
                        </span>
                      )}
                      {isFirst && showHomeIcon && !item.icon && (
                        <HomeIcon />
                      )}
                      <span className="premium-breadcrumbs__label">{item.label}</span>
                    </span>
                  ) : (
                    <a href={item.href} className="premium-breadcrumbs__link">
                      {item.icon && (
                        <span className="premium-breadcrumbs__icon">
                          {item.icon}
                        </span>
                      )}
                      {isFirst && showHomeIcon && !item.icon && (
                        <HomeIcon />
                      )}
                      <span className="premium-breadcrumbs__label">{item.label}</span>
                    </a>
                  )}
                </React.Fragment>
              )}
            </motion.li>
          );
        })}
      </ol>
    </motion.nav>
  );
};

Breadcrumbs.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string,
      icon: PropTypes.node,
    })
  ).isRequired,
  separator: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  showHomeIcon: PropTypes.bool,
  collapsed: PropTypes.bool,
  maxItems: PropTypes.number,
  className: PropTypes.string,
};

export default Breadcrumbs;
