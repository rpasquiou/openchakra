const Announce=require('../../models/Announce')
const LanguageLevel=require('../../models/LanguageLevel')

const clone = async announce_id => {
  const origin=await Announce.findById(announce_id)
  const languages=await Promise.all(origin.languages.map(l => LanguageLevel.findById(l._id)))
  const clonedLanguages=await Promise.all(languages.map(l => LanguageLevel.create({language: l.language, level: l.level})))
  const cloned=new Announce({
    ...origin.toObject(), 
    title: `Copie de ${origin.title}`,
    languages: clonedLanguages.map(l => l.id), 
    publication_date: undefined,
    selected_freelances: undefined,
    accepted_application: undefined,
    _id: undefined, id: undefined, _counter: undefined})
  await cloned.save({validateBeforeSave: false})
  return cloned
}

module.exports={
  clone,
}