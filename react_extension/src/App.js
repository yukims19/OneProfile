import React, { Component } from 'react';
import Button from 'antd/lib/button';
import './App.css';
import { Tabs, Icon } from 'antd';
import {gql} from 'apollo-boost';
import {ApolloClient} from 'apollo-client';
import {HttpLink} from 'apollo-link-http';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {ApolloProvider, Query} from 'react-apollo';


const TabPane = Tabs.TabPane;
const APP_ID = 'e3d209d1-0c66-4603-8d9e-ca949f99506d';

const client = new ApolloClient({
    link: new HttpLink({
        uri: 'https://serve.onegraph.com/dynamic?app_id=' + APP_ID,
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
    }),
    cache: new InMemoryCache(),
});

const GET_VIDEO = gql`
  query {
    youTubeVideo(id: "t6CRZ-iG39g") {
      snippet {
        title
        description
      }
    }
  }
`;

const GeneralInfo = () => (
        <Query query={GET_VIDEO}>
        {({loading, error, data}) => {
            if (loading) return <div>Loading...</div>;
            if (error) return <div>Uh oh, something went wrong!</div>;
            return (
                    <div>
                    We fetched a YouTube video with title:{' '}
                {data.youTubeVideo}
                </div>
            );
        }}
    </Query>
);


class App extends Component {
  render() {
    return (
      <div className="App">
            <Tabs defaultActiveKey="1">
            <TabPane tab={<span>General</span>} key="1">
            <ApolloProvider client={client}>
            <GeneralInfo />
            </ApolloProvider>
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

export default App;
