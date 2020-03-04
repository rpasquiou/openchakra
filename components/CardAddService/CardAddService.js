import React from 'react';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import styles from './CardAddServiceStyle'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActionArea from '@material-ui/core/CardActionArea';
import Typography from '@material-ui/core/Typography';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import Link from 'next/link';
import Box from '@material-ui/core/Box';
import Badge from '@material-ui/core/Badge';
import RoomIcon from '@material-ui/icons/Room';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Rating from '@material-ui/lab/Rating';

class CardAddService extends React.Component{
  constructor(props){
    super(props);
    this.state = {

    }
  }
  render(){
    const {classes} = this.props;

    return (
      <Grid>
        <Link href={'/myShop/services'}>
          <Card className={classes.card}>
            <CardActionArea>
              <Grid className={classes.cardMedia}>
                <Fab color="primary" aria-label="add" className={classes.fab}>
                  <AddIcon style={{color:'white'}}/>
                </Fab>
              </Grid>
            <CardContent>
              <Grid  className={classes.cardContent}>
                <Grid className={classes.cardContentPosition}>
                  <Grid className={classes.cardContentHeader}>
                    <Typography className={classes.textStyle}>
                      Ajouter un service
                    </Typography>
                  </Grid>
                </Grid>
                <Grid>
                  <Grid className={classes.flexPosition}/>
                </Grid>
              </Grid>
              <Grid className={classes.responsiveListContainer}>
                <List className={classes.flexPosition}>
                  <Grid style={{width: '100%', display: 'flex', justifyContent: 'space-between', height: 35}}>
                  </Grid>
                </List>
              </Grid>
            </CardContent>
            </CardActionArea>
          </Card>
        </Link>
      </Grid>
    )
  }
}

CardAddService.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default  withStyles(styles, { withTheme: true })(CardAddService);
