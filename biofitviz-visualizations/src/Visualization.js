import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';

const Visualization = () => {
  const [data, setData] = useState([]);
  const [hulls, setHulls] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/data')  // Ensure the URL is correct
      .then(response => response.json())
      .then(response => {
        setData(response.data);
        setHulls(response.hulls);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const traces = data.map(trace => {
    const markerColors = trace.x.map((_, i) => (i === 0 ? 'red' : 'black'));  // First marker red, rest black
    return {
      x: trace.x,
      y: trace.y,
      mode: 'lines+markers',
      type: 'scatter',
      text: trace.text,
      marker: { color: markerColors, size: 2 },  // Smaller markers
      line: { shape: 'spline', width: 1 }  // Thinner lines
    };
  });

  const hullTraces = hulls.map(hull => ({
    x: hull.hull_points.map(point => point[0]),
    y: hull.hull_points.map(point => point[1]),
    fill: 'toself',
    fillcolor: hull.color,  // Use the color provided by the backend
    line: { color: 'rgba(0,0,0,0)', width: 1 },  // Thinner lines
    type: 'scatter',
    mode: 'lines',
    showlegend: false,
    hoverinfo: 'skip'
  }));

  return (
    <div style={{ width: '100%', height: '800px' }}>
      <Plot
        data={[...hullTraces, ...traces]}
        layout={{
          title: '2D PCA Plot of User Data by Week with Temporal Evolution',
          xaxis: { title: 'PCA1' },
          yaxis: { title: 'PCA2' },
          showlegend: true,
          legend: {
            title: { text: 'Cluster', font: { size: 16 } },
            font: { size: 12 }
          }
        }}
        useResizeHandler
        style={{ width: '100%', height: '100%' }} 
      />
    </div>
  );
};

export default Visualization;