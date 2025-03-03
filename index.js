window.onload = function () {
  console.log("loaded");
  start();
};

const defaultKey = {
  width: 1,
  // height: 1,
  // color: "#202020",
  // textColor: "#efefef",
  // fontSize: 8,
  legends: [],
  type: "key",
};

var board = {
  name: "",
  keys: [],
};

var selectedKey = [0, 0];

function start() {
  unselectKey();
  generateBoard();
}

function generateBoard() {
  document.querySelector("#content #keyboard").innerHTML = "";
  document.querySelector("#col-count").innerHTML = "Columns: " + longestChildArrayLength(board.keys);
  document.querySelector("#row-count").innerHTML = "Rows: " + board.keys.length;
  document.querySelector("#key-count").innerHTML = "Keys: " + countKeys();

  for (let r = 0; r < board.keys.length; r++) {
    // for each row
    const rowContainer = document.createElement("div");
    rowContainer.className = "kbrow";
    for (let k = 0; k < board.keys[r].length; k++) {
      // for each key in row
      const keyInfo = board.keys[r][k];
      const keyContainer = document.createElement("div");
      keyContainer.style.width = 48 * keyInfo.width + 2 * (keyInfo.width - 1) + "px";
      keyContainer.style.minWidth = 48 * keyInfo.width + 2 * (keyInfo.width - 1) + "px";
      keyContainer.style.maxWidth = 48 * keyInfo.width + 2 * (keyInfo.width - 1) + "px";

      const keyContent = document.createElement("button");
      keyContainer.className = "key";
      if (keyInfo.type == "knob") keyContainer.classList.add("knob");
      if (keyInfo.type == "spacer") keyContainer.classList.add("spacer");

      keyContainer.onclick = function () {
        event.stopPropagation(); // Prevent the event from bubbling up to the parent
        selectedKey = [r, k];
        selectKey(keyContainer, keyInfo);
      };
      if (selectedKey[0] == r && selectedKey[1] == k) keyContainer.click();

      for (l in keyInfo.legends) {
        // for each legend in key
        legendInfo = keyInfo.legends[l];
        const legendContainer = document.createElement("div");
        legendContainer.className = "legend";
        legendContainer.innerHTML = legendInfo.content;
        // calculate row and column location
        const row = Math.floor(legendInfo.location / 3) + 1;
        const col = legendInfo.location + 1 - (row - 1) * 3;
        legendContainer.style.gridColumn = col;
        legendContainer.style.gridRow = row;
        //
        keyContent.append(legendContainer);
      }
      keyContainer.append(keyContent);
      rowContainer.append(keyContainer);
    }
    document.querySelector("#content #keyboard").append(rowContainer);
  }
}

function addKeySameRow() {
  // get amount
  const amount = document.querySelector("#key-amount-input").value;
  const location = selectedKey[1] + 1;
  if (!board.keys[0]) board.keys.push([]);
  // add keys
  for (let i = 0; i < amount; i++) {
    board.keys[selectedKey[0]].splice(location, 0, JSON.parse(JSON.stringify(defaultKey))); // push a deep clone NOT a reference!
  }
  // select the key added
  selectedKey[1] = location;
  // regenerate board
  generateBoard();
}

function addKeyToNewRow() {
  // get amount
  const amount = document.querySelector("#key-amount-input").value;
  // create new empty row
  board.keys[board.keys.length] = [];
  // add keys
  for (let i = 0; i < amount; i++) {
    board.keys[board.keys.length - 1].push(JSON.parse(JSON.stringify(defaultKey))); // push a deep clone NOT a reference!
  }
  // select the last key added
  selectedKey[0] += 1;
  selectedKey[1] = amount - 1;
  // regenerate board
  generateBoard();
}

function unselectKey() {
  const keys = document.querySelectorAll("#main #content #keyboard .key");
  keys.forEach((key) => {
    key.classList.remove("active");
  });
  let elems = document.querySelectorAll(
    "#main #content #options #key-options button, #main #content #options #key-options input,#main #content #options #key-options select"
  );
  for (i in elems) {
    elems[i].disabled = true;
  }
  const legendInputs = document.querySelector("#main #content #options div #legend-input-container").children;
  for (i in legendInputs) {
    legendInputs[i].value = "";
  }
  document.querySelector("#key-width-input").value = "";
}

function selectKey(keyObject, keyInfo) {
  if (!keyObject || !keyInfo) return;

  // undisable inputs
  let elems = document.querySelectorAll(
    "#main #content #options #key-options button, #main #content #options #key-options input,#main #content #options #key-options select"
  );
  for (i in elems) elems[i].disabled = false;

  // set key to active
  const keys = document.querySelectorAll("#main #content #keyboard .key");
  keys.forEach((key) => {
    key.classList.remove("active");
  });
  keyObject.classList.add("active");

  // set legend inputs to have proper values
  const legendInputs = document.querySelector("#main #content #options div #legend-input-container").children;
  for (i in legendInputs) {
    legendInputs[i].value = "";
  }
  for (i in keyInfo.legends) {
    legendInputs[keyInfo.legends[i].location].value = keyInfo.legends[i].content;
  }

  // set key width input
  document.querySelector("#key-width-input").value = keyInfo.width;
  document.querySelector("#key-width-input").setAttribute("min", keyInfo.type == "spacer" ? "0.25" : "1");
  document.querySelector("#key-width-input").setAttribute("max", keyInfo.type == "knob" ? "1" : "9999");

  // set  key type selector
  document.querySelector("#key-type-select").value = keyInfo.type;
}

function editKeyType(value) {
  board.keys[selectedKey[0]][selectedKey[1]].type = value;
  generateBoard();
}

function editLegend(value, location) {
  const index = board.keys[selectedKey[0]][selectedKey[1]].legends.findIndex((obj) => obj.location === location);
  if (index != -1) board.keys[selectedKey[0]][selectedKey[1]].legends[index].content = value;
  else board.keys[selectedKey[0]][selectedKey[1]].legends.push({ content: value, location: location });
  generateBoard();
}

function editKeyWidth(value) {
  board.keys[selectedKey[0]][selectedKey[1]].width = value;
  generateBoard();
}

function deleteKey() {
  board.keys[selectedKey[0]].splice([selectedKey[1]], 1);
  if (board.keys[selectedKey[0]].length === 0 && selectedKey[0] != 0) {
    board.keys.splice(selectedKey[0], 1);
    selectedKey = [0, 0];
  }
  generateBoard();
  unselectKey();
}

function copyCurrentBoard() {
  navigator.clipboard.writeText(JSON.stringify(board));
}

function importJSON() {
  board = JSON.parse(document.querySelector("#main #content #options div #json-input").value);
  generateBoard();
}

function changeKeyboardTheme(t) {
  console.log(t);
  document.body.setAttribute("theme", t);
}

function saveJSON() {
  const json = JSON.stringify(board, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  // Create an anchor element
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "data.json"; // Set the filename for the download

  // Programmatically trigger the file download
  document.body.appendChild(a); // Append anchor to DOM to ensure it works in some browsers
  a.click();
  document.body.removeChild(a); // Clean up the anchor element after download
}

function longestChildArrayLength(arr) {
  if (!Array.isArray(arr) || arr.length === 0) {
    return 0; // Return 0 if the input is not an array or is empty
  }
  return Math.max(...arr.map((child) => child.length || 0));
}

function countKeys() {
  total = {
    key: 0,
    knob: 0,
  };
  for (let r = 0; r < board.keys.length; r++) {
    for (let k = 0; k < board.keys[r].length; k++) {
      let key = board.keys[r][k];
      if (key.type == "spacer") continue;
      total[key.type] += 1;
    }
  }
  return total.key + total.knob;
}
