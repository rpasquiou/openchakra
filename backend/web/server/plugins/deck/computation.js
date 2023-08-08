const { createSVGWindow } = require('svgdom')
const svgjs = require('svg.js')
const lodash=require('lodash')

// Computes used length and remaining waste when cutting at x*interval length
const computeWaste = (length, interval) => {
  const nb=Math.floor(length/interval)
  return {length: nb*interval, waste: length-(nb*interval)}

}
// Returns the shortest item of minimum minimum_length amongst items
const getShortestItem = (items, minimum_length) => {
  return lodash(items).filter(i => i>minimum_length).min()
}

const removeItem = (items, item) => {
  const idx=items.indexOf(item)
  if (idx<0) {
    throw new Error(`Can not remove ${item} from ${items}`)
  }
  items.splice(idx, 1)
  return items
}

const computePlanksPositions = deck => {
  let total_width=0
  let used_planks=0
  const wastes=[]
  const positions=[]
  const widthAndSpace=deck.plank_width+deck.planks_spacing
  while(total_width<deck.width) {
    let total_length=0
    console.log(`Line ${Math.ceil(total_width/widthAndSpace)}`)
    while (total_length<deck.length) {
      let length=getShortestItem(wastes, deck.piers_spacing)
      // We can use a piece of waste
      if (length) {
        removeItem(wastes, length)
      }
      // We must use a new plank
      else {
        length=deck.plank_length
        used_planks+=1
      }
      const {length:l, waste:w}=computeWaste(length, deck.piers_spacing)
      length=l
      wastes.push(w)
      // handle waste if any
      const extraLength=(total_length+length)-deck.length
      if (extraLength>0) {
        wastes.push(extraLength)
        length=length-extraLength
      }
      console.log(`${total_length} length ${length} waste ${wastes}`)
      positions.push({x:total_length, y:total_width, length})
      total_length+=length
    }
    total_width+=(widthAndSpace)
  }
  return {positions, wastes}
}

const computePlanksCount = deck => {
  return computePlanksPositions(deck).positions.length
}

const computePiersPositions = deck => {
  const positions=[]
  lodash.range(0, deck.length+1, deck.piers_spacing).forEach(x => {
    lodash.range(0, deck.width+1, deck.piers_spacing).forEach(y => {
      positions.push({x, y})
    })
  })
  return positions
}

const computePiersCount = deck => {
  return computePiersPositions(deck).length
}

const computeBeamsPositions = deck => {
  const positions=[]
  lodash.range(0, deck.length+1, deck.piers_spacing).forEach(x => {
    lodash.range(0, deck.width+1, deck.beam_length).forEach(y => {
      positions.push({x, y, length: deck.beam_length})
    })
  })
  return positions
}

const computeBeamsCount = deck => {
  return 42
}

const computeSteps = deck => {
  return "<h1>Etapes</h1><h3>Etape 2: gooo!!!!</h3>"
}

const computeBeamsSvg = deck => {
  const window=createSVGWindow()
  const SVG=svgjs(window)
  const draw = SVG(window.document.documentElement).size(deck.length+20, deck.width+20);
  const objects=[]
  // Deck
  objects.push(draw.rect(deck.length, deck.width).fill('none').stroke('black'))
  //Piers
  computePiersPositions(deck).forEach(pos =>
    objects.push(draw.circle(10).fill('none').stroke('maroon').center(pos.x, pos.y))
  )
  //Beams
  computeBeamsPositions(deck).forEach(pos => {
    objects.push(draw.rect(deck.beam_width, pos.length).fill('none').stroke('black').move(pos.x, pos.y).translate(-deck.beam_width/2, 0))
  })
  objects.forEach(o => o.translate(10,10))
  return draw.svg();
}

const computePlanksSvg = deck => {
  const window=createSVGWindow()
  const SVG=svgjs(window)
  const draw = SVG(window.document.documentElement).size(deck.length+20, deck.width+20);
  const objects=[]
  // Deck
  objects.push(draw.rect(deck.length, deck.width).fill('none').stroke('black'))
  //Planks
  computePlanksPositions(deck).positions.forEach(pos => {
    objects.push(draw.rect(pos.length, deck.plank_width).fill('none').stroke('black').move(pos.x, pos.y).translate(0, -deck.plank_width/2))
  })
  // Piers
  computePiersPositions(deck).forEach(pos =>
    objects.push(draw.circle(10).fill('none').stroke('maroon').center(pos.x, pos.y))
  )
  objects.forEach(o => o.translate(10,10))
  return draw.svg();
}

module.exports={
  computePlanksCount,
  computePiersCount,
  computeBeamsCount,
  computeSteps,
  computeBeamsSvg,
  computePlanksSvg
}
