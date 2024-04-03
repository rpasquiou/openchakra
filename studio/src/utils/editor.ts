const ALERT_COMPONENTS: (ComponentType | MetaComponentType)[] = [
  'Alert',
  'AlertDescription',
  'AlertIcon',
  'AlertTitle',
]

export const COMPONENTS: (ComponentType | MetaComponentType)[] = [
  ...ALERT_COMPONENTS,
  'Avatar',
  'AvatarBadge',
  'AvatarGroup',
  'Badge',
  'Box',
  'Button',
  'Calendar',
  'Card',
  'Chart',
  'Center',
  'Checkbox',
  'CheckboxGroup',
  'CircularProgress',
  'CloseButton',
  'Code',
  'Container',
  'Date',
  'DataProvider',
  'Divider',
  'Flex',
  'FormControl',
  'FormLabel',
  'FormHelperText',
  'FormErrorMessage',
  'Grid',
  'GridItem',
  'Heading',
  'Icon',
  'IconButton',
  'Image',
  'Input',
  'UploadFile',
  'IconCheck',
  'InputGroup',
  'InputRightAddon',
  'InputLeftAddon',
  'Lexical',
  'Link',
  'List',
  'ListItem',
  'Media',
  'NumberFormat',
  'Rating',
  'Progress',
  'Radio',
  'RadioGroup',
  'SimpleGrid',
  'Spinner',
  'Select',
  'Stack',
  'Switch',
  'Tab',
  'TabList',
  'TabPanel',
  'TabPanels',
  'Tabs',
  'Tag',
  'Text',
  'Textarea',
  'Tab',
  'Table',
  'Timer',
  'VisuallyHidden',
  'Accordion',
  'Editable',
  'AspectRatio',
  'Breadcrumb',
  'BreadcrumbItem',
  'BreadcrumbLink',
  'Menu',
  'NumberInput',
  'AccordionItem',
  'AccordionButton',
  'AccordionPanel',
  'AccordionIcon',
  'InputRightElement',
  'InputLeftElement',
  // Allow meta components
  'AlertMeta',
  'CardMeta',
  'FormControlMeta',
  'AccordionMeta',
  'UploadFileMeta',
  'ListMeta',
  'NumberInputMeta',
  'InputGroupMeta',
  'BreadcrumbMeta',
  'TabsMeta',
]

export const AccordionWhitelist: (
  | ComponentType
  | MetaComponentType
)[] = COMPONENTS.filter(name => !ALERT_COMPONENTS.includes(name))

export const rootComponents = COMPONENTS
  // Remove specific components
  .filter(
    name =>
      ![
        'AlertIcon',
        'AlertDescription',
        'AlertTitle',
        'AvatarBadge',
        'AccordionButton',
        'AccordionPanel',
        'AccordionIcon',
        'BreadcrumbItem',
        'BreadcrumbLink',
      ].includes(name),
  )
