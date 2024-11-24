import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const Histogram = ({ trajectory }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!trajectory) return;

    const histogramData = trajectory.clusterdistribution;
    const width = 200;
    const height = 100;
    const margin = { top: 10, right: 10, bottom: 20, left: 30 };

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous content

    const xHistScale = d3.scaleBand()
      .domain(histogramData.map((d, i) => i))
      .range([0, width])
      .padding(0.1);

    const yHistScale = d3.scaleLinear()
      .domain([0, d3.max(histogramData)])
      .nice()
      .range([height, 0]);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10); // Changed color palette

    const svgHistogram = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    svgHistogram.selectAll('.bar')
      .data(histogramData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d, i) => xHistScale(i))
      .attr('y', d => yHistScale(d))
      .attr('width', xHistScale.bandwidth())
      .attr('height', d => height - yHistScale(d))
      .attr('fill', (d, i) => colorScale(i));

    svgHistogram.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xHistScale).tickFormat(''));

    svgHistogram.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yHistScale));
  }, [trajectory]);

  return <svg ref={svgRef}></svg>;
};

export default Histogram;