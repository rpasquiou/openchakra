import { useDrop, DropTargetMonitor } from 'react-dnd'
import { rootComponents } from '../utils/editor'
import useDispatch from './useDispatch'
import builder from '../core/models/composer/builder'

export const useDropComponent = (
  componentId: string,
  accept: ComponentType[] = rootComponents,
  canDrop: boolean = true,
) => {
  const dispatch = useDispatch()

  const [{ isOver }, drop] = useDrop({
    accept,
    collect: monitor => ({
      isOver: monitor.isOver({ shallow: true }) && monitor.canDrop(),
    }),
    drop: (item: ComponentItemProps, monitor: DropTargetMonitor) => {
      if (!monitor.isOver()) {
        return
      }

      if (item.isMoved) {
        dispatch.components.moveComponent({
          parentId: componentId,
          componentId: item.id,
        })
      } else if (item.isMeta) {
        dispatch.components.addMetaComponent(builder[item.type](componentId))
      } else if (item.isUserComponent) {
        dispatch.components.addUserComponent({
          parentName: componentId,
          name: item.label,
        })
      } else {
        dispatch.components.addComponent({
          parentName: componentId,
          type: item.type,
          rootParentType: item.rootParentType,
        })
      }
    },
    canDrop: () => canDrop,
  })

  return { drop, isOver }
}
