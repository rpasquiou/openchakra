export default theme => ({
  spacer:{
    width: '100%',
    height: 50
  },
  mainContainer:{
    display: "flex",
    flexDirection: "row"
  },
  marginContainer:{
    position: 'relative',
    top: 150,
    width: '60%',
    [theme.breakpoints.down('md')]: {
      top: 150,
      width: '100%',
    },
    [theme.breakpoints.down('xs')]: {
      marginLeft: 40,
      marginRight : 40,
    },
  },
  marginContainerNoImg:{
    position: 'relative',
    top: 150,
    width: '100%',
    [theme.breakpoints.down('md')]: {
      top: 150,
    },
    [theme.breakpoints.down('xs')]: {
      display: 'flex',
      justifyContent: 'center'
    },
  },

  mainHeader:{
    width: "100%",
    display: "flex",
    position: 'fixed',
    zIndex: 1,
    alignItems: 'center',
    backgroundColor:'white',
    [theme.breakpoints.down('md')]: {
      height: 150,
    },
    [theme.breakpoints.down('xs')]: {
      height: 150,
    },
  },
  imageContentHeader:{
    width: '10%',
    margin: 'auto',
    [theme.breakpoints.down('md')]: {
      width: '20%',
    },
    [theme.breakpoints.down('xs')]: {
      width: '50%',
    },
  },
  contentStepper:{
    width: '90%',
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  },
  leftContentComponent:{
    height : '100%',
    display: 'flex',
    flexDirection : 'column',
    justifyContent: 'space-between',
    marginBottom: 100,
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },
  mainContainerNoImg:{
    width: '100%',
    height : '100%',
    display: 'flex',
    flexDirection : 'column',
    justifyContent: 'space-between',
  },
  rightContentComponent:{
    width: '40%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    top: 150,
    [theme.breakpoints.down('md')]: {
      display: 'none'
    },
  },
  contentRight: {
    width: 'auto',
    height: '70vh',
    display: 'block',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center'

  },
  footerMainContainer:{
    width: '100%',
    backgroundColor: 'white',
    position: 'fixed',
    bottom: 0,
    [theme.breakpoints.down('xs')]: {
      zIndex: 1
    },
  },
  footerContainer:{
    height: '100%',
    width: '100%',
  },
  marginHr:{
    marginLeft: 200,
    marginRight: 200,
    [theme.breakpoints.down('xs')]: {
      marginLeft: 0,
      marginRight : 0,
    },
  },
  navButtonContent:{
    display: 'flex',
    marginRight: 200,
    marginLeft: 200,
    justifyContent: 'space-between',
    marginBottom: 15,
    [theme.breakpoints.down('xs')]: {
      marginLeft: 40,
      marginRight : 40,
    },
  },
  nextButton:{
    color: 'white'
  },
  scheduleResponsive: {
    marginLeft: 200,
    marginRight: 200,
    marginBottom: 250,
    [theme.breakpoints.down('xs')]: {
      marginLeft: 5,
      marginRight: 5,
      backgroundColor : 'green'

    }
  },
  bodyContainer:{
    display: 'flex',
    marginLeft: 200,
    marginRight: 200,
    marginBottom: 100,
    [theme.breakpoints.down('xs')]: {
      marginLeft: 5,
      marginRight: 5,
    }

  }
})
