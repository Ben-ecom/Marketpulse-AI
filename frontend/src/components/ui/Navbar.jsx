import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Premium Navbar component for site navigation
 * 
 * @param {Object} props - Component props
 * @param {string} props.logo - Logo URL or component
 * @param {Array} props.items - Navigation items [{label, href, icon, active}]
 * @param {Array} props.actions - Action buttons [{label, icon, onClick, variant}]
 * @param {boolean} props.sticky - Whether the navbar should stick to the top
 * @param {boolean} props.transparent - Whether the navbar should be transparent
 * @param {boolean} props.dark - Whether to use dark mode styling
 * @param {string} props.className - Additional CSS class names
 * @returns {JSX.Element} - Rendered component
 */
const Navbar = ({
  logo,
  items = [],
  actions = [],
  sticky = false,
  transparent = false,
  dark = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Handle scroll for sticky navbar
  useEffect(() => {
    if (sticky) {
      const handleScroll = () => {
        if (window.scrollY > 10) {
          setScrolled(true);
        } else {
          setScrolled(false);
        }
      };
      
      window.addEventListener('scroll', handleScroll);
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [sticky]);
  
  // Toggle mobile menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Navbar variants for animation
  const navbarVariants = {
    initial: {
      y: -100,
      opacity: 0,
    },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 100,
      },
    },
  };
  
  // Mobile menu variants for animation
  const menuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
    open: {
      opacity: 1,
      height: 'auto',
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
  };
  
  // Determine navbar classes based on props
  const navbarClasses = [
    'premium-navbar',
    sticky ? 'premium-navbar--sticky' : '',
    scrolled ? 'premium-navbar--scrolled' : '',
    transparent && !scrolled ? 'premium-navbar--transparent' : '',
    dark ? 'premium-navbar--dark' : '',
    className,
  ].filter(Boolean).join(' ');
  
  return (
    <motion.nav
      className={navbarClasses}
      initial="initial"
      animate="animate"
      variants={navbarVariants}
    >
      <div className="premium-navbar__container">
        <div className="premium-navbar__logo">
          {typeof logo === 'string' ? (
            <img src={logo} alt="Logo" className="premium-navbar__logo-image" />
          ) : (
            logo
          )}
        </div>
        
        <div className="premium-navbar__desktop">
          <ul className="premium-navbar__items">
            {items.map((item, index) => (
              <li key={index} className="premium-navbar__item">
                <a
                  href={item.href}
                  className={`premium-navbar__link ${item.active ? 'premium-navbar__link--active' : ''}`}
                >
                  {item.icon && (
                    <span className="premium-navbar__item-icon">
                      {item.icon}
                    </span>
                  )}
                  <span className="premium-navbar__item-label">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
          
          <div className="premium-navbar__actions">
            {actions.map((action, index) => (
              <button
                key={index}
                className={`premium-navbar__action premium-navbar__action--${action.variant || 'default'}`}
                onClick={action.onClick}
              >
                {action.icon && (
                  <span className="premium-navbar__action-icon">
                    {action.icon}
                  </span>
                )}
                <span className="premium-navbar__action-label">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        <button
          className="premium-navbar__toggle"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={isOpen ? 'premium-navbar__toggle-icon--open' : 'premium-navbar__toggle-icon'}
          >
            <path
              d={isOpen ? 'M18 6L6 18M6 6L18 18' : 'M4 6H20M4 12H20M4 18H20'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="premium-navbar__mobile"
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
          >
            <ul className="premium-navbar__mobile-items">
              {items.map((item, index) => (
                <li key={index} className="premium-navbar__mobile-item">
                  <a
                    href={item.href}
                    className={`premium-navbar__mobile-link ${item.active ? 'premium-navbar__mobile-link--active' : ''}`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon && (
                      <span className="premium-navbar__mobile-item-icon">
                        {item.icon}
                      </span>
                    )}
                    <span className="premium-navbar__mobile-item-label">{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
            
            <div className="premium-navbar__mobile-actions">
              {actions.map((action, index) => (
                <button
                  key={index}
                  className={`premium-navbar__mobile-action premium-navbar__mobile-action--${action.variant || 'default'}`}
                  onClick={() => {
                    setIsOpen(false);
                    action.onClick && action.onClick();
                  }}
                >
                  {action.icon && (
                    <span className="premium-navbar__mobile-action-icon">
                      {action.icon}
                    </span>
                  )}
                  <span className="premium-navbar__mobile-action-label">{action.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

Navbar.propTypes = {
  logo: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string.isRequired,
      icon: PropTypes.node,
      active: PropTypes.bool,
    })
  ),
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.node,
      onClick: PropTypes.func,
      variant: PropTypes.oneOf(['default', 'primary', 'secondary', 'outline']),
    })
  ),
  sticky: PropTypes.bool,
  transparent: PropTypes.bool,
  dark: PropTypes.bool,
  className: PropTypes.string,
};

export default Navbar;
