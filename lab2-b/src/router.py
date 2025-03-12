from flask import Flask



def configure_routes(app: Flask):
    """
    Configure the routes for the Flask app.
    :param app: The Flask app to configure.
    """
    from . import views
    from .api import mds

    # define a route that returns the index.html file
    app.add_url_rule('/', 'home', views.home)

    # define a route that performs MDS on the data
    app.add_url_rule('/api/data/mds', 'data_mds', mds.data_mds, methods=['POST'])
