from src import config



def create_data_mds():
    """
    Perform MDS on the sampled dataset and save the transformed data.
    """
    from flask import jsonify
    import pandas as pd
    from sklearn.cluster import KMeans
    from sklearn.manifold import MDS
    from sklearn.preprocessing import StandardScaler

    # load sampled dataset
    df = pd.read_csv(config.SAMPLED_DATASET)

    # standardize the data
    scaler = StandardScaler()
    df_scaled = scaler.fit_transform(df)

    # compute MDS
    mds = MDS(n_components=2, dissimilarity='euclidean', random_state=42)
    mds_transformed = mds.fit_transform(df_scaled)

    # apply KMeans to the MDS-transformed data
    kmeans = KMeans(n_clusters=3)
    kmeans.fit(mds_transformed)

    # add the cluster labels to the transformed data
    df_mds = pd.DataFrame(mds_transformed, columns=['x', 'y'])
    df_mds['cluster'] = kmeans.labels_

    # save the transformed data
    df_mds.to_csv(config.MDS_TRANSFORMED, index=False)

    return jsonify({"message": "MDS completed successfully"}), 200

def get_data_mds():
    """
    Load the transformed data from the MDS analysis.
    """
    from flask import jsonify
    import pandas as pd

    # load the transformed data
    df = pd.read_csv(config.MDS_TRANSFORMED)

    # return the transformed data as a JSON response
    return jsonify(df.to_dict(orient='records')), 200

def create_variables_mds():
    """
    Perform MDS on the sampled dataset using only the variables selected by the user and save the transformed data.
    """
    from flask import jsonify
    import pandas as pd
    from sklearn.manifold import MDS
    from sklearn.preprocessing import StandardScaler

    # load sampled dataset
    df = pd.read_csv(config.SAMPLED_DATASET)

    # standardize the data
    scaler = StandardScaler()
    df_scaled = scaler.fit_transform(df)

    # convert the standardized data back to a DataFrame
    df_scaled = pd.DataFrame(df_scaled, columns=df.columns)

    # computer pairwise correlation
    correlation_matrix = df_scaled.corr().abs()

    # transform the correlation matrix into a distance matrix
    distance_matrix = 1 - correlation_matrix
    
    # computer MDS
    mds = MDS(n_components=2, dissimilarity='precomputed', random_state=42)
    mds_transformed = mds.fit_transform(distance_matrix)

    # add the variable names to the transformed data
    df_mds = pd.DataFrame(mds_transformed, columns=['MDS1', 'MDS2'])
    df_mds['variable'] = df.columns

    # save the transformed data
    df_mds.to_csv(config.VARS_MDS_TRANSFORMED, index=False)
    correlation_matrix.to_csv(config.CORRELATIONS, index=False)

    return jsonify({"message": "Variables MDS completed successfully"}), 200

def get_variables_mds():
    """
    Load the transformed data from the variable-based MDS analysis.
    """
    from flask import jsonify
    import pandas as pd

    # load the transformed data
    df = pd.read_csv(config.VARS_MDS_TRANSFORMED)

    # return the transformed data as a JSON response
    return jsonify(df.to_dict(orient='records')), 200
