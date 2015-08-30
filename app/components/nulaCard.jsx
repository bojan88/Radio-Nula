import React from 'react';
import mui from 'material-ui';
import superagent from 'superagent';
import {parseString} from 'xml2js';
import ls from 'local-storage';

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

const snackbarHideDuration = 1800;

const rssUrls = [
  'http://www.radionula.com/rss.xml',
  'http://www.radionula.com/rss_ch2.xml',
  'http://www.radionula.com/rss_ch3.xml'
]

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
          loading: response.loading
        });
      }
    });

    this._updateNulaData();
  };

  componentDidMount() {
    this.nulaHandler = setInterval(() => {
      this._updateNulaData();
    }.bind(this), 5000);

    //background script will send the message when it starts playing
    chrome.extension.onMessage.addListener(
      function (request, sender, sendResponse) {
        if (request.action === 'play_started') {
          if(request.channelInd !== this.state.channelInd) {
            this._updateNulaData();
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
    this.setState({
      loading: true
    });
    chrome.runtime.sendMessage({action: 'shift'}, (response) => {});
  }

  render() {
    var btn;

    if(this.state.playing) {
      btn = (
        <div>
          <FloatingActionButton style={shiftBtnStyle} onClick={this._shift.bind(this)} label="Shift" secondary={true}>
            <FontIcon className="material-icons">skip_next</FontIcon>
          </FloatingActionButton>
          <FloatingActionButton onClick={this._pause.bind(this)} label="Pause">
            <FontIcon className="material-icons">pause</FontIcon>
          </FloatingActionButton>
        </div>
      );
    } else{
      btn = (
        <FloatingActionButton onClick={this._play.bind(this)} label="Play" secondary={true}>
          <FontIcon className="material-icons">play_arrow</FontIcon>
        </FloatingActionButton>
      );
    }

    if(this.state.loading) {
      btn = (
        <CircularProgress mode="indeterminate" size={0.8} />
      );
    }
    return (
      <Card style={cardStyle}>
        <CardMedia overlay={<CardTitle title={this.state.song}/>}>
          <img src={this.state.image}/>
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
