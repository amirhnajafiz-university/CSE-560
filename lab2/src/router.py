from flask import Flask



def configure_routes(app: Flask):
    """
    Configure the routes for the Flask app.
    :param app: The Flask app to configure.
    """
    from . import views
    from .api import data, pca, clustering

    # define a route that returns the index.html file
    app.add_url_rule('/', 'home', views.home)

    # define a route that returns the data from the csv file
    app.add_url_rule('/api/data', 'data', data.get_dataset)

    # define a route that samples the data from the csv file
    app.add_url_rule('/api/sample/<int:number_of_samples>', 'sample_data', data.create_dataset)

    # define a route that performs eigendecomposition on the sampled data
    app.add_url_rule('/api/eigendecomposition', 'eigendecomposition', pca.create_eigenvalues_and_eigenvectors)

    # define a route that returns the principal components of the sampled data
    app.add_url_rule('/api/principalcomponents', 'principal_components', pca.get_pca)

    # define a route that returns the elbow index of the sampled data
    app.add_url_rule('/api/elbowindex', 'elbow_index', pca.get_elbow_index)

    # define a route that returns the loadings of the sampled data
    app.add_url_rule('/api/loadings', 'loadings', pca.get_loadings)

    # define a route that returns the eigenvalues and eigenvectors of the sampled data
    app.add_url_rule('/api/eigenvectors', 'eigenvectors', pca.get_eigenvalues_and_eigenvectors)

    # define a route that returns the explained variance of the sampled data
    app.add_url_rule('/api/pcaattributes', 'pca_attributes', pca.get_pca_attributes)

    # define a route that returns the data of pca attributes
    app.add_url_rule('/api/pcaattributesdata', 'pca_scatterplot_matrix', pca.get_pca_attributes_data)

    # define a route that performs k-means clustering on the sampled data
    app.add_url_rule('/api/kmeans', 'kmeans', clustering.create_clusters)

    # define a route that returns the mse of the k-means clustering
    app.add_url_rule('/api/mse', 'mse', clustering.get_clusters_mse)

    # define a route that returns the best k value for k-means clustering
    app.add_url_rule('/api/bestk', 'best_k', clustering.get_clusters_bestk)

    # define a route that returns the results of k-means clustering
    app.add_url_rule('/api/kmeansresults', 'kmeans_results', clustering.get_kmeans_results)

    # define a route that returns the cluster centers of k-means clustering
    app.add_url_rule('/api/clustercenters', 'cluster_centers', clustering.get_clusters_centers)
