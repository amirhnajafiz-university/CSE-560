from src import config



def get_dataset():
    """
    Get data from data/dataset.csv into a JSON format.
    :return: The data in JSON format.
    """
    from flask import jsonify
    import pandas as pd
    data = pd.read_csv('data/dataset.csv').to_dict(orient='records')
    return jsonify(data)

def create_dataset(number_of_samples: int):
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
