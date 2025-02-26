def home():
    """
    Render the index.html file.
    :return: The rendered index.html file.
    """
    from flask import render_template
    return render_template('index.html')
