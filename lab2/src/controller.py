import json
import pandas as pd
from flask import jsonify



def data_column(column_name):
    """
    Return the data from the csv file for a specific column.
    :param column_name: The name of the column to return.
    :return: The data from the csv file for the specified column.
    """
    df = pd.read_csv('./data/500_laptop_prices.csv')
    if column_name in df.columns:
        return df[column_name].to_json(orient='records')
    else:
        return jsonify({"error": "Column not found"}), 404

def data_column_type(column_name):
    """
    Return the type of data by reading metadata.json file and check if the column is categorical or numerical.
    :param column_name: The name of the column to check.
    :return: The type of data for the specified column.
    """
    with open('./data/metadata.json') as f:
        metadata = json.load(f)
    if column_name in metadata["categorical"]:
        return jsonify({"type": "categorical"})
    elif column_name in metadata["numerical"]:
        return jsonify({"type": "numerical"})
    else:
        return jsonify({"error": "Column not found"}), 404

def data_column_mapping(column_name):
    """
    Return the mapping list for a specific column by reading mappings.json file.
    :param column_name: The name of the column to return the mapping for.
    :return: The mapping list for the specified column.
    """
    with open('./data/mappings.json') as f:
        mapping = json.load(f)
    if column_name in mapping:
        return jsonify(mapping[column_name])
    else:
        return jsonify({"error": "Column not found"}), 404

def headers():
    """
    Return the data headers from the csv file.
    :return: The data headers from the csv file.
    """
    df = pd.read_csv('./data/500_laptop_prices.csv')
    return jsonify(df.columns.tolist())
