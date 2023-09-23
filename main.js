let initialDropdownElement;
let db;
let parsedColumnTypes = [];
let parsedColumns = [];
let parsedRows = [];
let unselectableColumns = ["Product Name", "Price"];
let oneOfEachColumns = ["Conveyor Component"];
let mainFormElement = document.getElementById("main");
// let userSelections = {};

function getCellValue(cellString) {
  let value = cellString.trim();

  if (value === "") {
    return;
  }

  let asNum = parseInt(value);
  if (!isNaN(asNum)) {
    return asNum;
  }

  return value;
}

/**
 * 
 * @param {string} columnName 
 * @returns bool
 */
function isOneOfEach(columnName) {
  return oneOfEachColumns.includes(columnName);
}

function parseDb() {
  let lines = db.trim().split("\n");

  let columnLabelsLine = lines.shift();
  parsedColumns = columnLabelsLine.split(",");
  parsedColumnTypes = Array(parsedColumns.length).fill("undefined");

  lines.forEach((line, rowIndex) => {
    let cells = line.trim().split(",");

    parsedRows.push(cells.map((cellString, columnIndex) => {
      let value = getCellValue(cellString);
      let type = typeof value;
      
      if (parsedColumnTypes[columnIndex] === "undefined") {
        parsedColumnTypes[columnIndex] = type;
      } else if (type !== "undefined" &&parsedColumnTypes[columnIndex] !== type) {
        console.error(`Type mismatch for column '${parsedColumns[columnIndex]}', row ${rowIndex + 1}: expected ${parsedColumnTypes[columnIndex]} but found ${type}`);
      }

      return value;
    }));
  });

  console.log({
    parsedColumns,
    parsedColumnTypes,
    parsedRows
  });
}

function getPossibleRows(userSelections) {
  return parsedRows.filter((row) => {
    return Object.keys(userSelections).every((selectedColumn) => {
      let columnIndex = parsedColumns.indexOf(selectedColumn);
      if (parsedColumnTypes[columnIndex] === "string") {
        return row[columnIndex] === userSelections[selectedColumn];
      } else if (parsedColumnTypes[columnIndex] === "number") {
        return true;
      } else {
        return false;
      }
    });
  });
}

function refreshForm(userSelections, subform) {
  let formElement = subform ? subform : mainFormElement;
  // mainElement.innerHTML = "";

  let possibleRemainingColumns = parsedColumns
    .filter((column) => !unselectableColumns.includes(column))
    .filter((column) => !userSelections[column]);

  let possibleRows = getPossibleRows(userSelections);

  let remainingColumns = [];
  possibleRemainingColumns.forEach((column) => {
    let columnIndex = parsedColumns.indexOf(column);
    let values = [];
    possibleRows.forEach((row) => {
      let value = row[columnIndex];
      if (typeof value !== "undefined") {
        values.push(value);
      }
    });

    if (values.length === possibleRows.length) {
      remainingColumns.push({
        column,
        values: Array.from(new Set(values)),
      });
    }
  });

  if (remainingColumns.length === 0) {
    console.log("no more fields to ask for");
    return false;
  }

  let nextColumns = remainingColumns.slice(0, 1);
  let nextColumn = remainingColumns[0];

  if (isOneOfEach(nextColumn.column)) {
    let subforms = document.createElement("div");
    subforms.className = "subforms";
    mainFormElement.append(subforms);
    nextColumn.values.forEach((value) => {
      let subformContainer = document.createElement("div");
      subformContainer.className = "subformContainer";
      let label = document.createElement("div");
      label.append(value);
      subformContainer.append(label);

      let subform = document.createElement("div");
      subformContainer.append(subform);

      subforms.append(subformContainer);

      let newUserSelections = {
        ...userSelections,
        [nextColumn.column]: value,
      };
      refreshForm(newUserSelections, subform);
    });
    return true;
  }

  let columnInputs = {};

  console.log({ nextColumns });

  // build UI for next fields
  nextColumns.forEach(({ column, values }) => {
    let columnIndex = parsedColumns.indexOf(column);
    let columnType = parsedColumnTypes[columnIndex];

    let label = document.createElement("div");
    label.append(column);
    formElement.append(label);

    if (columnType === "string") {
      let select = document.createElement("select");
      
      values.forEach((value) => {
        let option = document.createElement("option");
        option.setAttribute("value", value);
        option.append(value);
        select.append(option);
      });

      formElement.append(select);
      columnInputs[column] = select;
    } else if (columnType === "number") {
      let input = document.createElement("input");
      input.setAttribute("type", "number");
      formElement.append(input);
      columnInputs[column] = input;
    } else {
      console.error(`Unable to build UI for unexpected column type ${columnType} for column '${column}'`);
    }
  });

  formElement.append(document.createElement("br"));

  let submitButton = document.createElement("button");
  submitButton.append("Next"); // TODO: change to 'success' when next step is done

  submitButton.addEventListener("click", () => { 
    let valid = true;
    nextColumns.forEach(({ column }) => {
      let value = columnInputs[column].value;

      if (columnInputs[column].getAttribute("type") === "number") {
        value = parseInt(value);
      }

      if (typeof value === "undefined" || (typeof value === "string" && value.trim() === "") || Number.isNaN(value)) {
        valid = false;
        alert(`Value missing for field: '${column}'`);
        return;
      }

      userSelections[column] = value;
    });

    if (valid) {
      console.log({ userSelections });
      let hasMoreInputsToFill = refreshForm(userSelections, subform);
      if (!hasMoreInputsToFill) {
        let label = document.createElement("div");
        label.append("Results:");
        formElement.append(label);

        let possibleRows = getPossibleRows(userSelections);

        let results = document.createElement("pre");
        results.append(JSON.stringify(possibleRows.map((row) => {
          let rowObj = {};
          row.forEach((value, columnIndex) => {
            if (value === undefined) {
              return;
            }
            rowObj[parsedColumns[columnIndex]] = value;
          });
          return rowObj;
        }), null, 2));
        formElement.append(results);
      }
    }
  });

  formElement.append(submitButton);

  return true;
}

db = `
Process,Product Name,Conveyor Component,Transfer Type,Roller Material,Wheel Type,Length (M),Width (M),Height (M),Mixer Type,Viscosity,Material,RPM,Material Type
Conveyor,A1 (Conveyor Unit),Unit,motorized,Aluminum,,10,16,3,,,,,
Conveyor,A2 (Conveyor Unit),Unit,Gravity,Stainless Steel,,5-10,2-3,1,,,,,
Conveyor,A3 (Conveyor Wheels),Wheels,,,Caster,,,,,,,,
Conveyor,A4 (Conveyor Wheels),Wheels,,,Stationary,,,,,,,,
Mixer,B1 (Motor),,,,,,,,Motor,,,0-400,
Mixer,B2 (Motor),,,,,,,,Motor,,,200-200,
Mixer,B3 (Mixer Impeller),,,,,,,,Impeller,High (100-200),Stainless Steel,,
Mixer,B4 (Mixer Impeller),,,,,,,,Impeller,Low (0-50),Plastic,,
`;

parseDb();
refreshForm({});