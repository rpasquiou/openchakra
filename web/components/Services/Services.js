import React from 'react'
import CardService from '../Card/CardService/CardService'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'


class Services extends React.Component {

  constructor(props) {
    super(props)
  }


  render() {
    const {shop, onDelete}=this.props

    if (!shop.services) {
      return null
    }

    const part_services = shop.services.filter(s => s.particular_access)
    const pro_services = shop.services.filter(s => s.professional_access)

    return (
      <React.Fragment>
        { part_services.length==0 ? null :
          <>
            <Grid>
              <Typography>Services aux particuliers ({part_services.length})</Typography>
            </Grid>
            <Grid container spacing={2} style={{marginTop: 50, marginLeft: 0, marginRight: 0, marginBottom: 0, width: '100%'}}>
              {
                part_services.map((s, index) => (
                  <Grid item xl={3} lg={4} md={6} sm={12} xs={12} key={index}>
                    <CardService item={s._id} page={0} profileMode={true} onDelete={onDelete}/>
                  </Grid>
                ))
              }
            </Grid>
          </>
        }
        { shop.is_particular || pro_services.length==0 ? null :
          <>
            <Grid>
              <Typography style={{marginTop: '20px'}}>Services aux professionnels ({pro_services.length})</Typography>
            </Grid>
            <Grid container spacing={2} style={{marginTop: '5vh'}}>
              {
                pro_services.map((s, index) => (
                  <Grid item xl={3} xs={12} sm={6} md={3} lg={3} key={index}>
                    <CardService item={s._id} page={0} profileMode={true} onDelete={onDelete}/>
                  </Grid>
                ))
              }
            </Grid>
          </>
        }
      </React.Fragment>
    )
  }
}

export default Services
