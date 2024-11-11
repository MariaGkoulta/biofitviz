from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from scipy.spatial import ConvexHull
import matplotlib.pyplot as plt

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load your data
bio = pd.read_pickle('biometrics_m10_imputed_clustered_changes.pkl')


def select_top_states(group):
    # Ensure chronological order
    group = group.sort_values(by='MeasuredOnWeek').reset_index(drop=True)
    
    # Calculate absolute differences between consecutive measurements for each column
    diff_cols = [col for col in group.columns if col not in ['gender_m', 'gender_f', 'CloudId', 'MeasuredOnWeek', 'Cluster']]
    group['Diff'] = group[diff_cols].diff().abs().sum(axis=1)
    
    # Always include the first measurement
    indices = [0]
    
    # Select the top 3 measurements with the largest changes
    if len(group) > 1:
        largest_changes = group.iloc[1:].nlargest(3, 'Diff').index
        indices.extend(largest_changes)
    
    # Sort indices to maintain chronological order
    indices = sorted(indices)
    
    return group.loc[indices].drop(columns='Diff')

# Apply the function to each user group
reduced_bio = bio.groupby('CloudId').apply(select_top_states).reset_index(drop=True)

# Define a color palette using the Viridis color map
viridis = plt.get_cmap('viridis', len(reduced_bio['Cluster'].unique()))
colors = [viridis(i) for i in range(len(reduced_bio['Cluster'].unique()))]

@app.route('/api/data', methods=['GET'])
def get_data():
    unique_cloud_ids = reduced_bio['CloudId'].unique()[:30]
    data = []
    hulls = []

    for cloud_id in unique_cloud_ids:
        user_data = reduced_bio[reduced_bio['CloudId'] == cloud_id]
        trace = {
            'x': user_data['PCA1'].tolist(),
            'y': user_data['PCA2'].tolist(),
            'text': user_data.apply(lambda row: '<br>'.join([f'{col}: {row[col]}' for col in ['Cluster', 'Weight', 'Age', 'Bone Mass', 'BMI']]), axis=1).tolist(),
            'marker': {
                'color': user_data['Cluster'].tolist(),
                'size': 5  # Set the marker size here
            }
        }
        data.append(trace)

    # Compute Convex Hulls for each cluster
    unique_clusters = reduced_bio['Cluster'].unique()
    for cluster in unique_clusters:
        cluster_data = reduced_bio[reduced_bio['Cluster'] == cluster]
        if len(cluster_data) >= 3:  # ConvexHull requires at least 3 points
            points = cluster_data[['PCA1', 'PCA2']].values
            hull = ConvexHull(points)
            hull_points = points[hull.vertices]
            color = colors[cluster]
            rgba_color = f'rgba({int(color[0]*255)}, {int(color[1]*255)}, {int(color[2]*255)}, 0.3)'
            hulls.append({
                'cluster': int(cluster),
                'hull_points': hull_points.tolist(),
                'color': rgba_color  # Add color for each cluster
            })

    return jsonify({'data': data, 'hulls': hulls})

if __name__ == '__main__':
    app.run(debug=True)