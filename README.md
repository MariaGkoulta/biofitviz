# Biofitviz

## Interactive Visualization Interface for Analyzing High-Dimensional Biometric & Exercise Data

### Summary
Biofitviz is an interactive and user-friendly interface designed to leverage dimensionality reduction, clustering, and advanced visualization techniques to explore, analyze, and visualize high-dimensional biometric and exercise data. This tool enables users to extract valuable health and fitness insights.

### Details
Biofitviz aims to utilize time series data on biometric metrics and exercise activities from multiple users to uncover meaningful patterns and insights for personalized fitness recommendations. The methodology includes:

1. **Data Collection**: Gather time series data for multiple users, including biometrics (e.g., weight, heart rate, muscle mass) and exercise activities (e.g., leg press, treadmill sessions) from Technogym data.
2. **User Clustering**: Perform clustering analysis on the biometric data to group users based on their physiological profiles, identifying distinct user segments for targeted fitness interventions.
3. **Exercise Clustering**: Analyze exercise data to cluster different workouts, extracting common workout plans associated with user progress.
4. **Dimensionality Reduction**: Apply techniques like PCA or t-SNE to simplify biometric data while preserving essential patterns, making it suitable for visualization.
5. **Visualization**: Create interactive visualizations to display clustered user profiles in reduced dimensions. Users can explore data through a time slider, observing cluster evolution over time in response to various workout plans.
6. **Dynamic Interaction**: Implement dropdown menus to select different workout plans, allowing users to visualize how their biometric metrics correlate with specific exercises over time.

### Interactivity Additions/Enhancements
- **Trajectory Plots**: Show the evolution of biometric metrics over time for each user, depicting changes in weight, heart rate, and muscle mass alongside chosen workout plans.
- **Real-Time Slider**: Adjust trajectory plots in real-time to observe metric changes over specific time frames and in response to different workouts.
- **Play/Pause Functionality**: Animate trajectories to make comparisons easier.
- **Key Events**: Highlight points where users changed their workout plans and provide details on hover.
- **Multi-User Trajectories**: Overlay trajectories of multiple users to compare progress and responses to specific workout plans.

### Target User
Technogym, a fitness company that manufactures gym equipment, will use Biofitviz to analyze data and tailor workout plans based on user biometrics and exercise preferences. Data-driven insights will help identify effective workout plans, improving Technogym’s services and equipment. The interactive dashboard with user clusters and trajectory plots can be incorporated into Technogym’s digital platforms.

## Download repo
``` 
git clone https://github.com/MariaGkoulta/biofitviz.git
cd biofitviz
```

## Backend

To start the backend server in the root directory run:

```pip install -r backend/requirements.txt```


Then run the flask app:

```
cd backend
python app.py
```


## Frontend
Make sure you have [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed.
To start the frontend server in the root directory run:

```
cd biofitviz-visualizations
npm install
npm start
```

This will start the frontend development server at http://localhost:3000/.