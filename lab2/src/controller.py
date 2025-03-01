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
    from flask import jsonify
    import pandas as pd

    # read the principal components from the csv file and return them tolist
    df = pd.read_csv(config.PRINCIPAL_COMPONENTS)
    principal_components = df[['id', 'PC1', 'PC2']].values.tolist()
    return jsonify({"principal_components": principal_components})

def loadings():
    """
    Return the loadings of the sampled dataset.
    :return: The loadings of the sampled dataset.
    """
    from flask import jsonify
    import pandas as pd

    # read the loadings from the csv file and return them tolist
    df = pd.read_csv(config.LOADINGS)
    loadings = df[['feature', 'PC1', 'PC2']].values.tolist()
    return jsonify({"loadings": loadings})

def data_column(column_name: str):
    """
    Return the data from the csv file for a specific column.
    :param column_name: The name of the column to return.
    :return: The data from the csv file for the specified column.
    """
    from flask import jsonify
    import pandas as pd
    df = pd.read_csv(config.SAMPLED_DATASET)
    if column_name in df.columns:
        return df[column_name].to_json(orient='records')
    else:
        return jsonify({"error": "Column not found"}), 404

def headers():
    """
    Return the data headers from the csv file.
    :return: The data headers from the csv file.
    """
    from flask import jsonify
    import pandas as pd
    df = pd.read_csv(config.SAMPLED_DATASET)
    return jsonify(df.columns.tolist())
