import React from 'react';
import mui from 'material-ui';

import FoundVideos from './foundVideos.jsx';
import PlayLists from './playLists.jsx';

import injectTapEventPlugin from "react-tap-event-plugin";

var ThemeManager = new mui.Styles.ThemeManager();

var Tabs = mui.Tabs;
var Tab = mui.Tab;

class Home extends React.Component {

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

  render() {
    return <Tabs>
      <Tab label="Search" >
        <FoundVideos />
      </Tab>
      <Tab label="Item Two" >
        <div>
          <h2>Tab Two Template Example</h2>
          <p>This is another example of a tab template!</p>
          <p>Fair warning - the next tab routes to home!</p>
        </div>
      </Tab>
    </Tabs>;
  };

};

export default Home;
