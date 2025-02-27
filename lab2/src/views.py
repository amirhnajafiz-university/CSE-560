from flask import render_template, jsonify



def home():
    """
    Render the index.html file.
    :return: The rendered index.html file.
    """
    return render_template('index.html')

def get_data():
    """
    Get data from data/dataset.csv into a JSON format.
    :return: The data in JSON format.
    """
    import pandas as pd
    data = pd.read_csv('data/dataset.csv').to_dict(orient='records')
    return jsonify(data)
