const { jest, beforeAll, expect, afterAll, it } = require('@jest/globals')
const mongoose = require('mongoose')
const moment = require('moment')
const { loadFromDb, MONGOOSE_OPTIONS } = require('../../server/utils/database')
const Recipe = require('../../server/models/Recipe')
const Company = require('../../server/models/Company')
const { COMPANY_ACTIVITY, ROLE_CUSTOMER } = require('../../server/plugins/smartdiet/consts')
const User = require('../../server/models/User')
const Comment = require('../../server/models/Comment')
require('../../server/plugins/smartdiet/functions')
require('../../server/models/FoodDocument')

jest.setTimeout(30000)

describe('Recipe Test', () => {
  let user
  let recipe
  let comment1
  let comment2
  
  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)
    
    const company = await Company.create({
      name: 'Test Company',
      size: 100,
      activity: Object.keys(COMPANY_ACTIVITY)[0]
    })

    user = await User.create({
      company,
      dataTreatmentAccepted: true,
      role: ROLE_CUSTOMER,
      cguAccepted: true,
      pseudo: 'TestUser',
      firstname: 'Test',
      lastname: 'User',
      email: 'test@test.com',
      password: 'password123'
    })

    recipe = await Recipe.create({
      name: 'Tarte aux pommes',
      pinned: false,
    })

    // Here, we're creating two comments for the recipe.
    comment1 = await Comment.create({
      user: user._id,
      text: 'Super recette!',
      recipe: recipe._id
    })
    
    comment2 = await Comment.create({
      user: user._id, 
      text: 'Facile à faire',
      recipe: recipe._id
    })
  })

  afterAll(async() => {
    const collections = await mongoose.connection.db.collections()
    for (const collection of collections) {
      await collection.deleteMany({})
    }
    await mongoose.connection.db.dropDatabase()
    await mongoose.connection.close()
  })

  it('should load recipe with comments', async() => {
    // Here, we're retrieving the recipe with its associated comments.
    const loadedRecipe = await loadFromDb({
      model: 'recipe',
      id: recipe._id,
      fields: ['name', 'comments.text', 'comments.user.firstname']
    })

    // We're checking that the retrieved recipe has the expected fields and values.
    expect(loadedRecipe[0].name).toBe('Tarte aux pommes')
    expect(loadedRecipe[0].comments).toBeDefined()
    expect(loadedRecipe[0].comments[0].text).toBe('Super recette!')
    expect(loadedRecipe[0].comments[1].text).toBe('Facile à faire')
    expect(loadedRecipe[0].comments[0].user.firstname).toBe('Test')
  })

  it('should load comment with associated recipe', async () => {
    const loadedComment = await loadFromDb({
      model: 'comment',
      id: comment1._id,
      fields: ['text', 'recipe.name']
    }) 
  })

  it('should pin a recipe', async () => {
    let loadedRecipe = await loadFromDb({
      model: 'recipe',
      id: recipe._id,
      fields: ['name', 'pinned', 'pins'],
      user
    })

    await Recipe.findByIdAndUpdate(recipe._id, {
      $push: { pins: user._id },
      pinned: true
    })

    loadedRecipe = await loadFromDb({
      model: 'recipe',
      id: recipe._id,
      fields: ['name', 'pins', 'pinned'],
      user
    })

    await Recipe.findByIdAndUpdate(recipe._id, {
      $pull: { pins: user._id },
      pinned: false
    })

    loadedRecipe = await loadFromDb({
      model: 'recipe',
      id: recipe._id,
      fields: ['name', 'pins', 'pinned'],
      user
    })
    expect(loadedRecipe[0].pinned).toBe(false)
  })

  it('should like a recipe', async () => {
    let loadedRecipe = await loadFromDb({
      model: 'recipe',
      id: recipe._id,
      fields: ['name', 'liked', 'likes'],
      user
    })
    expect(loadedRecipe[0].liked).toBeFalsy()
    expect(loadedRecipe[0].likes).toHaveLength(0)
  
    await Recipe.findByIdAndUpdate(recipe._id, {
      $addToSet: { likes: user._id }
    })
  
    loadedRecipe = await loadFromDb({
      model: 'recipe',
      id: recipe._id,
      fields: ['name', 'likes', 'liked'],
      user
    })
    expect(loadedRecipe[0].liked).toBeTruthy()
    expect(loadedRecipe[0].likes).toHaveLength(1)
  })
})