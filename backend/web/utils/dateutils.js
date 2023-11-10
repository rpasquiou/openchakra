const moment=require('moment')
moment.locale('fr')

const datetime_str = datetime => {
  return `${moment(datetime).format('LLLL')}`
}

const date_str = datetime => {
  return `${moment(datetime).format('L')}`
}

module.exports = {
  datetime_str, date_str,
}
