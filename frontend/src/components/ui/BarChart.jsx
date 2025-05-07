import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Premium BarChart component for data visualization
 * 
 * @param {Object} props - Component props
 * @param {Array} props.data - Array of data points [{label: string, value: number}]
 * @param {string} props.xLabel - Label for x-axis
 * @param {string} props.yLabel - Label for y-axis
 * @param {string} props.title - Chart title
 * @param {string} props.color - Bar color
 * @param {boolean} props.horizontal - Whether to display bars horizontally
 * @param {boolean} props.showGrid - Whether to show grid lines
 * @param {boolean} props.showTooltip - Whether to show tooltips on hover
 * @param {boolean} props.animate - Whether to animate the chart
 * @param {string} props.height - Chart height
 * @param {string} props.className - Additional CSS class names
 * @returns {JSX.Element} - Rendered component
 */
const BarChart = ({
  data = [],
  xLabel = '',
  yLabel = '',
  title = '',
  color = '#00ADAD',
  horizontal = false,
  showGrid = true,
  showTooltip = true,
  animate = true,
  height = '300px',
  className = '',
}) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  
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
    
    // Calculate margins
    const margin = {
      top: 30,
      right: 30,
      bottom: 60,
      left: horizontal ? 120 : 60
    };
    
    // Calculate chart dimensions
    const chartWidth = svgWidth - margin.left - margin.right;
    const chartHeight = svgHeight - margin.top - margin.bottom;
    
    // Find max value
    const maxValue = Math.max(...data.map(d => d.value));
    
    // Create group for chart elements
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(g);
    
    // Create scales based on orientation
    if (horizontal) {
      // Horizontal bar chart
      
      // Add grid lines if enabled
      if (showGrid) {
        // Vertical grid lines (value axis)
        const xTickCount = 5;
        const xStep = maxValue / (xTickCount - 1);
        
        for (let i = 0; i < xTickCount; i++) {
          const xValue = i * xStep;
          const x = margin.left + (xValue * chartWidth) / maxValue;
          
          const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          gridLine.setAttribute('x1', x);
          gridLine.setAttribute('y1', margin.top);
          gridLine.setAttribute('x2', x);
          gridLine.setAttribute('y2', svgHeight - margin.bottom);
          gridLine.setAttribute('stroke', '#E5E7EB');
          gridLine.setAttribute('stroke-width', '1');
          gridLine.setAttribute('stroke-dasharray', '5,5');
          g.appendChild(gridLine);
          
          // X-axis labels (values)
          const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          xLabel.setAttribute('x', x);
          xLabel.setAttribute('y', svgHeight - margin.bottom + 20);
          xLabel.setAttribute('text-anchor', 'middle');
          xLabel.setAttribute('fill', '#6B7280');
          xLabel.setAttribute('font-size', '12px');
          xLabel.textContent = xValue.toLocaleString(undefined, { maximumFractionDigits: 1 });
          g.appendChild(xLabel);
        }
      }
      
      // Create bars
      const barHeight = chartHeight / data.length * 0.7;
      const barSpacing = chartHeight / data.length * 0.3;
      
      for (let i = 0; i < data.length; i++) {
        const barWidth = (data[i].value * chartWidth) / maxValue;
        const y = margin.top + i * (barHeight + barSpacing) + barSpacing / 2;
        
        // Create bar
        const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bar.setAttribute('x', margin.left);
        bar.setAttribute('y', y);
        bar.setAttribute('width', animate ? 0 : barWidth);
        bar.setAttribute('height', barHeight);
        bar.setAttribute('fill', color);
        bar.setAttribute('rx', '3');
        bar.setAttribute('ry', '3');
        bar.setAttribute('class', 'premium-bar-chart__bar');
        
        // Add animation if enabled
        if (animate) {
          bar.style.transition = `width 1s ease-out ${i * 0.1}s`;
          
          // Trigger animation
          setTimeout(() => {
            bar.setAttribute('width', barWidth);
          }, 100);
        }
        
        // Add tooltip event listeners if enabled
        if (showTooltip) {
          bar.addEventListener('mouseenter', (e) => {
            // Show tooltip
            tooltip.style.display = 'block';
            tooltip.style.left = `${e.clientX}px`;
            tooltip.style.top = `${e.clientY - 40}px`;
            tooltip.innerHTML = `
              <div class="premium-bar-chart__tooltip-label">${data[i].label}</div>
              <div class="premium-bar-chart__tooltip-value">${data[i].value.toLocaleString()}</div>
            `;
            
            // Highlight bar
            bar.setAttribute('fill', shadeColor(color, -15));
          });
          
          bar.addEventListener('mouseleave', () => {
            // Hide tooltip
            tooltip.style.display = 'none';
            
            // Reset bar color
            bar.setAttribute('fill', color);
          });
        }
        
        g.appendChild(bar);
        
        // Add label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', margin.left - 10);
        label.setAttribute('y', y + barHeight / 2);
        label.setAttribute('text-anchor', 'end');
        label.setAttribute('dominant-baseline', 'middle');
        label.setAttribute('fill', '#4B5563');
        label.setAttribute('font-size', '12px');
        label.textContent = data[i].label;
        g.appendChild(label);
        
        // Add value label
        const valueLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        valueLabel.setAttribute('x', margin.left + barWidth + 10);
        valueLabel.setAttribute('y', y + barHeight / 2);
        valueLabel.setAttribute('dominant-baseline', 'middle');
        valueLabel.setAttribute('fill', '#4B5563');
        valueLabel.setAttribute('font-size', '12px');
        valueLabel.setAttribute('opacity', animate ? 0 : 1);
        valueLabel.textContent = data[i].value.toLocaleString();
        
        // Add animation if enabled
        if (animate) {
          valueLabel.style.transition = `opacity 0.5s ease-out ${i * 0.1 + 0.5}s`;
          
          // Trigger animation
          setTimeout(() => {
            valueLabel.setAttribute('opacity', 1);
          }, 100);
        }
        
        g.appendChild(valueLabel);
      }
      
      // Add x-axis
      const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      xAxis.setAttribute('x1', margin.left);
      xAxis.setAttribute('y1', svgHeight - margin.bottom);
      xAxis.setAttribute('x2', svgWidth - margin.right);
      xAxis.setAttribute('y2', svgHeight - margin.bottom);
      xAxis.setAttribute('stroke', '#D1D5DB');
      xAxis.setAttribute('stroke-width', '1');
      g.appendChild(xAxis);
      
      // Add y-axis
      const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      yAxis.setAttribute('x1', margin.left);
      yAxis.setAttribute('y1', margin.top);
      yAxis.setAttribute('x2', margin.left);
      yAxis.setAttribute('y2', svgHeight - margin.bottom);
      yAxis.setAttribute('stroke', '#D1D5DB');
      yAxis.setAttribute('stroke-width', '1');
      g.appendChild(yAxis);
      
    } else {
      // Vertical bar chart
      
      // Add grid lines if enabled
      if (showGrid) {
        // Horizontal grid lines (value axis)
        const yTickCount = 5;
        const yStep = maxValue / (yTickCount - 1);
        
        for (let i = 0; i < yTickCount; i++) {
          const yValue = i * yStep;
          const y = svgHeight - margin.bottom - (yValue * chartHeight) / maxValue;
          
          const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          gridLine.setAttribute('x1', margin.left);
          gridLine.setAttribute('y1', y);
          gridLine.setAttribute('x2', svgWidth - margin.right);
          gridLine.setAttribute('y2', y);
          gridLine.setAttribute('stroke', '#E5E7EB');
          gridLine.setAttribute('stroke-width', '1');
          gridLine.setAttribute('stroke-dasharray', '5,5');
          g.appendChild(gridLine);
          
          // Y-axis labels (values)
          const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          yLabel.setAttribute('x', margin.left - 10);
          yLabel.setAttribute('y', y);
          yLabel.setAttribute('text-anchor', 'end');
          yLabel.setAttribute('dominant-baseline', 'middle');
          yLabel.setAttribute('fill', '#6B7280');
          yLabel.setAttribute('font-size', '12px');
          yLabel.textContent = yValue.toLocaleString(undefined, { maximumFractionDigits: 1 });
          g.appendChild(yLabel);
        }
      }
      
      // Create bars
      const barWidth = chartWidth / data.length * 0.7;
      const barSpacing = chartWidth / data.length * 0.3;
      
      for (let i = 0; i < data.length; i++) {
        const barHeight = (data[i].value * chartHeight) / maxValue;
        const x = margin.left + i * (barWidth + barSpacing) + barSpacing / 2;
        const y = svgHeight - margin.bottom - barHeight;
        
        // Create bar
        const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bar.setAttribute('x', x);
        bar.setAttribute('y', animate ? svgHeight - margin.bottom : y);
        bar.setAttribute('width', barWidth);
        bar.setAttribute('height', animate ? 0 : barHeight);
        bar.setAttribute('fill', color);
        bar.setAttribute('rx', '3');
        bar.setAttribute('ry', '3');
        bar.setAttribute('class', 'premium-bar-chart__bar');
        
        // Add animation if enabled
        if (animate) {
          bar.style.transition = `height 1s ease-out ${i * 0.1}s, y 1s ease-out ${i * 0.1}s`;
          
          // Trigger animation
          setTimeout(() => {
            bar.setAttribute('height', barHeight);
            bar.setAttribute('y', y);
          }, 100);
        }
        
        // Add tooltip event listeners if enabled
        if (showTooltip) {
          bar.addEventListener('mouseenter', (e) => {
            // Show tooltip
            tooltip.style.display = 'block';
            tooltip.style.left = `${e.clientX}px`;
            tooltip.style.top = `${e.clientY - 40}px`;
            tooltip.innerHTML = `
              <div class="premium-bar-chart__tooltip-label">${data[i].label}</div>
              <div class="premium-bar-chart__tooltip-value">${data[i].value.toLocaleString()}</div>
            `;
            
            // Highlight bar
            bar.setAttribute('fill', shadeColor(color, -15));
          });
          
          bar.addEventListener('mouseleave', () => {
            // Hide tooltip
            tooltip.style.display = 'none';
            
            // Reset bar color
            bar.setAttribute('fill', color);
          });
        }
        
        g.appendChild(bar);
        
        // Add label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', x + barWidth / 2);
        label.setAttribute('y', svgHeight - margin.bottom + 20);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('fill', '#4B5563');
        label.setAttribute('font-size', '12px');
        
        // Handle long labels
        if (data[i].label.length > 10) {
          label.textContent = data[i].label.substring(0, 10) + '...';
        } else {
          label.textContent = data[i].label;
        }
        
        g.appendChild(label);
        
        // Add value label
        const valueLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        valueLabel.setAttribute('x', x + barWidth / 2);
        valueLabel.setAttribute('y', y - 10);
        valueLabel.setAttribute('text-anchor', 'middle');
        valueLabel.setAttribute('fill', '#4B5563');
        valueLabel.setAttribute('font-size', '12px');
        valueLabel.setAttribute('opacity', animate ? 0 : 1);
        valueLabel.textContent = data[i].value.toLocaleString();
        
        // Add animation if enabled
        if (animate) {
          valueLabel.style.transition = `opacity 0.5s ease-out ${i * 0.1 + 0.5}s`;
          
          // Trigger animation
          setTimeout(() => {
            valueLabel.setAttribute('opacity', 1);
          }, 100);
        }
        
        g.appendChild(valueLabel);
      }
      
      // Add x-axis
      const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      xAxis.setAttribute('x1', margin.left);
      xAxis.setAttribute('y1', svgHeight - margin.bottom);
      xAxis.setAttribute('x2', svgWidth - margin.right);
      xAxis.setAttribute('y2', svgHeight - margin.bottom);
      xAxis.setAttribute('stroke', '#D1D5DB');
      xAxis.setAttribute('stroke-width', '1');
      g.appendChild(xAxis);
      
      // Add y-axis
      const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      yAxis.setAttribute('x1', margin.left);
      yAxis.setAttribute('y1', margin.top);
      yAxis.setAttribute('x2', margin.left);
      yAxis.setAttribute('y2', svgHeight - margin.bottom);
      yAxis.setAttribute('stroke', '#D1D5DB');
      yAxis.setAttribute('stroke-width', '1');
      g.appendChild(yAxis);
    }
    
    // Add x-axis label if provided
    if (xLabel) {
      const xAxisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      xAxisLabel.setAttribute('x', margin.left + chartWidth / 2);
      xAxisLabel.setAttribute('y', svgHeight - 10);
      xAxisLabel.setAttribute('text-anchor', 'middle');
      xAxisLabel.setAttribute('fill', '#4B5563');
      xAxisLabel.setAttribute('font-size', '14px');
      xAxisLabel.textContent = xLabel;
      g.appendChild(xAxisLabel);
    }
    
    // Add y-axis label if provided
    if (yLabel) {
      const yAxisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      yAxisLabel.setAttribute('x', 15);
      yAxisLabel.setAttribute('y', margin.top + chartHeight / 2);
      yAxisLabel.setAttribute('text-anchor', 'middle');
      yAxisLabel.setAttribute('fill', '#4B5563');
      yAxisLabel.setAttribute('font-size', '14px');
      yAxisLabel.setAttribute('transform', `rotate(-90, 15, ${margin.top + chartHeight / 2})`);
      yAxisLabel.textContent = yLabel;
      g.appendChild(yAxisLabel);
    }
  }, [data, xLabel, yLabel, color, horizontal, showGrid, showTooltip, animate]);
  
  // Helper function to shade a color
  const shadeColor = (color, percent) => {
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R < 255) ? R : 255;
    G = (G < 255) ? G : 255;
    B = (B < 255) ? B : 255;

    const RR = ((R.toString(16).length === 1) ? "0" + R.toString(16) : R.toString(16));
    const GG = ((G.toString(16).length === 1) ? "0" + G.toString(16) : G.toString(16));
    const BB = ((B.toString(16).length === 1) ? "0" + B.toString(16) : B.toString(16));

    return "#" + RR + GG + BB;
  };
  
  return (
    <div className={`premium-bar-chart ${className}`} style={{ height }}>
      {title && (
        <h3 className="premium-bar-chart__title">{title}</h3>
      )}
      
      <div className="premium-bar-chart__container">
        <svg
          ref={svgRef}
          className="premium-bar-chart__svg"
          width="100%"
          height="100%"
          viewBox="0 0 100% 100%"
          preserveAspectRatio="xMidYMid meet"
        />
        
        {showTooltip && (
          <div
            ref={tooltipRef}
            className="premium-bar-chart__tooltip"
            style={{ display: 'none' }}
          />
        )}
      </div>
    </div>
  );
};

BarChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    })
  ).isRequired,
  xLabel: PropTypes.string,
  yLabel: PropTypes.string,
  title: PropTypes.string,
  color: PropTypes.string,
  horizontal: PropTypes.bool,
  showGrid: PropTypes.bool,
  showTooltip: PropTypes.bool,
  animate: PropTypes.bool,
  height: PropTypes.string,
  className: PropTypes.string,
};

export default BarChart;
