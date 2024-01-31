const { formatDuration } = require("../../utils/text")

describe('Misc text tests', () => {

  it('Must format duration', () => {
    expect(formatDuration(120)).toEqual('2m')
    expect(formatDuration(3601)).toEqual('1h01s')
    expect(formatDuration(5)).toEqual('5s')
    expect(formatDuration(3601)).toEqual('1h01s')
  })

})
