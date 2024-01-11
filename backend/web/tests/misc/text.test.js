const { formatDuration } = require("../../utils/text")

describe('Misc text tests', () => {

  it('Must format duration', () => {
    expect(formatDuration(120)).toEqual('2:00')
    expect(formatDuration(3601)).toEqual('1:00:01')
    expect(formatDuration(5)).toEqual('05')
  })

})
