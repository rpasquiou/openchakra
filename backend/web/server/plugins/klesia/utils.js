const moment=require('moment')
const {SEASON_SPRING, SEASON_SUMMER, SEASON_WINTER, SEASON_AUTUMN}=require('./consts')

const getSeason = () => {
  const month=moment().month()
  let season=null
  if (month<=1 || month==11) {
    season=SEASON_WINTER
  }
  else if (month<=4) {
    season=SEASON_SPRING
  }
  else if (month<=7) {
    season=SEASON_SUMMER
  }
  else if (month<=10) {
    season=SEASON_AUTUMN
  }
  else {
    console.error(`No season for month ${month}`)
  }
  return season
}

module.exports={
  getSeason,
}
