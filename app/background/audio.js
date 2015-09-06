var audioElements = [];
var playing = false;
var loading = false;

var audioEl1 = document.createElement('audio');
audioEl1.setAttribute("preload", "auto");
audioElements.push(audioEl1);

var audioEl2 = document.createElement('audio');
audioEl2.setAttribute("preload", "auto");
audioElements.push(audioEl2);

var audioEl3 = document.createElement('audio');
audioEl3.setAttribute("preload", "auto");
audioElements.push(audioEl3);

var source1 = document.createElement('source');
source1.type = 'audio/mpeg';
source1.src = 'http://streaming.radionula.com:8800/classics';
audioEl1.appendChild(source1);

var source2 = document.createElement('source');
source2.type = 'audio/mpeg';
source2.src = 'http://streaming.radionula.com:8800/channel2';
audioEl2.appendChild(source2);

var source3 = document.createElement('source');
source3.type = 'audio/mpeg';
source3.src = 'http://streaming.radionula.com:8800/channel3';
audioEl3.appendChild(source3);

var currentInd = 0;

audioElements.forEach(function(el, ind) {

  el.addEventListener('playing', function() {
    chrome.runtime.sendMessage({action: 'play_started', channelInd: ind});
    playing = true;
    loading = false;
    pauseOthers();
  });

  el.addEventListener('error', function() {
    chrome.runtime.sendMessage({action: 'error'});
    playing = false;
    loading = false;
    console.log('error')
  });

  el.addEventListener('abort', function() {
    playing = false;
  });

});

function pauseOthers() {
  audioElements.forEach(function(el, ind) {
    if(ind !== currentInd) {
      el.pause();
    }
  });
}

function pauseAll() {
  audioElements.forEach(function(el, ind) {
    el.pause();
  });
}

chrome.extension.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.action === 'play') {
      loading = true;
      audioElements[currentInd].load();
      audioElements[currentInd].play();
    } else if (request.action === 'pause') {
      playing = false;
      pauseAll();
      sendResponse({status: 'paused'});
    } else if(request.action === 'status') {
      sendResponse({status: 'status', playing: playing, loading: loading, channelInd: currentInd});
    } else if(request.action === 'shift') {
      currentInd = (currentInd + 1) % audioElements.length;
      if(playing) {
        loading = true;
        audioElements[currentInd].load();
        audioElements[currentInd].play();
      }
    } else if(request.action === 'play_started' && request.source === 'injected') {
      currentInd = request.channelInd;
      console.log('got the message, ind: ' + request.channelInd);
    }
  }
);

