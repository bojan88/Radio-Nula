import React from 'react';
import mui from 'material-ui';
import YoutubeVideo from './youtubeVideo.jsx';

var CircularProgress = mui.CircularProgress;

const progressStyle = {
  display: 'table',
  marginLeft: 'auto',
  marginRight: 'auto',
  marginTop: '50px',
  marginBottom: '50px'
}

const ulStyle = {
  padding: 0
};

class VideoList extends React.Component {

  constructor(props) {
    super(props);
  };

  render() {
    var videosHtml;

    if(this.props.loading) {
      videosHtml = <CircularProgress mode="indeterminate"  style={progressStyle} />
    } else {
      if(this.props.videos && this.props.videos.length > 0) {
        videosHtml = (
          <ul style={ulStyle} className="youtube-list">
            {this.props.videos && this.props.videos.map(function(result, ind) {
              return <YoutubeVideo key={result.id.videoId} data={result} ind={ind} />;
            })}
          </ul>
        );
      } else {
        videosHtml = <p>There are no results for <strong>{this.props.song}</strong></p>;
      }
    }

    return (
      <div>
        {videosHtml}
      </div>
    );
  };

};

export default VideoList;
