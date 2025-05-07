import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Premium Sidebar component for application navigation
 * 
 * @param {Object} props - Component props
 * @param {string|React.ReactNode} props.logo - Logo URL or component
 * @param {Array} props.items - Navigation items [{label, href, icon, active, children}]
 * @param {Array} props.footerItems - Footer navigation items [{label, href, icon, active}]
 * @param {React.ReactNode} props.footer - Custom footer content
 * @param {boolean} props.collapsed - Whether the sidebar is collapsed
 * @param {Function} props.onToggle - Function to call when sidebar is toggled
 * @param {boolean} props.dark - Whether to use dark mode styling
 * @param {string} props.className - Additional CSS class names
 * @returns {JSX.Element} - Rendered component
 */
const Sidebar = ({
  logo,
  items = [],
  footerItems = [],
  footer,
  collapsed = false,
  onToggle,
  dark = false,
  className = '',
}) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [expandedItems, setExpandedItems] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Update collapsed state when prop changes
  useEffect(() => {
    setIsCollapsed(collapsed);
  }, [collapsed]);
  
  // Toggle sidebar collapsed state
  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    
    if (onToggle) {
      onToggle(newState);
    }
  };
  
  // Toggle mobile sidebar
  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };
  
  // Toggle expanded state for items with children
  const toggleExpandItem = (index) => {
    setExpandedItems((prevExpanded) => {
      if (prevExpanded.includes(index)) {
        return prevExpanded.filter((i) => i !== index);
      } else {
        return [...prevExpanded, index];
      }
    });
  };
  
  // Sidebar variants for animation
  const sidebarVariants = {
    expanded: {
      width: '240px',
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
    collapsed: {
      width: '80px',
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
  };
  
  // Mobile sidebar variants for animation
  const mobileSidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      x: '-100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
  };
  
  // Overlay variants for animation
  const overlayVariants = {
    open: {
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
    closed: {
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
  };
  
  // Submenu variants for animation
  const submenuVariants = {
    open: {
      height: 'auto',
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
    closed: {
      height: 0,
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
  };
  
  // Determine sidebar classes based on props
  const sidebarClasses = [
    'premium-sidebar',
    isCollapsed ? 'premium-sidebar--collapsed' : '',
    dark ? 'premium-sidebar--dark' : '',
    className,
  ].filter(Boolean).join(' ');
  
  // Render sidebar content
  const renderSidebarContent = () => (
    <>
      <div className="premium-sidebar__header">
        <div className="premium-sidebar__logo">
          {typeof logo === 'string' ? (
            <img src={logo} alt="Logo" className="premium-sidebar__logo-image" />
          ) : (
            logo
          )}
          {!isCollapsed && (
            <motion.span
              className="premium-sidebar__logo-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              MarketPulse AI
            </motion.span>
          )}
        </div>
        
        <button
          className="premium-sidebar__toggle"
          onClick={isMobile ? toggleMobileSidebar : toggleSidebar}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <path
              d="M12.5 15L7.5 10L12.5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      
      <div className="premium-sidebar__content">
        <nav className="premium-sidebar__nav">
          <ul className="premium-sidebar__items">
            {items.map((item, index) => (
              <li key={index} className="premium-sidebar__item">
                {item.children ? (
                  <div className="premium-sidebar__parent-item">
                    <button
                      className={`premium-sidebar__link ${item.active ? 'premium-sidebar__link--active' : ''}`}
                      onClick={() => toggleExpandItem(index)}
                    >
                      {item.icon && (
                        <span className="premium-sidebar__item-icon">
                          {item.icon}
                        </span>
                      )}
                      
                      {!isCollapsed && (
                        <motion.span
                          className="premium-sidebar__item-label"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                      
                      {!isCollapsed && (
                        <motion.span
                          className={`premium-sidebar__item-arrow ${expandedItems.includes(index) ? 'premium-sidebar__item-arrow--expanded' : ''}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M4 6L8 10L12 6"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </motion.span>
                      )}
                    </button>
                    
                    {!isCollapsed && (
                      <AnimatePresence>
                        {expandedItems.includes(index) && (
                          <motion.ul
                            className="premium-sidebar__subitems"
                            initial="closed"
                            animate="open"
                            exit="closed"
                            variants={submenuVariants}
                          >
                            {item.children.map((child, childIndex) => (
                              <li key={childIndex} className="premium-sidebar__subitem">
                                <a
                                  href={child.href}
                                  className={`premium-sidebar__sublink ${child.active ? 'premium-sidebar__sublink--active' : ''}`}
                                >
                                  {child.icon && (
                                    <span className="premium-sidebar__subitem-icon">
                                      {child.icon}
                                    </span>
                                  )}
                                  <span className="premium-sidebar__subitem-label">
                                    {child.label}
                                  </span>
                                </a>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                ) : (
                  <a
                    href={item.href}
                    className={`premium-sidebar__link ${item.active ? 'premium-sidebar__link--active' : ''}`}
                  >
                    {item.icon && (
                      <span className="premium-sidebar__item-icon">
                        {item.icon}
                      </span>
                    )}
                    
                    {!isCollapsed && (
                      <motion.span
                        className="premium-sidebar__item-label"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      <div className="premium-sidebar__footer">
        {footerItems.length > 0 && (
          <ul className="premium-sidebar__footer-items">
            {footerItems.map((item, index) => (
              <li key={index} className="premium-sidebar__footer-item">
                <a
                  href={item.href}
                  className={`premium-sidebar__footer-link ${item.active ? 'premium-sidebar__footer-link--active' : ''}`}
                >
                  {item.icon && (
                    <span className="premium-sidebar__footer-icon">
                      {item.icon}
                    </span>
                  )}
                  
                  {!isCollapsed && (
                    <motion.span
                      className="premium-sidebar__footer-label"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        )}
        
        {footer && !isCollapsed && (
          <motion.div
            className="premium-sidebar__footer-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {footer}
          </motion.div>
        )}
      </div>
    </>
  );
  
  // Render mobile toggle button
  const renderMobileToggle = () => (
    <button
      className="premium-sidebar__mobile-toggle"
      onClick={toggleMobileSidebar}
      aria-label="Toggle sidebar"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 6H20M4 12H20M4 18H20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
  
  // Render desktop sidebar
  if (!isMobile) {
    return (
      <motion.aside
        className={sidebarClasses}
        initial={isCollapsed ? 'collapsed' : 'expanded'}
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        variants={sidebarVariants}
      >
        {renderSidebarContent()}
      </motion.aside>
    );
  }
  
  // Render mobile sidebar
  return (
    <>
      {renderMobileToggle()}
      
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="premium-sidebar__overlay"
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            onClick={toggleMobileSidebar}
          />
        )}
      </AnimatePresence>
      
      <motion.aside
        className={`${sidebarClasses} premium-sidebar--mobile`}
        initial="closed"
        animate={mobileOpen ? 'open' : 'closed'}
        variants={mobileSidebarVariants}
      >
        {renderSidebarContent()}
      </motion.aside>
    </>
  );
};

Sidebar.propTypes = {
  logo: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string,
      icon: PropTypes.node,
      active: PropTypes.bool,
      children: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          href: PropTypes.string.isRequired,
          icon: PropTypes.node,
          active: PropTypes.bool,
        })
      ),
    })
  ),
  footerItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string.isRequired,
      icon: PropTypes.node,
      active: PropTypes.bool,
    })
  ),
  footer: PropTypes.node,
  collapsed: PropTypes.bool,
  onToggle: PropTypes.func,
  dark: PropTypes.bool,
  className: PropTypes.string,
};

export default Sidebar;
