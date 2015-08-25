import React from 'react';
import mui from 'material-ui';

var Card = mui.Card;
var CardMedia = mui.CardMedia;
var CardTitle = mui.CardTitle;
var CardActions = mui.CardActions;
var RaisedButton = mui.RaisedButton;

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
              <RaisedButton secondary={true} label="Add" />
            </div>
          </div>
        </CardActions>
      </Card>
    );
  };

};

export default YoutubeVideo;
