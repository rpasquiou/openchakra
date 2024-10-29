const mongoose = require('mongoose')
const moment = require('moment')
const {MONGOOSE_OPTIONS} = require('../../server/utils/database')
const {Schema} = mongoose

// Connect to a test database before running tests
beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)
})

// Disconnect from the test database after running tests
afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
})

// Book Schema
const BookSchema = new Schema({
    title: String
})

// Author Schema
const AuthorSchema = new Schema({
    name: String, books: [{type: mongoose.Schema.Types.ObjectId, ref: 'Book'}]
})

const Book = mongoose.model('Book', BookSchema)
const Author = mongoose.model('Author', AuthorSchema)

// Test with $lookup and $unwind
it('Must fin parents that have one child called Jack using $lookup and $unwind', async () => {
    // Clear collections
    await Book.deleteMany({})
    await Author.deleteMany({})

    // Create two books
    const book1 = new Book({title: 'Jack'})
    const book2 = new Book({title: 'Another Book'})
    await book1.save()
    await book2.save()

    console.log('Books created:', book1, book2)

    // Create an author with the two books
    const author = new Author({name: 'Author Name', books: [book1._id, book2._id]})
    await author.save()

    console.log('Author created with books:', author)

    // Use aggregation with $lookup and $unwind
    const result = await Author.aggregate([{
        $lookup: {
            from: 'books', localField: 'books', foreignField: '_id', as: 'booksInfo'
        }
    }, {$unwind: '$booksInfo'}, {$match: {'booksInfo.title': 'Jack'}}])

    console.log('Aggregation result:', result)

    // Validate the result
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].booksInfo.title).toBe('Jack')
})
