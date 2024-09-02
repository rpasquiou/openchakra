const DISCRIMINATOR_KEY = { discriminatorKey: 'type' }
const DISC_PARTNER = 'partner'
const DISC_MEMBER = 'member'
const DISC_ADMIN = 'admin'

const ROLE_ADMIN = 'ROLE_ADMIN'
const ROLE_PARTNER = 'ROLE_PARTNER'
const ROLE_MEMBER = 'ROLE_MEMBER'
const ROLES = {
  [ROLE_PARTNER]: 'Partenaire',
  [ROLE_MEMBER]: 'Membre',
  [ROLE_ADMIN]: 'Administrateur'
}

const CONTENT_TYPE_ARTICLE = 'CONTENT_TYPE_ARTICLE'
const CONTENT_TYPE_GUIDE = 'CONTENT_TYPE_GUIDE'
const CONTENT_TYPE_PODCAST = 'CONTENT_TYPE_PODCAST'
const CONTENT_TYPE_VIDEO = 'CONTENT_TYPE_VIDEO'
const CONTENT_TYPE = {
  [CONTENT_TYPE_ARTICLE]: 'Article',
  [CONTENT_TYPE_VIDEO]: 'Vidéo',
  [CONTENT_TYPE_PODCAST]: 'Podcast',
  [CONTENT_TYPE_GUIDE]: 'Guide'
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

const EXPERTISE_CATEGORY_THREAT_ANALYSIS = 'EXPERTISE_CATEGORY_THREAT_ANALYSIS'
const EXPERTISE_CATEGORY_NETWORK_SECURITY = 'EXPERTISE_CATEGORY_NETWORK_SECURITY'
const EXPERTISE_CATEGORY_CRYPTOGRAPHY = 'EXPERTISE_CATEGORY_CRYPTOGRAPHY'
const EXPERTISE_CATEGORY_APP_SECURITY = 'EXPERTISE_CATEGORY_APP_SECURITY'
const EXPERTISE_CATEGORY_FORENSIC = 'EXPERTISE_CATEGORY_FORENSIC'
const EXPERTISE_CATEGORY_ACCESS_AND_IDENTITY_MANAGEMENT = 'EXPERTISE_CATEGORY_ACCESS_AND_IDENTITY_MANAGEMENT'
const EXPERTISE_CATEGORY_CONFORMITY_AND_CONTROL = 'EXPERTISE_CATEGORY_CONFORMITY_AND_CONTROL'
const EXPERTISE_CATEGORY_CLOUD_SECURITY = 'EXPERTISE_CATEGORY_CLOUD_SECURITY'
const EXPERTISE_CATEGORY_SYSTEM_SECURITY = 'EXPERTISE_CATEGORY_SYSTEM_SECURITY'
const EXPERTISE_CATEGORY_SENSITIZATION_AND_FORMATION = 'EXPERTISE_CATEGORY_SENSITIZATION_AND_FORMATION'
const EXPERTISE_CATEGORY_EMERGING_SAFETY_TECHNOLOGIES = 'EXPERTISE_CATEGORY_EMERGING_SAFETY_TECHNOLOGIES'
const EXPERTISE_CATEGORY_INCIDENT_MANAGEMENT = 'EXPERTISE_CATEGORY_INCIDENT_MANAGEMENT'
const EXPERTISE_CATEGORY_SECURITY_POLICY_DESIGN = 'EXPERTISE_CATEGORY_SECURITY_POLICY_DESIGN'
const EXPERTISE_CATEGORY_ICS_SCADA = 'EXPERTISE_CATEGORY_ICS_SCADA'
const EXPERTISE_CATEGORY_EVENT_AND_COMMUNITY = 'EXPERTISE_CATEGORY_EVENT_AND_COMMUNITY'
const EXPERTISE_CATEGORY_ACCESS_AND_IDENTITY_MANAGEMENT_ADVANCED = 'EXPERTISE_CATEGORY_ACCESS_AND_IDENTITY_MANAGEMENT_ADVANCED'
const EXPERTISE_CATEGORY_ENDPOINTS_SECURITY = 'EXPERTISE_CATEGORY_ENDPOINTS_SECURITY'
const EXPERTISE_CATEGORY_DATA_SECURITY = 'EXPERTISE_CATEGORY_DATA_SECURITY'
const EXPERTISE_CATEGORY_NETWORK_SECURITY_ADVANCED = 'EXPERTISE_CATEGORY_NETWORK_SECURITY_ADVANCED'
const EXPERTISE_CATEGORY_SYSTEM_ARCHITECTURE_SECURITY = 'EXPERTISE_CATEGORY_SYSTEM_ARCHITECTURE_SECURITY'
const EXPERTISE_CATEGORY_INTERNAL_THREAT_PROTECTION ='EXPERTISE_CATEGORY_INTERNAL_THREAT_PROTECTION'
const EXPERTISE_CATEGORY_CRISIS_MANAGEMENT = 'EXPERTISE_CATEGORY_CRISIS_MANAGEMENT'
const EXPERTISE_CATEGORY_APP_AND_DEVOPS_SECURITY = 'EXPERTISE_CATEGORY_APP_AND_DEVOPS_SECURITY'
const EXPERTISE_CATEGORY_CLOUD_AND_VIRTUAL_ENVIRONMENT_SECURITY = 'EXPERTISE_CATEGORY_CLOUD_AND_VIRTUAL_ENVIRONMENT_SECURITY'
const EXPERTISE_CATEGORY_COMPLIANCE_MANAGEMENT = 'EXPERTISE_CATEGORY_COMPLIANCE_MANAGEMENT'
const EXPERTISE_CATEGORY_ATD_ATR = 'EXPERTISE_CATEGORY_ATD_ATR'
const EXPERTISE_CATEGORY_SOCIAL_NETWORK_AND_REPUTATION_SECURITY = 'EXPERTISE_CATEGORY_SOCIAL_NETWORK_AND_REPUTATION_SECURITY'
const EXPERTISE_CATEGORY_FINANCIAL_SECURITY = 'EXPERTISE_CATEGORY_FINANCIAL_SECURITY'
const EXPERTISE_CATEGORY_R_AND_D_SECURITY = 'EXPERTISE_CATEGORY_R_AND_D_SECURITY'
const EXPERTISE_CATEGORIES = {
  [EXPERTISE_CATEGORY_THREAT_ANALYSIS] : 'Analyse des Menaces et Intelligence',
  [EXPERTISE_CATEGORY_NETWORK_SECURITY] : 'Sécurité des Réseaux',
  [EXPERTISE_CATEGORY_CRYPTOGRAPHY] : 'Cryptographie',
  [EXPERTISE_CATEGORY_APP_SECURITY] : 'Sécurité des Applications',
  [EXPERTISE_CATEGORY_FORENSIC] :'Forensique Numérique',
  [EXPERTISE_CATEGORY_ACCESS_AND_IDENTITY_MANAGEMENT] : 'Gestion des Identités et des Accès',
  [EXPERTISE_CATEGORY_CONFORMITY_AND_CONTROL] : 'Conformité et Réglementation',
  [EXPERTISE_CATEGORY_CLOUD_SECURITY] : 'Sécurité Cloud',
  [EXPERTISE_CATEGORY_SYSTEM_SECURITY] : 'Sécurité des Systèmes',
  [EXPERTISE_CATEGORY_SENSITIZATION_AND_FORMATION] : 'Formation et Sensibilisation',
  [EXPERTISE_CATEGORY_EMERGING_SAFETY_TECHNOLOGIES] : 'Technologies de Sécurité Émergentes',
  [EXPERTISE_CATEGORY_INCIDENT_MANAGEMENT] : 'Gestion des Incidents',
  [EXPERTISE_CATEGORY_SECURITY_POLICY_DESIGN] : 'Conception de Politiques de Sécurité',
  [EXPERTISE_CATEGORY_ICS_SCADA] : 'Sécurité des Infrastructures Industrielles (ICS/SCADA)',
  [EXPERTISE_CATEGORY_EVENT_AND_COMMUNITY] : 'Participation à des Communautés et Événements',
  [EXPERTISE_CATEGORY_ACCESS_AND_IDENTITY_MANAGEMENT_ADVANCED] : 'Gestion des Identités et des Accès Avancés',
  [EXPERTISE_CATEGORY_ENDPOINTS_SECURITY] : 'Sécurité des Endpoints',
  [EXPERTISE_CATEGORY_DATA_SECURITY] : 'Sécurité des Données',
  [EXPERTISE_CATEGORY_NETWORK_SECURITY_ADVANCED] : 'Sécurité des Réseaux Avancée',
  [EXPERTISE_CATEGORY_SYSTEM_ARCHITECTURE_SECURITY] : 'Sécurité de l’Architecture des Systèmes',
  [EXPERTISE_CATEGORY_INTERNAL_THREAT_PROTECTION] :'Protection contre les Menaces Internes',
  [EXPERTISE_CATEGORY_CRISIS_MANAGEMENT] : 'Réponse aux Incidents et Gestion de Crise',
  [EXPERTISE_CATEGORY_APP_AND_DEVOPS_SECURITY] : 'Sécurité des Applications et des DevOps',
  [EXPERTISE_CATEGORY_CLOUD_AND_VIRTUAL_ENVIRONMENT_SECURITY] : 'Sécurité des Environnements Virtuels et Cloud',
  [EXPERTISE_CATEGORY_COMPLIANCE_MANAGEMENT] : 'Gestion de la Conformité et de la Gouvernance',
  [EXPERTISE_CATEGORY_ATD_ATR] : 'Détection et Réponse aux Menaces Avancées (ATD/ATR)',
  [EXPERTISE_CATEGORY_SOCIAL_NETWORK_AND_REPUTATION_SECURITY] : 'Sécurité des Réseaux Sociaux et de la Réputation',
  [EXPERTISE_CATEGORY_FINANCIAL_SECURITY] : 'Sécurité des Transactions Financières',
  [EXPERTISE_CATEGORY_R_AND_D_SECURITY] : 'Recherche et Développement en Sécurité',
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
  [COMPANY_SIZE_0_10]:'0-10',
  [COMPANY_SIZE_11_250]:'11-250',
  [COMPANY_SIZE_251_5000]:'251-5000',
  [COMPANY_SIZE_5001_PLUS]:'5001 et plus',
}

const ESTIMATED_DURATION_UNIT_JOURS=`ESTIMATED_DURATION_UNIT_JOURS`
const ESTIMATED_DURATION_UNIT_SEMAINES=`ESTIMATED_DURATION_UNIT_SEMAINES`
const ESTIMATED_DURATION_UNIT_MOIS=`ESTIMATED_DURATION_UNIT_MOIS`

const ESTIMATED_DURATION_UNITS={
  [ESTIMATED_DURATION_UNIT_JOURS]:`jours`,
  [ESTIMATED_DURATION_UNIT_SEMAINES]:`semaines`,
  [ESTIMATED_DURATION_UNIT_MOIS]:`mois`,
}

const LOOKING_FOR_MISSION_YES = 'LOOKING_FOR_MISSION_YES'
const LOOKING_FOR_MISSION_NO = 'LOOKING_FOR_MISSION_NO'

const LOOKING_FOR_MISSION = {
  [LOOKING_FOR_MISSION_YES]: 'oui',
  [LOOKING_FOR_MISSION_NO]: 'non'
}

const CONTENT_PRIVATE = 'CONTENT_PRIVATE'
const CONTENT_PUBLIC = 'CONTENT_PUBLIC'

const CONTENT_VISIBILITY = {
  [CONTENT_PRIVATE]: 'prive',
  [CONTENT_PUBLIC]: 'public'
}

const EVENT_VISIBILITY_PRIVATE = 'EVENT_VISIBILITY_PRIVATE'
const EVENT_VISIBILITY_PUBLIC = 'EVENT_VISIBILITY_PUBLIC'

const EVENT_VISIBILITY = {
  [EVENT_VISIBILITY_PRIVATE]: 'prive',
  [EVENT_VISIBILITY_PUBLIC]: 'public'
}

const ANSWER_YES = 'ANSWER_YES'
const ANSWER_NO = 'ANSWER_NO'
const ANSWER_NOT_APPLICABLE = 'ANSWER_NOT_APPLICABLE'

const ANSWERS = {
  [ANSWER_YES] : 'oui',
  [ANSWER_NO]  : 'non',
  [ANSWER_NOT_APPLICABLE] : 'N\\A'
}



module.exports = {
  DISC_ADMIN, DISC_MEMBER, DISC_PARTNER, DISCRIMINATOR_KEY,
  ROLES, ROLE_ADMIN, ROLE_MEMBER, ROLE_PARTNER,
  CONTENT_TYPE, CONTENT_TYPE_ARTICLE, CONTENT_TYPE_GUIDE, CONTENT_TYPE_PODCAST, CONTENT_TYPE_VIDEO,
  SECTOR,
  EXPERTISE_CATEGORIES, EXPERTISE_CATEGORY_THREAT_ANALYSIS, EXPERTISE_CATEGORY_NETWORK_SECURITY, EXPERTISE_CATEGORY_CRYPTOGRAPHY, EXPERTISE_CATEGORY_APP_SECURITY, EXPERTISE_CATEGORY_FORENSIC, EXPERTISE_CATEGORY_ACCESS_AND_IDENTITY_MANAGEMENT, EXPERTISE_CATEGORY_CONFORMITY_AND_CONTROL, EXPERTISE_CATEGORY_CLOUD_SECURITY, EXPERTISE_CATEGORY_SYSTEM_SECURITY, EXPERTISE_CATEGORY_SENSITIZATION_AND_FORMATION, EXPERTISE_CATEGORY_EMERGING_SAFETY_TECHNOLOGIES, EXPERTISE_CATEGORY_INCIDENT_MANAGEMENT, EXPERTISE_CATEGORY_SECURITY_POLICY_DESIGN, EXPERTISE_CATEGORY_ICS_SCADA, EXPERTISE_CATEGORY_EVENT_AND_COMMUNITY, EXPERTISE_CATEGORY_ACCESS_AND_IDENTITY_MANAGEMENT_ADVANCED, EXPERTISE_CATEGORY_ENDPOINTS_SECURITY, EXPERTISE_CATEGORY_DATA_SECURITY, EXPERTISE_CATEGORY_NETWORK_SECURITY_ADVANCED, EXPERTISE_CATEGORY_SYSTEM_ARCHITECTURE_SECURITY, EXPERTISE_CATEGORY_INTERNAL_THREAT_PROTECTION, EXPERTISE_CATEGORY_CRISIS_MANAGEMENT, EXPERTISE_CATEGORY_APP_AND_DEVOPS_SECURITY, EXPERTISE_CATEGORY_CLOUD_AND_VIRTUAL_ENVIRONMENT_SECURITY, EXPERTISE_CATEGORY_COMPLIANCE_MANAGEMENT, EXPERTISE_CATEGORY_ATD_ATR, EXPERTISE_CATEGORY_SOCIAL_NETWORK_AND_REPUTATION_SECURITY, EXPERTISE_CATEGORY_FINANCIAL_SECURITY, EXPERTISE_CATEGORY_R_AND_D_SECURITY,
  JOBS, JOB_GENERAL_MANAGER, JOB_DIGITAL_MANAGER, JOB_IT, JOB_FINANCIAL_MANAGER, JOB_GENERAL_COUNSEL, JOB_COMMERCIAL_MANAGER, JOB_MARKETING_MANAGER, JOB_STUDENT, JOB_OTHER,
  COMPANY_SIZE, ESTIMATED_DURATION_UNITS, ESTIMATED_DURATION_UNIT_JOURS, ESTIMATED_DURATION_UNIT_SEMAINES, ESTIMATED_DURATION_UNIT_MOIS, LOOKING_FOR_MISSION, LOOKING_FOR_MISSION_YES, LOOKING_FOR_MISSION_NO, CONTENT_VISIBILITY, CONTENT_PRIVATE, CONTENT_PUBLIC, EVENT_VISIBILITY, EVENT_VISIBILITY_PRIVATE, EVENT_VISIBILITY_PUBLIC,
  ANSWERS, ANSWER_NO, ANSWER_NOT_APPLICABLE, ANSWER_YES,

}