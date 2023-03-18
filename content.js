// ボタンを生成して追加する関数
function addButton() {
  var button = document.createElement("buttonA");
  button.innerHTML = "自動読み上げON";
  button.style = "position: fixed; top: 10px; right: 10px; z-index: 9999;background-color:white;";
  document.body.appendChild(button);

  // 音量調整バーを生成して追加する
  var volumeBar = document.createElement("input");
  volumeBar.type = "range";
  volumeBar.min = "0";
  volumeBar.max = "1";
  volumeBar.step = "0.1";
  volumeBar.value = "1";
  volumeBar.style = "position: fixed; top: 50px; right: 10px; z-index: 9999; background-color: white;";
  document.body.appendChild(volumeBar);

  button.onclick = toggleReading; // ボタンをクリックした時のイベントハンドラを設定
}

// 読み上げON/OFFを切り替える関数
function toggleReading() {
  var button = document.querySelector("buttonA");
  if (button.innerHTML === "自動読み上げON") {
    button.innerHTML = "自動読み上げOFF";
    startObserving();
  } else {
    button.innerHTML = "自動読み上げON";
    stopObserving();
  }
}

var preText;
var utterance = new SpeechSynthesisUtterance();
utterance.volume = 1; // 音量の初期値を設定

// 監視を開始する関数
function startObserving() {
  var observer = new MutationObserver(function (mutation) {
    var post = mutation.target;
    var noteElement =  document.querySelector(".block.shrink-0.overflow-hidden.border-b.p-1 .content");
    if(noteElement){
    
   
      var noteText = noteElement.textContent;

        // URL部分を「URL省略」と読み上げる
        noteText = noteText.replace(/(https?:\/\/\S+)/g, "URL省略");

      // 記号部分を削除する
      noteText = noteText.replace(/[!-\/-@[-`{-~.・―]/g, "");

      // 絵文字を読み上げ対象から除外する
      var emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
      noteText = noteText.replace(emojiRegex, "");
      //noteText=noteText.substring(0,140)

      //前回の読み上げ内容と違ったら読み上げる
       if(noteText!=preText){
        preText = noteText;//document.querySelector(".block.shrink-0.overflow-hidden.border-b.p-1 .content").innerText.substr(0, 140);
        utterance.text = preText;
        window.speechSynthesis.speak(utterance);
      }
    
  }
  });

  var config = { childList: true, subtree: true };
  var targetNode = document.querySelector(".flex.flex-col.overflow-y-scroll.scroll-smooth");
  if (targetNode) {
    observer.observe(targetNode, config);
  } else {
    console.log("targetNode not found.");
  }

  // 音量調整バーの値が変更された時に、utteranceの音量を変更する
  var volumeBar = document.querySelector("input[type=range]");
  volumeBar.addEventListener("input", function () {
    utterance.volume = volumeBar.value;
  });
}

// 監視を停止する関数
function stopObserving() {
  var observer = new MutationObserver(function () { });
  observer.disconnect();
}

// ページの読み込みが完了したらボタンを生成して追加する
window.onload = addButton;