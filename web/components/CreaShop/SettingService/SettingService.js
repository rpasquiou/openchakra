import {withTranslation} from 'react-i18next'
import InputAdornment from '@material-ui/core/InputAdornment'
const {setAxiosAuthentication} = require('../../../utils/authentication')
import React from 'react'
import Grid from '@material-ui/core/Grid'
import styles from '../../../static/css/components/SettingService/SettingService'
import TravelTax from '../../TravelTax/TravelTax'
import {withStyles} from '@material-ui/core/styles'
import ButtonSwitch from '../../ButtonSwitch/ButtonSwitch'
import axios from 'axios'
import isEmpty from '../../../server/validation/is-empty'
import TextField from '@material-ui/core/TextField'
import {SHOP} from '../../../utils/i18n'
import '../../../static/assets/css/custom.css'

// TODO : régler le pb du ButtonSwitch frais de déplacements
class SettingService extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      location: props.location || {},
      travel_tax: props.travel_tax || null,
      pick_tax: props.pick_tax || 0,
      perimeter: props.perimeter,
    }
    this.stateButton = this.stateButton.bind(this)
    this.onLocationChange = this.onLocationChange.bind(this)
    this.onOptionChanged = this.onOptionChanged.bind(this)
  }

  stateButton(e) {
    let name = e.target.name
    this.setState({[e.target.name]: !this.state[name]})
  }

  handleChange(key, value) {
    this.setState({[key]: value}, () => this.fireOnChange())
  }

  componentDidMount() {
    setAxiosAuthentication()
    axios.get(`/myAlfred/api/service/${this.props.service}`)
      .then(response => {
        let service = response.data
        let location = this.state.location
        if (isEmpty(location)) {
          Object.keys(service.location).forEach(k => {
            if (service.location[k]) {
              location[k] = true
            }
          })
        }
        this.setState({
          service: service,
          location: location,
        }, () => this.fireOnChange())
      })
      .catch(error => {
        console.error(error)
      })
  }

  onChange = event => {
    const {name, value} = event.target
    this.setState({[name]: value}, this.fireOnChange,
    )
  }

  onLocationChange(loc_id, checked) {
    let loc = this.state.location
    loc[loc_id] = checked
    this.setState({location: loc}, () => this.fireOnChange())
  }

  onOptionChanged(opt_id, checked, price) {
    this.setState({[opt_id]: checked ? price : null}, () => this.fireOnChange())
  }

  onTravelTaxChanged = travel_tax => {
    this.setState({travel_tax: travel_tax}, () => this.fireOnChange())
  }

  fireOnChange() {
    this.props.onChange(this.state.location, this.state.travel_tax, this.state.pick_tax, this.state.perimeter)
  }

  render() {
    const {classes} = this.props
    const {service, location, pick_tax, travel_tax, perimeter} = this.state

    return (
      <Grid container spacing={3} style={{margin: 0, width: '100%'}}>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12} className={classes.titleContainer}>
          <h2 className={classes.policySizeTitle}>{SHOP.settingService.title}</h2>
        </Grid>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          <h3 style={{color: '#403f3f'}} className={'customsettingservicesubtitle'}>{SHOP.settingService.subtitle}</h3>
        </Grid>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12} className={'customsettingserviceperimetercontainer'}>
          <h4 className={`customsettingserviceperimeter ${classes.policySizeSubtitle}`} style={{margin: 0}}>{SHOP.settingService.title_perimeter}</h4>
        </Grid>
        <Grid item xl={3} lg={3} md={3} sm={3} xs={12} className={'customsettingserviceperimetercontainer'}>
          <TextField
            id="standard-start-adornment"
            variant={'outlined'}
            InputProps={{
              endAdornment: <InputAdornment position="start">{SHOP.settingService.unity_perimeter}</InputAdornment>,
            }}
            value={perimeter}
            classes={{root: 'customsettingservicetextfieldperimeter'}}
            name={'perimeter'}
            type={'number'}
            onChange={this.onChange}
          />
        </Grid>
        <Grid container spacing={1} style={{width: '100%', margin: 0}} item xl={12} lg={12} md={12} sm={12} xs={12} className={'customsettingserviceplacecontainer'}>
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
            <h4 className={`customsettingserviceplacetitle ${classes.policySizeSubtitle}`}
              style={{margin: 0}}>{SHOP.settingService.title_place_service}</h4>
          </Grid>
          {'client' in this.state.location ?
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
              <ButtonSwitch
                checked={location.client === true}
                label={SHOP.settingService.service_at_userHome}
                id='client'
                onChange={this.onLocationChange}
              />
            </Grid> : null
          }
          {'alfred' in location ?
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
              <ButtonSwitch
                checked={location.alfred === true}
                label={SHOP.settingService.service_at_myHome}
                id='alfred'
                onChange={this.onLocationChange}
              />
            </Grid> : null
          }
          {'visio' in location ?
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
              <ButtonSwitch
                checked={location.visio === true}
                label={SHOP.settingService.service_withVisio}
                id='visio'
                onChange={this.onLocationChange}
              />
            </Grid> : null
          }
        </Grid>
        <Grid container spacing={1} style={{width: '100%', margin: 0}} item xl={12} lg={12} md={12} sm={12} xs={12} className={'customsettingserviceoptioncontainer'}>
          {(service && service.travel_tax || service && service.pick_tax) ?
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
              <h4 className={`customsettingserviceoption ${classes.policySizeSubtitle}`}
                style={{margin: 0}}>{SHOP.settingService.section_option_title}</h4>
            </Grid> : null
          }
          {service && service.travel_tax && location.client &&
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
              <TravelTax tax={travel_tax} onChange={this.onTravelTaxChanged}/>
            </Grid>
          }
          {service && service.pick_tax &&
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
              <ButtonSwitch
                checked={!!pick_tax}
                price={pick_tax}
                id='pick_tax'
                label={SHOP.settingService.propose_delivery}
                isPrice={true}
                onChange={this.onOptionChanged}
              />
            </Grid>
          }
        </Grid>
      </Grid>
    )
  }
}

export default withTranslation()(withStyles(styles)(SettingService))
