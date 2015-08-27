import React from 'react';
import mui from 'material-ui';
import superagent from 'superagent';

var Card = mui.Card;
var CardMedia = mui.CardMedia;
var CardTitle = mui.CardTitle;
var CardActions = mui.CardActions;
var RaisedButton = mui.RaisedButton;
var Snackbar = mui.Snackbar;

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


class YoutubeVideo extends React.Component {

  componentDidMount() {
    var iframe = React.findDOMNode(this.refs.ytIframe);
  };

  _addToPlaylist() {
    var playlistId = this.props.playlistId;

    chrome.storage.local.get('token', (storageObj) => {
      superagent.post('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet')
        .set('Authorization', 'Bearer ' + storageObj.token)
        .send({
          snippet: {
            playlistId: playlistId,
            resourceId: this.props.data.id
          }
        })
        .end((err, res) => {
          if(err) {
            this.refs.snackbarError.show();
          } else {
            this.refs.snackbarSuccess.show();
          }
        }.bind(this));
    }.bind(this));
  };

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
              <RaisedButton secondary={true} label="Add" onClick={this._addToPlaylist.bind(this)} />
              <Snackbar message="Video added successfully." autoHideDuration="1800" ref="snackbarSuccess" />
              <Snackbar message="There was an error. Please try again." autoHideDuration="1800" ref="snackbarError" />
            </div>
          </div>
        </CardActions>
      </Card>
    );
  };

};

export default YoutubeVideo;
