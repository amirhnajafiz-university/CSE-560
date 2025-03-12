from flask import Flask



def configure_routes(app: Flask):
    """
    Configure the routes for the Flask app.
    :param app: The Flask app to configure.
    """
    from . import views

    # define a route that returns the index.html file
    app.add_url_rule('/', 'home', views.home)
