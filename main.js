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

function refreshForm() {
  let mainElement = document.getElementById("main");
  mainElement.innerHTML = "";

  let possibleColumns = parsedColumns
    .filter((column) => !unselectableColumns.includes(column))
    .filter((column) => !userSelections[column]);

  let nextColumns = possibleColumns.filter((column) => {
    // TODO: get all the next columns starting from the left for which each row in the set of remaining options has a well-defined value
  });

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

db = `
Product Name,Process,Transfer Type,Roller Material,Wheel Type,Length,Width,Height
A1,Conveyor,motorized,Aluminum,,10,16,3
A2,Conveyor,,,Caster,,,
`;

parseDb();
createInitialForm();

// function createConveyorForm() {
//   let 
// }

// function createMixerForm() {

// }