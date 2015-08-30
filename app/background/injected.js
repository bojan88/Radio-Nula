var audioEl = document.getElementById('audio-main');

audioEl.addEventListener('playing', function() {
  debugger;
  var channel = audioEl.src.substring(audioEl.src.lastIndexOf('/') + 1, audioEl.src.length);
  var channelInd;
  switch(channel) {
    case 'classics':
      channelInd = 0;
      break;
    case 'channel2':
      channelInd = 1;
      break;
    case 'channel3':
      channelInd = 2;
      break;
  }
  chrome.runtime.sendMessage({
    source: 'injected',
    action: 'play_started',
    channelInd: channelInd
  });
});
