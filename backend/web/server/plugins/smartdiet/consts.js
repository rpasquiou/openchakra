const CONTENTS_ARTICLE= 'ARTICLE'
const CONTENTS_INFOGRAPHY='INFOGRAPHY'
const CONTENTS_VIDEO='VIDEO'
const CONTENTS_PODCAST='PODCAST'
const CONTENTS_DOCUMENT='DOCUMENT'

const CONTENTS_TYPE = {
  [CONTENTS_ARTICLE]:'Article',
  [CONTENTS_VIDEO]:'Vidéo',
  [CONTENTS_INFOGRAPHY]:'Infographie',
  [CONTENTS_PODCAST]:'Podcast',
  [CONTENTS_DOCUMENT]:'Document',// Required by migration
}

const EVENT_MENU= 'MENU'
const EVENT_IND_CHALLENGE='IND_CHALLENGE'
const EVENT_COLL_CHALLENGE='COLL_CHALLENGE'
const EVENT_WEBINAR='WEBINAR'

const EVENT_TYPE = {
  [EVENT_MENU]:'Menu',
  [EVENT_IND_CHALLENGE]:'Challenge individuel',
  [EVENT_COLL_CHALLENGE]:'Challenge collectif',
  [EVENT_WEBINAR]:'Webinaire',
}

const ROLE_CUSTOMER='CUSTOMER'
const ROLE_RH='RH'
const ROLE_DIET='DIET'
const ROLE_EXTERNAL_DIET='EXTERNAL_DIET'
const ROLE_SUPER_ADMIN='SUPER_ADMIN'
const ROLE_ADMIN='ADMIN'
const ROLE_SUPPORT='SUPPORT'

const ROLES={
  [ROLE_CUSTOMER]:'Abonné',
  [ROLE_RH]:'RH',
  [ROLE_DIET]:'Diététicien(ne)',
  [ROLE_EXTERNAL_DIET]:'Diététicien(ne) externe',
  [ROLE_SUPER_ADMIN]:'Superadministrateur',
  [ROLE_ADMIN]:'Administrateur',
  [ROLE_SUPPORT]:'Support',
}

const GENDER_MALE='MALE'
const GENDER_FEMALE='FEMALE'
const GENDER_NON_BINARY='NON_BINARY'

const GENDER = {
  [GENDER_MALE]:'Homme',
  [GENDER_FEMALE]:'Femme',
  [GENDER_NON_BINARY]:'Non genré',
}

const ACT_ACTIVE='ACTIVE'
const ACT_STUDENT='STUDENT'
const ACT_RETIRED='RETIRED'
const ACT_OTHER='OTHER'

const ACTIVITY={
  [ACT_ACTIVE]:'Actif',
  [ACT_STUDENT]:'Etudiant',
  [ACT_RETIRED]:'En retraite',
  [ACT_OTHER]:'Autre',
}

const TARGET_OBJECTIVE='OBJECTIVE'
const TARGET_SPECIFICITY='SPECIFICITY'
const TARGET_ACTIVITY='ACTIVITY'
const TARGET_HOME='HOME'
const TARGET_HEALTH='HEALTH'
const TARGET_COACHING='COACHING'

const TARGET_TYPE={
  [TARGET_OBJECTIVE]:'Objectif',
  [TARGET_SPECIFICITY]:'Spécificité',
  [TARGET_ACTIVITY]:'Activité',
  [TARGET_HOME]:'Foyer',
  [TARGET_HEALTH]:'Santé',
  [TARGET_COACHING]:'Coaching',
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
const COMPANY_ACTIVITY_OTHER='COMPANY_ACTIVITY_OTHER'

const COMPANY_ACTIVITY={
  [COMPANY_ACTIVITY_AGROALIMENTAIRE]:'Agroalimentaire',
  [COMPANY_ACTIVITY_BANQUE]:'Banque',
  [COMPANY_ACTIVITY_ASSURANCE]:'Assurance',
  [COMPANY_ACTIVITY_BOIS]:'Bois',
  [COMPANY_ACTIVITY_PAPIER]:'Papier',
  [COMPANY_ACTIVITY_CARTON]:'Carton',
  [COMPANY_ACTIVITY_IMPRIMERIE]:'Imprimerie',
  [COMPANY_ACTIVITY_BTP]:'BTP',
  [COMPANY_ACTIVITY_MATERIAUX_DE_CONSTRUCTION]:'Matériaux de construction',
  [COMPANY_ACTIVITY_CHIMIE]:'Chimie',
  [COMPANY_ACTIVITY_PARACHIMIE]:'Parachimie',
  [COMPANY_ACTIVITY_COMMERCE]:'Commerce',
  [COMPANY_ACTIVITY_NEGOCE]:'Négoce',
  [COMPANY_ACTIVITY_DISTRIBUTION]:'Distribution',
  [COMPANY_ACTIVITY_EDITION]:'Édition',
  [COMPANY_ACTIVITY_COMMUNICATION]:'Communication',
  [COMPANY_ACTIVITY_MULTIMEDIA]:'Multimédia',
  [COMPANY_ACTIVITY_ELECTRONIQUE]:'Électronique',
  [COMPANY_ACTIVITY_ELECTRICITE]:'Électricité',
  [COMPANY_ACTIVITY_ETUDES_ET_CONSEILS]:'Études et conseils',
  [COMPANY_ACTIVITY_INDUSTRIE_PHARMACEUTIQUE]:'Industrie pharmaceutique',
  [COMPANY_ACTIVITY_INFORMATIQUE]:'Informatique',
  [COMPANY_ACTIVITY_TELECOMS]:'Télécoms',
  [COMPANY_ACTIVITY_MACHINES_ET_EQUIPEMENTS]:'Machines et équipements',
  [COMPANY_ACTIVITY_AUTOMOBILE]:'Automobile',
  [COMPANY_ACTIVITY_METALLURGIE]:'Métallurgie',
  [COMPANY_ACTIVITY_TRAVAIL_DU_METAL]:'Travail du métal',
  [COMPANY_ACTIVITY_PLASTIQUE]:'Plastique',
  [COMPANY_ACTIVITY_CAOUTCHOUC]:'Caoutchouc',
  [COMPANY_ACTIVITY_SERVICES_AUX_ENTREPRISES]:'Services aux entreprises',
  [COMPANY_ACTIVITY_TEXTILE]:'Textile',
  [COMPANY_ACTIVITY_HABILLEMENT]:'Habillement',
  [COMPANY_ACTIVITY_CHAUSSURE]:'Chaussure',
  [COMPANY_ACTIVITY_TRANSPORTS]:'Transports',
  [COMPANY_ACTIVITY_LOGISTIQUE]:'Logistique',
  [COMPANY_ACTIVITY_OTHER]: 'Autre',
}

const SPOON_SOURCE_PROFILE_COMPLETED='SPOON_SOURCE_PROFILE_COMPLETED'
const SPOON_SOURCE_CONTENT_READ='SPOON_SOURCE_CONTENT_READ'
const SPOON_SOURCE_CONTENT_EXT_SHARED='SPOON_SOURCE_CONTENT_EXT_SHARED'
const SPOON_SOURCE_CONTENT_LIKE='SPOON_SOURCE_CONTENT_LIKE'
const SPOON_SOURCE_CONTENT_DOWNLOADED='SPOON_SOURCE_CONTENT_DOWNLOADED'
const SPOON_SOURCE_CONTENT_PINNED='SPOON_SOURCE_CONTENT_PINNED'
const SPOON_SOURCE_CONTENT_COMMENT='SPOON_SOURCE_CONTENT_COMMENT'
const SPOON_SOURCE_GROUP_MESSAGE='SPOON_SOURCE_GROUP_MESSAGE'
const SPOON_SOURCE_GROUP_LIKE='SPOON_SOURCE_GROUP_LIKE'
const SPOON_SOURCE_GROUP_JOIN='SPOON_SOURCE_GROUP_JOIN'
const SPOON_SOURCE_WEBINAR_LIVE='SPOON_SOURCE_WEBINAR_LIVE'
const SPOON_SOURCE_WEBINAR_REPLAY='SPOON_SOURCE_WEBINAR_REPLAY'
const SPOON_SOURCE_SURVEY_DONE='SPOON_SOURCE_SURVEY_DONE'
const SPOON_SOURCE_SURVEY_PASSED='SPOON_SOURCE_SURVEY_PASSED'
const SPOON_SOURCE_INDIVIDUAL_CHALLENGE_PASSED='SPOON_SOURCE_INDIVIDUAL_CHALLENGE_PASSED'
const SPOON_SOURCE_INDIVIDUAL_CHALLENGE_ROUTINE='SPOON_SOURCE_INDIVIDUAL_CHALLENGE_ROUTINE'
const SPOON_SOURCE_MEASURE_CHEST='SPOON_SOURCE_MEASURE_CHEST'
const SPOON_SOURCE_MEASURE_WAIST='SPOON_SOURCE_MEASURE_WAIST'
const SPOON_SOURCE_MEASURE_HIPS='SPOON_SOURCE_MEASURE_HIPS'
const SPOON_SOURCE_MEASURE_THIGHS='SPOON_SOURCE_MEASURE_THIGHS'
const SPOON_SOURCE_MEASURES_ARMS='SPOON_SOURCE_MEASURES_ARMS'
const SPOON_SOURCE_MEASURE_WEIGHT='SPOON_SOURCE_MEASURE_WEIGHT'

const SPOON_SOURCE={
  [SPOON_SOURCE_PROFILE_COMPLETED]:'Profil complété',
  [SPOON_SOURCE_CONTENT_READ]:'Lecture de contenu',
  [SPOON_SOURCE_CONTENT_EXT_SHARED]:'Partage de contenu en externe',
  [SPOON_SOURCE_CONTENT_LIKE]:"Aime un contenu",
  [SPOON_SOURCE_CONTENT_DOWNLOADED]:"Téléchargement de contenu",
  [SPOON_SOURCE_CONTENT_PINNED]:'Contenu épinglé',
  [SPOON_SOURCE_CONTENT_COMMENT]:"Commentaire de contenu",
  [SPOON_SOURCE_GROUP_MESSAGE]:'Message dans un groupe',
  [SPOON_SOURCE_GROUP_LIKE]:"Aime un groupe",
  [SPOON_SOURCE_GROUP_JOIN]:'Rejoindre un groupe',
  [SPOON_SOURCE_WEBINAR_LIVE]:'Assister à un webinaire',
  [SPOON_SOURCE_WEBINAR_REPLAY]:'Webinaire en replay',
  [SPOON_SOURCE_SURVEY_DONE]:'Questionnaire terminé',
  [SPOON_SOURCE_SURVEY_PASSED]:'Questionnaire réussi',
  [SPOON_SOURCE_INDIVIDUAL_CHALLENGE_PASSED]:'Challenge individuel réussi',
  [SPOON_SOURCE_INDIVIDUAL_CHALLENGE_ROUTINE]: 'Challenge individuel dans ma routine',
  [SPOON_SOURCE_MEASURE_CHEST]:'Mesure de la poitrine',
  [SPOON_SOURCE_MEASURE_WAIST]:'Mesure de la taille',
  [SPOON_SOURCE_MEASURE_HIPS]:'Mesure des hanches',
  [SPOON_SOURCE_MEASURE_THIGHS]:'Mesure des cuisses',
  [SPOON_SOURCE_MEASURES_ARMS]:'Messure des bras',
  [SPOON_SOURCE_MEASURE_WEIGHT]:'Mesure du poids',
}

// Discriminator for mongoose products
const EVENT_DISCRIMINATOR = {discriminatorKey:'kind'}

const HARDNESS_EASY='EASY'
const HARDNESS_HARD='HARD'

const HARDNESS={
  [HARDNESS_EASY]:'Du gâteau',
  [HARDNESS_HARD]:'De la tarte',
}

const NUTRISCORE_A='NUTRISCORE_A'
const NUTRISCORE_B='NUTRISCORE_B'
const NUTRISCORE_C='NUTRISCORE_C'
const NUTRISCORE_D='NUTRISCORE_D'
const NUTRISCORE_E='NUTRISCORE_E'

const NUTRISCORE={
  [NUTRISCORE_A]:'A',
  [NUTRISCORE_B]:'B',
  [NUTRISCORE_C]:'C',
  [NUTRISCORE_D]:'D',
  [NUTRISCORE_E]:'E',
}

const ECOSCORE_A='ECOSCORE_A'
const ECOSCORE_B='ECOSCORE_B'
const ECOSCORE_C='ECOSCORE_C'
const ECOSCORE_D='ECOSCORE_D'
const ECOSCORE_E='ECOSCORE_E'

const ECOSCORE={
 [ECOSCORE_A]:'A',
 [ECOSCORE_B]:'B',
 [ECOSCORE_C]:'C',
 [ECOSCORE_D]:'D',
 [ECOSCORE_E]:'E',
}

const UNIT_KG='UNIT_KG'
const UNIT_L='UNIT_L'
const UNIT_DOUZAINE='UNIT_DOUZAINE'
const UNIT_CUILLERE_A_SOUPE='UNIT_CUILLERE_A_SOUPE'
const UNIT_CUILLERE_A_CAFE='UNIT_CUILLERE_A_CAFE'
const UNIT_ML='UNIT_ML'
const UNIT_CL='UNIT_CL'
const UNIT_DL='UNIT_DL'
const UNIT_G='UNIT_G'
const UNIT_PINCEE='UNIT_PINCEE'
const UNIT_VERRE_A_MOUTARDE='UNIT_VERRE_A_MOUTARDE'
const UNIT_LOUCHE='UNIT_LOUCHE'
const UNIT_FILET='UNIT_FILET'
const UNIT_NOISETTE='UNIT_NOISETTE'
const UNIT_POIGNEE='UNIT_POIGNEE'
const UNIT_MIGNONETTE='UNIT_MIGNONETTE'
const UNIT_SACHET='UNIT_SACHET'
const UNIT_CUBE='UNIT_CUBE'
const UNIT_UNITE='UNIT_UNITE'

const UNIT={
 [UNIT_KG]:'kg',
 [UNIT_L]:'l',
 [UNIT_DOUZAINE]:'douzaine(s)',
 [UNIT_CUILLERE_A_SOUPE]:'cuillère(s) à soupe',
 [UNIT_CUILLERE_A_CAFE]:'cuillère(s) à café',
 [UNIT_ML]:'ml',
 [UNIT_CL]:'cl',
 [UNIT_DL]:'dl',
 [UNIT_G]:'g',
 [UNIT_PINCEE]:'pincée(s)',
 [UNIT_VERRE_A_MOUTARDE]:'verre(s) à moutarde',
 [UNIT_LOUCHE]:'louche(s)',
 [UNIT_FILET]:'filet(s)',
 [UNIT_NOISETTE]:'noisette(s)',
 [UNIT_POIGNEE]:'poignée(s)',
 [UNIT_MIGNONETTE]:'mignonette(s)',
 [UNIT_SACHET]:'sachet(s)',
 [UNIT_CUBE]:'cube(s)',
 [UNIT_UNITE]:'',
}

const UNIT_CONVERSIONS={
  [UNIT_G]:{limit:1000, unit:UNIT_KG},
  [UNIT_ML]:{limit:10, unit:UNIT_CL},
  [UNIT_CL]:{limit:10, unit:UNIT_DL},
  [UNIT_DL]:{limit:10, unit:UNIT_L},
}

const convertQuantity=(quantity, unit) => {
  const conversion=UNIT_CONVERSIONS[unit]
  if (quantity>=conversion?.limit) {
    return convertQuantity(quantity/conversion.limit, conversion.unit)
  }
  return [quantity, unit]
}

const PARTICULAR_COMPANY_NAME='Adhérent particulier'

const SURVEY_ANSWER_NEVER='0'
const SURVEY_ANSWER_RARELY='1'
const SURVEY_ANSWER_SOMETIMES='2'
const SURVEY_ANSWER_OFTEN='3'
const SURVEY_ANSWER_ALWAYS='4'

const SURVEY_ANSWER={
  [SURVEY_ANSWER_NEVER]:'jamais',
  [SURVEY_ANSWER_RARELY]:'rarement',
  [SURVEY_ANSWER_SOMETIMES]:'parfois',
  [SURVEY_ANSWER_OFTEN]:'souvent',
  [SURVEY_ANSWER_ALWAYS]:'toujours',
}

const DAYS_MONDAY='0'
const DAYS_TUESDAY='1'
const DAYS_WEDNESDAY='2'
const DAYS_THURSDAY='3'
const DAYS_FRIDAY='4'
const DAYS_SATURDAY='5'
const DAYS_SUNDAY='6'

const DAYS={
 [DAYS_MONDAY]:'Lundi',
 [DAYS_TUESDAY]:'Mardi',
 [DAYS_WEDNESDAY]:'Mercredi',
 [DAYS_THURSDAY]:'Jeudi',
 [DAYS_FRIDAY]:'Vendredi',
 [DAYS_SATURDAY]:'Samedi',
 [DAYS_SUNDAY]:'Dimanche',
}

const PERIOD_NOON='0'
const PERIOD_EVENING='1'

const PERIOD={
 [PERIOD_NOON]:'Déjeuner',
 [PERIOD_EVENING]:'Dîner',
}

const NO_CREDIT_AVAILABLE=`Votre crédit est épuisé ou votre offre ne permet pas l'accès`

const COACHING_QUESTION_STATUS_NOT_ADDRESSED="COACHING_QUESTION_STATUS_NOT_ADDRESSED"
const COACHING_QUESTION_STATUS_NOT_ACQUIRED="COACHING_QUESTION_STATUS_NOT_ACQUIRED"
const COACHING_QUESTION_STATUS_IN_PROGRESS="COACHING_QUESTION_STATUS_IN_PROGRESS"
const COACHING_QUESTION_STATUS_ACQUIRED="COACHING_QUESTION_STATUS_ACQUIRED"

const COACHING_QUESTION_STATUS={
 [COACHING_QUESTION_STATUS_NOT_ADDRESSED]:"Non abordé",
 [COACHING_QUESTION_STATUS_NOT_ACQUIRED]:"Non acquis",
 [COACHING_QUESTION_STATUS_IN_PROGRESS]:"En cours d'acquisition",
 [COACHING_QUESTION_STATUS_ACQUIRED]:"Acquis",
}

const SEASON_SPRING="SEASON_SPRING"
const SEASON_SUMMER="SEASON_SUMMER"
const SEASON_AUTUMN="SEASON_AUTUMN"
const SEASON_WINTER="SEASON_WINTER"

const SEASON={
 [SEASON_SPRING]:"Printemps",
 [SEASON_SUMMER]:"Eté",
 [SEASON_AUTUMN]:"Automne",
 [SEASON_WINTER]:"Hiver",
}

// Default people count menus quantities
const MENU_PEOPLE_COUNT=2

// Diet activites
const DIET_ACTIVITY_COACHING="DIET_ACTIVITY_COACHING"
const DIET_ACTIVITY_VISIO="DIET_ACTIVITY_VISIO"
const DIET_ACTIVITY_SITE="DIET_ACTIVITY_SITE"

const DIET_ACTIVITIES={
 [DIET_ACTIVITY_COACHING]:"Coaching",
 [DIET_ACTIVITY_VISIO]:"En visio",
 [DIET_ACTIVITY_SITE]:"Intervention sur site",
}

const DIET_REGISTRATION_STATUS_PENDING="DIET_REGISTRATION_STATUS_PENDING"
const DIET_REGISTRATION_STATUS_REFUSED="DIET_REGISTRATION_STATUS_REFUSED"
const DIET_REGISTRATION_STATUS_VALID="DIET_REGISTRATION_STATUS_VALID"
const DIET_REGISTRATION_STATUS_ACTIVE="DIET_REGISTRATION_STATUS_ACTIVE"
const DIET_REGISTRATION_STATUS_TO_QUALIFY="DIET_REGISTRATION_STATUS_TO_QUALIFY"


const DIET_REGISTRATION_STATUS={
  [DIET_REGISTRATION_STATUS_PENDING]:"En cours",
  [DIET_REGISTRATION_STATUS_REFUSED]:"Refusé⋅e",
  [DIET_REGISTRATION_STATUS_VALID]:"Validé⋅e",
  [DIET_REGISTRATION_STATUS_ACTIVE]:"Actif",
  [DIET_REGISTRATION_STATUS_TO_QUALIFY]:"À valider",
}

const COACHING_MODE_STRICT="COACHING_MODE_STRICT"
const COACHING_MODE_REGULAR="COACHING_MODE_REGULAR"
const COACHING_MODE_COOL="COACHING_MODE_COOL"

const COACHING_MODE={
  [COACHING_MODE_STRICT]:"Strict",
  [COACHING_MODE_REGULAR]:"Normal",
  [COACHING_MODE_COOL]:"Cool",
}

const FOOD_DOCUMENT_TYPE_ARTICLE="FOOD_DOCUMENT_TYPE_ARTICLE"
const FOOD_DOCUMENT_TYPE_RECIPE="FOOD_DOCUMENT_TYPE_RECIPE"
const FOOD_DOCUMENT_TYPE_NUTRITION="FOOD_DOCUMENT_TYPE_NUTRITION"

const FOOD_DOCUMENT_TYPE={
  [FOOD_DOCUMENT_TYPE_ARTICLE]:"Article",
  [FOOD_DOCUMENT_TYPE_RECIPE]:"Recette",
  [FOOD_DOCUMENT_TYPE_NUTRITION]:"Fiche nutrition",
}

const QUIZZ_TYPE_LOGBOOK="QUIZZ_TYPE_LOGBOOK"
const QUIZZ_TYPE_PROGRESS="QUIZZ_TYPE_PROGRESS"
const QUIZZ_TYPE_PATIENT="QUIZZ_TYPE_PATIENT"
const QUIZZ_TYPE_ASSESSMENT="QUIZZ_TYPE_ASSESSMENT"
const QUIZZ_TYPE_IMPACT="QUIZZ_TYPE_IMPACT"

const QUIZZ_TYPE={
  [QUIZZ_TYPE_LOGBOOK]:'Journal',
  [QUIZZ_TYPE_PROGRESS]:'Progression coaching',
  [QUIZZ_TYPE_PATIENT]:'Quizz patient',
  [QUIZZ_TYPE_ASSESSMENT]:`Questionnaire bilan`,
  [QUIZZ_TYPE_IMPACT]:`Questionnaire impact`,
}

const QUIZZ_QUESTION_TYPE_BOOLEAN="QUIZZ_QUESTION_TYPE_BOOLEAN"
const QUIZZ_QUESTION_TYPE_SCALE_1_10="QUIZZ_QUESTION_TYPE_SCALE_1_10"
const QUIZZ_QUESTION_TYPE_TEXT="QUIZZ_QUESTION_TYPE_TEXT"
const QUIZZ_QUESTION_TYPE_DOCUMENT="QUIZZ_QUESTION_TYPE_DOCUMENT"
const QUIZZ_QUESTION_TYPE_NUMERIC="QUIZZ_QUESTION_TYPE_NUMERIC"
const QUIZZ_QUESTION_TYPE_ENUM_SINGLE="QUIZZ_QUESTION_TYPE_ENUM_SINGLE"
const QUIZZ_QUESTION_TYPE_ENUM_MULTIPLE="QUIZZ_QUESTION_TYPE_ENUM_MULTIPLE"
const QUIZZ_QUESTION_TYPE_TEXT_MULTIPLE="QUIZZ_QUESTION_TYPE_TEXT_MULTIPLE"

const QUIZZ_QUESTION_TYPE={
  [QUIZZ_QUESTION_TYPE_BOOLEAN]:"Vrai/faux",
  [QUIZZ_QUESTION_TYPE_SCALE_1_10]:"1 à 10",
  [QUIZZ_QUESTION_TYPE_TEXT]:"Texte libre",
  [QUIZZ_QUESTION_TYPE_DOCUMENT]:"Document",
  [QUIZZ_QUESTION_TYPE_NUMERIC]:"Numérique libre",
  [QUIZZ_QUESTION_TYPE_ENUM_SINGLE]: "QCM une réponse",
  [QUIZZ_QUESTION_TYPE_ENUM_MULTIPLE]: "QCM plusieurs réponses",
  [QUIZZ_QUESTION_TYPE_TEXT_MULTIPLE]: "Texte multiple",
}

// Diet's off days isoWeekDay'
const DIET_EXT_OFFDAYS=[7]

// Diet's off days isoWeekDay'
const DIET_EXT_HOUR_RANGE={min: 9, max:18}

const APPOINTMENT_PAST='APPOINTMENT_PAST'
const APPOINTMENT_TO_COME='APPOINTMENT_TO_COME'
const APPOINTMENT_CURRENT='APPOINTMENT_CURRENT'
const APPOINTMENT_VALIDATION_PENDING='APPOINTMENT_VALIDATION_PENDING'
const APPOINTMENT_VALID='APPOINTMENT_VALID'
const APPOINTMENT_RABBIT='APPOINTMENT_RABBIT'

const APPOINTMENT_STATUS={
  [APPOINTMENT_PAST]:'Passé',
  [APPOINTMENT_TO_COME]:'À venir',
  [APPOINTMENT_CURRENT]:'En cours',
  [APPOINTMENT_VALIDATION_PENDING]:'À valider', // moment()>end_date
  [APPOINTMENT_VALID]:'Validé', // moment()>end_date && at least one answer on progress quizz
  [APPOINTMENT_RABBIT]:'Lapin', // set by admin
  }

const MEAL_POSITION_STARTER="MEAL_POSITION_STARTER"
const MEAL_POSITION_DISH="MEAL_POSITION_DISH"
const MEAL_POSITION_DESSERT="MEAL_POSITION_DESSERT"

const MEAL_POSITION={
  [MEAL_POSITION_STARTER]:"Entrée",
  [MEAL_POSITION_DISH]:"Plat",
  [MEAL_POSITION_DESSERT]:"Dessert",
}

const ANSWER_STATUS_CORRECT="ANSWER_STATUS_CORRECT"
const ANSWER_STATUS_UNCORRECT="ANSWER_STATUS_UNCORRECT"

const ANSWER_STATUS={
  [ANSWER_STATUS_CORRECT]:"CORRECT",
  [ANSWER_STATUS_UNCORRECT]:"UNCORRECT",
}

// For company checking integrity:
// User did not entre code
const REGISTRATION_WARNING_CODE_MISSING="REGISTRATION_WARNING_CODE_MISSING"
// User is not known as a lead
const REGISTRATION_WARNING_LEAD_MISSING="REGISTRATION_WARNING_LEAD_MISSING"

const REGISTRATION_WARNING={
  [REGISTRATION_WARNING_CODE_MISSING]:"CODE_MISSING",
  [REGISTRATION_WARNING_LEAD_MISSING]:"LEAD_MISSING",
}

const DAYS_BEFORE_IND_CHALL_ANSWER=7

// Days today to diet availbilities end
const AVAILABILITIES_RANGE_DAYS=21

// Weight in kg
const MIN_WEIGHT=20
const MAX_WEIGHT=300

// Height in cm
const MIN_HEIGHT=30
const MAX_HEIGHT=300

const CALL_STATUS_TO_CALL="CALL_STATUS_TO_CALL"
const CALL_STATUS_CALL_1="CALL_STATUS_CALL_1"
const CALL_STATUS_CALL_2="CALL_STATUS_CALL_2"
const CALL_STATUS_CALL_3="CALL_STATUS_CALL_3"
const CALL_STATUS_RECALL="CALL_STATUS_RECALL"
const CALL_STATUS_UNREACHABLE="CALL_STATUS_UNREACHABLE"
const CALL_STATUS_TO_RENEW="CALL_STATUS_TO_RENEW"
const CALL_STATUS_NOT_INTERESTED="CALL_STATUS_NOT_INTERESTED"

const CALL_STATUS={
  [CALL_STATUS_TO_CALL]:"A contacter",
  [CALL_STATUS_CALL_1]:"Appel 1",
  [CALL_STATUS_CALL_2]:"Appel 2",
  [CALL_STATUS_CALL_3]:"Appel 3",
  [CALL_STATUS_RECALL]:"A rappeler",
  [CALL_STATUS_UNREACHABLE]:"Injoignable",
  [CALL_STATUS_TO_RENEW]:"A contacter renouvellement",
  [CALL_STATUS_NOT_INTERESTED]: "Non intéressé(e)",
}

const CALL_DIRECTION_IN_CALL="CALL_DIRECTION_IN_CALL"
const CALL_DIRECTION_OUT_CALL="CALL_DIRECTION_OUT_CALL"

const CALL_DIRECTION={
  [CALL_DIRECTION_IN_CALL]:"Appel entrant",
  [CALL_DIRECTION_OUT_CALL]:"Appel sortant",
}

const COACHING_CONVERSION_TO_COME="COACHING_CONVERSION_TO_COME"
const COACHING_CONVERSION_CONVERTED="COACHING_CONVERSION_CONVERTED"
const COACHING_CONVERSION_CANCELLED="COACHING_CONVERSION_CANCELLED"

const COACHING_CONVERSION_STATUS={
  [COACHING_CONVERSION_TO_COME]:"CAO à venir",
  [COACHING_CONVERSION_CONVERTED]:"CAO converti",
  [COACHING_CONVERSION_CANCELLED]:"CAO annulé",
}

const RECIPE_TYPE_RECIPE=`RECIPE_TYPE_RECIPE`
const RECIPE_TYPE_FAMILY=`RECIPE_TYPE_FAMILY`

const RECIPE_TYPE={
  [RECIPE_TYPE_RECIPE]:`Recette`,
  [RECIPE_TYPE_FAMILY]:`Famille d'aliments`,
}

const APPOINTMENT_TYPE_ASSESSMENT=`APPOINTMENT_TYPE_ASSESSMENT`
const APPOINTMENT_TYPE_FOLLOWUP=`APPOINTMENT_TYPE_FOLLOWUP`
const APPOINTMENT_TYPE_NUTRITION=`APPOINTMENT_TYPE_NUTRITION`

const APPOINTMENT_TYPE={
  [APPOINTMENT_TYPE_ASSESSMENT]:`Bilan`,
  [APPOINTMENT_TYPE_FOLLOWUP]:`Suivi`,
  [APPOINTMENT_TYPE_NUTRITION]:`Conseil nutritionnel`,
}

const COACHING_STATUS_NOT_STARTED=`COACHING_STATUS_NOT_STARTED`
const COACHING_STATUS_STARTED=`COACHING_STATUS_STARTED`
const COACHING_STATUS_FINISHED=`COACHING_STATUS_FINISHED`
const COACHING_STATUS_DROPPED=`COACHING_STATUS_DROPPED`
const COACHING_STATUS_STOPPED=`COACHING_STATUS_STOPPED`

const COACHING_STATUS={
  [COACHING_STATUS_NOT_STARTED]:`Non démarré`, // Not any appointment yet
  [COACHING_STATUS_STARTED]:`Démarré`, // At least one appointment
  [COACHING_STATUS_FINISHED]:`Terminé`, // No more credits
  [COACHING_STATUS_DROPPED]:`Abandonné`, // 3 months after a "rabbit" appointment
  [COACHING_STATUS_STOPPED]:`Arrêté`, // remaining credits 3 montyhs after the last appointment 
}

// End delay in months
const COACHING_END_DELAY=3

const TICKET_PRIORITY_CRITIQUE=1
const TICKET_PRIORITY_ELEVEE=2
const TICKET_PRIORITY_MOYENNE=3
const TICKET_PRIORITY_FAIBLE=4
const TICKET_PRIORITY_TRES_FAIBLE=5

const TICKET_PRIORITY={
  [TICKET_PRIORITY_CRITIQUE]:`Critique`,
  [TICKET_PRIORITY_ELEVEE]:`Élevée`,
  [TICKET_PRIORITY_MOYENNE]:`Moyenne`,
  [TICKET_PRIORITY_FAIBLE]:`Faible`,
  [TICKET_PRIORITY_TRES_FAIBLE]:`Très faible`,
}

const SOURCE_CALL=`SOURCE_CALL`
const SOURCE_APPLICATION=`SOURCE_APPLICATION`

const SOURCE={
  [SOURCE_CALL]:`CALL`,
  [SOURCE_APPLICATION]:`APPLICATION`,
}

const PASSWORD_PATTERN=/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{15,})/
const PASSWORD_PATTERN_STR='15 caractères minimum dont une majuscule, une minuscule, un chiffre et un caractère spécial'

module.exports={
  CONTENTS_TYPE,
  EVENT_TYPE,
  ROLES,
  GENDER,
  ACTIVITY,
  TARGET_TYPE,
  COMPANY_ACTIVITY,
  COMPANY_ACTIVITY_BANQUE,
  COMPANY_ACTIVITY_SERVICES_AUX_ENTREPRISES,
  COMPANY_ACTIVITY_ASSURANCE,
  ROLE_CUSTOMER, ROLE_ADMIN, ROLE_RH, ROLE_SUPER_ADMIN,
  SPOON_SOURCE,
  EVENT_DISCRIMINATOR,
  EVENT_COLL_CHALLENGE,
  EVENT_IND_CHALLENGE,
  EVENT_MENU,
  EVENT_WEBINAR,
  HARDNESS,
  NUTRISCORE,
  ECOSCORE,
  UNIT,
  PARTICULAR_COMPANY_NAME,
  SURVEY_ANSWER,
  DAYS,
  PERIOD,
  // TODO: how to export all SPOON_SOURCE keys in one line ?
  SPOON_SOURCE_INDIVIDUAL_CHALLENGE_PASSED,
  SPOON_SOURCE_CONTENT_LIKE,
  SPOON_SOURCE_CONTENT_READ,
  SPOON_SOURCE_CONTENT_PINNED,
  SPOON_SOURCE_GROUP_JOIN,
  SPOON_SOURCE_GROUP_MESSAGE,
  SPOON_SOURCE_GROUP_LIKE,
  SPOON_SOURCE_CONTENT_COMMENT,
  SPOON_SOURCE_INDIVIDUAL_CHALLENGE_PASSED,
  SPOON_SOURCE_INDIVIDUAL_CHALLENGE_ROUTINE,
  SPOON_SOURCE_MEASURE_CHEST,
  SPOON_SOURCE_MEASURE_WAIST,
  SPOON_SOURCE_MEASURE_HIPS,
  SPOON_SOURCE_MEASURE_THIGHS,
  SPOON_SOURCE_MEASURES_ARMS,
  SPOON_SOURCE_MEASURE_WEIGHT,
  SPOON_SOURCE_SURVEY_DONE,
  SPOON_SOURCE_SURVEY_PASSED,
  SPOON_SOURCE_WEBINAR_LIVE,
  SPOON_SOURCE_WEBINAR_REPLAY,
  CONTENTS_ARTICLE, CONTENTS_INFOGRAPHY, CONTENTS_VIDEO, CONTENTS_PODCAST,
  NO_CREDIT_AVAILABLE,
  COACHING_QUESTION_STATUS, 
  COACHING_QUESTION_STATUS_NOT_ADDRESSED, COACHING_QUESTION_STATUS_ACQUIRED, COACHING_QUESTION_STATUS_IN_PROGRESS, COACHING_QUESTION_STATUS_NOT_ACQUIRED,
  SEASON,
  MENU_PEOPLE_COUNT,
  DIET_ACTIVITIES,
  ROLE_EXTERNAL_DIET,
  DIET_REGISTRATION_STATUS, DIET_REGISTRATION_STATUS_TO_QUALIFY,
  COACHING_MODE,
  FOOD_DOCUMENT_TYPE,
  QUIZZ_TYPE,
  QUIZZ_QUESTION_TYPE,
  QUIZZ_QUESTION_TYPE_ENUM_SINGLE,
  QUIZZ_QUESTION_TYPE_ENUM_MULTIPLE,
  QUIZZ_QUESTION_TYPE_NUMERIC,
  QUIZZ_QUESTION_TYPE_TEXT,
  QUIZZ_TYPE_PATIENT,
  QUIZZ_TYPE_PROGRESS,
  DIET_EXT_OFFDAYS,
  DIET_EXT_HOUR_RANGE,
  QUIZZ_TYPE_LOGBOOK,
  QUIZZ_QUESTION_TYPE_TEXT_MULTIPLE,
  APPOINTMENT_STATUS, APPOINTMENT_PAST, APPOINTMENT_CURRENT, APPOINTMENT_TO_COME, APPOINTMENT_VALIDATION_PENDING, APPOINTMENT_VALID, APPOINTMENT_RABBIT,
  MEAL_POSITION,
  ANSWER_STATUS, ANSWER_STATUS_CORRECT, ANSWER_STATUS_UNCORRECT,
  REGISTRATION_WARNING, REGISTRATION_WARNING_CODE_MISSING, REGISTRATION_WARNING_LEAD_MISSING,
  DAYS_BEFORE_IND_CHALL_ANSWER,
  AVAILABILITIES_RANGE_DAYS,
  GENDER_MALE, GENDER_FEMALE, GENDER_NON_BINARY,
  TARGET_SPECIFICITY, TARGET_COACHING,
  QUIZZ_TYPE_ASSESSMENT, QUIZZ_TYPE_IMPACT,
  MIN_WEIGHT, MAX_WEIGHT, MIN_HEIGHT, MAX_HEIGHT,
  UNIT_CONVERSIONS,convertQuantity,
  CALL_STATUS, CALL_DIRECTION,ROLE_SUPPORT, CALL_STATUS_CALL_1, CALL_STATUS_TO_CALL,
  COACHING_CONVERSION_STATUS, 
  COACHING_CONVERSION_CANCELLED, COACHING_CONVERSION_CONVERTED, COACHING_CONVERSION_TO_COME,
  CALL_DIRECTION_IN_CALL, CALL_DIRECTION_OUT_CALL,
  DIET_REGISTRATION_STATUS_ACTIVE, COMPANY_ACTIVITY_OTHER,
  CONTENTS_ARTICLE, CONTENTS_DOCUMENT,
  RECIPE_TYPE, RECIPE_TYPE_FAMILY, RECIPE_TYPE_RECIPE, APPOINTMENT_TYPE, APPOINTMENT_TYPE_ASSESSMENT, APPOINTMENT_TYPE_FOLLOWUP,
  APPOINTMENT_TYPE_NUTRITION,
  COACHING_STATUS, COACHING_STATUS_NOT_STARTED, COACHING_STATUS_STARTED, COACHING_STATUS_FINISHED, COACHING_STATUS_STOPPED, COACHING_STATUS_DROPPED,
  COACHING_END_DELAY,
  DIET_REGISTRATION_STATUS_REFUSED, FOOD_DOCUMENT_TYPE_ARTICLE, FOOD_DOCUMENT_TYPE_NUTRITION, DIET_REGISTRATION_STATUS_PENDING,
  DIET_REGISTRATION_STATUS_VALID, TICKET_PRIORITY,
  SOURCE, SOURCE_APPLICATION, SOURCE_CALL,
  PASSWORD_PATTERN, PASSWORD_PATTERN_STR,
}
