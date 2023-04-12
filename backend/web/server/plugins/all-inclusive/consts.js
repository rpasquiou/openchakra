const ROLE_TI='TI'
const ROLE_COMPANY_BUYER='COMPANY_BUYER'
const ROLE_COMPANY_ADMIN='COMPANY_ADMIN'
const ROLE_ALLE_ADMIN='ALLE_ADMIN'

const ROLES={
  [ROLE_TI]: 'TI',
  [ROLE_COMPANY_BUYER]: 'Acheteur entreprise',
  [ROLE_COMPANY_ADMIN]: 'Admin. entreprise',
  [ROLE_ALLE_ADMIN]: 'Admin. All-E',
}

const COACH_ALLE='COACH_ALLE'
const COACH_OTHER='COACH_OTHER'
const COACH_NONE='COACH_NONE'

const COACHING={
  COACH_ALLE: 'Par All-Inclusive',
  COACH_OTHER: 'Par un autre organisme',
  COACH_NONE: 'Pas accompagné',
}

const COMPANY_STATUS_EI="COMPANY_STATUS_EI"
const COMPANY_STATUS_EURL="COMPANY_STATUS_EURL"
const COMPANY_STATUS_SARL="COMPANY_STATUS_SARL"
const COMPANY_STATUS_SA="COMPANY_STATUS_SA"
const COMPANY_STATUS_SAS="COMPANY_STATUS_SAS"
const COMPANY_STATUS_SASU="COMPANY_STATUS_SASU"
const COMPANY_STATUS_SNC="COMPANY_STATUS_SNC"
const COMPANY_STATUS_SCOP="COMPANY_STATUS_SCOP"
const COMPANY_STATUS_SCA="COMPANY_STATUS_SCA"
const COMPANY_STATUS_SCS="COMPANY_STATUS_SCS"

const COMPANY_STATUS={
  COMPANY_STATUS_EI:"Entreprise individuelle",
  COMPANY_STATUS_EURL:"Entreprise unipersonnelle à responsabilité limitée",
  COMPANY_STATUS_SARL:"Société anonyme à responsabilité limitée",
  COMPANY_STATUS_SA:"Société anonyme",
  COMPANY_STATUS_SAS:"Société par actions simplifiées",
  COMPANY_STATUS_SASU:"Société par actions simplifiées unipersonnelle",
  COMPANY_STATUS_SNC:"Société en nom collectif",
  COMPANY_STATUS_SCOP:"Société coopérative de production",
  COMPANY_STATUS_SCA:"Société en commandite par actions",
COMPANY_STATUS_SCS:"Société en commandite simple",
}

module.exports={
  ROLES,
  ROLE_TI,
  ROLE_COMPANY_ADMIN,
  COACHING,
  COACH_OTHER,
  COMPANY_STATUS,
}
