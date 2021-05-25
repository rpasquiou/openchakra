import React from 'react'
import axios from 'axios'
import Grid from "@material-ui/core/Grid";
import ProfileLayout from '../../hoc/Layout/ProfileLayout'
import DrawerAndSchedule from '../../components/Drawer/DrawerAndSchedule/DrawerAndSchedule'
import {withStyles} from '@material-ui/core/styles';
import styles from '../../static/css/pages/profile/calendar/calendar';
import {getLoggedUserId} from '../../utils/context'
import Hidden from "@material-ui/core/Hidden";
import Topic from "../../hoc/Topic/Topic";
import Box from "../../components/Box/Box";
import LayoutMobileProfile from "../../hoc/Layout/LayoutMobileProfile";
const {setAxiosAuthentication} = require('../../utils/authentication')

class ProfileCalendar extends React.Component {

  constructor(props) {
    super(props);
    this.state={
      availabilities:[],
      bookings : [],
    }
  }

  static getInitialProps({query: {user}}) {
    return {user: user};
  }

  loadAvailabilities = () => {
    axios.get(`/myAlfred/api/availability/userAvailabilities/${this.props.user}`)
      .then(res => {
        this.setState({availabilities: res.data});
      })
      .catch(err => console.error(err));
    setAxiosAuthentication()
    Promise.all(['alfredBooking', 'userBooking'].map( u => axios.get(`/myAlfred/api/booking/${u}`)))
      .then(res => {
        const bookings = res[0].data.concat(res[1].data)
        this.setState({bookings : bookings})
      })
      .catch(err => console.error(err));
  };

  componentDidMount() {
    this.loadAvailabilities()
  }

  content = (classes, bookings, user, readOnly) =>{
    return(
      <Grid container className={classes.mainContainerSchedule}>
        <Grid item xs={12} xl={12}>
          <Box>
            <Topic
              titleTopic={'Ajoutez vos disponiblités '}
              titleSummary={'Votre calendrier vous permet d’ajouter vos disponibilités en précisant les tranches horaires. '}
              needBackground={false}
              underline={true}
            >
              <DrawerAndSchedule
                availabilities={this.state.availabilities}
                nbSchedule={3}
                availabilityUpdate={this.loadAvailabilities}
                availabilityCreated={this.loadAvailabilities}
                onAvailabilityChanged={this.loadAvailabilities}
                selectable={!readOnly}
                ref={this.scheduleDrawer}
                readOnly={readOnly}
                bookings={bookings}
              />
            </Topic>
          </Box>
        </Grid>
      </Grid>
    )
  };

  render() {
    const {user, classes, index}=this.props;
    const {bookings}=this.state
    const readOnly = this.props.user!==getLoggedUserId();

    if (!user) {
      return null
    }

    return (
      <React.Fragment>
        <Hidden only={['xs']}>
          <ProfileLayout user={user} index={index}>
            {this.content(classes, bookings, user, readOnly)}
          </ProfileLayout>
        </Hidden>
        <Hidden  only={['lg', 'xl','sm', 'md']}>
          <LayoutMobileProfile user={user} index={index} currentIndex={2}>
            {this.content(classes, bookings)}
          </LayoutMobileProfile>
        </Hidden>
      </React.Fragment>
    )
  }

}

export default withStyles(styles)(ProfileCalendar)
