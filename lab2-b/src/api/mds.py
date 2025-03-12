from src import config



def data_mds():
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

    # computer MDS
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
