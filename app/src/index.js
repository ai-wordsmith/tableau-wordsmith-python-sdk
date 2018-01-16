const cfg = require('json-loader!yaml-loader!../../config.yml');

const th = require('./tableau.js');
const fl = require('./flask.js');

let viz;

// Update WS Content
function updateContent(vizUpdate) {
  $('#contentContainer').hide(() => {
    $('#content.loadingContainer').show();
  });
  th.getAllSettings(vizUpdate)
    .then(fl.content)
    .then((narrative) => {
      $('#content').html(narrative);
      $('#content.loadingContainer').hide(() => {
        $('#contentContainer').show();
      });
    });
}

// Add Listeners to Viz
function addListeners(vizAdd, cfgAdd) {
  if (cfgAdd.tableau.changes.filters) {
    vizAdd.addEventListener('filterchange', th.debounce(() => {
      updateContent(vizAdd);
    }));
  } if (cfgAdd.tableau.changes.marks) {
    vizAdd.addEventListener('marksselection', th.debounce(() => {
      updateContent(vizAdd);
    }));
  } if (cfgAdd.tableau.changes.parameters) {
    vizAdd.addEventListener('parametervaluechange', th.debounce(() => {
      updateContent(vizAdd);
    }));
  }
}

// Load Viz
$(() => {
  const options = {
    hideToolbar: true,
    hideTabs: true,
    onFirstInteractive: () => {
      updateContent(viz, cfg);
      addListeners(viz, cfg);
    },
  };
  const containerDiv = document.getElementById('tableauViz');
  const url = `${cfg.tableau.server}/views/${cfg.tableau.project}/${cfg.tableau.view}`;
  viz = new tableau.Viz(containerDiv, url, options);
});
