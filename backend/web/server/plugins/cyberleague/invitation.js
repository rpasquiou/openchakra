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

// Fonction pour effectuer une requête avec le token
async function sendInvitation(user) {
  try {
    const token = await getAccessToken();
    const response = await axios.post(`${API_URL}/user/link?`, user, {
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

// Exemple d'utilisation
// (async () => {
//   try {
//     const data = await fetchData('/user?objectId=bf408034-1d3e-4550-a881-6c66f60cee6a')
//     console.log('Données récupérées :', data)
//   } catch (err) {
//     console.error('Erreur globale :', err.message)
//   }
// })();

(async () => {
    try {
      const data = await sendInvitation({email: 'sebastien.auvray@free.fr', firstname: 'Sébastien', lastname: 'Auvray'})
      console.log('Données récupérées :', data)
    } catch (err) {
      console.error('Erreur globale :', err.message)
    }
  })();
  