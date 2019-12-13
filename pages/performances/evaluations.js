import React, {Fragment} from 'react';
import Link from 'next/link';
import Layout from '../../hoc/Layout/Layout';
import axios from "axios";
import moment from 'moment';
import Grid from "@material-ui/core/Grid";
import Router from "next/router";
import { withStyles } from '@material-ui/core/styles';
import Footer from '../../hoc/Layout/Footer/Footer';
import { Typography } from '@material-ui/core';
import StarRatings from 'react-star-ratings';


moment.locale('fr');

const { config } = require('../../config/config');
const url = config.apiUrl;

const styles = theme => ({
    bigContainer: {
        marginTop: 70,
        flexGrow: 1,
    },
    exportSVG: {
        fontFamily: 'sans-serif!important',
        color: '#2FBCD3',
    },
    exportPNG: {
        fontFamily: 'sans-serif!important',
        color: '#2FBCD3',
    },
    hidesm: {
        minWidth: '271px',
        [theme.breakpoints.down('sm')]: {
            display:'none'
        }
    }

    ,hidelg: {
        [theme.breakpoints.up('md')]: {
            display:'none',
        }

    },
    trigger:{
        [theme.breakpoints.down('sm')]: {
            marginTop: -10,
            width: '100%',
            marginLeft:'0px',
            height:'30px',
            backgroundColor:'#2FBCD3',

            display:'block',
            transition: 'display 0.7s',
            borderRadius:'5px',
            '&:focus': {
                display:'none',
                transition: 'display 0.7s',

            }
        }

    },
    responsiveContainer: {
        [theme.breakpoints.down('sm')]: {
            width:'135%!important',

        }
    }

    ,toggle: {
        [theme.breakpoints.down('sm')]: {  marginLeft:'-75px',
            transition: 'margin-left 0.7s',

            '&:hover': {
                marginLeft:'0px',
                transition: 'margin-left 0.7s',
                boxShadow: '11px 6px 23px -24px rgba(0,0,0,0.75)',

            }
        }
    },
    shopbar:{
        [theme.breakpoints.down('md')]: {
            display: 'none',
        }
    },
    bottombar:{visibility:'hidden', [theme.breakpoints.down('sm')]: {
            visibility:'visible',
            boxShadow: '2px -5px 14px -15px rgba(0,0,0,0.75)'
        }},
    topbar:{visibility:'visible', position: 'sticky', top: 65, zIndex:999,[theme.breakpoints.down('sm')]: {
            visibility:'hidden',
        }},



});

class Evaluations extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            reviews: [],
        }
    }

    componentDidMount() {

        localStorage.setItem('path',Router.pathname);
        axios.defaults.headers.common['Authorization'] = localStorage.getItem('token');

        axios.get(url+'myAlfred/api/performances/evaluations/allReviews')
            .then(res => {
                this.setState({reviews:res.data})
            })
            .catch(err => console.log(err))

    }

    render() {
        const {classes} = this.props;
        const {reviews} = this.state;


        return (
            <Fragment>
                <Layout>
                    <Grid container className={classes.bigContainer} >
                        <Grid container className={classes.topbar} justify="center" style={{backgroundColor: '#4fbdd7',marginTop: -3, height: '52px'}}>
                            <Grid item xs={1} className={classes.shopbar}></Grid>
                            <Grid item xs={2} className={classes.shopbar} style={{textAlign:"center"}}>
                                <Link href={'/myShop/services'}>
                                    <a style={{textDecoration:'none'}}>
                                        <p style={{color: "white",cursor: 'pointer'}}>Ma boutique</p>
                                    </a>
                                </Link>
                            </Grid>
                            <Grid item xs={2} className={classes.shopbar} style={{textAlign:"center"}}>
                                <Link href={'/myShop/messages'}>
                                    <a style={{textDecoration:'none'}}>
                                        <p style={{color: "white",cursor: 'pointer'}}>Messages</p>
                                    </a>
                                </Link>
                            </Grid>
                            <Grid item xs={2} className={classes.shopbar} style={{textAlign:"center"}}>
                                <Link href={'/myShop/mesreservations'}>
                                    <a style={{textDecoration:'none'}}>
                                        <p style={{color: "white",cursor: 'pointer'}}>Mes réservations</p>
                                    </a>
                                </Link>
                            </Grid>
                            <Grid item xs={2} className={classes.shopbar} style={{textAlign:"center"}}>
                                <Link href={'/myShop/myAvailabilities'}>
                                    <a style={{textDecoration:'none'}}>
                                        <p style={{color: "white",cursor: 'pointer'}}>Mon calendrier</p>
                                    </a>
                                </Link>
                            </Grid>
                            <Grid item xs={2} className={classes.shopbar} style={{textAlign:"center",borderBottom: '2px solid white',zIndex:999}}>
                                <Link href={'/performances/revenus'}>
                                    <a style={{textDecoration:'none'}}>
                                        <p style={{color: "white",cursor: 'pointer'}}>Performances</p>
                                    </a>
                                </Link>
                            </Grid>

                        </Grid>

                        <Grid className={classes.toggle}  item xs={3} style={{}}>

                            <div className={classes.trigger}></div>
                            <Grid container style={{justifyContent: 'center',}}>
                                <Grid item style={{marginTop: 30,width: 281}} className={classes.hidesm}>
                                    <Link href={'/performances/revenus'}>
                                        <div style={{border: '0.2px solid lightgrey',lineHeight:'4',paddingLeft:5,paddingRight:5,display:'flex',cursor:"pointer"}}>
                                            <img src={'../static/revenus.svg'} alt={'user'} height={70} width={27} style={{marginRight: 10, marginLeft:10}}/>
                                            <a  style={{fontSize: '1.1rem',cursor:"pointer"}}>
                                                Mes revenus
                                            </a>
                                        </div>
                                    </Link>
                                </Grid>

                                <Grid item style={{marginTop: 30,width: 281}} className={classes.hidelg}>
                                    <Link href={'/performances/revenus'}>
                                        <div style={{lineHeight:'4',paddingLeft:5,paddingRight:5,display:'flex', justifyContent:'center',cursor:"pointer"}}>
                                            <img src={'../static/revenus.svg'} alt={'user'} height={70} width={27} style={{marginRight: 4}}/>
                                            <a  style={{fontSize: '1.1rem',cursor:"pointer"}}>

                                            </a>
                                        </div>
                                    </Link>
                                </Grid>
                                <Grid item style={{marginTop: 10,width: 281}} className={classes.hidesm}>
                                    <Link href={'/performances/statistiques'}>
                                        <div style={{border: '0.2px solid lightgrey',lineHeight:'4',paddingLeft:5,paddingRight:5,display:'flex',cursor:"pointer"}}>
                                            <img src={'../static/view.svg'} alt={'sign'} height={70} width={27} style={{marginRight: 10, marginLeft:10}}/>
                                            <a style={{fontSize: '1.1rem',cursor:"pointer"}}>
                                                Mes statistiques
                                            </a>
                                        </div>
                                    </Link>
                                </Grid>

                                <Grid item style={{marginTop: 10}} className={classes.hidelg}>
                                    <Link href={'/performances/statistiques'}>
                                        <div style={{padding: '30px',lineHeight:'4',paddingLeft:5,paddingRight:5,display:'flex', justifyContent:'center',cursor:"pointer"}}>
                                            <img src={'../static/view.svg'} alt={'sign'} height={70} width={27} style={{marginleft: 4}}/>
                                            <a style={{fontSize: '1.1rem',cursor:"pointer"}}>

                                            </a>
                                        </div>
                                    </Link>
                                </Grid>
                                <Grid item style={{marginTop: 10,width: 281}} className={classes.hidelg}>
                                    <Link href={'/performances/evaluations'}>
                                        <div style={{lineHeight:'4',paddingLeft:5,paddingRight:5,display:'flex', justifyContent:'center',cursor:"pointer"}}>
                                            <img src={'../static/chat-2.svg'} alt={'picture'} height={70} width={27} style={{marginRight: 4}}/>
                                            <a style={{fontSize: '1.1rem',cursor:"pointer"}}>
                                            </a>
                                        </div>
                                    </Link>
                                </Grid>
                                <Grid item style={{marginTop: 10,width: 281}} className={classes.hidesm}>
                                    <Link href={'/performances/evaluations'}>
                                        <div style={{border: '0.2px solid lightgrey',lineHeight:'4',paddingLeft:5,paddingRight:5,display:'flex',cursor:"pointer"}}>
                                            <img src={'../static/chat-2.svg'} alt={'picture'} height={70} width={27} style={{marginRight: 10, marginLeft:10}}/>
                                            <a style={{fontSize: '1.1rem',cursor:"pointer"}}>
                                                Mes évaluations
                                            </a>
                                        </div>
                                    </Link>
                                </Grid>

                                <Grid item style={{marginTop: 10,width: 281}} className={classes.hidelg}>
                                    <Link href={'/performances/historique'}>
                                        <div style={{padding:'30px', lineHeight:'4',paddingLeft:5,paddingRight:5,display:'flex', justifyContent:'center',cursor:"pointer"}}>
                                            <img src={'../static/history.svg'} alt={'check'} height={70} width={27} style={{marginRight: 4}}/>
                                            <a style={{fontSize: '1.1rem',cursor:"pointer"}}>

                                            </a>
                                        </div>
                                    </Link>
                                </Grid>

                                <Grid item style={{marginTop: 10,width: 281}} className={classes.hidesm}>
                                    <Link href={'/performances/historique'}>
                                        <div style={{border: '0.2px solid lightgrey',lineHeight:'2',paddingLeft:5,paddingRight:5,display:'flex',cursor:"pointer"}}>
                                            <img src={'../static/history.svg'} alt={'check'} height={70} width={27} style={{marginRight: 10, marginLeft:10}}/>
                                            <a style={{fontSize: '1.1rem',cursor:"pointer"}}>
                                                Historique des <br/>transactions
                                            </a>
                                        </div>
                                    </Link>
                                </Grid>


                            </Grid>
                        </Grid>

                        <Grid item xs={9} style={{paddingLeft: 20, borderLeft: '#9f919178 solid 1px', marginBottom: '20px',minHeight:530}}>
                            <Grid container style={{marginBottom:20}}>
                                <Grid item xs={12}>
                                    <h1 style={{color: '#7E7E7E',fontWeight: '100'}}>Mes évaluations</h1>
                                </Grid>
                            </Grid>

                            {reviews.map((r,index) => (

                                <React.Fragment key={index}>

                            <Grid container style={{marginTop: '40px'}}>
                                <Grid item xs={6} md={2}>
                                    <img style={{width: '75px', height : '75px', borderRadius: '50%', objectFit: 'cover'}} src={'../../'+r.user.picture} />
                                </Grid>
                                <Grid item xs={6} md={10} style={{marginTop: '10px'}}>
                                    <Typography style={{color: 'rgb(47, 188, 211)',fontSize: '1.2rem'}}>
                                        {r.serviceUser.service.label} pour {r.user.firstname}
                                    </Typography>
                                    <Typography style={{color: '#9B9B9B',fontSize: '1rem'}}>
                                        {moment(r.date).format('DD/MM/YYYY')} - {moment(r.date).format('HH:mm')}
                                    </Typography>
                                </Grid>
                                <Grid container style={{marginTop: '40px'}}>
                                    <Grid item md={2} xs={6}>
                                        <Typography style={{fontSize: '1rem'}}>
                                            Qualité de la prestation
                                        </Typography>
                                    </Grid>
                                    <Grid item md={10} xs={6}>
                                        <StarRatings
                                            rating={r.note_alfred.prestation_quality}
                                            starRatedColor={"#2FBCD3"}
                                            numberOfStars={5}
                                            name='rating'
                                            starDimension={'20px'}
                                            starHoverColor={'#2FBCD3'}
                                            starSpacing={'3px'}
                                        />
                                    </Grid>

                                    <Grid item md={2} xs={6}>
                                        <Typography style={{fontSize: '1rem'}}>
                                            Qualité-prix
                                        </Typography>
                                    </Grid>
                                    <Grid item md={10} xs={6}>
                                        <StarRatings
                                            rating={r.note_alfred.quality_price}
                                            starRatedColor={"#2FBCD3"}
                                            numberOfStars={5}
                                            name='rating'
                                            starDimension={'20px'}
                                            starHoverColor={'#2FBCD3'}
                                            starSpacing={'3px'}
                                        />
                                    </Grid>

                                    <Grid item md={2} xs={6}>
                                        <Typography style={{fontSize: '1rem'}}>
                                            Relationnel
                                        </Typography>
                                    </Grid>
                                    <Grid item md={10} xs={6}>
                                        <StarRatings
                                            rating={r.note_alfred.relational}
                                            starRatedColor={"#2FBCD3"}
                                            numberOfStars={5}
                                            name='rating'
                                            starDimension={'20px'}
                                            starHoverColor={'#2FBCD3'}
                                            starSpacing={'3px'}
                                        />
                                    </Grid>
                                </Grid>
                                <Grid item xs={12} style={{marginTop: '40px', marginBottom: '15px'}}>
                                    <Typography style={{boxShadow: '0px 0px 6px rgba(130, 129, 129, 0.28)', height: '100px', padding: '15px', width: '75%',  borderRadius: '10px'}}>
                                        {r.content}
                                    </Typography>
                                </Grid>
                            </Grid>

                            <Grid container style={{marginTop: '40px', marginBottom: '40px'}}>
                                <Grid item xs={12}>
                                    <hr style={{border: 'none', height: '2px', backgroundColor: '#7E7E7E', width: '80%', margin: 'auto'}}/>
                                </Grid>
                            </Grid>
                                </React.Fragment>
                                ))}

                        </Grid>



                    </Grid>
                </Layout>
                <Grid container className={classes.bottombar} justify="center" style={{backgroundColor: 'white',bottom:0, position:'fixed', zIndex:'999'}}>

                    <Grid item xs={2} style={{textAlign:"center"}}>
                        <Link href={'/myShop/services'}><a style={{textDecoration:'none'}}>
                            <p style={{color: "white",cursor: 'pointer'}}><img src={'../static/shopping-bag.png'} alt={'sign'} width={25} style={{opacity:'0.5'}}></img></p></a>
                        </Link>
                    </Grid>

                    <Grid item xs={2} style={{textAlign:"center"}}>
                        <Link href={'/myShop/messages'}><a style={{textDecoration:'none'}}>
                            <p style={{color: "white",cursor: 'pointer'}}><img src={'../static/speech-bubble.png'} alt={'sign'} width={25} style={{opacity:'0.7'}}></img></p>
                        </a></Link>
                    </Grid>

                    <Grid item xs={2} style={{textAlign:"center"}}>
                        <Link href={'/myShop/mesreservations'}><a style={{textDecoration:'none'}}>
                            <p style={{color: "white",cursor: 'pointer'}}><img src={'../static/event.png'} alt={'sign'} width={25} style={{opacity:'0.7'}}></img></p>
                        </a></Link>
                    </Grid>

                    <Grid item xs={2} style={{textAlign:"center",zIndex:999}}>
                        <Link href={'/myShop/myAvailabilities'}><a style={{textDecoration:'none'}}>
                            <p style={{color: "white",cursor: 'pointer'}}><img src={'../static/calendar.png'} alt={'sign'} width={25} style={{opacity:'0.7'}}></img></p>
                        </a></Link>
                    </Grid>

                    <Grid item xs={2} style={{textAlign:"center", borderBottom: '3px solid #4fbdd7'}}>
                        <Link href={'/performances/revenus'}><a style={{textDecoration:'none'}}>
                            <p style={{color: "white",cursor: 'pointer'}}><img src={'../static/speedometer.png'} alt={'sign'} width={25} style={{opacity:'0.7'}}></img></p>
                        </a></Link>
                    </Grid>

                </Grid>
                <Footer/>



            </Fragment>
        );
    };
}



export default withStyles(styles)(Evaluations);
