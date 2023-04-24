
import {Anchor, Button, ScrollView, H1, Input, Flex, Box, Text, Paragraph, Separator, Sheet, XStack, YStack} from '@my/ui'
import {ChevronDown, ChevronUp} from '@tamagui/lucide-icons'
import {View} from 'react-native'
import React, {useState} from 'react'
import {TextLink, useLink} from 'solito/link'

export function HomeScreen() {
  const linkProps = useLink({
    href: '/user/nate',
  })
  
  const linkToConnexion = useLink({
    href: '/connexion',
  })
  const linkToTestComp = useLink({
    href: '/testcomponents',
  })


  return (
    <View style={{flex: 1, height: '100%'}}>
      <YStack f={1} jc="center" ai="center" p="$4" space>
        <YStack space="$4" maxWidth={600}>
          <H1 bg={'red'} ta="center">Welcome to Wapp'easy.</H1>
          <Paragraph ta="center">
          Here's a basic starter to show navigating from one screen to another. This screen uses the
          same code on Next.js and React Native.
          </Paragraph>

          <Separator />
          <Box
            flexDirection="column"
            $xs={{
              backgroundColor: 'blue',
            }}
            $md={{
              backgroundColor: 'green',
            }}
          >
            <Paragraph>Coucou, c'est nous</Paragraph>
            <Text
              mt={2}
            >
          Modern, Chic Penthouse with Mountain, City & Sea Views
            </Text>
            <Button onPress={_pickDocument}>push this</Button>
          </Box>
          <Flex bg="red">
            <Paragraph>Coucou, c'est nous</Paragraph>
          </Flex>

          <TextLink {...linkToConnexion}><Text fontFamily="Radikal" color={'white'}>Hello World</Text></TextLink>
          <TextLink {...linkToTestComp}><Text fontFamily="Radikal">TEST ME IF YOU CAN</Text></TextLink>
          <Button backgroundColor="tomato" padding={"$6"} color='white' {...linkToConnexion}>Pret le 15 janvier </Button>

          <Paragraph ta="center">
          Made by{' '}
            <Anchor color="$color12" href="https://twitter.com/natebirdman" target="_blank">
            @natebirdman
            </Anchor>
          ,{' '}
            <Anchor
              color="$color12"
              href="https://github.com/tamagui/tamagui"
              target="_blank"
              rel="noreferrer"
            >
            give it a ⭐️
            </Anchor>
          </Paragraph>
        </YStack>

        <XStack>
          <Button {...linkProps}>Link to user</Button>
        </XStack>

        <SheetDemo />
      </YStack>
    </View>
  )
}

function SheetDemo() {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState(0)
  return (
    <>
      <Button
        size="$6"
        icon={open ? ChevronDown : ChevronUp}
        circular
        onPress={() => setOpen(x => !x)}
      />
      <Sheet
        modal
        open={open}
        onOpenChange={setOpen}
        snapPoints={[80]}
        position={position}
        onPositionChange={setPosition}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Frame ai="center" jc="center">
          <Sheet.Handle />
          <Button
            size="$6"
            circular
            icon={ChevronDown}
            onPress={() => {
              setOpen(false)
            }}
          />
        </Sheet.Frame>
      </Sheet>
    </>
  )
}
