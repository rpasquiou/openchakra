const path=require('path')
const fs=require('fs')
console.log(path.resolve(__dirname, '../../../../.env'))
const myEnv = require('dotenv').config({path: path.resolve(__dirname, '../../../../.env')})
const dotenvExpand = require('dotenv-expand')
dotenvExpand.expand(myEnv)
const { resizeImage } = require('../../server/middlewares/resizeImage')

const ROOT = path.join(__dirname, '../data')

const IMAGE_FILE=path.join(ROOT, 'bigImage.jpeg')

describe('AWS tests', () => {

  it('must upload a more than 500px width image', async() => {
    console.log(process.env.S3_PROD_ROOTPATH)
    console.log(IMAGE_FILE)
    const buffer=fs.readFileSync(IMAGE_FILE)
    const req={
      file: {
        originalname: path.basename(IMAGE_FILE),
        mimetype:'image/jpeg',
        buffer,
      },
      body: {

      },
    }
    const res={}
    const next= () => {}
    await resizeImage(req, res, next)
    const displayReq={
      ...req, 
      file: {
        ...req.file, 
        buffer:req.file.buffer.length,
      },
      body: {
        ...req.body,
        documents: req.body.documents.map(d => ({
          ...d, 
          buffer: d.buffer.length,
        }))
      }
    }
    expect(req.body.documents).toHaveLength(3)
    console.log(req.body.documents[2])
  })


})
