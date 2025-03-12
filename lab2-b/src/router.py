from flask import Flask



def configure_routes(app: Flask):
    """
    Configure the routes for the Flask app.
    :param app: The Flask app to configure.
    """
    from . import views
    from .api import mds, data, pcp

    # define a route that returns the index.html file
    app.add_url_rule('/', 'home', views.home)

    # define a route that returns the sampled dataset
    app.add_url_rule('/api/data', 'data', data.get_data, methods=['GET'])

    # define a route that performs clustering on the data
    app.add_url_rule('/api/data', 'cluster_data', data.create_cluster_data, methods=['POST'])

    # define a route that performs MDS on the data
    app.add_url_rule('/api/data/mds', 'data_mds', mds.create_data_mds, methods=['POST'])

    # define a route that returns the transformed data from the MDS analysis
    app.add_url_rule('/api/data/mds', 'get_data_mds', mds.get_data_mds, methods=['GET'])

    # define a route that performs variable-based MDS on the data
    app.add_url_rule('/api/data/mds/variables', 'variables_mds', mds.create_variables_mds, methods=['POST'])

    # define a route that returns the transformed data from the variable-based MDS analysis
    app.add_url_rule('/api/data/mds/variables', 'get_variables_mds', mds.get_variables_mds, methods=['GET'])

    # define a route that returns the computed correlations between the variables in the dataset
    app.add_url_rule('/api/data/correlations', 'get_correlations', pcp.get_data_correlations, methods=['GET'])
