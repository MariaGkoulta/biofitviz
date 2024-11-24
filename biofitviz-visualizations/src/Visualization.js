import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const Visualization = ({ setHullColors, setSelectedTrajectory, selectedTrajectory, workoutDescriptions, setWorkoutDescriptions }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/data')
      .then(response => response.json())
      .then(response => {
        const data = response.data;
        const hulls = response.hulls;
        const trajectories = response.trajectories;

        renderChart(data, hulls, trajectories);

        setHullColors(response.hulls.map(hull => ({ color: hull.color, cluster: hull.cluster, description: hull.description })));
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const renderChart = (data, hulls, trajectories) => {
    const width = 400;
    const height = 307;
    const margin = { top: 10, right: 30, bottom: 40, left: 50 };
  
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous content
  
    svg
      .attr('viewBox', [0, 0, width, height])
      .style('font', '10px sans-serif')
      .style('position', 'relative'); // Allow positioning of tooltip-like elements
  
    // Tooltip container for segment details
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background-color', 'white')
      .style('border', '1px solid #ccc')
      .style('padding', '10px')
      .style('display', 'none') // Hidden by default
      .style('z-index', '1000'); // Ensure tooltip appears on top
  
    // Scales
    const xScale = d3.scaleLinear().domain([-10, 10]).range([margin.left, width - margin.right]);
    const yScale = d3.scaleLinear().domain([-10, 10]).range([height - margin.bottom, margin.top]);
  
    // Render convex hulls
    hulls.forEach((hull) => {
      if (!hull.hull_points || !Array.isArray(hull.hull_points)) {
        console.error(`Invalid hull data for hull ${hull.cluster}. Skipping.`);
        return;
      }
  
      svg.append('path')
        .datum(hull.hull_points)
        .attr('fill', hull.color)
        .attr('opacity', 0.5)
        .attr('stroke', 'none')
        .attr(
          'd',
          d3.line()
            .x(d => xScale(d[0]))
            .y(d => yScale(d[1]))
            .curve(d3.curveBasisClosed) // Ensure the path closes
        );
    });
  
    // Render trajectories with segments
    data.forEach((trace, traceIndex) => {
      if (!trace.x || !trace.y || trace.x.length !== trace.y.length) {
        console.error(`Invalid data for trace ${traceIndex}. Skipping.`);
        return;
      }
  
      const points = trace.x.map((x, i) => ({ 
        x,
        y: trace.y[i],
        stateid: trace.stateid[i]
      }));
  
      // Create line segments from consecutive points
      const segments = points.slice(0, -1).map((point, i) => ({
        x1: point.x,
        y1: point.y,
        x2: points[i + 1].x,
        y2: points[i + 1].y,
        startingstate: point.stateid,
        endingstate: points[i + 1].stateid
      }));

      // Add invisible lines for better mouseover area
      svg.selectAll(`.segment-invisible-${traceIndex}`)
        .data(segments)
        .enter()
        .append('line')
        .attr('x1', d => xScale(d.x1))
        .attr('y1', d => yScale(d.y1))
        .attr('x2', d => xScale(d.x2))
        .attr('y2', d => yScale(d.y2))
        .attr('stroke', 'transparent')
        .attr('stroke-width', 5)  // Increase the width for better mouseover area
        .style('transition', 'stroke 0.3s ease')  // Smooth transition
        .on('mouseover', function(event, d) {
          d3.select(this).attr('stroke', 'rgba(255, 165, 0, 0.5)');  // Pastel orange
          // Find the corresponding trajectory
          const trajectory = trajectories.find(t => 
            t.startingid === d.startingstate && 
            t.endingid === d.endingstate
          );

          if (trajectory) {
            // print starting and ending state
            console.log('Starting state:', d.startingstate);
            console.log('Ending state:', d.endingstate);
            // Show tooltip with segment details and histogram
            tooltip
            .style('display', 'block')
            .html(`
              <div style="text-align: center;">
                <strong>Workouts distribution</strong>
              </div>
              <div id="histogram"></div>
            `);
          
          // Get tooltip dimensions
          const tooltipWidth = tooltip.node().offsetWidth;
          const tooltipHeight = tooltip.node().offsetHeight;
          
          // Calculate initial position
          let left = event.pageX + 10;
          let top = event.pageY - tooltipHeight - 10; // Position above the pointer
          
          // Adjust if the tooltip goes beyond the right edge
          if (left + tooltipWidth > window.innerWidth) {
            left = window.innerWidth - tooltipWidth - 10;
          }
          
          // Adjust if the tooltip goes above the top edge
          if (top < 0) {
            top = event.pageY + 10; // Position below the pointer
          }
          
          // Set the tooltip position
          tooltip
            .style('left', `${left}px`)
            .style('top', `${top}px`);

            // Render histogram
            const histogramData = trajectory.clusterdistribution;
            console.log('Histogram data:', histogramData);
            const histogramWidth = 200;
            const histogramHeight = 100;
            const histogramMargin = { top: 10, right: 10, bottom: 20, left: 30 };

            const xHistScale = d3.scaleBand()
              .domain(histogramData.map((d, i) => i))
              .range([0, histogramWidth])
              .padding(0.1);

            const yHistScale = d3.scaleLinear()
              .domain([0, d3.max(histogramData)])
              .nice()
              .range([histogramHeight, 0]);

            const colorScale = d3.scaleOrdinal(d3.schemeCategory10); // Changed color palette

            const svgHistogram = d3.select('#histogram')
              .append('svg')
              .attr('width', histogramWidth + histogramMargin.left + histogramMargin.right)
              .attr('height', histogramHeight + histogramMargin.top + histogramMargin.bottom)
              .append('g')
              .attr('transform', `translate(${histogramMargin.left},${histogramMargin.top})`);

            svgHistogram.selectAll('.bar')
              .data(histogramData)
              .enter()
              .append('rect')
              .attr('class', 'bar')
              .attr('x', (d, i) => xHistScale(i))
              .attr('y', d => yHistScale(d))
              .attr('width', xHistScale.bandwidth())
              .attr('height', d => histogramHeight - yHistScale(d))
              .attr('fill', (d, i) => colorScale(i));

            svgHistogram.append('g')
              .attr('class', 'x-axis')
              .attr('transform', `translate(0,${histogramHeight})`)
              .call(d3.axisBottom(xHistScale).tickFormat(''));

            svgHistogram.append('g')
              .attr('class', 'y-axis')
              .call(d3.axisLeft(yHistScale));
          }
        })

        .on('mouseout', function() {
          d3.select(this).attr('stroke', 'transparent');  // Revert the line color
          // Hide tooltip
          tooltip.style('display', 'none');
          d3.select('#histogram').selectAll('*').remove(); // Clear histogram
        })
        .on('click', function(event, d) {
          const trajectory = trajectories.find(t => 
            t.startingid === d.startingstate && 
            t.endingid === d.endingstate
          );
          if (trajectory) {
            setSelectedTrajectory(trajectory);
          }
        });

      // Add visible lines
      svg.selectAll(`.segment-${traceIndex}`)
        .data(segments)
        .enter()
        .append('line')
        .attr('x1', d => xScale(d.x1))
        .attr('y1', d => yScale(d.y1))
        .attr('x2', d => xScale(d.x2))
        .attr('y2', d => yScale(d.y2))
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 0.5);
  
      // Add markers for trajectory
      svg.selectAll(`.point-${traceIndex}`)
        .data(points)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d.y))
        .attr('r', 1)
        .attr('fill', (d, i) => (i === 0 ? 'red' : 'black'));
    });
  };

  useEffect(() => {
    if (selectedTrajectory) {
      d3.selectAll('line')
        .attr('stroke', function(d) {
          if (d && selectedTrajectory.startingid === d.startingstate && selectedTrajectory.endingid === d.endingstate) {
            return 'steelblue';
          }
          return d3.select(this).attr('stroke'); // Keep the existing stroke color for other lines
        });
    }
  }, [selectedTrajectory]);

  return (
    <svg ref={svgRef} style={{ width: '100%', height: '800px' }} />
  );
};

export default Visualization;