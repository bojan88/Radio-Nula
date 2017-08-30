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
    _gaq.push(['_trackEvent', 'Tabs', 'change', 'Youtube card']);
  }
  
  _onNulaTabActive() {
    this.setState({renderSearch: false});
    _gaq.push(['_trackEvent', 'Tabs', 'change', 'Nula card']);
  }

  componentDidMount() {
    window._gaq = window._gaq || [];
    _gaq.push(['_setAccount', 'UA-44229153-5']);
    _gaq.push(['_trackPageview']);
    (function() {
      var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
      ga.src = 'https://ssl.google-analytics.com/ga.js';
      var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    })();
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
