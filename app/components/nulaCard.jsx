"use strict";

import React from 'react';
import {
  Card,
  CardMedia,
  CardTitle,
  CardActions,
  FloatingActionButton,
  FontIcon,
  CircularProgress,
  Snackbar,
  Slider
} from 'material-ui';
import superagent from 'superagent';
import {parseString} from 'xml2js';
import ls from 'local-storage';
import rssUrls from '../constants/rssUrls';

const cardStyle = {
  marginTop: '10px',
};

const btnWrapperStyle = {
  textAlign: 'center',
  paddingTop: '10px',
  paddingBottom: '10px',
  userSelect: 'none',
  WebkitUserSelect: 'none'
};

const shiftBtnStyle = {
  marginRight: '20px'
};

const mediaWrapperStyle = {
  height: '400px',
  backgroundColor: '#28282A',
  userSelect: 'none',
  WebkitUserSelect: 'none'
};

const mediaImgStyle = {
  width: '80%',
  height: '80%',
  margin: '10% 0 0 10%',
  borderRadius: '100%'
};

const imgLoadingStyle = {
  marginTop: '175px',
  marginBottom: '175px',
  marginLeft: '50%',
  position: 'relative',
  left: '-25px',
  top: '-25px'
};

const shiftImgStyle = {
  width: '28px',
  height: '28px',
  position: 'absolute',
  top: '50%',
  left: '50%',
  margin: '-14px 0 0 -14px'
};

const volumeWrapperStyle = {
  margin: '10px 75px 0 75px',
  width: '250px'
};

const volumeStyle = {
  margin: '0'
};

const snackbarHideDuration = 1800;

class NulaCard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      playing: false,
      loading: false,
      channelInd: ls('channelInd') || 0
    };
  }

  _updateNulaData() {
    superagent.get(rssUrls[this.state.channelInd]).end((err, res) => {
      if(err) {
        this.refs.errSnackbar.show();
        clearInterval(this.nulaHandler);
        return;
      }
      parseString(res.text, (err, res) => {
        var song = res.rss.channel[0].item[0].title[0];
        var image = res.rss.channel[0].item[0].image[0].url[0];
        this.setState({
          song: song,
          image: image
        });
      });
    });
  }

  componentWillMount() {
    chrome.runtime.sendMessage({action: 'status'}, (response) => {
      this.setState({
        playing: response.playing,
        loading: response.loading,
        channelInd: response.channelInd,
        volume: response.volume
      });
      ls('channelInd', response.channelInd);
      this._updateNulaData();
    });
  }

  componentDidMount() {
    this.nulaHandler = setInterval(() => {
      //disable if the channel is changing
      if(!this.state.loading) {
        this._updateNulaData();
      }
    }.bind(this), 5000);

    //background script will send the message when it starts playing
    chrome.extension.onMessage.addListener(
      (request, sender, sendResponse) => {
        if (request.action === 'play_started') {
          if(request.channelInd !== this.state.channelInd) {
            this.setState({
              image: null,
              song: null
            });
            setTimeout(() => {
              this._updateNulaData();
            }.bind(this), 0);
          }
          this.setState({
            playing: true,
            loading: false,
            channelInd: request.channelInd
          });
          ls('channelInd', this.state.channelInd);
        } else if(request.action === 'error') {
          this.setState({
            loading: false
          });
          this.refs.errSnackbar.show();
        }
      }.bind(this)
    );
  }

  componentWillUnmount() {
    clearInterval(this.nulaHandler);
  }

  _play() {
    chrome.runtime.sendMessage({action: 'play'});
    this.setState({
      loading: true
    });
  }

  _pause() {
    chrome.runtime.sendMessage({action: 'pause'}, (response) => {
      if(response.status === 'paused') {
        this.setState({
          playing: false,
          loading: false
        });
      }
    });
  }

  _shift() {
    if(this.state.playing) {
      this.setState({
        loading: true
      });
    } else {
      var newChannelInd = (this.state.channelInd + 1) % 3;
      this.setState({
        channelInd: newChannelInd
      });
      ls('channelInd', newChannelInd);
      this.setState({
        image: null,
        song: null
      });
      setTimeout(() => {
        this._updateNulaData();
      }.bind(this), 0);
    }
    chrome.runtime.sendMessage({action: 'shift'});
  }

  _onVolumeChange(e, value) {
    chrome.runtime.sendMessage({
      action: 'set_volume',
      volume: value
    });
    this.setState({
      volume: value
    });
  }

  render() {
    var playPauseButton;

    var shiftIcon;

    if(this.state.loading) {
      shiftIcon = (
        <div>
          <img src="images/skip_next_animation.gif" style={shiftImgStyle} />
        </div>
      );
    } else {
      shiftIcon = <FontIcon className="material-icons">skip_next</FontIcon>;
    }

    var shiftBtn = (
      <FloatingActionButton style={shiftBtnStyle} onClick={this._shift.bind(this)} label="Shift" secondary={true} disabled={this.state.loading}>
        {shiftIcon}
      </FloatingActionButton>
    );

    if(this.state.playing || this.state.loading) {
      playPauseButton = (
        <FloatingActionButton onClick={this._pause.bind(this)} label="Pause">
          <FontIcon className="material-icons">pause</FontIcon>
        </FloatingActionButton>
      );
    } else{
      playPauseButton = (
        <FloatingActionButton onClick={this._play.bind(this)} label="Play" secondary={true}>
          <FontIcon className="material-icons">play_arrow</FontIcon>
        </FloatingActionButton>
      );
    }

    var vinylClass = this.state.playing ? 'rotating' : null;

    return (
      <Card style={cardStyle}>
        <CardMedia overlay={<CardTitle title={this.state.song} subtitle={"Channel " + (this.state.channelInd + 1)} />}>
          <div style={mediaWrapperStyle}>
            {this.state.image ? <img src={this.state.image} style={mediaImgStyle} className={vinylClass} /> : <CircularProgress style={imgLoadingStyle} mode="indeterminate" size={0.8} />}
          </div>
        </CardMedia>
        <div style={btnWrapperStyle}>
          <div>
            {shiftBtn}
            {playPauseButton}
          </div>
          <div style={volumeWrapperStyle} >
            <Slider name="volume" max={1} min={0} step={0.01} onChange={this._onVolumeChange.bind(this)} style={volumeStyle} value={this.state.volume} />
          </div>
        </div>
        <Snackbar message="There was an error. Please try again." autoHideDuration={snackbarHideDuration} ref="errSnackbar" />
      </Card>
    );
  };

};

export default NulaCard;
