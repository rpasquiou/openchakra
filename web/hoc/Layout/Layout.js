import React, {Fragment} from 'react';
import NavBar from './NavBar/NavBar';
import Footer from './Footer/Footer';
import cookie from "react-cookies";
import styles from '../../static/css/pages/layout/layoutStyle'
import {withStyles} from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import InfoBar from "../../components/InfoBar/InfoBar";
import ScrollMenu from '../../components/ScrollMenu/SrollMenu'
import axios from "axios";
import TrustAndSecurity from "./TrustAndSecurity/TrustAndSecurity";
import Divider from "@material-ui/core/Divider";


class Layout extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      logged: false,
      categories: []
    }
  }

  componentDidMount() {
    const token = cookie.load('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = cookie.load('token');
      this.setState({logged: true});
      axios.get('/myAlfred/api/category/all/sort').then(res => {
        let cat = res.data;
        this.setState({categories: cat})
      }).catch(err => { console.error(err)})
    }
  }

  render() {
    const {children, user, selectedAddress, classes, gps, indexCat} = this.props;
    const {logged, categories} = this.state;

    return (
      <Fragment>
        <InfoBar style={classes} />
        <NavBar style={classes} user={user} selectedAddress={selectedAddress} logged={logged} />
        <Grid className={classes.searchMenuScrollMenuContainer}>
          <Grid className={classes.searchScrollmenuContainer}>
            <ScrollMenu style={classes} categories={categories} gps={gps} indexCat={indexCat}/>
          </Grid>
        </Grid>
        {children}
        <Grid style={{marginTop: '5%'}}>
          <Divider style={{height: 2, width: '100%'}}/>
        </Grid>
        <Grid style={{width: '100%', display: 'flex', justifyContent: 'center', marginTop: '1%'}}>
          <Grid style={{width: '90%'}}>
            <TrustAndSecurity/>
          </Grid>
        </Grid>
        <Grid className={classes.mainContainerStyleFooter}>
          <Grid className={classes.generalWidthFooter}>
            <Footer style={classes}/>
          </Grid>
        </Grid>
      </Fragment>
    );
  }
}

export default withStyles(styles, {withTheme: true})(Layout);
