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

const DEFAULT_ROLE=ROLE_TI

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

const AVAILABILITY_AVAILABLE="AVAILABILITY_AVAILABLE"
const AVAILABILITY_NOT_AVAILABLE="AVAILABILITY_NOT_AVAILABLE"

const AVAILABILITY={
 AVAILABILITY_AVAILABLE:"Disponible",
 AVAILABILITY_NOT_AVAILABLE:"Indisponible",
}

const EXPERIENCE_LESS_1="EXPERIENCE_LESS_1"
const EXPERIENCE_1_TO_5="EXPERIENCE_1_TO_5"
const EXPERIENCE_MORE_5="EXPERIENCE_MORE_5"

const EXPERIENCE={
 EXPERIENCE_LESS_1:"< 1 an",
 EXPERIENCE_1_TO_5:"de 1 à 5 ans",
 EXPERIENCE_MORE_5:"> 5 ans",
}

const COMPANY_ACTIVITY_AGROALIMENTAIRE='COMPANY_ACTIVITY_AGROALIMENTAIRE'
const COMPANY_ACTIVITY_BANQUE='COMPANY_ACTIVITY_BANQUE'
const COMPANY_ACTIVITY_ASSURANCE='COMPANY_ACTIVITY_ASSURANCE'
const COMPANY_ACTIVITY_BOIS='COMPANY_ACTIVITY_BOIS'
const COMPANY_ACTIVITY_PAPIER='COMPANY_ACTIVITY_PAPIER'
const COMPANY_ACTIVITY_CARTON='COMPANY_ACTIVITY_CARTON'
const COMPANY_ACTIVITY_IMPRIMERIE='COMPANY_ACTIVITY_IMPRIMERIE'
const COMPANY_ACTIVITY_BTP='COMPANY_ACTIVITY_BTP'
const COMPANY_ACTIVITY_MATERIAUX_DE_CONSTRUCTION='COMPANY_ACTIVITY_MATERIAUX_DE_CONSTRUCTION'
const COMPANY_ACTIVITY_CHIMIE='COMPANY_ACTIVITY_CHIMIE'
const COMPANY_ACTIVITY_PARACHIMIE='COMPANY_ACTIVITY_PARACHIMIE'
const COMPANY_ACTIVITY_COMMERCE='COMPANY_ACTIVITY_COMMERCE'
const COMPANY_ACTIVITY_NEGOCE='COMPANY_ACTIVITY_NEGOCE'
const COMPANY_ACTIVITY_DISTRIBUTION='COMPANY_ACTIVITY_DISTRIBUTION'
const COMPANY_ACTIVITY_EDITION='COMPANY_ACTIVITY_EDITION'
const COMPANY_ACTIVITY_COMMUNICATION='COMPANY_ACTIVITY_COMMUNICATION'
const COMPANY_ACTIVITY_MULTIMEDIA='COMPANY_ACTIVITY_MULTIMEDIA'
const COMPANY_ACTIVITY_ELECTRONIQUE='COMPANY_ACTIVITY_ELECTRONIQUE'
const COMPANY_ACTIVITY_ELECTRICITE='COMPANY_ACTIVITY_ELECTRICITE'
const COMPANY_ACTIVITY_ETUDES_ET_CONSEILS='COMPANY_ACTIVITY_ETUDES_ET_CONSEILS'
const COMPANY_ACTIVITY_INDUSTRIE_PHARMACEUTIQUE='COMPANY_ACTIVITY_INDUSTRIE_PHARMACEUTIQUE'
const COMPANY_ACTIVITY_INFORMATIQUE='COMPANY_ACTIVITY_INFORMATIQUE'
const COMPANY_ACTIVITY_TELECOMS='COMPANY_ACTIVITY_TELECOMS'
const COMPANY_ACTIVITY_MACHINES_ET_EQUIPEMENTS='COMPANY_ACTIVITY_MACHINES_ET_EQUIPEMENTS'
const COMPANY_ACTIVITY_AUTOMOBILE='COMPANY_ACTIVITY_AUTOMOBILE'
const COMPANY_ACTIVITY_METALLURGIE='COMPANY_ACTIVITY_METALLURGIE'
const COMPANY_ACTIVITY_TRAVAIL_DU_METAL='COMPANY_ACTIVITY_TRAVAIL_DU_METAL'
const COMPANY_ACTIVITY_PLASTIQUE='COMPANY_ACTIVITY_PLASTIQUE'
const COMPANY_ACTIVITY_CAOUTCHOUC='COMPANY_ACTIVITY_CAOUTCHOUC'
const COMPANY_ACTIVITY_SERVICES_AUX_ENTREPRISES='COMPANY_ACTIVITY_SERVICES_AUX_ENTREPRISES'
const COMPANY_ACTIVITY_TEXTILE='COMPANY_ACTIVITY_TEXTILE'
const COMPANY_ACTIVITY_HABILLEMENT='COMPANY_ACTIVITY_HABILLEMENT'
const COMPANY_ACTIVITY_CHAUSSURE='COMPANY_ACTIVITY_CHAUSSURE'
const COMPANY_ACTIVITY_TRANSPORTS='COMPANY_ACTIVITY_TRANSPORTS'
const COMPANY_ACTIVITY_LOGISTIQUE='COMPANY_ACTIVITY_LOGISTIQUE'

const COMPANY_ACTIVITY={
  COMPANY_ACTIVITY_AGROALIMENTAIRE: 'Agroalimentaire',
  COMPANY_ACTIVITY_BANQUE: 'Banque',
  COMPANY_ACTIVITY_ASSURANCE: 'Assurance',
  COMPANY_ACTIVITY_BOIS: 'Bois',
  COMPANY_ACTIVITY_PAPIER: 'Papier',
  COMPANY_ACTIVITY_CARTON: 'Carton',
  COMPANY_ACTIVITY_IMPRIMERIE: 'Imprimerie',
  COMPANY_ACTIVITY_BTP: 'BTP',
  COMPANY_ACTIVITY_MATERIAUX_DE_CONSTRUCTION: 'Matériaux de construction',
  COMPANY_ACTIVITY_CHIMIE: 'Chimie',
  COMPANY_ACTIVITY_PARACHIMIE: 'Parachimie',
  COMPANY_ACTIVITY_COMMERCE: 'Commerce',
  COMPANY_ACTIVITY_NEGOCE: 'Négoce',
  COMPANY_ACTIVITY_DISTRIBUTION: 'Distribution',
  COMPANY_ACTIVITY_EDITION: 'Édition',
  COMPANY_ACTIVITY_COMMUNICATION: 'Communication',
  COMPANY_ACTIVITY_MULTIMEDIA: 'Multimédia',
  COMPANY_ACTIVITY_ELECTRONIQUE: 'Électronique',
  COMPANY_ACTIVITY_ELECTRICITE: 'Électricité',
  COMPANY_ACTIVITY_ETUDES_ET_CONSEILS: 'Études et conseils',
  COMPANY_ACTIVITY_INDUSTRIE_PHARMACEUTIQUE: 'Industrie pharmaceutique',
  COMPANY_ACTIVITY_INFORMATIQUE: 'Informatique',
  COMPANY_ACTIVITY_TELECOMS: 'Télécoms',
  COMPANY_ACTIVITY_MACHINES_ET_EQUIPEMENTS: 'Machines et équipements',
  COMPANY_ACTIVITY_AUTOMOBILE: 'Automobile',
  COMPANY_ACTIVITY_METALLURGIE: 'Métallurgie',
  COMPANY_ACTIVITY_TRAVAIL_DU_METAL: 'Travail du métal',
  COMPANY_ACTIVITY_PLASTIQUE: 'Plastique',
  COMPANY_ACTIVITY_CAOUTCHOUC: 'Caoutchouc',
  COMPANY_ACTIVITY_SERVICES_AUX_ENTREPRISES: 'Services aux entreprises',
  COMPANY_ACTIVITY_TEXTILE: 'Textile',
  COMPANY_ACTIVITY_HABILLEMENT: 'Habillement',
  COMPANY_ACTIVITY_CHAUSSURE: 'Chaussure',
  COMPANY_ACTIVITY_TRANSPORTS: 'Transports',
  COMPANY_ACTIVITY_LOGISTIQUE: 'Logistique',
}

const COMPANY_SIZE_LESS_10="COMPANY_SIZE_LESS_10"
const COMPANY_SIZE_10_TO_250="COMPANY_SIZE_10_TO_250"
const COMPANY_SIZE_250_TO_5000="COMPANY_SIZE_250_TO_5000"
const COMPANY_SIZE_MORE_5000="COMPANY_SIZE_MORE_5000"

const COMPANY_SIZE={
 COMPANY_SIZE_LESS_10:"Moins de 10",
 COMPANY_SIZE_10_TO_250:"10 à 250",
 COMPANY_SIZE_250_TO_5000:"250 à 5000",
 COMPANY_SIZE_MORE_5000:"Plus de 5000",
}

const CONTRACT_TYPE_CDD="CONTRACT_TYPE_CDD"
const CONTRACT_TYPE_CDI="CONTRACT_TYPE_CDI"
const CONTRACT_TYPE_STAGE="CONTRACT_TYPE_STAGE"
const CONTRACT_TYPE_ALTERNANCE="CONTRACT_TYPE_ALTERNANCE"
const CONTRACT_TYPE_FREELANCE="CONTRACT_TYPE_FREELANCE"

const CONTRACT_TYPE={
 CONTRACT_TYPE_CDD:"CDD",
 CONTRACT_TYPE_CDI:"CDI",
 CONTRACT_TYPE_STAGE:"Stage",
 CONTRACT_TYPE_ALTERNANCE:"Alternance",
 CONTRACT_TYPE_FREELANCE:"Freelance",
}

module.exports={
  ROLES,
  ROLE_TI,
  ROLE_COMPANY_ADMIN,
  COACHING,
  COACH_OTHER,
  COMPANY_STATUS,
  AVAILABILITY,
  EXPERIENCE,
  DEFAULT_ROLE,
  COACH_ALLE,
  COMPANY_ACTIVITY,
  COMPANY_SIZE,
  ROLE_COMPANY_BUYER,
  CONTRACT_TYPE,
}
