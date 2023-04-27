import { useRoute } from '@react-navigation/native';
import { useRouter } from 'next/router'
import { Platform } from 'react-native'

export const useParams = () => {

  let params
  
  if (Platform.OS !== 'web') {
    const route = useRoute()
    console.log(route.params)
    params = route?.params
  } else {
    const router = useRouter()
    console.log(router.query)
    params = router.query
  }

  return params
}