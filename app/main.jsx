import React from 'react';
import Home from './components/home.jsx';
import ls from 'local-storage';

//add eurl to the youtube get_video_info request
//some videos won't play if there's no eurl because of the copyright content
chrome.webRequest.onBeforeRequest.addListener((data) => {
  if(data.url.indexOf('get_video_info') !== -1 && data.url.indexOf('&eurl=http%3A%2F%2Fchrome-extension%2F') === -1) {
    var url = data.url.replace(/eurl=?[^&?]*/g, '') + '&eurl=http%3A%2F%2Fchrome-extension%2F';
    return {
      redirectUrl: url
    };
  }
}, {
  urls: ['*://www.youtube.com/*'],
  types: ["xmlhttprequest"]
},['blocking']);

chrome.identity.getAuthToken({ 'interactive': true }, (token) => {
  ls('oauthToken', token);
});

React.render(
  <Home />,
  document.getElementById('tabs')
);
