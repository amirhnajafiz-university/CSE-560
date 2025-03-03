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

    # define a route that performs eigendecomposition on the sampled data
    app.add_url_rule('/api/eigendecomposition', 'eigendecomposition', controller.eigendecomposition)

    # define a route that returns the principal components of the sampled data
    app.add_url_rule('/api/principalcomponents', 'principal_components', controller.principal_components)

    # define a route that returns the elbow index of the sampled data
    app.add_url_rule('/api/elbowindex', 'elbow_index', controller.get_elbow_index)

    # define a route that returns the loadings of the sampled data
    app.add_url_rule('/api/loadings', 'loadings', controller.loadings)

    # define a route that returns the eigenvalues and eigenvectors of the sampled data
    app.add_url_rule('/api/eigenvectors', 'eigenvectors', controller.eigenvectors_and_values)

    # define a route that returns the explained variance of the sampled data
    app.add_url_rule('/api/pcaattributes', 'pca_attributes', controller.pca_attributes)

    # define a route that returns the data of pca attributes
    app.add_url_rule('/api/pcaattributesdata', 'pca_scatterplot_matrix', controller.pca_scatterplot_matrix)

    # define a route that performs k-means clustering on the sampled data
    app.add_url_rule('/api/kmeans', 'kmeans', controller.kmeans_clustering)

    # define a route that returns the mse of the k-means clustering
    app.add_url_rule('/api/mse', 'mse', controller.get_mse)

    # define a route that returns the best k value for k-means clustering
    app.add_url_rule('/api/bestk', 'best_k', controller.get_best_k)

    # define a route that returns the results of k-means clustering
    app.add_url_rule('/api/kmeansresults', 'kmeans_results', controller.get_kmeans_results)

    # define a route that returns the cluster centers of k-means clustering
    app.add_url_rule('/api/clustercenters', 'cluster_centers', controller.get_cluster_centers)
