import React, { Component } from "react";
import Poodr from "./Poodr/Poodr";
import UserInfo from "./UserInfo/UserInfo";
import "./App.css";
import AddToSlack from "./AddToSlack/AddToSlack";
import { AUTH } from "./tokens";
import history from "./history";

class App extends Component {
  constructor() {
    super();
    // this.state = {};

    const user = {"access_token":AUTH.userToken,"user_id":"U4ABV446N"}
    this.fetchUserInfo(user);
    this.state = {
      bot: {
        bot_user_id: "U6CJ3H9MG",
        bot_access_token: AUTH.botToken
      },
      authed: true
    };
  }

  componentDidMount() {
    if (localStorage.code) {
      this.login(localStorage.code);
      localStorage.removeItem("code");
    }
  }

  render() {
    return (
      <div id="App">
        <section className="navbar">
          <div className="brand button" id="navbar-brand">
            <a href="https://github.com/samlandfried/poodr-react">
              Poodr on GitHub
            </a>
          </div>
          {!this.state.authed && <AddToSlack />}
          {this.state.authed &&
            this.state.user &&
            <UserInfo user={this.state.user} />}
        </section>
        <section className="main">
          {this.state.authed &&
            <Poodr user={this.state.user} bot={this.state.bot} />}
        </section>
      </div>
    );
  }

  fetchUserInfo(user) {
    const token = user.access_token;
    const u_id = user.user_id;
    console.log(token)
    console.log(u_id)

    const url = `https://slack.com/api/users.info?token=${token}&user=${u_id}&pretty=1`;
    fetch(url).then(resp => resp.json()).then(data => {
      if (data.ok) {
        const user = data.user.profile;
        this.setState({
          user: {
            access_token: token,
            u_id: u_id,
            name: user.real_name,
            image: user.image_48
          }
        });
      } else {
        console.error(data);
      }
    });
  }

  login(code) {
    const url = `https://slack.com/api/oauth.access?client_id=${AUTH.clientId}&client_secret=${AUTH.clientSecret}&code=${code}&redirect_uri=http://localhost:3000/callback&pretty=1`;
    fetch(url).then(resp => resp.json()).then(data => {
      if (data.ok) {
        const bot = data.bot;
        const user = {
          access_token: data.access_token,
          user_id: data.user_id
        };
        this.fetchUserInfo(user);
        this.setState({ bot: bot });
        this.setState({ authed: true });
      } else {
        this.setState({ authed: false });
      }
    });
  }
}

export default App;

const getCode = queryString => {
  const firstParam = queryString.split("&")[0];
  const code = firstParam.split("=")[1];
  return code;
};
