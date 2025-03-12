from src import config



def create_data_correlations():
    """
    Compute the correlations between the variables in the dataset.
    """
    from flask import jsonify
    import pandas as pd

    # load sampled dataset
    df = pd.read_csv(config.SAMPLED_DATASET)

    # compute the correlation matrix
    correlations = df.corr().abs()

    # save the correlation matrix
    correlations.to_csv(config.CORRELATIONS, index=False)

    return jsonify({"message": "Correlations computed successfully"}), 200

def get_data_correlations():
    """
    Get the computed correlations between the variables in the dataset.
    """
    from flask import jsonify
    import pandas as pd

    # load the correlations
    correlations = pd.read_csv(config.CORRELATIONS)

    # return sorted order based on correlation strength
    order = list(correlations.mean().sort_values(ascending=False).index)

    return jsonify(order), 200
