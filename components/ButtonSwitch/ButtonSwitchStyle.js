export default theme => ({
  contentFiltre:{
    display:'flex',
    alignItems: 'flex-end',
    height: 50,
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      height: 'auto',
      alignItems: 'flex-start',
      flexDirection: 'column',
    }
  },
  responsiveIOSswitch:{
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    }
  },
  responsiveIOSswitchContent:{
    display:'flex',
    width:'50%',
    alignItems: 'flex-end',
    justifyContent:'end',
    [theme.breakpoints.down('sm')]: {
      width:'100%',
      justifyContent:'start',
    }
  },
  textField: {
    width: '70px',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  textFieldEditable:{
    width: 250,
    [theme.breakpoints.down('lg')]: {
      width: 'auto'
    }
  },
  fontSizeTextField:{
    fontSize: '0.875rem',
    fontFamily: 'Helvetica',
    fontWeight: 400,
    lineHeight: 1.43,
  }
})
