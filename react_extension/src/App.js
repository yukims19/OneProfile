import React, { Component } from "react";
import "./App.css";
import { Tabs, Icon } from "antd";
import { gql } from "apollo-boost";
import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloProvider, Query } from "react-apollo";
import OneGraphApolloClient from "onegraph-apollo-client";
import OneGraphAuth from "onegraph-auth";
import idx from "idx";

const TabPane = Tabs.TabPane;

const auth = new OneGraphAuth({
  appId: "e3d209d1-0c66-4603-8d9e-ca949f99506d",
  oauthFinishPath: "/index.html"
});

const APP_ID = "e3d209d1-0c66-4603-8d9e-ca949f99506d";
const client = new OneGraphApolloClient({
  oneGraphAuth: auth
});
const URL = "https://news.ycombinator.com/user?id=sgrove"; // window.location.href.split("q=")[1];
//"https://news.ycombinator.com/user?id=edent";

//window.location.href.split("q=")[1];
//"https://news.ycombinator.com/user?id=sgrove";
//"https:/fwefweiofjwoi";
//"https://github.com/sgrove";
//"http://www.riseos.com/";
//"https://news.ycombinator.com/user?id=tlrobinson";//
//const USER = "sgrove";//URL.split("?")[1].split("=")[1];
//const tempuser = "sgrove";

let target = {
  hackerNews: null,
  gitHub: null,
  twitter: null,
  reddit: null
};

/*********Get Username from Link id param********************/
// Given a link: https://news.ycombinator.com/user?id=tlrobinson
// We can have a function:

// e.g. https://news.ycombinator.com/user?id=tlrobinson
let hnUserNameRE = /https:\/\/news.ycombinator.com\/user/;

// e.g. https://github.com/sgrove/omchaya
let githubRE = /https:\/\/github.com\//;

const queryParam = (name, url) => {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};

let serviceAndUserIdFromString = (_servicesAndUsernames, input) => {
  // Shallow-clone the object so we don't mutate the original
  let servicesAndUsernames = Object.assign(_servicesAndUsernames, {});

  if (input.match(hnUserNameRE)) {
    let hnUserId = queryParam("id", input);
    servicesAndUsernames.hackerNews = hnUserId;
  } else if (input.match(githubRE)) {
    let gitHubLogin = input.split("https://github.com/")[1].split("/")[0];
    servicesAndUsernames.gitHub = gitHubLogin;
  }

  // Return the object with the new key (if any) we've found
  return servicesAndUsernames;
};

/*****************************************************************/
//serviceAndUserIdFromString (target, "https://news.ycombinator.com/user?id=tlrobinson");

/*----->if target == null----->*/
const URL_Query = gql`
  query($URL: String!) {
    descuri(url: $URL) {
      twitter {
        links
      }
      gitHub {
        uri
      }
      hackerNewsUsers {
        uri
      }
    }
  }
`;
class DescURI extends Component {
  render() {
    return (
      <Query query={URL_Query} variables={{ URL }}>
        {({ loading, error, data }) => {
          if (loading) return <div>Loading...</div>;
          if (error) {
            console.log(error);
            return <div>Uh oh, something went wrong!</div>;
          }
          if (idx(data, _ => _.descuri.twitter.links[0])) {
            target.twitter = idx(data, _ => _.descuri.twitter.links[0]);
          }
          if (idx(data, _ => _.descuri.gitHub[0].uri)) {
            serviceAndUserIdFromString(target, data.descuri.gitHub[0].uri);
          }
          if (idx(data, _ => _.descuri.hackerNewsUsers[0].ur)) {
            console.log("333333");
            serviceAndUserIdFromString(
              target,
              data.descuri.hackerNewsUsers[0].uri
            );
          }
          console.log(target);
          return null;
        }}
      </Query>
    );
  }
}

const URLSearch_Query = gql`
  query($URLa: String!, $URLb: String!, $URLc: String!) {
    descuri(url: $URL) {
      twitter {
        links
      }
    }
  }
`;

class URLSearch extends Component {
  render() {
    return (
      <Query
        query={URLSearch_Query}
        variables={{
          URLa: "https://twitter.com/" + target.twitter,
          URLb: "https://github.com/" + target.gitHub,
          URLc: "https://news.ycombinator.com/user?id=" + target.hackerNews
        }}
      >
        {({ loading, error, data }) => {
          if (loading) return <div>Loading...</div>;
          if (error) {
            console.log(error);
            return <div>Uh oh, something went wrong!</div>;
          }
          target.twitter = !idx(data, _ => _.descuri.twitter.links);
          //target.github = !idx(data, _ => _.descuri.github.links);
          //target.hackerNews = !idx(data, _ => _.descuri.hackerNews.links);
          return null;
        }}
      </Query>
    );
  }
}

const GET_TwitterQuery = gql`
  query(
    $hackernews: String!
    $github: String!
    $twitter: String!
    $reddit: String!
  ) {
    eventil {
      user(
        hackernews: $hackernews
        github: $github
        twitter: $twitter
        reddit: $reddit
      ) {
        id
        profile {
          id
          gitHubUser {
            id
            avatarUrl
          }
          twitterTimeline {
            id
            tweets {
              id
              user {
                id
                screenName
                name
                profileImageUrlHttps
                profileBannerUrl
                profileUseBackgroundImage
              }
              entities {
                id
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
    descuri(url: $URL) {
      twitter {
        timelines {
          tweets {
            id
            user {
              id
              screenName
              name
              profileImageUrlHttps
              profileBannerUrl
              profileUseBackgroundImage
            }
            entities {
              id
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
`;

class TwitterInfo extends Component {
  render() {
    return (
      <Query
        query={GET_TwitterQuery}
        variables={{
          hackernews: target.hackerNews,
          github: target.gitHub,
          twitter: target.twitter,
          reddit: target.reddit,
          URL: URL
        }}
      >
        {({ loading, error, data }) => {
          if (loading) return <div>Loading...</div>;
          if (error) {
            console.log(error);
            return <div>Uh oh, something went wrong!</div>;
          }
          if (idx(data, _ => _.eventil.user.profile)) {
            return (
              <div>
                <div className="twitter-back-img">
                  {idx(
                    data,
                    _ =>
                      _.eventil.user.profile.twitterTimeline.tweets[0].user
                        .profileUseBackgroundImage
                  )
                    ? <img
                        src={idx(
                          data,
                          _ =>
                            _.eventil.user.profile.twitterTimeline.tweets[0]
                              .user.profileBannerUrl
                        )}
                      />
                    : ""}
                </div>
                <div className="twitter-back-avatar-container">
                  <img
                    className="twitter-back-avatar"
                    src={idx(
                      data,
                      _ =>
                        _.eventil.user.profile.twitterTimeline.tweets[0].user
                          .profileImageUrlHttps
                    ).replace("_normal", "")}
                  />
                </div>
                {data.eventil.user.profile.twitterTimeline.tweets.map(item => {
                  return (
                    <div className="card">
                      <div className="card-body">
                        <img src={item.user.profileImageUrlHttps} />
                        <div className="names">
                          <h5 className="card-title">
                            <a
                              href={
                                "https://twitter.com/" + item.user.screenName
                              }
                            >
                              {item.user.name}
                            </a>
                          </h5>
                          <p>
                            @{item.user.screenName}
                          </p>
                        </div>
                        <a
                          href={
                            "https://twitter.com/" +
                            item.user.screenName +
                            "/status/" +
                            item.idStr
                          }
                        >
                          <i className="fab fa-twitter twittericon" />
                        </a>
                        <p className="card-text">
                          {item.text}
                          <br />
                          <span>
                            {item.createdAt.split(" ")[3].split(":")[0] > 12
                              ? item.createdAt.split(" ")[3].split(":")[0] -
                                12 +
                                ":" +
                                item.createdAt.split(" ")[3].split(":")[1] +
                                " PM"
                              : item.createdAt
                                  .split(" ")[3]
                                  .split(":")
                                  .slice(0, 2)
                                  .join(":") + " AM"}
                          </span>
                          <span>
                            {" - " +
                              item.createdAt.split(" ").slice(1, 3).join(" ") +
                              " " +
                              item.createdAt.split(" ")[
                                item.createdAt.split(" ").length - 1
                              ]}
                          </span>
                        </p>
                        <div className="card-bottom">
                          <p>
                            <i className="fas fa-heart" /> {item.favoriteCount}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          } else if (idx(data, _ => _.descuri.twitter.timelines[0])) {
            return (
              <div>
                <div className="twitter-back-img">
                  {idx(
                    data,
                    _ =>
                      _.descuri.twitter.timelines[0].tweets[0].user
                        .profileUseBackgroundImage
                  )
                    ? <img
                        src={idx(
                          data,
                          _ =>
                            _.descuri.twitter.timelines[0].tweets[0].user
                              .profileBannerUrl
                        )}
                      />
                    : ""}
                </div>
                <div className="twitter-back-avatar-container">
                  <img
                    className="twitter-back-avatar"
                    src={idx(
                      data,
                      _ =>
                        _.descuri.twitter.timelines[0].tweets[0].user
                          .profileImageUrlHttps
                    ).replace("_normal", "")}
                  />
                </div>
                {data.descuri.twitter.timelines[0].tweets.map(item => {
                  return (
                    <div className="card">
                      <div className="card-body">
                        <img src={item.user.profileImageUrlHttps} />
                        <div className="names">
                          <h5 className="card-title">
                            <a
                              href={
                                "https://twitter.com/" + item.user.screenName
                              }
                            >
                              {item.user.name}
                            </a>
                          </h5>
                          <p>
                            @{item.user.screenName}
                          </p>
                        </div>
                        <a
                          href={
                            "https://twitter.com/" +
                            item.user.screenName +
                            "/status/" +
                            item.idStr
                          }
                        >
                          <i className="fab fa-twitter twittericon" />
                        </a>
                        <p className="card-text">
                          {item.text}
                          <br />
                          <span>
                            {item.createdAt.split(" ")[3].split(":")[0] > 12
                              ? item.createdAt.split(" ")[3].split(":")[0] -
                                12 +
                                ":" +
                                item.createdAt.split(" ")[3].split(":")[1] +
                                " PM"
                              : item.createdAt
                                  .split(" ")[3]
                                  .split(":")
                                  .slice(0, 2)
                                  .join(":") + " AM"}
                          </span>
                          <span>
                            {" - " +
                              item.createdAt.split(" ").slice(1, 3).join(" ") +
                              " " +
                              item.createdAt.split(" ")[
                                item.createdAt.split(" ").length - 1
                              ]}
                          </span>
                        </p>
                        <div className="card-bottom">
                          <p>
                            <i className="fas fa-heart" /> {item.favoriteCount}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          } else {
            return <div>No Data Found</div>;
          }
        }}
      </Query>
    );
  }
}

const GET_YoutubeQuery = gql`
  query(
    $hackernews: String!
    $github: String!
    $twitter: String!
    $reddit: String!
  ) {
    eventil {
      user(
        hackernews: $hackernews
        github: $github
        twitter: $twitter
        reddit: $reddit
      ) {
        id
        presentations {
          id
          video_url
          draft {
            title
          }
          youtubeVideo {
            id
            statistics {
              viewCount
              dislikeCount
              likeCount
            }
          }
        }
      }
    }
    descuri(url: $URL) {
      other {
        descuri {
          youTube {
            uri
          }
        }
        uri
      }
    }
  }
`;

const GET_DescuriYoutubeStats = gql`
  query($id: String!) {
    youTubeVideo(id: $id) {
      statistics {
        dislikeCount
        likeCount
        viewCount
      }
      id
      snippet {
        title
      }
    }
  }
`;

class DescuriYoutubeStats extends Component {
  render() {
    return (
      <Query
        query={GET_DescuriYoutubeStats}
        variables={{
          id: this.props.videoId
        }}
      >
        {({ loading, error, data }) => {
          if (loading) return <div>Loading...</div>;
          if (error) {
            console.log(error);
            return <div>Uh oh, something went wrong!</div>;
          }
          return (
            <div>
              <p className="video-title">
                {idx(data, _ => _.youTubeVideo.snippet.title)}
              </p>
              <div className="video-stats">
                <div>
                  {idx(data, _ => _.youTubeVideo.statistics.viewCount)} views
                </div>
                <div className="thumbs">
                  <div>
                    <i className="fas fa-thumbs-up" />{" "}
                    {idx(data, _ => _.youTubeVideo.statistics.likeCount)}
                  </div>
                  <div>
                    <i className="fas fa-thumbs-down" />{" "}
                    {idx(data, _ => _.youTubeVideo.statistics.dislikeCount)}
                  </div>
                </div>
              </div>
            </div>
          );
        }}
      </Query>
    );
  }
}

class YoutubeInfo extends Component {
  render() {
    return (
      <Query
        query={GET_YoutubeQuery}
        variables={{
          hackernews: target.hackerNews,
          github: target.gitHub,
          twitter: target.twitter,
          reddit: target.reddit,
          URL: URL
        }}
      >
        {({ loading, error, data }) => {
          if (loading) return <div>Loading...</div>;
          if (error) {
            console.log(error);
            return <div>Uh oh, something went wrong!</div>;
          }
          let eventil_video = null;
          let descuri_video = null;
          if (idx(data, _ => _.eventil.user.presentations)) {
            eventil_video = data.eventil.user.presentations.map(item => {
              return (
                <div>
                  {item.youtubeVideo
                    ? <div>
                        <iframe
                          src={
                            "http://www.youtube.com/embed/" +
                            item.youtubeVideo.id
                          }
                          width="560"
                          height="315"
                        />
                        <p className="video-title">
                          {item.draft.title}
                        </p>
                        <div className="video-stats">
                          <div>
                            {item.youtubeVideo.statistics.viewCount} views
                          </div>
                          <div className="thumbs">
                            <div>
                              <i className="fas fa-thumbs-up" />{" "}
                              {item.youtubeVideo.statistics.likeCount}
                            </div>
                            <div>
                              <i className="fas fa-thumbs-down" />{" "}
                              {item.youtubeVideo.statistics.dislikeCount}
                            </div>
                          </div>
                        </div>
                      </div>
                    : " "}
                </div>
              );
            });
          }
          if (idx(data, _ => _.descuri.other)) {
            descuri_video = data.descuri.other.map(item => {
              return item.descuri.youTube.map(item => {
                return (
                  <div>
                    <iframe
                      src={
                        "http://www.youtube.com/embed/" +
                        item.uri.split("v=")[1]
                      }
                      width="560"
                      height="315"
                    />
                    <DescuriYoutubeStats videoId={item.uri.split("v=")[1]} />
                  </div>
                );
              });
            });
          }
          return (
            <div>
              {eventil_video || descuri_video[0][0]
                ? <div>
                    <div>
                      {eventil_video}
                    </div>
                    <div>
                      {descuri_video}
                    </div>
                  </div>
                : <div>No Data Found</div>}
            </div>
          );
        }}
      </Query>
    );
  }
}

const GET_GithubQuery = gql`
  query($github: String!) {
    gitHub {
      user(login: $github) {
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
`;

class GithubInfo extends Component {
  render() {
    if (!target.gitHub) {
      return <div>No Data Found</div>;
    }
    return (
      <Query query={GET_GithubQuery} variables={{ github: target.gitHub }}>
        {({ loading, error, data }) => {
          if (loading) return <div>Loading...</div>;
          if (error) {
            console.log(error);
            return <div>Uh oh, something went wrong!</div>;
          }
          if (!idx(data, _ => _.gitHub.user)) return <div>No Data Found</div>;
          return (
            <div>
              <div className="container">
                <div className="row">
                  <div className="col-md-2">
                    <a href={idx(data, _ => _.gitHub.user.url)}>
                      {" "}<img src={idx(data, _ => _.gitHub.user.avatarUrl)} />
                    </a>
                  </div>
                  <div className="col-md-4 user-info">
                    <h4>
                      <a href={idx(data, _ => _.gitHub.user.url)}>
                        {idx(data, _ => _.gitHub.user.login)}
                      </a>
                    </h4>
                    <p className="info-list">
                      Total Repositories:{" "}
                      {idx(data, _ => _.gitHub.user.repositories.totalCount)}
                      <br />
                      Following:{" "}
                      {idx(data, _ => _.gitHub.user.following.totalCount)}
                      <br />
                      Follwer:{" "}
                      {idx(data, _ => _.gitHub.user.followers.totalCount)}
                      <br />
                    </p>
                  </div>
                </div>
                <div className="row">
                  {idx(
                    data,
                    _ => _.gitHub.user.repositories.nodes
                  ).map(item => {
                    return (
                      <div className="col-md-6">
                        <div className="card">
                          <div className="card-body">
                            <h5 className="card-title">
                              <a href={item.url}>
                                {item.name}
                              </a>
                            </h5>
                            <p className="card-text">
                              {item.description}
                            </p>
                            <div className="card-bottom">
                              {item.languages.edges[0]
                                ? <p>
                                    <i
                                      className="fas fa-circle"
                                      style={{
                                        color:
                                          item.languages.edges[0].node.color
                                      }}
                                    />
                                    {item.languages.edges[0].node.name}
                                  </p>
                                : " "}
                              {item.stargazers
                                ? <p>
                                    <i className="fas fa-star" />
                                    {item.stargazers.totalCount}
                                  </p>
                                : " "}
                              {item.forks
                                ? <p>
                                    <i className="fas fa-code-branch" />
                                    {item.forks.totalCount}
                                  </p>
                                : " "}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        }}
      </Query>
    );
  }
}

const GET_GeneralQuery = gql`
  query(
    $hackernews: String!
    $github: String!
    $twitter: String!
    $reddit: String!
  ) {
    eventil {
      user(
        hackernews: $hackernews
        github: $github
        twitter: $twitter
        reddit: $reddit
      ) {
        profile {
          avatar
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
            company
            email
          }
        }
        name
        id
      }
    }
  }
`;

const GET_GithubGeneralQuery = gql`
  query($github: String!) {
    gitHub {
      user(login: $github) {
        websiteUrl
        avatarUrl
        location
        company
        email
        name
        bio
      }
    }
  }
`;

class GithubGeneralInfo extends Component {
  render() {
    return (
      <Query
        query={GET_GithubGeneralQuery}
        variables={{ github: target.gitHub }}
      >
        {({ loading, error, data }) => {
          if (loading) return <div>Loading...</div>;
          if (error) {
            console.log(error);
            return <div>Uh oh, something went wrong!</div>;
          }
          if (!idx(data, _ => _.gitHub.user)) return <div>No Data Found</div>;
          return (
            <div>
              <div className="container">
                <div className="row">
                  <div className="col-md-4">
                    <img src={idx(data, _ => _.gitHub.user.avatarUrl)} />
                  </div>
                  <div className="col-md-8">
                    <h4>
                      {idx(data, _ => _.gitHub.user.name)}
                    </h4>
                    {idx(data, _ => _.gitHub.user.company)}
                    <br />
                    <small>
                      <cite title={idx(data, _ => _.gitHub.user.location)}>
                        {idx(data, _ => _.gitHub.user.location)}{" "}
                        <i className="fas fa-map-marker-alt" />
                      </cite>
                    </small>
                    <p>
                      {idx(data, _ => _.gitHub.user.location)}
                    </p>
                    <p className="info-list">
                      <i className="fas fa-envelope" />{" "}
                      {idx(data, _ => _.gitHub.user.email)}
                      <br />
                      <i className="fas fa-globe" />{" "}
                      <a href={idx(data, _ => _.gitHub.user.websiteUrl)}>
                        {idx(data, _ => _.gitHub.user.websiteUrl)}
                      </a>
                      <br />
                      <i className="fab fa-github-square" /> {target.gitHub}
                      <br />
                      <i className="fab fa-twitter-square" /> {target.twitter}
                      <br />
                      <i className="fab fa-reddit-square" />
                      {target.reddit}
                      <br />
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        }}
      </Query>
    );
  }
}

class EventilInfo extends Component {
  render() {
    return (
      <Query
        query={GET_GeneralQuery}
        variables={{
          hackernews: target.hackerNews,
          github: target.gitHub,
          twitter: target.twitter,
          reddit: target.reddit
        }}
      >
        {({ loading, error, data }) => {
          if (loading) return <div>Loading...</div>;
          if (error) {
            console.log(error);
            return <div>Uh oh, something went wrong!</div>;
          }
          console.log(target);
          if (!idx(data, _ => _.eventil.user.profile)) {
            if (target.gitHub) {
              if (this.props.github) {
                return (
                  <ApolloProvider client={client}>
                    <GithubGeneralInfo />
                  </ApolloProvider>
                );
              } else {
                return (
                  <div>
                    No Eventil Data Found<br />
                    Try with GitHub!<br />
                    {this.props.button("Github", "github")}
                  </div>
                );
              }
            } else if (
              target.gitHub == null &&
              target.hackerNews == null &&
              target.twitter == null &&
              target.reddit == null
            ) {
              return (
                <div>
                  No Data Found<br />
                </div>
              );
            } else {
              return (
                <div>
                  <h5>Found Usernames</h5>
                  {Object.keys(target).map(e => {
                    return target[e]
                      ? <li>
                          {e}: {target[e]}
                        </li>
                      : "";
                  })}
                </div>
              );
            }
          }
          target.hackerNews = idx(data, _ => _.eventil.user.profile.hackernews);
          target.gitHub = idx(data, _ => _.eventil.user.profile.github);
          target.twitter = idx(data, _ => _.eventil.user.profile.twitter);
          target.reddit = idx(data, _ => _.eventil.user.profile.reddit);
          console.log(target);
          return (
            <div>
              <div className="container">
                <div className="row">
                  <div className="col-md-4">
                    <img src={idx(data, _ => _.eventil.user.profile.avatar)} />
                  </div>
                  <div className="col-md-8">
                    <h4>
                      {idx(data, _ => _.eventil.user.name)}
                    </h4>
                    {idx(data, _ => _.eventil.user.profile.gitHubUser.company)}
                    <br />
                    <small>
                      <cite
                        title={idx(data, _ => _.eventil.user.profile.location)}
                      >
                        {idx(data, _ => _.eventil.user.profile.location)}{" "}
                        <i className="fas fa-map-marker-alt" />
                      </cite>
                    </small>
                    <p>
                      {idx(data, _ => _.eventil.user.profile.description)}
                    </p>
                    <p className="info-list">
                      <i className="fas fa-envelope" />{" "}
                      {idx(data, _ => _.eventil.user.profile.gitHubUser.email)}
                      <br />
                      <i className="fas fa-globe" />{" "}
                      <a href={idx(data, _ => _.eventil.user.profile.website)}>
                        {idx(data, _ => _.eventil.user.profile.website)}
                      </a>
                      <br />
                      <i className="fab fa-github-square" />{" "}
                      {idx(data, _ => _.eventil.user.profile.github)}
                      <br />
                      <i className="fab fa-twitter-square" />{" "}
                      {idx(data, _ => _.eventil.user.profile.twitter)}
                      <br />
                      <i className="fab fa-reddit-square" />{" "}
                      {idx(data, _ => _.eventil.user.profile.reddit)}
                      <br />
                      <i className="fab fa-linkedin" />{" "}
                      {idx(data, _ => _.eventil.user.profile.linkedin)}
                      <br />
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        }}
      </Query>
    );
  }
}

class LoginButton extends Component {
  render() {
    return (
      <button
        className={"loginbtn loginbtn-" + this.props.eventClass}
        onClick={this.props.onClick}
      >
        <i className={"fab fa-" + this.props.eventClass} />
        <span> </span>Login with {this.props.event}
      </button>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      eventil: false,
      github: false,
      youtube: false,
      twitter: false
    };
    this.isLoggedIn("eventil");
    this.isLoggedIn("github");
    this.isLoggedIn("youtube");
    this.isLoggedIn("twitter");
  }
  isLoggedIn(event) {
    auth.isLoggedIn(event).then(isLoggedIn => {
      this.setState({
        [event]: isLoggedIn
      });
    });
  }
  handleClick(service) {
    try {
      auth.login(service).then(() => {
        auth.isLoggedIn(service).then(isLoggedIn => {
          if (isLoggedIn) {
            console.log("Successfully logged in to " + service);
            this.setState({
              [service]: isLoggedIn
            });
          } else {
            console.log("Did not grant auth for service " + service);
            this.setState({
              service: isLoggedIn
            });
          }
        });
      });
    } catch (e) {
      console.error("Problem logging in", e);
    }
  }
  renderButton(eventTitle, eventClass) {
    return (
      <LoginButton
        event={eventTitle}
        eventClass={eventClass}
        onClick={() => this.handleClick(eventClass)}
      />
    );
  }

  render() {
    serviceAndUserIdFromString(target, URL);
    <ApolloProvider client={client}>
      <DescURI />
    </ApolloProvider>;
    var eventil_content;
    var github_content;
    var youtube_content;
    var twitter_content;

    if (this.state.eventil) {
      eventil_content = (
        <ApolloProvider client={client}>
          <EventilInfo
            button={(eventTitle, eventClass) =>
              this.renderButton(eventTitle, eventClass)}
            github={this.state.github}
          />
        </ApolloProvider>
      );
    } else {
      eventil_content = this.renderButton("Eventil", "eventil");
    }
    if (this.state.github) {
      github_content = (
        <ApolloProvider client={client}>
          <GithubInfo />
        </ApolloProvider>
      );
    } else {
      github_content = this.renderButton("Github", "github");
    }
    if (this.state.youtube) {
      youtube_content = (
        <ApolloProvider client={client}>
          <YoutubeInfo />
        </ApolloProvider>
      );
    } else {
      youtube_content = this.renderButton("YouTube", "youtube");
    }
    if (this.state.twitter) {
      twitter_content = (
        <ApolloProvider client={client}>
          <TwitterInfo />
        </ApolloProvider>
      );
    } else {
      twitter_content = this.renderButton("Twitter", "twitter");
    }

    return (
      <div className="App">
        <ApolloProvider client={client}>
          <DescURI />
        </ApolloProvider>
        <Tabs defaultActiveKey="1">
          <TabPane tab={<span>General</span>} key="1">
            <div className="tab-content" id="general-content">
              {eventil_content}
            </div>
          </TabPane>
          <TabPane
            tab={
              <span>
                <Icon type="github" />Github
              </span>
            }
            key="2"
          >
            <div className="tab-content" id="github-content">
              {this.state.eventil ? github_content : eventil_content}
            </div>
          </TabPane>
          <TabPane
            tab={
              <span>
                <Icon type="youtube" />Youtube
              </span>
            }
            key="3"
          >
            <div className="tab-content" id="youtube-content">
              {this.state.eventil ? youtube_content : eventil_content}
            </div>
          </TabPane>
          <TabPane
            tab={
              <span>
                <Icon type="twitter" />Twitter
              </span>
            }
            key="4"
          >
            <div className="tab-content" id="twitter-content">
              {this.state.eventil ? twitter_content : eventil_content}
            </div>
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export default App;
