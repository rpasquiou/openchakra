import { buildUploadFile } from '../ComponentBuilder'
import { registerComponent } from '~components/register'
import FilterPanel from './FilterPanel'
import FilterPreview from './FilterPreview'

registerComponent({
  componentType: 'Filter',
  componentPanel: FilterPanel
})
