import React from 'react'
import { Calendar, Views, momentLocalizer } from 'react-big-calendar';
import _ from 'lodash'
import moment from 'moment';
import Grid from '@material-ui/core/Grid';
import withStyles from '@material-ui/core/styles/withStyles';
import {bookings2events} from '../../utils/converters';
import { Typography } from '@material-ui/core';
import styles from './ScheduleStyle'
import PropTypes from 'prop-types';
const {isDateAvailable}=require('../../utils/dateutils');
moment.locale('fr');

const localizer = momentLocalizer(moment);

class Schedule extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      title: '',
      eventsSelected: new Set(),
      dayLayoutAlgorithm: 'no-overlap',
      view: Views.MONTH,
    };
  }

  selectSlot = ({start, end, action}) => {
    let newDate = moment(start).format('YYYY-MM-DD');
      if(this.state.eventsSelected.has(newDate)){
        this.setState(({eventsSelected}) => {
          const newChecked = new Set(eventsSelected);
          newChecked.delete(newDate);
          return {
            eventsSelected: newChecked
          };
        }, () => this.props.handleSelection(this.state.eventsSelected));
      }else{
        this.setState(({eventsSelected}) => ({eventsSelected: new Set(eventsSelected).add(newDate)}), () => this.props.handleSelection(this.state.eventsSelected));
      }
  };

  customToolbar = classes => (toolbar) => {

    const label = () => {
      const date = moment(toolbar.date);
      return (
          <span>
            <span>{date.format('MMMM')}</span>
            <span> {date.format('YYYY')}</span>
          </span>
      );
    };

    return (
        <Grid container>
          <Grid className={classes.customToolbarStyle}>
            <Grid>
              <p>{label()}</p>
            </Grid>
          </Grid>
        </Grid >
    );
  };

  render() {
    const { classes, title, subtitle, selectable, height, nbSchedule, bookings} = this.props;
    const { view } = this.state;

    const half=Math.floor(nbSchedule/2);

    let events = bookings2events(bookings.filter( b => b.calendar_display));

    if (view==Views.MONTH) {
      events = _.uniqBy(events, e => e.start.format('DD/MM/YYYY'))
    }


    const CustomMonthDateHeader = (event) =>{
      let newDate = moment(event.date).format('YYYY-MM-DD');

      if(event.isOffRange){
        return null
      }else{
        return(
          <Grid className={classes.containerLabelSelector} onClick={() => this.selectSlot}>
            <Grid className={this.state.eventsSelected.has(newDate) ? classes.labelSelectorActive : classes.labelSelector} >
              <p style={{cursor:'pointer'}}>{event.label}</p>
            </Grid>
          </Grid>
        )
      }
    };

    const MyDateCellWrapper = (event) =>{

      let propsStyle = event.children.props['className'];

      const m=moment(event.value);
      const isAvailable = isDateAvailable(m, this.props.availabilities);

      if(propsStyle === 'rbc-day-bg rbc-off-range-bg'){
        return(
            <Grid className={classes.off_range_style}/>
        )
      }
     else{
        if (isAvailable) {
          return(
            <Grid className={classes.day_style}/>
          )
        }else if(isAvailable && propsStyle === 'rbc-day-bg rbc-today'){
          return (
            <Grid className={classes.today_style_avail}>
              <Grid className={classes.today_style}/>
            </Grid>
          )
        }else if(!isAvailable && propsStyle === 'rbc-day-bg rbc-today'){
          return(
            <Grid className={classes.today_style_off}>
              <Grid className={classes.today_style}/>
            </Grid>
          )
        }
        else {
          return(
            <Grid className={classes.non_available_style}/>
          )
        }
      }
    };

    const MyEventWrapper = () =>{

       return(
            <Grid className={classes.myEventWrapperStyle}/>
        )
    };

    return (
      <Grid className={classes.heightContainer} style={{height: height, overflow: 'hidden'}} >
        { title || subtitle  ?
          <Grid style={{padding: '1%'}}>
            { title ?
              <Grid>
                <Typography className={classes.policySizeTitle}>{title}</Typography>
              </Grid> : null
            }
            { subtitle ?
              <Grid>
                <p className={classes.sizeSchedulle}>{subtitle}</p>
              </Grid> : null
            }
          </Grid>
          : null
        }
        <Grid container spacing={2} style={{padding: '2%'}}>
          {[...Array(nbSchedule)].map((x, i) =>{
            let date = new Date();
            date.setDate(1);
            date.setMonth(date.getMonth() + (i-half));
            const monthStr=moment(date).format('M');
            const selEvents=events.filter( e => moment(e.start).format('M')==monthStr);
              return(
                <Grid item xl={4} lg={4} md={6} sm={6} xs={12} style={{height: 400}} key={i}>
                  <Calendar
                      selectable={selectable}
                      popup={false}
                      culture='fr-FR'
                      localizer={localizer}
                      events={selEvents}
                      views={[this.state.view]}
                      defaultDate={date}
                      onSelectSlot={this.selectSlot}
                      dayLayoutAlgorithm={this.state.dayLayoutAlgorithm}
                      messages={{
                        'today': "Aujourd'hui",
                        "previous":'<',
                        "next":">",
                        "month": "Mois",
                        "week": "Semaine",
                        "day": "Aujourd'hui",
                        "agenda": "Agenda",
                        "event" :"Evénement",
                        "date" : "Date",
                        "time" : "Horaires",
                        'noEventsInRange': 'Aucun évènement dans cette période',
                      }}
                      className={classes.sizeSchedulle}
                      components={{
                        toolbar: this.customToolbar(classes),
                        //event: MyEvent, // used by each view (Month, Day, Week)
                        eventWrapper: MyEventWrapper,
                        //eventContainerWrapper: MyEventContainerWrapper,
                        //dayWrapper: MyDayWrapper,
                        dateCellWrapper: MyDateCellWrapper,
                        //timeSlotWrapper: MyTimeSlotWrapper,
                        //timeGutterHeader: MyTimeGutterWrapper,
                        month:{
                          dateHeader: CustomMonthDateHeader,
                          //header: MyMonthHeader,
                          //event: MyMonthEvent,
                        }
                      }}
                  />
                </Grid>
              )
          }
          )}
        </Grid>

    </Grid>
    )
  }
}

Schedule.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default  withStyles(styles, { withTheme: true }) (Schedule);
