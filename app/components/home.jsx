import React from 'react';
import mui from 'material-ui';

import FoundVideos from './foundVideos.jsx';
import NulaCard from './nulaCard.jsx';

import injectTapEventPlugin from "react-tap-event-plugin";

var ThemeManager = new mui.Styles.ThemeManager();

var Tabs = mui.Tabs;
var Tab = mui.Tab;

class Home extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      renderSearch: false
    };
  }

  static get childContextTypes() {
    return {
      muiTheme: React.PropTypes.object
    };
  }

  getChildContext() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    };
  };

  componentWillMount() {
    injectTapEventPlugin();
  };

  _onTabChange(value) {
    if(value === 1) {
      this.setState({
        renderSearch: true
      });
    } else {
      this.setState({
        renderSearch: false
      });
    }
  };

  render() {
    var foundVideos = this.state.renderSearch ? <FoundVideos /> : null;
    return (
      <Tabs onChange={this._onTabChange.bind(this)}>
        <Tab label="Nula Player" >
          <NulaCard />
        </Tab>
        <Tab label="Youtube Search" >
          {foundVideos}
        </Tab>
      </Tabs>
    );
  };

};

export default Home;
