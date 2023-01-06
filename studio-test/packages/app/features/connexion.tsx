import { useState } from 'react'
// import Metadata from './dependencies/Metadata' /* TO THINK */
// import axios from 'axios' /* NEW */
import { YStack, Image, Text, Input, Button } from '@my/ui'/* NEW */
import { Flex } from 'app/components/Chakra'
import { ImageBackground } from 'react-native'
// import { ChakraProvider } from '@chakra-ui/react' /* DEPRECATED */
// import { Flex, Image, Text, Input, Button } from '@chakra-ui/react' /* DEPRECATED */

// import Fonts from './dependencies/theme/Fonts'
// import { useLocation } from 'react-router-dom'
// import { useUserContext } from './dependencies/context/user'

const Connexion = () => {
  // const query = new URLSearchParams(useLocation().search)
  // const id = query.get('undefined') || query.get('id')
  // const { user } = useUserContext()
  // const get = axios.get

  const [refresh, setRefresh] = useState(false)

  const reload = () => {
    setRefresh(!refresh)
  }

  // useEffect(() => {}, [get, refresh])

  return (
    <YStack f={1} jc="center" ai="center" p="$4" space>
      {/* <Fonts /> */}
      {/* <Metadata metaTitle={''} metaDescription={''} metaImageUrl={''} /> */}
      
      <Flex
        id="comp-L9PSEM4I96BY"
        backgroundSize="cover"
        width="100%"
      >
        <Flex
          id="comp-L9Q1E1TPLRPIS"
          flexDirection="column"
          flex={1}
          justifyContent="flex-start"
          alignItems="center"
          m="5%"
          overflow="visible"
        >
          <Image
            id="comp-L9Q1ER3XD1OPX"
            src="https://www.alfredplace.io/wp-content/uploads/2022/10/logo-fumoir-02.png"
            width={300}
            height={200}
            resizeMode="cover"
          />
          <Text
            id="comp-L9Q1L2JVOZR97"
            color="#ffffff"
            fontSize={30}
            fontFamily="tomarik, 'open sans'"
            m="3%"
            >
            Le fumoir de George
          </Text>
          <Text
            id="comp-L9Q1J5DNWXL0U"
            color="#ffffff"
            fontFamily="radikal, arial"
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
              id="comp-L9Q1LOD21AW77"
              borderRadius={30}
              color="#414141"
              backgroundColor="#ffffff"
              placeholder="Renseignez votre email"
              m="3%"
              opacity={0.88}
              pl="4%"
              pr="4%"
              
            />
            <Input
              id="comp-L9Q1N7TC32JK4"
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
          <Button
            id="comp-L9Q1NWLMNF9AC"
            m="3%"
            borderRadius={30}
            color="#ffffff"
            backgroundColor="#DAB679"
            p="5%"
            width="50%"
            page="page-L9Q1U7EQH4UE3"
            action="openPage"
            actionProps='{"page":"feed","open":"false"}'
            
            pageName={'feed'}
            onClick={() => (window.location = '/feed')}
          >
            Se connecter
          </Button>
          <Button
            id="comp-LASA2MY3OQRKZ"
            m="3%"
            borderRadius={30}
            color="#ffffff"
            backgroundColor="#DAB679"
            p="5%"
            width="50%"
            page="page-L9Q1U7EQH4UE3"
            action="openPage"
            actionProps='{"page":"dashboard","open":"false"}'
            pageName={'dashboard'}
            onClick={() => (window.location = '/dashboard')}
          >
            Connexion gestionnaire
          </Button>
        </Flex>
      </Flex>
    </YStack>
  )
}

export {Connexion}
