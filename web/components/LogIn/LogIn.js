import React, {useState} from 'react'
import CustomButton from '../CustomButton/CustomButton'
import ReactHtmlParser from 'react-html-parser'
import {withTranslation} from 'react-i18next'
import {withStyles} from '@material-ui/core/styles'
import styles from './LogInStyle'
import Grid from '@material-ui/core/Grid'
import {Link} from '@material-ui/core'
const {setAuthToken, setAxiosAuthentication}=require('../../utils/authentication')
import Validator from 'validator'
import axios from 'axios'
import MailOutlineIcon from '@material-ui/icons/MailOutline'
import LockOpenOutlinedIcon from '@material-ui/icons/LockOpenOutlined'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import InputAdornment from '@material-ui/core/InputAdornment'
import IconButton from '@material-ui/core/IconButton'
import Input from '@material-ui/core/Input'
const {snackBarError}=require('../../utils/notifications')
const {PROVIDERS, ROLES} = require('../../utils/consts')
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import GroupOutlinedIcon from '@material-ui/icons/GroupOutlined'
import {EMPLOYEE} from '../../utils/consts'
const {isB2BStyle}=require('../../utils/context')
import CustomIcon from '../CustomIcon/CustomIcon'


const Login = ({callRegister, t, classes}) => {

  const [state, setState] = useState({
    username: '',
    password: '',
    errors: {},
    showPassword: false,
    // Roles : null : pas de réposne du serveur, [] : réponse serveur pas de rôle pour l'email
    roles: null,
    selectedRole: null,
  })

  const {errors, username, password, showPassword, roles, selectedRole} = state
  const showRoles = isB2BStyle() && roles && roles.length >= 1
  const loginDisabled = roles == null || (roles.length>0 && !selectedRole) || !password

  const onChange = e => {
    const {name, value} = e.target
    setState({...state, [name]: value})
  }

  const checkRoles = e => {
    const {name, value} = e.target

    const newState = {...state, [name]: value}

    if(name === 'username') {
      Object.assign(newState, {roles: null})
      // TODO aller chercher les rôles au bout d'une tepo, sinon GET /roles trop nombreux
      const usermail = e.target.value
      if (Validator.isEmail(usermail)) {
        axios.get(`/myAlfred/api/users/roles/${usermail}`)
          .then(res => {
            const roles = res.data
            const filteredRoles = roles.filter(r => (isB2BStyle() ? r != EMPLOYEE : r == EMPLOYEE))
            const selectedRole = filteredRoles.length == 1 ? filteredRoles[0] : null
            // console.log({roles: filteredRoles, selectedRole: selectedRole})
            Object.assign(newState, {roles: filteredRoles, selectedRole: selectedRole})
          })
          .catch(err => {
            console.error(err)
            Object.assign(newState, {selectedRole: null, roles: ''})
          })
      }
    }
    setState({...newState})
  }

  const onSubmit = e => {
    e.preventDefault()

    const user = {
      username: username,
      password: password,
      role: selectedRole,
      b2b_login: isB2BStyle(),
    }

    axios.post('/myAlfred/api/users/login', user)
      .then(() => {
        setAuthToken()
        setAxiosAuthentication()
        this.props.login()
      })
      .catch(err => {
        console.error(err)
        if (err.response) {
          snackBarError(err.response.data)
          setState({...state, errors: err.response.data})
        }
      })
  }

  const handleClickShowPassword = () => {
    setState({...state, showPassword: !showPassword})
  }

  const handleMouseDownPassword = event => {
    event.preventDefault()
  }

  return <div>
    <h2 className={classes.titleRegister}>{ReactHtmlParser(t('LOGIN.title'))}</h2>
    <Grid container spacing={3} className={classes.containerDialogContent}>
      <Grid item className={classes.margin}>
        <Grid container spacing={1} alignItems="flex-end" className={classes.genericContainer}>
          <Grid item>
            <CustomIcon displayName className={'customloginmailicon'} style={{height: 24, width: 24, backgroundSize: 'contain'}} materialIcon={<MailOutlineIcon className={classes.colorIcon}/>}/>
          </Grid>
          <Grid item className={classes.widthTextField}>
            <Input
              label={ReactHtmlParser(t('LOGIN.input_label'))}
              placeholder={ReactHtmlParser(t('LOGIN.input_label_placeholder'))}
              style={{width: '100%', marginTop: 16, marginBottom: 8}}
              name="username"
              value={username}
              onChange={onChange}
              onBlur={checkRoles}
              error={errors.username}
            />
            <em>{errors.username}</em>
          </Grid>
        </Grid>
      </Grid>
      <Grid item className={classes.margin}>
        <Grid container spacing={1} alignItems="flex-end" className={classes.genericContainer}>
          <Grid item>
            <CustomIcon className={'customloginlockicon'} style={{height: 24, width: 24, backgroundSize: 'contain'}} materialIcon={<LockOpenOutlinedIcon className={classes.colorIcon}/>}/>
          </Grid>
          <Grid item className={classes.widthTextField}>
            <Input
              id="standard-with-placeholder"
              label={ReactHtmlParser(t('LOGIN.input_password'))}
              placeholder={ReactHtmlParser(t('LOGIN.input_password_placeholder'))}
              style={{width: '100%', marginTop: 16, marginBottom: 8}}
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={password}
              onChange={onChange}
              error={errors.password}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    tabIndex="-1"
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              }
            />
            <em>{errors.password}</em>
          </Grid>
        </Grid>
      </Grid>
      {showRoles ?
        <Grid item className={classes.margin}>
          <Grid container className={classes.genericContainer}>
            <Grid container spacing={1} alignItems="flex-end" className={classes.genericContainer}>
              <Grid item>
                <GroupOutlinedIcon className={classes.colorIcon}/>
              </Grid>
              <Grid item className={classes.widthTextField}>
                <FormControl className={classes.formControl}>
                  <InputLabel id="demo-simple-select-label">{ReactHtmlParser(t('LOGIN.input_role'))}</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={selectedRole}
                    onChange={onChange}
                    name={'selectedRole'}
                  >
                    {
                      Object.keys(roles).map((role, index) => (
                        <MenuItem key={index} value={roles[role]}>{ROLES[roles[role]]}</MenuItem>
                      ))
                    }
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
        </Grid> : null
      }
      <Grid item className={classes.margin}>
        <Grid container className={classes.genericContainer}>
          <CustomButton onClick={onSubmit} disabled={loginDisabled} variant="contained" color="primary" classes={{root: `custombuttonlogin ${classes.buttonlogin}`}}>
            {ReactHtmlParser(t('LOGIN.button'))}
          </CustomButton>
        </Grid>
      </Grid>
      <Grid item className={classes.margin}>
        <Grid container className={classes.genericContainer} style={{flexDirection: 'column'}}>
          <Link href={'/forgotPassword'}><a color="primary" className={`customloginforgetpassword ${classes.forgetPassword}`}>{ReactHtmlParser(t('LOGIN.forgotten_password'))}</a></Link>
          <a color="primary" onClick={callRegister} className={`customloginredirectionlink ${classes.redirectionSignin}` }>{ReactHtmlParser(t('LOGIN.register_yet'))}</a>
        </Grid>
      </Grid>
    </Grid>
  </div>
}

 
export default withTranslation('custom', {withRef: true})(withStyles(styles)(Login))
