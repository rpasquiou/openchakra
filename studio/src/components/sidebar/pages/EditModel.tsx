import React from 'react';
import { Box, Heading, Select, Checkbox, Text } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { getModels } from '~core/selectors/dataSources';

const GENDER_MALE = 'MALE';
const GENDER_FEMALE = 'FEMALE';
const GENDER_NON_BINARY = 'NON_BINARY';
const GENDER = {
  [GENDER_MALE]: 'Homme',
  [GENDER_FEMALE]: 'Femme',
  [GENDER_NON_BINARY]: 'Non genré',
};

const EditModel = () => {
  const models = useSelector(getModels)
  const model = {
    attributes: {
      lastname: {
        type: 'String',
        multiple: false,
        ref: false,
      },
      role: {
        type: 'String',
        multiple: false,
        ref: false,
        enumValues: {
          ADMIN: 'Administrateur',
          CUSTOMER: 'Abonné',
        },
      },
      active: {
        type: 'Boolean',
        multiple: false,
        ref: false,
      },
      activity: {
        type: 'target',
        multiple: true,
        ref: true,
      },
    },
    name: 'adminDashboard',
  };

  return (
    <Box
      overflowY="auto"
      overflowX="visible"
      boxShadow="xl"
      position="relative"
      display="grid"
      gridTemplateRows="auto 1fr auto"
      p={2}
      m={0}
      as="menu"
      bg="rgb(236, 236, 236)"
      w="100%"
      h="100%"
    >
      <Heading as="h2" color="black" size="md" mb={2}>
        {model.name}
      </Heading>
      {model.attributes &&
        Object.keys(model.attributes).map((key) => {
          const attribute = model.attributes[key];
          return (
            <Box
              key={key}
              p={4}
              m={2}
              bg="white"
              boxShadow="md"
              borderRadius="md"
            >
              <Text 
                fontSize="lg" 
                fontWeight="bold" 
                mb={2}>
                {key}
              </Text>
              <Text 
                mb={2}
                >
                    Type:
              </Text>
              <Select 
                defaultValue={attribute.type} 
                mb={2}>
                    <option value="String">String</option>
                    <option value="Boolean">Boolean</option>
                    <option value="Number">Number</option>
                    <option value="Date">Date</option>
                    <option value="target">Target</option>
              </Select>
              <Checkbox
                isChecked={attribute.multiple}
                mb={2}
                onChange={(e) => (attribute.multiple = e.target.checked)}
              >
                Multiple
              </Checkbox>
              <Checkbox
                isChecked={attribute.ref}
                mb={2}
              >
                Ref
              </Checkbox>
            </Box>
          );
        })}
    </Box>
  );
};

export default EditModel;
