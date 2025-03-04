from src import config



def create_eigenvalues_and_eigenvectors():
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
    from kneed import KneeLocator

    # load the eigenvalues from the npz file
    data = np.load(config.EIGENDECOMPOSITION)
    eigenvalues = data['eigenvalues']

    # use the kneedle algorithm to find the elbow point
    kneedle = KneeLocator(range(len(eigenvalues)), eigenvalues, curve='convex', direction='decreasing')
    elbow_index = int(kneedle.elbow)

    return jsonify({"elbow_index": elbow_index})

def get_eigenvalues_and_eigenvectors():
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

def get_pca():
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

def get_loadings():
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

def get_pca_attributes():
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

def get_pca_attributes_data():
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
