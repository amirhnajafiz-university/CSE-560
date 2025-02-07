from flask import Flask, render_template



# create a Flask app
app = Flask(__name__, static_folder='app/static', template_folder='app/templates')

# define a route that returns the index.html file
@app.route('/')
def home():
    return render_template('index.html')

# define a route that returns the data from the csv file
@app.route('/data')
def data():
    import pandas as pd
    df = pd.read_csv('./data/500_laptop_prices.csv')
    return df.to_json(orient='records')

# run the app
if __name__ == '__main__':
    app.run(debug=True, port=5000)  # set the port number here
