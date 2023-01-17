import React, {useState} from 'react'
import {
  Anchor,
  Button,
  ScrollView,
  H1,
  WappizyInput as Input,
  Flex,
  IconButton,
  Box,
  Text,
  Paragraph,
  Separator,
  Sheet,
  XStack,
  YStack,
  Label} from '@my/ui'
import {ChevronDown, ChevronUp} from '@tamagui/lucide-icons'
import {View} from 'react-native'
import {TextLink, useLink} from 'solito/link'
import {Plus} from '@tamagui/lucide-icons'


/* import {
  AddIcon,
  InfoOutlineIcon,
  ArrowBackIcon,
  EditIcon,
  ChevronDownIcon,
} from '@chakra-ui/icons' */

const Testcomponents = () => {

  const reload = false

  return (
    <View style={{flex: 1}}>
      
      <Flex flexDirection="column">
        <Label htmlFor='comp-LCRUV4GT9NNRM'>Label for input type=text</Label>
        <Input
          id="comp-LCRUV4GT9NNRM"
          data-reload={reload}
          placeholder="input text"
        />
        <Input
          id="comp-LCRUV5X4RD4W3"
          data-reload={reload}
          type="number"
          placeholder="input number"
          />
        <Input
          id="comp-LCRUV76Z9J1G6"
          data-reload={reload}
          type="email"
          placeholder="input email"
        />
        <Input
          id="comp-LCRUV8DZBGWNX"
          data-reload={reload}
          type="date"
          placeholder="input date"
        />
        <Input
          id="comp-LCRUVA960LDA9"
          data-reload={reload}
          type="datetime-local"
          placeholder="datetime-local"
        />
        <Input
          id="comp-LCRUXT2KODFM0"
          data-reload={reload}
          type="tel"
          placeholder="input telephone"
        />
        <Input
          id="comp-LCRVX6E6YRE8K"
          data-reload={reload}
          type="password"
          placeholder="input password"
        />
        <Input
          id="comp-LCRV2YT4XM630"
          data-reload={reload}
          placeholder="input text"
          focusBorderColor="#F69248"
        />
      </Flex>
      <Flex
        id="comp-LCRUVFHK74LM5"
        data-reload={reload}
      >
        <Flex
          id="comp-LCRUVMD9YUSPE"
          data-reload={reload}
          p={5}
          backgroundColor="teal.500"
        />
        <Flex
          id="comp-LCRV0VQC9PMUL"
          data-reload={reload}
          p={5}
          border={'1px solid black'}
          borderRadius={20}
          backgroundColor={"twitter.500"}
        >
          <Text
            id="comp-LCRV0VQCHDWS3"
            data-reload={reload}
          >
            Ceci est une flex avec un border radius de 20px
          </Text>
        </Flex>
        <Flex
          id="comp-LCRUYJCF2G44E"
          data-reload={reload}
          backgroundColor="pink.500"
          width={'20%'}
          m={5}
        >
          <Text
            id="comp-LCRUYLRVRYRUW"
            data-reload={reload}
          >
            Ceci est une flex avec une marge de 5 et une taille de 20%
          </Text>
        </Flex>
        <Flex
          id="comp-LCRV4ZBQ3PC20"
          data-reload={reload}
          backgroundColor="pink.500"
          boxShadow={'15px 10px 10px #E6E6E6'}
        >
          <Text
            id="comp-LCRV4ZBQDP16G"
            data-reload={reload}
          >
            Ceci est une flex avec une ombre
          </Text>
        </Flex>
      </Flex>
      {/* <Media
        id="comp-LCRV60205C9GB"
        data-reload={reload}
        src="https://www.alfredplace.io/wp-content/uploads/2022/12/types-22.svg"
        htmlHeight={100}
        htmlWidth={100}
      /> */}
       <Flex
        id="comp-LCRV76UR7SZA3"
        data-reload={reload}
      >
        <IconButton
          id="comp-LCRV6OWGZB6O9"
          data-reload={reload}
          aria-label="icon"
          icon={<Plus />}
          // size="lg"
          // isRound
        />
        <Text
          id="comp-LCRV7AQZQO3TP"
          data-reload={reload}
        >
          Ceci est icon "info"
        </Text>
      </Flex>

    </View>)
}

export {Testcomponents}
