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
    from flask import jsonify
    import pandas as pd
    df = pd.read_csv(config.ORIGINAL_DATASET)
    if number_of_samples > config.DATASET_SIZE:
        return jsonify({"error": "Number of samples exceeds the size of the dataset"}), 400
    else:
        sample_df = df.sample(n=number_of_samples)
        sample_df.to_csv(config.SAMPLED_DATASET, index=False)
    return jsonify({"message": f"Sampled {number_of_samples} rows from the original dataset"}), 200

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
