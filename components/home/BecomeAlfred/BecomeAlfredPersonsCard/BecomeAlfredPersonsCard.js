import React, { Component } from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Avatar from '@material-ui/core/Avatar';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

const styles = theme => ({
  card: {
    display: 'flex',
    margin: '5px!important',
    minWidth: '300px!important',
    marginRight: '10px!important',
    marginLeft: '10px!important',
  },
  personName: {
    alignSelf: 'center',
    padding: '.5rem',
  },
});

class becomeAlfredPersonsCard extends Component {

  render (props) {  
  const { classes, avatar } = this.props;
  return (
    <Card className={classes.card}>
      <CardContent className={classes.card}>
        <Avatar alt="John Doe" src={avatar} />
        <Typography className={classes.personName}>John Doe</Typography>
      </CardContent>
    </Card>
  )
}
}

becomeAlfredPersonsCard.propTypes = {
  classes: PropTypes.objectOf(PropTypes.string).isRequired,
  img: PropTypes.string.isRequired,
};

export default withStyles(styles)(becomeAlfredPersonsCard);