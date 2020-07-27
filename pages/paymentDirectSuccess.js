import React, {Fragment} from 'react';
import Link from 'next/link';
import Layout from '../hoc/Layout/Layout';
import axios from "axios";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Router from "next/router";
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import Footer from '../hoc/Layout/Footer/Footer';
import io from "socket.io-client";
import cookie from 'react-cookies'


const styles = theme => ({
    bigContainer: {
        flexGrow: 1,

    },

});

class paymentDirectSuccess extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: {},

        };

    }

    static getInitialProps ({ query: { id } }) {
        return { id: id }
    }


    componentDidMount() {
        const id = this.props.id;
        this.setState({booking_id: id})


        localStorage.setItem('path',Router.pathname);
        axios.defaults.headers.common['Authorization'] = cookie.load('token')
        axios
            .get("/myAlfred/api/users/current")
            .then(res => {
                let user = res.data;
                this.setState({ user: user });
            })
            .catch(err => {
                if (err.response.status === 401 || err.response.status === 403) {
                    cookie.remove('token', { path: '/' })
                    Router.push({ pathname: "/login" });
                }
            });
        this.socket = io();
        this.socket.on("connect", socket => {
            this.socket.emit("booking", id)
            axios.put('/myAlfred/api/booking/modifyBooking/' + id, {status: 'Confirmée'})
                .then(res => {
                    setTimeout(()=>this.socket.emit("changeStatus", res.data),100)

                })
                .catch()
        })

    }




    render() {
        const {classes} = this.props;



        return (
            <Fragment>
                <Layout>
                    <Grid container className={classes.bigContainer}>

                        {/*Le Header */}

                        {/*Le Contenu */}
                        <Grid container>
                            <br></br>
                            {/*Contenu à Gauche*/}

                            {/*Petite Description*/}
                            <Grid item md={5} xs={12} style={{textAlign: 'left',margin: '0 auto', float:'right', paddingLeft:'3%'}}>
                                <div style={{margin: '20px 11%', marginTop: '5%',width: '90%'}}></div>
                                <Grid container>

                                    <Grid item xs={12} style={{marginTop:50, marginBottom:30}}>
                                        <h2 style={{fontSize: '2.5rem',color: 'rgba(84,89,95,0.95)',letterSpacing: -1, fontWeight: '100', textAlign:'center'}}>Réservation enregistrée !</h2>

                                    </Grid>
                                </Grid>
                                <br></br>



                                <div>

                                    <Grid container>

                                        <Grid item xs={12} style={{textAlign:'center'}}>
                                            <p style={{fontSize:'30px'}}>Toute l’équipe de My-Alfred vous remercie pour votre réservation. </p>

                                            <Link href={'/reservations/allReservations'}>
                                                <Button variant={"contained"} color={"primary"} style={{color:'white'}}>Mes réservations</Button>
                                            </Link>


                                            <br></br>

                                        </Grid>

                                    </Grid>

                                </div>



                                {/*cadre avec couleur et checkbox*/}






                            </Grid>

                            {/*Contenu à droite*/}
                            <Grid item xs={12} md={7} style={{marginTop: '2%', marginBottom: '5%'}}>
                                <Grid container style={{ backgroundImage: `url('../../static/resa.svg')`,backgroundPosition: "cover", backgroundRepeat:'no-repeat', border: 'thin solid transparent',maxWidth: '100%', height:'90vh', padding:'2%', position: 'sticky', top: 100,}}>

                                </Grid> </Grid>
                        </Grid>    </Grid>
                </Layout>
                <Footer/>

            </Fragment>
        );
    };
}



export default withStyles(styles)(paymentDirectSuccess);
