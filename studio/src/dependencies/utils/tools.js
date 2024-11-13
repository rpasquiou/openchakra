import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
var moment = require('moment')

const loadImage = async url => {
  // const timeStampedURL = url+`?timestamp=new ${Date()}`
  timeStampedURL = url
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image at ${url}`));
    img.src = timeStampedURL;
  });
}

const generatePDF = async (targetId, level,fileName) => {
  if (targetId=='root'){targetId='__next'}
  let input = document.getElementById(targetId);
  if (!input){
    input = document.getElementById(targetId+level)
  }

  // TODO: include images in PDF
  // const imgs= input.querySelectorAll('img')
  // await Promise.all(Array.from(imgs).map(async (img) => {
  //   try {
  //     const loadedImage = await loadImage(img.src)
  //     img.src = loadedImage.src
  //     console.log('Loaded', img.src)
  //   } catch (error) {
  //     console.error(`Error loading image ${img.src}: ${error}`);
  //   }
  // }))
  
  return html2canvas(input, { scale: 2, useCORS: true, logging: true, scrollY: -window.scrollY }).then(canvas => {
    const imgData = canvas.toDataURL('image/jpeg',0.5);

    const imgWidth = 210
    const imgHeight = canvas.height * imgWidth / canvas.width
    const pageHeight = imgHeight

    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: [imgWidth, pageHeight],
    })

    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    fileName=fileName +'_'+moment().format("YYYY-MM-DD-HH-mm-ss")
    return pdf.save(`${fileName}.pdf`)
    
  })

}

export {generatePDF};