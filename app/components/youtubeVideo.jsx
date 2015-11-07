"use strict";

import React from 'react';
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


class YoutubeVideo extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    var iframe = React.findDOMNode(this.refs.ytIframe);
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
          this.refs.snackbarError.show();
        } else {
          this.refs.snackbarSuccess.show();
        }
      }.bind(this));
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
              showinfo="0"
              allowFullScreen></iframe>
          </div>
        </CardMedia>
        <CardActions>
          <div>
            <CardTitle subtitle={this.props.data.snippet.title}/>
            <div style={cardActionsStyle}>
              <RaisedButton secondary={true} disabled={this.state.waitingForYoutube} label="Add to playlist" onClick={this._addToPlaylist.bind(this)} />
              <Snackbar message="Video added successfully." autoHideDuration={snackbarHideDuration} ref="snackbarSuccess" />
              <Snackbar message="There was an error. Please try again." autoHideDuration={snackbarHideDuration} ref="snackbarError" />
            </div>
          </div>
        </CardActions>
      </Card>
    );
  };

};

export default YoutubeVideo;
