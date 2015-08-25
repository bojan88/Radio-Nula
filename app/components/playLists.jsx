import React from 'react';
import mui from 'material-ui';

import superagent from 'superagent';

var DropDownMenu = mui.DropDownMenu;

var menuItems = [
  { payload: '1', text: 'Test' }
];

const playlistDropdownStyle = {
  float: 'left',
  marginTop: '10px'
};

class PlayLists extends React.Component {

  componentWillMount() {
    var queryURL = 'https://www.googleapis.com/youtube/v3/playlists?part=snippet&mine=true';

//    superagent.get(queryURL)
//      .end((err, res) => {
//        var resObj = JSON.parse(res.text);
//        console.log(resObj);
//      }.bind(this));
  };

  render() {
    return (
      <DropDownMenu menuItems={menuItems} style={playlistDropdownStyle} />
    );
  };

};

export default PlayLists;
