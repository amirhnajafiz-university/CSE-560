from flask import render_template



def home():
    """
    Render the index.html file.
    :return: The rendered index.html file.
    """
    return render_template('index.html')
