from src import config



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
