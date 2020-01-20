import Grid from '@material-ui/core/Grid';
import LinkMaterial from '@material-ui/core/Link';
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import styles from './AboutStyle'
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import List from '@material-ui/core/List';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import CheckCircle from '@material-ui/icons/CheckCircle';
import HighlightOff from '@material-ui/icons/HighlightOff';
import CalendarToday from '@material-ui/icons/CalendarToday';
import Chat from '@material-ui/icons/Chat';
import StarIcon from '@material-ui/icons/Star';
import Box from '@material-ui/core/Box';
import Rating from '@material-ui/lab/Rating';

class About extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      dense: false,
      secondary: false,
      valueRating: 3,
      isChecked: false
    }
  }
  render(){
    const {classes} = this.props;
    const preventDefault = event => event.preventDefault();

    const StyledRating = withStyles({
      iconFilled: {
        color: '#4fbdd7',
      },
    })(Rating);

    return (
      <Grid container className={classes.mainContainer}>
        <Grid item>
          <div>
            <List dense={this.state.dense}>
              <ListItem>
                <Box component="fieldset" mb={3} borderColor="transparent">
                  <StyledRating name="read-only" value={this.state.valueRating} readOnly/>
                </Box>
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <StarIcon />
                </ListItemAvatar>
                <LinkMaterial href="#" onClick={preventDefault} color="primary "className={classes.link}>10 Commentaires</LinkMaterial>
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <CheckCircle />
                </ListItemAvatar>
                <ListItemText
                  primary="Pièce d’identité vérifiée"
                  secondary={this.state.secondary ? 'Secondary text' : null}
                />
              </ListItem>
              {this.state.isChecked ?
                <ListItem>
                  <ListItemAvatar>
                    <HighlightOff />
                  </ListItemAvatar>
                  <ListItemText
                    primary="Pièce d’identité non vérifiée"
                    secondary={this.state.secondary ? 'Secondary text' : null}
                  />
                </ListItem>
                : null
              }
              <ListItem>
                <ListItemAvatar>
                  <CalendarToday />
                </ListItemAvatar>
                <ListItemText
                  primary="Membre depuis Juin 2019"
                  secondary={this.state.secondary ? 'Secondary text' : null}
                />
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <img src={'../../static/assets/img/iconCardAlfred/iconCastor.svg'} alt={'iconCastor'} title={'iconCastor'}/>
                </ListItemAvatar>
                <ListItemText
                  primary="Alfred depuis Juin 2019 "
                  secondary={this.state.secondary ? 'Secondary text' : null}
                />
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <Chat />
                </ListItemAvatar>
                <ListItemText
                  primary="Langue: français - anglais"
                  secondary={this.state.secondary ? 'Secondary text' : null}
                />
              </ListItem>
              <ListItem>
                <LinkMaterial href="#" onClick={preventDefault} color="primary "className={classes.link}>Voir le profil</LinkMaterial>
              </ListItem>
            </List>
          </div>
        </Grid>
      </Grid>
    )
  }
}

About.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default  withStyles(styles, { withTheme: true })(About);
