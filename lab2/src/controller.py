from . import config



def get_data():
    """
    Get data from data/dataset.csv into a JSON format.
    :return: The data in JSON format.
    """
    from flask import jsonify
    import pandas as pd
    data = pd.read_csv('data/dataset.csv').to_dict(orient='records')
    return jsonify(data)

def sample_data(number_of_samples: int):
    """
    Reads the original dataset and create a new dataset with N number of samples.
    :param number_of_samples: The number of samples to return.
    """
    from flask import jsonify, request
    import pandas as pd

    # read two boolean values from request query parameters (drop_none and drop_categorical)
    drop_none = request.args.get('drop_none', 'true').lower() == 'true'
    drop_categorical = request.args.get('drop_categorical', 'true').lower() == 'true'

    df = pd.read_csv(config.ORIGINAL_DATASET)
    if number_of_samples > config.DATASET_SIZE:
        return jsonify({"error": "Number of samples exceeds the size of the dataset"}), 400
    else:
        sample_df = df.sample(n=number_of_samples)
        if drop_none:
            sample_df = sample_df.dropna()
        if drop_categorical:
            # only select int, and float columns
            sample_df = sample_df.select_dtypes(include=['int', 'float'])

        sample_df.to_csv(config.SAMPLED_DATASET, index=False)
    return jsonify({"message": f"Sampled {number_of_samples} rows from the original dataset"}), 200

def eigendecomposition():
    """
    Perform eigendecomposition on the sampled dataset.
    :return: The eigenvalues and eigenvectors of the sampled dataset.
    """
    from flask import jsonify, request
    import pandas as pd
    import numpy as np
    from sklearn.decomposition import PCA
    from sklearn.preprocessing import StandardScaler

    # read the sampled dataset
    df = pd.read_csv(config.SAMPLED_DATASET)

    # read two boolean values from request query parameters (dstandardize)
    standardize = request.args.get('standardize', 'true').lower() == 'true'
    
    # create Standardize
    scaler = StandardScaler()
    pca = PCA()

    # standardize the data
    if standardize:
        scaled_data = scaler.fit_transform(df)
    else:
        scaled_data = df

    # fit the PCA model to the data
    principal_components = pca.fit_transform(scaled_data)
    columns=[f'PC{i+1}' for i in range(principal_components.shape[1])]
    principal_components = pd.DataFrame(principal_components, columns=columns)
    principal_components["id"] = df.index

    # save loadings
    loadings = pd.DataFrame(pca.components_.T, columns=columns)
    loadings["feature"] = df.columns

    # get the eigenvalues and eigenvectors
    eigenvalues = pca.explained_variance_
    eigenvectors = pca.components_

    # save the eigenvalues and eigenvectors to a npz file
    np.savez(config.EIGENDECOMPOSITION, eigenvalues=eigenvalues, eigenvectors=eigenvectors)

    # save the principal components and loadings to a csv file
    pd.DataFrame(principal_components).to_csv(config.PRINCIPAL_COMPONENTS, index=False)
    pd.DataFrame(loadings).to_csv(config.LOADINGS, index=False)

    return jsonify({"message": "Eigendecomposition completed"}), 200

def get_elbow_index():
    """
    Return the elbow index of the sampled dataset.
    :return: The elbow index of the sampled dataset.
    """
    from flask import jsonify
    import numpy as np

    # load the eigenvalues from the npz file
    data = np.load(config.EIGENDECOMPOSITION)
    eigenvalues = data['eigenvalues']

    # calculate the elbow index
    elbow_index = int(np.argmax(np.diff(eigenvalues)))

    return jsonify({"elbow_index": elbow_index})

def eigenvectors_and_values():
    """
    Return the eigenvalues and eigenvectors of the sampled dataset.
    :return: The eigenvalues and eigenvectors of the sampled dataset.
    """
    from flask import jsonify
    import numpy as np

    # load the eigenvalues and eigenvectors from the npz file
    data = np.load(config.EIGENDECOMPOSITION)
    eigenvalues = data['eigenvalues'].tolist()
    eigenvectors = data['eigenvectors'].tolist()

    return jsonify({"eigenvalues": eigenvalues, "eigenvectors": eigenvectors})

def principal_components():
    """
    Return the principal components of the sampled dataset.
    :return: The principal components of the sampled dataset.
    """
    from flask import jsonify, request
    import pandas as pd

    # get PCA selected components from the request query parameters
    components = request.args.get('components', 'PC1,PC2').split(',')

    # add id to the beginning of the list
    components.insert(0, 'id')

    # read the principal components from the csv file and return them tolist
    df = pd.read_csv(config.PRINCIPAL_COMPONENTS)
    principal_components = df[components].values.tolist()
    return jsonify({"principal_components": principal_components})

def loadings():
    """
    Return the loadings of the sampled dataset.
    :return: The loadings of the sampled dataset.
    """
    from flask import jsonify, request
    import pandas as pd

    # get PCA selected components from the request query parameters
    components = request.args.get('components', 'PC1,PC2').split(',')

    # add feature to the beginning of the list
    components.insert(0, 'feature')

    # read the loadings from the csv file and return them tolist
    df = pd.read_csv(config.LOADINGS)
    loadings = df[components].values.tolist()
    return jsonify({"loadings": loadings})

def pca_attributes():
    """
    Return the 4 attributes with the highest squared sum of PCA loadings.
    :return: The 4 attributes with the highest squared sum of PCA loadings.
    """
    from flask import jsonify, request
    import pandas as pd
    import numpy as np

    # get the dimensionality index from the request query parameters
    dimensionality_index = int(request.args.get('dimensionality_index', 4))
    dimensionality_index = min(dimensionality_index, 4)

    # read the loadings from the csv file
    df = pd.read_csv(config.LOADINGS)

    # calculate the squared sum of PCA loadings
    df['squared_sum'] = np.square(df.drop('feature', axis=1)).sum(axis=1)

    # sort the attributes by squared sum of PCA loadings
    df = df.sort_values(by='squared_sum', ascending=False)

    # return the top 4 attributes
    attributes = df[['feature', 'squared_sum']].values.tolist()[:dimensionality_index]
    return jsonify({"attributes": attributes})

def pca_scatterplot_matrix():
    """
    Return the data of the top attributes based on the selected dimensionality index.
    :return: The data of the top attributes based on the selected dimensionality index.
    """
    from flask import jsonify, request
    import pandas as pd
    import numpy as np

    # get the dimensionality index from the request query parameters
    dimensionality_index = int(request.args.get('dimensionality_index', 4))
    dimensionality_index = min(dimensionality_index, 4)

    # read the loadings from the csv file
    df_loadings = pd.read_csv(config.LOADINGS)

    # calculate the squared sum of PCA loadings for the selected number of components
    selected_components = [f'PC{i+1}' for i in range(dimensionality_index)]
    df_loadings['squared_sum'] = np.square(df_loadings[selected_components]).sum(axis=1)

    # sort the attributes by squared sum of PCA loadings
    df_loadings = df_loadings.sort_values(by='squared_sum', ascending=False)

    # get the top attributes based on the selected dimensionality index
    top_attributes = df_loadings['feature'].values.tolist()[:dimensionality_index]

    # read the sampled dataset
    df_sampled = pd.read_csv(config.SAMPLED_DATASET)

    # return the data of the top attributes
    data = df_sampled[top_attributes].values.tolist()
    return jsonify({"data": data})

def kmeans_clustering():
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

def get_mse():
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

def get_best_k():
    """
    Return the best K value from the K-means results.
    :return: The best
    """
    from flask import jsonify
    import pandas as pd
    import numpy as np

    # read the K-means results from the CSV file
    df = pd.read_csv(config.KMEANS_RESULTS)

    # calculate the sum of squared errors for each K
    sse = df.groupby('k')['mse'].sum()

    # calculate the elbow index
    elbow_index = int(np.argmax(np.diff(sse)))

    return jsonify({"best_k": elbow_index})

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

def get_cluster_centers():
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
