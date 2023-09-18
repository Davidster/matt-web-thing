let initialDropdownElement;
let db;
let parsedColumnTypes = [];
let parsedColumns = [];
let parsedRows = [];
let unselectableColumns = ["Product Name", "Price"];
let userSelections = {};

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

// function parseDb() {
//   let lines = db.trim().split("\n");

//   let columnLabelsLine = lines.shift();
//   let columnsLabels = columnLabelsLine.split(",");

//   let columnInfoMap = {};
//   // columns.forEach((columnLabel) => {
//   //   columnInfoMap[columnLabel] = {
//   //     label: columnLabel
//   //   };
//   // });

//   lines.forEach((line) => {
//     let cells = line.split(",");

//     let process = cells.shift();
    
//     cells.forEach((cell, i) => {
//       let cellValue = cell.trim();
//       if (cellValue === "") {
//         return;
//       }

//       let columnLabel = columnsLabels[i + 1];
//       let columnId = `${process}_${columnLabel}`;

//       if (!columnInfoMap[columnId]) {
//         columnInfoMap[columnId] = {
//           process,
//           columnLabel,
//         };
//       }
      
//       let 
//     });
//   });
// }

function getPossibleRows() {
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

function refreshForm() {
  let mainElement = document.getElementById("main");
  // mainElement.innerHTML = "";

  let possibleNextColumns = parsedColumns
    .filter((column) => !unselectableColumns.includes(column))
    .filter((column) => !userSelections[column]);

  let possibleRows = getPossibleRows();

  let nextColumns = [];
  possibleNextColumns.forEach((column) => {
    let columnIndex = parsedColumns.indexOf(column);
    let values = [];
    possibleRows.forEach((row) => {
      let value = row[columnIndex];
      if (typeof value !== "undefined") {
        values.push(value);
      }
    });

    if (values.length === possibleRows.length) {
      nextColumns.push({
        column,
        values: Array.from(new Set(values)),
      });
    }
  });

  if (nextColumns.length === 0) {
    console.log("no more fields to ask for");
    return false;
  }

  // TODO: can we be smarter about presenting these in chunks?
  nextColumns = nextColumns.slice(0, 1);

  // let nextColumns = possibleNextColumns.filter((column) => {
  //   let columnIndex = parsedColumns.indexOf(column);
  //   return possibleRows.every((row) => typeof row[columnIndex] !== "undefined");
  // });

  // console.log({ nextColumns });

  let columnInputs = {};

  console.log({ nextColumns });

  // build UI for next fields
  nextColumns.forEach(({ column, values }) => {
    let columnIndex = parsedColumns.indexOf(column);
    let columnType = parsedColumnTypes[columnIndex];

    let label = document.createElement("div");
    label.append(column);
    mainElement.append(label);

    if (columnType === "string") {
      let select = document.createElement("select");
      
      values.forEach((value) => {
        let option = document.createElement("option");
        option.setAttribute("value", value);
        option.append(value);
        select.append(option);
      });

      mainElement.append(select);
      columnInputs[column] = select;
    } else if (columnType === "number") {
      let input = document.createElement("input");
      input.setAttribute("type", "number");
      mainElement.append(input);
      columnInputs[column] = input;
    } else {
      console.error(`Unable to build UI for unexpected column type ${columnType} for column '${column}'`);
    }
  });

  mainElement.append(document.createElement("br"));

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
      let hasMoreInputsToFill = refreshForm();
      if (!hasMoreInputsToFill) {
        let label = document.createElement("div");
        label.append("Results:");
        mainElement.append(label);

        let possibleRows = getPossibleRows();

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
        mainElement.append(results);

        // possibleRows.forEach((row) => {
        //   let rowElement = document.createElement("div");
        //   // rowElement.append(row.filter((col) => col !== undefined).join(" "));
        //   rowElement.append(JSON.stringify());
        //   mainElement.append(rowElement);
        // });
      }
    }
  });

  mainElement.append(submitButton);

  return true;
}

function createInitialForm() {
  let mainElement = document.getElementById("main");

  // add welcome message
  {
    let welcomeElement = document.createElement("div");
    welcomeElement.append("Welcome");
    mainElement.append(welcomeElement);
  }

  // add process dropdown
  {
    let label = document.createElement("div");
    label.append("Process");

    initialDropdownElement = document.createElement("select");

    // option 1
    let conveyorOption = document.createElement("option");
    conveyorOption.setAttribute("value", "Conveyor");
    conveyorOption.append("Conveyor");
    initialDropdownElement.append(conveyorOption);

    // option 2
    let mixerOption = document.createElement("option");
    mixerOption.setAttribute("value", "Mixer");
    mixerOption.append("Mixer");
    initialDropdownElement.append(mixerOption);

    mainElement.append(initialDropdownElement);
  }

  // add submit button
  {
    let submitButton = document.createElement("button");
    submitButton.append("Next");

    submitButton.addEventListener("click", () => { 
      let selectedValue = initialDropdownElement.value;

      if (selectedValue === "Conveyor") {
        createConveyorForm();
      } else if (selectedValue === "Mixer") {
        createMixerForm();
      }
    });

    mainElement.append(submitButton);
  }
}

// db = `
// Product Name,Process,Transfer Type,Roller Material,Wheel Type,Length,Width,Height
// A1,Conveyor,motorized,Aluminum,,10,16,3
// A2,Conveyor,,,Caster,,,
// `;

db = `
Process,Product Name,Conveyor Type,Transfer Type,Roller Material,Wheel Type,Length (M),Width (M),Height (M),Mixer Type,Viscosity,Material,RPM,Material Type
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
refreshForm();
// createInitialForm();

// function createConveyorForm() {
//   let 
// }

// function createMixerForm() {

// }