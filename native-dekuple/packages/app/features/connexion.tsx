import {useState, useEffect, useRef} from 'react'
// import Metadata from './dependencies/Metadata' /* TO THINK */
// import axios from 'axios' /* NEW */
import {YStack, Image, Text, Input, Button, ScrollView, LinearGradient} from '@my/ui'/* NEW */
import {Flex} from 'app/components/Chakra'
import {View} from 'react-native'
import {ImageBackground} from 'react-native'
import axios from 'axios'
import withDynamicButton from 'app/components/dependencies/hoc/withDynamicButton'

// import { ChakraProvider } from '@chakra-ui/react' /* DEPRECATED */
// import { Flex, Image, Text, Input, Button } from '@chakra-ui/react' /* DEPRECATED */

// import Fonts from './dependencies/theme/Fonts'
// import { useLocation } from 'react-router-dom'
// import { useUserContext } from './dependencies/context/user'
import {createParam} from 'solito'
import { API_ROOT } from 'app/components/dependencies/utils/actions'

const {useParam} = createParam()

const DynamicButton = withDynamicButton(Button)

const Connexion = () => {

  const L9Q1LOD21AW77 = useRef(null)
  const L9Q1N7TC32JK4 = useRef(null)
  
  // const query = new URLSearchParams(useLocation().search) /* DEPRECATED */
  
  const [user] = useParam('user')
  const myAll = useParam('loggedUser') || useParam('id')
  console.log(myAll)
  console.log('useParam', myAll)
  const id = user
  console.log(id)

  // const id = query.get('user') || query.get('id')
  // const { user } = useUserContext()
  const get = axios.get

  const [root, setRoot] = useState([])
  const [refresh, setRefresh] = useState(false)

  const reload = () => {
    setRefresh(!refresh)
  }

  useEffect(() => {
    get(`${API_ROOT}/user/${id ? `${id}/` : ``}`)
      .then(res => setRoot(res.data))
      .catch(err => {})
  }, [get, id, refresh])

  return (
    <View style={{flex: 1}} >
      <ScrollView>
        <ImageBackground
          resizeMode="cover"
          source={{uri: 'https://www.alfredplace.io/wp-content/uploads/2022/10/georgesand-fumoir-01-01.png'}}
          style={{flex: 1,
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <YStack f={1} jc="center" ai="center" p="$4" height={'100%'} space>
            {/* <Fonts /> */}
            {/* <Metadata metaTitle={''} metaDescription={''} metaImageUrl={''} /> */}
            <Flex
              height={'100%'}
              f={1}
              id="comp-L9PSEM4I96BY"
              backgroundsize="cover"
              width="100%"
              maxWidth={600}
              justifyContent='center'
            >
              <Flex
                height={'100%'}
                id="comp-L9Q1E1TPLRPIS"
                flexDirection="column"
                flex={1}
                justifyContent="center"
                alignItems="center"
                m="5%"
                overflow="visible"
              >
                <Image
                  id="comp-L9Q1ER3XD1OPX"
                  src="https://www.alfredplace.io/wp-content/uploads/2022/10/logo-fumoir-02.png"
                  width={200}
                  height={200}
                
                />
                <Text
                  id="comp-L9Q1L2JVOZR97"
                  color="#ffffff"
                  fontSize={30}
                  fontFamily="Tomarik"
                  textAlign='center'
                  m="3%"
                >
            Le fumoir de George
                </Text>
                <Text
                  id="comp-L9Q1J5DNWXL0U"
                  color="#ffffff"
                  fontFamily="Radikal"
                  fontSize={20}
                  m="3%"
                >
            Business club
                </Text>
          
                <Flex
                  id="comp-LAV3HNHV65WC5"
                  flexDirection="column"
                  minWidth="90%"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Input
                    id="L9Q1LOD21AW77"
                    ref={L9Q1LOD21AW77}
                    borderRadius={30}
                    color="#414141"
                    backgroundColor="#ffffff"
                    placeholder="Renseignez votre email"
                    m="3%"
                    opacity={0.88}
                    pl="4%"
                    minWidth={'50%'}
                    pr="4%"
                    // value='simon.hoayek@fdg.com'
                  />
                  <Input
                    secureTextEntry
                    id="comp-L9Q1N7TC32JK4"
                    ref={L9Q1N7TC32JK4}
                    borderRadius={30}
                    color="#414141"
                    backgroundColor="#ffffff"
                    placeholder="Mot de passe"
                    m="3%"
                    opacity={0.92}
                    pl="4%"
                    pr="4%"
              
                  />
                </Flex>
                <Text
                  id="comp-L9Q1Q0ENX50CI"
                  color="#ffffff"
                  fontSize={10}
                  textAlign="left"
                >
            Mot de passe oublié ?{' '}
                </Text>
                <DynamicButton
                  id="comp-L9Q1NWLMNF9AC"
                  reload={reload}
                  context={root?.[0]?._id}
                  backend="/"
                  dataModel="user"
                  variant="subtle"
                  refs={{L9Q1LOD21AW77, L9Q1N7TC32JK4}}
                  m='3%'
                  borderRadius={30}
                  color="#ffffff"
                  backgroundColor="#DAB679"
                  p='3%'
                  $base={{width: '70%'}}
                  $sm={{width: '50%', mt: 50}}
                  border="2px solid white"
                  page="page-L9Q1U7EQH4UE3"
                  action="login"
                  actionProps='{"page":"feed","open":"false","email":"L9Q1LOD21AW77","password":"L9Q1N7TC32JK4"}'
                  dataSourceId={'root'}
                  key={root[0]?._id}
                  dataSource={root}
                  nextAction="openPage"
                  nextActionProps='{"page":"mes-reservations","open":"false"}'
                  pageName={'feed'}
                  // onClick={() => (window.location = '/feed')}
                >
            Se connecter
                </DynamicButton>
                <DynamicButton
                  id="comp-LASA2MY3OQRKZ"
                  m="3%"
                  borderRadius={30}
                  color="#ffffff"
                  backgroundColor="#DAB679"
                  p="5%"
                  width="50%"
                  page="page-L9Q1U7EQH4UE3"
                  action="login"
                  actionProps='{"page":"dashboard","open":"false","email":"comp-L9Q1LOD21AW77","password":"comp-L9Q1N7TC32JK4"}'
                  colorScheme="blackAlpha"
                  dataSourceId={'root'}
                  key={root[0]?._id}
                  dataSource={root}
                  nextAction="openPage"
                  nextActionProps='{"page":"dashboard","open":"false"}'
                  pl='4%'
                  pr='4%'
                  pageName={'dashboard'}
                  // onClick={() => (window.location = '/dashboard')}
                >
            Connexion gestionnaire
                </DynamicButton>
              </Flex>
            </Flex>
          </YStack>
        </ImageBackground>
      </ScrollView>
    </View>
  )
}

export {Connexion}
