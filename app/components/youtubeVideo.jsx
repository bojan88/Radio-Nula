"use strict";

import React, {Component, findDOMNode} from 'react';
import ReactDOM from 'react-dom';
import {Card, CardMedia, CardTitle, CardActions, RaisedButton, Snackbar} from 'material-ui';
import superagent from 'superagent';
import ls from 'local-storage';

const cardStyle = {
  marginBottom: '10px',
  width: '360px',
  marginLeft: 'auto',
  marginRight: 'auto'
};

const opts = {
  height: '150',
  width: '360'
};

const cardActionsStyle = {
  textAlign: 'center'
};

const snackbarHideDuration = 1800;


class YoutubeVideo extends Component {

  constructor(props) {
    super(props);
    this.state = {
      videoAddedSnackbarOpen: false,
      errorSnackbarOpen: false
    };
  }

  componentDidMount() {
    var iframe = ReactDOM.findDOMNode(this.refs.ytIframe);
  }

  _addToPlaylist() {
    var playlistId = this.props.playlistId;
    var token = this.props.oauthToken;

    this.setState({
      waitingForYoutube: true
    });

    superagent.post('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet')
      .set('Authorization', 'Bearer ' + token)
      .send({
        snippet: {
          playlistId: playlistId,
          resourceId: this.props.data.id
        }
      })
      .end((err, res) => {
        this.setState({
          waitingForYoutube: false
        });

        if(err) {
          this.setState({
            errorSnackbarOpen: true
          });

          _gaq.push(['_trackEvent', 'Errors', 'new', 'Auth error']);
        } else {
          this.setState({
            videoAddedSnackbarOpen: true
          });

          _gaq.push(['_trackEvent', 'UserActions', 'video_add', 'Added video to playlist']);
        }
      }.bind(this));
  }

  _handleVideoAddedSnackbarClose() {
    this.setState({
      videoAddedSnackbarOpen: false
    });
  }

  _handleErrorSnackbarClose() {
    this.setState({
      errorSnackbarOpen: false
    });
  }

  render() {
    return (
      <Card style={cardStyle} className="youtube-video-card">
        <CardMedia>
          <div className="videoWrapper">
            <iframe
              ref="ytIframe"
              src={"https://www.youtube.com/embed/" + this.props.data.id.videoId}
              width={opts.width}
              height={opts.height}
              frameBorder="0"
              allowFullScreen></iframe>
          </div>
        </CardMedia>
        <CardActions>
          <div>
            <CardTitle subtitle={this.props.data.snippet.title}/>
            <div style={cardActionsStyle}>
              <RaisedButton secondary={true} disabled={this.state.waitingForYoutube} label="Add to playlist" onClick={this._addToPlaylist.bind(this)} />
              <Snackbar open={this.state.videoAddedSnackbarOpen} onRequestClose={this._handleVideoAddedSnackbarClose.bind(this)} message="Video added successfully." autoHideDuration={snackbarHideDuration} />
              <Snackbar open={this.state.errorSnackbarOpen} onRequestClose={this._handleVideoAddedSnackbarClose.bind(this)} message="There was an error. Please try again." autoHideDuration={snackbarHideDuration} />
            </div>
          </div>
        </CardActions>
      </Card>
    );
  };

};

export default YoutubeVideo;
