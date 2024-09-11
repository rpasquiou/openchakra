import React, {useEffect, useState} from 'react'
import lodash, { sortBy } from 'lodash'
import {ArrowLeftIcon, ArrowRightIcon } from '@chakra-ui/icons'
import { matcher } from '../utils/misc';
import {Flex} from '@chakra-ui/react'
import { DEFAULT_LIMIT } from '../utils/consts';

const normalize = str => {
  str = str
    ? str
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
    : ''
  return str
}

const isOtherSource = (element, dataSourceId) => {
  if (
    element.props.dynamicContainer &&
    element.props.dataSourceId &&
    element.props.dataSourceId !== dataSourceId
  ) {
    return true
  }
}
const setRecurseDataSource = (
  element,
  dataSource,
  dataSourceId,
  suffix = '',
) => {
  if (React.Children.count(element.props.children) === 0) {
    return []
  } else {
    return React.Children.map(element.props.children, function(child, index) {
      // DANGEROUS!!!!!!!! FOR QUIZZ !!!!!
      const newSuffix = suffix//child?.props?.dataSourceId ? `${suffix}_${index}` : suffix
      const newId = child.props?.id ? `${child.props?.id}${suffix}` : undefined
      const key = `${newId}/${dataSource?._id}`
      const level=newId ? newId.split(/(_.*)$/)[1] : undefined
      //if (child.props === undefined || (child.props.dataSourceId && child.props.dataSourceId!=dataSourceId)) {
        if (child.props === undefined) {
          return child
        } else if (React.Children.count(child.props.children) === 0) {
        if (isOtherSource(child, dataSourceId)) {
          return React.cloneElement(child, { id: newId, level, key})
        }
        return React.cloneElement(child, {id: newId, level, dataSource, key})
      } else {
        if (isOtherSource(child, dataSourceId)) {
          return React.cloneElement(
            child,
            { id: newId, level, key },
            setRecurseDataSource(child, dataSource, dataSourceId, newSuffix),
          )
        }
        return React.cloneElement(
          child,
          { id: newId, level, dataSource, key },
          setRecurseDataSource(child, dataSource, dataSourceId, newSuffix),
        )
      }
    })
  }
}
const withDynamicContainer = Component => {
  // TODO vomi
  const FILTER_ATTRIBUTES = ['code', 'name', 'short_name', 'description', 'title']

  const internal = ({hiddenRoles, user, shuffle, limit, hidePagination, ...props}) => {

    const [key, setKey]=useState(null)
    const [originalData, setOriginalData]=useState([])
    const [data, setData]=useState([])

    limit = limit || DEFAULT_LIMIT

    const getPageIndexKey= () => {
      return `${props.dataSourceId.replace(/^comp-/, '')}${props.fullPath ? '.'+props.fullPath : ''}`
    }

    const getPageIndex = () => {
      const res=props.pagesIndex?.[getPageIndexKey()] || 0
      return res
    }

    useEffect(() => {
      if (!props.dataSource) {
        setOriginalData(null)
      }
      else {
        let orgData = props.dataSource
        if (props.attribute) {
          orgData = lodash.get(orgData, props.attribute)
        }
          setOriginalData(orgData)
      }
    }, [props.dataSource, props.attribute])

    useEffect(() => {
      let computedData=originalData
      if (shuffle) {
        computedData=lodash.shuffle(computedData)
      }

      if (limit) {
        try {
          computedData = computedData.slice(0, limit)
        }
        catch (err) {
          console.error(`Container ${props.id} can not slice ${JSON.stringify(computedData)}:${err}`)
        }
        }

      if (props.filterAttribute && props.filterConstant) {
        const value=props.filterConstant
        // TODO Check why value "null" comes as string
        if (!(lodash.isNil(value) || value=="null")) {
          computedData = matcher(value, computedData, props.filterAttribute)
        }
      }

      if (props.contextFilter) {
        const contextIds = props.contextFilter.map(o => o._id.toString())
        computedData = computedData.filter(d => contextIds.includes(d._id))
      }
      if (props.textFilter) {
        const filterValue = props.textFilter
        const regExp = new RegExp(normalize(filterValue).trim(), 'i')
        computedData = computedData.filter(d =>
          FILTER_ATTRIBUTES.some(att => regExp.test(normalize(d[att]))),
        )
      }

      if (props.sortAttribute) {
        const direction=props.sortDirection || 'asc'
        computedData = lodash.orderBy(computedData, props.sortAttribute, direction)
      }


      setData(computedData)
    }, [originalData, shuffle, limit, props.filterAttribute, props.filterConstant, props.contextFilter, props.textFilter, props.sortAttribute, props.sortDirection])

    useEffect(() => {
      setKey((data || []).map(v => v?._id?.toString()))
    }, [data])

    const prev= () => {
      if (!hasPrev()) {return}
      const allIndexes={...props.pagesIndex}
      const currentIndex=props.pagesIndex[getPageIndexKey()] || 0
      allIndexes[getPageIndexKey()]=currentIndex-1
      props.setPagesIndex(allIndexes)
    }

    const next= () => {
      if (!hasNext()) {return}
      const allIndexes={...props.pagesIndex}
      const currentIndex=props.pagesIndex[getPageIndexKey()] || 0
      allIndexes[getPageIndexKey()]=currentIndex+1
      props.setPagesIndex(allIndexes)
    }

    const hasPrev = () => getPageIndex()>0
    const hasNext = () => data?.length>limit


    const navigation=(data?.length>limit || getPageIndex()>0) && !hidePagination ?
    <Flex justifyContent={'space-around'} style={{width: '100%'}} flex={'row'}>
      <ArrowLeftIcon style={{opacity: !hasPrev() && '50%'}} enabled={hasPrev} onClick={prev} />
      <Flex>{getPageIndex()*limit+1}-{getPageIndex()*limit+Math.min(limit, orgData.length)}</Flex>
      <ArrowRightIcon style={{opacity: !hasNext() && '50%'}} enabled={hasNext} onClick={next} />
    </Flex>
    :
    null

    // TODO: in code.ts, generate withMaskability(withDynamic()) ...
    if (hiddenRoles) {
      const rolesToHide = JSON.parse(hiddenRoles)
      const roleUser = user?.role

      // When roleUser is available, reveal
      if (roleUser && rolesToHide.includes(roleUser)) {
        return null
      }
    }

    const [firstChild, secondChild] = React.Children.toArray(props.children).slice(0,2)

    if (lodash.isEmpty(data)) {
      return (
        <Component {...lodash.omit(props, ['children'])}>
        {secondChild || null}
        </Component>
      )
    }

    return (
      <Component {...lodash.omit(props, ['children'])} key={key}>
        {navigation}
        {data.map((d, index) => {
          const newId = firstChild.props?.id
            ? `${firstChild.props?.id}_${index}`
            : undefined
          return (
            <>
              {React.cloneElement(
                firstChild,
                { id: newId, level: index, dataSource: d, _id: d?._id, 'data-value': d?._id  },
                setRecurseDataSource(
                  firstChild,
                  d,
                  props.dataSourceId,
                  `_${index}`,
                ),
              )}
            </>
          )
        })}
        {navigation}
      </Component>
    )
  }

  return internal
}

export default withDynamicContainer
