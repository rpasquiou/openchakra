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
const COMPANY_SIZE_11_250 = `COMPANY_SIZE_11_250`
const COMPANY_SIZE_251_5000 = `COMPANY_SIZE_251_5000`
const COMPANY_SIZE_5001_PLUS = `COMPANY_SIZE_5001_PLUS`

const COMPANY_SIZE = {
  [COMPANY_SIZE_0_10]:`0-10`,
  [COMPANY_SIZE_11_250]:`11-250`,
  [COMPANY_SIZE_251_5000]:`251-5000`,
  [COMPANY_SIZE_5001_PLUS]:`5001 et plus`,
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
  [CONTENT_PRIVATE]: `prive`,
  [CONTENT_PUBLIC]: `public`
}

const EVENT_VISIBILITY_PRIVATE = `EVENT_VISIBILITY_PRIVATE`
const EVENT_VISIBILITY_PUBLIC = `EVENT_VISIBILITY_PUBLIC`

const EVENT_VISIBILITY = {
  [EVENT_VISIBILITY_PRIVATE]: `prive`,
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
const QUESTION_CATEGORY_SECURITY_MANAGEMENT_AND_HR = `QUESTION_CATEGORY_SECURITY_MANAGEMENT_AND_HR`
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
const QUESTION_CATEGORY_DEVELOPMENT_AND_APP_SECURITY = `QUESTION_CATEGORY_DEVELOPMENT_AND_APP_SECURITY`
const QUESTION_CATEGORY_BANK_TRANSACTION_SECURITY = `QUESTION_CATEGORY_BANK_TRANSACTION_SECURITY`
const QUESTION_CATEGORY_DEVICE_AND_FACTORY_NETWORK_SECURITY = `QUESTION_CATEGORY_DEVICE_AND_FACTORY_NETWORK_SECURITY`

const QUESTION_CATEGORIES = {
  [QUESTION_CATEGORY_SECURITY_MANAGEMENT_AND_GOVERNANCE] : `MANAGEMENT DE LA SECURITE ET GOUVERNANCE`,
  [QUESTION_CATEGORY_SECURITY_MANAGEMENT_AND_HR] : `MANAGEMENT DE LA SECURITE DANS LES RH`,
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
  [QUESTION_CATEGORY_DEVELOPMENT_AND_APP_SECURITY] : `SECURITE DU DEVELOPPEMENT ET DES APPLICATIONS`,
  [QUESTION_CATEGORY_BANK_TRANSACTION_SECURITY] : `SECURITE DES OPERATIONS BANCAIRES`,
  [QUESTION_CATEGORY_DEVICE_AND_FACTORY_NETWORK_SECURITY] : `SECURITE DES EQUIPEMENTS ET RESEAUX INDUSTRIELS (OT)`
}


module.exports = {
  DISC_ADMIN, DISC_MEMBER, DISC_PARTNER, DISCRIMINATOR_KEY,
  ROLES, ROLE_ADMIN, ROLE_MEMBER, ROLE_PARTNER,
  CONTENT_TYPE, CONTENT_TYPE_ARTICLE, CONTENT_TYPE_GUIDE, CONTENT_TYPE_PODCAST, CONTENT_TYPE_VIDEO,
  SECTOR,
  EXPERTISE_CATEGORIES, EXPERTISE_CATEGORY_THREAT_ANALYSIS, EXPERTISE_CATEGORY_NETWORK_AND_ENDPOINT_SECURITY, 
  EXPERTISE_CATEGORY_INCIDENT_MANAGEMENT, EXPERTISE_CATEGORY_SENSITIZATION_AND_FORMATION, EXPERTISE_CATEGORY_EVENT_COMMUNITY_RESEARCH, EXPERTISE_CATEGORY_CRYPTOGRAPHY_AND_EMERGING_TECHNOLOGIES,
  EXPERTISE_CATEGORY_APP_SECURITY, EXPERTISE_CATEGORY_CONFORMITY_AND_CONTROL, EXPERTISE_CATEGORY_CLOUD_AND_VIRTUAL_ENVIRONMENT_SECURITY, EXPERTISE_CATEGORY_DATA_AND_SYSTEM_SECURITY,
  JOBS, JOB_GENERAL_MANAGER, JOB_DIGITAL_MANAGER, JOB_IT, JOB_FINANCIAL_MANAGER, JOB_GENERAL_COUNSEL, JOB_COMMERCIAL_MANAGER, JOB_MARKETING_MANAGER, JOB_STUDENT, JOB_OTHER,
  COMPANY_SIZE, ESTIMATED_DURATION_UNITS, ESTIMATED_DURATION_UNIT_JOURS, ESTIMATED_DURATION_UNIT_SEMAINES, ESTIMATED_DURATION_UNIT_MOIS, LOOKING_FOR_MISSION, LOOKING_FOR_MISSION_YES, LOOKING_FOR_MISSION_NO, CONTENT_VISIBILITY, CONTENT_PRIVATE, CONTENT_PUBLIC, EVENT_VISIBILITY, EVENT_VISIBILITY_PRIVATE, EVENT_VISIBILITY_PUBLIC,
  ANSWERS, ANSWER_NO, ANSWER_NOT_APPLICABLE, ANSWER_YES,
  QUESTION_CATEGORIES, QUESTION_CATEGORY_SECURITY_MANAGEMENT_AND_GOVERNANCE, QUESTION_CATEGORY_SECURITY_MANAGEMENT_AND_HR, QUESTION_CATEGORY_SAFETY_AWARENESS_AND_TRAINING, QUESTION_CATEGORY_SECURITY_INCIDENT_MANAGEMENT, 
  QUESTION_CATEGORY_OWN_AND_THIRD_PARTY_ASSET_MANAGEMENT, QUESTION_CATEGORY_IDENTITY_AND_CLEARANCE_MANAGEMENT, QUESTION_CATEGORY_LOG_AND_SUPERVISION, QUESTION_CATEGORY_SAVE_AND_RECOVERY, 
  QUESTION_CATEGORY_DATA_PRIVACY, QUESTION_CATEGORY_PERSONAL_DATA_PROCESSING, QUESTION_CATEGORY_PHYSICAL_SECURITY, QUESTION_CATEGORY_NETWORK_SECURITY_AND_ADMINISTRATIVE_ENVIRONMENT,
  QUESTION_CATEGORY_ANTIVIRUS_PROTECTION, QUESTION_CATEGORY_ENDPOINT_SECURITY, QUESTION_CATEGORY_MONITORING_AND_UPDATE_MANAGEMENT, QUESTION_CATEGORY_DEVELOPMENT_AND_APP_SECURITY, QUESTION_CATEGORY_BANK_TRANSACTION_SECURITY, QUESTION_CATEGORY_DEVICE_AND_FACTORY_NETWORK_SECURITY,

}