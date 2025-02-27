from flask import Flask



def configure_routes(app: Flask):
    """
    Configure the routes for the Flask app.
    :param app: The Flask app to configure.
    """
    from . import views
    from . import controller

    # define a route that returns the index.html file
    app.add_url_rule('/', 'home', views.home)

    # define a route that returns the data from the csv file
    app.add_url_rule('/api/data', 'data', controller.get_data)

    # define a route that samples the data from the csv file
    app.add_url_rule('/api/sample/<int:number_of_samples>', 'sample_data', controller.sample_data)

    # define a route that returns the data from the csv file for a specific column
    app.add_url_rule('/api/data/<str:column_name>', 'data_column', controller.data_column)

    # define a route that returns the data headers from the csv file
    app.add_url_rule('/api/headers', 'headers', controller.headers)
