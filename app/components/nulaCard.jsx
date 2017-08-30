"use strict";

import React, {Component} from 'react';
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
import ls from 'local-storage';

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
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)'
};

const volumeWrapperStyle = {
  margin: '10px 75px 0 75px',
  width: '250px'
};

const volumeStyle = {
  margin: '0'
};

const snackbarHideDuration = 1800;

class NulaCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      playing: false,
      loading: false,
      errorSnackbarOpen: false
    };
  }

  _updateNulaData() {
    superagent.get('http://socket.radionula.com/playlist').end((err, res) => {
      if(err) {
        this.setState({
          errorSnackbarOpen: true
        });
        clearInterval(this.nulaHandler);
        return;
      }
      var song = res.body.ch1.currentSong;
      this.setState({
        song: `${song.artist} - ${song.title}`,
        image: song.cover
      });
    });
  }

  componentWillMount() {
    chrome.runtime.sendMessage({action: 'status'}, (response) => {
      this.setState({
        playing: response.playing,
        loading: response.loading,
        volume: response.volume
      });
      this._updateNulaData();
    });
  }

  componentDidMount() {
    this.nulaHandler = setInterval(() => {
      if(!this.state.loading) {
        this._updateNulaData();
      }
    }.bind(this), 5000);

    //background script will send the message when it starts playing
    chrome.extension.onMessage.addListener(
      (request, sender, sendResponse) => {
        if (request.action === 'play_started') {
          this.setState({
            playing: true,
            loading: false,
          });
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

  _onVolumeChange(e, value) {
    chrome.runtime.sendMessage({
      action: 'set_volume',
      volume: value
    });
    this.setState({
      volume: value
    });
  }

  _handleSnackbarClose() {
    this.setState({
      errorSnackbarOpen: false
    })
  }

  render() {
    var playPauseButton;

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
        <CardMedia overlay={<CardTitle title={this.state.song} />}>
          <div style={mediaWrapperStyle}>
            {this.state.image && !this.state.loading ?
              <img src={this.state.image} style={mediaImgStyle} className={vinylClass} /> :
              <CircularProgress style={imgLoadingStyle} mode="indeterminate" size={120} />}
          </div>
        </CardMedia>
        <div style={btnWrapperStyle}>
          <div>
            {playPauseButton}
          </div>
          <div style={volumeWrapperStyle} >
            <Slider name="volume" max={1} min={0} step={0.01} onChange={this._onVolumeChange.bind(this)} style={volumeStyle} value={this.state.volume} />
          </div>
        </div>
        <Snackbar message="There was an error reading the playlist. Please try again." autoHideDuration={snackbarHideDuration} open={this.state.errorSnackbarOpen} onRequestClose={this._handleSnackbarClose.bind(this)} />
      </Card>
    );
  };

};

export default NulaCard;
