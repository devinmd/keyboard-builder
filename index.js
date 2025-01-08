window.onload = function () {
  console.log("loaded");
  start();
};

const defaultKey = {
  width: 1,
  height: 1,
  color: "#202020",
  textColor: "#efefef",
  fontSize: 8,
  legends: [],
  type: "",
};

var board = {
  name: "",
  keys: [[]],
};

var selectedKey = [0, -1];

function start() {
  generateBoard();
}

function generateBoard() {
  document.querySelector("#content #keyboard").innerHTML = "";
  for (let r = 0; r < board.keys.length; r++) {
    // for each row
    const rowContainer = document.createElement("div");
    rowContainer.className = "row";
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

      keyContainer.onclick = function () {
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
  const rownum = selectedKey[0];
  for (let i = 0; i < document.querySelector("#key-amount-input").value; i++) {
    board.keys[rownum].push(JSON.parse(JSON.stringify(defaultKey))); // push a deep clone NOT a reference!
  }
  generateBoard();
}

function addKeyToNewRow() {
  board.keys[board.keys.length] = [];
  for (let i = 0; i < document.querySelector("#key-amount-input").value; i++) {
    board.keys[board.keys.length - 1].push(JSON.parse(JSON.stringify(defaultKey))); // push a deep clone NOT a reference!
  }
  selectedKey[0] += 1;
  generateBoard();
}

function selectKey(keyObject, keyInfo) {
  if (!keyObject || !keyInfo) return;

  const keys = document.querySelectorAll("#main #content #keyboard .key");

  keys.forEach((key) => {
    key.classList.remove("active");
  });

  keyObject.classList.add("active");

  //

  const legendInputs = document.querySelector("#main #content #options div #legend-input-container").children;
  for (i in legendInputs) {
    legendInputs[i].value = "";
  }
  for (i in keyInfo.legends) {
    legendInputs[keyInfo.legends[i].location].value = keyInfo.legends[i].content;
  }

  document.querySelector("#key-width-input").value = keyInfo.width;
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
  generateBoard();
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
