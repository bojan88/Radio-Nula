var audioElement = document.createElement('audio');
audioElement.setAttribute("preload", "auto");
audioElement.preload = true;

var source1 = document.createElement('source');
source1.type = 'audio/mpeg';
source1.src = 'http://streaming.radionula.com:8800/classics';
audioElement.appendChild(source1);

chrome.extension.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.action === 'play') {
      audioElement.load;
      audioElement.play();
      sendResponse({status: 'playing'});
    }
    if (request.action === 'pause') {
      audioElement.pause();
      sendResponse({status: 'paused'});
    }
    if(request.action === 'status') {
      sendResponse({status: 'status', value: audioElement.paused});
    }
  }
);

