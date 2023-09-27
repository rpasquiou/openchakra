const moment=require('moment')
const {ROLE_ADMIN, ISSUE_PRIORITY, ISSUE_CATEGORY, ISSUE_KIND, ISSUE_STATUS} = require('../../../server/plugins/tracker/consts')

module.exports={
  USER_DATA:{
    firstname: 'S', lastname: 'S', role: ROLE_ADMIN, password: 'pass', email: 'test@a.com'
  },
  ISSUE_DATA:{
    status:undefined, observed_date: moment(),
    priority:Object.keys(ISSUE_PRIORITY)[0], description: 'test',
    category:Object.keys(ISSUE_CATEGORY)[0], kind: Object.keys(ISSUE_KIND)[0],
    title: 'Issue 1', status: Object.keys(ISSUE_STATUS)[0],
  },
  PROJECT_DATA: {
    name: 'Test project',
  },
}
