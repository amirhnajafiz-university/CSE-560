from src import config



def create_clusters():
    """
    Perform k-means clustering from k=1 to k=10 using the best two features and export the MSE score, 
    each point's cluster ID, the center point, and the radius of each cluster into a CSV file.
    :return: A successful response.
    """
    from flask import jsonify
    import pandas as pd
    import numpy as np
    from sklearn.cluster import KMeans
    from sklearn.metrics import mean_squared_error

    # get the top two attributes using the pca_attributes function
    dimensionality_index = 2
    df_loadings = pd.read_csv(config.LOADINGS)
    selected_components = [f'PC{i+1}' for i in range(dimensionality_index)]
    df_loadings['squared_sum'] = np.square(df_loadings[selected_components]).sum(axis=1)
    df_loadings = df_loadings.sort_values(by='squared_sum', ascending=False)
    top_attributes = df_loadings['feature'].values.tolist()[:dimensionality_index]

    # read the sampled dataset and select the top two attributes
    df = pd.read_csv(config.SAMPLED_DATASET)
    df_selected = df[top_attributes]

    # create an empty list to store the results
    results = []

    # perform k-means clustering from k=1 to k=10
    for k in range(1, 11):
        kmeans = KMeans(n_clusters=k)
        clusters = kmeans.fit_predict(df_selected)
        mse = mean_squared_error(df_selected, kmeans.cluster_centers_[clusters])
        for i, cluster in enumerate(clusters):
            center = kmeans.cluster_centers_[cluster]
            radius = np.linalg.norm(df_selected.iloc[i] - center)
            results.append({
                "k": k, 
                "coordinates": df_selected.iloc[i].tolist(), 
                "cluster_id": cluster, 
                "mse": mse, 
                "center": center.tolist(), 
                "radius": radius
            })

    # convert the results to a DataFrame and save to CSV
    results_df = pd.DataFrame(results)
    results_df.to_csv(config.KMEANS_RESULTS, index=False)

    return jsonify({"message": "K-means clustering completed successfully"}), 200

def get_clusters_mse():
    """
    Return the MSE of each K from the K-means results.
    :return: A list of pairs <k-MSE> from the K-means results.
    """
    from flask import jsonify
    import pandas as pd

    # read the K-means results from the CSV file
    df = pd.read_csv(config.KMEANS_RESULTS)

    # group by 'k' and calculate the mean MSE for each K
    mse_per_k = df.groupby('k')['mse'].mean().reset_index()

    # convert the results to a list of pairs <k-MSE>
    mse_list = mse_per_k.values.tolist()

    return jsonify({"mse": mse_list})

def get_clusters_bestk():
    """
    Return the best K value from the K-means results using the kneedle algorithm.
    :return: The best K value.
    """
    from flask import jsonify
    import pandas as pd
    from kneed import KneeLocator

    # read the K-means results from the CSV file
    df = pd.read_csv(config.KMEANS_RESULTS)

    # calculate the sum of squared errors for each K
    sse = df.groupby('k')['mse'].sum()

    # use the kneedle algorithm to find the elbow point
    kneedle = KneeLocator(sse.index, sse.values, curve='convex', direction='decreasing')
    best_k = int(kneedle.elbow)

    return jsonify({"best_k": best_k})

def get_kmeans_results():
    """
    Return the data of the K-means results for the selected K.
    :param k: The K value to return the data for.
    :return: The data of the K-means results for the selected K.
    """
    from flask import jsonify, request
    import pandas as pd

    # get the K value from the request query parameters
    k = int(request.args.get('k', 1))

    # read the K-means results from the CSV file
    df = pd.read_csv(config.KMEANS_RESULTS)

    # filter the results by the selected K
    results = df[df['k'] == k].to_dict(orient='records')

    return jsonify(results)

def get_clusters_centers():
    """
    Return the cluster centers from the K-means results for a specific K.
    :return: The cluster centers from the K-means results.
    """
    from flask import jsonify, request
    import pandas as pd
    import numpy as np
    import ast

    # get the K value from the request query parameters
    k = int(request.args.get('k', 1))

    # read the K-means results from the CSV file
    df = pd.read_csv(config.KMEANS_RESULTS)

    # filter the results by the selected K
    df_k = df[df['k'] == k]

    # convert the 'coordinates' column from string to list
    df_k.loc[:, 'coordinates'] = df_k['coordinates'].apply(ast.literal_eval)

    # group by 'cluster_id' and calculate the mean coordinates for each cluster
    centers = df_k.groupby('cluster_id')['coordinates'].apply(lambda x: np.mean(x.tolist(), axis=0).tolist()).reset_index()

    # calculate the biggest radius for each cluster
    centers['radius'] = centers['cluster_id'].apply(lambda cluster_id: df_k[df_k['cluster_id'] == cluster_id]['radius'].max())

    # convert the results to a list of cluster centers
    centers_list = centers.to_dict(orient='records')

    return jsonify({"centers": centers_list})
