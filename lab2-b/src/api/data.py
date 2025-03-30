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

    # set 5 letter limit for all string columns
    for col in df.select_dtypes(include='object').columns:
        df[col] = df[col].str[:5]

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

def get_cluster_means():
    """
    Get the means of each cluster, including frequency means for object columns.
    """
    from flask import jsonify
    import pandas as pd

    # load the cluster data
    df = pd.read_csv(config.CLUSTER_DATA)

    # separate numeric and object columns
    numeric_cols = df.select_dtypes(include='number').columns
    object_cols = df.select_dtypes(include='object').columns

    # drop cluster column from numeric columns to avoid it being included in the mean calculation
    numeric_cols = numeric_cols.drop('cluster', errors='ignore')

    # calculate the means for numeric columns
    cluster_means_numeric = df.groupby('cluster')[numeric_cols].mean()

    # calculate the frequency mean (mode) for object columns
    cluster_modes_object = df.groupby('cluster')[object_cols].agg(lambda x: x.mode().iloc[0] if not x.mode().empty else None)

    # combine numeric means and object modes
    cluster_means = pd.concat([cluster_means_numeric, cluster_modes_object], axis=1).reset_index()

    # convert to dictionary format for JSON response
    cluster_means_dict = cluster_means.to_dict(orient='records')

    return jsonify(cluster_means_dict), 200

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
