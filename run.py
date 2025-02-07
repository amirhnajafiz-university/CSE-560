from flask import Flask, render_template, jsonify



# create a Flask app
app = Flask(__name__, static_folder='app/static', template_folder='app/templates')


# define a route that returns the index.html file
@app.route('/')
def home():
    return render_template('index.html')


# define a route that returns the data from the csv file for a specific column
@app.route('/data/<column_name>')
def data_column(column_name):
    import pandas as pd
    df = pd.read_csv('./data/500_laptop_prices.csv')
    if column_name in df.columns:
        return df[column_name].to_json(orient='records')
    else:
        return jsonify({"error": "Column not found"}), 404


# define a route that returns the data from the csv file
@app.route('/data')
def data():
    import pandas as pd
    df = pd.read_csv('./data/500_laptop_prices.csv')
    return df.to_json(orient='records')


# define a route that returns the data headers from the csv file
@app.route('/headers')
def data_headers():
    import pandas as pd
    df = pd.read_csv('./data/500_laptop_prices.csv')
    return jsonify(df.columns.tolist())


# run the app
if __name__ == '__main__':
    app.run(debug=True, port=5000)  # set the port number here
