"use strict";

import React, {Component, PropTypes} from 'react';
import {Tab, Tabs, Styles} from 'material-ui';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import FoundVideos from './foundVideos.jsx';
import NulaCard from './nulaCard.jsx';

class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
      renderSearch: false
    };
  }

  _onYoutubeTabActive() {
    this.setState({renderSearch: true});
  }
  
  _onNulaTabActive() {
    this.setState({renderSearch: false});
  }

  componentWillMount() {
  }

  render() {
    var foundVideos = this.state.renderSearch ? <FoundVideos /> : null;
    return (
      <MuiThemeProvider>
        <Tabs>
          <Tab label="Nula Player" onActive={this._onNulaTabActive.bind(this)}>
            <NulaCard />
          </Tab>
          <Tab label="Youtube Search" onActive={this._onYoutubeTabActive.bind(this)}>
            {foundVideos}
          </Tab>
        </Tabs>
      </MuiThemeProvider>
    );
  };

};

export default Home;
