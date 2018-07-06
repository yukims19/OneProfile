import React, { Component } from 'react';
import Button from 'antd/lib/button';
import './App.css';
import { Tabs, Icon } from 'antd';

const TabPane = Tabs.TabPane;


class App extends Component {
  render() {
    return (
      <div className="App">
            <Tabs defaultActiveKey="1">
            <TabPane tab={<span>General</span>} key="1">
            Tab 1
            </TabPane>
            <TabPane tab={<span><Icon type="github" />Github</span>} key="2">
            Tab 2
        </TabPane>
            <TabPane tab={<span><Icon type="youtube" />Youtube</span>} key="3">
            Tab 3
        </TabPane>
            <TabPane tab={<span><Icon type="twitter" />Twitter</span>} key="4">
            Tab 4
        </TabPane>
            </Tabs>
       </div>
    );
  }
}
    <Icon type="github" />



export default App;
