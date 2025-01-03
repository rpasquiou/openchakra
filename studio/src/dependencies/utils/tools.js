import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
var moment = require('moment')

const drawImage = async (element, pageWidth, pageHeight, pdf, positionY) => {
  let elementCanvas = await html2canvas(element, { scale: 2, useCORS: true, logging: true, scrollY: -window.scrollY });
  const elementImg = elementCanvas.toDataURL('image/jpeg', 0.5);
  const elementImgHeight = elementCanvas.height * pageWidth / elementCanvas.width;
  if (positionY==-1) {
    console.log('Before')
    positionY=pageHeight-elementImgHeight
    console.log('After')
  }
  console.log('DRawing at', positionY)
  pdf.addImage(elementImg, 'JPEG', 0, positionY, pageWidth, elementImgHeight);
  return elementImgHeight;
}

const generatePDF = async (targetId, level,fileName) => {
  if (targetId=='root'){targetId='__next'}
  let input = document.getElementById(targetId);
  if (!input){
    input = document.getElementById(targetId+level)
  }

  const childrenPages = Array.from(input.children).filter(child => child.getAttribute('tag') === 'PDF_PAGE')

  // TODO: include images in PDF
  const imgs= input.querySelectorAll('img')
  await Promise.all(Array.from(imgs).map(async (img) => {
    try {
      img.src = /proxy/.test(img.src) ? img.src : `/proxy?url=${img.src}`
      console.log('Loaded', img.src)
    } catch (error) {
      console.error(`Error loading image ${img.src}: ${error}`);
    }
  }))
  
  const imgWidth = 210
  const pageHeight = 297

  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: [imgWidth, pageHeight],
  })

  for (const component of childrenPages) {
    let position=0
    let remaining=pageHeight
    const header = Array.from(component.children).find(child => child.getAttribute('tag') === 'PDF_HEADER')
    if (header) {
      const headerImgHeight = await drawImage(header, imgWidth, pageHeight, pdf, position);
      position+=headerImgHeight
      remaining-=headerImgHeight
    }
    const middle=Array.from(component.children)[header ? 1 : 0]
    const middleHeight=await drawImage(middle, imgWidth, pageHeight, pdf, position);
    position+=middleHeight
    const footer = Array.from(component.children).find(child => child.getAttribute('tag') === 'PDF_FOOTER')
    if (footer) {
      await drawImage(footer, imgWidth, pageHeight, pdf, -1)
    }
    pdf.addPage()
  }

  fileName=fileName +'_'+moment().format("YYYY-MM-DD-HH-mm-ss")
  return pdf.save(`${fileName}.pdf`)

}

export {generatePDF};
