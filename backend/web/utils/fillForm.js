{/*
    First
    node fillForm.js fieldStructure
    returns a table of field ids and their type (text or button)

    Then
    node fillForm.js fillForm sourcePath Data outputPath

*/}

const axios = require('axios')
const { PDFDocument, StandardFonts } = require('pdf-lib')
const fs = require('fs').promises
const validator = require('validator')
const { getModel } = require('../server/utils/database')
const { sendBufferToAWS } = require('../server/middlewares/aws')
const mime = require('mime-types')
const mongoose = require('mongoose')

async function getPDFBytes(filePath) {
  const isUrl = validator.isURL(filePath)
  if (isUrl) {
    const { data } = await axios.get(filePath, { responseType: 'arraybuffer' })
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

async function logFormFields(sourceLink) {
  const sourcePDFBytes = await getPDFBytes(sourceLink)
  const sourcePDF = await PDFDocument.load(sourcePDFBytes)
  const form = sourcePDF.getForm()
  return Object.fromEntries(
    form.getFields().map(field => {
      const fieldName = field.getName()
      const fieldType = field.constructor.name
      const widgets = field.acroField.getWidgets()
      const positions = widgets.map(widget => {
        const rect = widget.getRectangle()
        const x = rect.x
        const y = rect.y
        const width = rect.width
        const height = rect.height
        return { x, y, width, height }
      })
      return [fieldName, { type: fieldType, positions }]
    })
  )
}

const setFieldValue = (form, field, value, fallbackFont, fallbackFontSize) => {
  const fieldType = field.constructor.name
  if (fieldType === 'PDFTextField') {
    field.enableMultiline()
    const widgets = field.acroField.getWidgets()

    widgets.forEach(widget => {
      const rect = widget.getRectangle()
      const fieldWidth = rect.width
      //charWidth that worked the best, couldn't get charWidth from font
      const charWidth = fallbackFontSize * 0.25
      const topY = rect.y + rect.height

      const wrapText = (text, fieldWidth, charWidth) => {
        const words = String(text).split(' ')
        let lines = []
        let currentLine = ''

        words.forEach((word) => {
          const testLine = currentLine + (currentLine.length ? ' ' : '') + word
          const textWidth = testLine.length * charWidth

          if (textWidth <= fieldWidth) {
            currentLine = testLine
          } else {
            lines.push(currentLine)
            currentLine = word
          }
        })

        lines.push(currentLine)
        return lines
      }

      const wrappedLines = wrapText(value, fieldWidth, charWidth)
      const wrappedValue = wrappedLines.join('\n')

      const lineHeight = fallbackFontSize * 1.2
      const requiredHeight = wrappedLines.length * lineHeight + lineHeight

      rect.y = topY - requiredHeight
      rect.height = requiredHeight
      widget.setRectangle(rect)

      field.setText(wrappedValue)
      field.updateAppearances(form.getDefaultFont())
    })

    form.updateFieldAppearances(fallbackFont)
  } else if (fieldType === 'PDFButton') {
    field.setImage(value)
  } else {
    console.warn(`Cannot set value for field type ${fieldType}`)
  }
}

async function fillFormRecursively(form, data, prefix = '', pdfFont, fontSize) {
  for (const [key, value] of Object.entries(data)) {
    const fieldName = prefix ? `${prefix}_${key}` : key

    if (value instanceof Date) {
      const dateStr = value.toISOString().split('T')[0]
      const field = form.getTextField(fieldName)
      if (field) {
        setFieldValue(form, field, dateStr, pdfFont, fontSize)
      } else {
        console.log(`Field ${fieldName} does not exist in the form.`)
      }
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      await fillFormRecursively(form, value, fieldName, pdfFont, fontSize)
    } else if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const itemPrefix = `${fieldName}_copy_${i + 1}`
        if (typeof value[i] === 'object' && value[i] !== null) {
          console.log(`Handling object in array at ${itemPrefix}:`, value[i])
          await fillFormRecursively(form, value[i], itemPrefix, pdfFont, fontSize)
        } else {
          const field = form.getTextField(itemPrefix)
          if (field) {
            setFieldValue(form, field, value[i].toString(), pdfFont, fontSize)
          } else {
            console.log(`Field ${itemPrefix} does not exist in the form.`)
          }
        }
      }
    } else {
      const field = form.getTextField(fieldName)
      if (field) {
        setFieldValue(form, field, value.toString(), pdfFont, fontSize)
      } else {
        console.log(`Field ${fieldName} does not exist in the form.`)
      }
    }
  }
}

async function fillForm(sourceLink, data, font = StandardFonts.Helvetica, fontSize = 12) {
  const sourcePDFBytes = await getPDFBytes(sourceLink)
  const pdfDoc = await PDFDocument.load(sourcePDFBytes)
  const pdfFont = await pdfDoc.embedFont(font)
  const form = pdfDoc.getForm()

  await fillFormRecursively(form, data, '', pdfFont, fontSize)
  form.updateFieldAppearances(pdfFont)
  form.flatten()
  return pdfDoc
}


async function savePDFFile(pdf, outputFilePath) {
  const pdfBytes = await pdf.save()
  const buffer = Buffer.from(pdfBytes)
  await fs.writeFile(outputFilePath, buffer)
}

async function duplicateFields(sourcePDF, textFields, numberOfDuplicates = 1, margin = 10) {
  const form = sourcePDF.getForm()
  const fieldMap = {}

  form.getFields().forEach(field => {
    const fieldName = field.getName()
    const fieldType = field.constructor.name
    const widgets = field.acroField.getWidgets()

    fieldMap[fieldName] = {
      type: fieldType,
      positions: widgets.map(widget => {
        const rect = widget.getRectangle()
        const appearance = widget.getDefaultAppearance()
        const pageRef = widget.P()
        const pageIndex = sourcePDF.getPages().findIndex(page => page.ref === pageRef)

        return {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          appearance,
          pageIndex
        }
      })
    }
  })

  const allPositions = Object.values(textFields).flatMap(field => fieldMap[field].positions)
  let baseY = Math.max(...allPositions.map(pos => pos.y))
  const maxH = Math.max(...allPositions.map(pos => pos.height))
  for (const fieldName of textFields) {
    if (!fieldMap[fieldName]) {
      console.warn(`Field ${fieldName} does not exist in the form.`)
      continue
    }

    const { type, positions } = fieldMap[fieldName]
    const { x, width, height, appearance, pageIndex } = positions[0]
    const oldY = positions[0].y
    const originalPage = sourcePDF.getPage(pageIndex)
    const pageHeight = originalPage.getHeight()
    let fieldHeight = height

    for (let i = 0; i < numberOfDuplicates; i++) {
      let currentPage = originalPage
      let newY = oldY - ((maxH + margin) * (i))

      if (newY < 0) {
        currentPage = sourcePDF.addPage([originalPage.getWidth(), pageHeight])
        newY = pageHeight - (fieldHeight + margin)
        baseY = newY
      }

      const newFieldName = `${fieldName}_copy_${i + 1}`
      let newField

      if (type === 'PDFTextField') {
        newField = form.createTextField(newFieldName)
        newField.setText('')
      } else if (type === 'PDFButton') {
        newField = form.createButton(newFieldName)
      }

      newField.addToPage(currentPage, { x, y: newY, width, height, borderWidth: 0 })
      const widgets = newField.acroField.getWidgets()
      widgets.forEach(widget => {
        widget.setDefaultAppearance(appearance)
      })
    }
    baseY -= (fieldHeight + margin) * numberOfDuplicates
  }

  return sourcePDF
}

const generateDocument = async (model, type, hiddenAttr, TEMPLATE_PATH, TEMPLATE_NAME, data) => {
  const id = data._id
  delete data._id
  delete data[hiddenAttr]
  const pdf = await fillForm(TEMPLATE_PATH, data)
  const buffer = await pdf.save()
  const filename = `${TEMPLATE_NAME}${id}.pdf`
  const { Location } = await sendBufferToAWS({ filename, buffer, type: type, mimeType: mime.lookup(filename) })
  const mongooseModel = mongoose.connection.models[model]
  await mongooseModel.findByIdAndUpdate(mongoose.Types.ObjectId(id), { [hiddenAttr]: Location })
  return Location
}

const allFieldsExist = (data, fields) => {
  const missingFields = []

  const isDefined = (obj, path) => {
    const keys = path.split('.')
    for (let key of keys) {
      if (typeof (obj[key] == 'object') && obj[key]) {
        obj = obj[key]
      }
      else if (Array.isArray(obj)) {
        obj = obj[0][key]
      }
      else {
        if (typeof obj[key] === 'undefined') missingFields.push(path)
      }
    }
    return true
  }

  for (let field of fields) {
    isDefined(data, field)
  }

  if (missingFields.length > 0) {
    console.log('Missing fields for document:', missingFields)
    return false
  }

  return true
}

module.exports = {
  getPDFBytes,
  copyPDF,
  logFormFields,
  fillForm,
  savePDFFile,
  duplicateFields,
  setFieldValue,
  generateDocument,
  allFieldsExist,
}
