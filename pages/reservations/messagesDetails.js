import React, { Fragment } from "react";
import Link from "next/link";
import io from "socket.io-client";
import axios from "axios";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Layout from "../../hoc/Layout/Layout";
import Footer from '../../hoc/Layout/Footer/Footer';
import moment from "moment";
import { withStyles } from "@material-ui/core/styles";
import getDistance from "geolib/es/getDistance";
import convertDistance from "geolib/es/convertDistance";

const { config } = require("../../config/config");
const url = config.apiUrl;

moment.locale("fr");

const styles = theme => ({
  currentmsg: {
    backgroundColor: "rgb(47, 188, 211)",
    width: "auto",
    maxWidth: "400px",
    height: "auto",
    lineHeight: "1.5",
    color: "white",
    borderRadius: "50px 50px 5px 50px",
    boxShadow: "0px 0px 6px #4545454f",
    margin: "10px 10px",
    overflowWrap: "break-word",
    padding: "10px 20px",
    textAlign: "justify"
  },
  othermsg: {
    backgroundColor: "#F87280",
    width: "auto",
    maxWidth: "400px",
    height: "auto",
    lineHeight: "1.5",
    color: "white",
    borderRadius: "50px 50px 50px 5px",
    boxShadow: "0px 0px 6px #4545454f",
    margin: "10px 10px",
    overflowWrap: "break-word",
    padding: "10px 20px",
    textAlign: "justify",
    marginLeft: "38px"
  },
  current: {
    color: "#6a6a6c",
    fontSize: "0.8rem",
    float: "right",
    marginRight: "10px"
  },
  send: {
    right: "7%",
    [theme.breakpoints.down("sm")]: {
      right: "10%"
    }
  },
  scrollbar: {
    "&::-webkit-scrollbar": {
      width: "5px"
    },
    "&::-moz-scrollbar": {
      width: "5px"
    },
    "&::-webkit-scrollbar-track": {
      "-webkit-box-shadow": "inset 0 0 6px rgba(0,0,0,0.00)"
    },
    "&::-moz-scrollbar-track": {
      "-webkit-box-shadow": "inset 0 0 6px rgba(0,0,0,0.00)"
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(0,0,0,.25)",
      outline: "1px solid slategrey"
    },
    "&::-moz-scrollbar-thumb": {
      backgroundColor: "rgba(0,0,0,.25)",
      outline: "1px solid slategrey"
    }
  },
  Rightcontent: {
    marginLeft: "4%"
  },
  toggle: {
    [theme.breakpoints.down("sm")]: {
      display: "none"
    }
  }
});

class MessagesDetails extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      userData: {},
      message: "",
      messages: [],
      oldMessagesDisplay: [],
      oldMessages: [],
      roomData: {},
      emitter: "",
      bookingObj: null
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    const id = this.props.chatroomId;

    const div = document.getElementById("chat");
    setTimeout(function() {
      div.scrollTop = 99999;
    }, 450);

    axios.defaults.headers.common["Authorization"] = localStorage.getItem(
      "token"
    );
    axios.put(url + 'myAlfred/api/chatRooms/viewMessages/' + this.props.chatroomId)
      .then()
    axios.get(url+"myAlfred/api/users/current").then(res => {
      this.setState({ userData: res.data });
      this.setState({ emitter: res.data._id });
      this.setState({ recipientpic: res.data.picture });
    });
    axios
      .get(url + "myAlfred/api/booking/" + this.props.bookingId)
      .then(res => this.setState({ bookingObj: res.data }))
      .catch(err => console.log(err));
    axios
      .get(url+`myAlfred/api/chatRooms/userChatRoom/${id}`)
      .then(res => {
        this.setState({
          roomData: res.data,
          oldMessagesDisplay: res.data.messages,
          oldMessages: res.data.messages
        }, () => this.grantNotificationPermission());
        this.socket = io();
        this.socket.on("connect", socket => {
          this.socket.emit("room", this.state.roomData.name);
        });
        this.socket.on("displayMessage", data => {
          const messages = [...this.state.messages];
          const oldMessages = [...this.state.oldMessages];
          oldMessages.push(data);
          messages.push(data);
          axios
            .put(
              url+`myAlfred/api/chatRooms/saveMessages/${id}`,
              { messages: oldMessages }
            )
            .then();
          this.setState({
            messages,
            oldMessages
          }, () => this.showNotification(data));
        });
      })
      .catch(err => console.log(err));
  }

  handleChange(event) {
    this.setState({ message: event.target.value });
  }

  handleSubmit(event) {
    if (this.state.message.length !== 0 && this.state.message.trim() !== "") {
      //this.setState({ lurecipient: true });
      //this.setState({ lusender: false });
      const messObj = {
        user: this.state.userData.firstname,
        idsender: this.state.userData._id,
        content: this.state.message,
        date: Date.now(),
        thepicture: this.state.recipientpic,
        //lusender: this.state.lusender,
        //lurecipient: this.state.lurecipient
      };
      event.preventDefault();
      this.socket.emit("message", messObj);
      this.setState({ message: "" });
      const div = document.getElementById("chat");
      setTimeout(function() {
        div.scrollTop = 99999;
      }, 50);
    } else {
      event.preventDefault();
    }
  }

  static getInitialProps({ query: { id, booking } }) {
    return {
      chatroomId: id,
      bookingId: booking
    };
  }

  showNotification = message => {

    const { userData } = this.state;

    if (message.idsender !== userData._id) {
      const title = message.user;
      const body = message.content;

      new Notification(title, { body });
    }
  };

  grantNotificationPermission = () => {
    if (!('Notification' in window)) {
      alert('Votre navigateur ne supporte pas les notifications');
      return;
    }

    if (
      Notification.permission !== 'denied' ||
      Notification.permission === 'default'
    ) {
      Notification.requestPermission().then(result => {
        if (result === 'granted') {
          new Notification(
            'Vous recevrez des notifications pour cette conversation'
          );
        }
      });
    }
  };

  render() {
    const { classes } = this.props;
    const { bookingObj } = this.state;
    return (
      <Fragment>
        <Layout>
          <Grid container>
            <Grid
              className={classes.toggle}
              item
              xs={3}
              style={{ height: "100vh", borderRight: "1px #8281813b solid" }}
            >
              <Grid
                container
                style={{
                  justifyContent: "center",
                  position: "sticky",
                  top: 100
                }}
              >
                <Grid
                  item
                  style={{ marginTop: 30, width: 281, height: 70 }}
                  className={classes.hidesm}
                >
                  <Link href={"/reservations/messages"}>
                    <div
                      style={{
                        border: "0.2px solid lightgrey",
                        lineHeight: "4",
                        paddingLeft: 5,
                        paddingRight: 5,
                        display: "flex",
                        height: 70,
                        cursor: "pointer"
                      }}
                    >
                      <a style={{ fontSize: "1.1rem", cursor: "pointer" }}>
                        Tous les messages
                      </a>
                    </div>
                  </Link>
                </Grid>

                <Grid
                  item
                  style={{ marginTop: 10, width: 281, height: 70 }}
                  className={classes.hidesm}
                >
                  <Link href={"/reservations/newMessages"}>
                    <div
                      style={{
                        border: "0.2px solid lightgrey",
                        lineHeight: "4",
                        paddingLeft: 5,
                        paddingRight: 5,
                        display: "flex",
                        height: 70,
                        cursor: "pointer"
                      }}
                    >
                      <a style={{ fontSize: "1.1rem", cursor: "pointer" }}>
                        Messages non lus
                      </a>
                    </div>
                  </Link>
                </Grid>
              </Grid>
            </Grid>
            <Grid item className={classes.Rightcontent} xs={12} sm={12} md={7}>
              <Grid container style={{marginTop: "80px",}}>
                <Typography
                    style={{
                      fontSize: "1.1rem",
                      marginBottom: "15px",
                      color: bookingObj === null ? null : bookingObj.status === 'Confirmée' ? "#419F41" : bookingObj.status === 'En attente de confirmation' || bookingObj.status === "Demande d'infos" ? "#F87280" : bookingObj.status === "Pré-approuvée" ? "#F89B72" : "#5D5D5D"
                    }}
                >
                  {bookingObj === null ? null : bookingObj.status}
                </Typography>
              </Grid>
              <Grid
                container
                className={classes.mobilerow}
                style={{
                  boxShadow: "0 5px 5px -5px rgba(51, 51, 51, 0.29)"
                }}
              >
                <Grid item xs={3} md={1} style={{ marginRight: "5%" }}>


                  <img
                    src={`../../${
                      bookingObj === null
                        ? null
                        : this.state.userData._id === bookingObj.alfred._id
                        ? bookingObj.user.picture
                        : bookingObj.alfred.picture
                    }`}
                    alt={"picture"}
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      objectFit: "cover"
                    }}
                  ></img>
                </Grid>
                <Grid item xs={5} md={7}>
                  <Typography style={{ marginTop: "25px", fontSize: "1.3rem" }}>
                    {bookingObj === null
                        ? null
                        : this.state.userData._id === bookingObj.alfred._id
                            ? bookingObj.user.firstname
                            : bookingObj.alfred.firstname} {bookingObj === null
                      ? null
                      : this.state.userData._id === bookingObj.alfred._id
                          ? bookingObj.user.name
                          : bookingObj.alfred.name}
                  </Typography>
                  <Typography style={{ marginTop: "3px", color: "#9B9B9B" }}>
                    Réservation coiffure le{" "}
                    {bookingObj === null ? null : bookingObj.date_prestation}{" "}
                  </Typography>
                </Grid>
                <Grid item xs={1} style={{}}>

                </Grid>
                <Grid item xs={2} style={{}}>
                  <svg
                    style={{ marginTop: "25px" }}
                    xmlns="http://www.w3.org/2000/svg"
                    width="25.432"
                    height="36.478"
                    viewBox="0 0 55.432 66.478"
                  >
                    <path
                      id="Tracé_12517"
                      data-name="Tracé 12517"
                      d="M300.251,5274l-1.352.1-1.352.2-1.463.206-1.241.311-1.352.3-2.59.814-2.362,1.125-2.365,1.223-2.03,1.428-2.03,1.633-1.8,1.832-1.577,1.836-1.352,2.141-1.238,2.144-.9,2.34-.339,1.227-.339,1.121-.225,1.329-.228,1.222L274,5297.76v1.323l.111,1.835.228,1.833.336,1.942.567,1.831.564,1.839.788,1.832.788,1.836.9,1.838,1.016,1.731,1.124,1.832,2.368,3.365,2.476,3.267,2.593,3.061,2.59,2.851,2.479,2.552,2.365,2.344,2.14,1.936,3.04,2.653,1.241,1.018,1.241-1.018,3.04-2.653,2.141-1.936,2.365-2.344,2.479-2.552,2.59-2.851,2.593-3.061,2.476-3.267,2.368-3.365,1.124-1.832,1.016-1.731.9-1.838.788-1.836.788-1.832.564-1.839.567-1.831.336-1.942.228-1.833.111-1.835v-1.323l-.111-1.225-.228-1.222-.225-1.329-.339-1.121-.339-1.227-.9-2.34-1.238-2.144-1.352-2.141-1.577-1.836-1.8-1.832-2.03-1.633-2.03-1.428-2.365-1.223-2.362-1.125-2.59-.814-1.352-.3-1.241-.311-1.463-.206-1.352-.2-1.355-.1Zm2.707,14.378,1.124.2,1.127.206,1.124.4,1.016.41,1.013.61.9.611.788.714.792.715.678.813.671.919.453.919.453,1.018.225,1.021.222,1.023v2.24l-.222,1.02-.225,1.018-.453,1.023-.453.912-.671.919-.678.819-.792.713-.788.715-.9.609-1.013.613-1.016.4-1.124.41-1.127.206-1.124.2h-2.483l-1.124-.2-1.127-.206-1.124-.41-1.016-.4-1.013-.613-.9-.609-.788-.715-.792-.713-.678-.819-.671-.919-.453-.912-.453-1.023-.225-1.018-.222-1.02v-2.24l.222-1.023.225-1.021.453-1.018.453-.919.671-.919.678-.812.792-.715.788-.714.9-.611,1.013-.61,1.016-.41,1.124-.4,1.127-.206,1.124-.2Z"
                      transform="translate(-274.001 -5274)"
                      fill="#848484"
                      fill-rule="evenodd"
                    />
                  </svg>
                  <Typography style={{ marginTop: "3px", color: "#9B9B9B" }}>
                    {bookingObj === null || typeof this.state.userData.billing_address === 'undefined'
                      ? null
                      : convertDistance(
                          getDistance(
                            this.state.userData.billing_address.gps,
                            bookingObj.address.gps
                          ),
                          "km"
                        ).toFixed(2)}{" "}
                    km
                  </Typography>
                </Grid>
              </Grid>

              <div
                id="chat"
                className={classes.scrollbar}
                style={{
                  height: "57vh",
                  overflow: "auto",
                  overflowX: "hidden"
                }}
              >
                {this.state.oldMessagesDisplay.map((oldMessage, index) => {
                  return (
                    <div key={index}>
                      <Grid
                        container
                        style={{
                          flexDirection: "column",
                          alignItems: "stretch",
                          maxWidth: "100%"
                        }}
                      >
                        {this.state.emitter === oldMessage.idsender ? (
                          <React.Fragment>
                            <Grid
                              item
                              xs={9}
                              style={{
                                maxWidth: "100%",
                                alignSelf: "flex-end",
                                marginTop: "15px",
                                marginBottom: "5px"
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "stretch"
                                }}
                              >
                                <Typography
                                  style={{
                                    alignSelf: "flex-end",
                                    marginRight: "40px"
                                  }}
                                  className={classes.currentmsg}
                                >
                                  {oldMessage.content}
                                </Typography>
                                <img
                                  style={{
                                    width: "30px",
                                    height: "30px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    alignSelf: "flex-end",
                                    marginBottom: "15px",
                                    marginTop: "-44px"
                                  }}
                                  src={`../../${oldMessage.thepicture}`}
                                />
                              </div>
                              <Typography className={classes.current}>
                                {moment(oldMessage.date).calendar()}
                              </Typography>
                            </Grid>
                          </React.Fragment>
                        ) : (
                          <React.Fragment>
                            <Grid
                              item
                              xs={9}
                              style={{
                                maxWidth: "100%",
                                alignSelf: "flex-start",
                                marginTop: "15px",
                                marginBottom: "5px"
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "stretch"
                                }}
                              >
                                <Typography
                                  style={{ alignSelf: "flex-start" }}
                                  className={classes.othermsg}
                                >
                                  {oldMessage.content}
                                </Typography>
                                <img
                                  style={{
                                    width: "30px",
                                    height: "30px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    alignSelf: "flex-start",
                                    marginBottom: "15px",
                                    marginTop: "-44px"
                                  }}
                                  src={`../../${oldMessage.thepicture}`}
                                />
                              </div>
                              <Typography
                                style={{
                                  color: "#6a6a6c",
                                  fontSize: "0.8rem",
                                  marginLeft: "13px"
                                }}
                              >
                                {moment(oldMessage.date).calendar()}
                              </Typography>
                            </Grid>
                          </React.Fragment>
                        )}
                      </Grid>
                    </div>
                  );
                })}
                {typeof this.state.roomData.messages !== "undefined" ? (
                  <div style={{ margin: "auto", marginBottom: "10px" }}>
                    <Grid container>
                      <Grid item xs={5}>
                        <hr
                          style={{
                            background: "#80808070",
                            height: "1px",
                            border: "none"
                          }}
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <p
                          style={{
                            width: "100px",
                            textAlign: "center",
                            margin: "auto",
                            color: "#adadad"
                          }}
                        >
                          Nouveaux Messages
                        </p>
                      </Grid>
                      <Grid item xs={5}>
                        <hr
                          style={{
                            background: "#80808070",
                            height: "1px",
                            border: "none"
                          }}
                        />
                      </Grid>
                    </Grid>
                  </div>
                ) : null}
                {this.state.messages.map((message, index) => {
                  return (
                    <div key={index}>
                      <Grid
                        container
                        style={{
                          flexDirection: "column",
                          alignItems: "stretch",
                          maxWidth: "100%"
                        }}
                      >
                        {this.state.emitter === message.idsender ? (
                          <React.Fragment>
                            <Grid
                              item
                              xs={8}
                              style={{
                                maxWidth: "100%",
                                alignSelf: "flex-end",
                                marginTop: "5px",
                                marginBottom: "15px"
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "stretch"
                                }}
                              >
                                <Typography
                                  style={{
                                    alignSelf: "flex-end",
                                    marginRight: "40px"
                                  }}
                                  className={classes.currentmsg}
                                >
                                  {message.content}
                                </Typography>
                                <img
                                  style={{
                                    width: "30px",
                                    height: "30px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    alignSelf: "flex-end",
                                    marginBottom: "15px",
                                    marginTop: "-44px"
                                  }}
                                  src={`../../${message.thepicture}`}
                                />
                              </div>
                              <Typography className={classes.current}>
                                {moment(message.date).calendar()}
                              </Typography>
                            </Grid>
                          </React.Fragment>
                        ) : (
                          <React.Fragment>
                            <Grid
                              item
                              xs={8}
                              style={{
                                maxWidth: "100%",
                                alignSelf: "flex-start",
                                marginTop: "15px",
                                marginBottom: "5px"
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "stretch"
                                }}
                              >
                                <Typography
                                  style={{ alignSelf: "flex-start" }}
                                  className={classes.othermsg}
                                >
                                  {message.content}
                                </Typography>
                                <img
                                  style={{
                                    width: "30px",
                                    height: "30px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    alignSelf: "flex-start",
                                    marginBottom: "15px",
                                    marginTop: "-44px"
                                  }}
                                  src={`../../${message.thepicture}`}
                                />
                              </div>
                              <Typography
                                style={{
                                  color: "#6a6a6c",
                                  fontSize: "0.8rem",
                                  marginLeft: "13px"
                                }}
                              >
                                {moment(message.date).calendar()}
                              </Typography>
                            </Grid>
                          </React.Fragment>
                        )}
                      </Grid>
                    </div>
                  );
                })}
              </div>
              <form
                onSubmit={this.handleSubmit}
                style={{
                  width: "100%",
                  flexDirection: "column",
                  alignItems: "stretch",
                  position: "relative",
                  height: "12vh",
                  boxShadow: "0 -5px 5px -5px rgba(51, 51, 51, 0.29)"
                }}
              >
                <input
                  size={4}
                  style={{
                    fontSize: "18px",
                    width: "90%",
                    border: "none",
                    boxShadow: "0px 0px 6px rgba(128, 128, 128, 0.29)",
                    height: "60px",
                    alignSelf: "center",
                    margin: "10px 5%",
                    padding: "20px"
                  }}
                  type="text"
                  value={this.state.message}
                  onChange={this.handleChange}
                />
                <img
                  className={classes.send}
                  onClick={this.handleSubmit}
                  src="../../static/arrow/arrowsend.svg"
                  style={{
                    width: "20px",
                    height: "20px",
                    cursor: "pointer",
                    position: "absolute",
                    top: "30px"
                  }}
                />
              </form>
            </Grid>
          </Grid>
        </Layout>
        <Footer/>
      </Fragment>
    );
  }
}

export default withStyles(styles)(MessagesDetails);
