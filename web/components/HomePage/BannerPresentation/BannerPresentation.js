import React from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import {BANNER_PRESENTATION} from '../../../utils/i18n';

class BannerPresentation extends React.Component{
  constructor(props) {
    super(props);

  }

  render(){
    const {style} = this.props;
    return (
      <Grid className={style.bannerPresentationMainStyle}>
        <Grid className={style.bannerPresentationContainerDescription}>
          <Grid>
            <h1 className={style.bannerPresentationTitle}>{BANNER_PRESENTATION.title}</h1>
          </Grid>
          <Grid className={style.bannerPresentationContainerText}>
            <h2 className={style.bannerPresentationText}>{BANNER_PRESENTATION.text}</h2>
          </Grid>
          <Grid>
            <Button variant="contained" classes={{root: style.bannerPresentationButton}}>{BANNER_PRESENTATION.button}</Button>
          </Grid>
        </Grid>
      </Grid>
    );
  }

}

export default BannerPresentation
