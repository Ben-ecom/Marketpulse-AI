import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Premium PieChart component for data visualization
 * 
 * @param {Object} props - Component props
 * @param {Array} props.data - Array of data points [{label: string, value: number, color: string}]
 * @param {string} props.title - Chart title
 * @param {boolean} props.donut - Whether to display as a donut chart
 * @param {number} props.donutThickness - Thickness of the donut (0-1)
 * @param {boolean} props.showLabels - Whether to show labels
 * @param {boolean} props.showLegend - Whether to show legend
 * @param {boolean} props.showPercentages - Whether to show percentages
 * @param {boolean} props.showTooltip - Whether to show tooltips on hover
 * @param {boolean} props.animate - Whether to animate the chart
 * @param {string} props.height - Chart height
 * @param {string} props.className - Additional CSS class names
 * @returns {JSX.Element} - Rendered component
 */
const PieChart = ({
  data = [],
  title = '',
  donut = false,
  donutThickness = 0.6,
  showLabels = true,
  showLegend = true,
  showPercentages = true,
  showTooltip = true,
  animate = true,
  height = '300px',
  className = '',
}) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const [activeSegment, setActiveSegment] = useState(null);
  
  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;
    
    const svg = svgRef.current;
    const tooltip = tooltipRef.current;
    
    // Clear previous content
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }
    
    // Get SVG dimensions
    const svgWidth = svg.clientWidth;
    const svgHeight = svg.clientHeight;
    
    // Calculate margins and chart dimensions
    const margin = 20;
    const chartWidth = svgWidth - margin * 2;
    const chartHeight = svgHeight - margin * 2;
    const chartSize = Math.min(chartWidth, chartHeight);
    
    // Calculate center position
    const centerX = svgWidth / 2;
    const centerY = svgHeight / 2;
    
    // Calculate radius
    const radius = chartSize / 2;
    
    // Calculate total value
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    // Create group for chart elements
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(g);
    
    // Calculate segments
    let startAngle = 0;
    const segments = data.map((item, index) => {
      const percentage = item.value / total;
      const angle = percentage * 360;
      const endAngle = startAngle + angle;
      
      // Calculate segment path
      const segment = {
        index,
        label: item.label,
        value: item.value,
        percentage,
        color: item.color || getDefaultColor(index),
        startAngle,
        endAngle,
        largeArcFlag: angle > 180 ? 1 : 0,
      };
      
      startAngle = endAngle;
      return segment;
    });
    
    // Create segments
    segments.forEach((segment, index) => {
      // Convert angles to radians
      const startRad = (segment.startAngle - 90) * (Math.PI / 180);
      const endRad = (segment.endAngle - 90) * (Math.PI / 180);
      
      // Calculate outer points
      const outerStartX = centerX + radius * Math.cos(startRad);
      const outerStartY = centerY + radius * Math.sin(startRad);
      const outerEndX = centerX + radius * Math.cos(endRad);
      const outerEndY = centerY + radius * Math.sin(endRad);
      
      // Create path data
      let pathData;
      
      if (donut) {
        // Calculate inner radius
        const innerRadius = radius * (1 - donutThickness);
        
        // Calculate inner points
        const innerStartX = centerX + innerRadius * Math.cos(startRad);
        const innerStartY = centerY + innerRadius * Math.sin(startRad);
        const innerEndX = centerX + innerRadius * Math.cos(endRad);
        const innerEndY = centerY + innerRadius * Math.sin(endRad);
        
        // Create donut segment path
        pathData = [
          `M ${outerStartX} ${outerStartY}`,
          `A ${radius} ${radius} 0 ${segment.largeArcFlag} 1 ${outerEndX} ${outerEndY}`,
          `L ${innerEndX} ${innerEndY}`,
          `A ${innerRadius} ${innerRadius} 0 ${segment.largeArcFlag} 0 ${innerStartX} ${innerStartY}`,
          'Z'
        ].join(' ');
      } else {
        // Create pie segment path
        pathData = [
          `M ${centerX} ${centerY}`,
          `L ${outerStartX} ${outerStartY}`,
          `A ${radius} ${radius} 0 ${segment.largeArcFlag} 1 ${outerEndX} ${outerEndY}`,
          'Z'
        ].join(' ');
      }
      
      // Create segment path element
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData);
      path.setAttribute('fill', segment.color);
      path.setAttribute('stroke', 'white');
      path.setAttribute('stroke-width', '1');
      path.setAttribute('class', 'premium-pie-chart__segment');
      path.setAttribute('data-index', index);
      
      // Add animation if enabled
      if (animate) {
        // Start from center
        const initialPathData = donut
          ? `M ${centerX} ${centerY} L ${centerX} ${centerY} A 0 0 0 ${segment.largeArcFlag} 1 ${centerX} ${centerY} L ${centerX} ${centerY} A 0 0 0 ${segment.largeArcFlag} 0 ${centerX} ${centerY} Z`
          : `M ${centerX} ${centerY} L ${centerX} ${centerY} A 0 0 0 ${segment.largeArcFlag} 1 ${centerX} ${centerY} Z`;
        
        path.setAttribute('d', initialPathData);
        path.style.transition = `d 1s ease-out ${index * 0.1}s`;
        
        // Trigger animation
        setTimeout(() => {
          path.setAttribute('d', pathData);
        }, 100);
      }
      
      // Add event listeners
      path.addEventListener('mouseenter', (e) => {
        // Highlight segment
        path.setAttribute('stroke-width', '2');
        path.style.transform = 'scale(1.05)';
        path.style.transformOrigin = `${centerX}px ${centerY}px`;
        
        // Update active segment
        setActiveSegment(segment);
        
        // Show tooltip if enabled
        if (showTooltip) {
          tooltip.style.display = 'block';
          tooltip.style.left = `${e.clientX}px`;
          tooltip.style.top = `${e.clientY - 40}px`;
          tooltip.innerHTML = `
            <div class="premium-pie-chart__tooltip-label">${segment.label}</div>
            <div class="premium-pie-chart__tooltip-value">${segment.value.toLocaleString()}</div>
            <div class="premium-pie-chart__tooltip-percentage">${(segment.percentage * 100).toFixed(1)}%</div>
          `;
        }
      });
      
      path.addEventListener('mouseleave', () => {
        // Reset segment
        path.setAttribute('stroke-width', '1');
        path.style.transform = 'scale(1)';
        
        // Reset active segment
        setActiveSegment(null);
        
        // Hide tooltip
        if (showTooltip) {
          tooltip.style.display = 'none';
        }
      });
      
      g.appendChild(path);
      
      // Add labels if enabled
      if (showLabels) {
        // Calculate label position
        const midAngleRad = ((segment.startAngle + segment.endAngle) / 2 - 90) * (Math.PI / 180);
        const labelRadius = donut ? radius * (1 - donutThickness / 2) : radius * 0.7;
        const labelX = centerX + labelRadius * Math.cos(midAngleRad);
        const labelY = centerY + labelRadius * Math.sin(midAngleRad);
        
        // Only show label if segment is large enough
        if (segment.percentage > 0.05) {
          // Create label
          const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          label.setAttribute('x', labelX);
          label.setAttribute('y', labelY);
          label.setAttribute('text-anchor', 'middle');
          label.setAttribute('dominant-baseline', 'middle');
          label.setAttribute('fill', getContrastColor(segment.color));
          label.setAttribute('font-size', '12px');
          label.setAttribute('font-weight', 'bold');
          label.setAttribute('class', 'premium-pie-chart__label');
          label.setAttribute('opacity', animate ? 0 : 1);
          
          // Show percentage or label based on configuration
          label.textContent = showPercentages
            ? `${(segment.percentage * 100).toFixed(0)}%`
            : segment.label.length > 10
              ? segment.label.substring(0, 10) + '...'
              : segment.label;
          
          // Add animation if enabled
          if (animate) {
            label.style.transition = `opacity 0.5s ease-out ${index * 0.1 + 0.5}s`;
            
            // Trigger animation
            setTimeout(() => {
              label.setAttribute('opacity', 1);
            }, 100);
          }
          
          g.appendChild(label);
        }
      }
    });
    
    // Add center label for donut chart
    if (donut) {
      const centerLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      centerLabel.setAttribute('x', centerX);
      centerLabel.setAttribute('y', centerY);
      centerLabel.setAttribute('text-anchor', 'middle');
      centerLabel.setAttribute('dominant-baseline', 'middle');
      centerLabel.setAttribute('fill', '#4B5563');
      centerLabel.setAttribute('font-size', '14px');
      centerLabel.setAttribute('font-weight', 'bold');
      centerLabel.setAttribute('class', 'premium-pie-chart__center-label');
      
      // Show total value
      centerLabel.textContent = total.toLocaleString();
      
      g.appendChild(centerLabel);
      
      // Add center label description
      const centerDesc = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      centerDesc.setAttribute('x', centerX);
      centerDesc.setAttribute('y', centerY + 20);
      centerDesc.setAttribute('text-anchor', 'middle');
      centerDesc.setAttribute('dominant-baseline', 'middle');
      centerDesc.setAttribute('fill', '#6B7280');
      centerDesc.setAttribute('font-size', '12px');
      centerDesc.setAttribute('class', 'premium-pie-chart__center-desc');
      
      // Show "Total" text
      centerDesc.textContent = 'Total';
      
      g.appendChild(centerDesc);
    }
  }, [data, donut, donutThickness, showLabels, showPercentages, animate, activeSegment]);
  
  // Helper function to get default color based on index
  const getDefaultColor = (index) => {
    const colors = [
      '#00ADAD', // Primary teal
      '#485563', // Dark gray
      '#3B82F6', // Blue
      '#10B981', // Green
      '#F59E0B', // Amber
      '#EF4444', // Red
      '#8B5CF6', // Purple
      '#EC4899', // Pink
      '#14B8A6', // Teal
      '#F97316', // Orange
    ];
    
    return colors[index % colors.length];
  };
  
  // Helper function to get contrast color (black or white) based on background color
  const getContrastColor = (hexColor) => {
    // Convert hex to RGB
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black for light colors, white for dark colors
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };
  
  return (
    <div className={`premium-pie-chart ${className}`} style={{ height }}>
      {title && (
        <h3 className="premium-pie-chart__title">{title}</h3>
      )}
      
      <div className="premium-pie-chart__container">
        <div className="premium-pie-chart__chart">
          <svg
            ref={svgRef}
            className="premium-pie-chart__svg"
            width="100%"
            height="100%"
            viewBox="0 0 100% 100%"
            preserveAspectRatio="xMidYMid meet"
          />
          
          {showTooltip && (
            <div
              ref={tooltipRef}
              className="premium-pie-chart__tooltip"
              style={{ display: 'none' }}
            />
          )}
        </div>
        
        {showLegend && (
          <div className="premium-pie-chart__legend">
            {data.map((item, index) => (
              <div
                key={index}
                className={`premium-pie-chart__legend-item ${activeSegment?.index === index ? 'premium-pie-chart__legend-item--active' : ''}`}
              >
                <div
                  className="premium-pie-chart__legend-color"
                  style={{ backgroundColor: item.color || getDefaultColor(index) }}
                />
                <div className="premium-pie-chart__legend-label">
                  {item.label}
                </div>
                <div className="premium-pie-chart__legend-value">
                  {item.value.toLocaleString()}
                  {showPercentages && (
                    <span className="premium-pie-chart__legend-percentage">
                      {' '}({((item.value / data.reduce((sum, i) => sum + i.value, 0)) * 100).toFixed(1)}%)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

PieChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
      color: PropTypes.string,
    })
  ).isRequired,
  title: PropTypes.string,
  donut: PropTypes.bool,
  donutThickness: PropTypes.number,
  showLabels: PropTypes.bool,
  showLegend: PropTypes.bool,
  showPercentages: PropTypes.bool,
  showTooltip: PropTypes.bool,
  animate: PropTypes.bool,
  height: PropTypes.string,
  className: PropTypes.string,
};

export default PieChart;
