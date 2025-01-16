/**
 * From Visiativ API
 * https://shared.digital.int.my.visiativ.com/api
 */

const path=require('path')
myEnv = require('dotenv').config({ path: path.resolve(__dirname, '../../../../../.env') })
const axios = require('axios');

// Configuration
const AUTH_URL = process.env.API_AUTH_URL
const API_URL = process.env.API_URL
const CLIENT_ID = process.env.API_CLIENT_ID
const CLIENT_SECRET = process.env.API_CLIENT_SECRET
const SCOPE = process.env.API_SCOPE

// Fonction pour obtenir le token OAuth2
async function getAccessToken() {
  try {
    const response = await axios.post(AUTH_URL, new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: SCOPE,
      grant_type: 'client_credentials',
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Erreur lors de la récupération du token :', error.response?.data || error.message);
    throw error;
  }
}

// Fonction pour effectuer une requête avec le token
async function fetchData(endpoint) {
  try {
    const token = await getAccessToken();
    const response = await axios.get(`${API_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Erreur lors de la requête API :', error.response?.data || error.message);
    throw error;
  }
}

// Call visitiv API to create an invitation
const createAccount = async (user, customerId) => {
  const body={
    email: user.email,
    firstname: user.firstname,
    lastname: user.lastname,
    phone: user.phone||undefined,
    //idContactSalesforce: "xxxxxxxxxxxxxxxxxx",
    // TODO: civility
    //civility: 1,
    language: "fr-FR",
    picture: user.picture || undefined,
    preferred_username: user.fullname || undefined,
    // isInternalUser: false,
    // isCustomerAdmin": true,
    // TODO: provide Callback to Visiativ
    redirectionUrl: process.env.SSO_CALLBACK_URL,
    // TODO: role ?
    // role: "'admin' | 'manager' | null",
    // function: "Product Owner"
    customerId,
  }
  try {
    const token = await getAccessToken();
    const response = await axios.post(`${API_URL}/user/link?`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.data;
  } 
  catch (err) {
    throw new Error(err.response?.data?.description || err.message)
  }
}

module.exports={
  createAccount,
}