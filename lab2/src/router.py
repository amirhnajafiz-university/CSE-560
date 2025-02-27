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
    app.add_url_rule('/data', 'data', views.data)

    # define a route that returns the data from the csv file for a specific column
    app.add_url_rule('/data/<column_name>', 'data_column', controller.data_column)

    # define a route that returns the type of data by reading metadata.json file and check if the column is categorical or numerical
    app.add_url_rule('/data/type/<column_name>', 'data_column_type', controller.data_column_type)

    # define a route that returns the mapping list for a specific column by reading mappings.json file
    app.add_url_rule('/data/mapping/<column_name>', 'data_column_mapping', controller.data_column_mapping)

    # define a route that returns the data headers from the csv file
    app.add_url_rule('/headers', 'headers', controller.headers)
