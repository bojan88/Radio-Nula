import React from 'react';
import mui from 'material-ui';
import superagent from 'superagent';
import {parseString} from 'xml2js';

var Card = mui.Card;
var CardMedia = mui.CardMedia;
var CardTitle = mui.CardTitle;
var CardActions = mui.CardActions;
var FloatingActionButton = mui.FloatingActionButton;
var FontIcon = mui.FontIcon;

const cardStyle = {
  marginTop: '20px',
  marginBottom: '20px'
};

const btnWrapperStyle = {
  textAlign: 'center',
  paddingTop: '20px',
  paddingBottom: '20px'
};

class NulaCard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      playing: false
    };
  };

  _updateNulaData() {
    superagent.get('http://www.radionula.com/rss.xml').end((err, res) => {
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
          playing: !response.value
        });
      }
    });

    this._updateNulaData();
  };

  componentDidMount() {
    this.nulaHandler = setInterval(() => {
      this._updateNulaData();
    }.bind(this), 5000);
  };

  componentWillUnmount() {
    clearInterval(this.nulaHandler);
  };

  _play() {
    chrome.runtime.sendMessage({action: 'play'}, (response) => {
      if(response.status === 'playing') {
        this.setState({
          playing: true
        });
      }
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
  }


  render() {
    return (
      <Card style={cardStyle}>
        <CardMedia overlay={<CardTitle title={this.state.song}/>}>
          <img src={this.state.image}/>
        </CardMedia>
        <div style={btnWrapperStyle}>
          {this.state.playing
            ? <FloatingActionButton onClick={this._pause.bind(this)} label="Pause">
                <FontIcon className="material-icons">pause</FontIcon>
              </FloatingActionButton>
            : <FloatingActionButton onClick={this._play.bind(this)} label="Play" secondary={true}>
                <FontIcon className="material-icons">play_arrow</FontIcon>
              </FloatingActionButton>}
        </div>
      </Card>
    );
  };

};

export default NulaCard;
