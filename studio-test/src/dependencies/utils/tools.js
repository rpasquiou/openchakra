/**
 * Muilti page : https://phppot.com/javascript/jspdf-html-example/
 */


import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
const {createCanvas, loadImage}=require('canvas')
var moment = require('moment')

const PAGE_WIDTH = 210
const PAGE_HEIGHT = 297

//const IMAGE_FORMAT='image/jpeg'
const IMAGE_FORMAT='image/jpeg'

let pageNumber=1
let pageCount=null

const renderComponent = async (component, pdf) => {
  let header = Array.from(component.children).find(child => child.getAttribute('tag') === 'PDF_HEADER')
  const headerImg = header ? await generateImage({element: header}) : null
  let footer = Array.from(component.children).find(child => child.getAttribute('tag') === 'PDF_FOOTER')
  let pageNumberChildren=Array.from(footer.querySelectorAll('*')).filter(c => c.getAttribute('tag')=='PDF_PAGE_NUMBER')
  let pageCountChildren=Array.from(footer.querySelectorAll('*')).filter(c => c.getAttribute('tag')=='PDF_PAGE_TOTAL')
  
  const footerImg = footer ? await generateImage({element: footer}) : null
  const middle = Array.from(component.children)[header ? 1 : 0];
  const middleImg=await generateImage({element: middle})

  const remaining=PAGE_HEIGHT-(headerImg?.height||0)-(footerImg?.height||0)

  let requiredPageCount=Math.ceil(middleImg.height/remaining)
  pageCountChildren.forEach(child => child.innerText=pageCount)

  for (const i=0; i<requiredPageCount; i++) {
    let position=0
    if (headerImg) {
      await drawImage(headerImg, pdf, position)
      position += headerImg.height
    }

    // await drawImage(middleImg, pdf, position)
    const cropped=await cropImage({image: middleImg, cropY: i*remaining, cropHeight: middleImg.height})
    await drawImage(cropped, pdf, position)
    if (footerImg) {
      // Update page number ?
      pageNumberChildren.forEach(child => child.innerText=pageNumber)
      const updatedImage=await generateImage({element: footer})
      await drawImage(updatedImage, pdf, PAGE_HEIGHT-footerImg.height)
    }
    if (i!=requiredPageCount-1) {
      pdf.addPage()
      pageNumber++
    } 
  }
  pdf.addPage()
  pageNumber++
}

/** Generates image from DOM element
 * If height is provided, image will be cropped at this height
*/
const generateImage = async ({element}) => {
  const QUALITY=2
  let canvas = await html2canvas(element, { scale: QUALITY, useCORS: true, logging: true, scrollY: -window.scrollY });
  let imgHeight=canvas.height * PAGE_WIDTH /canvas.width
  let imgData = canvas.toDataURL(IMAGE_FORMAT, 1/QUALITY)

  return {
    width: PAGE_WIDTH,
    height: imgHeight,
    data: imgData
  }
}

// FIX: higher quality
// FIX: generates light gray background
const cropImage = async ({image, cropY, cropHeight}) => {
  const QUALITY=7
  try {
    const canvas=await createCanvas(PAGE_WIDTH*QUALITY, cropHeight*QUALITY)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    const img=await loadImage(image.data)
    ctx.drawImage(img, 0, -cropY*QUALITY, image.width*QUALITY, cropHeight*QUALITY)
    const imgData=canvas.toDataURL(IMAGE_FORMAT, 1)
    return {
      width: image.width,
      height: cropHeight,
      data: imgData,
    }
  }
  catch(err) {
    console.error(err)
    return image
  }
}

const drawImage = async (image, pdf, positionY) => {
  pdf.addImage(image.data, IMAGE_FORMAT, 0, positionY, image.width, image.height)
  return image
}
  
const generatePDF = async (targetId, level,fileName) => {
  if (targetId=='root'){targetId='__next'}
  let input = document.getElementById(targetId);
  if (!input){
    input = document.getElementById(targetId+level)
  }

  // TODO: proxify images in PDF to enable rendering
  const imgs=Array.from(input.querySelectorAll('img'))
  imgs.forEach(img => img.src = /proxy/.test(img.src) ? img.src : `/proxy?url=${img.src}`)
    
  
  const childrenPages = Array.from(input.children).filter(child => child.getAttribute('tag') === 'PDF_PAGE')

  // #FIX Don't play twice to get pages count
  // Instead pre generate blocks then render
  let pdf = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: [PAGE_WIDTH, PAGE_HEIGHT],
  })

  for (const component of childrenPages) {
    await renderComponent(component, pdf);
  }

  pageCount=pdf.getNumberOfPages()
  pageNumber=1

  pdf = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: [PAGE_WIDTH, PAGE_HEIGHT],
  })

  for (const component of childrenPages) {
    await renderComponent(component, pdf);
  }

  fileName=fileName +'_'+moment().format("YYYY-MM-DD-HH-mm-ss")
  return pdf.save(`${fileName}.pdf`)

}

export {generatePDF}