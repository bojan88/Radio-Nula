import React from 'react';
import mui from 'material-ui';
import ls from 'local-storage';

import superagent from 'superagent';

var DropDownMenu = mui.DropDownMenu;


const playlistDropdownStyle = {
  marginTop: '10px'
};

class PlayLists extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedListInd: ls('selectedListInd') || 0
    };
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
            var listInd = this.state.selectedListInd || 0;
            this.props.setPlaylist(this.state.playlists[listInd].id);
          }.bind(this));
      }.bind(this));
    }.bind(this)()
  };

  componentWillUnmount() {
    clearTimeout(this.timeout);
  };

  _onDropdownChange(e, ind) {
    this.props.setPlaylist(this.state.playlists[ind].id);
    this.setState({
      selectedListInd: ind
    });
    ls('selectedListInd', ind);
  };

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
          onChange={this._onDropdownChange.bind(this)}
          selectedIndex={this.state.selectedListInd}
          style={playlistDropdownStyle} /> : null}
      </div>
    );
  };

};

export default PlayLists;
