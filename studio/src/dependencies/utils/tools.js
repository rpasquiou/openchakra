import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getComponent } from './values';
var moment = require('moment')

async function loadImage(url) {
  const timeStampedURL = url+`?timestamp=new ${Date()}`
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image at ${url}`));
    img.src = timeStampedURL;
  });
}

async function generatePDF(targetId, fileName, level){
  if (targetId=='root'){targetId='__next'}
  const input = getComponent(targetId, level)
  if (!input) {
    return alert(`generatePDF: component ${targetId} not found`)
  }
  const imgs= input.querySelectorAll('img')
  await Promise.all(Array.from(imgs).map(async (img) => {
    try {
      const loadedImage = await loadImage(img.src);
      img.src = loadedImage.src;
    } catch (error) {
      console.error(`Error loading image ${img.src}: ${error}`);
    }
  }));
  
  return html2canvas(input, { scale: 2, useCORS: true, logging: true, scrollY: -window.scrollY }).then(canvas => {
    const imgData = canvas.toDataURL('image/jpeg',0.5);
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = canvas.height * imgWidth / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    fileName=fileName +'_'+moment().format("YYYY-MM-DD-HH-mm-ss"); 
    return pdf.save(`${fileName}.pdf`);
    
  });

};

export {generatePDF};