{/*
    First
    node fillForm.js fieldStructure
    returns a table of field ids and their type (text or button)

    Then
    node fillForm.js fillForm sourcePath Data outputPath

*/}

const { PDFDocument, PDFTextField, PDFButton } = require('pdf-lib')
const fs = require('fs').promises

const defaultLink='./form.pdf'
const defaultOutputLink='./finalform.pdf'
const defaultData = ['1', '2', '3', '5']
const args = process.argv.slice(2)

async function main() {
    console.log(args)
    try {
        if (args[0] === 'fieldStructure') {
            const link = args[1]
            console.table(await logFormFields(link))
        } else if (args[0] === 'fillForm') {
            const link = args[1] || defaultLink
            const data = args[2] || defaultData
            const output = args[3] || defaultOutputLink
            const pdf= await fillForm(link, data)
            await savePDFFile(pdf)
            console.log("Form filled successfully.")
        }
    } catch (error) {
        console.error('Error:', error)
    }
}

async function getPDFBytes(filePath) {
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
    const form = sourcePDF.getForm()
    const fields = form.getFields()
    const fieldInfo={}
    for(const field of fields){
        fieldInfo[field.getName()]=field.acroField.constructor.name
    }
    return fieldInfo
}

async function fillForm(sourceLink, data) {
    const sourcePDFBytes = await getPDFBytes(sourceLink)
    const sourcePDF = await PDFDocument.load(sourcePDFBytes)
    const form = sourcePDF.getForm()
    const fields = form.getFields()
    if (fields.length != data.length) {
        console.log("Data length does not match the number of form fields")
        return false
    }
    
    fields.forEach((field, index) => {
        const fieldName = field.getName()
        const fieldType = field.constructor.name

        if (index < data.length) {
            if (fieldType === 'PDFTextField') {
                const textField = form.getTextField(fieldName)
                textField.setText(data[index])
            } else if (fieldType === 'PDFButton') {
                const button = form.getButton(fieldName)
                button.setImage(data[index])
            }
        }
    })
    return sourcePDF
}

async function savePDFFile(pdf, outputFilePath) {
    const pdfBytes= await pdf.save()
    const buffer = Buffer.from(pdfBytes)
    await fs.writeFile(outputFilePath, buffer)
}

main()

module.exports={
    getPDFBytes,
    copyPDF,
    logFormFields,
    fillForm,
    savePDFFile,
}