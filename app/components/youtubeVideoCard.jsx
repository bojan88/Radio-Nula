import React from 'react';
import mui from 'material-ui';

var Card = mui.Card;
var CardText = mui.CardText;
var CardMedia = mui.CardMedia;
var CardTitle = mui.CardTitle;

var cardStyle = {
  marginBottom: '10px'
};

class YoutubeVideoCard extends React.Component {


  render() {
    console.log(this.props.data);
    return (
      <Card style={cardStyle}>
        <CardMedia overlay={<CardTitle title={this.props.data.snippet.title}/>}>
          <img src={this.props.data.snippet.thumbnails.medium.url}/>
        </CardMedia>
        <CardText>{this.props.data.snippet.description}</CardText>
      </Card>
    );
  };

};

export default YoutubeVideoCard;
