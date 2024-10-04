{/*
    First
    node fillForm.js fieldStructure
    returns a table of field ids and their type (text or button)

    Then
    node fillForm.js fillForm sourcePath Data outputPath

*/}

const axios = require('axios')
const { PDFDocument, PDFTextField, PDFButton } = require('pdf-lib')
const fs = require('fs').promises
const validator=require('validator')
const defaultLink='./form.pdf'
const defaultOutputLink='./finalform.pdf'
const defaultData = ['1', '2', '3', '5']
const args = process.argv.slice(2)

async function getPDFBytes(filePath) {
  const isUrl=validator.isURL(filePath)
  if (isUrl) {
    const {data}=await axios.get(filePath, {responseType: 'arraybuffer'})
    return data
  }
  const pdf = await fs.readFile(filePath)
  return pdf.buffer
}

async function copyPDF(sourceLink) {
  const pdfBytes = await getPDFBytes(sourceLink)
  const pdf = await PDFDocument.load(pdfBytes)
  return pdf
}

async function logFormFields(sourceLink){
  const sourcePDFBytes=await getPDFBytes(sourceLink)
  const sourcePDF = await PDFDocument.load(sourcePDFBytes)
  return Object.fromEntries(
    sourcePDF.getForm().getFields().map(field => [field.getName(), field.acroField.constructor.name])
  )
}

const setFieldValue = (form, field, value) => {
  const fieldType=field.constructor.name
  if (fieldType === 'PDFTextField') {
    field.setText(value)
  } else if (fieldType === 'PDFButton') {
    field.setImage(value)
  }
  else {
    console.warn(`Can not set value for field type ${fieldType}`)
  }
}

async function fillForm(sourceLink, data) {
  const sourcePDFBytes = await getPDFBytes(sourceLink)
  const sourcePDF = await PDFDocument.load(sourcePDFBytes)
  const form = sourcePDF.getForm()
  
  Object.entries(data).forEach(([fieldName, fieldValue]) => {
    const field=form.getFieldMaybe(fieldName)
    if (!field) {
      return console.warn(`Found no field ${fieldName}`)
    }
    setFieldValue(form, field, fieldValue)
  })
  form.flatten()
  return sourcePDF
}

async function savePDFFile(pdf, outputFilePath) {
  const pdfBytes= await pdf.save()
  const buffer = Buffer.from(pdfBytes)
  await fs.writeFile(outputFilePath, buffer)
}

module.exports={
    getPDFBytes,
    copyPDF,
    logFormFields,
    fillForm,
    savePDFFile,
}
