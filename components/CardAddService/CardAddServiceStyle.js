export default theme => ({
  cardMedia: {
    paddingTop: '56.25%', // 16:9
    backgroundImage:  "url(" + "../../static/assets/img/skillsAlfred/bgCardAddService.svg" + ")",
    display: 'block',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right',
    position: 'relative',
  },
  fab: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    margin: theme.spacing(1),
  },
  textStyle:{
    color: '#4fbdd7',
    fontWeight: 'bold',
    fontSize: 'large'
  },
  card: {
    width: '100%',
    height: 'auto',
  },
  cardContent:{
    height: 85,
    display: 'flex',
    flexDirection: 'column-reverse',
    alignItems: 'center'
  },
  cardContentHeader:{
    marginBottom: '2%'
  },
  flexPosition:{
    paddingBottom: 0
  },
  responsiveListContainer:{
    marginTop: 10,
    [theme.breakpoints.down('xs')]: {
      margin: 0,
    },
  }
})
