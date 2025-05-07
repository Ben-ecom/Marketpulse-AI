import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Premium Toast notification component with animations and styling
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Whether the toast is visible
 * @param {Function} props.onClose - Function to call when toast should close
 * @param {string} props.message - Toast message
 * @param {string} props.type - Toast type (success, error, warning, info)
 * @param {number} props.duration - Duration in milliseconds before auto-closing
 * @param {string} props.position - Toast position (top-right, top-left, bottom-right, bottom-left, top-center, bottom-center)
 * @param {boolean} props.showIcon - Whether to show the icon
 * @param {boolean} props.showCloseButton - Whether to show the close button
 * @param {string} props.className - Additional CSS class names
 * @returns {JSX.Element} - Rendered component
 */
const Toast = ({
  visible,
  onClose,
  message,
  type = 'info',
  duration = 5000,
  position = 'top-right',
  showIcon = true,
  showCloseButton = true,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(visible);
  
  // Auto-close toast after duration
  useEffect(() => {
    setIsVisible(visible);
    
    if (visible && duration !== 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);
  
  // Handle close button click
  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };
  
  // Toast type configurations
  const typeConfig = {
    success: {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 18.3333C14.6024 18.3333 18.3334 14.6024 18.3334 10C18.3334 5.39763 14.6024 1.66667 10 1.66667C5.39765 1.66667 1.66669 5.39763 1.66669 10C1.66669 14.6024 5.39765 18.3333 10 18.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7.5 10L9.16667 11.6667L12.5 8.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      className: 'premium-toast--success',
    },
    error: {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 18.3333C14.6024 18.3333 18.3334 14.6024 18.3334 10C18.3334 5.39763 14.6024 1.66667 10 1.66667C5.39765 1.66667 1.66669 5.39763 1.66669 10C1.66669 14.6024 5.39765 18.3333 10 18.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 6.66667V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 13.3333H10.0083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      className: 'premium-toast--error',
    },
    warning: {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.57465 3.21667L1.51632 15C1.37079 15.2573 1.29379 15.5502 1.29298 15.8487C1.29216 16.1472 1.36756 16.4406 1.51173 16.699C1.65591 16.9574 1.86374 17.1717 2.11543 17.3234C2.36712 17.4751 2.65465 17.5588 2.94965 17.5667H17.0496C17.3446 17.5588 17.6322 17.4751 17.8839 17.3234C18.1355 17.1717 18.3434 16.9574 18.4876 16.699C18.6317 16.4406 18.7071 16.1472 18.7063 15.8487C18.7055 15.5502 18.6285 15.2573 18.483 15L11.4246 3.21667C11.2723 2.96855 11.0598 2.76212 10.8059 2.61905C10.552 2.47598 10.2659 2.4 9.9748 2.4C9.68368 2.4 9.39758 2.47598 9.14366 2.61905C8.88973 2.76212 8.67729 2.96855 8.52465 3.21667V3.21667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 7.5V10.8333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 14.1667H10.0083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      className: 'premium-toast--warning',
    },
    info: {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 18.3333C14.6024 18.3333 18.3334 14.6024 18.3334 10C18.3334 5.39763 14.6024 1.66667 10 1.66667C5.39765 1.66667 1.66669 5.39763 1.66669 10C1.66669 14.6024 5.39765 18.3333 10 18.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 13.3333V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 6.66667H10.0083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      className: 'premium-toast--info',
    },
  };
  
  // Position classes
  const positionClasses = {
    'top-right': 'premium-toast--top-right',
    'top-left': 'premium-toast--top-left',
    'bottom-right': 'premium-toast--bottom-right',
    'bottom-left': 'premium-toast--bottom-left',
    'top-center': 'premium-toast--top-center',
    'bottom-center': 'premium-toast--bottom-center',
  };
  
  // Animation variants based on position
  const getAnimationVariants = () => {
    switch (position) {
      case 'top-right':
        return {
          hidden: { opacity: 0, x: 20, y: 0 },
          visible: { opacity: 1, x: 0, y: 0 },
          exit: { opacity: 0, x: 20, y: 0 },
        };
      case 'top-left':
        return {
          hidden: { opacity: 0, x: -20, y: 0 },
          visible: { opacity: 1, x: 0, y: 0 },
          exit: { opacity: 0, x: -20, y: 0 },
        };
      case 'bottom-right':
        return {
          hidden: { opacity: 0, x: 20, y: 0 },
          visible: { opacity: 1, x: 0, y: 0 },
          exit: { opacity: 0, x: 20, y: 0 },
        };
      case 'bottom-left':
        return {
          hidden: { opacity: 0, x: -20, y: 0 },
          visible: { opacity: 1, x: 0, y: 0 },
          exit: { opacity: 0, x: -20, y: 0 },
        };
      case 'top-center':
        return {
          hidden: { opacity: 0, y: -20 },
          visible: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -20 },
        };
      case 'bottom-center':
        return {
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: 20 },
        };
      default:
        return {
          hidden: { opacity: 0, y: -20 },
          visible: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -20 },
        };
    }
  };
  
  const animationVariants = getAnimationVariants();
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`premium-toast ${typeConfig[type].className} ${positionClasses[position]} ${className}`}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={animationVariants}
          transition={{ duration: 0.2 }}
        >
          <div className="premium-toast__content">
            {showIcon && (
              <div className="premium-toast__icon">
                {typeConfig[type].icon}
              </div>
            )}
            
            <div className="premium-toast__message">
              {message}
            </div>
            
            {showCloseButton && (
              <button
                className="premium-toast__close"
                onClick={handleClose}
                aria-label="Close toast"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
          
          {duration !== 0 && (
            <motion.div
              className="premium-toast__progress"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

Toast.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  duration: PropTypes.number,
  position: PropTypes.oneOf(['top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center']),
  showIcon: PropTypes.bool,
  showCloseButton: PropTypes.bool,
  className: PropTypes.string,
};

export default Toast;
