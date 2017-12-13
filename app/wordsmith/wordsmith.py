"""
wordsmith.wordsmith
~~~~~~~~~~~~~~~~~~~

This module implements the Wordsmith object.
"""

import json
import requests
import base64
from io import StringIO
import pandas as pd

from .configuration import Configuration
from .project import Project
from .exceptions import ProjectSlugError

class Wordsmith(object):
    """
    Constructs a :class:`Wordsmith <Wordsmith>` object.

    :param api_key: API key from Wordsmith.
    :param base_url: (optional) String representing the base URL for the Wordsmith API per documentation at http://wordsmith.readme.io/v1/docs
    :param user_agent: (optional) String representing the user agent that should be sent with each API request
    """

    def __init__(self, api_key, **kwargs):
        self.projects = []
        self.config = Configuration(api_key)
        if 'base_url' in kwargs:
            self.config.base_url = kwargs['base_url']
        if 'user_agent' in kwargs:
            self.config.user_agent = kwargs['user_agent']
        response = requests.get(self.config.base_url + '/projects', headers=self.config.get_headers())
        if response.status_code == 200:
            for project_data in json.loads(response.text)['data']:
                self.projects.append(Project(project_data['name'], project_data['slug'], project_data['schema'], project_data['templates'], self.config))

    def project(self, identifier, name=False):
        """
        Get a Wordsmith project by slug

        :param slug: String representing the slug of the Wordmsith project
        :return: :class:`Wordsmith <Project>`
        :rtype: wordsmith.Project
        """
        if name:
            matches = [project for project in self.projects if project.name == identifier]
        else:
            matches = [project for project in self.projects if project.slug == identifier]
        if len(matches) == 1:
            return matches[0]
        else:
            raise ProjectSlugError('{} is not a valid project slug.'.format(identifier))

    def find_project(self, name):
        """
        Find Wordsmith projects by project name

        :param name: String representing the name of the Wordsmith project
        :return: :class:`list`
        :rtype: list
        """
        return [project for project in self.projects if project.name == name]

    def create_project(self, project_name, df):
        with StringIO() as f:
            df.to_csv(f, index=False)
            csv_string = f.getvalue().encode('utf-8')
            content = base64.b64encode(csv_string).decode('utf-8')

        # Format data dictionary properly
        ws_data = { 'data': {
            "name": project_name,
                "dataset": {
                    "filename": '{}.csv'.format(project_name),
                    "content": content,
                }
            }
        }

        # Patch the project if it exists already
        names = [prj.name for prj in self.projects]
        if project_name in names:
            print('Update Project.')
            index = names.index(project_name)
            url = '{}/projects/{}'.format(self.config.base_url, self.projects[index].slug)
            response = requests.patch(url, json=ws_data, headers=self.config.post_headers())
        else:
            print('Create Project.')
            url = '{}/projects'.format(self.config.base_url)
            print(url)
            response = requests.post(url, json=ws_data, headers=self.config.post_headers())
        return response.status_code
