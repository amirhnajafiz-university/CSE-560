from src import config



def get_data():
    """
    Load the sampled dataset.
    """
    from flask import jsonify
    import pandas as pd

    # load sampled dataset
    df = pd.read_csv(config.CLUSTER_DATA)

    # drop columns with only yes or no values
    for col in df.columns:
        if df[col].nunique() == 2:
            df = df.drop(col, axis=1)

    # convert non-numeric data columns to categorical data
    for col in df.columns:
        if df[col].dtype == 'object' or df[col].dtype.name == 'category':
            df[col] = df[col].astype('category')
            df[col] = df[col].cat.codes

    # return the sampled dataset as a JSON response
    return jsonify(df.to_dict(orient='records')), 200

def get_data_columns():
    """
    Get the columns of the dataset.
    """
    from flask import jsonify, request
    import pandas as pd

    # read two query parameters (order_type (correlations, original, customize), order_by (array of columns))
    order_type = request.args.get('order_type', 'original')
    order_by = request.args.get('order_by').split(',') if request.args.get('order_by') else []

    # load sampled dataset
    df = pd.read_csv(config.CLUSTER_DATA)

    # drop columns with only yes or no values
    for col in df.columns:
        if df[col].nunique() == 2:
            df = df.drop(col, axis=1)

    # order the columns based on the order_type
    if order_type == 'correlations':
        # load the correlations
        correlations = pd.read_csv(config.CORRELATIONS)
        # return sorted order based on correlation strength
        order_by = list(correlations.mean().sort_values(ascending=False).index)

    if order_type != 'original':
        # take the order_by columns at first, then put rest of them as they were
        ordered_columns = order_by + [col for col in df.columns if col not in order_by]
        df = df[ordered_columns]

    # get the columns of the dataframe
    columns = list(df.columns)

    return jsonify(columns), 200

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
