from src import config



def get_data():
    """
    Load the sampled dataset.
    """
    from flask import jsonify
    import pandas as pd

    # load sampled dataset
    df = pd.read_csv(config.SAMPLED_DATASET)

    # return the sampled dataset as a JSON response
    return jsonify(df.to_dict(orient='list')), 200
