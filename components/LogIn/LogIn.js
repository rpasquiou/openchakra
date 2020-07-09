import React from 'react'
import {withStyles} from '@material-ui/core/styles';
import styles from './LogInStyle';
import Grid from '@material-ui/core/Grid';
import { Typography } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import Link from 'next/link';
import Button from '@material-ui/core/Button';
import setAuthToken from '../../utils/setAuthToken';
import axios from 'axios';
import Router from "next/router";
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import LockOpenOutlinedIcon from '@material-ui/icons/LockOpenOutlined';
import OAuth from '../OAuth';
import cookie from 'react-cookies'


class LogIn extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            username: '',
            password: '',
            errors: {}
        };
        this.providers = ['google', 'facebook']
    }

    onChange = e => {
        this.setState({ [e.target.name]: e.target.value });
    };

    onSubmit = e => {
        e.preventDefault();

        const user = {
            username: this.state.username,
            password: this.state.password
        };

        axios.post('/myAlfred/api/users/login',user)
            .then(res => {
                const token = cookie.load('token')
                setAuthToken(token);
                axios.put('/myAlfred/api/users/account/lastLogin')
                    .then(data => {
                        let path = localStorage.getItem('path');
                        this.props.login()
                    })
                    .catch(err=> console.error(err));
            })
            .catch(err => {
                console.error(err);
                if (err.response) {
                    this.setState({errors: err.response.data});
                }
            })
    };

    render(){
        const { classes } = this.props;
        const {errors} = this.state;
        return (
            <Grid className={classes.fullContainer}>
                <Grid style={{width: '100%'}}>
                    <Grid className={classes.newContainer}>
                        <Grid item className={classes.loginContainer}>
                            <Typography style={{ fontSize: 30 }}>Connexion</Typography>
                            <img src={'../static/background/connexion.svg'} alt={'bienvenu'} style={{width:100, height:100}}/>
                        </Grid>
                        <Grid className={classes.containerDialogContent}>
                            <form onSubmit={this.onSubmit} style={{marginBottom:15}}>
                                <Grid className={classes.margin}>
                                    <Grid container spacing={1} alignItems="flex-end"  className={classes.genericContainer}>
                                        <Grid item>
                                            <MailOutlineIcon className={classes.colorIcon}/>
                                        </Grid>
                                        <Grid item className={classes.widthTextField}>
                                            <TextField
                                                label="Email"
                                                placeholder="Email"
                                                margin="normal"
                                                style={{ width: '100%' }}
                                                type="email"
                                                name="username"
                                                value={this.state.username}
                                                onChange={this.onChange}
                                                error={errors.username}
                                            />
                                            <em>{errors.username}</em>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid className={classes.margin}>
                                    <Grid container spacing={1} alignItems="flex-end" className={classes.genericContainer}>
                                        <Grid item>
                                            <LockOpenOutlinedIcon className={classes.colorIcon}/>
                                        </Grid>
                                        <Grid item className={classes.widthTextField}>
                                            <TextField
                                                id="standard-with-placeholder"
                                                label="Mot de passe"
                                                placeholder="Mot de passe"
                                                margin="normal"
                                                style={{ width: '100%' }}
                                                type="password"
                                                name="password"
                                                value={this.state.password}
                                                onChange={this.onChange}
                                                error={errors.password}
                                            />
                                            <em>{errors.password}</em>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item style={{ display: 'flex', justifyContent: 'center', marginTop: 30}}>
                                    <Button type="submit" variant="outlined" color="primary" style={{ width: '100%',color: 'white' }}>
                                        Connexion
                                    </Button>
                                </Grid>
                            </form>
                        </Grid>
                        <Grid item style={{display:'flex',flexDirection:'column', marginBottom: '10%'}}>
                            <Link href={"/forgotPassword"}><a color="primary" style={{textDecoration: 'none', color: '#2FBCD3'}}>Mot de passe oublié ?</a></Link>
                            <a color="primary" onClick={this.props.callRegister} style={{textDecoration: 'none', color: '#2FBCD3', cursor: 'pointer'}}>Pas encore inscrit ? Inscrivez-vous !</a>
                        </Grid>
                        <Grid item style={{display:'flex',justifyContent: 'center', marginTop: 5}}>
                            <div>
                                <hr className={classes.hrStyle}/>
                                {this.providers.map(provider =>
                                    <OAuth
                                        provider={provider}
                                        key={provider}
                                    />
                                )}
                            </div>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}
export default withStyles(styles)(LogIn);
