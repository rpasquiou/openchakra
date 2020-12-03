import React from 'react';
import Checkbox from '@material-ui/core/Checkbox'
import Link from 'next/link';
const moment = require('moment-timezone');
moment.locale('fr');

class StatusCellRenderer extends React.Component {

  constructor(props) {
    super(props)
    this.state= {
      value: props.value,
      data: props.data,
    }
  }

  render = () => {
    return (
      <>
      <div>
      {this.state.value.alfred ?
        <a href={`/shop?id_alfred=${this.state.data._id}`} target={'_blank'}>}
          <img src="/static/assets/img/userServicePreview/alfred.svg" style={{width: '40px'}} title='Alfred' />
        </a>
       : null }
      {this.state.value.admin ? <img src="/static/assets/img/userServicePreview/admin.svg" style={{width: '40px'}} title='Admin' /> : null }
      </div>
      </>
    )
  }
}

class StatusCellFilter extends React.Component {

  constructor(props) {
    super(props)
    this.params=props
    this.state={
      alfred: false,
      admin: false,
    }
  }

  onChange = event => {
    this.setState({[event.target.name]: event.target.checked}, () => {
      this.params.filterChangedCallback()
    })
  }

  doesFilterPass = params => {
    const data = params.data
    if (this.state.alfred && !data.is_alfred || this.state.admin && !data.is_admin) {
      return false
    }
    return true
  }

  setModel = model => {
    this.setState(model)
  }

  getModel = () => {
    return this.state
  }

  isFilterActive = () => {
    return this.state.alfred || this.state.admin
  }

  render = () => {
    return (
      <div>
        <Checkbox name={'alfred'} checked={this.state.alfred} onChange={this.onChange} />
          <img src="/static/assets/img/userServicePreview/alfred.svg" style={{width: '40px'}} title='Alfred' />
        <br/>
        <Checkbox name={'admin'} checked={this.state.admin} onChange={this.onChange} />
          <img src="/static/assets/img/userServicePreview/admin.svg" style={{width: '40px'}} title='Admin' />
      </div>
    )
  }
}

class DateCellRenderer extends React.Component {

  constructor(props) {
    super(props)
    this.state= {
      value: props.value
    }
  }

  render = () => {
    return (
      <>{moment(this.state.value).format('L LT')}</>
    )
  }
}

class MangopayCellRenderer extends React.Component {

  constructor(props) {
    super(props)
    this.state= {
      value: props.value
    }
  }

  render = () => {
    return (
      <a target="_blank"
         href={`https://dashboard.mangopay.com/User/${this.state.value}/Details`}>{this.state.value}</a>
    )
  }
}

class PictureCellRenderer extends React.Component {

  constructor(props) {
    super(props)
    this.state= {
      value: props.value
    }
  }

  render = () => {
    return (
      <a href={`/${this.state.value}`} target='_blank'>
        <img style={{ width:'auto', height:'auto'}} src={`/${this.state.value}`} />
      </a>
    )
  }
}

class LinkEdit extends React.Component {

    constructor(props) {
      super(props)
      this.state= {
        value: props.value
      }
    }

    render = () => {
      return (
        <Link href={`/dashboard/services/view?id=${this.state.value}`}><a>Modifier</a></Link>
      )
    }
}

module.exports= {StatusCellRenderer, DateCellRenderer, MangopayCellRenderer, StatusCellFilter, PictureCellRenderer, LinkEdit}
