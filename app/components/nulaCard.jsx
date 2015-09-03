import React from 'react';
import mui from 'material-ui';
import superagent from 'superagent';
import {parseString} from 'xml2js';
import ls from 'local-storage';
import rssUrls from '../constants/rssUrls';

var Card = mui.Card;
var CardMedia = mui.CardMedia;
var CardTitle = mui.CardTitle;
var CardActions = mui.CardActions;
var FloatingActionButton = mui.FloatingActionButton;
var FontIcon = mui.FontIcon;
var CircularProgress = mui.CircularProgress;
var Snackbar = mui.Snackbar;

const cardStyle = {
  marginTop: '20px',
  marginBottom: '20px'
};

const btnWrapperStyle = {
  textAlign: 'center',
  paddingTop: '20px',
  paddingBottom: '20px'
};

const shiftBtnStyle = {
  marginRight: '20px'
};

const mediaWrapperStyle = {
  height: '400px'
};

const mediaImgStyle = {
  width: '100%',
  height: '100%',
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
  width: '34px',
  height: '34px',
  position: 'absolute',
  top: '50%',
  left: '50%',
  margin: '-17px 0 0 -17px'
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
  };

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
  };

  componentWillMount() {
    chrome.runtime.sendMessage({action: 'status'}, (response) => {
      if(response.status === 'status') {
        this.setState({
          playing: response.playing,
          loading: response.loading,
          channelInd: response.channelInd
        });
        ls('channelInd', response.channelInd);
        this._updateNulaData();
      }
    });
  };

  componentDidMount() {
    this.nulaHandler = setInterval(() => {
      //disable if the channel is changing
      if(!this.state.loading) {
        this._updateNulaData();
      }
    }.bind(this), 5000);

    //background script will send the message when it starts playing
    chrome.extension.onMessage.addListener(
      function (request, sender, sendResponse) {
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
          this.refs.errSnackbar.show();
        }
      }.bind(this)
    );
  };

  componentWillUnmount() {
    clearInterval(this.nulaHandler);
  };

  _play() {
    chrome.runtime.sendMessage({action: 'play'});
    this.setState({
      loading: true
    });
  };

  _pause() {
    chrome.runtime.sendMessage({action: 'pause'}, (response) => {
      if(response.status === 'paused') {
        this.setState({
          playing: false
        });
      }
    });
  };

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

  render() {
    var btn;

    var shiftBtn = (
      <div>
        <img src="images/ico_shift2x.png" style={shiftImgStyle} />
      </div>
    );

    if(this.state.playing) {
      btn = (
        <div>
          <FloatingActionButton style={shiftBtnStyle} onClick={this._shift.bind(this)} label="Shift" secondary={true}>
            {shiftBtn}
          </FloatingActionButton>
          <FloatingActionButton onClick={this._pause.bind(this)} label="Pause">
            <FontIcon className="material-icons">pause</FontIcon>
          </FloatingActionButton>
        </div>
      );
    } else{
      btn = (
        <div>
          <FloatingActionButton style={shiftBtnStyle} onClick={this._shift.bind(this)} label="Shift" secondary={true}>
            {shiftBtn}
          </FloatingActionButton>
          <FloatingActionButton onClick={this._play.bind(this)} label="Play" secondary={true}>
            <FontIcon className="material-icons">play_arrow</FontIcon>
          </FloatingActionButton>
        </div>
      );
    }

    if(this.state.loading) {
      btn = (
        <CircularProgress mode="indeterminate" size={0.8} />
      );
    }

    var vinylClass = this.state.playing ? 'rotating' : null;

    return (
      <Card style={cardStyle}>
        <CardMedia overlay={<CardTitle title={this.state.song}/>}>
          <div style={mediaWrapperStyle}>
            {this.state.image ? <img src={this.state.image} style={mediaImgStyle} className={vinylClass} /> : <CircularProgress style={imgLoadingStyle} mode="indeterminate" size={0.8} />}
          </div>
        </CardMedia>
        <div style={btnWrapperStyle}>
          {btn}
        </div>
        <Snackbar message="There was an error. Please try again." autoHideDuration={snackbarHideDuration} ref="errSnackbar" />
      </Card>
    );
  };

};

export default NulaCard;
