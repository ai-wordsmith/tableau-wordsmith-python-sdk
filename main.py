import os
import importlib
import yaml

from easydict import EasyDict as edict
from flask import Flask, render_template, request, url_for

import app.model as model

with open('config.yml') as f:
    cfg = edict(yaml.safe_load(f))

# Initialize Flask app and model file with calculations.
app = Flask(__name__)


@app.route('/')
def index():
    """
    Render index.html on startup.

    """
    tableau_files = '{}javascripts/api/tableau-2.min.js'.format(cfg.tableau.server)
    return render_template(cfg.html.file,
                           title=cfg.html.title,
                           tableau_files=tableau_files,
                           js_path=url_for('static', filename='bundle.js'),
                           css_path=url_for('static', filename='css/index.css'))


@app.route('/content', methods=['POST'])
def content():
    """
    Generate Wordsmith content.

    """
    # Get settings from request
    settings = request.get_json()

    # If in development, save the returned settings locally
    if cfg.dev.flag:
        model.store_settings(settings, cfg)

    # Build the wordsmith-ready data structure from applied filters.
    ws_data = model.build_ws_data(settings, cfg)

    # Generate narrative with the wordsmith-ready data
    return model.generate(ws_data, cfg)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5050))
    app.run(host='0.0.0.0', port=port)
