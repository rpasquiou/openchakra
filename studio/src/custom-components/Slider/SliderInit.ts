import { buildUploadFile } from '../ComponentBuilder'
import { registerComponent } from '~components/register'
import SliderPanel from './SliderPanel'
import SliderPreview from './SliderPreview'

registerComponent({
  componentType: 'Slider',
  previewComponent: SliderPreview,
  componentPanel: SliderPanel,
  builderFunction: buildUploadFile,
})
