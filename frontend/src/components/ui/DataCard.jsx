import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Premium DataCard component for displaying metrics and KPIs
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main value to display
 * @param {string} props.subtitle - Subtitle or description
 * @param {React.ReactNode} props.icon - Icon to display
 * @param {string} props.trend - Trend direction (up, down, neutral)
 * @param {number|string} props.trendValue - Trend value (e.g., +15%)
 * @param {string} props.trendPeriod - Time period for trend (e.g., vs last month)
 * @param {string} props.variant - Card variant (default, gradient, glass)
 * @param {boolean} props.loading - Whether the card is in loading state
 * @param {React.ReactNode} props.chart - Optional small chart to display
 * @param {string} props.className - Additional CSS class names
 * @returns {JSX.Element} - Rendered component
 */
const DataCard = ({
  title,
  value,
  subtitle,
  icon,
  trend = 'neutral',
  trendValue,
  trendPeriod,
  variant = 'default',
  loading = false,
  chart,
  className = '',
  ...props
}) => {
  // Determine trend color and icon
  const trendConfig = {
    up: {
      color: '#10B981', // Green
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.83337 10L10 5.83333L14.1667 10M10 6.66667V14.1667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    down: {
      color: '#EF4444', // Red
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.1667 10L10 14.1667L5.83337 10M10 13.3333V5.83333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    neutral: {
      color: '#6B7280', // Gray
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.83337 10H14.1667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  };
  
  // Animation variants for loading state
  const loadingVariants = {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };
  
  // Animation variants for card entrance
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };
  
  // Animation variants for value counter
  const counterVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        delay: 0.2,
      },
    },
  };
  
  return (
    <motion.div
      className={`premium-data-card premium-data-card--${variant} ${className}`}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      {...props}
    >
      <div className="premium-data-card__header">
        <div className="premium-data-card__title-container">
          {icon && (
            <div className="premium-data-card__icon">
              {icon}
            </div>
          )}
          <div className="premium-data-card__title-content">
            <h3 className="premium-data-card__title">{title}</h3>
            {subtitle && (
              <p className="premium-data-card__subtitle">{subtitle}</p>
            )}
          </div>
        </div>
        
        {chart && (
          <div className="premium-data-card__chart">
            {chart}
          </div>
        )}
      </div>
      
      <div className="premium-data-card__content">
        {loading ? (
          <motion.div
            className="premium-data-card__loading"
            variants={loadingVariants}
            animate="animate"
          >
            <div className="premium-data-card__loading-value" />
            <div className="premium-data-card__loading-trend" />
          </motion.div>
        ) : (
          <>
            <motion.div
              className="premium-data-card__value"
              variants={counterVariants}
            >
              {value}
            </motion.div>
            
            {(trendValue || trendPeriod) && (
              <div className="premium-data-card__trend">
                {trendValue && (
                  <div
                    className="premium-data-card__trend-value"
                    style={{ color: trendConfig[trend].color }}
                  >
                    <span className="premium-data-card__trend-icon">
                      {trendConfig[trend].icon}
                    </span>
                    {trendValue}
                  </div>
                )}
                
                {trendPeriod && (
                  <div className="premium-data-card__trend-period">
                    {trendPeriod}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

DataCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  subtitle: PropTypes.string,
  icon: PropTypes.node,
  trend: PropTypes.oneOf(['up', 'down', 'neutral']),
  trendValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  trendPeriod: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'gradient', 'glass']),
  loading: PropTypes.bool,
  chart: PropTypes.node,
  className: PropTypes.string,
};

export default DataCard;
