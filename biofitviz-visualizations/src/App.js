import React, { useState, useEffect } from 'react';
import Visualization from './Visualization';
import Histogram from './Histogram';
import * as d3 from 'd3';
import './App.css';

function App() {
  const [hullColors, setHullColors] = useState([]);
  const [selectedTrajectory, setSelectedTrajectory] = useState(null);
  const [workoutDescriptions, setWorkoutDescriptions] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/workout_descriptions')
      .then(response => response.json())
      .then(data => {
        setWorkoutDescriptions(data);
      })
      .catch(error => console.error('Error fetching workout descriptions:', error));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h2>Biofitviz Visualizations</h2>
      </header>
      <main>
        <div className="sidebar">
          <div className="legend-section">
            <h3>Biometric Profiles</h3>
            {hullColors.map((hull, index) => (
              <div key={index} className="legend-item" style={{ backgroundColor: hull.color }}>
                <span>{hull.description}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="visualization-container">
          <Visualization
            className="visualization-left"
            setHullColors={setHullColors}
            setSelectedTrajectory={setSelectedTrajectory}
            selectedTrajectory={selectedTrajectory}
          />
          {selectedTrajectory && (
            <div className="histogram-box">
              <h3 style={{ textAlign: 'center' }}>Workout Categories Distribution</h3>
              <Histogram trajectory={selectedTrajectory} />
              <div className="legend-section">
                <h3>Workout Categories</h3>
                {selectedTrajectory.clusterdistribution.map((_, index) => (
                  <div key={index} className="legend-item" style={{ backgroundColor: d3.schemeCategory10[index] }}>
                    <span>{workoutDescriptions[index]?.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;