import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Premium Select component with animations and styling
 * 
 * @param {Object} props - Component props
 * @param {string} props.label - Select label
 * @param {string} props.name - Select name attribute
 * @param {string} props.value - Selected value
 * @param {Function} props.onChange - Change handler function
 * @param {Array} props.options - Array of options [{value, label}]
 * @param {string} props.placeholder - Select placeholder
 * @param {string} props.variant - Select variant (default, outlined, filled)
 * @param {boolean} props.required - Whether the select is required
 * @param {boolean} props.disabled - Whether the select is disabled
 * @param {string} props.error - Error message to display
 * @param {string} props.helperText - Helper text to display below select
 * @param {string} props.className - Additional CSS class names
 * @returns {JSX.Element} - Rendered component
 */
const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  variant = 'default',
  required = false,
  disabled = false,
  error = '',
  helperText = '',
  className = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const selectRef = useRef(null);
  
  // Find the selected option label
  const selectedOption = options.find(option => option.value === value);
  const displayValue = selectedOption ? selectedOption.label : '';
  const hasValue = !!displayValue;
  
  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Toggle dropdown
  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setIsFocused(!isOpen);
    }
  };
  
  // Handle option selection
  const handleSelect = (optionValue) => {
    onChange({ target: { name, value: optionValue } });
    setIsOpen(false);
  };
  
  // Base styles for different variants
  const variantStyles = {
    default: {
      container: 'premium-select--default',
      select: 'premium-select__field--default',
      label: 'premium-select__label--default',
    },
    outlined: {
      container: 'premium-select--outlined',
      select: 'premium-select__field--outlined',
      label: 'premium-select__label--outlined',
    },
    filled: {
      container: 'premium-select--filled',
      select: 'premium-select__field--filled',
      label: 'premium-select__label--filled',
    },
  };
  
  // Animation variants for the label
  const labelVariants = {
    rest: { 
      y: hasValue || isFocused ? -22 : 0, 
      scale: hasValue || isFocused ? 0.85 : 1,
      color: isFocused ? '#00ADAD' : hasValue ? '#485563' : '#6B7280',
    },
    focus: { 
      y: -22, 
      scale: 0.85, 
      color: '#00ADAD',
    },
    error: {
      y: -22,
      scale: 0.85,
      color: '#EF4444',
    }
  };
  
  // Animation variants for the dropdown
  const dropdownVariants = {
    hidden: { 
      opacity: 0,
      y: -10,
      height: 0,
    },
    visible: { 
      opacity: 1,
      y: 0,
      height: 'auto',
      transition: {
        duration: 0.2,
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      height: 0,
      transition: {
        duration: 0.2,
      }
    }
  };
  
  // Animation for the chevron icon
  const chevronVariants = {
    open: { rotate: 180 },
    closed: { rotate: 0 }
  };
  
  return (
    <div 
      className={`premium-select ${variantStyles[variant].container} ${className} ${disabled ? 'premium-select--disabled' : ''}`}
      ref={selectRef}
    >
      <div className="premium-select__container">
        {label && (
          <motion.label
            htmlFor={name}
            className={`premium-select__label ${variantStyles[variant].label}`}
            initial="rest"
            animate={error ? "error" : isFocused ? "focus" : "rest"}
            variants={labelVariants}
            transition={{ duration: 0.2 }}
          >
            {label}{required && <span className="premium-select__required">*</span>}
          </motion.label>
        )}
        
        <div
          className={`premium-select__field ${variantStyles[variant].select} ${error ? 'premium-select__field--error' : ''}`}
          onClick={toggleDropdown}
        >
          <div className="premium-select__value">
            {displayValue || (isFocused ? '' : placeholder)}
          </div>
          
          <motion.div
            className="premium-select__chevron"
            animate={isOpen ? "open" : "closed"}
            variants={chevronVariants}
            transition={{ duration: 0.2 }}
          >
            <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </div>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="premium-select__dropdown"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={dropdownVariants}
            >
              {options.map((option) => (
                <div
                  key={option.value}
                  className={`premium-select__option ${option.value === value ? 'premium-select__option--selected' : ''}`}
                  onClick={() => handleSelect(option.value)}
                >
                  {option.label}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {(error || helperText) && (
        <div className="premium-select__helper">
          <span className={`premium-select__helper-text ${error ? 'premium-select__helper-text--error' : ''}`}>
            {error || helperText}
          </span>
        </div>
      )}
    </div>
  );
};

Select.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  placeholder: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'outlined', 'filled']),
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  helperText: PropTypes.string,
  className: PropTypes.string,
};

export default Select;
