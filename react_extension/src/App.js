import React, { Component } from 'react';
import './App.css';
import { Tabs, Icon } from 'antd';
import {gql} from 'apollo-boost';
import {ApolloClient} from 'apollo-client';
import {HttpLink} from 'apollo-link-http';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {ApolloProvider, Query} from 'react-apollo';
import OneGraphApolloClient from 'onegraph-apollo-client';
import OneGraphAuth from 'onegraph-auth';

const TabPane = Tabs.TabPane;

const auth = new OneGraphAuth({
    appId: 'e3d209d1-0c66-4603-8d9e-ca949f99506d',
});
const APP_ID = 'e3d209d1-0c66-4603-8d9e-ca949f99506d';

/*
const client = new ApolloClient({
    link: new HttpLink({
        uri: 'https://serve.onegraph.com/dynamic?app_id=' + APP_ID,
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
    }),
    cache: new InMemoryCache(),
});
*/
const client = new OneGraphApolloClient({
    oneGraphAuth: auth,
});

const GET_GeneralInfo = gql`
  query{
  me {
    eventil {
      name
    }
  }
search:eventil {
    user(hackernews:"sgrove") {
      profile {
        description
        hackernews
        location
        linkedin
        twitter
        website
        reddit
        gender
        github
      }
      name
      id
    }
  }

}
`;

class GeneralInfo extends Component{
    render(){
        return(
                <Query query={GET_GeneralInfo}>
                {({loading, error, data}) => {
                    console.log(data.me);
                    if (loading) return <div>Loading...</div>;
                    if (error) return <div>Uh oh, something went wrong!</div>;
                    return (
                            <div>
                            We fetched a YouTube video with title:
                        {data.me.eventil.name}

                            </div>
                    );
                }}
            </Query>
        )
    }
}

class LoginButton extends Component{
    render(){
        return(
                <button
            className={"loginbtn loginbtn-"+ this.props.eventClass}
            onClick={()=>this.props.onClick}>
                <i className={"fab fa-"+this.props.eventClass}></i>
                <span>  </span>Login with {this.props.event}
            </button>
        )
    }

}

class App extends Component {
    constructor(props){
        super(props);
        this.state = {
            eventil: false,
            github: false,
            youtube: false,
            twitter: false,
            };
        auth.isLoggedIn('eventil').then(isLoggedIn => {
            this.setState({
                eventil: isLoggedIn
            })
        });
        auth.isLoggedIn('github').then(isLoggedIn => {
            this.setState({
                github: isLoggedIn
            })
        });
        auth.isLoggedIn('youtube').then(isLoggedIn => {
            this.setState({
                youtube: isLoggedIn
            })
        });
        auth.isLoggedIn('twitter').then(isLoggedIn => {
            this.setState({
                twitter: isLoggedIn
            })
        });
    }
    handleClick(service){
        try {
            auth.login(service).then(() => {
                auth.isLoggedIn(service).then(isLoggedIn => {
                    if (isLoggedIn) {
                        console.log('Successfully logged in to ' + service);
                        this.setState({
                            [service]: isLoggedIn
                        });
                    } else {
                        console.log('Did not grant auth for service ' + service);
                        this.setState({
                            service: isLoggedIn
                        });
                    }
                });
            });
        } catch (e) {
            console.error('Problem logging in', e);
        }
    }
    renderButton(eventTitle, eventClass){
        return(
            <LoginButton
        event= {eventTitle}
        eventClass= {eventClass}
            onClick={()=>this.handleClick(eventClass)} />
        );
    }

    render() {
        var eventil_content;
        var github_content;
        var youtube_content;
        var twitter_content;

        if(this.state.eventil){
            eventil_content = "eventil content";
        }else{
            eventil_content = this.renderButton("Eventil", "eventil");
        }
        if(this.state.github){
            github_content = "content";
        }else{
            github_content = this.renderButton("Github", "github");
        }
        if(this.state.youtube){
            youtube_content = "content";
        }else{
            youtube_content = this.renderButton("YouTube", "youtube");
        }
        if(this.state.twitter){
            twitter_content = "content";
        }else{
            twitter_content = this.renderButton("Twitter", "twitter");
        }

    return (
            <div className="App">
            <Tabs defaultActiveKey="1">
            <TabPane tab={<span>General</span>} key="1">
            <div className="tab-content" id="general-content">
            <ApolloProvider client={client}>
            <GeneralInfo />
            </ApolloProvider>
            {eventil_content}
            </div>
            </TabPane>
            <TabPane tab={<span><Icon type="github" />Github</span>} key="2">
            <div className="tab-content" id="github-content">
            {github_content}
            </div>
        </TabPane>
            <TabPane tab={<span><Icon type="youtube" />Youtube</span>} key="3">
            <div className="tab-content" id="youtube-content">
            {youtube_content}
            </div>
        </TabPane>
            <TabPane tab={<span><Icon type="twitter" />Twitter</span>} key="4">
            <div className="tab-content" id="twitter-content">
            {twitter_content}
            </div>
        </TabPane>
            </Tabs>
       </div>
    );
  }
}

export default App;
