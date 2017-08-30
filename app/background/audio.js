var playing = false;
var loading = false;

var audioEl = document.createElement('audio');
audioEl.setAttribute("preload", "auto");
audioEl.volume = 0.8;

var source = document.createElement('source');
source.type = 'audio/mpeg';
source.src = 'http://streaming.radionula.com:8800/classics';
audioEl.appendChild(source);

audioEl.addEventListener('playing', function() {
  chrome.runtime.sendMessage({action: 'play_started'});
  playing = true;
  loading = false;
});

audioEl.addEventListener('error', function(e) {
  chrome.runtime.sendMessage({action: 'error'});
  playing = false;
  loading = false;
  console.log('Audio error code: ' + e.target.error.code);
});

audioEl.addEventListener('abort', function() {
  playing = false;
});

function pause() {
  audioEl.pause();
}

chrome.extension.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.action === 'play') {
      loading = true;
      audioEl.load();
      audioEl.play();
    } else if (request.action === 'pause') {
      playing = false;
      pause();
      sendResponse({status: 'paused'});
    } else if(request.action === 'status') {
      sendResponse({
        playing: playing,
        loading: loading,
        volume: audioEl.volume
      });
    } else if(request.action === 'set_volume') {
      audioEl.volume = request.volume;
    }
  }
);
