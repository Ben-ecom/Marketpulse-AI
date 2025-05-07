import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Premium Input component with animations and styling
 * 
 * @param {Object} props - Component props
 * @param {string} props.label - Input label
 * @param {string} props.type - Input type (text, email, password, etc.)
 * @param {string} props.name - Input name attribute
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler function
 * @param {string} props.placeholder - Input placeholder
 * @param {string} props.variant - Input variant (default, outlined, filled)
 * @param {boolean} props.required - Whether the input is required
 * @param {boolean} props.disabled - Whether the input is disabled
 * @param {string} props.error - Error message to display
 * @param {string} props.helperText - Helper text to display below input
 * @param {string} props.className - Additional CSS class names
 * @returns {JSX.Element} - Rendered component
 */
const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  variant = 'default',
  required = false,
  disabled = false,
  error = '',
  helperText = '',
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  // Determine if the input has content for floating label effect
  const hasContent = value && value.length > 0;
  
  // Handle focus event
  const handleFocus = () => {
    setIsFocused(true);
  };
  
  // Handle blur event
  const handleBlur = () => {
    setIsFocused(false);
  };
  
  // Base styles for different variants
  const variantStyles = {
    default: {
      container: 'premium-input--default',
      input: 'premium-input__field--default',
      label: 'premium-input__label--default',
    },
    outlined: {
      container: 'premium-input--outlined',
      input: 'premium-input__field--outlined',
      label: 'premium-input__label--outlined',
    },
    filled: {
      container: 'premium-input--filled',
      input: 'premium-input__field--filled',
      label: 'premium-input__label--filled',
    },
  };
  
  // Animation variants for the label
  const labelVariants = {
    rest: { 
      y: hasContent || isFocused ? -22 : 0, 
      scale: hasContent || isFocused ? 0.85 : 1,
      color: isFocused ? '#00ADAD' : hasContent ? '#485563' : '#6B7280',
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
  
  // Animation variants for the input underline
  const underlineVariants = {
    rest: { 
      scaleX: 0,
      backgroundColor: '#00ADAD',
    },
    focus: { 
      scaleX: 1,
      backgroundColor: '#00ADAD',
    },
    error: {
      scaleX: 1,
      backgroundColor: '#EF4444',
    }
  };
  
  return (
    <div className={`premium-input ${variantStyles[variant].container} ${className} ${disabled ? 'premium-input--disabled' : ''}`}>
      <div className="premium-input__container">
        {label && (
          <motion.label
            htmlFor={name}
            className={`premium-input__label ${variantStyles[variant].label}`}
            initial="rest"
            animate={error ? "error" : isFocused ? "focus" : "rest"}
            variants={labelVariants}
            transition={{ duration: 0.2 }}
          >
            {label}{required && <span className="premium-input__required">*</span>}
          </motion.label>
        )}
        
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={isFocused ? placeholder : ''}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          className={`premium-input__field ${variantStyles[variant].input} ${error ? 'premium-input__field--error' : ''}`}
          {...props}
        />
        
        {variant === 'default' && (
          <motion.div
            className="premium-input__underline"
            initial="rest"
            animate={error ? "error" : isFocused ? "focus" : "rest"}
            variants={underlineVariants}
            transition={{ duration: 0.2 }}
          />
        )}
      </div>
      
      {(error || helperText) && (
        <div className="premium-input__helper">
          <span className={`premium-input__helper-text ${error ? 'premium-input__helper-text--error' : ''}`}>
            {error || helperText}
          </span>
        </div>
      )}
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'outlined', 'filled']),
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  helperText: PropTypes.string,
  className: PropTypes.string,
};

export default Input;
