import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Premium LineChart component for data visualization
 * 
 * @param {Object} props - Component props
 * @param {Array} props.data - Array of data points [{x: string, y: number}]
 * @param {string} props.xLabel - Label for x-axis
 * @param {string} props.yLabel - Label for y-axis
 * @param {string} props.title - Chart title
 * @param {string} props.color - Line color
 * @param {boolean} props.showGrid - Whether to show grid lines
 * @param {boolean} props.showArea - Whether to show area under the line
 * @param {boolean} props.showTooltip - Whether to show tooltips on hover
 * @param {boolean} props.animate - Whether to animate the chart
 * @param {string} props.height - Chart height
 * @param {string} props.className - Additional CSS class names
 * @returns {JSX.Element} - Rendered component
 */
const LineChart = ({
  data = [],
  xLabel = '',
  yLabel = '',
  title = '',
  color = '#00ADAD',
  showGrid = true,
  showArea = true,
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
      bottom: 50,
      left: 60
    };
    
    // Calculate chart dimensions
    const chartWidth = svgWidth - margin.left - margin.right;
    const chartHeight = svgHeight - margin.top - margin.bottom;
    
    // Find min and max values
    const xValues = data.map(d => d.x);
    const yValues = data.map(d => d.y);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    const yPadding = (yMax - yMin) * 0.1;
    
    // Create scales
    const xScale = index => margin.left + (index * chartWidth) / (data.length - 1);
    const yScale = value => margin.top + chartHeight - ((value - yMin + yPadding) * chartHeight) / (yMax - yMin + yPadding * 2);
    
    // Create group for chart elements
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(g);
    
    // Add grid lines if enabled
    if (showGrid) {
      // Horizontal grid lines
      const yTickCount = 5;
      const yStep = (yMax - yMin) / (yTickCount - 1);
      
      for (let i = 0; i < yTickCount; i++) {
        const yValue = yMin + i * yStep;
        const y = yScale(yValue);
        
        const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        gridLine.setAttribute('x1', margin.left);
        gridLine.setAttribute('y1', y);
        gridLine.setAttribute('x2', svgWidth - margin.right);
        gridLine.setAttribute('y2', y);
        gridLine.setAttribute('stroke', '#E5E7EB');
        gridLine.setAttribute('stroke-width', '1');
        gridLine.setAttribute('stroke-dasharray', '5,5');
        g.appendChild(gridLine);
        
        // Y-axis labels
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
      
      // Vertical grid lines
      const xTickCount = Math.min(data.length, 7);
      const xStep = Math.floor(data.length / (xTickCount - 1));
      
      for (let i = 0; i < data.length; i += xStep) {
        if (i <= data.length - 1) {
          const x = xScale(i);
          
          const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          gridLine.setAttribute('x1', x);
          gridLine.setAttribute('y1', margin.top);
          gridLine.setAttribute('x2', x);
          gridLine.setAttribute('y2', svgHeight - margin.bottom);
          gridLine.setAttribute('stroke', '#E5E7EB');
          gridLine.setAttribute('stroke-width', '1');
          gridLine.setAttribute('stroke-dasharray', '5,5');
          g.appendChild(gridLine);
          
          // X-axis labels
          const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          xLabel.setAttribute('x', x);
          xLabel.setAttribute('y', svgHeight - margin.bottom + 20);
          xLabel.setAttribute('text-anchor', 'middle');
          xLabel.setAttribute('fill', '#6B7280');
          xLabel.setAttribute('font-size', '12px');
          xLabel.textContent = data[i].x;
          g.appendChild(xLabel);
        }
      }
    }
    
    // Create path for line
    const linePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let d = `M ${xScale(0)} ${yScale(data[0].y)}`;
    
    for (let i = 1; i < data.length; i++) {
      d += ` L ${xScale(i)} ${yScale(data[i].y)}`;
    }
    
    linePath.setAttribute('d', d);
    linePath.setAttribute('fill', 'none');
    linePath.setAttribute('stroke', color);
    linePath.setAttribute('stroke-width', '3');
    linePath.setAttribute('stroke-linecap', 'round');
    linePath.setAttribute('stroke-linejoin', 'round');
    
    // Add animation if enabled
    if (animate) {
      const length = linePath.getTotalLength();
      linePath.setAttribute('stroke-dasharray', length);
      linePath.setAttribute('stroke-dashoffset', length);
      linePath.style.transition = 'stroke-dashoffset 1.5s ease-in-out';
      
      // Trigger animation
      setTimeout(() => {
        linePath.style.strokeDashoffset = '0';
      }, 100);
    }
    
    g.appendChild(linePath);
    
    // Create area under the line if enabled
    if (showArea) {
      const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      let areaD = `M ${xScale(0)} ${yScale(data[0].y)}`;
      
      for (let i = 1; i < data.length; i++) {
        areaD += ` L ${xScale(i)} ${yScale(data[i].y)}`;
      }
      
      // Complete the area path
      areaD += ` L ${xScale(data.length - 1)} ${svgHeight - margin.bottom}`;
      areaD += ` L ${xScale(0)} ${svgHeight - margin.bottom}`;
      areaD += ' Z';
      
      areaPath.setAttribute('d', areaD);
      areaPath.setAttribute('fill', color);
      areaPath.setAttribute('fill-opacity', '0.1');
      
      // Insert area path before line path for proper layering
      g.insertBefore(areaPath, linePath);
      
      // Add animation if enabled
      if (animate) {
        areaPath.style.opacity = '0';
        areaPath.style.transition = 'opacity 1.5s ease-in-out';
        
        // Trigger animation
        setTimeout(() => {
          areaPath.style.opacity = '1';
        }, 100);
      }
    }
    
    // Add data points
    for (let i = 0; i < data.length; i++) {
      const point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      point.setAttribute('cx', xScale(i));
      point.setAttribute('cy', yScale(data[i].y));
      point.setAttribute('r', '4');
      point.setAttribute('fill', 'white');
      point.setAttribute('stroke', color);
      point.setAttribute('stroke-width', '2');
      point.setAttribute('class', 'premium-line-chart__point');
      
      // Add animation if enabled
      if (animate) {
        point.style.opacity = '0';
        point.style.transition = `opacity 0.3s ease-in-out ${i * 0.05 + 1}s`;
        
        // Trigger animation
        setTimeout(() => {
          point.style.opacity = '1';
        }, 100);
      }
      
      // Add tooltip event listeners if enabled
      if (showTooltip) {
        point.addEventListener('mouseenter', (e) => {
          // Show tooltip
          tooltip.style.display = 'block';
          tooltip.style.left = `${e.clientX}px`;
          tooltip.style.top = `${e.clientY - 40}px`;
          tooltip.innerHTML = `
            <div class="premium-line-chart__tooltip-label">${data[i].x}</div>
            <div class="premium-line-chart__tooltip-value">${data[i].y.toLocaleString()}</div>
          `;
          
          // Highlight point
          point.setAttribute('r', '6');
        });
        
        point.addEventListener('mouseleave', () => {
          // Hide tooltip
          tooltip.style.display = 'none';
          
          // Reset point size
          point.setAttribute('r', '4');
        });
      }
      
      g.appendChild(point);
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
  }, [data, xLabel, yLabel, color, showGrid, showArea, showTooltip, animate]);
  
  return (
    <div className={`premium-line-chart ${className}`} style={{ height }}>
      {title && (
        <h3 className="premium-line-chart__title">{title}</h3>
      )}
      
      <div className="premium-line-chart__container">
        <svg
          ref={svgRef}
          className="premium-line-chart__svg"
          width="100%"
          height="100%"
          viewBox="0 0 100% 100%"
          preserveAspectRatio="xMidYMid meet"
        />
        
        {showTooltip && (
          <div
            ref={tooltipRef}
            className="premium-line-chart__tooltip"
            style={{ display: 'none' }}
          />
        )}
      </div>
    </div>
  );
};

LineChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      x: PropTypes.string.isRequired,
      y: PropTypes.number.isRequired,
    })
  ).isRequired,
  xLabel: PropTypes.string,
  yLabel: PropTypes.string,
  title: PropTypes.string,
  color: PropTypes.string,
  showGrid: PropTypes.bool,
  showArea: PropTypes.bool,
  showTooltip: PropTypes.bool,
  animate: PropTypes.bool,
  height: PropTypes.string,
  className: PropTypes.string,
};

export default LineChart;
