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
  eventil {
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

class EventilInfo extends Component{
    render(){
        return(
                <Query query={GET_GeneralInfo}>
                {({loading, error, data}) => {
                    console.log(data.eventil);

                    if (loading) return <div>Loading...</div>;
                    if (error) return <div>Uh oh, something went wrong!</div>;
                    return (
                            <div>
                            <div className="container">
                            <div className="row">
                            <div className="col-md-4">
                            Image
                        </div>
                            <div className="col-md-8">
                            <h4>{data.eventil.user.name}</h4>
                            <small><cite title={data.eventil.user.profile.location}>{data.eventil.user.profile.location} <i className="fas fa-map-marker-alt">
                            </i></cite></small>
                            <p>
                            <i className="fas fa-envelope"></i> email@example.com
                            <br />
                            <i className="fas fa-globe"></i><a href="#"> {data.eventil.user.profile.website}</a>
                            <br />
                            <i className="fab fa-github-square"></i><a href="#"> {data.eventil.user.profile.github}</a>
                            <br />
                            <i className="fab fa-twitter-square"></i><a href="#"> {data.eventil.user.profile.twitter}</a>
                            <br />
                            <i className="fab fa-reddit-square"></i><a href="#"> {data.eventil.user.profile.reddit}</a>
                            <br />
                            <i className="fab fa-linkedin"></i><a href="#"> {data.eventil.user.profile.linkedin}</a>
                            <br />
                            </p>
                            </div>
                            </div>
                            </div>
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
            onClick={this.props.onClick}>
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
        this.isLoggedIn('eventil');
        this.isLoggedIn('github');
        this.isLoggedIn('youtube');
        this.isLoggedIn('twitter');
    }
    isLoggedIn(event){
        auth.isLoggedIn(event).then(isLoggedIn => {
            this.setState({
                [event]: isLoggedIn
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
            eventil_content = <ApolloProvider client={client}><EventilInfo /></ApolloProvider>;
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
