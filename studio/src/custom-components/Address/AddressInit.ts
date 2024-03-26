import { buildUploadFile } from '../ComponentBuilder'
import { registerComponent } from '~components/register'
import AddressPanel from './AddressPanel'
import AddressPreview from './AddressPreview'

registerComponent({
  componentType: 'Address',
  componentPanel: AddressPanel
})