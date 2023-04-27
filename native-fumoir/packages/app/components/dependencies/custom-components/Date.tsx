import { Text } from '@my/ui';

type dateFormat = {
  year?: string
  month?: string
  day?: string
  hour?: string
  minute?: string
  second?: string
} | undefined

const DateComp = (
  {
    "data-value": dataValue, 
    "data-format": dataFormat, 
    ...props
  }
  :
  {
    id: string
    color?: string
    'data-value'?: string, 
    'data-format'?: dateFormat
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
