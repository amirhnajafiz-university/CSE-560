from flask import Flask
from src import router



# create a Flask app
app = Flask(__name__, static_folder='app/static', template_folder='app/templates')

# configure the routes
router.configure_routes(app)

# run the app
if __name__ == '__main__':
    app.run(debug=True, port=5000)  # set the port number here
