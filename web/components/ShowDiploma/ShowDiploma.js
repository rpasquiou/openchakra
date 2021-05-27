import React from 'react';
import withStyles from "@material-ui/core/styles/withStyles";
import Grid from "@material-ui/core/Grid";
import styles from '../../static/css/components/ShowDiploma/ShowDiploma';
import axios from "axios";
import Typography from "@material-ui/core/Typography";
import Chip from "@material-ui/core/Chip";
const {setAxiosAuthentication}=require('../../utils/authentication');



class ShowDiploma extends React.Component{
  constructor(props) {
    super(props);
    this.state={
      services: [],
    }
  }

  componentDidMount() {
    setAxiosAuthentication();

    axios.get(`/myAlfred/api/shop/alfred/${this.props.user}`)
      .then(response => {
        let shop = response.data;
        this.setState({
          shop: shop,
          services: shop.services,
        })
      }).catch(err => console.error(err))

  }



  render() {
    const {classes} = this.props;
    const {services} = this.state;
    const diploma = services.map(res => res.diploma).filter(r => Boolean(r))

    console.log(`Diplômes:${JSON.stringify(diploma)}`)
    return(
      <Grid container spacing={2} style={{margin: 0, width:'100%'}}>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          <h3>Diplômes</h3>
        </Grid>
        <Grid container spacing={2} item xl={12} lg={12} md={12} sm={12} xs={12} style={{margin: 0, width: '100%'}}>
          {
            diploma ?
              diploma.map( res => {
                return(
                  <>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                      <h4 style={{margin:0}}>{res.name}</h4>
                    </Grid>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                      <Typography>Diplôme obtenu en {res.year}</Typography>
                    </Grid>
                    {
                      res.skills && res.skills.length > 0 ?
                        <Grid item xl={12} lg={12} md={12} sm={12} xs={12} className={classes.chipsContainer}>
                          {
                            res.skills.map( s => {
                              return(
                                <Chip
                                  label={`#${s}`}
                                />
                              )
                            })
                          }
                        </Grid> : null
                    }

                  </>
                )
              }) : null
          }
        </Grid>
      </Grid>
    )
  }
}

export default withStyles(styles)(ShowDiploma);
