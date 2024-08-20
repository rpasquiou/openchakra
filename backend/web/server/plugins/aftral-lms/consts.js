const lodash=require('lodash')

const ROLE_APPRENANT="APPRENANT"
const ROLE_FORMATEUR="FORMATEUR"
const ROLE_CONCEPTEUR="CONCEPTEUR"
const ROLE_GESTIONNAIRE="GESTIONNAIRE"
const ROLE_SUPERVISEUR="SUPERVISEUR"
const ROLE_HELPDESK="HELPDESK"
const ROLE_ADMINISTRATEUR="ADMINISTRATEUR"

const ROLES={
  [ROLE_APPRENANT]:"Apprenant",
  [ROLE_FORMATEUR]:"Formateur",
  [ROLE_CONCEPTEUR]:"Concepteur",
  [ROLE_GESTIONNAIRE]:"Gestionnaire",
  [ROLE_SUPERVISEUR]:"Superviseur",
  [ROLE_HELPDESK]:"Helpdesk",
  [ROLE_ADMINISTRATEUR]:"Administrateur",
}

const BLOCK_TYPE='type'
const BLOCK_DISCRIMINATOR = {discriminatorKey: BLOCK_TYPE}

const RESOURCE_TYPE_SCORM=`RESOURCE_TYPE_SCORM`
const RESOURCE_TYPE_VISIO=`RESOURCE_TYPE_VISIO`
const RESOURCE_TYPE_PDF=`RESOURCE_TYPE_PDF`
const RESOURCE_TYPE_WORD=`RESOURCE_TYPE_WORD`
const RESOURCE_TYPE_EXCEL=`RESOURCE_TYPE_EXCEL`
const RESOURCE_TYPE_PPT=`RESOURCE_TYPE_PPT`
const RESOURCE_TYPE_VIDEO=`RESOURCE_TYPE_VIDEO`
const RESOURCE_TYPE_LINK=`RESOURCE_TYPE_LINK`
const RESOURCE_TYPE_AUDIO=`RESOURCE_TYPE_AUDIO`
const RESOURCE_TYPE_FOLDER=`RESOURCE_TYPE_FOLDER`

const RESOURCE_TYPE={
  [RESOURCE_TYPE_SCORM]:"Scorm",
  [RESOURCE_TYPE_VISIO]:"Classe virtuelle",
  [RESOURCE_TYPE_PDF]:"Pdf",
  [RESOURCE_TYPE_WORD]:"Word",
  [RESOURCE_TYPE_EXCEL]:"Excel",
  [RESOURCE_TYPE_PPT]:"Powerpoint",
  [RESOURCE_TYPE_VIDEO]:"Video",
  [RESOURCE_TYPE_LINK]:"Lien web",
  [RESOURCE_TYPE_AUDIO]:"Audio",
  [RESOURCE_TYPE_FOLDER]:"Dossier",
}

//'doc', 'docx', 'xls', 'xlsx', 'pps', 'ppsx', 'ppt', 'pptx', 'html', 'csv', 'pdf', 'mp4', 'webm'
const RESOURCE_TYPE_EXT={
  [RESOURCE_TYPE_SCORM]: ['.html', '.htm'],
  [RESOURCE_TYPE_VISIO]:"Classe virtuelle",
  [RESOURCE_TYPE_PDF]: '.pdf',
  [RESOURCE_TYPE_WORD]: ['.doc', '.docx'],
  [RESOURCE_TYPE_EXCEL]: ['.xls', '.xlsx'],
  [RESOURCE_TYPE_PPT]: ['.pps', '.ppsx', '.ppt', '.pptx'],
  [RESOURCE_TYPE_VIDEO]: ['.mp4', '.webm'],
  [RESOURCE_TYPE_LINK]: [],
  [RESOURCE_TYPE_AUDIO]: ['.mp3','.wav','.flac','.aac','.ogg','.wma','.m4a','.aiff'],
  [RESOURCE_TYPE_FOLDER]: ['.zip'],
}

const PROGRAM_STATUS_DRAFT="PROGRAM_STATUS_DRAFT"
const PROGRAM_STATUS_TEST="PROGRAM_STATUS_TEST"
const PROGRAM_STATUS_AVAILABLE="PROGRAM_STATUS_AVAILABLE"
const PROGRAM_STATUS_UNAVAILABLE="PROGRAM_STATUS_UNAVAILABLE"

const PROGRAM_STATUS={
  [PROGRAM_STATUS_DRAFT]:"Conception",
  [PROGRAM_STATUS_TEST]:"En test",
  [PROGRAM_STATUS_AVAILABLE]:"Production",
  [PROGRAM_STATUS_UNAVAILABLE]:"Désactivé",
}

const MAX_POPULATE_DEPTH=6

const BLOCK_STATUS_TO_COME="BLOCK_STATUS_TO_COME"
const BLOCK_STATUS_CURRENT="BLOCK_STATUS_CURRENT"
const BLOCK_STATUS_FINISHED="BLOCK_STATUS_FINISHED"
const BLOCK_STATUS_UNAVAILABLE="BLOCK_STATUS_UNAVAILABLE"

const BLOCK_STATUS={
  [BLOCK_STATUS_TO_COME]:"Disponible",
  [BLOCK_STATUS_CURRENT]:"En cours",
  [BLOCK_STATUS_FINISHED]:"Terminé",
  [BLOCK_STATUS_UNAVAILABLE]: 'Non disponible',
}

const FEED_TYPE_SESSION="session"
const FEED_TYPE_GROUP="group"
const FEED_TYPE_GENERAL="general"

const FEED_TYPE={
  [FEED_TYPE_SESSION]:"Forum de session",
  [FEED_TYPE_GROUP]:"Forum de groupe",
  [FEED_TYPE_GENERAL]:"Forum général",
}

const ACHIEVEMENT_RULE_CONSULT=`ACHIEVEMENT_RULE_CONSULT`
const ACHIEVEMENT_RULE_SUCCESS=`ACHIEVEMENT_RULE_SUCCESS`
const ACHIEVEMENT_RULE_FINISHED=`ACHIEVEMENT_RULE_FINISHED`
const ACHIEVEMENT_RULE_SUCCESS_OR_FINISHED=`ACHIEVEMENT_RULE_SUCCESS_OR_FINISHED`
const ACHIEVEMENT_RULE_CONSULT_PARTIAL=`ACHIEVEMENT_RULE_CONSULT_PARTIAL`
const ACHIEVEMENT_RULE_CONSULT_FULL=`ACHIEVEMENT_RULE_CONSULT_FULL`
const ACHIEVEMENT_RULE_JOIN_PARTIAL=`ACHIEVEMENT_RULE_JOIN_PARTIAL`
const ACHIEVEMENT_RULE_JOIN_FULL=`ACHIEVEMENT_RULE_JOIN_FULL`
const ACHIEVEMENT_RULE_DOWNLOAD=`ACHIEVEMENT_RULE_DOWNLOAD`

const ACHIEVEMENT_RULE={
  [ACHIEVEMENT_RULE_CONSULT]:`Consulter`,
  [ACHIEVEMENT_RULE_SUCCESS]:`Réussir`,
  [ACHIEVEMENT_RULE_FINISHED]:`Terminer`,
  [ACHIEVEMENT_RULE_SUCCESS_OR_FINISHED]:`Réussi ou terminé`,
  [ACHIEVEMENT_RULE_CONSULT_PARTIAL]:`Consultation partielle`,
  [ACHIEVEMENT_RULE_CONSULT_FULL]:`Consultation totale`,
  [ACHIEVEMENT_RULE_JOIN_PARTIAL]:`Participation partielle`,
  [ACHIEVEMENT_RULE_JOIN_FULL]:`Participation totale`,
  [ACHIEVEMENT_RULE_DOWNLOAD]: `Télécharger`,
}

const ACHIEVEMENT_RULE_CHECK={
  [ACHIEVEMENT_RULE_CONSULT]: pr => !!pr.consult,
  [ACHIEVEMENT_RULE_SUCCESS]: pr => !!pr.success,
  [ACHIEVEMENT_RULE_FINISHED]:pr => !!pr.finished,
  [ACHIEVEMENT_RULE_SUCCESS_OR_FINISHED]: pr => !!pr.success || !!pr.finished,
  [ACHIEVEMENT_RULE_CONSULT_PARTIAL]: pr => !!pr.consult_partial,
  [ACHIEVEMENT_RULE_CONSULT_FULL]: pr => !!pr.consult_full,
  [ACHIEVEMENT_RULE_JOIN_PARTIAL]: pr => !!pr.join_partial,
  [ACHIEVEMENT_RULE_JOIN_FULL]: pr => !!pr.join_full,
  [ACHIEVEMENT_RULE_DOWNLOAD]: pr => !!pr.download,
}

// Available achievement rules by resource type
const AVAILABLE_ACHIEVEMENT_RULES={
  ...Object.fromEntries([RESOURCE_TYPE_PDF, RESOURCE_TYPE_WORD, RESOURCE_TYPE_EXCEL, RESOURCE_TYPE_PPT, RESOURCE_TYPE_FOLDER]
    .map(type => ([type, [ACHIEVEMENT_RULE_CONSULT, ACHIEVEMENT_RULE_DOWNLOAD]]))),
  [RESOURCE_TYPE_SCORM]: [ACHIEVEMENT_RULE_SUCCESS_OR_FINISHED, ACHIEVEMENT_RULE_CONSULT, ACHIEVEMENT_RULE_SUCCESS, ACHIEVEMENT_RULE_FINISHED],
  [RESOURCE_TYPE_VISIO]: [ACHIEVEMENT_RULE_JOIN_FULL, ACHIEVEMENT_RULE_DOWNLOAD, ACHIEVEMENT_RULE_JOIN_PARTIAL],
  [RESOURCE_TYPE_AUDIO]: [ACHIEVEMENT_RULE_CONSULT_FULL, ACHIEVEMENT_RULE_CONSULT_PARTIAL, ACHIEVEMENT_RULE_DOWNLOAD],
  [RESOURCE_TYPE_VIDEO]: [ACHIEVEMENT_RULE_CONSULT_FULL, ACHIEVEMENT_RULE_CONSULT_PARTIAL, ACHIEVEMENT_RULE_DOWNLOAD],
  [RESOURCE_TYPE_LINK]: [ACHIEVEMENT_RULE_CONSULT],
  }

// Default achievement rule by resource type
const DEFAULT_ACHIEVEMENT_RULE=lodash(AVAILABLE_ACHIEVEMENT_RULES)
  .mapValues(v => v[0])
  .value()

const SCALE_NOT_ACQUIRED=`SCALE_NOT_ACQUIRED`
const SCALE_ACQUIRING=`SCALE_ACQUIRING`
const SCALE_ACQUIRED=`SCALE_ACQUIRED`

const SCALE={
  [SCALE_NOT_ACQUIRED]:`not_acquired`,
  [SCALE_ACQUIRING]:`acquiring`,
  [SCALE_ACQUIRED]:`acquired`,
}

const DURATION_DAY=`DURATION_DAY`
const DURATION_WEEK=`DURATION_WEEK`
const DURATION_MONTH=`DURATION_MONTH`

const DURATION_UNIT={
  [DURATION_DAY]:`jour(s)`,
  [DURATION_WEEK]:`semaine(s)`,
  [DURATION_MONTH]:`mois`,
}

const TICKET_TAG_ADMINISTRATIVE = `ADMINISTRATIVE`
const TICKET_TAG_TECHNICAL = `TECHNICAL`
const TICKET_TAG_EDUCATIONAL = `EDUCATIONAL`

const TICKET_TAG = {
  [TICKET_TAG_ADMINISTRATIVE] : `Administratif`,
  [TICKET_TAG_EDUCATIONAL] : `Pédagogique`,
  [TICKET_TAG_TECHNICAL] : `Technique`,
}

const TICKET_STATUS_CURRENT = `CURRENT`
const TICKET_STATUS_TREATED = `TREATED`
const TICKET_STATUS_NOT_TREATED = `NOT_TREATED`

const TICKET_STATUS = {
  [TICKET_STATUS_CURRENT] : `En cours`,
  [TICKET_STATUS_TREATED] : `Traité`,
  [TICKET_STATUS_NOT_TREATED] : `Non traité`,
}

const PERMISSION_ADD_RESOURCE = `PERM_ADD_RESOURCE`
const PERMISSION_CMS = `PERM_CMS`
const PERMISSION_TICKET = `PERM_TICKET`
const PERMISSION_PERMISSIONS = `PERM_PERMISSIONS`
const PERMISSION_END_RESOURCE = `PERM_END_RESOURCE`

const PERMISSIONS = {
  [PERMISSION_ADD_RESOURCE] : `Ajouter une ressource`,
  [PERMISSION_CMS] : `Accéder à l'espace gestionnaire`,
  [PERMISSION_TICKET] : `Visualiser et traiter les tickets`,
  [PERMISSION_PERMISSIONS] : `Gérer les permissions`,
  [PERMISSION_END_RESOURCE] : `Achever une ressource`
}

module.exports={
    ROLES, ROLE_ADMINISTRATEUR, ROLE_APPRENANT, ROLE_CONCEPTEUR, ROLE_FORMATEUR, ROLE_GESTIONNAIRE, ROLE_HELPDESK, ROLE_SUPERVISEUR,
    BLOCK_DISCRIMINATOR, BLOCK_TYPE,
    RESOURCE_TYPE, RESOURCE_TYPE_SCORM,
    PROGRAM_STATUS, PROGRAM_STATUS_DRAFT, MAX_POPULATE_DEPTH,
    BLOCK_STATUS, BLOCK_STATUS_TO_COME, BLOCK_STATUS_CURRENT, BLOCK_STATUS_FINISHED, BLOCK_STATUS_UNAVAILABLE,
    FEED_TYPE, FEED_TYPE_GENERAL, FEED_TYPE_GROUP, FEED_TYPE_SESSION, RESOURCE_TYPE_EXCEL, RESOURCE_TYPE_PDF,
    RESOURCE_TYPE_PPT, RESOURCE_TYPE_VIDEO, RESOURCE_TYPE_WORD,
    ACHIEVEMENT_RULE, ACHIEVEMENT_RULE_SUCCESS, ACHIEVEMENT_RULE_CONSULT, ACHIEVEMENT_RULE_DOWNLOAD,
    SCALE, RESOURCE_TYPE_EXT, RESOURCE_TYPE_LINK, DEFAULT_ACHIEVEMENT_RULE, AVAILABLE_ACHIEVEMENT_RULES,
    ACHIEVEMENT_RULE_CHECK, DURATION_UNIT, TICKET_TAG, TICKET_STATUS, TICKET_STATUS_NOT_TREATED,
    PERMISSIONS,
}