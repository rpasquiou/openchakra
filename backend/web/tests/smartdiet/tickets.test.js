const axios=require('axios')

const POST_URL=`https://pro.smartdiet.fr/ws/application-ticket`

axios.interceptors.request.use(function (config) {
  // Log the POST data
  console.log('POST Data:', config.headers);
  return config;
}, function (error) {
  // Do something with request error
  return Promise.reject(error);
});

describe('Jira tickets tests ', () => {

  it('must create a ticket', async() => {
    const config = {
      headers: {
        common: {
          'Content-Type': 'text/plain'
        }
      }
    };
  
    const data={
      subject: 'Sujet du ticket',
      message: 'Message du ticket',
      priority: 5,
      sender: 'sebastien.auvray@wappizy.com',
      tag: 'PATIENT'
    }

    const res=await axios.post(POST_URL, JSON.stringify(data), config).catch(console.error)
    console.log(res)
  })

})
