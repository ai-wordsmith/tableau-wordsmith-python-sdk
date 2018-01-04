/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

const cfg = __webpack_require__(1);

const th = __webpack_require__(2);
const fl = __webpack_require__(3);

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
  const containerDiv = document.getElementById(cfg.tableau.htmlElement);
  const url = `${cfg.tableau.server}/views/${cfg.tableau.project}/${cfg.tableau.view}`;
  viz = new tableau.Viz(containerDiv, url, options);
});


/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = {"tableau":{"server":"https://public.tableau.com/","project":"Superstore_1057","view":"Overview","changes":{"filters":false,"marks":false,"parameters":false}},"wordsmith":{"api_key":"*","project_slug":"project","template_slug":"template"},"html":{"title":"SuperStore Sample","file":"table.html"},"dev":false}

/***/ }),
/* 2 */
/***/ (function(module, exports) {

const tableauHelper = {};

tableauHelper.getAllSettings = (viz) => {
  const sheets = viz.getWorkbook().getActiveSheet().getWorksheets();
  return Promise.all([
    tableauHelper.getFilters(viz, sheets),
    tableauHelper.getMarks(viz, sheets),
    tableauHelper.getParameters(viz),
  ]);
};

const parseFilter = (filter) => {
  const type = filter.getFilterType();
  let values;
  switch (type) {
    case 'quantitative':
      values = [filter.getMin(), filter.getMax()];
      break;
    case 'relative_date':
      values = [filter.getPeriod(), filter.getRange()];
      break;
    case 'hierarchical':
    case 'categorical':
    default:
      values = filter.getAppliedValues();
  }
  return values;
};

tableauHelper.getFilters = (viz, sheets) => Promise.all(sheets
  .map(sheet => sheet.getFiltersAsync()))
  .then(filterSheets => filterSheets.reduce((output, filterClasses) => {
    const newOutput = output;
    filterClasses.forEach((filter) => {
      const key = filter.getFieldName();
      if (!Object.keys(newOutput).includes(key)) {
        newOutput[key] = parseFilter(filter);
      }
    });
    return newOutput;
  }, {}));

const parseTable = (dataTable) => {
  const columns = dataTable.getColumns();
  const data = dataTable.getData();
  const newData = columns.map(() => []);
  data.forEach((row) => {
    row.forEach((dataValue, idx) => {
      const col = columns[idx];
      switch (col.getDataType()) {
        case 'date':
        case 'datetime':
        case 'string':
          newData[idx].push(dataValue.formattedValue);
          break;
        case 'integer':
        case 'boolean':
          newData[idx].push(parseInt(dataValue.value, 10));
          break;
        case 'float':
          newData[idx].push(parseFloat(dataValue.value));
          break;
        default:
          newData[idx].push(dataValue.formattedValue);
      }
    });
  });
  return newData;
};

tableauHelper.getMarks = (viz, sheets) => Promise.all(sheets
  .map(sheet => sheet.getSummaryDataAsync()))
  .then(marks => marks.reduce((output, dataTable, indx) => {
    const sheetName = sheets[indx].getName();
    const newOutput = output;
    newOutput[sheetName] = {};
    newOutput[sheetName].names = dataTable.getColumns().map(col => col.getFieldName());
    newOutput[sheetName].data = parseTable(dataTable);
    return newOutput;
  }, {}));

tableauHelper.getParameters = viz => viz
  .getWorkbook()
  .getParametersAsync()
  .then((paramClasses) => {
    if (paramClasses.length > 0) {
      return paramClasses.reduce((output, paramClass) => {
        const newOutput = output;
        newOutput[paramClass.getName()] = paramClass.getCurrentValue().formattedValue;
        return newOutput;
      }, {});
    }
    return {};
  });

tableauHelper.changeParameters = (viz, name, text) => viz
  .getWorkbook()
  .changeParameterValueAsync(name, text);

tableauHelper.debounce = (func, wait, immediate) => {
  let timeout;
  return function (...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(this, args);
  };
};

module.exports = tableauHelper;


/***/ }),
/* 3 */
/***/ (function(module, exports) {

const Flask = {};

// send a request with data to the Flask back-end
const ping = (path, postData) => new Promise((resolve, reject) => {
  try {
    $.ajax({
      type: 'POST',
      url: path,
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify(postData),
      dataType: 'json',
      success: (response) => {
        resolve(response);
      },
      error: (response) => {
        reject(response);
      }
    });
  } catch (err) {
    reject(err);
  }
});

// flask call to process the underlying data from tableau
Flask.content = settings => ping('/content', settings);

module.exports = Flask;


/***/ })
/******/ ]);