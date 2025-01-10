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
  let headerPageNumberChildren=header ?  Array.from(header.querySelectorAll('*')).filter(c => c.getAttribute('tag')=='PDF_PAGE_NUMBER') : null
  let headerPageCountChildren=header ? Array.from(header.querySelectorAll('*')).filter(c => c.getAttribute('tag')=='PDF_PAGE_TOTAL') : null
  
  let footer = Array.from(component.children).find(child => child.getAttribute('tag') === 'PDF_FOOTER')
  const footerImg = footer ? await generateImage({element: footer}) : null
  let footerPageNumberChildren=footer ?  Array.from(footer.querySelectorAll('*')).filter(c => c.getAttribute('tag')=='PDF_PAGE_NUMBER') : null
  let footerPageCountChildren=footer ? Array.from(footer.querySelectorAll('*')).filter(c => c.getAttribute('tag')=='PDF_PAGE_TOTAL') : null

  const middle = Array.from(component.children)[header ? 1 : 0];
  const middleImg=await generateImage({element: middle})

  const remaining=PAGE_HEIGHT-(headerImg?.height||0)-(footerImg?.height||0)

  const requiredPageCount=Math.ceil(middleImg.height/remaining)
  
  const result=[]
  for (const i=0; i<requiredPageCount; i++) {
    let headerRerender=(headerPageNumberChildren?.length+headerPageCountChildren?.length)==0 ? null :
      ({pageCount, pageNumber}) => {
        headerPageNumberChildren.forEach(child => child.innerText=pageNumber)
        headerPageCountChildren.forEach(child => child.innerText=pageCount)
        return generateImage({element: header})
      }
    let footerRerender=(footerPageNumberChildren?.length+footerPageCountChildren?.length)==0 ? null :
      ({pageCount, pageNumber}) => {
        footerPageNumberChildren.forEach(child => child.innerText=pageNumber)
        footerPageCountChildren.forEach(child => child.innerText=pageCount)
        return generateImage({element: footer})
      }

    const middlePosition=-remaining*i+(headerImg?.height||0)
    result.push({
      renders: [
        {y:middlePosition, image: middleImg},
        headerImg ? {y:0, image: headerImg, rerender: headerRerender} : null,
        footerImg ? {y:PAGE_HEIGHT-footerImg.height, image: footerImg, rerender: footerRerender} : null,
      ].filter(v => !!v)
    })
  }
  // pdf.addPage()
  pageNumber++
  return result
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

  let pages=[]
  for (const component of childrenPages) {
    const res=await renderComponent(component, pdf)
    pages=[...pages, ...res]
  }
  let pageNumber=1
  for (const page of pages) {
    const {renders}=page
    for (const render of renders) {
      let {image, y, rerender}=render
      if (rerender) {
        image=await rerender({pageNumber, pageCount:pages.length})
      } 
      await drawImage(image, pdf, y)
    }
    if (pdf.getNumberOfPages()<pages.length) {
      pdf.addPage()
      pageNumber+=1
    }
  }

  fileName=fileName +'_'+moment().format("YYYY-MM-DD-HH-mm-ss")
  return pdf.save(`${fileName}.pdf`)

}

export {generatePDF}