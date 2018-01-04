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


def store_settings(settings):
    """
    Store the settings scraped from the dasboard.
    :param settings: Python dictionary with WS data
    """
    print('Storing settings..')
    with open('{}.p'.format(cfg.dev.settings), 'wb') as f:
        import pickle
        pickle.dump(settings, f)


def generate(ws_data):
    """
    Generate content by pinging the WS API with WS-ready data.
    :param ws_data: Python dictionary with WS data
    :return: Json blob with content
    """
    ws = Wordsmith(cfg.wordsmith.api_key)
    return jsonify(
        ws.project(cfg.wordsmith.project_name, name=True)
        .template(cfg.wordsmith.template_name, name=True)
        .generate_narrative(ws_data).text)


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
