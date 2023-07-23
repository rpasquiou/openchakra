const { createSVGWindow } = require('svgdom')
const svgjs = require('svg.js')
const lodash=require('lodash')

// computes the largest available wood to fill mac length/spaving divs
// returns the number of full woods used and updates rests if any
const getLargestLength = (length, spacing, woods_length, rests) => {
  
}

const computePlanksPositions = deck => {
  let total_width=0
  let used_planks=0
  const chutes=[]
  const positions=[]
  while(total_width<deck.width) {
    let total_length=0 
    while (total_length<deck.length) {
      positions.push({x:total_length, y:total_width, length: deck.plank_length})
      total_length+=deck.plank_length
      if (total_length>deck.length) {
        chutes.push(total_length-deck.length)
      }
      used_planks++
    }
    total_width+=(deck.plank_width+deck.planks_spacing) 
  }
  return positions
}

const computePlanksCount = deck => {
  return computePlanksPositions(deck).length
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
  console.log(deck.beam_width/2)
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
  computePlanksPositions(deck).forEach(pos => {
    objects.push(draw.rect(pos.length, deck.plank_width).fill('none').stroke('black').move(pos.x, pos.y).translate(0, -deck.plank_width/2))
  })
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
