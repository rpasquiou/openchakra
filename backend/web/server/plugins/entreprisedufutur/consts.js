const DISCRIMINATOR_KEY = { discriminatorKey: 'type' }
const DISC_EXPERT = 'expert'
const DISC_MEMBER = 'member'
const DISC_ADMIN = 'admin'
const DISC_SUPERADMIN = 'superadmin'
const DISC_LEADER = 'leader'
const DISC_EXTERNAL_ADMIN = 'externaladmin'

const ROLE_ADMIN = `ROLE_ADMIN`
const ROLE_SUPERADMIN = `ROLE_SUPERADMIN`
const ROLE_EXTERNAL_ADMIN = `ROLE_EXTERNAL_ADMIN`
const ROLE_EXPERT = `ROLE_EXPERT`
const ROLE_LEADER = `ROLE_LEADER`
const ROLE_MEMBER = `ROLE_MEMBER`
const ROLES = {
  [ROLE_EXPERT]: `Expert en Action`,
  [ROLE_MEMBER]: `Membre`,
  [ROLE_ADMIN]: `Administrateur`,
  [ROLE_EXTERNAL_ADMIN]: `Administrateur externe`,
  [ROLE_SUPERADMIN]: `Super administrateur`,
  [ROLE_LEADER]: `Leader en Action`
}

const BOOLEAN_ENUM_YES = `BOOLEAN_ENUM_YES`
const BOOLEAN_ENUM_NO = `BOOLEAN_ENUM_NO`

const BOOLEAN_ENUM = {
  [BOOLEAN_ENUM_NO]: `Non`,
  [BOOLEAN_ENUM_YES]: `Oui`
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

const SECTOR_BANK_FINANCE = `SECTOR_BANK_FINANCE`
const SECTOR_CONSTRUCTION = `SECTOR_CONSTRUCTION`
const SECTOR_CONSULTING = `SECTOR_CONSULTING`
const SECTOR_INDUSTRY = `SECTOR_INDUSTRY`
const SECTOR_INSTITUTIONAL = `SECTOR_INSTITUTIONAL`
const SECTOR_MEDIA = `SECTOR_MEDIA`
const SECTOR_DIGITAL = `SECTOR_DIGITAL`
const SECTOR_RETAIL_DISTRIBUTION = `SECTOR_RETAIL_DISTRIBUTION`
const SECTOR_HEALTHCARE = `SECTOR_HEALTHCARE`
const SECTOR_SERVICES = `SECTOR_SERVICES`
const SECTOR_TRANSPORT_LOGISTICS = `SECTOR_TRANSPORT_LOGISTICS`
const SECTOR_OTHER = `SECTOR_OTHER`

const SECTOR = {
  [SECTOR_BANK_FINANCE] : `Banque / Finance`,
  [SECTOR_CONSTRUCTION] : `BTP`,
  [SECTOR_CONSULTING] : `Conseil`,
  [SECTOR_INDUSTRY] : `Industrie`,
  [SECTOR_INSTITUTIONAL] : `Institutionnel`,
  [SECTOR_MEDIA] : `Média`,
  [SECTOR_DIGITAL] : `Numérique`,
  [SECTOR_RETAIL_DISTRIBUTION] : `Retail / Distribution`,
  [SECTOR_HEALTHCARE] : `Santé`,
  [SECTOR_SERVICES] : `Service`,
  [SECTOR_TRANSPORT_LOGISTICS] : `Transport / Logistique`,
  [SECTOR_OTHER] : `Autre`
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

const JOB_EXECUTIVE_ASSISTANT = `JOB_EXECUTIVE_ASSISTANT`
const JOB_ASSOCIATE = `JOB_ASSOCIATE`
const JOB_ACADEMIC_DIRECTOR = `JOB_ACADEMIC_DIRECTOR`
const JOB_PURCHASING_DIRECTOR = `JOB_PURCHASING_DIRECTOR`
const JOB_ADMINISTRATIVE_AND_FINANCIAL_DIRECTOR = `JOB_ADMINISTRATIVE_AND_FINANCIAL_DIRECTOR`
const JOB_ENGINEERING_OFFICE_DIRECTOR = `JOB_ENGINEERING_OFFICE_DIRECTOR`
const JOB_BUSINESS_DEVELOPMENT_DIRECTOR = `JOB_BUSINESS_DEVELOPMENT_DIRECTOR`
const JOB_SALES_DIRECTOR = `JOB_SALES_DIRECTOR`
const JOB_COMMUNICATION_DIRECTOR = `JOB_COMMUNICATION_DIRECTOR`
const JOB_CONSULTING_DIRECTOR = `JOB_CONSULTING_DIRECTOR`
const JOB_HUMAN_RESOURCES_DIRECTOR = `JOB_HUMAN_RESOURCES_DIRECTOR`
const JOB_INFORMATION_SYSTEMS_DIRECTOR = `JOB_INFORMATION_SYSTEMS_DIRECTOR`
const JOB_GENERAL_MANAGER = `JOB_GENERAL_MANAGER`
const JOB_DEPUTY_GENERAL_MANAGER = `JOB_DEPUTY_GENERAL_MANAGER`
const JOB_REGIONAL_GENERAL_MANAGER = `JOB_REGIONAL_GENERAL_MANAGER`
const JOB_INDUSTRIAL_GENERAL_MANAGER = `JOB_INDUSTRIAL_GENERAL_MANAGER`
const JOB_INNOVATION_DIRECTOR = `JOB_INNOVATION_DIRECTOR`
const JOB_LEGAL_DIRECTOR = `JOB_LEGAL_DIRECTOR`
const JOB_MAINTENANCE_DIRECTOR = `JOB_MAINTENANCE_DIRECTOR`
const JOB_MARKETING_DIRECTOR = `JOB_MARKETING_DIRECTOR`
const JOB_METHODS_DIRECTOR = `JOB_METHODS_DIRECTOR`
const JOB_OPERATIONS_DIRECTOR = `JOB_OPERATIONS_DIRECTOR`
const JOB_PARTNERSHIPS_DIRECTOR = `JOB_PARTNERSHIPS_DIRECTOR`
const JOB_PRODUCTION_DIRECTOR = `JOB_PRODUCTION_DIRECTOR`
const JOB_PRODUCT_DIRECTOR = `JOB_PRODUCT_DIRECTOR`
const JOB_R_AND_D_DIRECTOR = `JOB_R_AND_D_DIRECTOR`
const JOB_CSR_QSE_DIRECTOR = `JOB_CSR_QSE_DIRECTOR`
const JOB_TECHNICAL_DIRECTOR = `JOB_TECHNICAL_DIRECTOR`
const JOB_DIGITAL_TRANSFORMATION_DIRECTOR = `JOB_DIGITAL_TRANSFORMATION_DIRECTOR`
const JOB_CHARTERED_ACCOUNTANT = `JOB_CHARTERED_ACCOUNTANT`
const JOB_OPERATIONAL_FUNCTION = `JOB_OPERATIONAL_FUNCTION`
const JOB_FOUNDER = `JOB_FOUNDER`
const JOB_INDEPENDENT = `JOB_INDEPENDENT`
const JOB_INSTITUTIONAL_REPRESENTATIVE = `JOB_INSTITUTIONAL_REPRESENTATIVE`
const JOB_INVESTOR = `JOB_INVESTOR`
const JOB_JOURNALIST = `JOB_JOURNALIST`
const JOB_EXECUTIVE_COMMITTEE_MEMBER = `JOB_EXECUTIVE_COMMITTEE_MEMBER`
const JOB_PRESIDENT = `JOB_PRESIDENT`
const JOB_CHAIRMAN_AND_CEO = `JOB_CHAIRMAN_AND_CEO`
const JOB_HUMAN_RESOURCES_MANAGER = `JOB_HUMAN_RESOURCES_MANAGER`
const JOB_GENERAL_SECRETARY = `JOB_GENERAL_SECRETARY`
const JOB_VICE_PRESIDENT = `JOB_VICE_PRESIDENT`



const JOBS = {
  [JOB_EXECUTIVE_ASSISTANT]: `Assistant(e) de Direction`,
  [JOB_ASSOCIATE]: `Associé(e)`,
  [JOB_ACADEMIC_DIRECTOR]: `Directeur(trice) Académique`,
  [JOB_PURCHASING_DIRECTOR]: `Directeur(trice) Achat`,
  [JOB_ADMINISTRATIVE_AND_FINANCIAL_DIRECTOR]: `Directeur(trice) Administratif et Financier`,
  [JOB_ENGINEERING_OFFICE_DIRECTOR]: `Directeur(trice) Bureau d'Etude`,
  [JOB_BUSINESS_DEVELOPMENT_DIRECTOR]: `Directeur(trice) Business Développement`,
  [JOB_SALES_DIRECTOR]: `Directeur(trice) Commercial(e)`,
  [JOB_COMMUNICATION_DIRECTOR]: `Directeur(trice) Communication`,
  [JOB_CONSULTING_DIRECTOR]: `Directeur(trice) Conseils`,
  [JOB_HUMAN_RESOURCES_DIRECTOR]: `Directeur(trice) des Ressources Humaines`,
  [JOB_INFORMATION_SYSTEMS_DIRECTOR]: `Directeur(trice) des Systèmes d'Informations`,
  [JOB_GENERAL_MANAGER]: `Directeur(trice) Général(e)`,
  [JOB_DEPUTY_GENERAL_MANAGER]: `Directeur(trice) Général(e) Adjoint(e)`,
  [JOB_REGIONAL_GENERAL_MANAGER]: `Directeur(trice) Général(e) Région`,
  [JOB_INDUSTRIAL_GENERAL_MANAGER]: `Directeur(trice) Industriel`,
  [JOB_INNOVATION_DIRECTOR]: `Directeur(trice) Innovation`,
  [JOB_LEGAL_DIRECTOR]: `Directeur(trice) Juridique`,
  [JOB_MAINTENANCE_DIRECTOR]: `Directeur(trice) Maintenance`,
  [JOB_MARKETING_DIRECTOR]: `Directeur(trice) Marketing`,
  [JOB_METHODS_DIRECTOR]: `Directeur(trice) Méthodes`,
  [JOB_OPERATIONS_DIRECTOR]: `Directeur(trice) Opérations`,
  [JOB_PARTNERSHIPS_DIRECTOR]: `Directeur(trice) Partenariats`,
  [JOB_PRODUCTION_DIRECTOR]: `Directeur(trice) Production`,
  [JOB_PRODUCT_DIRECTOR]: `Directeur(trice) Produits`,
  [JOB_R_AND_D_DIRECTOR]: `Directeur(trice) R&D`,
  [JOB_CSR_QSE_DIRECTOR]: `Directeur(trice) RSE/QSE`,
  [JOB_TECHNICAL_DIRECTOR]: `Directeur(trice) Technique`,
  [JOB_DIGITAL_TRANSFORMATION_DIRECTOR]: `Directeur(trice) Transformation Digitale`,
  [JOB_CHARTERED_ACCOUNTANT]: `Expert(e) Comptable`,
  [JOB_OPERATIONAL_FUNCTION]: `Fonction Opérationnelle`,
  [JOB_FOUNDER]: `Fondateur(trice)`,
  [JOB_INDEPENDENT]: `Indépendant(e)`,
  [JOB_INSTITUTIONAL_REPRESENTATIVE]: `Institutionnel(le)`,
  [JOB_INVESTOR]: `Investisseur`,
  [JOB_JOURNALIST]: `Journaliste`,
  [JOB_EXECUTIVE_COMMITTEE_MEMBER]: `Membre du COMEX`,
  [JOB_PRESIDENT]: `Président(e)`,
  [JOB_CHAIRMAN_AND_CEO]: `Président(e) Directeur(trice) Général(e)`,
  [JOB_HUMAN_RESOURCES_MANAGER]: `Responsable Ressources Humaines`,
  [JOB_GENERAL_SECRETARY]: `Secrétaire Général(e)`,
  [JOB_VICE_PRESIDENT]: `Vice-Président(e)`
}

const COMPANY_SIZE_1_9 = `COMPANY_SIZE_1_9`
const COMPANY_SIZE_10_49 = `COMPANY_SIZE_10_49`
const COMPANY_SIZE_50_99 = `COMPANY_SIZE_50_99`
const COMPANY_SIZE_100_249 = `COMPANY_SIZE_100_249`
const COMPANY_SIZE_250_499 = `COMPANY_SIZE_250_499`
const COMPANY_SIZE_500_999 = `COMPANY_SIZE_500_999`
const COMPANY_SIZE_1000_1999 = `COMPANY_SIZE_1000_1999`
const COMPANY_SIZE_2000_5000 = `COMPANY_SIZE_2000_5000`
const COMPANY_SIZE_5000_PLUS = `COMPANY_SIZE_5000_PLUS`

const COMPANY_SIZES = {
  [COMPANY_SIZE_1_9]:`1-9`,
  [COMPANY_SIZE_10_49]:`10-49`,
  [COMPANY_SIZE_50_99]: `50-99`,
  [COMPANY_SIZE_100_249]: `100-249`,
  [COMPANY_SIZE_250_499]: `250-499`,
  [COMPANY_SIZE_500_999]: `500-999`,
  [COMPANY_SIZE_1000_1999]: `1000-1999`,
  [COMPANY_SIZE_2000_5000]: `2000-5000`,
  [COMPANY_SIZE_5000_PLUS]: `5000 et plus`,
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
const EVENT_VISIBILITY_DRAFT = `EVENT_VISIBILITY_DRAFT`

const EVENT_VISIBILITY = {
  [EVENT_VISIBILITY_PRIVATE]: `privé`,
  [EVENT_VISIBILITY_PUBLIC]: `public`,
  [EVENT_VISIBILITY_DRAFT]: `brouillon`
}

const EVENT_AVAILABILITY_AVAILABLE = `EVENT_AVAILABILITY_AVAILABLE`
const EVENT_AVAILABILITY_FULL = `EVENT_AVAILABILITY_FULL`
const EVENT_AVAILABILITY_PAUSED = `EVENT_AVAILABILITY_PAUSED`

const EVENT_AVAILABILITIES = {
  [EVENT_AVAILABILITY_AVAILABLE]: `Disponible`,
  [EVENT_AVAILABILITY_FULL]: `Complet`,
  [EVENT_AVAILABILITY_PAUSED]: `En pause`
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
  [STATUT_FOUNDER]: `Fondateur`,
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
  [USER_LEVEL_AMBASSADOR]: `Ambassadeur`
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
  phone: `Téléphone`,
  city: 'Ville',
}

const OPTIONAL_COMPLETION_FIELDS = {
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

const BIOGRAPHY_STATUS_CURRENT = `BIOGRAPHY_STATUS_CURRENT`
const BIOGRAPHY_STATUS_NOT_CURRENT = `BIOGRAPHY_STATUS_NOT_CURRENT`

const BIOGRAPHY_STATUSES = {
  [BIOGRAPHY_STATUS_CURRENT]: 'Biographie actuelle',
  [BIOGRAPHY_STATUS_NOT_CURRENT]: `Biographie ancienne`
}

const USERTICKET_STATUS_PAYED = `USERTICKET_STATUS_PAYED`
const USERTICKET_STATUS_WAITING_LIST = `USERTICKET_STATUS_WAITING_LIST`
const USERTICKET_STATUS_CANCELED = `USERTICKET_STATUS_CANCELED`
const USERTICKET_STATUS_DECLINED = `USERTICKET_STATUS_DECLINED`
const USERTICKET_STATUS_REGISTERED = `USERTICKET_STATUS_REGISTERED`
const USERTICKET_STATUS_PENDING_PAYMENT = `USERTICKET_STATUS_PENDING_PAYMENT`

const USERTICKET_STATUSES = {
  [USERTICKET_STATUS_CANCELED]: `Annulé`,
  [USERTICKET_STATUS_DECLINED]: `Refusé`,
  [USERTICKET_STATUS_PAYED]: `Payé`,
  [USERTICKET_STATUS_PENDING_PAYMENT]: `Paiement en attente`,
  [USERTICKET_STATUS_REGISTERED]: `Inscrit`,
  [USERTICKET_STATUS_WAITING_LIST]: `Liste d'attente`
}

const ACCOMODATION_TYPE_HOTEL = `ACCOMODATION_TYPE_HOTEL`
const ACCOMODATION_TYPE_PARKING = `ACCOMODATION_TYPE_PARKING`
const ACCOMODATION_TYPE_RESTAURANT = `ACCOMODATION_TYPE_RESTAURANT`

const ACCOMODATION_TYPES = {
  [ACCOMODATION_TYPE_HOTEL]: `Hôtel`,
  [ACCOMODATION_TYPE_PARKING]: `Parking`,
  [ACCOMODATION_TYPE_RESTAURANT]: `Restaurant`
}

const TIMEZONE_MINUS_11 = `TIMEZONE_MINUS_11`
const TIMEZONE_MINUS_10 = `TIMEZONE_MINUS_10`
const TIMEZONE_MINUS_9_HALF = `TIMEZONE_MINUS_9_HALF`
const TIMEZONE_MINUS_9 = `TIMEZONE_MINUS_9`
const TIMEZONE_MINUS_8 = `TIMEZONE_MINUS_8`
const TIMEZONE_MINUS_7 = `TIMEZONE_MINUS_7`
const TIMEZONE_MINUS_6 = `TIMEZONE_MINUS_6`
const TIMEZONE_MINUS_5 = `TIMEZONE_MINUS_5`
const TIMEZONE_MINUS_4 = `TIMEZONE_MINUS_4`
const TIMEZONE_MINUS_3_HALF = `TIMEZONE_MINUS_3_HALF`
const TIMEZONE_MINUS_3 = `TIMEZONE_MINUS_3`
const TIMEZONE_MINUS_2 = `TIMEZONE_MINUS_2`
const TIMEZONE_MINUS_1 = `TIMEZONE_MINUS_1`
const TIMEZONE_0 = `TIMEZONE_0`
const TIMEZONE_PLUS_1 = `TIMEZONE_PLUS_1`
const TIMEZONE_PLUS_2 = `TIMEZONE_PLUS_2`
const TIMEZONE_PLUS_3 = `TIMEZONE_PLUS_3`
const TIMEZONE_PLUS_3_HALF = `TIMEZONE_PLUS_3_HALF`
const TIMEZONE_PLUS_4 = `TIMEZONE_PLUS_4`
const TIMEZONE_PLUS_5 = `TIMEZONE_PLUS_5`
const TIMEZONE_PLUS_5_HALF = `TIMEZONE_PLUS_5_HALF`
const TIMEZONE_PLUS_5_75 = `TIMEZONE_PLUS_5_75`
const TIMEZONE_PLUS_6 = `TIMEZONE_PLUS_6`
const TIMEZONE_PLUS_6_HALF = `TIMEZONE_PLUS_6_HALF`
const TIMEZONE_PLUS_7 = `TIMEZONE_PLUS_7`
const TIMEZONE_PLUS_8 = `TIMEZONE_PLUS_8`
const TIMEZONE_PLUS_9 = `TIMEZONE_PLUS_9`
const TIMEZONE_PLUS_9_HALF = `TIMEZONE_PLUS_9_HALF`
const TIMEZONE_PLUS_10 = `TIMEZONE_PLUS_10`
const TIMEZONE_PLUS_10_HALF = `TIMEZONE_PLUS_10_HALF`
const TIMEZONE_PLUS_11 = `TIMEZONE_PLUS_11`
const TIMEZONE_PLUS_12 = `TIMEZONE_PLUS_12`
const TIMEZONE_PLUS_13 = `TIMEZONE_PLUS_13`
const TIMEZONE_PLUS_13_HALF = `TIMEZONE_PLUS_13_HALF`
const TIMEZONE_PLUS_14 = `TIMEZONE_PLUS_14`

const TIMEZONES = {
  [TIMEZONE_0]: `+00:00`,
  [TIMEZONE_MINUS_1]: `-01:00`,
  [TIMEZONE_MINUS_11]: `-11:00`,
  [TIMEZONE_MINUS_10]: `-10:00`,
  [TIMEZONE_MINUS_9_HALF]: `-09:30`,
  [TIMEZONE_MINUS_9]: `-09:00`,
  [TIMEZONE_MINUS_8]: `-08:00`,
  [TIMEZONE_MINUS_7]: `-07:00`,
  [TIMEZONE_MINUS_6]: `-06:00`,
  [TIMEZONE_MINUS_5]: `-05:00`,
  [TIMEZONE_MINUS_4]: `-04:00`,
  [TIMEZONE_MINUS_3_HALF]: `-03:30`,
  [TIMEZONE_MINUS_3]: `-03:00`,
  [TIMEZONE_MINUS_2]: `-02:00`,
  [TIMEZONE_PLUS_1]: `+01:00`,
  [TIMEZONE_PLUS_2]: `+02:00`,
  [TIMEZONE_PLUS_3]: `+03:00`,
  [TIMEZONE_PLUS_3_HALF]: `+03:30`,
  [TIMEZONE_PLUS_4]: `+04:00`,
  [TIMEZONE_PLUS_5]: `+05:00`,
  [TIMEZONE_PLUS_5_HALF]: `+05:30`,
  [TIMEZONE_PLUS_5_75]: `+05:45`,
  [TIMEZONE_PLUS_6]: `+06:00`,
  [TIMEZONE_PLUS_6_HALF]: `+06:30`,
  [TIMEZONE_PLUS_7]: `+07:00`,
  [TIMEZONE_PLUS_8]: `+08:00`,
  [TIMEZONE_PLUS_9]: `+09:00`,
  [TIMEZONE_PLUS_9_HALF]: `+09:30`,
  [TIMEZONE_PLUS_10]: `+10:00`,
  [TIMEZONE_PLUS_10_HALF]: `+10:30`,
  [TIMEZONE_PLUS_11]: `+11:00`,
  [TIMEZONE_PLUS_12]: `+12:00`,
  [TIMEZONE_PLUS_13]: `+13:00`,
  [TIMEZONE_PLUS_13_HALF]: `+13:30`,
  [TIMEZONE_PLUS_14]: `+14:00`,
}

const PARTNER_LEVEL_CONTRIBUTOR = `PARTNER_LEVEL_CONTRIBUTOR`
const PARTNER_LEVEL_SPONSOR = `PARTNER_LEVEL_SPONSOR`
const PARTNER_LEVEL_AMBASSADOR = `PARTNER_LEVEL_AMBASSADOR`

const PARTNER_LEVELS = {
  [PARTNER_LEVEL_CONTRIBUTOR]: `Contributeur`,
  [PARTNER_LEVEL_SPONSOR]: `Parrain`,
  [PARTNER_LEVEL_AMBASSADOR]: `Ambassadeur`
}

const MAX_WISHES = 20

const COMPANY_TURNOVER_0_1 = `COMPANY_TURNOVER_0_1`
const COMPANY_TURNOVER_1_5 = `COMPANY_TURNOVER_1_5`
const COMPANY_TURNOVER_5_10 = `COMPANY_TURNOVER_5_10`
const COMPANY_TURNOVER_10_30 = `COMPANY_TURNOVER_10_30`
const COMPANY_TURNOVER_30_50 = `COMPANY_TURNOVER_30_50`
const COMPANY_TURNOVER_50_100 = `COMPANY_TURNOVER_50_100`
const COMPANY_TURNOVER_100_250 = `COMPANY_TURNOVER_100_250`
const COMPANY_TURNOVER_250_500 = `COMPANY_TURNOVER_250_500`
const COMPANY_TURNOVER_500_1M = `COMPANY_TURNOVER_500_1M`
const COMPANY_TURNOVER_1M_1HALFM = `COMPANY_TURNOVER_1M_1HALFM`
const COMPANY_TURNOVER_1HALFM_PLUS = `COMPANY_TURNOVER_1HALFM_PLUS`

const COMPANY_TURNOVERS = {
  [COMPANY_TURNOVER_0_1]: `0-1M€`,
  [COMPANY_TURNOVER_1_5]: `1-5M€`,
  [COMPANY_TURNOVER_5_10]: `5-10M€`,
  [COMPANY_TURNOVER_10_30]: `10-30M€`,
  [COMPANY_TURNOVER_30_50]: `30-50M€`,
  [COMPANY_TURNOVER_50_100]: `50-100M€`,
  [COMPANY_TURNOVER_100_250]: `100-250M€`,
  [COMPANY_TURNOVER_250_500]: `250-500M€`,
  [COMPANY_TURNOVER_500_1M]: `500-1Md€`,
  [COMPANY_TURNOVER_1M_1HALFM]: `1Md-1,5Md€`,
  [COMPANY_TURNOVER_1HALFM_PLUS]: `+1,5Md€`,
}

const ORDER_STATUS_VALIDATED = `ORDER_STATUS_VALIDATED`
const ORDER_STATUS_IN_PROGRESS = `ORDER_STATUS_IN_PROGRESS`

const ORDER_STATUSES = {
  [ORDER_STATUS_IN_PROGRESS]: `En cours`,
  [ORDER_STATUS_VALIDATED]: `Validée`
}

const COMPANY_TYPE_STARTUP = `COMPANY_TYPE_STARTUP`
const COMPANY_TYPE_TPE = `COMPANY_TYPE_TPE`
const COMPANY_TYPE_PME = `COMPANY_TYPE_PME`
const COMPANY_TYPE_ETI = `COMPANY_TYPE_ETI`
const COMPANY_TYPE_GE = `COMPANY_TYPE_GE`
const COMPANY_TYPE_ASSOCIATION_FOUNDATION = `COMPANY_TYPE_ASSOCIATION_FOUNDATION`
const COMPANY_TYPE_INSTITUTIONAL = `COMPANY_TYPE_INSTITUTIONAL`
const COMPANY_TYPE_INDEPENDENT = `COMPANY_TYPE_INDEPENDENT`
const COMPANY_TYPE_OTHER = `COMPANY_TYPE_OTHER`

const COMPANY_TYPES = {
  [COMPANY_TYPE_STARTUP]: `Startup`,
  [COMPANY_TYPE_TPE]: `TPE`,
  [COMPANY_TYPE_PME]: `PME`,
  [COMPANY_TYPE_ETI]: `ETI`,
  [COMPANY_TYPE_GE]: `GE`,
  [COMPANY_TYPE_ASSOCIATION_FOUNDATION]: `Association / Fondation`,
  [COMPANY_TYPE_INDEPENDENT]: `Indépendant`,
  [COMPANY_TYPE_INSTITUTIONAL]: `Institutionnel`,
  [COMPANY_TYPE_OTHER]: `Autre`
}

const USER_GENRE_MISTER = `USER_GENRE_MISTER`
const USER_GENRE_MADAM = `USER_GENRE_MADAM`

const USER_GENRES = {
  [USER_GENRE_MISTER]: `M.`,
  [USER_GENRE_MADAM]: `Mme`
}

const COMPANY_CAPITAL_UNDER_LBO = `COMPANY_CAPITAL_UNDER_LBO`
const COMPANY_CAPITAL_LISTED = `COMPANY_CAPITAL_LISTED`
const COMPANY_CAPITAL_STATE_OWNED = `COMPANY_CAPITAL_STATE_OWNED`
const COMPANY_CAPITAL_FAMILY_OWNED = `COMPANY_CAPITAL_FAMILY_OWNED`
const COMPANY_CAPITAL_MAJORITY_FOUNDER = `COMPANY_CAPITAL_MAJORITY_FOUNDER`
const COMPANY_CAPITAL_MINORITY_FOUNDER = `COMPANY_CAPITAL_MINORITY_FOUNDER`
const COMPANY_CAPITAL_EMPLOYEE_MAJORITY_OWNED_SCOP = `COMPANY_CAPITAL_EMPLOYEE_MAJORITY_OWNED_SCOP`

const COMPANY_CAPITALS = {
  [COMPANY_CAPITAL_UNDER_LBO]: `Sous LBO`,
  [COMPANY_CAPITAL_LISTED]: `Cotée en bourse`,
  [COMPANY_CAPITAL_STATE_OWNED]: `Etatique`,
  [COMPANY_CAPITAL_FAMILY_OWNED]: `Familiale`,
  [COMPANY_CAPITAL_MAJORITY_FOUNDER]: `Fondateur(s) majoritaire(s)`,
  [COMPANY_CAPITAL_MINORITY_FOUNDER]: `Fondateur(s) minoritaire(s)`,
  [COMPANY_CAPITAL_EMPLOYEE_MAJORITY_OWNED_SCOP]: `Salarié(es) majoritaire(s)/SCOP`
}

const EVENT_STATUS_PAST = `EVENT_STATUS_PAST`
const EVENT_STATUS_FUTUR = `EVENT_STATUS_FUTUR`

const EVENT_STATUSES = {
  [EVENT_STATUS_PAST]: `Evénement passé`,
  [EVENT_STATUS_FUTUR]: `Evénement futur`
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
const NOTIFICATION_TYPE_SPONSOR_PRIVATE_LEAGUE_REQUEST = `NOTIFICATION_TYPE_SPONSOR_PRIVATE_LEAGUE_REQUEST`
const NOTIFICATION_TYPE_EVENT_PARTICIPATION = `NOTIFICATION_TYPE_EVENT_PARTICIPATION`
const NOTIFICATION_TYPE_SPONSOR_EVENT_PARTICIPATION = `NOTIFICATION_TYPE_SPONSOR_EVENT_PARTICIPATION`

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
  [NOTIFICATION_TYPE_SPONSOR_PRIVATE_LEAGUE_REQUEST]: 'user',
  [NOTIFICATION_TYPE_EVENT_PARTICIPATION]: 'event',
  [NOTIFICATION_TYPE_SPONSOR_EVENT_PARTICIPATION]: 'event',
}

const IS_SPEAKER_YES = `IS_SPEAKER_YES`
const IS_SPEAKER_NO = `IS_SPEAKER_NO`

const IS_SPEAKER = {
  [IS_SPEAKER_NO]: `Non speaker`,
  [IS_SPEAKER_YES]: `Speaker`
}

const ANONYMOUS_ALLOWED_MODELS = {
  ['event']: ['accomodations.description', 'accomodations', 'accomodations.name','accomodations.url','attachments','attachments.name','attachments.url','availability','available_tickets','available_tickets.description','available_tickets.discounted_price','available_tickets.event.location_address','available_tickets.event.location_name','available_tickets.event.start_date','available_tickets.name','available_tickets.price','available_tickets.quantity','available_tickets.quantity_registered','available_tickets.remaining_tickets','available_tickets.targeted_roles','banner','category','category.name','comments.creation_date','comments.creator.firstname','comments.creator.picture','dress_code','end_date','is_free','location_address','location_name','meal_included','name','organizer_email','organizer_name','organizer_phone','partners','partners.name','partners.picture','picture','posts.creation_date','posts','posts.comments','posts.comments_count','posts.creator.fullname','posts.creator.picture','posts.likes_count','posts.media','posts.text','registered_users','registered_users_count','registered_users.company.name','registered_users.firstname','registered_users.picture','related_events','related_events.location_name','related_events.name','related_events.picture','related_events.start_date','reservable_tickets','short_description','speakers.company.address','speakers','speakers.company.name','speakers.company.type','speakers.firstname','speakers.job','speakers.lastname','speakers.picture','start_date','status','target'],
  ['user']: ['role', 'firstname', 'lastname', 'current_cursus','company.name','company.size', 'company.turnover','expertise_set.name'],
  ['company']: ['status','name','size','turnover','type','members','address','region','expertise_set.categories','expertise_set.name'],
  ['eventTicket']: ['description','discounted_price','event.location_address','event','event.location_name','event.start_date','name','price','quantity','quantity_registered','remaining_tickets','targeted_roles']
}

const RESET_TOKEN_VALIDITY=2

const USER_SEARCH_TEXT_FIELDS = `lastname,firstname,email,city.city`
const EVENT_SEARCH_TEXT_FIELDS = `name, location_name` //TODO : add category.name target.name (dbFilter pb)

module.exports = {
  DISC_ADMIN, DISC_MEMBER, DISC_EXPERT, DISCRIMINATOR_KEY, DISC_EXTERNAL_ADMIN,DISC_LEADER,DISC_SUPERADMIN,
  ROLES, ROLE_ADMIN, ROLE_MEMBER, ROLE_EXPERT,ROLE_EXTERNAL_ADMIN,ROLE_LEADER,ROLE_SUPERADMIN,
  CONTENT_TYPE, CONTENT_TYPE_ARTICLE, CONTENT_TYPE_GUIDE, CONTENT_TYPE_PODCAST, CONTENT_TYPE_VIDEO, SECTOR, SECTOR_CONSTRUCTION,
  EXPERTISE_CATEGORIES, EXPERTISE_CATEGORY_THREAT_ANALYSIS, EXPERTISE_CATEGORY_NETWORK_AND_ENDPOINT_SECURITY, 
  EXPERTISE_CATEGORY_INCIDENT_MANAGEMENT, EXPERTISE_CATEGORY_SENSITIZATION_AND_FORMATION, EXPERTISE_CATEGORY_EVENT_COMMUNITY_RESEARCH, EXPERTISE_CATEGORY_CRYPTOGRAPHY_AND_EMERGING_TECHNOLOGIES,
  EXPERTISE_CATEGORY_APP_SECURITY, EXPERTISE_CATEGORY_CONFORMITY_AND_CONTROL, EXPERTISE_CATEGORY_CLOUD_AND_VIRTUAL_ENVIRONMENT_SECURITY, EXPERTISE_CATEGORY_DATA_AND_SYSTEM_SECURITY,
  JOBS,COMPANY_SIZE_100_249, EVENT_STATUSES, EVENT_STATUS_FUTUR, EVENT_STATUS_PAST,
  COMPANY_SIZES, ESTIMATED_DURATION_UNITS, ESTIMATED_DURATION_UNIT_JOURS, ESTIMATED_DURATION_UNIT_SEMAINES, ESTIMATED_DURATION_UNIT_MOIS, LOOKING_FOR_MISSION, LOOKING_FOR_MISSION_YES, LOOKING_FOR_MISSION_NO, CONTENT_VISIBILITY, CONTENT_PRIVATE, CONTENT_PUBLIC, EVENT_VISIBILITY, EVENT_VISIBILITY_PRIVATE, EVENT_VISIBILITY_PUBLIC,EVENT_VISIBILITY_DRAFT,
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
  NOTIFICATION_TYPES,NOTIFICATION_TYPE_SPONSOR_PRIVATE_LEAGUE_REQUEST ,NOTIFICATION_TYPE_SPONSOR_EVENT_PARTICIPATION,NOTIFICATION_TYPE_FEED_COMMENT, NOTIFICATION_TYPE_FEED_LIKE, NOTIFICATION_TYPE_GROUP_COMMENT, NOTIFICATION_TYPE_GROUP_LIKE, NOTIFICATION_TYPE_MESSAGE, NOTIFICATION_TYPE_CUSTOMER_SIGNIN, NOTIFICATION_TYPE_EVENT_PARTICIPATION, NOTIFICATION_TYPE_JOB_ANSWER, NOTIFICATION_TYPE_NEW_DIAG,NOTIFICATION_TYPE_NEW_FORMATION,NOTIFICATION_TYPE_NEW_MISSION,NOTIFICATION_TYPE_NEW_SCAN,NOTIFICATION_TYPE_NEW_SENSIBILIZATION, NOTIFICATION_TYPE_PRIVATE_LEAGUE_ACCEPTED,NOTIFICATION_TYPE_PRIVATE_LEAGUE_REQUEST,
  BOOLEAN_ENUM,BOOLEAN_ENUM_NO,BOOLEAN_ENUM_YES, EVENT_AVAILABILITIES,EVENT_AVAILABILITY_AVAILABLE,EVENT_AVAILABILITY_FULL,EVENT_AVAILABILITY_PAUSED,
  BIOGRAPHY_STATUSES,BIOGRAPHY_STATUS_CURRENT,BIOGRAPHY_STATUS_NOT_CURRENT,
  USERTICKET_STATUSES,USERTICKET_STATUS_CANCELED,USERTICKET_STATUS_DECLINED,USERTICKET_STATUS_PAYED,USERTICKET_STATUS_PENDING_PAYMENT,USERTICKET_STATUS_REGISTERED,USERTICKET_STATUS_WAITING_LIST,
  ACCOMODATION_TYPES, TIMEZONES,TIMEZONE_PLUS_1,PARTNER_LEVELS, PARTNER_LEVEL_AMBASSADOR,PARTNER_LEVEL_CONTRIBUTOR,PARTNER_LEVEL_SPONSOR, MAX_WISHES,
  COMPANY_TURNOVERS, ORDER_STATUSES, ORDER_STATUS_IN_PROGRESS, ORDER_STATUS_VALIDATED, COMPANY_TYPES, USER_GENRES,COMPANY_CAPITALS,
  IS_SPEAKER, IS_SPEAKER_NO,ANONYMOUS_ALLOWED_MODELS, RESET_TOKEN_VALIDITY,
  USER_SEARCH_TEXT_FIELDS, EVENT_SEARCH_TEXT_FIELDS,
}