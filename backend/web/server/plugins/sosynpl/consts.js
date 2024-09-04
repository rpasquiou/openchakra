const {AVG_DAYS_IN_MONTH}=require('../../../utils/consts')

const SOSYNPL=`Yelowi`

// Discirimnator for User/Admin/Customer/Freelance
const DISCRIMINATOR_KEY = { discriminatorKey: 'type' }
const DISC_CUSTOMER='customer'
const DISC_FREELANCE='freelance'
const DISC_ADMIN='admin'
const DISC_CUSTOMER_FREELANCE='customerFreelance'


const ROLE_CUSTOMER=`CUSTOMER`
const ROLE_FREELANCE=`FREELANCE`
const ROLE_ADMIN=`ADMIN`

const ROLES={
  [ROLE_CUSTOMER]:`Client`,
  [ROLE_FREELANCE]:`Freelance`,
  [ROLE_ADMIN]:`Administrateur`,
}

const COMPANY_SIZE_LESS_10=`COMPANY_SIZE_LESS_10`
const COMPANY_SIZE__11__250=`COMPANY_SIZE__11__250`
const COMPANY_SIZE__251_5000=`COMPANY_SIZE__251_5000`
const COMPANY_SIZE_MORE_5001=`COMPANY_SIZE_MORE_5001`

const COMPANY_SIZE={
  [COMPANY_SIZE_LESS_10]:`< 10`,
  [COMPANY_SIZE__11__250]:`11 - 250`,
  [COMPANY_SIZE__251_5000]:`251 - 5000`,
  [COMPANY_SIZE_MORE_5001]:`> 500`,
}

const WORK_MODE_REMOTE=`WORK_MODE_REMOTE`
const WORK_MODE_SITE=`WORK_MODE_SITE`
const WORK_MODE_REMOTE_SITE=`WORK_MODE_REMOTE_SITE`

const WORK_MODE={
  [WORK_MODE_REMOTE]:`À distance`,
  [WORK_MODE_SITE]:`Sur site`,
  [WORK_MODE_REMOTE_SITE]:`À distance & sur site`,
}

const WORK_DURATION_LESS_1_MONTH=`WORK_DURATION_LESS_1_MONTH`
const WORK_DURATION__1_TO_6_MONTHS=`WORK_DURATION__1_TO_6_MONTHS`
const WORK_DURATION_MORE_6_MONTH=`WORK_DURATION_MORE_6_MONTH`

const WORK_DURATION={
  [WORK_DURATION_LESS_1_MONTH]:`< 1 mois`,
  [WORK_DURATION__1_TO_6_MONTHS]:`1 à 6 mois`,
  [WORK_DURATION_MORE_6_MONTH]:`> 6 mois`,
}

const DURATION_FILTERS={
  [WORK_DURATION_LESS_1_MONTH]: days => days && days<DURATION_UNIT_DAYS[DURATION_MONTH],
  [WORK_DURATION__1_TO_6_MONTHS]: days => days && days>=DURATION_UNIT_DAYS[DURATION_MONTH] && days <= 6*DURATION_UNIT_DAYS[DURATION_MONTH],
  [WORK_DURATION_MORE_6_MONTH]: days => days > 6*DURATION_UNIT_DAYS[DURATION_MONTH],
}

const VALID_STATUS_PENDING=`VALID_STATUS_PENDING`
const VALID_STATUS_ACEEPTED=`VALID_STATUS_ACEEPTED`
const VALID_STATUS_REFUSED=`VALID_STATUS_REFUSED`

const VALID_STATUS={
  [VALID_STATUS_PENDING]:`En attente`,
  [VALID_STATUS_ACEEPTED]:`Accepté`,
  [VALID_STATUS_REFUSED]:`Refusé`,
}

const SOURCE_RECOMMANDATION=`SOURCE_RECOMMANDATION`
const SOURCE_YELOWI_CONTACT=`SOURCE_YELOWI_CONTACT`
const SOURCE_EVENT=`SOURCE_EVENT`
const SOURCE_SOCIAL_NETWORK=`SOURCE_SOCIAL_NETWORK`
const SOURCE_NEWS_BLOG=`SOURCE_NEWS_BLOG`
const SOURCE_OTHER=`SOURCE_OTHER`

const SOURCE={
  [SOURCE_RECOMMANDATION]:`Recommandation`,
  [SOURCE_YELOWI_CONTACT]:`Contacté par Yelowi`,
  [SOURCE_EVENT]:`Evénement`,
  [SOURCE_SOCIAL_NETWORK]:`Réseaux sociaux`,
  [SOURCE_NEWS_BLOG]:`Blogs/news`,
  [SOURCE_OTHER]:`Autre`,
}

const EXPERIENCE_JUNIOR=`EXPERIENCE_JUNIOR`
const EXPERIENCE_EXPERIMENTED=`EXPERIENCE_EXPERIMENTED`
const EXPERIENCE_SENIOR=`EXPERIENCE_SENIOR`
const EXPERIENCE_EXPERT=`EXPERIENCE_EXPERT`

const EXPERIENCE={
  [EXPERIENCE_JUNIOR]:`Junior: < 2 ans`,
  [EXPERIENCE_EXPERIMENTED]:`Expérimenté : 3-5 ans`,
  [EXPERIENCE_SENIOR]:`Senior : 6-9 ans`,
  [EXPERIENCE_EXPERT]:`Expert : 10 ans et plus`,
}

const LEGAL_STATUS_EI=`EI`
const LEGAL_STATUS_EURL=`EURL`
const LEGAL_STATUS_SARL=`SARL`
const LEGAL_STATUS_SA=`SA`
const LEGAL_STATUS_SAS=`SAS`
const LEGAL_STATUS_SASU=`SASU`
const LEGAL_STATUS_SNC=`SNC`
const LEGAL_STATUS_SCOP=`SCOP`
const LEGAL_STATUS_SCA=`SCA`
const LEGAL_STATUS_SCS=`SCS`
const LEGAL_STATUS_1901=`1901`
const LEGAL_STATUS_CIVIL=`CIVIL`
const LEGAL_STATUS_SEP=`SEP`
const LEGAL_STATUS_SCIC=`SCIC`
const LEGAL_STATUS_PORTAGE=`PORTAGE`
const LEGAL_STATUS_INCUBATOR=`INCUBATOR`
const LEGAL_STATUS_CAE=`CAE`
const LEGAL_STATUS_MDA=`MDA`
const LEGAL_STATUS_PUBLIC=`PUBLIC`

const LEGAL_STATUS={
  [LEGAL_STATUS_EI]:`EI - Entreprise individuelle ou micro-entreprise`,
  [LEGAL_STATUS_EURL]:`EURL - Entreprise unipersonnelle à responsabilité limitée`,
  [LEGAL_STATUS_SARL]:`SARL - Société à responsabilité limitée`,
  [LEGAL_STATUS_SA]:`SA - Société anonyme`,
  [LEGAL_STATUS_SAS]:`SAS - Société par actions simplifiée`,
  [LEGAL_STATUS_SASU]:`SASU - Société par actions simplifiée unipersonnelle`,
  [LEGAL_STATUS_SNC]:`SNC - Société en nom collectif`,
  [LEGAL_STATUS_SCOP]:`Scop - Société coopérative de production`,
  [LEGAL_STATUS_SCA]:`SCA - Société en commandite par actions`,
  [LEGAL_STATUS_SCS]:`SCS - Société en commandite simple`,
  [LEGAL_STATUS_1901]:`Association loi 1901`,
  [LEGAL_STATUS_CIVIL]:`Société civile`,
  [LEGAL_STATUS_SEP]:`SEP - société en participation`,
  [LEGAL_STATUS_SCIC]:`SCIC - Société coopérative d'intérêt collectif`,
  [LEGAL_STATUS_PORTAGE]:`Société de portage salarial`,
  [LEGAL_STATUS_INCUBATOR]:`Couveuses d'entreprises (société)`,
  [LEGAL_STATUS_CAE]:`CAE - Coopérative d'activités et d'emploi`,
  [LEGAL_STATUS_MDA]:`MDA/ Agessa`,
  [LEGAL_STATUS_PUBLIC]:`Entreprise publique`,
}

const REASON_NOT_FREELANCE=`REASON_NOT_FREELANCE`
const REASON_NO_NEED=`REASON_NO_NEED`
const REASON_NOT_SATISFIED=`REASON_NOT_SATISFIED`
const REASON_OTHER=`REASON_OTHER`

const DEACTIVATION_REASON={
  [REASON_NOT_FREELANCE]:`Je ne suis plus indépendant`,
  [REASON_NO_NEED]:`Je n’ai plus besoin du service de So SynpL`,
  [REASON_NOT_SATISFIED]:`Je ne suis pas satisfait du service de So SynpL`,
  [REASON_OTHER]:`Autre`,
}

const SUSPEND_REASON_INACTIVE=`Compte inactif`
const SUSPEND_REASON_CRITERION=`Ne corespond pas à la charte de So SynpL`
const SUSPEND_REASON_OTHER=`SUSPEND_REASON_OTHER`

const SUSPEND_REASON={
  [SUSPEND_REASON_INACTIVE]: `Compte inactif`,
  [SUSPEND_REASON_CRITERION]: `Ne corespond pas à la charte de So SynpL`,
  [SUSPEND_REASON_OTHER]: `Autre`,
}

const ACTIVITY_STATE_SUSPENDED=`ACTIVITY_STATE_SUSPENDED`
const ACTIVITY_STATE_ACTIVE=`ACTIVITY_STATE_ACTIVE`
const ACTIVITY_STATE_STANDBY=`ACTIVITY_STATE_STANDBY`
const ACTIVITY_STATE_DISABLED=`ACTIVITY_STATE_DISABLED`

const ACTIVITY_STATE={
  [ACTIVITY_STATE_SUSPENDED]:`Suspendu`,
  [ACTIVITY_STATE_ACTIVE]:`Actif`,
  [ACTIVITY_STATE_STANDBY]:`A définir`,
  [ACTIVITY_STATE_DISABLED]:`Désactivé`,
}

const MOBILITY_FRANCE=`MOBILITY_FRANCE`
const MOBILITY_REGIONS=`MOBILITY_REGIONS`
const MOBILITY_CITY=`MOBILITY_CITY`
const MOBILITY_NONE=`MOBILITY_NONE`

const MOBILITY={
  [MOBILITY_FRANCE]:`France entière`,
  [MOBILITY_REGIONS]:`Régions`,
  [MOBILITY_CITY]:`Ville`,
}

const ANNOUNCE_MOBILITY={
  [MOBILITY_FRANCE]:`France entière`,
  [MOBILITY_REGIONS]:`Régions`,
  [MOBILITY_NONE]:`Aucun`,
}

const AVAILABILITY_ON=`AVAILABILITY_ON`
const AVAILABILITY_OFF=`AVAILABILITY_OFF`
const AVAILABILITY_UNDEFINED=`AVAILABILITY_UNDEFINED`

const AVAILABILITY={
  [AVAILABILITY_ON]:`Disponible`,
  [AVAILABILITY_OFF]:`Indisponible`,
  [AVAILABILITY_UNDEFINED]:`Non précisé`,
}

const SS_PILAR_CREATOR=`SS_PILAR_CREATOR`
const SS_PILAR_IMPLEMENTOR=`SS_PILAR_IMPLEMENTOR`
const SS_PILAR_OPTIMIZER=`SS_PILAR_OPTIMIZER`
const SS_PILAR_NETWORKER=`SS_PILAR_NETWORKER`
const SS_PILAR_COORDINATOR=`SS_PILAR_COORDINATOR`
const SS_PILAR_DIRECTOR=`SS_PILAR_DIRECTOR`

const SS_PILAR={
  [SS_PILAR_CREATOR]:`Créateur`,
  [SS_PILAR_IMPLEMENTOR]:`Implémenteur`,
  [SS_PILAR_OPTIMIZER]:`Optimisateur`,
  [SS_PILAR_NETWORKER]:`Réseauteur`,
  [SS_PILAR_COORDINATOR]:`Coordinateur`,
  [SS_PILAR_DIRECTOR]:`Directeur`,
}

const SS_MEDALS_GOLD=`SS_MEDALS_GOLD`
const SS_MEDALS_SILVER=`SS_MEDALS_SILVER`
const SS_MEDALS_BRONZE=`SS_MEDALS_BRONZE`

const SS_MEDALS={
  [SS_MEDALS_GOLD]:`Or`,
  [SS_MEDALS_SILVER]:`Argent`,
  [SS_MEDALS_BRONZE]:`Bronze`,
}

const SOFT_SKILL_COMM=`SOFT_SKILL_COMM`
const SOFT_SKILL_TEAMWORK=`SOFT_SKILL_TEAMWORK`
const SOFT_SKILL_CONFLICT=`SOFT_SKILL_CONFLICT`
const SOFT_SKILL_CHANGE=`SOFT_SKILL_CHANGE`
const SOFT_SKILL_FEDERATE=`SOFT_SKILL_FEDERATE`
const SOFT_SKILL_CREATIVE=`SOFT_SKILL_CREATIVE`
const SOFT_SKILL_ADAPTATION=`SOFT_SKILL_ADAPTATION`
const SOFT_SKILL_ANALYSIS=`SOFT_SKILL_ANALYSIS`
const SOFT_SKILL_ORGANIZATION=`SOFT_SKILL_ORGANIZATION`
const SOFT_SKILL_MANAGE=`SOFT_SKILL_MANAGE`

const SOFT_SKILLS={
  [SOFT_SKILL_COMM]:`Communication`,
  [SOFT_SKILL_TEAMWORK]:`Collaboration`,
  [SOFT_SKILL_CONFLICT]:`Médiation des conflits`,
  [SOFT_SKILL_CHANGE]:`Promotion du changement`,
  [SOFT_SKILL_FEDERATE]:`Leadership collaboratif`,
  [SOFT_SKILL_CREATIVE]:`Inventivité, Curiosité`,
  [SOFT_SKILL_ADAPTATION]:`Adaptabilité, Flexibilité`,
  [SOFT_SKILL_ANALYSIS]:`Synthèse, Réflexion`,
  [SOFT_SKILL_ORGANIZATION]:`Organisation, Planification`,
  [SOFT_SKILL_MANAGE]:`Décision, persévérance`,
}

const DURATION_DAY=`DURATION_DAY`
const DURATION_WEEK=`DURATION_WEEK`
const DURATION_MONTH=`DURATION_MONTH`

const DURATION_UNIT={
  [DURATION_DAY]:`jour(s)`,
  [DURATION_WEEK]:`semaine(s)`,
  [DURATION_MONTH]:`mois`,
}

// Average work days for each duration unit
const DURATION_UNIT_WORK_DAYS={
  [DURATION_DAY]: 1,
  [DURATION_WEEK]: 5,
  [DURATION_MONTH]: 22,
}

// Days count for duration
const DURATION_UNIT_DAYS={
  [DURATION_DAY]: 1,
  [DURATION_WEEK]: 7,
  [DURATION_MONTH]: AVG_DAYS_IN_MONTH,
}

const COMMISSION=0.15

const ANNOUNCE_STATUS_DRAFT=`ANNOUNCE_STATUS_DRAFT`
const ANNOUNCE_STATUS_CANCELED=`ANNOUNCE_STATUS_CANCELED`
const ANNOUNCE_STATUS_ACTIVE=`ANNOUNCE_STATUS_ACTIVE`
const ANNOUNCE_STATUS_PROVIDED=`ANNOUNCE_STATUS_PROVIDED`

const ANNOUNCE_STATUS={
  [ANNOUNCE_STATUS_DRAFT]:`Brouillon`,
  [ANNOUNCE_STATUS_CANCELED]:`Archivée`,
  [ANNOUNCE_STATUS_ACTIVE]:`Active`,
  [ANNOUNCE_STATUS_PROVIDED]:`Pourvue`,
}

const APPLICATION_STATUS_ACCEPTED=`APPLICATION_STATUS_ACCEPTED`
const APPLICATION_STATUS_REFUSED=`APPLICATION_STATUS_REFUSED`
const APPLICATION_STATUS_SENT=`APPLICATION_STATUS_SENT`
const APPLICATION_STATUS_DRAFT=`APPLICATION_STATUS_DRAFT`

const APPLICATION_STATUS={
  [APPLICATION_STATUS_ACCEPTED]:`Acceptée`,
  [APPLICATION_STATUS_REFUSED]:`Refusée`,
  [APPLICATION_STATUS_SENT]:`Envoyée`,
  [APPLICATION_STATUS_DRAFT]:`Brouillon`,
}

const ANNOUNCE_SUGGESTION_SENT=`ANNOUNCE_SUGGESTION_SENT`
const ANNOUNCE_SUGGESTION_REFUSED=`ANNOUNCE_SUGGESTION_REFUSED`
const ANNOUNCE_SUGGESTION_ACCEPTED=`ANNOUNCE_SUGGESTION_ACCEPTED`

const ANNOUNCE_SUGGESTION={
  [ANNOUNCE_SUGGESTION_SENT]:`Envoyée`,
  [ANNOUNCE_SUGGESTION_REFUSED]:`Refusée`,
  [ANNOUNCE_SUGGESTION_ACCEPTED]:`Acceptée`,
}

const REFUSE_REASON_NOT_AVAILABLE=`REFUSE_REASON_NOT_AVAILABLE`
const REFUSE_REASON_CONTENTS=`REFUSE_REASON_CONTENTS`
const REFUSE_REASON_WORK_PREFERENCES=`REFUSE_REASON_WORK_PREFERENCES`
const REFUSE_REASON_COMPANY_PROFILE=`REFUSE_REASON_COMPANY_PROFILE`

const REFUSE_REASON_PROVIDED=`REFUSE_REASON_PROVIDED`
const REFUSE_REASON_CANCELED=`REFUSE_REASON_CANCELED`
const REFUSE_REASON_DELIVERY=`REFUSE_REASON_DELIVERY`
const REFUSE_REASON_WORK_PREFERENCE_BAD=`REFUSE_REASON_WORK_PREFERENCE_BAD`
const REFUSE_REASON_PRICE=`REFUSE_REASON_PRICE`
const REFUSE_REASON_EXPERIENCE=`REFUSE_REASON_EXPERIENCE`
const REFUSE_REASON_SKILLS=`REFUSE_REASON_SKILLS`
const REFUSE_REASON_STARTDATE_TOO_FAR=`REFUSE_REASON_STARTDATE_TOO_FAR`
const REFUSE_REASON_KNOWLEDGE=`REFUSE_REASON_KNOWLEDGE`

const REFUSE_REASON={
  [REFUSE_REASON_NOT_AVAILABLE]:`Je ne suis pas disponible`,
  [REFUSE_REASON_CONTENTS]:`Le contenu de la mission de me convient pas`,
  [REFUSE_REASON_WORK_PREFERENCES]:`Les préférences de travail ne me sont pas adaptées`,
  [REFUSE_REASON_COMPANY_PROFILE]:`Les spécificités de votre entreprise sont trop éloignées de mon expérience (secteur, taille d’entreprise…)`,
}

const APPLICATION_REFUSE_REASON={
  [REFUSE_REASON_PROVIDED]:`L’annonce a été pourvue`,
  [REFUSE_REASON_CANCELED]:`L’annonce a été annulée`,
  [REFUSE_REASON_DELIVERY]:`Le contenu ou livrable de la mission est incomplet`,
  [REFUSE_REASON_WORK_PREFERENCE_BAD]:`Les préférences de travail ne sont pas conformes à l’annonce`,
  [REFUSE_REASON_PRICE]:`Le tarif indiqué est éloigné des attentes`,
  [REFUSE_REASON_EXPERIENCE]:`L’expérience est éloignée des attentes`,
  [REFUSE_REASON_SKILLS]:`Les compétences attendues sont incomplètes`,
  [REFUSE_REASON_STARTDATE_TOO_FAR]:`La date de démarrage est trop lointaine`,
  [REFUSE_REASON_KNOWLEDGE]:`La connaissance du secteur d’activité est insuffisante`,
}


const QUOTATION_STATUS_DRAFT=`QUOTATION_STATUS_DRAFT`
const QUOTATION_STATUS_SENT=`QUOTATION_STATUS_SENT`
const QUOTATION_STATUS_OUTDATED=`QUOTATION_STATUS_OUTDATED`
const QUOTATION_STATUS_ACCEPTED=`QUOTATION_STATUS_ACCEPTED`
const QUOTATION_STATUS_REFUSED=`QUOTATION_STATUS_REFUSED`

const QUOTATION_STATUS={
  [QUOTATION_STATUS_DRAFT]:`Brouillon`,
  [QUOTATION_STATUS_SENT]:`Envoyé`,
  [QUOTATION_STATUS_OUTDATED]:`Caduc`,
  [QUOTATION_STATUS_ACCEPTED]:`Accepté`,
  [QUOTATION_STATUS_REFUSED]:`Refusé`,
}

const SOSYNPL_LANGUAGES=require('./languages.json')

const FREELANCE_COMMISSION_RATE=0.05
const CUSTOMER_COMMISSION_RATE=0.15

const SOSYNPL_COMMISSION_VAT_RATE=0.2

const MISSION_STATUS_TO_COME=`MISSION_STATUS_TO_COME`
const MISSION_STATUS_CURRENT=`MISSION_STATUS_CURRENT`
const MISSION_STATUS_FREELANCE_FINISHED=`MISSION_STATUS_FREELANCE_FINISHED`
const MISSION_STATUS_CUSTOMER_FINISHED=`MISSION_STATUS_CUSTOMER_FINISHED`
const MISSION_STATUS_CLOSED=`MISSION_STATUS_CLOSED`

const MISSION_STATUS={
  [MISSION_STATUS_TO_COME]:`A venir`,
  [MISSION_STATUS_CURRENT]:`En cours`,
  [MISSION_STATUS_FREELANCE_FINISHED]:`Terminée par l'indépendant`,
  [MISSION_STATUS_CUSTOMER_FINISHED]:`Validée par le client`,
  [MISSION_STATUS_CLOSED]:`Fermée par ${SOSYNPL}`,
}

const REPORT_STATUS_DRAFT=`REPORT_STATUS_DRAFT`
const REPORT_STATUS_SENT=`REPORT_STATUS_SENT`
const REPORT_STATUS_ACCEPTED=`REPORT_STATUS_ACCEPTED`
const REPORT_STATUS_PAID=`REPORT_STATUS_PAID`
const REPORT_STATUS_DISPUTE=`REPORT_STATUS_DISPUTE`

const REPORT_STATUS={
  [REPORT_STATUS_DRAFT]:`Brouillon`,
  [REPORT_STATUS_SENT]:`Envoyé`,
  [REPORT_STATUS_ACCEPTED]:`Accepté`,
  [REPORT_STATUS_PAID]:`Payé`,
  [REPORT_STATUS_DISPUTE]:`Litige`,
}

const SEARCH_MODE_PROFILE=`SEARCH_MODE_PROFILE`
const SEARCH_MODE_MISSION=`SEARCH_MODE_MISSION`

const SEARCH_MODE={
  [SEARCH_MODE_PROFILE]:`profile`,
  [SEARCH_MODE_MISSION]:`mission`,
}

// Default radius for search (km)
const DEFAULT_SEARCH_RADIUS=20

// Evaluation min and max
const EVALUATION_MIN=1
const EVALUATION_MAX=5

//Customer Freelance soft skills
const CF_MAX_GOLD_SOFT_SKILLS=1
const CF_MAX_SILVER_SOFT_SKILLS=2
const CF_MAX_BRONZE_SOFT_SKILLS=3

//Freelance profile completion
const FREELANCE_REQUIRED_ATTRIBUTES = ['firstname', 'lastname', 'main_job', 'work_duration', 'position', 'experience', 'main_experience']
const SOFT_SKILLS_ATTR = ['gold_soft_skills', 'silver_soft_skills', 'bronze_soft_skills']
const FREELANCE_MANDATORY_ATTRIBUTES = ['picture', 'work_mode', 'mobility', 'work_sector', 'expertises', 'experiences', 'trainings', 'description', 'rate']

const FREELANCE_OUTPUT_ATTRIBUTES = {
  firstname : `Prénom`,
  lastname : `Nom`,
  main_job : `Métier principal`,
  work_duration : `Durée de mission souhaitée`,
  position : `Intitulé du poste`,
  experience : `Expérience dans le poste`,
  main_experience : `Expérience principale`,
  soft_skills : `Soft Skills`,
  picture : `Photo de profil`,
  work_mode : `Mode de travail`,
  mobility : `Mobilité`,
  work_sector : `Secteur d'activité`,
  expertises : `Compétences`,
  experiences : `Expériences`,
  trainings : `Formations`,
  description : `Pourquoi moi?`,
  rate : `Taux journalier moyen`
}

//Customer profile completion
const CUSTOMER_REQUIRED_ATTRIBUTES = ['siren','company_size','description','company_logo','headquarter_address','legal_status','company_name']

const CUSTOMER_OUTPUT_ATTRIBUTES = {
  siren:'SIREN',
  company_name:`Nom de l'entreprise`,
  company_logo:'Logo',
  description:`Description de l'entreprise`,
  company_size:`Taille de l'entreprise`,
  legal_status:`Statut de l'entreprise`,
  registration_city:`Ville d'immatriculation`,
  headquarter_address:`Adresse du siège de l'entreprise`,
}

module.exports={
  SOSYNPL, ROLES, COMPANY_SIZE, WORK_MODE, WORK_MODE_REMOTE, WORK_MODE_REMOTE_SITE, WORK_MODE_SITE, WORK_DURATION, WORK_DURATION_LESS_1_MONTH, WORK_DURATION_MORE_6_MONTH, WORK_DURATION__1_TO_6_MONTHS, VALID_STATUS, VALID_STATUS_PENDING, SOURCE,
  DISCRIMINATOR_KEY, DISC_CUSTOMER, DISC_FREELANCE, DISC_ADMIN, DISC_CUSTOMER_FREELANCE, EXPERIENCE, EXPERIENCE_EXPERIMENTED, EXPERIENCE_EXPERT, EXPERIENCE_JUNIOR, EXPERIENCE_SENIOR, ROLE_CUSTOMER, ROLE_FREELANCE, ROLE_ADMIN,
  LEGAL_STATUS, DEACTIVATION_REASON, SUSPEND_REASON, ACTIVITY_STATE, ACTIVITY_STATE_ACTIVE, ACTIVITY_STATE_STANDBY,
  ACTIVITY_STATE_SUSPENDED, ACTIVITY_STATE_DISABLED, MOBILITY, MOBILITY_CITY, MOBILITY_FRANCE, MOBILITY_REGIONS,
  AVAILABILITY, AVAILABILITY_UNDEFINED, AVAILABILITY_UNDEFINED, AVAILABILITY_ON, AVAILABILITY_OFF, SS_PILAR,
  SS_PILAR_COORDINATOR, SS_PILAR_CREATOR, SS_PILAR_DIRECTOR, SS_PILAR_IMPLEMENTOR, SS_PILAR_NETWORKER, SS_PILAR_OPTIMIZER,
  SS_MEDALS, SS_MEDALS_GOLD, SS_MEDALS_SILVER, SS_MEDALS_BRONZE,
  SOFT_SKILLS, SOFT_SKILL_COMM, SOFT_SKILL_TEAMWORK,SOFT_SKILL_CONFLICT,SOFT_SKILL_CHANGE,SOFT_SKILL_FEDERATE,SOFT_SKILL_CREATIVE,
  SOFT_SKILL_ADAPTATION, SOFT_SKILL_ANALYSIS, SOFT_SKILL_ORGANIZATION,SOFT_SKILL_MANAGE, DURATION_UNIT,
  ANNOUNCE_MOBILITY, MOBILITY_NONE, COMMISSION, ANNOUNCE_STATUS, ANNOUNCE_STATUS_DRAFT, ANNOUNCE_STATUS_ACTIVE, ANNOUNCE_STATUS_PROVIDED, ANNOUNCE_STATUS_CANCELED,
  APPLICATION_STATUS, APPLICATION_STATUS_DRAFT, APPLICATION_STATUS_SENT, APPLICATION_STATUS_REFUSED, DURATION_UNIT_WORK_DAYS, SOSYNPL_LANGUAGES,
  ANNOUNCE_SUGGESTION, ANNOUNCE_SUGGESTION_SENT, ANNOUNCE_SUGGESTION_ACCEPTED, ANNOUNCE_SUGGESTION_REFUSED, REFUSE_REASON,
  FREELANCE_COMMISSION_RATE, CUSTOMER_COMMISSION_RATE, QUOTATION_STATUS, QUOTATION_STATUS_DRAFT, QUOTATION_STATUS_SENT,
  SOSYNPL_COMMISSION_VAT_RATE, APPLICATION_REFUSE_REASON,REFUSE_REASON_CANCELED, REFUSE_REASON_PROVIDED, APPLICATION_STATUS_ACCEPTED,
  MISSION_STATUS, MISSION_STATUS_TO_COME, MISSION_STATUS_CURRENT, MISSION_STATUS_FREELANCE_FINISHED, MISSION_STATUS_CUSTOMER_FINISHED, MISSION_STATUS_CLOSED,
  REPORT_STATUS, REPORT_STATUS_DRAFT, REPORT_STATUS_DISPUTE, REPORT_STATUS_SENT, REPORT_STATUS_PAID, REPORT_STATUS_ACCEPTED,
  SEARCH_MODE, DEFAULT_SEARCH_RADIUS, DURATION_UNIT_DAYS, DURATION_FILTERS, DURATION_MONTH,SOURCE_RECOMMANDATION, EVALUATION_MIN, EVALUATION_MAX, DURATION_MONTH, CF_MAX_GOLD_SOFT_SKILLS, CF_MAX_SILVER_SOFT_SKILLS, CF_MAX_BRONZE_SOFT_SKILLS,
  COMPANY_SIZE_LESS_10,MISSION_STATUS_CLOSED,
  FREELANCE_REQUIRED_ATTRIBUTES, SOFT_SKILLS_ATTR, FREELANCE_MANDATORY_ATTRIBUTES, FREELANCE_OUTPUT_ATTRIBUTES,
  CUSTOMER_REQUIRED_ATTRIBUTES, CUSTOMER_OUTPUT_ATTRIBUTES
}

