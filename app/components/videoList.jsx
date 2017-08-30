"use strict";

import React, {Component} from 'react';
import {CircularProgress} from 'material-ui';
import YoutubeVideo from './youtubeVideo.jsx';
import ScrollArea from 'react-scrollbar';

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

class VideoList extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    var videosHtml;

    if(this.props.loading) {
      videosHtml = <CircularProgress mode="indeterminate"  style={progressStyle} />
    } else {
      if(this.props.videos && this.props.videos.length > 0) {
        videosHtml = (
          <ScrollArea
            speed={0.8}
            className="area"
            contentClassName="content"
            horizontal={false}
            >
              <ul style={ulStyle} className="youtube-list">
                {this.props.videos && this.props.videos.map((result, ind) => {
                  return <YoutubeVideo key={result.id.videoId} data={result} ind={ind} playlistId={this.props.playlistId} oauthToken={this.props.oauthToken} />;
                })}
              </ul>
          </ScrollArea>
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
