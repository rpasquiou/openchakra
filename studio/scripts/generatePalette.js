const _ =require('lodash')
const process=require('process')
const chroma=require('chroma-js')

let temp
let result={}
let name=null

if (process.argv.length<=2) {
    console.log(`Generates a palette for each provided color, from white to color to black`)
    console.log(`Usage: ${process.argv.join(' ')} colorname1 colorhex1 ... colornameN colorhexN`)
    process.exit(0)
}
process.argv.forEach(function (val, index, array) {
    if(index>1){
        if(index=='2'){
            name=val
        }else if(index%2==1){
            temp=val
        }else{
            result[temp]=generateShades(val)
        }
    }
  });

function generateShades(middleColor) {
    // Define the white and black anchors
    const white = '#FFFFFF'
    const black = '#000000'

    // Generate a scale from white to the given color to black
    const scale = chroma.scale([white, middleColor, black]).mode('lab').colors(9)
    const obj=Object.fromEntries(scale.map((color, idx) => [(idx+1)*100, color]))
    return obj
}

result={[name]: result}
console.log(result)
