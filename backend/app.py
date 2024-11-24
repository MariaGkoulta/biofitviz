from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from scipy.spatial import ConvexHull
import matplotlib.pyplot as plt

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load your data
bio = pd.read_pickle('../notebooks/data_processed/biometrics_m10_imputed_clustered_males.pkl')
all_trajectories = pd.read_pickle('../notebooks/data_processed/trajectories_m10.pkl')

cluster_descriptions = pd.read_csv('cluster_descriptions.csv', header=None, index_col=0).to_dict()
workouts_descriptions = pd.read_csv('workouts_descriptions.csv', header=None, index_col=0).to_dict()


# def select_top_states(group):
#     # Ensure chronological order
#     group = group.sort_values(by='MeasuredOnWeek').reset_index(drop=True)
    
#     # Calculate absolute differences between consecutive measurements for each column
#     diff_cols = [col for col in group.columns if col not in ['gender_m', 'gender_f', 'CloudId', 'MeasuredOnWeek', 'Cluster']]
#     group['Diff'] = group[diff_cols].diff().abs().sum(axis=1)
    
#     # Always include the first measurement
#     indices = [0]
    
#     # Select the top 3 measurements with the largest changes
#     if len(group) > 1:
#         largest_changes = group.iloc[1:].nlargest(3, 'Diff').index
#         indices.extend(largest_changes)
    
#     # Sort indices to maintain chronological order
#     indices = sorted(indices)
    
#     return group.loc[indices].drop(columns='Diff')

# def select_top_states(group):
#     # Ensure chronological order
#     group = group.sort_values(by='MeasuredOnWeek').reset_index(drop=True)
    
#     # Select the first 5 measurements
#     return group.head(8)

# Apply the function to each user group
# reduced_bio = bio.groupby('CloudId').apply(select_top_states).reset_index(drop=True)
reduced_bio = bio.copy()

# with exercises
# reduced_bio = pd.read_pickle('bioex.pkl')
reduced_bio['BiometricsCluster'] = reduced_bio['Cluster']
reduced_bio['ExerciseCluster'] = 'tbd'

# Define a color palette using the Category10 color map
tab20b = plt.get_cmap('tab20b', len(reduced_bio['BiometricsCluster'].unique()))
colors = [tab20b(i) for i in range(len(reduced_bio['BiometricsCluster'].unique()))]

@app.route('/api/data', methods=['GET'])
def get_data():
    unique_cloud_ids = reduced_bio['CloudId'].unique()[:15]
    data = []
    hulls = []
    trajectories = []

    for cloud_id in unique_cloud_ids:
        user_data = reduced_bio[reduced_bio['CloudId'] == cloud_id]
        user_trajectories = all_trajectories[all_trajectories['cloudid'] == cloud_id]
        trace = {
            'x': user_data['PCA1'].tolist(),
            'y': user_data['PCA2'].tolist(),
            'text': user_data.apply(lambda row: '<br>'.join([f'{col}: {row[col]}' for col in []]), axis=1).tolist(),
            'marker': {
                'color': user_data['BiometricsCluster'].tolist(),
                'size': 3
            },
            'stateid': user_data['stateid'].tolist()
        }
        data.append(trace)

        for _, row in user_trajectories.iterrows():
            trajectory = {
                'cloudid': cloud_id,
                'startingid': row['startingstate'],
                'endingid': row['endingstate'],
                'clusterdistribution': row['ClusterDistribution']
            }
            trajectories.append(trajectory)

    # Compute Convex Hulls for each cluster
    unique_clusters = reduced_bio['BiometricsCluster'].unique()
    for cluster in unique_clusters:
        cluster_data = reduced_bio[reduced_bio['BiometricsCluster'] == cluster]
        if len(cluster_data) >= 3:  # ConvexHull requires at least 3 points
            points = cluster_data[['PCA1', 'PCA2']].values
            hull = ConvexHull(points)
            hull_points = points[hull.vertices]
            color = colors[cluster]
            rgba_color = f'rgba({int(color[0]*255)}, {int(color[1]*255)}, {int(color[2]*255)}, 0.5)'
            hulls.append({
                'cluster': int(cluster),
                'hull_points': hull_points.tolist(),
                'color': rgba_color,
                'description': cluster_descriptions[1][cluster]
            })

    return jsonify({'data': data, 'hulls': hulls, 'trajectories': trajectories, 'workouts': workouts_descriptions[1]})

@app.route('/api/workout_descriptions', methods=['GET'])
def get_workout_descriptions():
    df = pd.read_csv('workouts_descriptions.csv', header=None, names=['id', 'description'])
    descriptions = df.to_dict(orient='records')
    return jsonify(descriptions)

if __name__ == '__main__':
    app.run(debug=True)