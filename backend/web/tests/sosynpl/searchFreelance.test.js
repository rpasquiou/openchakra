const { MONGOOSE_OPTIONS, loadFromDb } = require("../../server/utils/database")
const search = require("../../server/utils/search")
const moment = require('moment')
const mongoose = require('mongoose')
const Job = require("../../server/models/Job")
const CustomerFreelance = require("../../server/models/CustomerFreelance")
const JobFile = require("../../server/models/JobFile")
const Sector = require("../../server/models/Sector")
const Expertise = require("../../server/models/Expertise")
const { EXPERIENCE_EXPERT, EXPERIENCE_JUNIOR, WORK_DURATION__1_TO_6_MONTHS, SOURCE_RECOMMANDATION, EXPERIENCE_SENIOR, EXPERIENCE_EXPERIMENTED, WORK_DURATION_MORE_6_MONTH } = require("../../server/plugins/sosynpl/consts")
const { SEARCH_FIELD_ATTRIBUTE } = require("../../utils/consts")
require('../../server/plugins/sosynpl/functions')

describe('Search Freelance', function() {

  beforeAll(async function() {
    await mongoose.connect('mongodb://localhost/test' + moment().unix(), MONGOOSE_OPTIONS)

    const expertise1 = await Expertise.create({ name: 'Javascript' })
    const expertise2 = await Expertise.create({ name: 'SQL' })
    const expertise3 = await Expertise.create({ name: 'Boulangerie' })

    const jobFile1 = await JobFile.create({ code: 'D2003', name: 'Développement Web' })
    const jobFile2 = await JobFile.create({ code: 'D2004', name: 'Data Science' })
    const jobFile3 = await JobFile.create({ code: 'B2005', name: 'Boulangerie' })

    const job1 = await Job.create({ name: 'Développeur Fullstack', job_file: jobFile1._id })
    const job2 = await Job.create({ name: 'Data Scientist', job_file: jobFile2._id })
    const job3 = await Job.create({ name: 'Boulanger', job_file: jobFile3._id })

    const sector1 = await Sector.create({ name: 'IT' })
    const sector2 = await Sector.create({ name: 'Finance' })
    const sector3 = await Sector.create({ name: 'Métier de bouche' })

    const freelanceData = [
      {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password1;',
        address: { address: '123 Rue de la Paix', city: 'Paris', zip_code: '75000', country: 'France', latitude: 48.8566, longitude: 2.3522 },
        main_job: job1._id,
        main_experience: EXPERIENCE_EXPERT,
        experience: '16',
        work_sector: [sector1._id],
        work_duration: [WORK_DURATION__1_TO_6_MONTHS],
        source: SOURCE_RECOMMANDATION,
        linkedin: 'https://www.linkedin.com/in/john-doe',
        motivation: 'Développeur Fullstack expérimenté et motivé',
        position: 'Développeur Fullstack Senior',
        phone: '0898787689',
        siren: '913683181',
        legal_status: 'EI',
        cgu_accepted: true,
        company_name: 'John Doe SAS',
        expertises: [expertise1._id, expertise2._id],
        pinned_expertises: [expertise1._id],
        headquarter_address: { address: '123 Rue de la Paix', city: 'Paris', zip_code: '75000', country: 'France', latitude: 48.8566, longitude: 2.3522 }
      },
      {
        firstname: 'Jane',
        lastname: 'Smith',
        email: 'jane.smith@example.com',
        password: 'Password2;',
        address: { address: '456 Avenue des Champs-Élysées', city: 'Paris', zip_code: '75008', country: 'France', latitude: 48.8698, longitude: 2.3075 },
        main_job: job2._id,
        main_experience: EXPERIENCE_SENIOR,
        experience: '8',
        work_sector: [sector1._id, sector2._id],
        work_duration: [WORK_DURATION_MORE_6_MONTH],
        source: SOURCE_RECOMMANDATION,
        linkedin: 'https://www.linkedin.com/in/jane-smith',
        motivation: 'Data Scientist passionnée par l\'IA',
        position: 'Data Scientist',
        phone: '0787878787',
        siren: '913683181',
        legal_status: 'EI',
        cgu_accepted: true,
        company_name: 'Smith Data SASU',
        expertises: [expertise1._id],
        pinned_expertises: [expertise1._id],
        headquarter_address: { address: '456 Avenue des Champs-Élysées', city: 'Paris', zip_code: '75008', country: 'France', latitude: 48.8698, longitude: 2.3075 }
      },
      {
        firstname: 'Pierre',
        lastname: 'Dupont',
        email: 'pierre.dupont@example.com',
        password: 'Password3;',
        address: { address: '789 Rue de la République', city: 'Lyon', zip_code: '69002', country: 'France', latitude: 45.7578, longitude: 4.8320 },
        main_job: job1._id,
        main_experience: EXPERIENCE_JUNIOR,
        experience: '2',
        work_sector: [sector1._id],
        work_duration: [WORK_DURATION__1_TO_6_MONTHS, WORK_DURATION_MORE_6_MONTH],
        source: SOURCE_RECOMMANDATION,
        linkedin: 'https://www.linkedin.com/in/pierre-dupont',
        motivation: 'Jeune développeur cherchant à gagner en expérience',
        position: 'Développeur Junior',
        phone: '0676767676',
        siren: '913683181',
        legal_status: 'EI',
        cgu_accepted: true,
        company_name: 'Dupont Dev EURL',
        expertises: [expertise1._id],
        pinned_expertises: [expertise1._id],
        headquarter_address: { address: '789 Rue de la République', city: 'Lyon', zip_code: '69002', country: 'France', latitude: 45.7578, longitude: 4.8320 }
      },
      {
        firstname: 'Marie',
        lastname: 'Laurent',
        email: 'marie.laurent@example.com',
        password: 'Password4;',
        address: { address: '101 Cours Mirabeau', city: 'Aix-en-Provence', zip_code: '13100', country: 'France', latitude: 43.5297, longitude: 5.4474 },
        main_job: job2._id,
        main_experience: EXPERIENCE_EXPERT,
        experience: '12',
        work_sector: [sector2._id],
        work_duration: [WORK_DURATION__1_TO_6_MONTHS],
        source: SOURCE_RECOMMANDATION,
        linkedin: 'https://www.linkedin.com/in/marie-laurent',
        motivation: 'Experte en analyse financière et machine learning',
        position: 'Data Scientist Senior',
        phone: '0654545454',
        siren: '913683181',
        legal_status: 'EI',
        cgu_accepted: true,
        company_name: 'Laurent Analytics',
        expertises: [expertise1._id],
        pinned_expertises: [expertise1._id],
        headquarter_address: { address: '101 Cours Mirabeau', city: 'Aix-en-Provence', zip_code: '13100', country: 'France', latitude: 43.5297, longitude: 5.4474 }
      },
      {
        firstname: 'Lucas',
        lastname: 'Martin',
        email: 'lucas.martin@example.com',
        password: 'Password5;',
        address: { address: '202 Quai des Chartrons', city: 'Bordeaux', zip_code: '33000', country: 'France', latitude: 44.8486, longitude: -0.5783 },
        main_job: job1._id,
        main_experience: EXPERIENCE_EXPERIMENTED,
        experience: '6',
        work_sector: [sector1._id],
        work_duration: [WORK_DURATION__1_TO_6_MONTHS],
        source: SOURCE_RECOMMANDATION,
        linkedin: 'https://www.linkedin.com/in/lucas-martin',
        motivation: 'Développeur Full Stack spécialisé en React et Node.js',
        position: 'Développeur Full Stack',
        phone: '0632323232',
        siren: '913683181',
        legal_status: 'EI',
        cgu_accepted: true,
        company_name: 'Martin Web Solutions',
        expertises: [expertise1._id],
        pinned_expertises: [expertise1._id],
        headquarter_address: { address: '202 Quai des Chartrons', city: 'Bordeaux', zip_code: '33000', country: 'France', latitude: 44.8486, longitude: -0.5783 }
      },
      {
        firstname: 'Paul',
        lastname: 'Baker',
        email: 'paul.baker@example.com',
        password: 'Password6;',
        address: { address: '303 Rue de la Boulangerie', city: 'Marseille', zip_code: '13000', country: 'France', latitude: 43.2965, longitude: 5.3698 },
        main_job: job3._id,
        main_experience: EXPERIENCE_EXPERT,
        experience: '10',
        work_sector: [sector3._id],
        work_duration: [WORK_DURATION__1_TO_6_MONTHS],
        source: SOURCE_RECOMMANDATION,
        linkedin: 'https://www.linkedin.com/in/paul-baker',
        motivation: 'Passionné par la boulangerie artisanale',
        position: 'Boulanger',
        phone: '0612121212',
        siren: '913683181',
        legal_status: 'EI',
        cgu_accepted: true,
        company_name: 'Baker Artisan',
        expertises: [expertise3._id],
        pinned_expertises: [expertise3._id],
        headquarter_address: { address: '303 Rue de la Boulangerie', city: 'Marseille', zip_code: '13000', country: 'France', latitude: 43.2965, longitude: 5.3698 }
      },
    ]

    const createdFreelances = await Promise.all(freelanceData.map(data => CustomerFreelance.create(data)))
    return createdFreelances

  })

  afterAll(async function() {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it('should just return 6 freelancers', async function () {
    const searchResults = await search({
      model: 'customerFreelance',
      fields: [],
      search_field: SEARCH_FIELD_ATTRIBUTE,
      search_value: '',
    })

    expect(searchResults.length).toBe(6)
  })

  it('should search freelancers by position', async function () {
    const searchResults = await search({
      model: 'customerFreelance',
      fields: [],
      search_field: SEARCH_FIELD_ATTRIBUTE,
      search_value: 'Développeur',
    })

    expect(searchResults.length).toBeGreaterThan(0)
    
    searchResults.forEach(freelance => {
      expect(freelance.position.toLowerCase()).toContain('développeur')
      expect(freelance.position.toLowerCase()).not.toContain('scientist')
    })
  })

  it('should search freelancers by expertise', async function () {
    const searchResults = await search({
      model: 'customerFreelance',
      fields: [],
      search_field: SEARCH_FIELD_ATTRIBUTE,
      search_value: 'Javascript',
    })
    
    expect(searchResults.length).toBeGreaterThan(0)

    searchResults.forEach(freelance => {
      expect(freelance.expertises.map(e => e.name).join(' ').toLowerCase()).toContain('javascript')
    })
  })

  it('should search freelancers by exact expertise', async function () {
    const searchResults = await search({
      model: 'customerFreelance',
      fields: [],
      search_field: SEARCH_FIELD_ATTRIBUTE,
      search_value: 'SQL',
    })

    expect(searchResults.length).toBeGreaterThan(0)

    searchResults.forEach(freelance => {
      expect(freelance.expertises.map(e => e.name).join(' ').toLowerCase()).toContain('sql')
    })
  })

  it('should search freelancers by main_job', async function () {
    const searchResults = await search({
      model: 'customerFreelance',
      fields: [],
      search_field: SEARCH_FIELD_ATTRIBUTE,
      search_value: 'Data Scientist',
    })

    expect(searchResults.length).toBeGreaterThan(0)

    searchResults.forEach(freelance => {
      expect(freelance.main_job.name.toLowerCase()).toContain('data scientist')
    })
  })

  it('should search freelancers with two search terms', async function () {
    const searchResults = await search({
      model: 'customerFreelance',
      fields: [],
      search_field: SEARCH_FIELD_ATTRIBUTE,
      search_value: 'SQL Data',
    })

    expect(searchResults.length).toBeGreaterThan(0)
  })

  it('should search freelancers with exact position', async function () {
    const searchResults = await search({
      model: 'customerFreelance',
      fields: [],
      search_field: SEARCH_FIELD_ATTRIBUTE,
      search_value: 'Développeur Junior',
    })
    
    expect(searchResults.length).toBeGreaterThan(0)

    searchResults.forEach(freelance => {
      expect(freelance.position.toLowerCase()).toContain('développeur junior')
    })
  })

  it('should search freelancers with two options (boulanger and data scientist)', async function () {
    const searchResults = await search({
      model: 'customerFreelance',
      fields: [],
      search_field: SEARCH_FIELD_ATTRIBUTE,
      search_value: 'Boulanger Data Scientist',
    })
    
    expect(searchResults.length).toBe(3)
  })

  it('should search freelancers with empty search_value', async function () {
    const searchResults = await search({
      model: 'customerFreelance',
      fields: [],
      search_field: SEARCH_FIELD_ATTRIBUTE,
      search_value: null,
    })

    expect(searchResults.length).toBe(6)
  })

  it('should search freelancers with wrong search_value', async function () {
    const searchResults = await search({
      model: 'customerFreelance',
      fields: [],
      search_field: SEARCH_FIELD_ATTRIBUTE,
      search_value: 'Dresseur de chiens',
    })
    expect(searchResults.length).toBe(0)
  })

  it('should search freelancers with pinned expertise', async function () {
    const searchResults = await search({
      model: 'customerFreelance',
      fields: [],
      search_field: SEARCH_FIELD_ATTRIBUTE,
      search_value: 'Boulangerie',
    })

    console.log(JSON.stringify(searchResults, null, 2))

    expect(searchResults.length).toBe(1)
  })
})