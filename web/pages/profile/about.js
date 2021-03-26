import SummaryCommentary from "../../components/SummaryCommentary/SummaryCommentary";

const {snackBarSuccess, snackBarError} = require('../../utils/notifications');
const {setAxiosAuthentication}=require('../../utils/authentication')
import React from 'react'
import Grid from "@material-ui/core/Grid";
import ProfileLayout from '../../hoc/Layout/ProfileLayout'
import About from '../../components/About/About'
import Presentation from '../../components/Presentation/Presentation'
import Skills from '../../components/Skills/Skills'
import Badges from '../../components/Badges/Badges'
import Hashtags from '../../components/Hashtags/Hashtags'
import {withStyles} from '@material-ui/core/styles';
import styles from '../../static/css/pages/profile/about/about';
import Hidden from "@material-ui/core/Hidden";
import AskQuestion from "../../components/AskQuestion/AskQuestion";
import Box from "../../components/Box/Box";
import LayoutMobileProfile from "../../hoc/Layout/LayoutMobileProfile";
import axios from "axios";
import Typography from "@material-ui/core/Typography";
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import IconButton from "@material-ui/core/IconButton";
import CreateIcon from "@material-ui/icons/Create";
import {isEditableUser} from "../../utils/functions";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import Topic from "../../hoc/Topic/Topic";
import AlgoliaPlaces from "algolia-places-react";
import MultipleSelect from "react-select";
import {LANGUAGES} from "../../utils/consts";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import CloseIcon from "@material-ui/icons/Close";
import {is_mode_company} from "../../utils/context";
const moment=require('moment');
moment.locale('fr');

const DialogTitle = withStyles(styles)((props) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography {...other} className={classes.root}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});


class ProfileAbout extends React.Component {

  constructor(props) {
    super(props);
    this.state={
      user: props.user,
      alfred:null,
      showEdition: false,
      enabledEdition: true,
      languages: {},
      billing_address: {},
      newAddress: null,
      userLanguages: [],
      newLanguages: null,
    }

  }
  componentDidMount = () => {
    this.loadUser();
  };

  openEdition = () => {
    const {alfred}=this.state;

    this.setState({
      showEdition: true,
      languages: alfred.languages.map(l => ({value: l, label: l})),
      newAddress: alfred.billing_address
    }, () => this.objectsEqual())
  };

  loadUser = () => {
    this.setState({showEdition: false});
    setAxiosAuthentication();
    axios.get(`/myAlfred/api/users/users/${this.props.user}`)
      .then( res => {
        const user = res.data;
        this.setState( {
          alfred: user,
          userLanguages:  user.languages.map(l => ({value: l, label: l})),
          billing_address: user.billing_address
        })
      })
      .catch (err => console.error(err))
  };

  closeEditDialog = () => {
    this.setState({showEdition: false, newLanguages: null, newAddress: null})
  };

  objectsEqual = () => {
    let o1 = this.state.languages;
    let o2 = this.state.userLanguages;
    let o3 = this.state.newAddress ? this.state.newAddress.gps : null;
    let o4 = this.state.billing_address.gps;

    if(o1 && o1.length !== 0 && o3 !== null){
      if(o1.join('') === o2.join('') && o3.lat === o4.lat && o3.lng === o4.lng){
        this.setState({enabledEdition: true})
      }else if(o1.join('') !== o2.join('') || o3.lat !== o4.lat && o3.lng !== o4.lng){
        this.setState({enabledEdition: false})
      }else{
        this.setState({enabledEdition: false})
      }
    }else{
      this.setState({enabledEdition: true})
    }
  };

  save = () => {
    const {newAddress, languages} = this.state;
    setAxiosAuthentication();
    axios.put('/myAlfred/api/users/profile/billingAddress', newAddress).then( res =>{
        axios.put('/myAlfred/api/users/profile/languages', {languages: languages.map(l => l.value)}).then( res =>{
            snackBarSuccess('Profil modifié avec succès');
            setTimeout(this.loadUser, 1000)
          }
        ).catch(err => {
          console.error(err)
        })
      }
    ).catch( err => {
        console.error(err)
      }
    );
  };

  modalEditDialog = (classes) =>{
    const {newAddress, showEdition, enabledEdition, languages}=this.state;
    const placeholder = newAddress ? `${newAddress.city}, ${newAddress.country}` : 'Entrez votre adresse';

    return(
      <Dialog
        open={showEdition}
        onClose={this.closeEditDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        classes={{root: classes.mydialogContainer}}
      >
        <DialogTitle id="customized-dialog-title" onClose={this.closeEditDialog}/>
        <DialogContent>
          <Topic titleTopic={'Modifiez vos informations'} titleSummary={'Ici, vous pouvez modifier vos informations'} underline={true} />
          <Grid container>
            <Grid container>
              <Grid item xs={12} lg={12} style={{marginTop: '2vh'}}>
                <Typography style={{fontWeight: 'bold', textTransform: 'initial'}}>Lieu d'habitation</Typography>
              </Grid>
              <Grid item style={{width:'100%', marginTop: '3vh', marginBottom: '3vh'}}>
                <AlgoliaPlaces
                  key={moment()}
                  placeholder={placeholder}
                  options={{
                    appId: 'plKATRG826CP',
                    apiKey: 'dc50194119e4c4736a7c57350e9f32ec',
                    language: 'fr',
                    countries: ['fr'],
                    type: 'address',

                  }}
                  onChange={this.onAddressChanged}
                  onClear = {() => this.onAddressChanged(null)}
                />
              </Grid>
            </Grid>
            <Grid container>
              <Grid item xs={12} lg={12}  style={{marginTop: '2vh'}}>
                <Typography style={{fontWeight: 'bold', textTransform: 'initial'}}>Langues parlées</Typography>
              </Grid>
              <Grid item xs={12} style={{marginTop: '3vh', marginBottom: '3vh'}}>
                <MultipleSelect
                  key={moment()}
                  value={languages}
                  onChange={this.onLanguagesChanged}
                  options={LANGUAGES}
                  styles={{
                    menu: provided => ({...provided, zIndex: 2}),
                  }}
                  isMulti
                  isSearchable
                  closeMenuOnSelect={false}
                  placeholder={'Sélectionnez vos langues'}
                  noOptionsMessage={() => 'Plus d\'options disponibles'}
                />
              </Grid>
            </Grid>
            <Grid style={{marginTop: '2vh', width: '100%'}}>
              <Divider/>
              <Grid style={{marginTop: '2vh', width: '100%'}}>
                <Button
                  onClick={() => {
                    this.save();
                  }}
                  variant="contained"
                  color={'primary'}
                  classes={{root: classes.buttonSave}}
                  disabled={enabledEdition}
                >
                  Modifier
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    )
  };

  onAddressChanged = result => {

    const newAddress = result ?
      {
        city: result.suggestion.city,
        address: result.suggestion.name,
        zip_code: result.suggestion.postcode,
        country: result.suggestion.country,
        gps:{
          lat: result.suggestion.latlng.lat,
          lng: result.suggestion.latlng.lng,
        }
      }
      :
      null;
    this.setState({newAddress: newAddress}, () => this.objectsEqual())
  };

  onLanguagesChanged = languages => {
    this.setState({languages: languages}, () => this.objectsEqual())
  };

  static getInitialProps({query: {user}}) {
    return {user: user};
  }

  content = (classes, user, alfred) =>{
    const editable = isEditableUser(user);


    return(
      <Grid container spacing={3} style={{marginBottom: '12vh'}}>
        <Hidden only={['xs']}>
          <Grid item xl={5} lg={5} md={12} sm={12} xs={12}>
            <Box>
              <About user={user} />
            </Box>
          </Grid>
        </Hidden>
        <Hidden only={['sm','md','lg','xl']}>
          <Grid item xs={12} style={{marginTop: '5vh', position: 'relative'}}>
            { editable ?
              <Grid style={{position: 'absolute', right: 5}}>
                <IconButton aria-label="edit" onClick={this.openEdition}>
                  <CreateIcon />
                </IconButton>
              </Grid>
              :
              null
            }
            <Grid style={{display: 'flex', flexDirection: 'row'}}>
              <Grid>
                <Typography style={{color: 'rgba(39,37,37,35%)'}}>Habite à </Typography>
              </Grid>
              <Grid style={{margin: 3}}/>
              <Grid>
                <Typography style={{color:'black'}}>{alfred ? alfred.billing_address.city + ", " + alfred.billing_address.country : null}</Typography>
              </Grid>
            </Grid>
            <Grid style={{display: 'flex', flexDirection: 'row', marginTop: '4vh'}}>
              <Grid>
                <Typography style={{color: 'rgba(39,37,37,35%)'}}>Parle </Typography>
              </Grid>
              <Grid style={{margin: 3}}/>
              <Grid>
                <Typography style={{color:'black'}}>{alfred ? alfred.languages.join(', ') : null}</Typography>
              </Grid>
            </Grid>
            {
              alfred ?
                alfred.id_confirmed ?
                  <Grid style={{display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: '4vh'}}>
                    <Grid>
                      <Typography style={{color: 'rgba(39,37,37,35%)'}}>{alfred ? alfred.firstname : null}</Typography>
                    </Grid>
                    <Grid style={{margin: 3}}/>
                    <Grid>
                      <Typography style={{color:'black'}}>à un profil vérifié</Typography>
                    </Grid>
                    <Grid>
                      <CheckCircleOutlineIcon/>
                    </Grid>
                  </Grid> : null : null
            }
          </Grid>
        </Hidden>
        <Grid item xl={7} lg={7} md={12} sm={12} xs={12}>
          <Box>
            <Presentation user={user} classes={classes}/>
          </Box>
        </Grid>
        {
          is_mode_company() ?
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
              <Box>
                <SummaryCommentary user={user} />
              </Box>
            </Grid>
            : null
        }
        <Grid item xl={8} lg={8} md={6} sm={12} xs={12}>
          <Box>
            <Skills alfred={user} />
          </Box>
        </Grid>
        <Grid item xl={4} lg={4} md={6} sm={12} xs={12}>
          <Box>
            <Badges user={user} />
          </Box>
        </Grid>
        { false ?
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12} className={classes.aboutHastagsContainer}>
            <Box>
              <Hashtags user={user} />
            </Box>
          </Grid>
          :
          null
        }
        {
          !editable ?
            <Hidden only={['sm', 'xs']}>
              <Grid item style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
                <Grid style={{width: '70%'}}>
                  <AskQuestion user={user}/>
                </Grid>
              </Grid>
            </Hidden> : null
        }

      </Grid>
    )
  };

  render() {
    const {classes, user}=this.props;
    const {alfred}=this.state;

    if(!user && alfred){
      return null
    }

    return (
      <React.Fragment>
        <Hidden only={['xs']}>
          <ProfileLayout user={user}>
            {this.content(classes, user, alfred)}
          </ProfileLayout>
        </Hidden>
        <Hidden only={['lg', 'xl',  'sm', 'md']}>
          <LayoutMobileProfile user={user} currentIndex={4}>
            {this.content(classes, user, alfred)}
          </LayoutMobileProfile>
        </Hidden>
        {this.modalEditDialog(classes) }
      </React.Fragment>
    )
  }
}

export default withStyles(styles)(ProfileAbout)
