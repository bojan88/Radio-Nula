"use strict";

import React, {Component} from 'react';
import {RaisedButton, TextField} from 'material-ui';
import superagent from 'superagent';
import VideoList from './videoList.jsx';
import PlayLists from './playLists.jsx';
import ls from 'local-storage';

var youtubeKey = 'AIzaSyBoPL6PrHHVuhYKHhYfFOTsYyEtlXR2mFg';
var songCount = 3;

const progressStyle = {
  display: 'table',
  marginLeft: 'auto',
  marginRight: 'auto',
  marginTop: '50px',
  marginBottom: '50px'
};

const ulStyle = {
  padding: 0
};

const loadMoreBtn = {
  marginTop: '20px',
  marginBottom: '20px'
};

const songFieldStyle = {
  marginTop: '10px',
  marginLeft: '24px',
  width: '356px'
};

const videoListStyle = {
  marginBottom: '20px'
};

class FoundVideos extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };

    this.updateToken();
  }

  updateToken(callback) {
    chrome.identity.getAuthToken({ 'interactive': true }, (token) => {
      this.setState({
        oauthToken: token
      });
      if(callback && typeof callback === 'function') {
        callback();
      }
    });
  }

  componentDidMount() {
    superagent.get('http://socket.radionula.com/playlist').end((err, res) => {
      var song = res.body.ch1.currentSong;
      this.setState({
        song: `${song.artist} - ${song.title}`
      });
      this._searchYoutube();
    });
  }

  _searchYoutube() {
    this.setState({
      loading: true
    });

    var queryURL = 'https://www.googleapis.com/youtube/v3/search?q='+encodeURIComponent(this.state.song)+'&key='+youtubeKey+'&part=snippet&maxResults='+songCount+'&type=video&videoEmbeddable=true';
    superagent.get(queryURL, (err, res) => {
      var resObj = JSON.parse(res.text);
      this.setState({
        loading: false,
        videos: resObj.items,
        nextPageToken: resObj.nextPageToken
      });

      if(resObj.items.lenth < 3) {
        var song = this.state.song.replace(/\s?\(.+\)/, '');
        queryURL = 'https://www.googleapis.com/youtube/v3/search?q='+encodeURIComponent(song)+'&key='+youtubeKey+'&part=snippet&maxResults='+(songCount-resObj.items.length)+'&type=video&videoEmbeddable=true';
        superagent.get(queryURL, (err, res) => {
          resObj = JSON.parse(res.text);
          this.setState({
            videos: this.state.videos.concat(resObj.items),
            nextPageToken: resObj.nextPageToken
          });
        }.bind(this));
      }
    }.bind(this));
  }

  loadMore(event) {
    if(!this.state.nextPageToken) {
      return;
    }

    var song = this.state.song;
    var queryURL = 'https://www.googleapis.com/youtube/v3/search?q='+encodeURIComponent(song)+'&key='+youtubeKey+'&part=snippet&maxResults='+songCount+'&type=video&videoEmbeddable=true&pageToken='+this.state.nextPageToken;
    superagent.get(queryURL, (err, res) => {
      var resObj = JSON.parse(res.text);
      //if we got the same results
      if(resObj.items[resObj.items.length - 1].id.videoId ===  this.state.videos[this.state.videos.length - 1].id.videoId) {
        this.setState({
          nextPageToken: null
        });
        return;
      }
      this.setState({
        videos: this.state.videos.concat(resObj.items),
        nextPageToken: resObj.nextPageToken !== this.state.nextPageToken ? resObj.nextPageToken : null
      });
    }.bind(this));
  }

  _handleTextFieldChange(e) {
    this.setState({
      song: e.target.value
    });

    clearTimeout(this.waitHandler);

    this.waitHandler = setTimeout(() => {
      if(this.state.song.length > 1) {
        this._searchYoutube();
      }
    }.bind(this), 500);
  }

  setPlaylist(playlistId) {
    this.setState({
      playlistId: playlistId
    });
  }

  render() {
    return (
      <div>
        <div>
          <PlayLists setPlaylist={this.setPlaylist.bind(this)} oauthToken={this.state.oauthToken} updateToken={this.updateToken.bind(this)} />
          <TextField id="songNameInput" onChange={this._handleTextFieldChange.bind(this)} value={this.state.song} style={songFieldStyle} />
        </div>
        <div style={videoListStyle}>
          <VideoList
            loading={this.state.loading}
            song={this.state.song}
            videos={this.state.videos}
            playlistId={this.state.playlistId}
            oauthToken={this.state.oauthToken} />
        </div>
        <div className="center-block">
          {this.state.nextPageToken ? <RaisedButton style={loadMoreBtn} label="Load More" onClick={this.loadMore.bind(this)} /> : null}
        </div>
      </div>
    );
  }
};

export default FoundVideos;
