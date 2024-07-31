import { RootState } from '~core/store'

export const getEnums = (state: RootState) => {
  return state.enums.enums
}
