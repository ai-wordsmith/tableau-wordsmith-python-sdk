from flask import jsonify

from app.wordsmith import Wordsmith


def store_settings(settings, cfg):
    """
    Store the settings scraped from the dasboard.
    :param settings: Python dictionary with WS data
    :param cfg: Easy dictionary with config settings
    """
    print('Storing settings..')
    with open('{}.p'.format(cfg.dev.settings), 'wb') as f:
        import pickle
        pickle.dump(settings, f)


def generate(ws_data, cfg):
    """
    Generate content by pinging the WS API with WS-ready data.
    :param ws_data: Python dictionary with WS data
    :param cfg: Easy dictionary with config settings
    :return: Json blob with content
    """
    ws = Wordsmith(cfg.wordsmith.api_key)
    return jsonify(
        ws.project(cfg.wordsmith.project_name, name=True)
        .template(cfg.wordsmith.template_name, name=True)
        .generate_narrative(ws_data).text)


def build_ws_data(settings, cfg):
    """
    Build up the WS-ready data from the settings
    scraped from the dashboard.
    :param settings: Python dictionary with filters, marks, and parameters from each worksheet
    :param cfg: Easy dictionary with config settings
    :return: Python dictionary with WS data
    """
    # Import All Settings
    filters = settings[0]
    marks = settings[1]
    parameters = settings[2]

    # Initialize the empty output dictionary
    output = dict()

    ####################################
    # Write calculations here.
    # Store each calc as a value in output dicitonary.
    # The key will become the column name in Wordsmith.
    ####################################

    if cfg.dev.flag:
        pd.DataFrame([output]).to_csv('ws_data.csv', index=False)

    return output
