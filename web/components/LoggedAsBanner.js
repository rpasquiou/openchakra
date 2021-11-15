import {withTranslation} from 'react-i18next'

import {getLoggedUser, isLoggedAs} from '../utils/context'
import React from 'react'

class LoggedAsBanner extends React.Component {

  render = () => {
    const {t} = this.props
    if (!isLoggedAs()) {
      return null
    }
    return (
      <div style={{textAlign: 'center', backgroundColor: 'red', fontSize: 'x-large'}}>{t('COMMON.logged_as', {user: getLoggedUser().firstname})}</div>
    )
  }
}

module.exports = withTranslation('custom', {withRef: true})(LoggedAsBanner)
