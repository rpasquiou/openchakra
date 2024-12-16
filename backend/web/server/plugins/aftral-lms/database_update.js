const lodash=require('lodash')
const Ticket=require('../../models/Ticket')
const Session=require('../../models/Session')
const Block = require('../../models/Block')
const { getAllResourcesCount, getMandatoryResourcesCount, getFinishedResourcesData } = require('./resources')
const User = require('../../models/User')
const { ROLE_ADMINISTRATEUR, BLOCK_TYPE_RESOURCE } = require('./consts')
const Progress = require('../../models/Progress')

const log = (...params) => {
  return console.log('DB Update', ...params)
}

const error = (...params) => {
  return console.error('DB Update', ...params)
}

// Set session attribute on tickets
const setSessionOnTickets = async () => {
  log('set session on tickets')
  const ticketsCount=await Ticket.countDocuments()
  const noSessionTickets=await Ticket.find({session: null})
  log('Got', ticketsCount, 'tickets,', noSessionTickets.length, 'without a session')
  for (const ticket of noSessionTickets) {
    const sessions=await Session.find({$or: [{trainees: ticket.user}, {trainers:ticket.user}]})
    if (sessions.length==1) {
      log('Ticket', ticket._id, 'has 1 session, updating')
      ticket.session=sessions[0]
      await ticket.save()
    }
    else {
      error('Ticket', ticket._id, 'has more than one (', sessions.length, ') session, can not update')
    }
  }
}

// Set resources count on session blocks
const setSessionResourcesCount = async () => {
  log('Setting resources_count on session blocks')
  const blocks=await Block.find({_locked: true, $or: [{resources_count: null}, {mandatory_resources_count: null}]})
  log(blocks.length, 'blocks with no resources_count')
  await Promise.all(blocks.map(async block => {
    if (block.type==BLOCK_TYPE_RESOURCE) {
      block.resources_count=0
      block.mandatory_resources_count=0
    }
    else {
      block.resources_count=await getAllResourcesCount(null, null, {_id: block._id})
      block.mandatory_resources_count=await getMandatoryResourcesCount(null, null, {_id: block._id})
    }
    log(block.type, block.name, block.resources_count, block.mandatory_resources_count)
    await block.save()
  }))
}

// Set finished reswources count on progresses
const setFinishedProgresses = async () => {
  log('Setting resources_count on session blocks')
  const progresses=await Progress.find({finished_resources_count: null})
  log(progresses.length, 'progresses with no finished count')
  for (const progress of progresses) {
    const {finishedResources}=await getFinishedResourcesData(progress.user, progress.block)
    console.log(progress, finishedResources)
    progress.finished_resources_count=finishedResources
    await progress.save()
  }
}

const databaseUpdate = async () => {
  console.log('************ UPDATING DATABASE')
  await setSessionOnTickets()
  await setSessionResourcesCount()
  await setFinishedProgresses()
}

module.exports=databaseUpdate