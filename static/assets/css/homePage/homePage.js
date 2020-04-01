
export default theme => ({
  headerimg: {
    [theme.breakpoints.up('lg')]: { // medium: 960px or larger
      display: 'none',
    },
    /* Center and scale the image nicely */
    backgroundImage: 'url(../../../static/bg.jpg)',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    top: '0%',
    left: '0%',
    zIndex: '2',
    width: '100%',
    minHeight: '122vh',
  },
  headerhomevid: {
    [theme.breakpoints.down('md')]: { // medium: 960px or larger
      backgroundAttachment: "fixed",
      display: 'none',
    },
    /* Center and scale the image nicely */
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
  },
  headeroverlay: {
    [theme.breakpoints.up('lg')]: { // medium: 960px or larger
      backgroundAttachment: "fixed",
      display: 'none',
    },
    position: 'absolute',
    top: '0%',
    left: '0%',
    zIndex: '2',
    width: '100%',
    minHeight: '90vh',
    backgroundImage: 'linear-gradient(to top, rgba(0,0,0,.5), rgba(0,0,0,.4), rgba(0,0,0,.3), rgba(0,0,0,.2), rgba(255,255,255,0))',
  },
  headerhome: {
    color: 'lightgrey',
    fontWeight: 'bold',
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    zIndex: '3',
    textAlign: 'center',
    backgroundColor: 'whitesmoke',
    marginLeft: '5%',
    borderRadius: '10px',
    boxShadow: '6px 6px 5px -6px black',
    padding:'2%',
    marginTop:-10,
    [theme.breakpoints.down('xs')]: { // extra-large: 1920px or larger
      width: '88%',
      left: '45%',
      top: '60%',
    },
    [theme.breakpoints.up('sm')]: { // extra-large: 1920px or larger
      width: '75%',
      left: '45%',
      top: '55%',
    },
    [theme.breakpoints.up('md')]: { // medium: 960px or larger
      width: '40%',
      left: '23%',
      top: '55%',
    },
    [theme.breakpoints.up('lg')]: { // large: 1280px or larger
      width: '28%',
      top: '55%',
      left: '20%',
    },
    [theme.breakpoints.up('xl')]: { // extra-large: 1920px or larger
      width: '31%',
      top: '50%',
      left: '20%',
    },
  },
  headerhome2: {
    color: 'whitesmoke!important',
    fontWeight: 'bold',
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    zIndex: '3',
    padding: '20px',
    textAlign: 'center!important',

    [theme.breakpoints.up('xs')]: { // extra-large: 1920px or larger
      width: '50%',
      left: '50%',
      top: '25%',
    },
    [theme.breakpoints.down('sm')]: { // extra-large: 1920px or larger
      width: '50%',
      left: '50%',
      top: '25%',
      display: 'none'
    },
    [theme.breakpoints.up('md')]: { // medium: 960px or larger
      width: '45%',
      left: '75%',
      top: '50%',
    },
    [theme.breakpoints.up('lg')]: { // large: 1280px or larger
      width: '40%',
      top: '50%',
      left: '75%',
    },
    [theme.breakpoints.up('xl')]: { // extra-large: 1920px or larger
      width: '40%',
      top: '50%',
      left: '75%',
    },
  },
  homeform: {
    color: '#505050!important',
    textAlign: 'left',
    width:'100%',
    fontSize: '28px!important',
    fontFamily: 'Helvetica',
    letterSpacing: '-1px',
    lineHeight: '39px!important',
    paddingLeft: '20px',
  },
  pickerhomelocation: {
    width:'100%',
  },
  button: {
    width:'100%',
    color: 'white',
    padding:15,
    borderRadius:10,
    border:'0px solid transparent',
    '&:hover': {
      backgroundColor: 'darkgray'
    }
  },
  paper: {
    zIndex:'99999',
    position: 'fixed',
    maxWidth: 390,
    backgroundColor: 'white',
    boxShadow: '0 0 7px black',
    padding: 'auto',
    top: '45%',
    left: '0%',
    right: '0%',
    margin:'auto',
  },
});
