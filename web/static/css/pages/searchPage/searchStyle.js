export default theme => ({
  bigContainer: {
    overflowX: 'hidden',
    overflowY: 'hidden',
  },
  media: {
    height: '250px!important',
    position: 'relative',
    objectFit: 'cover',
  },

  separatorBlue: {
    width: '150px',
  },
  containerTitle: {
    marginTop: 70,
    [theme.breakpoints.down('xs')]: {
      marginTop: 200,
    },
  },

  containerCardPreview: {
    padding: 5,
  },
  paddingResponsive: {
    [theme.breakpoints.down('xs')]: {
      padding: '0 !important',
      marginBottom: 20,
    },
  },

  paginationRoot:{
    '& .MuiPaginationItem-page.Mui-selected':{
      backgroundColor: 'rgba(248, 207, 97, 1)',
      color: 'white'
    }
  },









  /***** new css***/

  navbarRoot: {
    marginLeft: 20,
    flex: 1,
    fontFamily: theme.typography.text.fontFamily,
    fontSize: theme.typography.placeHolder.fontSize,
    fontWeight:  theme.typography.placeHolder.fontWeight,
    lineHeight:  theme.typography.placeHolder.lineHeight,
  },
  navbarInput:{
    '&::placeholder':{
      opacity: '0.55',
      color: theme.palette.placeHolder.main,
    }
  },
  searchNavbarComponentPosition:{
    display: 'flex',
    width: '100%',
    justifyContent: 'center'
  },
  searchFilterMenuPosition:{
    width: '100%',
    display: 'flex',
    justifyContent: 'center'
  },
  searchFilterMenuContent:{
    width: '80%'
  },





  filterMenuTitleContainer:{
    marginTop: '5%',
    textAlign: 'center'
  },
  filterMenuChipContainer:{
    marginTop: '2%',
    display: 'flex',

  },

  searchMainConainer:{
    marginTop: '2%'
  },
  searchContainerHeader:{
    display: 'flex',
    width: '80%'
  },
  searchMainContainerHeader:{
    display: 'flex',
    justifyContent: 'center',
  },
  searchSecondFilterContainer:{
    display:'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%'
  },
  searchSecondFilterContainerLeft:{
    marginRight: 20
  },
  searchMainContainerResult:{
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    marginTop: '4%',
    [theme.breakpoints.down('xs')]:{
      justifyContent: 'initial'
    }

  },

  searchContainerDisplayResult:{
    width: '70%',
    [theme.breakpoints.down('sm')]:{
      width: '90%',
    },
    [theme.breakpoints.down('xs')]:{
      width: '95%'
    }
  },

  searchMainContainer:{
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.down('xs')]:{
      marginBottom: '20vh'

    }
  },

  cardServiceButton:{
    color: theme.palette.white.main,
    fontWeight: theme.typography.blackButton.fontWeight,
    fontFamily: theme.typography.blackButton.fontFamily,
    backgroundColor: theme.palette.black.main,
    borderRadius: theme.border.blackButton.borderRadius,
    width: '100%'
  },
  cardServiceButtonContainer:{
    width: '50%'
  },



  searchFilterRightContainer:{
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row'
  },
  searchFilterRightLabel:{
    marginRight: 10
  },
  searchSelectPadding:{
    paddingRight: '34px !important'
  },
  filterMenuTitle:{
    fontFamily: theme.typography.subTitle.fontFamily
  },
  filterMenuDescription:{
    fontFamily: theme.typography.fontFamily
  },
  filterMenuAccordionTitle:{
    display: 'flex',
    justifyContent: 'center'
  },
  filterMenuAccordionContainer:{
    borderRadius: '32px !important'
  },
  searchNeedHelpMainStyle:{
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    marginTop: '3%',
    marginBottom: '3%',
  },
  searchNeedHelpMainContainer:{
    width: '80%'
  },
  searchSearchByHastagMainStyle:{
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    marginTop: '3%',
    marginBottom: '3%',
  },
  searchSearchByHastagContainer:{
    width: '80%'
  },


  searchResultMessage:{
    display: 'flex',
    justifyContent: 'center',
    width: '100%'
  },
  searchResultMessageContent:{
    width: '80%'
  },




  filterMenuContainerStatut:{
    borderRadius: '15px',
    backgroundColor: '#2FBCD3',
    boxShadow: 'rgba(125, 125, 125, 0.5) 0px 0px 10px 3px inset',
    cursor: 'pointer',
    height: '45px',
  },
  filterMenuTextStatus:{
    color: 'white',
  },
  filterMenuTextNotFocused:{
  },
  filterMenuContentMainStyle:{
    borderRadius: '15px',
    backgroundColor: 'white',
    boxShadow: 'rgba(164, 164, 164, 0.5) 0px 0px 5px 0px',
    height: 'auto',
    zIndex: 1,
    position: 'relative',
  },
  filterMenuContentMainStyleDateFilter:{
    borderRadius: '15px',
    backgroundColor: 'white',
    boxShadow: 'rgba(164, 164, 164, 0.5) 0px 0px 5px 0px',
    height: 'auto',
    zIndex: 1,
    position: 'relative',
    padding: 10,
    width: '140%'
  },
  filTerMenuStatusMainStyleFilterDate:{
    width: '15%',
    marginLeft: '2%',
    [theme.breakpoints.down('md')]:{
      width: '50%'
    }
  },
  filterMenuFocused:{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: theme.palette.white.main
  },
  filterMenuStatusNotFocused:{
    boxShadow: 'rgba(164, 164, 164, 0.5) 0px 0px 5px 0px',
    cursor: 'pointer',
    height: 45,
    borderRadius: '15px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  filterMenuDateFocused:{
    borderRadius: '15px',
    backgroundColor: '#2FBCD3',
    boxShadow: 'rgba(125, 125, 125, 0.5) 0px 0px 10px 3px inset',
    cursor: 'pointer',
    height: 45,

  },
  filTerMenuStatusMainStyleFilter:{
    width: '15%',
    [theme.breakpoints.down('md')]:{
      width: '50%'
    }
  },
  filterMenuTextFocused:{
    color: theme.palette.white.main
  },
  filterMenuControlLabel:{
    margin: 0,
    verticalAlign: 'inherit'
  },
  filterMenuDateFilterButtonContainer:{
    display: 'flex',
    justifyContent: 'space-evenly'
  },
  searchLoadingContainer:{
    display: 'flex',
    justifyContent : 'center',
    alignItems: 'center',
    marginTop: '10vh',
    marginBottom: '10vh'
  },

})
