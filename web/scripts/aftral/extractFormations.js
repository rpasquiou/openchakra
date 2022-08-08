const fsPromises = require('fs').promises
const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')

const JSSoup = require('jssoup').default
const lodash=require('lodash')
const Prestation = require('../../server/models/Prestation')
const Billing = require('../../server/models/Billing')
const User = require('../../server/models/User')
const ServiceUser = require('../../server/models/ServiceUser')
const Category = require('../../server/models/Category')
const {getDatabaseUri} = require('../../config/config')
const Service = require('../../server/models/Service')
const {MONGOOSE_OPTIONS} = require('../../server/utils/database')

mongoose.connect(getDatabaseUri(), MONGOOSE_OPTIONS)

const folderPath = './html_formations'


const importFile = async fileName => {
  let user=null
  let service=null

  if (!fileName) {
    return
  }


  try {
    console.log(`\n\nReading ${fileName}`)
    await fsPromises.readFile(fileName, {encoding: 'utf8'})
      .then(contents => {
        const soup=new JSSoup(contents)
        const categoryElt=soup.findAll('p').find(p => p.attrs.class=='category')
        if (!categoryElt) {
          throw new Exception(`Pas de catégorie pour ${fileName}`)
        }

        const data={location: {elearning: true}}
        const categoryLabel=categoryElt.text.trim()
        data.label=soup.find('h1').text.trim()
        data.s_label=data.label
        const refSpan=soup.findAll('span').find(e => e.text=='Référence')
        data.reference=refSpan.nextSibling.text.trim()
        const hoursElt=soup.findAll('div').find(e => e.attrs.class=='tarif-item item-heures')
        data.duration_hours=parseInt(hoursElt.text)
        const daysElt=soup.findAll('div').find(e => e.attrs.class=='tarif-item item-jours')
        if (!daysElt) {
          data.duration_days=data.duration_hours/7
        }
        else {
          data.duration_days=parseInt(daysElt.text)
        }

        const goalsInLi = soup
          .findAll('section')
          .find(e => e.attrs.class && e.attrs.class.includes('field-name-field-objectifs-de-la-formation'))
          .findAll('li').map(e => e.text.trim())
        const goalsInUL = soup
          .findAll('section')
          .find(e => e.attrs.class && e.attrs.class.includes('field-name-field-objectifs-de-la-formation'))
          .findAll('ul').map(e => e.text.trim())

        data.goals= Array.from(new Set(goalsInUL, goalsInLi)) || []
        const moreInfo = soup.findAll('div').find(e => e.attrs.class && e.attrs.class.includes('group-ensavoirplus'))
        if (moreInfo) {
          moreInfo.findAll('div').find(e => e.attrs.class && e.attrs.class.includes('toggle-wrap')).extract()
          const regexp = /<h3>[<>.\n\r\s\t\w\/]{1,}en.savoir.plus[<>.\n\r\s\t\w\/]{1,}<\/h3>/i
          const sanitizedMoreInfo = moreInfo.prettify().replace(regexp, '')
          data.more_info=sanitizedMoreInfo
        }

        const docsTitle=soup.findAll('span').find(e => e.text=='Documents remis')
        if (docsTitle) {
          data.documents=docsTitle.nextSibling.find('ul').findAll().map(e => e.text)
        }
        else {
          data.documents=[]
        }

        const price = soup.findAll('div').find(p => p.attrs.class && p.attrs.class.includes('item-prix'))
        if (price) {
          const pattern = /[0-9]{1,}?,[0-9]{1,} /
          // data.price= Number(price.text.match(pattern)[0].replace(',', '.'))
        }

        const video = soup.findAll('iframe').find(v => v.attrs.id === 'youtube-field-player')
        data.video = video?.attrs.src || ''

        const program = soup.findAll('a').find(l => l.attrs.class === 'link-telecharger blank_link')
        data.program = program?.attrs.href || ''

        const trainingValidationZone = soup
          .findAll('section')
          .find(p => p.attrs.class && p.attrs.class.includes('field-name-field-validation-commerciale'))

        if (trainingValidationZone) {
          const trainingValidation = trainingValidationZone
            .findAll('span')
            .find(p => p.attrs.class && p.attrs.class.includes('content-info'))

          if (trainingValidation) {
            data.validation = trainingValidation.text.trim()
          }
        }

        const cpfElt=soup.findAll('span').find(e => e.text=='CPF')
        const cpf_eligible=cpfElt && cpfElt.nextSibling.text.trim()=='Éligible'
        console.log(`Eligible CPF:${cpf_eligible}`)
        const levelTitle=soup.findAll('span').find(e => e.text=='Niveau de la formation')
        if (levelTitle) {
          data.level=levelTitle.nextSibling.text.trim()
        }
        const illuElt=soup.find('div', 'title-img')
        const imgUrl=illuElt.attrs.style.split('(')[1].split(')')[0]

        // const cpf_link=soup.findAll('a').find(t => t.attrs.id=='link-formation-cpf')
        const cpf_link=soup.findAll('a').filter(t => t.attrs?.id=='link-formation-cpf').map(t => t.attrs?.href).pop()

        return User.findOne({email: /aftral/})
          .then(result => {
            if(!result) {
              throw new error('No user found for aftral')
            }
            user=result
            return Category.findOneAndUpdate({professional_label: categoryLabel},
              {particular_label: categoryLabel, s_particular_label: categoryLabel,
                professional_label: categoryLabel, s_professional_label: categoryLabel},
              {upsert: true, new: true, runValidators: true})
          })
          .then(category => {

            return Service.findOneAndUpdate({label: data.label, category: category._id},
              {...data, category: category._id, picture: imgUrl,
                particular_access: true, professional_access: true,
              },
              {upsert: true, new: true, runValidators: true})
          })
          .then(result => {
            console.log(`Service ${result.label} créé`)
            service=result
            return Billing.findOne({label: /forfait/i})
              .then(billing => {
                return Prestation.findOneAndUpdate(
                  {service: service._id},
                  {label: 'Session de formation', billing: [billing],
                    particular_access: true, professional_access: true},
                  {upsert: true, new: true, runValidators: true},
                )
              })
          })
          .then(prestation => {
            const price=lodash.random(600, 1000)
            return ServiceUser.findOneAndUpdate({service: service._id}, {
              user: user,
              service: service,
              particular_access: true,
              professional_access: true,
              service_address: null,
              location: {elearning: true},
              cpf_eligible: cpf_eligible,
              cpf_link: cpf_link,
              prestations: [{prestation: prestation._id, price: price, billing: prestation.billing[0]}],
              perimeter: 1000,
              elearning_link: 'https://www.youtube.com/watch?v=Lo2vG4r3hMs',
            },
            {upsert: true, runValidators: true})
          })
          .then(() => {
            console.log(`ServiceUser associé créé`)
          })
      })

  }
  catch (err) {
    console.log(err)
  }
}


async function feedDb() {
  const files = fs.readdirSync(folderPath)

  for (const file of files) {
    const filenamePath = path.join(folderPath, file)
    await importFile(filenamePath)
  }
  process.exit(0)
}


feedDb()
