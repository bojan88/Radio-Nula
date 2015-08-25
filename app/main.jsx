import React from 'react';
import Home from './components/home.jsx';
import ChromeExOAuth from './api/chromeExtensionOauth';

//add eurl to the youtube get_video_info request
//some videos won't play if there's no eurl because of the copyright content
//chrome.webRequest.onBeforeRequest.addListener((data) => {
//  if(data.url.indexOf('get_video_info') !== -1 && data.url.indexOf('&eurl=http%3A%2F%2Fchrome-extension%2F') === -1) {
//    var url = data.url.replace(/eurl=?[^&?]*/g, '') + '&eurl=http%3A%2F%2Fchrome-extension%2F';
//    return {
//      redirectUrl: url
//    };
//  }
//}, {
//  urls: ['*://www.youtube.com/*'],
//  types: ["xmlhttprequest"]
//},['blocking']);


var oauth = ChromeExOAuth.initBackgroundPage({
  'request_url': 'https://www.google.com/accounts/OAuthGetRequestToken',
  'authorize_url': 'https://www.google.com/accounts/OAuthAuthorizeToken',
  'access_url': 'https://www.google.com/accounts/OAuthGetAccessToken',
  'consumer_key': 'anonymous',
  'consumer_secret': 'anonymous',
  'scope': 'https://www.googleapis.com/auth/youtube',
  'app_name': 'Nula'
});

oauth.authorize(function() {
  // ... Ready to fetch private data ...
});

React.render(
  <Home />,
  document.getElementById('tabs')
);
