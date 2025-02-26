def data_column(column_name):
    """
    Return the data from the csv file for a specific column.
    :param column_name: The name of the column to return.
    :return: The data from the csv file for the specified column.
    """
    import pandas as pd
    df = pd.read_csv('./data/500_laptop_prices.csv')
    if column_name in df.columns:
        return df[column_name].to_json(orient='records')
    else:
        from flask import jsonify
        return jsonify({"error": "Column not found"}), 404

def data_column_type(column_name):
    """
    Return the type of data by reading metadata.json file and check if the column is categorical or numerical.
    :param column_name: The name of the column to check.
    :return: The type of data for the specified column.
    """
    import json
    with open('./data/metadata.json') as f:
        metadata = json.load(f)
    if column_name in metadata["categorical"]:
        from flask import jsonify
        return jsonify({"type": "categorical"})
    elif column_name in metadata["numerical"]:
        from flask import jsonify
        return jsonify({"type": "numerical"})
    else:
        from flask import jsonify
        return jsonify({"error": "Column not found"}), 404

def data_column_mapping(column_name):
    """
    Return the mapping list for a specific column by reading mappings.json file.
    :param column_name: The name of the column to return the mapping for.
    :return: The mapping list for the specified column.
    """
    import json
    with open('./data/mappings.json') as f:
        mapping = json.load(f)
    if column_name in mapping:
        from flask import jsonify
        return jsonify(mapping[column_name])
    else:
        from flask import jsonify
        return jsonify({"error": "Column not found"}), 404

def data():
    """
    Return the data from the csv file.
    :return: The data from the csv file.
    """
    import pandas as pd
    df = pd.read_csv('./data/500_laptop_prices.csv')
    return df.to_json(orient='records')

def headers():
    """
    Return the data headers from the csv file.
    :return: The data headers from the csv file.
    """
    import pandas as pd
    df = pd.read_csv('./data/500_laptop_prices.csv')
    from flask import jsonify
    return jsonify(df.columns.tolist())
