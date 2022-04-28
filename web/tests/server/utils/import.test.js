const {guessFileType} = require('../../../server/utils/import')
const {TEXT_TYPE, XL_TYPE} = require('../../../utils/feurst/consts')

const fs = require('fs').promises
const mongoose = require('mongoose')

const ProductSchema = require('../../../server/models/feurst/ProductSchema')
const ShipRateSchema = require('../../../server/models/feurst/ShipRateSchema')
const {fileImport, shipRatesImport} = require('../../../server/utils/import')
const {computeShipFee} = require('../../../server/utils/commands')

const Product=mongoose.model('product', ProductSchema)

describe('Ship rates import test', () => {

  beforeAll(() => {
    return mongoose.connect('mongodb://localhost/test')
  })

  afterAll(() => {
    // return mongoose.connection.db.dropDatabase()
  })

  afterEach(() => {
    return Product.deleteMany({})
  })

  describe('Guess files types', () => {
    const cases=[['shiprates.csv', TEXT_TYPE], ['products.xlsx', XL_TYPE]]
    test.each(cases)(
      'File %p expected to be type %p',
      (fname, fileType) => {
        return fs.readFile(`tests/data/${fname}`)
          .then(contents => {
            return guessFileType(contents)
          })
          .then(filetype => {
            return expect(filetype).toBe(fileType)
          })
      })
  })

  test('Import rates', () => {
    return fs.readFile(`tests/data/shiprates.csv`)
      .then(contents => {
        return shipRatesImport(contents)
      })
      .then(result => {
        expect(result.created).toBe(564)
      })
  })

  test('Import products csv', () => {
    return fs.readFile(`tests/data/products.csv`)
      .then(contents => {
        const DB_MAPPING={
          'reference': 'Code article',
          'description_2': 'Description 2',
          // 'production_line': 'Ligne prod.',
          'group': 'Grpe',
          'family': 'Famille',
          'description': 'Description',
          'weight': {column: "Poids d'expédition", transform: v => parseFloat(v.replace(',', '.')) || null},
        }

        return fileImport(Product, contents, DB_MAPPING, {key: 'reference', delimiter: ';', format: TEXT_TYPE})
      })
      .then(result => {
        expect(result.warnings.length).toBe(0)
        expect(result.errors.length).toBe(0)
        expect(result.created).toBe(1014)
        expect(result.updated).toBe(0)
      })
  })

  test('Import products xlsx', () => {
    return fs.readFile(`tests/data/products.xlsx`)
      .then(contents => {
        const DB_MAPPING={
          'reference': 'Code article',
          'description_2': 'Description 2',
          // 'production_line': 'Ligne prod.',
          'group': 'Grpe',
          'family': 'Famille',
          'description': 'Description',
          'weight': {column: "Poids d'expédition", transform: v => parseFloat(String(v).replace(',', '.')) || null},
        }

        return fileImport(Product, contents, DB_MAPPING, {key: 'reference', delimiter: ';', format: XL_TYPE, tab: 'Travail'})
      })
      .then(result => {
        expect(result.warnings.length).toBe(0)
        expect(result.errors.length).toBe(0)
        expect(result.created).toBe(1014)
        expect(result.updated).toBe(0)
      })
  })

  describe('Compute rates', () => {
    const cases=[[1, 50, false, 28], [28, 168, true, 115.92]]
    test.each(cases)(
      'Zipcode %p, weight %p, express %p expects ship fee %p€',
      (zipcode, weight, express, expected) => {
        return computeShipFee(zipcode, weight, express)
          .then(fee => {
            expect(fee).toBe(expected)
          })
      })

    test('No ship rate for Corsica', () => {
      return expect(computeShipFee(20, 150, true)).rejects.toMatch('No rate found')
    })
  })

})
