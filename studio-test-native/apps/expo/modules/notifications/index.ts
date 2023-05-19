import messaging from '@react-native-firebase/messaging';

export type Topic = {
  name: string
  permanent: boolean
}

export type Topics = Topic[] | []


export async function handleSubscription({topicsToHandle, back = false}: {topicsToHandle: Topics, back: boolean}) {
  const permissionenabled = await requestUserPermission()
    .catch(e => console.error('permission enabled', e))
  if (permissionenabled) {
    topicsToHandle.forEach(async (topic: Topic) => {
      if (!back) {
        await messaging()
          .subscribeToTopic(topic?.name)
          .then(() => console.log(`Subscribed to topic ${topic?.name}!`))
          .catch(e => console.error('subscribe to topic', e))
        } else {
          if (!topic?.permanent) {
            await messaging()
              .unsubscribeFromTopic(topic?.name)
              .then(() => console.log(`Unsubscribed to topic ${topic?.name}!`))
              .catch(e => console.error('Unsubscribe to topic', e))
          }
        }
    });
  }
}

async function requestUserPermission() {
  const authStatus = await messaging().requestPermission()
    .catch(e => console.error('request permission error', e))
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }

  return enabled
}