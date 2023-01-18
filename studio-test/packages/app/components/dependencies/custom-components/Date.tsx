import { Text } from '@my/ui';

const DateComp = (
  {
    "data-value": dataValue, 
    "data-format": dataFormat, 
    ...props
  }
  :
  {
    id: string
    'data-value'?: string, 
    'data-format'?: string
  }) => {

    const date = (dataValue && new Date(dataValue)) || new Date()
    const dateOptionsToConsider = dataFormat || {}

    // TODO fr-FR locale dynamic
    const dateTimeFormat = new Intl.DateTimeFormat('fr-FR', dateOptionsToConsider);
    const dateToDisplay = date && dateTimeFormat.format(date)

    return (
    <Text {...props}>{dateToDisplay}</Text>
)}

export default DateComp
