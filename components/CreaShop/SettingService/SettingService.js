import React from 'react';
import Grid from '@material-ui/core/Grid';
import styles from '../componentStyle'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';
import ButtonSwitch from '../../ButtonSwitch/ButtonSwitch';
import axios from 'axios';

class SettingService extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      location: {},
      service: null,
      travel_tax: null,
      pick_tax: null,
      selectedEquipments: []
    };
    this.stateButton = this.stateButton.bind(this);
    this.onLocationChange = this.onLocationChange.bind(this);
    this.onOptionChange = this.onOptionChange.bind(this);
    this.onEquipmentChecked = this.onEquipmentChecked.bind(this);
  }

  stateButton(e){
    let name = e.target.name;
    console.log(name);
    this.setState({[e.target.name]: !this.state[name]});
  }

  componentDidMount() {
    console.log("Mounted:"+this.props.service);
    axios.get(`/myAlfred/api/service/${this.props.service}`)
      .then(response => {
        let service = response.data;
        console.log("Got service:"+JSON.stringify(service, null, 2));
        let location = {};
        Object.keys(service.location).forEach (k => {
          if (service.location[k]) location[k]=false;
        });
        this.setState({
          service: service,
          location: location
        });
      })
      .catch(error => {
        console.log(error);
      })
  }

  onLocationChange(loc_id, checked) {
    let loc = this.state.location;
    loc[loc_id]=checked;
    this.setState({location: loc}, () => this.fireOnChange());
  }

  onOptionChange(opt_id, checked, price) {
    this.setState({[opt_id]: checked ? price : null}, () => this.fireOnChange());
  }

  onEquipmentChecked(event){
    if(this.state.selectedEquipments.includes(event.target.name)){
      let array = [...this.state.selectedEquipments];
      let index = array.indexOf(event.target.name);
      if (index !== -1) {
        array.splice(index, 1);
        this.setState({selectedEquipments: array}, () => this.fireOnChange());
      }
    }else{
      this.setState({ selectedEquipments: [...this.state.selectedEquipments, event.target.name] }, () => this.fireOnChange())
    }
  }

  fireOnChange(){
    this.props.onChange(this.state.location, this.state.travel_tax, this.state.pick_tax, this.state.selectedEquipments)
  }

  render() {
    const {classes} = this.props;
    const {service} = this.state;

    return (
      <Grid className={classes.mainContainer}>
        <Grid className={classes.contentContainer}>
          <Grid>
            <Grid className={classes.contentLeftTop}>
              <Grid className={classes.contentTitle}>
                <Typography className={classes.policySizeTitle}>{service? service.label: ''} : paramétrage</Typography>
              </Grid>
              { service && service.equipments.length>0 ? 
              <React.Fragment>
              <Grid >
                <h3 className={classes.policySizeSubtitle}>Quel(s) produit(s) / matériel(s) fournissez-vous dans le cadre de ce service ? </h3>
              </Grid>
              <Grid className={classes.bottomSpacer}>
                <Grid container spacing={2}>
                  {service.equipments.map((result) => {
                    return (
                      <Grid item xl={3} xs={4}>
                        <label style={{cursor: 'pointer'}}>
                          {
                            this.state.selectedEquipments.includes(result._id) ?
                            <img src={`../../static/equipments/${result.logo.slice(0, -4)}_Selected.svg`} height={100} width={100} alt={`${result.name_logo.slice(0, -4)}_Selected.svg`} />
                            :
                              <img src={`../../static/equipments/${result.logo}`} height={100} width={100} alt={result.name_logo} />}

                          <Checkbox style={{display: 'none'}} color="primary" type="checkbox" name={result._id} checked={this.state.selectedEquipments.includes(result._id)} onChange={this.onEquipmentChecked} />
                        </label>
                      </Grid>
                    )
                  })
                  }
                </Grid>
              </Grid>
              </React.Fragment>:null
              }
              <Grid>
                <Grid>
                  <h3 className={classes.policySizeSubtitle}>Où acceptez-vous de réaliser votre prestation ?</h3>
                </Grid>
                <Grid style={{marginLeft : 15}}>
                  { "client" in this.state.location ?
                    <Grid>
                      <ButtonSwitch label={"A l'adresse de mon client"} isOption={false} isPrice={false} id='client' onChange={this.onLocationChange} />
                    </Grid>:null
                  }
                  { "alfred" in this.state.location ?
                  <Grid>
                    <ButtonSwitch label={"A mon adresse"} isOption={false} isPrice={false} id='alfred' onChange={this.onLocationChange} />
                  </Grid>:null
                  }
                  { "visio" in this.state.location ?
                  <Grid >
                    <ButtonSwitch label={"En visioconférence"} isOption={false} isPrice={false} id='visio' onChange={this.onLocationChange} />
                  </Grid>:null
                  }
                  { "ext" in this.state.location ?
                  <Grid>
                    <ButtonSwitch label={"En extérieur"} isOption={false} isPrice={false} id='ext' onChange={this.onLocationChange} />
                  </Grid>:null
                  }
                </Grid>
              </Grid>
              <Grid style={{marginLeft : 15}} className={classes.options}>
                { service && (service.travel_tax||service.pick_tax)  ?
                  <Grid>
                    <h3 className={classes.policySizeSubtitle}>Options</h3>
                  </Grid> : null
                }
                { service && service.travel_tax ?
                  <Grid>
                    <ButtonSwitch id='travel_tax' label={"Appliquer un forfait déplacement de"} isOption={false} isPrice={true} onChange={this.onOptionChange} />
                  </Grid>:null
                }
                { service && service.pick_tax ?
                  <Grid>
                    <ButtonSwitch id='pick_tax' label={"Proposer un forfait retrait & livraison de"} isOption={false} isPrice={true} onChange={this.onOptionChange} />
                  </Grid>:null
                }
              </Grid>
            </Grid>
          </Grid>
          <Grid className={classes.contentRight}/>
        </Grid>
      </Grid>
    );
  }
}

SettingService.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default  withStyles(styles, { withTheme: true }) (SettingService);
