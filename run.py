from flask import Flask, render_template

app = Flask(__name__, static_folder='app/static', template_folder='app/templates')

@app.route('/')
def home():
    return render_template('index.html')

# i want a route that returns the data from ./data/500_laptop_prices.csv as json
@app.route('/data')
def data():
    import pandas as pd
    df = pd.read_csv('./data/500_laptop_prices.csv')
    return df.to_json(orient='records')

if __name__ == '__main__':
    app.run(debug=True, port=5000)  # Set the port number here
