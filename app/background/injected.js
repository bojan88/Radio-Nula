var audioEl = document.getElementById('audio-main');

audioEl.addEventListener('playing', function() {
  chrome.runtime.sendMessage({
    source: 'injected',
    action: 'play_started',
  });
});
