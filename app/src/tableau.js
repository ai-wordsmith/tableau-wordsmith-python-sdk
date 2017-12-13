const tableauHelper = {};

tableauHelper.getAllSettings = (viz) => {
  const sheets = viz.getWorkbook().getActiveSheet().getWorksheets();
  return Promise.all([
    tableauHelper.getFilters(viz, sheets),
    tableauHelper.getMarks(viz, sheets),
    tableauHelper.getParameters(viz),
  ]);
};

tableauHelper.getFilters = (viz, sheets) => Promise.all(sheets
  .map(sheet => sheet.getFiltersAsync()))
  .then(filterSheets => filterSheets.reduce((output, filterClasses, indx) => {
    const sheetName = sheets[indx].getName();
    const newOutput = output;
    newOutput[sheetName] = {};
    filterClasses.forEach((klass) => {
      const key = klass.getFieldName();
      if (!Object.keys(newOutput[sheetName]).includes(key)) {
        newOutput[sheetName][key] = klass.getAppliedValues().reduce((values, val) => {
          if (!values.includes(val.formattedValue)) {
            values.push(val.formattedValue);
          }
          return values;
        }, []);
      }
    });
    return newOutput;
  }, {}));

tableauHelper.getMarks = (viz, sheets) => Promise.all(sheets
  .map(sheet => sheet.getSummaryDataAsync()))
  .then(dataSheets => dataSheets.reduce((output, dataTable, indx) => {
    const sheetName = sheets[indx].getName();
    const newOutput = output;
    newOutput[sheetName] = {};
    const columnNames = dataTable.getColumns().map(col => col.getFieldName());
    const data = dataTable.getData();
    columnNames.forEach((col) => {
      if (!Object.keys(newOutput).includes(col)) {
        newOutput[sheetName][col] = [];
      }
    });
    data.forEach((row) => {
      row.forEach((val, index) => {
        const key = columnNames[index];
        newOutput[sheetName][key].push(val.formattedValue);
      });
    });
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
