import {Link, Typography} from '@material-ui/core'
const {TEXT_FILTER} = require('../../server/utils/filesystem')
import CustomButton from '../../components/CustomButton/CustomButton'
import {withTranslation} from 'react-i18next'
import axios from 'axios'
const {setAxiosAuthentication, clearAuthenticationToken}=require('../../utils/authentication')

import React from 'react'
import Card from '@material-ui/core/Card'
import Grid from '@material-ui/core/Grid'
import DashboardLayout from '../../hoc/Layout/DashboardLayout'
import Router from 'next/router'
import Paper from '@material-ui/core/Paper'
import HomeIcon from '@material-ui/icons/Home'
import TextField from '@material-ui/core/TextField'
const {BigList}=require('../../components/BigList/BigList')

class DataImport extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedFile: null,
      comments: null,
      errors: null,
      fields: [],
    }
    this.fileRef = React.createRef()
  }

  componentDidMount() {
    localStorage.setItem('path', Router.pathname)
    setAxiosAuthentication()
    axios.get('/myAlfred/api/admin/prospect/fields')
      .then(response => {
        const fields=response.data
        this.setState(fields)
      })
      .catch(err => {
        console.error(err)
      })
  }

  onFileChange = event => {
    this.setState({errors: null, comments: null})
    const file=event.target.files[0]
    if (!TEXT_FILTER.filter(file.name)) {
      this.setState({errors: TEXT_FILTER.message})
      this.fileRef.current.value=''
    }
    this.setState({selectedFile: event.target.files[0]})
  }


  onImportClick = () => {
    const {importURL}=this.props
    this.setState({comments: null, errors: null})
    const data = new FormData()
    data.append('buffer', this.state.selectedFile)
    axios.post(importURL, data)
      .then(response => {
        this.setState({comments: response.data})
      })
      .catch(err => {
        this.setState({errors: err.response.data.errors})
      })
    // Clear input file to avoid ERR_UPLOAD_FILE_CHANGED
    this.fileRef.current.value=''
    this.setState({selectedFile: null})
  }


  render() {
    const {comments, errors, selectedFile} = this.state

    return (
      <Card>
        <Grid item style={{display: 'flex', justifyContent: 'center'}}>
          <Typography style={{fontSize: 30}}>Import Excel</Typography>
        </Grid>
        <Grid item style={{display: 'flex', justifyContent: 'center'}}>
              Sélectionnez un fichier .csv ou .txt, séparateur point-virgule
        </Grid>
        <Grid item style={{display: 'flex', justifyContent: 'center', marginTop: '20px'}}>
          <input ref={this.fileRef} type="file" name="file" id="file" onChange={this.onFileChange}/>
        </Grid>
        <Grid item style={{display: 'flex', justifyContent: 'center', marginTop: '20px'}}>
          {comments}
          <em style={{color: 'red'}}>{errors}</em>
        </Grid>
        <Grid item style={{display: 'flex', justifyContent: 'center', marginTop: '10px'}}>
          <CustomButton disabled={!selectedFile} onClick={this.onImportClick}>Importer</CustomButton>
        </Grid>
      </Card>
    )
  }
}

module.exports=withTranslation('custom', {withRef: true})(DataImport)
