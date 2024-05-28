import Announce from "../../models/Announce"
import LanguageLevel from "../../models/LanguageLevel"

export const clone = async announce_id => {
  const origin=await Announce.findById(announce_id)
  const languages=await Promise.all(origin.languages.map(l => LanguageLevel.findById(l._id)))
  const clonedLanguages=await Promise.all(languages.map(l => LanguageLevel.create({language: l.language, level: l.level})))
  const cloned=new Announce({...origin.toObject(), languages: clonedLanguages.map(l => l.id), _id: undefined, id: undefined})
  await cloned.save({validateBeforeSave: false})
  return cloned._id
}