import React, {useState} from 'react'
import {
  Anchor,
  Button,
  ScrollView,
  H1,
  WappizyAvatar as Avatar,
  WappizyInput as Input,
  WappizySwitch as Switch,
  Flex,
  IconButton,
  WappizyCheckbox as Checkbox,
  Box,
  Select, 
  Text,
  Paragraph,
  Separator,
  LinearGradient,
  Adapt,
  Sheet,
  XStack,
  YStack,
  Label
} from '@my/ui'
import {Check, ChevronDown, ChevronUp, Plus, Edit} from '@tamagui/lucide-icons'
import Date from 'app/components/dependencies/custom-components/Date'
import {View} from 'react-native'
import {TextLink, Link, useLink} from 'solito/link'


/* import {
  AddIcon,
  InfoOutlineIcon,
  ArrowBackIcon,
  EditIcon,
  ChevronDownIcon,
} from '@chakra-ui/icons' */

const Testcomponents = () => {

  const reload = false

  const selectItems = ['Pommes', 'poires', 'scoubidous']

  return (
    // <View style={{flex: 1}}>
    <ScrollView style={{flex: 1}}>
      
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
          // boxShadow={'15px 10px 10px #E6E6E6'}
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
          hoverStyle={{}}
          icon={<Plus color={'green'} />}
          // size="lg"
          // isRound
        />
        <Text
          id="comp-LCRV7AQZQO3TP"
          data-reload={reload}
        >
          Icon de Chakra difficiles ou longues à intégrer. Voir du côté de Lucide-icons
        </Text>
      </Flex>
      <Flex
        id="comp-LCRV9PJIBYMDF"
        data-reload={reload}
        // backgroundImage="https://www.alfredplace.io/wp-content/uploads/2022/12/Illu-rdv-03.svg" // SVG not supported at the moment
        backgroundImage="https://www.francetvinfo.fr/pictures/_fi8l5D12T7DHF2cUROY575X5TI/0x106:1024x681/944x531/filters:format(webp)/2023/01/17/63c7273a4faed_000-327g6kn.jpg"
        backgroundSize="cover"
        height={600}
      >
        <Text
          id="comp-LCRV9PJISIT8L"
          data-reload={reload}
          // backgroundColor="blackAlpha.500"
        >
          Ceci est une flex avec un background image et un backgroundSize en
          cover
        </Text>
      </Flex>
      <Flex
        id="comp-LCRVBVK9KQT0R"
        data-reload={reload}
      >
        <Button
          id="comp-LCRVC1INE9KE4"
          data-reload={reload}
          // variant="solid"
          // size="md"
          borderRadius={25}
        >
          Ceci est un button avec border radius de 26px
        </Button>
      </Flex>
      <Flex
        id="comp-LCRVDM3QBDQRB"
        data-reload={reload}
      >
        {/* <InfoIcon
          id="comp-LCRVDRDZMTVQC"
          data-reload={reload}
        /> */}
        <Text
          id="comp-LCRVFC94FAHCW"
          data-reload={reload}
        >
          Ceci est un icon "info"
        </Text>
      </Flex>
      <Flex
        id="comp-LCRVES0KWV2C2"
        data-reload={reload}
      >
        <Date
          id="comp-LCRVES0K7KOK0"
          color="green"
          data-reload={reload}
        />
        <Date
          id="comp-LCRVGZ7BW9OTJ"
          data-reload={reload}
          data-format={{ year: '2-digit', month: 'short', day: 'numeric' }}
        />
      </Flex>
      <Flex
        id="comp-LCRVEU67TJVUV"
        data-reload={reload}
      >
        <Switch
          size="$3"
          id="comp-LCRVEU6818JH2"
          data-reload={reload}
        />
        <Text
          id="comp-LCRVFY6IV9BLG"
          data-reload={reload}
        >
          Ceci est un bouton switch
        </Text>
      </Flex>
      <Flex
        id="comp-LCRVIIFR3IOEH"
        data-reload={reload}
      >
        <Text
          id="comp-LCRVIIFR0HCCL"
          data-reload={reload}
        >
          Ceci est un bouton avec text et icon{' '}
        </Text>
        <Button
          id="comp-LCRVIXEMA5B0S"
          data-reload={reload}
          // variant="solid"
          // size="md"
          // leftIcon={<ArrowBackIcon />}
          // rightIcon={<ArrowBackIcon />}
        >
          Button text
        </Button>
      </Flex>
      <Flex
        id="comp-LCRVJK2UREMWP"
        data-reload={reload}
      >
        <Text
          id="comp-LCRVJK2UUJRTU"
          data-reload={reload}
          width={'20%'}
        >
          Ceci est un bouton radio avec un radiogroup, puis un center, et des
          flex et le composant radio avec la custom props children= (un espace)
        </Text>
        {/* <RadioGroup
          // setComponentValue={setComponentValue}
          id="comp-LCRVKJ2JERLAR"
          data-reload={reload}
        >
          <Center
            id="comp-LCRVKO5FPEA61"
            data-reload={reload}
          >
            <Flex
              id="comp-LCRVKTPKSBI39"
              data-reload={reload}
              flexDirection={'column'}
            >
              <Flex
                id="comp-LCRVL7EHS7Y9Z"
                data-reload={reload}
              >
                <Flex
                  id="comp-LCRVMD3GEG0LV"
                  data-reload={reload}
                >
                  <Flex
                    id="comp-LCRVMHKMRHQGZ"
                    data-reload={reload}
                    justifyContent={{ base: 'center' }}
                    alignItems={{ base: 'center' }}
                  >
                    <Media
                      id="comp-LCRVNAFY15AMZ"
                      data-reload={reload}
                      src="https://www.alfredplace.io/wp-content/uploads/2022/12/types-22.svg"
                    />
                  </Flex>
                  <Flex
                    id="comp-LCRVQUQX288XZ"
                    data-reload={reload}
                  >
                    <Text
                      id="comp-LCRVNKJVA8K17"
                      data-reload={reload}
                    >
                      Text value
                    </Text>
                  </Flex>
                  <Radio
                    id="comp-LCRVS85M3PGRS"
                    data-reload={reload}
                  >
                    {' '}
                  </Radio>
                </Flex>
              </Flex>
              <Flex
                id="comp-LCRVQE0L2S2IY"
                data-reload={reload}
              >
                <Flex
                  id="comp-LCRVQE0LX8HFA"
                  data-reload={reload}
                >
                  <Flex
                    id="comp-LCRVQE0LG8PVE"
                    data-reload={reload}
                    justifyContent={{ base: 'center' }}
                    alignItems={{ base: 'center' }}
                  >
                    <Media
                      id="comp-LCRVQE0LRX7S8"
                      data-reload={reload}
                      src="https://www.alfredplace.io/wp-content/uploads/2022/12/types-22.svg"
                    />
                    <Text
                      id="comp-LCRVQE0LOPUAX"
                      data-reload={reload}
                    >
                      Text value
                    </Text>
                    <Radio
                      id="comp-LCRVQE0LRZV9R"
                      data-reload={reload}
                    >
                      {' '}
                    </Radio>
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          </Center>
        </RadioGroup> */}
      </Flex>
      <Flex
        id="comp-LCRVUB1YS8E7F"
        data-reload={reload}
      >
        <Checkbox
          id="comp-LCRVUH253PFR7"
          data-reload={reload}
          isChecked
          colorScheme="blue"
        >
          Label checkbox
        </Checkbox>
        <Text
          id="comp-LCRVUKGQES0HT"
          data-reload={reload}
          width={'20%'}
        >
          Ceci est une checkbox avec la customProps isReadOnly=false
        </Text>
      </Flex>
      <Flex
        id="comp-LCRVXWVXB72RZ"
        data-reload={reload}
      >
        <Link
          href={'/'}
          id="comp-LCRVYDH4VZYQ8"
          data-reload={reload}
        >
          <Text
            id="comp-LCRVZAXQJHY4P"
            data-reload={reload}
          >
            Ceci est un text dans un link (lui meme dans une flex)
          </Text>
        </Link>
      </Flex>
      <Flex
        id="comp-LCRVZ0UA3DENK"
        data-reload={reload}
      >
        {/* Some things to adapt on it (background, size, ...) */}
        <Avatar
          size={'$6'}
          id="comp-LCRVZ8BAFIGHL"
          data-reload={reload}
          src="https://images.unsplash.com/photo-1548142813-c348350df52b?&w=150&h=150&dpr=2&q=80"
        />
        <Text
          id="comp-LCRVXZP9H1QQ2"
          data-reload={reload}
        >
          Ceci est un avatar
        </Text>
        {/* <UploadFile
          id="comp-LCRVZN7EV17MP"
          data-reload={reload}
        > */}
          <IconButton
            id="comp-LCRVZN7EYPVQI"
            data-reload={reload}
            aria-label="icon"
            icon={<Edit />}
            // size="md"
          />
        {/* </UploadFile> */}
        <Text
          id="comp-LCRVZPHB6V7DY"
          data-reload={reload}
        >
          Ceci est un uploadFile
        </Text>
      </Flex>
      <Flex
        id="comp-LCRW05J3RX8IZ"
        data-reload={reload}
      >
        <Text
          id="comp-LCRW05J3GRFM8"
          data-reload={reload}
        >
          Ceci est un select
        </Text>
        <Select
          id="comp-LCRW0HU6M1BQ1"
          data-reload={reload}
          // icon={<ChevronDownIcon />}
          // variant="outline"
          // size="md"
          defaultValue="Pommes"
        >
          <Select.Trigger>
            <Select.Value placeholder="Search..." />
          </Select.Trigger>
          <Adapt when="sm" platform="touch">
            <Sheet modal dismissOnSnapToBottom>
              <Sheet.Frame>
                <Sheet.ScrollView>
                  <Adapt.Contents />
                </Sheet.ScrollView>
              </Sheet.Frame>
              <Sheet.Overlay />
            </Sheet>
          </Adapt>

          <Select.Content zIndex={200_000}>
            <Select.ScrollUpButton ai="center" jc="center" pos="relative" w="100%" h="$3">
              <YStack zi={10}>
                <ChevronUp size={20} />
              </YStack>
              <LinearGradient
                start={[0, 0]}
                end={[0, 1]}
                fullscreen
                colors={['$background', '$backgroundTransparent']}
                br="$4"
              />
            </Select.ScrollUpButton>

            <Select.Viewport minWidth={200}>
              <Select.Group>
                <Select.Label>Fruits</Select.Label>
                {selectItems.map((item, i) => {
                  return (
                    <Select.Item index={i} key={item} value={item.toLowerCase()}>
                      <Select.ItemText>{item}</Select.ItemText>
                      <Select.ItemIndicator ml="auto">
                        <Check size={16} />
                      </Select.ItemIndicator>
                    </Select.Item>
                  )
                })}
              </Select.Group>
            </Select.Viewport>

            <Select.ScrollDownButton ai="center" jc="center" pos="relative" w="100%" h="$3">
              <YStack zi={10}>
                <ChevronDown size={20} />
              </YStack>
              <LinearGradient
                start={[0, 0]}
                end={[0, 1]}
                fullscreen
                colors={['$backgroundTransparent', '$background']}
                br="$4"
              />
            </Select.ScrollDownButton>
          </Select.Content>

        </Select>
      </Flex>

    </ScrollView>)
}

export {Testcomponents}
