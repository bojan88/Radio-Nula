import React from 'react';
import mui from 'material-ui';

import superagent from 'superagent';

var DropDownMenu = mui.DropDownMenu;


const playlistDropdownStyle = {
  marginTop: '10px'
};

class PlayLists extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    var queryURL = 'https://www.googleapis.com/youtube/v3/playlists?part=snippet&mine=true';

    var getLists = function getLists() {
      chrome.storage.local.get('token', (storageObj) => {
        superagent.get(queryURL)
          .set('Authorization', 'Bearer ' + storageObj.token)
          .end((err, res) => {
            if(err) {
              this.timeout = setTimeout(() => {
                getLists.bind(this)();
              }.bind(this), 500);
            }
            var resObj = JSON.parse(res.text);
            this.setState({
              playlists: resObj.items
            });
            this.props.setPlaylist(this.state.playlists[0].id);
          }.bind(this));
      }.bind(this));
    }.bind(this)()
  };

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  render() {
    return (
      <div>
        {this.state.playlists ? <DropDownMenu
          menuItems={this.state.playlists.map((list) => {
            return {
              payload: list.id,
              text: list.snippet.title
            }
          })}
          onChange={(e, ind) => {this.props.setPlaylist(this.state.playlists[ind].id)}}
          style={playlistDropdownStyle} /> : null}
      </div>
    );
  };

};

export default PlayLists;
