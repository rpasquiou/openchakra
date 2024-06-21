const moment=require('moment')
const Announce=require('../../models/Announce')
const LanguageLevel=require('../../models/LanguageLevel')
const Mission = require('../../models/Mission')
const { idEqual } = require('../../utils/database')
const { NotFoundError, ForbiddenError, BadRequestError } = require('../../utils/errors')
const { ANNOUNCE_STATUS_CANCELED, APPLICATION_STATUS_REFUSED, REFUSE_REASON_CANCELED } = require('./consts')

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

// Announce can be cancelled if the user is the publisher && no mission exists
const canCancel = async ({dataId, userId}) => {
  const announce=await Announce.findById(dataId).populate('received_applications')
  if (!idEqual(userId, announce.user)) {
    throw new ForbiddenError(`Vous n'avez pas le droit d'annuler cette annonce`)
  }
  const missionExists=await Mission.exists({application: {$in: announce.received_applications}})
  if (missionExists) {
    throw new BadRequestError(`Une mission est déjà en cours`)
  }
}

const cancelAnnounce = async ({dataId}) => {
  const announce=await Announce.findById(dataId).populate('received_applications')
  if (!announce) {
    throw new NotFoundError( `Announce introuvable`)
  }
  announce.status=ANNOUNCE_STATUS_CANCELED
  await announce.save().catch(console.error)
  await Promise.all(announce.received_applications.map(a => {
    a.status=APPLICATION_STATUS_REFUSED
    a.refuse_reason=REFUSE_REASON_CANCELED
    a.refuse_date=moment()
    return a.save()
  }))
}

module.exports={
  clone, canCancel, cancelAnnounce,
}