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

  _onChange() {
    this.setState({
      renderSearch: true
    })
  };

  render() {
    var foundVideos = this.state.renderSearch ? <FoundVideos /> : null;
    return (
      <Tabs onChange={this._onChange.bind(this)}>
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
