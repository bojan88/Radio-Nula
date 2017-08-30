"use strict";

import React, {Component} from 'react';
import {DropDownMenu, MenuItem} from 'material-ui';
import ls from 'local-storage';

import superagent from 'superagent';

const playlistDropdownStyle = {
  width: '100%',
  textAlign: 'center'
};

class PlayLists extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedListInd: ls('selectedListInd') || 0
    };
  }

  componentWillMount() {
    var queryURL = 'https://www.googleapis.com/youtube/v3/playlists?part=snippet&mine=true';

    //TODO: replace this with self invoked es6 function
    //return arguments.callee ?
    var getLists = function getLists() {
      var token = this.props.oauthToken;
      if(!token) {
        this.timeout = setTimeout(() => {
          getLists.bind(this)();
        }.bind(this), 100);
      } else {
        superagent.get(queryURL)
          .set('Authorization', 'Bearer ' + token)
          .end((err, res) => {
            if(err) {
              if(err.status === 401) {
                chrome.identity.removeCachedAuthToken({token: token}, () => {
                  this.props.updateToken(() => {
                    getLists.bind(this)();
                  }.bind(this));
                }.bind(this));

                _gaq.push(['_trackEvent', 'Errors', 'new', 'Auth error']);
              }
              console.log('Error getting YouTube playlists with status code ' + err.status);
              return;
            }

            clearTimeout(this.timeout);
            this.setState({
              playlists: res.body.items
            });
            var listInd = this.state.selectedListInd || 0;
            this.props.setPlaylist(this.state.playlists[listInd].id);
          }.bind(this));
      }
    }.bind(this)();
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  _onDropdownChange(e, ind) {
    this.props.setPlaylist(this.state.playlists[ind].id);
    this.setState({
      selectedListInd: ind
    });
    ls('selectedListInd', ind);
  }



  render() {
    return (
      <div>
        <DropDownMenu
          onChange={this._onDropdownChange.bind(this)}
          autoWidth={false}
          style={playlistDropdownStyle}
          value={this.state.selectedListInd}>
          {this.state.playlists && this.state.playlists.map((list, ind) => {
            return <MenuItem value={ind} key={ind} primaryText={list.snippet.title} />;
          })}
        </DropDownMenu>
      </div>
    );
  };

};

export default PlayLists;
