import { createModel } from '@rematch/core'

export type Enums = {
  [key: string]: String
}

export type EnumsState = {
  enums: Enums
}

const enums = createModel({
  state: {
    enums: {},
  } as EnumsState,
  reducers: {
    setEnums(state: EnumsState, enums: Enums): EnumsState {
      return {
        ...state,
        enums: enums,
      }
    },
  },
})

export default enums
