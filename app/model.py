import pandas as pd

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

    if cfg.dev:
        pd.DataFrame([output]).to_csv('ws_data.csv', index=False)

    return output
