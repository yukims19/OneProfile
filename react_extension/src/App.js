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

const GET_TwitterQuery = gql`
query {
  eventil {
    user(github: "sgrove") {
      profile {
        gitHubUser {
          avatarUrl
        }
        twitterTimeline {
          tweets {
            user {
              screenName
              name
            }
            entities {
              urls {
                url
              }
            }
            favoriteCount
            video {
              id
            }
            createdAt
            text
            idStr
          }
        }
      }
    }
  }
}
`;

class TwitterInfo extends Component{
    render(){
        return(
                <Query query={GET_TwitterQuery}>
                {({loading, error, data}) => {
                    if (loading) return <div>Loading...</div>;
                    if (error) return <div>Uh oh, something went wrong!</div>;
                    return (
                            <div>
                        {data.eventil.user.profile.twitterTimeline.tweets.map((item)=>{
                                return(
                                        <div className="card">
                                        <div className="card-body">
                                        <img src={data.eventil.user.profile.gitHubUser.avatarUrl
                                                 /*Need to replace with twitter avatarUrl*/} />
                                        <div className="names">
                                        <h5 className="card-title"><a href={"https://twitter.com/"+item.user.screenName}>{item.user.name}</a></h5>
                                        <p>@{item.user.screenName}</p>
                                        </div>
                                        <a href={"https://twitter.com/"+item.user.screenName+"/status/"+item.idStr}><i className="fab fa-twitter twittericon"></i></a>
                                        <p className="card-text">{item.text}<br/>
                                        <span>{(item.createdAt.split(" ")[3].split(":")[0] > 12)?
                                               (item.createdAt.split(" ")[3].split(":")[0]-12 +":"+item.createdAt.split(" ")[3].split(":")[1]+" PM"):
                                               (item.createdAt.split(" ")[3].split(":").slice(0,2).join(":")+" AM")

                                              }</span>
                                        <span>{" - "+item.createdAt.split(" ").slice(1,3).join(" ")+" "+item.createdAt.split(" ")[item.createdAt.split(" ").length-1]}</span>
                                        </p>
                                        <div className="card-bottom">
                                        <p><i className="fas fa-heart"></i> {item.favoriteCount}</p>
                                    </div>
                                        </div>
                                        </div>
                                )
                            })}
                            </div>
                    );
                }}
            </Query>
        )
    }
}

const GET_YoutubeQuery = gql`
query {
  eventil {
    user(github: "sgrove") {
      presentations {
        video_url
        youtubeVideo {
          id
        }
      }
    }
  }
}
`;

class YoutubeInfo extends Component{
    render(){
        return(
                <Query query={GET_YoutubeQuery}>
                {({loading, error, data}) => {
                    if (loading) return <div>Loading...</div>;
                    if (error) return <div>Uh oh, something went wrong!</div>;
                    return (
                            <div>
                            {data.eventil.user.presentations.map((item)=>{
                                return(
                                    <div>
                                    {(item.youtubeVideo)?
                                        <iframe src={"http://www.youtube.com/embed/"+item.youtubeVideo.id}
                                     width="560" height="315"></iframe>:" "
                                    }
                                    </div>
                                )
                            })}
                            </div>
                    );
                }}
            </Query>
        )
    }
}

const GET_GithubQuery = gql`
query {
    eventil {
        user(hackernews: "sgrove") {
            id
            profile {
                id
                gitHubUser {
                    id
                    avatarUrl
                    url
                    login
                    followers {
                        totalCount
                    }
                    following {
                        totalCount
                    }
                    repositories(
                        first: 6
                        orderBy: { direction: DESC, field: UPDATED_AT }
                    ) {
                        nodes {
                            id
                            description
                            url
                            name
                            forks {
                                totalCount
                            }
                            stargazers {
                                totalCount
                            }
                            languages(first: 1, orderBy: { field: SIZE, direction: DESC }) {
                                edges {
                                    size
                                    node {
                                        id
                                        color
                                        name
                                    }
                                }
                            }
                        }
                        totalCount
                    }
                }
            }
        }
    }
}
`;

class GithubInfo extends Component{
    render(){
        return(
                <Query query={GET_GithubQuery}>
                {({loading, error, data}) => {
                    if (loading) return <div>Loading...</div>;
                    if (error) {
                        console.log(error);
                        return <div>Uh oh, something went wrong!</div>};
                    return (
                            <div>
                            <div className="container">
                            <div className="row">
                            <div className="col-md-2">
                            <img src={data.eventil.user.profile.gitHubUser.avatarUrl} />
                            </div>
                            <div className="col-md-4 user-info">
                            <h4>{data.eventil.user.profile.gitHubUser.login}</h4>
                            <p className="info-list">
                            Total Repositories: {data.eventil.user.profile.gitHubUser.totalCount}
                            <br />
                            Following: {data.eventil.user.profile.gitHubUser.following.totalCount}
                            <br />
                            Follwer: {data.eventil.user.profile.gitHubUser.followers.totalCount}
                            <br />
                            </p>
                            </div>
                            </div>
                            <div className="row">
                            {data.eventil.user.profile.gitHubUser.repositories.nodes.map((item)=>{
                                return(
                                        <div className="col-md-6">
                                        <div className="card">
                                        <div className="card-body">
                                        <h5 className="card-title"><a href={item.url}>{item.name}</a></h5>
                                        <p className="card-text">{item.description}</p>
                                        <div className="card-bottom">
                                        {(item.languages.edges[0])?
                                         <p><i className="fas fa-circle" style={{color: item.languages.edges[0].node.color}}></i>{item.languages.edges[0].node.name}</p> : " "
                                        }
                                    {(item.stargazers)?
                                     <p><i className="fas fa-star"></i>{item.stargazers.totalCount}</p> : " "
                                    }
                                    {(item.forks)?
                                     <p><i className="fas fa-code-branch"></i>{item.forks.totalCount}</p> : " "
                                    }
                                    </div>
                                        </div>
                                        </div>
                                        </div>)
                            })}
                            </div>
                            </div>
                            </div>
                    );
                }}
            </Query>
        )
    }
}

const GET_GeneralQuery = gql`
query {
  eventil {
    user(hackernews: "sgrove") {
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
        gitHubUser {
          id
          bio
          avatarUrl
          company
          email
          url
          login
        }
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
                <Query query={GET_GeneralQuery}>
                {({loading, error, data}) => {
                    if (loading) return <div>Loading...</div>;
                    if (error) return <div>Uh oh, something went wrong!</div>;
                    return (
                            <div>
                            <div className="container">
                            <div className="row">
                            <div className="col-md-4">
                            <img src={data.eventil.user.profile.gitHubUser.avatarUrl} />
                            </div>
                            <div className="col-md-8">
                            <h4>{data.eventil.user.name}</h4>
                            {data.eventil.user.profile.gitHubUser.company}<br />
                            <small><cite title={data.eventil.user.profile.location}>{data.eventil.user.profile.location} <i className="fas fa-map-marker-alt">
                            </i></cite></small>
                            <p>
                            {data.eventil.user.profile.description}
                            </p>
                            <p className="info-list">
                            <i className="fas fa-envelope"></i> {data.eventil.user.profile.gitHubUser.email}
                            <br />
                            <i className="fas fa-globe"></i> {data.eventil.user.profile.website}
                            <br />
                            <i className="fab fa-github-square"></i> {data.eventil.user.profile.github}
                            <br />
                            <i className="fab fa-twitter-square"></i> {data.eventil.user.profile.twitter}
                            <br />
                            <i className="fab fa-reddit-square"></i> {data.eventil.user.profile.reddit}
                            <br />
                            <i className="fab fa-linkedin"></i> {data.eventil.user.profile.linkedin}
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
            github_content = <ApolloProvider client={client}><GithubInfo /></ApolloProvider>;
        }else{
            github_content = this.renderButton("Github", "github");
        }
        if(this.state.youtube){
            youtube_content = <ApolloProvider client={client}><YoutubeInfo /></ApolloProvider>;
        }else{
            youtube_content = this.renderButton("YouTube", "youtube");
        }
        if(this.state.twitter){
            twitter_content = <ApolloProvider client={client}><TwitterInfo /></ApolloProvider>;
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
