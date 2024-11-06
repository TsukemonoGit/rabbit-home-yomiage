var maxLength = 140;
var preText = "";
var preName = "";
var observer;

const nip19Regex = /nostr:(((npub|nsec|nprofile|naddr|nevent|note)1[023456789acdefghjklmnpqrstuvwxyz]{58,}))/g;

function addButton() {
  // チェックボックスを作成
  var checkboxContainer = document.createElement("div");
  checkboxContainer.style = "position: fixed; top: 10px; right: 10px; z-index: 9999; display: flex; align-items: center; background-color: white; padding: 5px; border-radius: 5px;";

  var checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = "autoReadCheckbox";
  checkbox.checked = false;  // 初期状態をOFFに設定
  checkbox.style = "margin-right: 5px;";

  var label = document.createElement("label");
  label.htmlFor = "autoReadCheckbox";
  label.innerHTML = "自動読み上げOFF";  // 初期表示をOFFに設定
  label.style = "font-size: 14px;";

  checkboxContainer.appendChild(checkbox);
  checkboxContainer.appendChild(label);
  document.body.appendChild(checkboxContainer);

  // 音量スライダーを作成
  var volumeBar = document.createElement("input");
  volumeBar.type = "range";
  volumeBar.min = "0";
  volumeBar.max = "1";
  volumeBar.step = "0.1";
  volumeBar.value = "1";
  volumeBar.style = "position: fixed; top: 50px; right: 10px; z-index: 9999; background-color: white;";
  document.body.appendChild(volumeBar);

  // 最大文字数の入力フィールドを作成
  var maxLengthContainer = document.createElement("div");
  maxLengthContainer.style = "position: fixed; top: 90px; right: 10px; z-index: 9999; background-color: white; display: flex; align-items: center; flex-direction: column;";

  var maxLengthLabel = document.createElement("label");
  maxLengthLabel.innerHTML = "最大読み上げ文字数:";
  maxLengthLabel.style = "font-size: 14px; margin-right: 5px;";
  maxLengthContainer.appendChild(maxLengthLabel);

  var maxLengthInput = document.createElement("input");
  maxLengthInput.placeholder = "maxLength";
  maxLengthInput.type = "number";
  maxLengthInput.value = maxLength;
  maxLengthInput.min = "1";
  maxLengthInput.max = "1000";
  maxLengthInput.style = "width: 100px; font-size: 14px; text-align: center;";
  maxLengthContainer.appendChild(maxLengthInput);

  document.body.appendChild(maxLengthContainer);

  maxLengthInput.addEventListener("input", function () {
    maxLength = parseInt(maxLengthInput.value, 10);
  });

  // チェックボックスのクリックイベントで読み上げをトグル
  checkbox.addEventListener("change", toggleReading);
}

function toggleReading() {
  var checkbox = document.getElementById("autoReadCheckbox");
  var label = document.querySelector("label[for='autoReadCheckbox']");
  if (checkbox.checked) {
    label.innerHTML = "自動読み上げON";
    startObserving();
  } else {
    label.innerHTML = "自動読み上げOFF";
    stopObserving();
  }
}

var utteranceQueue = [];
var isSpeaking = false;

function enqueueSpeech(userName, text) {
  utteranceQueue.push({ userName, text });
  if (!isSpeaking) {
    playNextInQueue();
  }
}

function playNextInQueue() {
  if (utteranceQueue.length === 0) {
    isSpeaking = false;
    return;
  }

  isSpeaking = true;
  var { userName, text } = utteranceQueue.shift();
  var utterance = new SpeechSynthesisUtterance(`${userName} さんの投稿。 ${text}`);

  utterance.onend = function () {
    isSpeaking = false;
    playNextInQueue();
  };

  utterance.onerror = function () {
    isSpeaking = false;
    playNextInQueue();
  };

  utterance.volume = parseFloat(document.querySelector("input[type=range]").value);
  window.speechSynthesis.speak(utterance);
}

function startObserving() {
  observer = new MutationObserver(function () {
    var noteElement = document.querySelector(".textnote-content");//
    var nameElement = document.querySelector(".author-name");
    var userNameElement = document.querySelector(".author-username");

    var noteText = noteElement?.textContent;
    var userName = nameElement?.textContent ?? userNameElement?.textContent ?? "";

    if (!noteText || (noteText === preText && preName === userName)) {
      return;
    }

    preText = noteText;
    preName = userName;

    noteText = noteText.replace(/(https?:\/\/\S+)/g, "URL省略")
      .replace(nip19Regex, "引用省略")
      .replace(/[!-\/-@[-`{-~.・―]/g, "")
      .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "")
      .replace(/:[^:\s]+:/g, "");

    if (noteText.length <= 0) return;

    if (noteText.length > maxLength) {
      noteText = noteText.slice(0, maxLength) + "。 以下省略";
    }

    enqueueSpeech(userName, noteText);
  });

  var config = { childList: true, subtree: true };
  var targetNode = document.querySelector(".scrollbar.flex.flex-col.overflow-y-scroll.pb-16");

  if (targetNode) {
    observer.observe(targetNode, config);
  } else {
    console.log("targetNode not found.");
  }
}

function stopObserving() {
  if (observer) observer.disconnect();
}

window.onload = addButton;
