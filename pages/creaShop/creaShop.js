import React from 'react';
import Layout from '../../hoc/Layout/Layout';
import Grid from '@material-ui/core/Grid';
import styles from './creaShopStyle'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import CreaShopPresentation from '../../components/CreaShop/CreaShopPresentation/CreaShopPresentation';
import Stepper from '../../components/Stepper/Stepper'
import NavigationBarForm from '../../components/CreaShop/NavigationBarForm/NavigationBarForm';
import SelectService from '../../components/CreaShop/SelectService/SelectService';
import SelectPrestation from '../../components/CreaShop/SelectPrestation/SelectPrestation';
import SettingService from '../../components/CreaShop/SettingService/SettingService';
import BookingPreference from '../../components/CreaShop/BookingPreference/BookingPreference';

class creaShop extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      activeStep: 0
    }
  }

  getNextStep = (step) =>{
    this.setState({activeStep: step + 1});
  };

  getPreviousStep = (step) =>{
    this.setState({activeStep: step - 1})
  };

  renderSwitch(param) {
    switch(param) {
      case 0 :
        return <CreaShopPresentation/>;
      case 1 :
        return <SelectService/>;
      case 2 :
        return <SelectPrestation/>;
      case 3 :
        return <SettingService/>;
      case 4 :
        return <BookingPreference/>
    }
  }

  render() {
    const {classes} = this.props;

    return(
      <Layout>
        <Grid className={classes.spacer}/>
        <Grid className={classes.mainContainer}>
          <Grid className={classes.contentStepper}>
            <Stepper activeStep={this.state.activeStep}/>
          </Grid>
          <Grid>
            {this.renderSwitch(this.state.activeStep)}
          </Grid>
        </Grid>
        <Grid className={classes.footerContainer}>
          <hr style={{color: "rgb(255, 249, 249, 0.6)", borderRadius: 10}}/>
          <NavigationBarForm nextStep={this.getNextStep} previousStep={this.getPreviousStep}/>
        </Grid>
      </Layout>
    )
  }

}

creaShop.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
};

export default  withStyles(styles, { withTheme: true }) (creaShop);
