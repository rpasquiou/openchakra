const DISCRIMINATOR_KEY = { discriminatorKey: 'type' }
const DISC_PARTNER = 'partner'
const DISC_MEMBER = 'member'
const DISC_ADMIN = 'admin'

const ROLE_ADMIN = `ROLE_ADMIN`
const ROLE_PARTNER = `ROLE_PARTNER`
const ROLE_MEMBER = `ROLE_MEMBER`
const ROLES = {
  [ROLE_PARTNER]: `Partenaire`,
  [ROLE_MEMBER]: `Membre`,
  [ROLE_ADMIN]: `Administrateur`
}

const CONTENT_TYPE_ARTICLE = `CONTENT_TYPE_ARTICLE`
const CONTENT_TYPE_GUIDE = `CONTENT_TYPE_GUIDE`
const CONTENT_TYPE_PODCAST = `CONTENT_TYPE_PODCAST`
const CONTENT_TYPE_VIDEO = `CONTENT_TYPE_VIDEO`
const CONTENT_TYPE = {
  [CONTENT_TYPE_ARTICLE]: `Article`,
  [CONTENT_TYPE_VIDEO]: `Vidéo`,
  [CONTENT_TYPE_PODCAST]: `Podcast`,
  [CONTENT_TYPE_GUIDE]: `Guide`
}

const SECTOR_AERONAUTICS = `SECTOR_AERONAUTICS`
const SECTOR_AGRI_FOOD = `SECTOR_AGRI_FOOD`
const SECTOR_AUTOMOBILE = `SECTOR_AUTOMOBILE`
const SECTOR_OTHER = `SECTOR_OTHER`
const SECTOR_BIOTECHNOLOGIES = `SECTOR_BIOTECHNOLOGIES`
const SECTOR_BTP = `SECTOR_BTP`
const SECTOR_DESIGN_OFFICE = `SECTOR_DESIGN_OFFICE`
const SECTOR_CHEMISTRY = `SECTOR_CHEMISTRY`
const SECTOR_TRADE = `SECTOR_TRADE`
const SECTOR_COMMUNICATION = `SECTOR_COMMUNICATION`
const SECTOR_ACCOUNTING = `SECTOR_ACCOUNTING`
const SECTOR_AUDIT = `SECTOR_AUDIT`
const SECTOR_DEFENSE = `SECTOR_DEFENSE`
const SECTOR_ELECTRONICS = `SECTOR_ELECTRONICS`
const SECTOR_ENERGY = `SECTOR_ENERGY`
const SECTOR_TEACHING = `SECTOR_TEACHING`
const SECTOR_ENVIRONMENT = `SECTOR_ENVIRONMENT`
const SECTOR_ESN = `SECTOR_ESN`
const SECTOR_FINANCE = `SECTOR_FINANCE`
const SECTOR_IT = `SECTOR_IT`
const SECTOR_LOGISTICS = `SECTOR_LOGISTICS`
const SECTOR_METALLURGY = `SECTOR_METALLURGY`
const SECTOR_RESEARCH = `SECTOR_RESEARCH`
const SECTOR_HEALTH = `SECTOR_HEALTH`
const SECTOR_PUBLIC = `SECTOR_PUBLIC`
const SECTOR_TEXTILE = `SECTOR_TEXTILE`
const SECTOR_SPORT = `SECTOR_SPORT`

const SECTOR = {
  [SECTOR_AERONAUTICS] : `Aéronautique`,
  [SECTOR_AGRI_FOOD] : `Agroalimentaire`,
  [SECTOR_AUTOMOBILE] : `Automobile`,
  [SECTOR_OTHER] : `Autres industries`,
  [SECTOR_BIOTECHNOLOGIES] : `Biotechnologies`,
  [SECTOR_BTP] : `BTP & construction`,
  [SECTOR_DESIGN_OFFICE] : `Bureau d'études`,
  [SECTOR_CHEMISTRY] : `Chimie, cosmétique`,
  [SECTOR_TRADE] : `Commerce et distribution`,
  [SECTOR_COMMUNICATION] : `Communication et marketing`,
  [SECTOR_ACCOUNTING] : `Comptabilité, gestion et ressources humaines`,
  [SECTOR_AUDIT] : `Conseil & audit`,
  [SECTOR_DEFENSE] : `Défense et spatial`,
  [SECTOR_ELECTRONICS] : `Electronique`,
  [SECTOR_ENERGY] : `Energie`,
  [SECTOR_TEACHING] : `Enseignement et formation`,
  [SECTOR_ENVIRONMENT] : `Environnement`,
  [SECTOR_ESN] : `ESN`,
  [SECTOR_FINANCE] : `Finance, banque et assurance`,
  [SECTOR_IT] : `Informatique, internet et communication`,
  [SECTOR_LOGISTICS] : `Logistique et transport`,
  [SECTOR_METALLURGY] : `Métallurgie`,
  [SECTOR_RESEARCH] : `Recherche`,
  [SECTOR_HEALTH] : `Santé, Pharma`,
  [SECTOR_PUBLIC] : `Secteur public & collectivités`,
  [SECTOR_TEXTILE] : `Textile`,
  [SECTOR_SPORT] : `Sport`
}

const EXPERTISE_CATEGORY_THREAT_ANALYSIS = `EXPERTISE_CATEGORY_THREAT_ANALYSIS`
const EXPERTISE_CATEGORY_NETWORK_AND_ENDPOINT_SECURITY = `EXPERTISE_CATEGORY_NETWORK_AND_ENDPOINT_SECURITY`
const EXPERTISE_CATEGORY_APP_SECURITY = `EXPERTISE_CATEGORY_APP_SECURITY`
const EXPERTISE_CATEGORY_ACCESS_AND_IDENTITY_MANAGEMENT = `EXPERTISE_CATEGORY_ACCESS_AND_IDENTITY_MANAGEMENT`
const EXPERTISE_CATEGORY_CONFORMITY_AND_CONTROL = `EXPERTISE_CATEGORY_CONFORMITY_AND_CONTROL`
const EXPERTISE_CATEGORY_CLOUD_AND_VIRTUAL_ENVIRONMENT_SECURITY = `EXPERTISE_CATEGORY_CLOUD_AND_VIRTUAL_ENVIRONMENT_SECURITY`
const EXPERTISE_CATEGORY_DATA_AND_SYSTEM_SECURITY = `EXPERTISE_CATEGORY_DATA_AND_SYSTEM_SECURITY`
const EXPERTISE_CATEGORY_INCIDENT_MANAGEMENT = `EXPERTISE_CATEGORY_INCIDENT_MANAGEMENT`
const EXPERTISE_CATEGORY_SENSITIZATION_AND_FORMATION = `EXPERTISE_CATEGORY_SENSITIZATION_AND_FORMATION`
const EXPERTISE_CATEGORY_EVENT_COMMUNITY_RESEARCH = `EXPERTISE_CATEGORY_EVENT_COMMUNITY_RESEARCH`
const EXPERTISE_CATEGORY_CRYPTOGRAPHY_AND_EMERGING_TECHNOLOGIES = `EXPERTISE_CATEGORY_CRYPTOGRAPHY_AND_EMERGING_TECHNOLOGIES`

const EXPERTISE_CATEGORIES = {
  [EXPERTISE_CATEGORY_THREAT_ANALYSIS] : `Analyse des Menaces et Intelligence`,
  [EXPERTISE_CATEGORY_NETWORK_AND_ENDPOINT_SECURITY] : `Sécurité des Réseaux et des Endpoints`,
  [EXPERTISE_CATEGORY_APP_SECURITY] : `Sécurité des Applications`,
  [EXPERTISE_CATEGORY_ACCESS_AND_IDENTITY_MANAGEMENT] : `Gestion des Identités et des Accès`,
  [EXPERTISE_CATEGORY_CONFORMITY_AND_CONTROL] : `Conformité et Réglementation`,
  [EXPERTISE_CATEGORY_CLOUD_AND_VIRTUAL_ENVIRONMENT_SECURITY] : `Sécurité des Environnements Virtuels et Cloud`,
  [EXPERTISE_CATEGORY_DATA_AND_SYSTEM_SECURITY] : `Sécurité des Systèmes et des données`,
  [EXPERTISE_CATEGORY_INCIDENT_MANAGEMENT] : `Gestion des Incidents`,
  [EXPERTISE_CATEGORY_SENSITIZATION_AND_FORMATION] : `Formation et Sensibilisation`,
  [EXPERTISE_CATEGORY_EVENT_COMMUNITY_RESEARCH] : `Communautés, Événements, Recherche`,
  [EXPERTISE_CATEGORY_CRYPTOGRAPHY_AND_EMERGING_TECHNOLOGIES] : `Cryptographie et Technologies Émergentes`
}

const JOB_GENERAL_MANAGER = `JOB_GENERAL_MANAGER`
const JOB_DIGITAL_MANAGER = `JOB_DIGITAL_MANAGER`
const JOB_IT = `JOB_IT`
const JOB_FINANCIAL_MANAGER = `JOB_FINANCIAL_MANAGER`
const JOB_GENERAL_COUNSEL = `JOB_GENERAL_COUNSEL`
const JOB_COMMERCIAL_MANAGER = `JOB_COMMERCIAL_MANAGER`
const JOB_MARKETING_MANAGER = `JOB_MARKETING_MANAGER`
const JOB_STUDENT = `JOB_STUDENT`
const JOB_OTHER = `JOB_OTHER`

const JOBS = {
  [JOB_GENERAL_MANAGER]: `Direction Générale`,
  [JOB_DIGITAL_MANAGER]: `Direction du Digital`,
  [JOB_IT]: `Direction Informatique`,
  [JOB_FINANCIAL_MANAGER]: `Direction Financière`,
  [JOB_GENERAL_COUNSEL]: `Direction Juridique`,
  [JOB_COMMERCIAL_MANAGER]: `Direction Commerciale`,
  [JOB_MARKETING_MANAGER]: `Direction Marketing`,
  [JOB_STUDENT]: `Etudiant`,
  [JOB_OTHER]: `Autres`
}

const COMPANY_SIZE_0_10 = `COMPANY_SIZE_0_10-10`
const COMPANY_SIZE_11_50 = `COMPANY_SIZE_11_50`
const COMPANY_SIZE_51_500 = `COMPANY_SIZE_51_500`
const COMPANY_SIZE_501_1000 = `COMPANY_SIZE_501_1000`
const COMPANY_SIZE_1001_PLUS = `COMPANY_SIZE_1001_PLUS`

const COMPANY_SIZE = {
  [COMPANY_SIZE_0_10]:`0-10`,
  [COMPANY_SIZE_11_50]:`11-50`,
  [COMPANY_SIZE_51_500]: `51-500`,
  [COMPANY_SIZE_501_1000]:`501-1000`,
  [COMPANY_SIZE_1001_PLUS]:`1001 et plus`,
}

const ESTIMATED_DURATION_UNIT_JOURS=`ESTIMATED_DURATION_UNIT_JOURS`
const ESTIMATED_DURATION_UNIT_SEMAINES=`ESTIMATED_DURATION_UNIT_SEMAINES`
const ESTIMATED_DURATION_UNIT_MOIS=`ESTIMATED_DURATION_UNIT_MOIS`

const ESTIMATED_DURATION_UNITS={
  [ESTIMATED_DURATION_UNIT_JOURS]:`jours`,
  [ESTIMATED_DURATION_UNIT_SEMAINES]:`semaines`,
  [ESTIMATED_DURATION_UNIT_MOIS]:`mois`,
}

const LOOKING_FOR_MISSION_YES = `LOOKING_FOR_MISSION_YES`
const LOOKING_FOR_MISSION_NO = `LOOKING_FOR_MISSION_NO`

const LOOKING_FOR_MISSION = {
  [LOOKING_FOR_MISSION_YES]: `oui`,
  [LOOKING_FOR_MISSION_NO]: `non`
}

const CONTENT_PRIVATE = `CONTENT_PRIVATE`
const CONTENT_PUBLIC = `CONTENT_PUBLIC`

const CONTENT_VISIBILITY = {
  [CONTENT_PRIVATE]: `privé`,
  [CONTENT_PUBLIC]: `public`
}

const EVENT_VISIBILITY_PRIVATE = `EVENT_VISIBILITY_PRIVATE`
const EVENT_VISIBILITY_PUBLIC = `EVENT_VISIBILITY_PUBLIC`

const EVENT_VISIBILITY = {
  [EVENT_VISIBILITY_PRIVATE]: `privé`,
  [EVENT_VISIBILITY_PUBLIC]: `public`
}

const ANSWER_YES = `ANSWER_YES`
const ANSWER_NO = `ANSWER_NO`
const ANSWER_NOT_APPLICABLE = `ANSWER_NOT_APPLICABLE`

const ANSWERS = {
  [ANSWER_YES] : `oui`,
  [ANSWER_NO]  : `non`,
  [ANSWER_NOT_APPLICABLE] : `N\A`
}

const QUESTION_CATEGORY_SECURITY_MANAGEMENT_AND_GOVERNANCE = `QUESTION_CATEGORY_SECURITY_MANAGEMENT_AND_GOVERNANCE`
const QUESTION_CATEGORY_SAFETY_AWARENESS_AND_TRAINING = `QUESTION_CATEGORY_SAFETY_AWARENESS_AND_TRAINING`
const QUESTION_CATEGORY_SECURITY_INCIDENT_MANAGEMENT = `QUESTION_CATEGORY_SECURITY_INCIDENT_MANAGEMENT`
const QUESTION_CATEGORY_OWN_AND_THIRD_PARTY_ASSET_MANAGEMENT = `QUESTION_CATEGORY_OWN_AND_THIRD_PARTY_ASSET_MANAGEMENT`
const QUESTION_CATEGORY_IDENTITY_AND_CLEARANCE_MANAGEMENT = `QUESTION_CATEGORY_IDENTITY_AND_CLEARANCE_MANAGEMENT`
const QUESTION_CATEGORY_LOG_AND_SUPERVISION = `QUESTION_CATEGORY_LOG_AND_SUPERVISION`
const QUESTION_CATEGORY_SAVE_AND_RECOVERY = `QUESTION_CATEGORY_SAVE_AND_RECOVERY`
const QUESTION_CATEGORY_DATA_PRIVACY = `QUESTION_CATEGORY_DATA_PRIVACY`
const QUESTION_CATEGORY_PERSONAL_DATA_PROCESSING = `QUESTION_CATEGORY_PERSONAL_DATA_PROCESSING`
const QUESTION_CATEGORY_PHYSICAL_SECURITY = `QUESTION_CATEGORY_PHYSICAL_SECURITY`
const QUESTION_CATEGORY_NETWORK_SECURITY_AND_ADMINISTRATIVE_ENVIRONMENT = `QUESTION_CATEGORY_NETWORK_SECURITY_AND_ADMINISTRATIVE_ENVIRONMENT`
const QUESTION_CATEGORY_ANTIVIRUS_PROTECTION = `QUESTION_CATEGORY_ANTIVIRUS_PROTECTION`
const QUESTION_CATEGORY_ENDPOINT_SECURITY = `QUESTION_CATEGORY_ENDPOINT_SECURITY`
const QUESTION_CATEGORY_MONITORING_AND_UPDATE_MANAGEMENT = `QUESTION_CATEGORY_MONITORING_AND_UPDATE_MANAGEMENT`
const QUESTION_CATEGORY_BANK_TRANSACTION_SECURITY = `QUESTION_CATEGORY_BANK_TRANSACTION_SECURITY`
const QUESTION_CATEGORY_DEVICE_AND_FACTORY_NETWORK_SECURITY = `QUESTION_CATEGORY_DEVICE_AND_FACTORY_NETWORK_SECURITY`

const QUESTION_CATEGORIES = {
  [QUESTION_CATEGORY_SECURITY_MANAGEMENT_AND_GOVERNANCE] : `MANAGEMENT DE LA SECURITE ET GOUVERNANCE`,
  [QUESTION_CATEGORY_SAFETY_AWARENESS_AND_TRAINING] : `FORMATION ET SENSIBILISATION A LA SECURITE`,
  [QUESTION_CATEGORY_SECURITY_INCIDENT_MANAGEMENT] : `GESTION DES INCIDENTS DE SECURITE`,
  [QUESTION_CATEGORY_OWN_AND_THIRD_PARTY_ASSET_MANAGEMENT] : `GESTION DES ACTIFS ET DES TIERS`,
  [QUESTION_CATEGORY_IDENTITY_AND_CLEARANCE_MANAGEMENT] : `GESTION DE l'IDENTITE ET DES HABILITATIONS`,
  [QUESTION_CATEGORY_LOG_AND_SUPERVISION] : `JOURNALISATION ET SUPERVISION`,
  [QUESTION_CATEGORY_SAVE_AND_RECOVERY] : `SAUVEGARDE ET REPRISE D'ACTIVITE`,
  [QUESTION_CATEGORY_DATA_PRIVACY] : `CONFIDENTIALITE DES DONNEES`,
  [QUESTION_CATEGORY_PERSONAL_DATA_PROCESSING] : `TRAITEMENT DES DONNEES PERSONNELLES`,
  [QUESTION_CATEGORY_PHYSICAL_SECURITY] : `SECURITE PHYSIQUE`,
  [QUESTION_CATEGORY_NETWORK_SECURITY_AND_ADMINISTRATIVE_ENVIRONMENT] : `SECURITE DES RESEAUX ET DES ENVIRONNEMENTS D'ADMINISTRATION`,
  [QUESTION_CATEGORY_ANTIVIRUS_PROTECTION] : `PROTECTION ANTIVIRUS`,
  [QUESTION_CATEGORY_ENDPOINT_SECURITY] : `SECURITE DES END POINTS (POSTES DE TRAVAIL ET TELEPHONES)`,
  [QUESTION_CATEGORY_MONITORING_AND_UPDATE_MANAGEMENT] : `VEILLE ET GESTION DES MISES A JOUR`,
  [QUESTION_CATEGORY_BANK_TRANSACTION_SECURITY] : `SECURITE DES OPERATIONS BANCAIRES`,
  [QUESTION_CATEGORY_DEVICE_AND_FACTORY_NETWORK_SECURITY] : `SECURITE DES EQUIPEMENTS ET RESEAUX INDUSTRIELS (OT)`
}

const SCORE_LEVEL_1 = `SCORE_LEVEL_1`
const SCORE_LEVEL_2 = `SCORE_LEVEL_2`
const SCORE_LEVEL_3 = `SCORE_LEVEL_3`

const SCORE_LEVELS = {
  [SCORE_LEVEL_1] : `Niveau 1`,
  [SCORE_LEVEL_2] : `Niveau 2`,
  [SCORE_LEVEL_3] : `Niveau 3`
}

const COIN_SOURCE_WATCH = `COIN_SOURCE_WATCH`
const COIN_SOURCE_PARTICIPATE = `COIN_SOURCE_PARTICIPATE`
const COIN_SOURCE_TRAININGS = `COIN_SOURCE_TRAININGS`
const COIN_SOURCE_LIKE_COMMENT = `COIN_SOURCE_LIKE_COMMENT`
const COIN_SOURCE_BEGINNER_DIAG = `COIN_SOURCE_BEGINNER_DIAG`
const COIN_SOURCE_MEDIUM_DIAG = `COIN_SOURCE_MEDIUM_DIAG`
const COIN_SOURCE_EXPERT_DIAG = `COIN_SOURCE_EXPERT_DIAG`

const COIN_SOURCES = {
  [COIN_SOURCE_WATCH] : `Consulter un contenu`,
  [COIN_SOURCE_PARTICIPATE] : `Participer à un événement`,
  [COIN_SOURCE_TRAININGS] : `Participer à une formation`,
  [COIN_SOURCE_LIKE_COMMENT] : `Liker, commenter`,
  [COIN_SOURCE_BEGINNER_DIAG] : `Faire un diagnostic niveau débutant`,
  [COIN_SOURCE_MEDIUM_DIAG] : `Faire un diagnostic niveau intermédiaire`,
  [COIN_SOURCE_EXPERT_DIAG] : `Faire un diagnostic niveau expert`
}

const STATUT_PARTNER = `STATUT_PARTNER`
const STATUT_SPONSOR = `STATUT_SPONSOR`
const STATUT_FOUNDER = `STATUT_FOUNDER`
const STATUT_MEMBER = `STATUT_MEMBER`

const STATUTS = {
  [STATUT_PARTNER]: `Partenaire`,
  [STATUT_SPONSOR]: `Sponsor`,
  [STATUT_FOUNDER]: `Ambassadeur`,
  [STATUT_MEMBER]: `Membre`
}

const GROUP_VISIBILITY_PUBLIC = `GROUP_VISIBILITY_PUBLIC`
const GROUP_VISIBILITY_PRIVATE = `GROUP_VISIBILITY_PRIVATE`

const GROUP_VISIBILITY = {
  [GROUP_VISIBILITY_PRIVATE]: `privé`,
  [GROUP_VISIBILITY_PUBLIC]: `public`
}

const USER_LEVEL_CURIOUS = `USER_LEVEL_CURIOUS`
const USER_LEVEL_EXPLORER = `USER_LEVEL_EXPLORER`
const USER_LEVEL_AMBASSADOR = `USER_LEVEL_AMBASSADOR`

const USER_LEVELS = {
  [USER_LEVEL_CURIOUS]: `Curieux`,
  [USER_LEVEL_EXPLORER]: `Explorateur`,
  [USER_LEVEL_AMBASSADOR]: `Influenceur`
}

const LEVEL_THRESHOLD_EXPLORER = 50
const LEVEL_THRESHOLD_AMBASSADOR = 100

const CONTRACT_TYPE_CDD = `CONTRACT_TYPE_CDD`
const CONTRACT_TYPE_CDI = `CONTRACT_TYPE_CDI`
const CONTRACT_TYPE_INTERNSHIP = `CONTRACT_TYPE_INTERNSHIP`
const CONTRACT_TYPE_ALTERNATION = `CONTRACT_TYPE_ALTERNATION`

const CONTRACT_TYPES = {
  [CONTRACT_TYPE_CDD] : `CDD`,
  [CONTRACT_TYPE_CDI] : `CDI`,
  [CONTRACT_TYPE_INTERNSHIP] : `Stage`,
  [CONTRACT_TYPE_ALTERNATION] : `Alternance`
}

const WORK_DURATION_FULLTIME = `WORK_DURATION_FULLTIME`
const WORK_DURATION_PARTTIME = `WORK_DURATION_PARTTIME`
const WORK_DURATION_UNSPECIFIED = `WORK_DURATION_UNSPECIFIED`

const WORK_DURATIONS = {
  [WORK_DURATION_PARTTIME]: `Temps partiel`,
  [WORK_DURATION_FULLTIME]: `Temps plein`,
  [WORK_DURATION_UNSPECIFIED]: `Non spécifiée`
}

const PAY_LESS_30 = `PAY_LESS_30`
const PAY_30_TO_40 = `PAY_30_TO_40`
const PAY_FROM_40 = `PAY_FROM_40`
const PAY_TO_NEGOCIATE = `PAY_TO_NEGOCIATE`

const PAY = {
  [PAY_LESS_30]: `Moins de 30k`,
  [PAY_30_TO_40]: `De 30k à 40k`,
  [PAY_FROM_40]: `A partir de 40k`,
  [PAY_TO_NEGOCIATE]: `A négocier`
}

const STAT_MIN_SCORES = 10

const STATUS_ACTIVE = `STATUS_ACTIVE`
const STATUS_INACTIVE = `STATUS_INACTIVE`

const STATUSES = {
  [STATUS_ACTIVE]: `Actif`,
  [STATUS_INACTIVE]: `Inactif`
}

const REQUIRED_COMPLETION_FIELDS = {
  job: `Service`,
  company: `Entreprise`,
  function: `Intitulé de poste`,
  phone: `Téléphone`
}

const OPTIONAL_COMPLETION_FIELDS = {
  city: 'Ville',
  school: 'Ecole',
  picture: 'Photo de profil'
}

const COMPLETED_YES = `COMPLETED_YES`
const COMPLETED_NO = `COMPLETED_NO`

const COMPLETED = {
  [COMPLETED_YES]: `Complété`,
  [COMPLETED_NO]: `Non complété`
}

const OFFER_VISIBILITY_PRIVATE = `OFFER_PRIVATE`
const OFFER_VISIBILITY_PUBLIC = `OFFER_PUBLIC`

const OFFER_VISIBILITY = {
  [OFFER_VISIBILITY_PRIVATE]: `privée`,
  [OFFER_VISIBILITY_PUBLIC]: `publique`
}

const MISSION_VISIBILITY_PRIVATE = `OFFER_PRIVATE`
const MISSION_VISIBILITY_PUBLIC = `OFFER_PUBLIC`

const MISSION_VISIBILITY = {
  [MISSION_VISIBILITY_PRIVATE]: `privée`,
  [MISSION_VISIBILITY_PUBLIC]: `publique`
}

const BENCHMARK_FIELDS_10 = [ 'admin', 'antivirus', 'cyberRef']

const BENCHMARK_FIELDS_5 = ['sensibilization', 'insurance', 'externalized', 'financial']

const ENOUGH_SCORES_YES = `ENOUGH_SCORES_YES`
const ENOUGH_SCORES_NO = `ENOUGH_SCORES_NO`

const ENOUGH_SCORES = {
  [ENOUGH_SCORES_YES]: `Nombre de diags suffisant`,
  [ENOUGH_SCORES_NO]: `Nombre de diags insuffisant`
}

const NUTRISCORE_APLUS = `A+`
const NUTRISCORE_AMINUS = `A-`
const NUTRISCORE_A = `A`
const NUTRISCORE_B = `B`
const NUTRISCORE_C = `C`
const NUTRISCORE_D = `D`
const NUTRISCORE_E = `E`
const NUTRISCORE_F = `F`
const NUTRISCORE_M = `M`
const NUTRISCORE_T = `T`

const NUTRISCORE = {
  [NUTRISCORE_APLUS]: `A+`,
  [NUTRISCORE_AMINUS]: `A-`,
  [NUTRISCORE_A]: `A`,
  [NUTRISCORE_B]: `B`,
  [NUTRISCORE_C]: `C`,
  [NUTRISCORE_D]: `D`,
  [NUTRISCORE_E]: `E`,
  [NUTRISCORE_F]: `F`,
  [NUTRISCORE_M]: `M`,
  [NUTRISCORE_T]: `T`
}

const SCAN_STATUS_DNS = `DNS`
const SCAN_STATUS_ERROR = `ERROR`
const SCAN_STATUS_IN_PROGRESS = `IN_PROGRESS`
const SCAN_STATUS_READY = `READY`

const SCAN_STATUSES = {
  [SCAN_STATUS_DNS]: `DNS`,
  [SCAN_STATUS_ERROR]: `Erreur`,
  [SCAN_STATUS_IN_PROGRESS]: `En cours`,
  [SCAN_STATUS_READY]: `Disponible`
}


//For notification plugin
const NOTIFICATION_TYPE_FEED_COMMENT = 'NOTIFICATION_TYPE_FEED_COMMENT'
const NOTIFICATION_TYPE_FEED_LIKE = 'NOTIFICATION_TYPE_FEED_LIKE'
const NOTIFICATION_TYPE_GROUP_COMMENT = 'NOTIFICATION_TYPE_GROUP_COMMENT'
const NOTIFICATION_TYPE_GROUP_LIKE = 'NOTIFICATION_TYPE_GROUP_LIKE'
const NOTIFICATION_TYPE_MESSAGE = 'NOTIFICATION_TYPE_MESSAGE'
const NOTIFICATION_TYPE_PRIVATE_LEAGUE_ACCEPTED = `NOTIFICATION_TYPE_PRIVATE_LEAGUE_ACCEPTED`
const NOTIFICATION_TYPE_NEW_SCAN = `NOTIFICATION_TYPE_NEW_SCAN`
const NOTIFICATION_TYPE_NEW_DIAG = `NOTIFICATION_TYPE_NEW_DIAG`
const NOTIFICATION_TYPE_NEW_SENSIBILIZATION = `NOTIFICATION_TYPE_NEW_SENSIBILIZATION`
const NOTIFICATION_TYPE_NEW_FORMATION = `NOTIFICATION_TYPE_NEW_FORMATION`
const NOTIFICATION_TYPE_NEW_MISSION = `NOTIFICATION_TYPE_NEW_MISSION`
const NOTIFICATION_TYPE_JOB_ANSWER = `NOTIFICATION_TYPE_JOB_ANSWER`
const NOTIFICATION_TYPE_CUSTOMER_SIGNIN = `NOTIFICATION_TYPE_CUSTOMER_SIGNIN`
const NOTIFICATION_TYPE_PRIVATE_LEAGUE_REQUEST = `NOTIFICATION_TYPE_PRIVATE_LEAGUE_REQUEST`
const NOTIFICATION_TYPE_EVENT_PARTICIPATION = `NOTIFICATION_TYPE_EVENT_PARTICIPATION`

//key : notif type, value : targetId refPath (model of notif target)
const NOTIFICATION_TYPES = {
  [NOTIFICATION_TYPE_FEED_COMMENT]: 'post',
  [NOTIFICATION_TYPE_FEED_LIKE]: 'post',
  [NOTIFICATION_TYPE_GROUP_COMMENT]: 'post',
  [NOTIFICATION_TYPE_GROUP_LIKE]: 'post',
  [NOTIFICATION_TYPE_MESSAGE]: 'user',
  [NOTIFICATION_TYPE_PRIVATE_LEAGUE_ACCEPTED]: 'group',
  [NOTIFICATION_TYPE_NEW_SCAN]: 'scan',
  [NOTIFICATION_TYPE_NEW_DIAG]: 'score',
  [NOTIFICATION_TYPE_NEW_SENSIBILIZATION]: '', //not yet implemented
  [NOTIFICATION_TYPE_NEW_FORMATION]: '', //not yet implemented
  [NOTIFICATION_TYPE_NEW_MISSION] : 'mission',
  [NOTIFICATION_TYPE_JOB_ANSWER]: 'carreer',
  [NOTIFICATION_TYPE_CUSTOMER_SIGNIN]: '', //not yet implemented
  [NOTIFICATION_TYPE_PRIVATE_LEAGUE_REQUEST]: 'user',
  [NOTIFICATION_TYPE_EVENT_PARTICIPATION]: 'event',
}

const EVENT_STATUS_PAST = `EVENT_STATUS_PAST`
const EVENT_STATUS_FUTUR = `EVENT_STATUS_FUTUR`

const EVENT_STATUSES = {
  [EVENT_STATUS_PAST]: `Evénement passé`,
  [EVENT_STATUS_FUTUR]: `Evénement futur`
}

const DOCUMENT_TYPE_PUBLIC = `DOCUMENT_TYPE_PUBLIC`
const DOCUMENT_TYPE_PRIVATE = `DOCUMENT_TYPE_PRIVATE`

const DOCUMENT_TYPES = {
  [DOCUMENT_TYPE_PRIVATE]: `Document privé`,
  [DOCUMENT_TYPE_PUBLIC]: `Document public`
}

const CURRENT_CAMPAIGN_STATUS_PAST = `CURRENT_CAMPAIGN_STATUS_PAST`
const CURRENT_CAMPAIGN_STATUS_FUTUR = `CURRENT_CAMPAIGN_STATUS_FUTUR`
const CURRENT_CAMPAIGN_STATUS_ONGOING = `CURRENT_CAMPAIGN_STATUS_ONGOING`

const CURRENT_CAMPAIGN_STATUSES = {
  [CURRENT_CAMPAIGN_STATUS_PAST]: `Diffusion passée`,
  [CURRENT_CAMPAIGN_STATUS_ONGOING]: `Diffusion en cours`,
  [CURRENT_CAMPAIGN_STATUS_FUTUR]: `Diffusion à venir`
}

const CURRENT_ADVERTISING_YES = `CURRENT_ADVERTISING_YES`
const CURRENT_ADVERTISING_NO = `CURRENT_ADVERTISING_NO`

const CURRENT_ADVERTISING = {
  [CURRENT_ADVERTISING_NO]: `Non`,
  [CURRENT_ADVERTISING_YES]: `Oui`
}

const LOOKING_FOR_OPPORTUNITIES_YES = `LOOKING_FOR_OPPORTUNITIES_YES`
const LOOKING_FOR_OPPORTUNITIES_NO = `LOOKING_FOR_OPPORTUNITIES_NO`

 const LOOKING_FOR_OPPORTUNITIES_STATUS = {
  [LOOKING_FOR_OPPORTUNITIES_YES]: `Oui`,
  [LOOKING_FOR_OPPORTUNITIES_NO]: `Non`
 }


module.exports = {
  DISC_ADMIN, DISC_MEMBER, DISC_PARTNER, DISCRIMINATOR_KEY,
  ROLES, ROLE_ADMIN, ROLE_MEMBER, ROLE_PARTNER,
  CONTENT_TYPE, CONTENT_TYPE_ARTICLE, CONTENT_TYPE_GUIDE, CONTENT_TYPE_PODCAST, CONTENT_TYPE_VIDEO,
  SECTOR, SECTOR_AERONAUTICS, SECTOR_SPORT,
  EXPERTISE_CATEGORIES, EXPERTISE_CATEGORY_THREAT_ANALYSIS, EXPERTISE_CATEGORY_NETWORK_AND_ENDPOINT_SECURITY, 
  EXPERTISE_CATEGORY_INCIDENT_MANAGEMENT, EXPERTISE_CATEGORY_SENSITIZATION_AND_FORMATION, EXPERTISE_CATEGORY_EVENT_COMMUNITY_RESEARCH, EXPERTISE_CATEGORY_CRYPTOGRAPHY_AND_EMERGING_TECHNOLOGIES,
  EXPERTISE_CATEGORY_APP_SECURITY, EXPERTISE_CATEGORY_CONFORMITY_AND_CONTROL, EXPERTISE_CATEGORY_CLOUD_AND_VIRTUAL_ENVIRONMENT_SECURITY, EXPERTISE_CATEGORY_DATA_AND_SYSTEM_SECURITY,
  JOBS, JOB_GENERAL_MANAGER, JOB_DIGITAL_MANAGER, JOB_IT, JOB_FINANCIAL_MANAGER, JOB_GENERAL_COUNSEL, JOB_COMMERCIAL_MANAGER, JOB_MARKETING_MANAGER, JOB_STUDENT, JOB_OTHER,
  COMPANY_SIZE, COMPANY_SIZE_1001_PLUS, COMPANY_SIZE_0_10, COMPANY_SIZE_11_50, ESTIMATED_DURATION_UNITS, ESTIMATED_DURATION_UNIT_JOURS, ESTIMATED_DURATION_UNIT_SEMAINES, ESTIMATED_DURATION_UNIT_MOIS, LOOKING_FOR_MISSION, LOOKING_FOR_MISSION_YES, LOOKING_FOR_MISSION_NO, CONTENT_VISIBILITY, CONTENT_PRIVATE, CONTENT_PUBLIC, EVENT_VISIBILITY, EVENT_VISIBILITY_PRIVATE, EVENT_VISIBILITY_PUBLIC,
  ANSWERS, ANSWER_NO, ANSWER_NOT_APPLICABLE, ANSWER_YES,
  QUESTION_CATEGORIES, QUESTION_CATEGORY_SECURITY_MANAGEMENT_AND_GOVERNANCE, QUESTION_CATEGORY_SAFETY_AWARENESS_AND_TRAINING, QUESTION_CATEGORY_SECURITY_INCIDENT_MANAGEMENT, 
  QUESTION_CATEGORY_OWN_AND_THIRD_PARTY_ASSET_MANAGEMENT, QUESTION_CATEGORY_IDENTITY_AND_CLEARANCE_MANAGEMENT, QUESTION_CATEGORY_LOG_AND_SUPERVISION, QUESTION_CATEGORY_SAVE_AND_RECOVERY, 
  QUESTION_CATEGORY_DATA_PRIVACY, QUESTION_CATEGORY_PERSONAL_DATA_PROCESSING, QUESTION_CATEGORY_PHYSICAL_SECURITY, QUESTION_CATEGORY_NETWORK_SECURITY_AND_ADMINISTRATIVE_ENVIRONMENT,
  QUESTION_CATEGORY_ANTIVIRUS_PROTECTION, QUESTION_CATEGORY_ENDPOINT_SECURITY, QUESTION_CATEGORY_MONITORING_AND_UPDATE_MANAGEMENT, QUESTION_CATEGORY_BANK_TRANSACTION_SECURITY, QUESTION_CATEGORY_DEVICE_AND_FACTORY_NETWORK_SECURITY,
  SCORE_LEVELS,SCORE_LEVEL_1, SCORE_LEVEL_2, SCORE_LEVEL_3,
  COIN_SOURCES, COIN_SOURCE_WATCH, COIN_SOURCE_PARTICIPATE, COIN_SOURCE_TRAININGS, COIN_SOURCE_LIKE_COMMENT, COIN_SOURCE_BEGINNER_DIAG, COIN_SOURCE_MEDIUM_DIAG, COIN_SOURCE_EXPERT_DIAG,
  STATUTS,STATUT_PARTNER,STATUT_SPONSOR,STATUT_FOUNDER,STATUT_MEMBER,
  GROUP_VISIBILITY, GROUP_VISIBILITY_PRIVATE,GROUP_VISIBILITY_PUBLIC,
  USER_LEVELS, USER_LEVEL_CURIOUS,USER_LEVEL_EXPLORER,USER_LEVEL_AMBASSADOR,LEVEL_THRESHOLD_EXPLORER,LEVEL_THRESHOLD_AMBASSADOR,
  CONTRACT_TYPES, CONTRACT_TYPE_ALTERNATION, CONTRACT_TYPE_CDD,CONTRACT_TYPE_CDI, CONTRACT_TYPE_INTERNSHIP,
  WORK_DURATIONS,WORK_DURATION_FULLTIME,WORK_DURATION_PARTTIME, PAY, PAY_30_TO_40, PAY_FROM_40, PAY_LESS_30, PAY_TO_NEGOCIATE,
  STAT_MIN_SCORES,STATUSES, STATUS_ACTIVE, STATUS_INACTIVE, REQUIRED_COMPLETION_FIELDS, OPTIONAL_COMPLETION_FIELDS, COMPLETED, COMPLETED_YES, COMPLETED_NO,
  OFFER_VISIBILITY, OFFER_VISIBILITY_PUBLIC, OFFER_VISIBILITY_PRIVATE, MISSION_VISIBILITY, MISSION_VISIBILITY_PRIVATE, MISSION_VISIBILITY_PUBLIC,
  BENCHMARK_FIELDS_10, BENCHMARK_FIELDS_5, ENOUGH_SCORES, ENOUGH_SCORES_NO, ENOUGH_SCORES_YES,
  NUTRISCORE,NUTRISCORE_A,NUTRISCORE_AMINUS,NUTRISCORE_APLUS,NUTRISCORE_B,NUTRISCORE_C,NUTRISCORE_D,NUTRISCORE_E,NUTRISCORE_F,NUTRISCORE_M,NUTRISCORE_T,
  SCAN_STATUSES,SCAN_STATUS_IN_PROGRESS,SCAN_STATUS_READY, SCAN_STATUS_ERROR,
  NOTIFICATION_TYPES, NOTIFICATION_TYPE_FEED_COMMENT, NOTIFICATION_TYPE_FEED_LIKE, NOTIFICATION_TYPE_GROUP_COMMENT, NOTIFICATION_TYPE_GROUP_LIKE, NOTIFICATION_TYPE_MESSAGE, NOTIFICATION_TYPE_CUSTOMER_SIGNIN, NOTIFICATION_TYPE_EVENT_PARTICIPATION, NOTIFICATION_TYPE_JOB_ANSWER, NOTIFICATION_TYPE_NEW_DIAG,NOTIFICATION_TYPE_NEW_FORMATION,NOTIFICATION_TYPE_NEW_MISSION,NOTIFICATION_TYPE_NEW_SCAN,NOTIFICATION_TYPE_NEW_SENSIBILIZATION, NOTIFICATION_TYPE_PRIVATE_LEAGUE_ACCEPTED,NOTIFICATION_TYPE_PRIVATE_LEAGUE_REQUEST,
  EVENT_STATUSES, EVENT_STATUS_FUTUR, EVENT_STATUS_PAST,
  DOCUMENT_TYPES, DOCUMENT_TYPE_PRIVATE, DOCUMENT_TYPE_PUBLIC,
  CURRENT_CAMPAIGN_STATUSES,CURRENT_CAMPAIGN_STATUS_FUTUR,CURRENT_CAMPAIGN_STATUS_ONGOING,CURRENT_CAMPAIGN_STATUS_PAST,
  CURRENT_ADVERTISING,CURRENT_ADVERTISING_NO,CURRENT_ADVERTISING_YES,
  LOOKING_FOR_OPPORTUNITIES_NO, LOOKING_FOR_OPPORTUNITIES_YES, LOOKING_FOR_OPPORTUNITIES_STATUS,
}