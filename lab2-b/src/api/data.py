from src import config



def get_data():
    """
    Load the sampled dataset.
    """
    from flask import jsonify
    import pandas as pd

    # load sampled dataset
    df = pd.read_csv(config.CLUSTER_DATA)

    # convert non-numeric data columns to categorical data
    for col in df.columns:
        if df[col].dtype == 'object' or df[col].dtype.name == 'category':
            df[col] = df[col].astype('category')
            df[col] = df[col].cat.codes

    # only return 10 columns by randomly selecting them, make sure to always include the cluster column with the data
    sdf = df.sample(n=10, axis=1, random_state=1)
    sdf = pd.concat([df['cluster'], sdf], axis=1)

    # return the sampled dataset as a JSON response
    return jsonify(sdf.to_dict(orient='records')), 200

def create_cluster_data():
    """
    Create the cluster data.
    """
    from flask import jsonify
    import pandas as pd
    from sklearn.cluster import KMeans

    # load sampled dataset
    df = pd.read_csv(config.ORIGINAL_DATASET)

    # select the features for clustering
    X = df[['Inches', 'Ram']].values

    # create the KMeans model
    kmeans = KMeans(n_clusters=3)

    # fit the model
    kmeans.fit(X)

    # add the cluster labels to the dataframe
    df['cluster'] = kmeans.labels_

    # save the cluster data
    df.to_csv(config.CLUSTER_DATA, index=False)

    return jsonify({'message': 'Cluster data created'}), 200
