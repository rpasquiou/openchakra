const crypto = require('crypto')
const ALL_SERVICES = ['Tous les services', null]

const MODES={
  PRODUCTION: 'production',
  VALIDATION: 'validation',
  DEVELOPMENT: 'development',
  DEVELOPMENT_NOSSL: 'development_nossl',
}

const ALF_CONDS = { // my alfred condiitons
  BASIC: '0',
  PICTURE: '1',
  ID_CARD: '2',
  RECOMMEND: '3',
}

const CANCEL_MODE = {
  FLEXIBLE: '0',
  MODERATE: '1',
  STRICT: '2',
}

const CUSTOM_PRESTATIONS_FLTR = 'Prestations personnalisées'

const generate_id = () => {
  return crypto.randomBytes(20).toString('hex')
}

const GID_LEN = 40

const COMM_ALFRED = 0.0
const COMM_CLIENT = 0.18

const SIRET = {
  token: 'ca27811b-126c-35db-aaf0-49aea431706e',
  siretUrl: 'https://api.insee.fr/entreprises/sirene/V3/siret',
  sirenUrl: 'https://api.insee.fr/entreprises/sirene/V3/siren',
}

const ENTITES = {
  '1000': 'Entrepreneur individuel',
  '2110': 'Indivision entre personnes physiques',
  '2120': 'Indivision avec personne morale',
  '2210': 'Société créée de fait entre personnes physiques',
  '2220': 'Société créée de fait avec personne morale',
  '2310': 'Société en participation entre personnes physiques',
  '2320': 'Société en participation avec personne morale',
  '2385': 'Société en participation de professions libérales',
  '2400': 'Fiducie',
  '2700': 'Paroisse hors zone concordataire',
  '2900': 'Autre groupement de droit privé non doté de la personnalité morale',
  '3110': 'Représentation ou agence commerciale d\'état ou organisme public étranger immatriculé au RCS',
  '3120': 'Société commerciale étrangère immatriculée au RCS',
  '3205': 'Organisation internationale',
  '3210': 'État, collectivité ou établissement public étranger',
  '3220': 'Société étrangère non immatriculée au RCS',
  '3290': 'Autre personne morale de droit étranger',
  '4110': 'Établissement public national à caractère industriel ou commercial doté d\'un comptable public',
  '4120': 'Établissement public national à caractère industriel ou commercial non doté d\'un comptable public',
  '4130': 'Exploitant public',
  '4140': 'Établissement public local à caractère industriel ou commercial',
  '4150': 'Régie d\'une collectivité locale à caractère industriel ou commercial',
  '4160': 'Institution Banque de France',
  '5191': 'Société de caution mutuelle',
  '5192': 'Société coopérative de banque populaire',
  '5193': 'Caisse de crédit maritime mutuel',
  '5194': 'Caisse (fédérale) de crédit mutuel',
  '5195': 'Association coopérative inscrite (droit local Alsace Moselle)',
  '5196': 'Caisse d\'épargne et de prévoyance à forme coopérative',
  '5202': 'Société en nom collectif',
  '5203': 'Société en nom collectif coopérative',
  '5306': 'Société en commandite simple',
  '5307': 'Société en commandite simple coopérative',
  '5308': 'Société en commandite par actions',
  '5309': 'Société en commandite par actions coopérative',
  '5370': 'Société de Participations Financières de Profession Libérale Société en commandite par actions (SPFPL SCA)',
  '5385': 'Société d\'exercice libéral en commandite par actions',
  '5410': 'SARL nationale',
  '5415': 'SARL d\'économie mixte',
  '5422': 'SARL immobilière pour le commerce et l\'industrie (SICOMI)',
  '5426': 'SARL immobilière de gestion',
  '5430': 'SARL d\'aménagement foncier et d\'équipement rural (SAFER)',
  '5431': 'SARL mixte d\'intérêt agricole (SMIA)',
  '5432': 'SARL d\'intérêt collectif agricole (SICA)',
  '5442': 'SARL d\'attribution',
  '5443': 'SARL coopérative de construction',
  '5451': 'SARL coopérative de consommation',
  '5453': 'SARL coopérative artisanale',
  '5454': 'SARL coopérative d\'intérêt maritime',
  '5455': 'SARL coopérative de transport',
  '5458': 'SARL coopérative ouvrière de production (SCOP)',
  '5459': 'SARL union de sociétés coopératives',
  '5460': 'Autre SARL coopérative',
  '5470': 'Société de Participations Financières de Profession Libérale Société à responsabilité limitée (SPFPL SARL)',
  '5485': 'Société d\'exercice libéral à responsabilité limitée',
  '5498': 'SARL unipersonnelle',
  '5499': 'Société à responsabilité limitée (sans autre indication)',
  '5505': 'SA à participation ouvrière à conseil d\'administration',
  '5510': 'SA nationale à conseil d\'administration',
  '5515': 'SA d\'économie mixte à conseil d\'administration',
  '5520': 'Fonds à forme sociétale à conseil d\'administration',
  '5522': 'SA immobilière pour le commerce et l\'industrie (SICOMI) à conseil d\'administration',
  '5525': 'SA immobilière d\'investissement à conseil d\'administration',
  '5530': 'SA d\'aménagement foncier et d\'équipement rural (SAFER) à conseil d\'administration',
  '5531': 'Société anonyme mixte d\'intérêt agricole (SMIA) à conseil d\'administration',
  '5532': 'SA d\'intérêt collectif agricole (SICA) à conseil d\'administration',
  '5542': 'SA d\'attribution à conseil d\'administration',
  '5543': 'SA coopérative de construction à conseil d\'administration',
  '5546': 'SA de HLM à conseil d\'administration',
  '5547': 'SA coopérative de production de HLM à conseil d\'administration',
  '5548': 'SA de crédit immobilier à conseil d\'administration',
  '5551': 'SA coopérative de consommation à conseil d\'administration',
  '5552': 'SA coopérative de commerçants-détaillants à conseil d\'administration',
  '5553': 'SA coopérative artisanale à conseil d\'administration',
  '5554': 'SA coopérative (d\'intérêt) maritime à conseil d\'administration',
  '5555': 'SA coopérative de transport à conseil d\'administration',
  '5558': 'SA coopérative ouvrière de production (SCOP) à conseil d\'administration',
  '5559': 'SA union de sociétés coopératives à conseil d\'administration',
  '5560': 'Autre SA coopérative à conseil d\'administration',
  '5570': 'Société de Participations Financières de Profession Libérale Société anonyme à conseil d\'administration (SPFPL SA à conseil d\'administration)',
  '5585': 'Société d\'exercice libéral à forme anonyme à conseil d\'administration',
  '5599': 'SA à conseil d\'administration (s.a.i.)',
  '5605': 'SA à participation ouvrière à directoire',
  '5610': 'SA nationale à directoire',
  '5615': 'SA d\'économie mixte à directoire',
  '5620': 'Fonds à forme sociétale à directoire',
  '5622': 'SA immobilière pour le commerce et l\'industrie (SICOMI) à directoire',
  '5625': 'SA immobilière d\'investissement à directoire',
  '5630': 'Safer anonyme à directoire',
  '5631': 'SA mixte d\'intérêt agricole (SMIA)',
  '5632': 'SA d\'intérêt collectif agricole (SICA)',
  '5642': 'SA d\'attribution à directoire',
  '5643': 'SA coopérative de construction à directoire',
  '5646': 'SA de HLM à directoire',
  '5647': 'Société coopérative de production de HLM anonyme à directoire',
  '5648': 'SA de crédit immobilier à directoire',
  '5651': 'SA coopérative de consommation à directoire',
  '5652': 'SA coopérative de commerçants-détaillants à directoire',
  '5653': 'SA coopérative artisanale à directoire',
  '5654': 'SA coopérative d\'intérêt maritime à directoire',
  '5655': 'SA coopérative de transport à directoire',
  '5658': 'SA coopérative ouvrière de production (SCOP) à directoire',
  '5659': 'SA union de sociétés coopératives à directoire',
  '5660': 'Autre SA coopérative à directoire',
  '5670': 'Société de Participations Financières de Profession Libérale Société anonyme à Directoire (SPFPL SA à directoire)',
  '5685': 'Société d\'exercice libéral à forme anonyme à directoire',
  '5699': 'SA à directoire (s.a.i.)',
  '5710': 'SAS, société par actions simplifiée',
  '5720': 'Société par actions simplifiée à associé unique ou société par actions simplifiée unipersonnelle',
  '5770': 'Société de Participations Financières de Profession Libérale Société par actions simplifiée (SPFPL SAS)',
  '5785': 'Société d\'exercice libéral par action simplifiée',
  '5800': 'Société européenne',
  '6100': 'Caisse d\'Épargne et de Prévoyance',
  '6210': 'Groupement européen d\'intérêt économique (GEIE)',
  '6220': 'Groupement d\'intérêt économique (GIE)',
  '6316': 'Coopérative d\'utilisation de matériel agricole en commun (CUMA)',
  '6317': 'Société coopérative agricole',
  '6318': 'Union de sociétés coopératives agricoles',
  '6411': 'Société d\'assurance à forme mutuelle',
  '6511': 'Sociétés Interprofessionnelles de Soins Ambulatoires ',
  '6521': 'Société civile de placement collectif immobilier (SCPI)',
  '6532': 'Société civile d\'intérêt collectif agricole (SICA)',
  '6533': 'Groupement agricole d\'exploitation en commun (GAEC)',
  '6534': 'Groupement foncier agricole',
  '6535': 'Groupement agricole foncier',
  '6536': 'Groupement forestier',
  '6537': 'Groupement pastoral',
  '6538': 'Groupement foncier et rural',
  '6539': 'Société civile foncière',
  '6540': 'Société civile immobilière',
  '6541': 'Société civile immobilière de construction-vente',
  '6542': 'Société civile d\'attribution',
  '6543': 'Société civile coopérative de construction',
  '6544': 'Société civile immobilière d\' accession progressive à la propriété',
  '6551': 'Société civile coopérative de consommation',
  '6554': 'Société civile coopérative d\'intérêt maritime',
  '6558': 'Société civile coopérative entre médecins',
  '6560': 'Autre société civile coopérative',
  '6561': 'SCP d\'avocats',
  '6562': 'SCP d\'avocats aux conseils',
  '6563': 'SCP d\'avoués d\'appel',
  '6564': 'SCP d\'huissiers',
  '6565': 'SCP de notaires',
  '6566': 'SCP de commissaires-priseurs',
  '6567': 'SCP de greffiers de tribunal de commerce',
  '6568': 'SCP de conseils juridiques',
  '6569': 'SCP de commissaires aux comptes',
  '6571': 'SCP de médecins',
  '6572': 'SCP de dentistes',
  '6573': 'SCP d\'infirmiers',
  '6574': 'SCP de masseurs-kinésithérapeutes',
  '6575': 'SCP de directeurs de laboratoire d\'analyse médicale',
  '6576': 'SCP de vétérinaires',
  '6577': 'SCP de géomètres experts',
  '6578': 'SCP d\'architectes',
  '6585': 'Autre société civile professionnelle',
  '6588': 'Société civile laitière',
  '6589': 'Société civile de moyens',
  '6595': 'Caisse locale de crédit mutuel',
  '6596': 'Caisse de crédit agricole mutuel',
  '6597': 'Société civile d\'exploitation agricole',
  '6598': 'Exploitation agricole à responsabilité limitée',
  '6599': 'Autre société civile',
  '6901': 'Autre personne de droit privé inscrite au registre du commerce et des sociétés',
  '7111': 'Autorité constitutionnelle',
  '7112': 'Autorité administrative ou publique indépendante',
  '7113': 'Ministère',
  '7120': 'Service central d\'un ministère',
  '7150': 'Service du ministère de la Défense',
  '7160': 'Service déconcentré à compétence nationale d\'un ministère (hors Défense)',
  '7171': 'Service déconcentré de l\'État à compétence (inter) régionale',
  '7172': 'Service déconcentré de l\'État à compétence (inter) départementale',
  '7179': '(Autre) Service déconcentré de l\'État à compétence territoriale',
  '7190': 'Ecole nationale non dotée de la personnalité morale',
  '7210': 'Commune et commune nouvelle',
  '7220': 'Département',
  '7225': 'Collectivité et territoire d\'Outre Mer',
  '7229': '(Autre) Collectivité territoriale',
  '7230': 'Région',
  '7312': 'Commune associée et commune déléguée',
  '7313': 'Section de commune',
  '7314': 'Ensemble urbain',
  '7321': 'Association syndicale autorisée',
  '7322': 'Association foncière urbaine',
  '7323': 'Association foncière de remembrement',
  '7331': 'Établissement public local d\'enseignement',
  '7340': 'Pôle métropolitain',
  '7341': 'Secteur de commune',
  '7342': 'District urbain',
  '7343': 'Communauté urbaine',
  '7344': 'Métropole',
  '7345': 'Syndicat intercommunal à vocation multiple (SIVOM)',
  '7346': 'Communauté de communes',
  '7347': 'Communauté de villes',
  '7348': 'Communauté d\'agglomération',
  '7349': 'Autre établissement public local de coopération non spécialisé ou entente',
  '7351': 'Institution interdépartementale ou entente',
  '7352': 'Institution interrégionale ou entente',
  '7353': 'Syndicat intercommunal à vocation unique (SIVU)',
  '7354': 'Syndicat mixte fermé',
  '7355': 'Syndicat mixte ouvert',
  '7356': 'Commission syndicale pour la gestion des biens indivis des communes',
  '7357': 'Pôle d\'équilibre territorial et rural (PETR)',
  '7361': 'Centre communal d\'action sociale',
  '7362': 'Caisse des écoles',
  '7363': 'Caisse de crédit municipal',
  '7364': 'Établissement d\'hospitalisation',
  '7365': 'Syndicat inter hospitalier',
  '7366': 'Établissement public local social et médico-social',
  '7367': 'Centre Intercommunal d\'action sociale (CIAS)',
  '7371': 'Office public d\'habitation à loyer modéré (OPHLM)',
  '7372': 'Service départemental d\'incendie et de secours (SDIS)',
  '7373': 'Établissement public local culturel',
  '7378': 'Régie d\'une collectivité locale à caractère administratif',
  '7379': '(Autre) Établissement public administratif local',
  '7381': 'Organisme consulaire',
  '7382': 'Établissement public national ayant fonction d\'administration centrale',
  '7383': 'Établissement public national à caractère scientifique culturel et professionnel',
  '7384': 'Autre établissement public national d\'enseignement',
  '7385': 'Autre établissement public national administratif à compétence territoriale limitée',
  '7389': 'Établissement public national à caractère administratif',
  '7410': 'Groupement d\'intérêt public (GIP)',
  '7430': 'Établissement public des cultes d\'Alsace-Lorraine',
  '7450': 'Etablissement public administratif, cercle et foyer dans les armées',
  '7470': 'Groupement de coopération sanitaire à gestion publique',
  '7490': 'Autre personne morale de droit administratif',
  '8110': 'Régime général de la Sécurité Sociale',
  '8120': 'Régime spécial de Sécurité Sociale',
  '8130': 'Institution de retraite complémentaire',
  '8140': 'Mutualité sociale agricole',
  '8150': 'Régime maladie des non-salariés non agricoles',
  '8160': 'Régime vieillesse ne dépendant pas du régime général de la Sécurité Sociale',
  '8170': 'Régime d\'assurance chômage',
  '8190': 'Autre régime de prévoyance sociale',
  '8210': 'Mutuelle',
  '8250': 'Assurance mutuelle agricole',
  '8290': 'Autre organisme mutualiste',
  '8310': 'Comité central d\'entreprise',
  '8311': 'Comité d\'établissement',
  '8410': 'Syndicat de salariés',
  '8420': 'Syndicat patronal',
  '8450': 'Ordre professionnel ou assimilé',
  '8470': 'Centre technique industriel ou comité professionnel du développement économique',
  '8490': 'Autre organisme professionnel',
  '8510': 'Institution de prévoyance',
  '8520': 'Institution de retraite supplémentaire',
  '9110': 'Syndicat de copropriété',
  '9150': 'Association syndicale libre',
  '9210': 'Association non déclarée',
  '9220': 'Association déclarée',
  '9221': 'Association déclarée d\'insertion par l\'économique',
  '9222': 'Association intermédiaire',
  '9223': 'Groupement d\'employeurs',
  '9224': 'Association d\'avocats à responsabilité professionnelle individuelle',
  '9230': 'Association déclarée, reconnue d\'utilité publique',
  '9240': 'Congrégation',
  '9260': 'Association de droit local (Bas-Rhin, Haut-Rhin et Moselle)',
  '9300': 'Fondation',
  '9900': 'Autre personne morale de droit privé',
  '9970': 'Groupement de coopération sanitaire à gestion privée',
}

const CESU = ['Mandatory', 'Optional', 'Disabled']

const GOOGLE_PROVIDER = 'google'
const FACEBOOK_PROVIDER = 'facebook'

const AMAZON_HOST='my-alfred.io'
const LOCAL_HOST='sebhd.freeboxos.fr'

const SKILLS={
  careful: {
    label: 'Travail soigneux',
    picture: 'careful_work',
    entrieName: 'careful',
  },
  punctual: {
    label: 'Ponctualité',
    picture: 'punctuality',
    entrieName: 'punctual',
  },
  flexible: {
    label: 'Flexibilité',
    picture: 'flexibility',
    entrieName: 'flexible',
  },
  reactive: {
    label: 'Réactivité',
    picture: 'reactivity',
    entrieName: 'reactive',
  },
}

const LANGUAGES= [
  {value: 'Français', label: 'Français'},
  {value: 'LSF', label: 'LSF'},
  {value: 'Anglais', label: 'Anglais'},
  {value: 'Allemand', label: 'Allemand'},
  {value: 'Espagnol', label: 'Espagnol'},
  {value: 'Chinois', label: 'Chinois'},
  {value: 'Arabe', label: 'Arabe'},
  {value: 'Portugais', label: 'Portugais'},
  {value: 'Russe', label: 'Russe'},
  {value: 'Japonais', label: 'Japonais'},
]

const MAX_DESCRIPTION_LENGTH=300

const BOOK_STATUS= {
  CONFIRMED: 'Confirmée',
  REFUSED: 'Refusée',
  CANCELED: 'Annulée',
  FINISHED: 'Terminée',
  EXPIRED: 'Expirée',
  TO_CONFIRM: 'En attente de confirmation',
  TO_PAY: 'En attente de paiement',
  INFO: "Demande d'infos",
  PREAPPROVED: 'Pré-approuvée',
}

// Délai d'expiration des réservatins (jours après création de la résa)
const EXPIRATION_DELAY=7

// Fermeture auto notificaitons nack en secondes
const CLOSE_NOTIFICATION_DELAY=3

// Fermeture $age minimum inscription
const ACCOUNT_MIN_AGE = 18

const COMPANY_SIZE= {
  'MICRO': '<10', // Micro-entreprise
  'PMEPMI': '>10 <250', // PME/PMI
  'ETI': '>250 <5000', // Micro-entreprise
  'GRANDE': '>5000', // Grande entreprise
}

const COMPANY_ACTIVITY = {
  'ADM': 'Administration, fonction publique',
  'AGRO': 'Agroalimentaire',
  'ART': "Artisanat d'art",
  'ASSO': 'Associations',
  'BAN': 'Banques, assurances, services financiers',
  'CHIM': 'Chimie, plastique, conditionnement',
  'DET': 'Commerce de détail, grande distribution',
  'COMM': 'Communication, marketing, information',
  'CONSTR': 'Construction, bâtiment, travaux publics',
  'CULT': 'Culture, sports, loisirs',
  'ENER': 'Energie',
  'ENS': 'Enseignement, formation',
  'ENV': "Environnement, récupération, tri, recyclage, traitement des déchets, matériaux, de l'eau",
  'EQUIP': 'Equipement, matériel pour activités professionnelles',
  'FAB': "Fabrication, commerce de gros d'articles destinés à la vente",
  'GESTION': 'Gestion, administration des entreprises',
  'HOTEL': 'Hôtellerie, restauration, tourisme',
  'IMMO': 'Immobilier',
  'TEXT': 'Industrie textile',
  'INFO': 'Informatique',
  'ING': "Ingénieurs d'études et de recherche, chercheurs",
  'LOGIS': 'Logistique, transports',
  'ELECTRO': 'Matériel électrique, électronique, optique',
  'MECA': 'Mécanique, métallurgie',
  'SIDER': 'Minerais, minéraux, sidérurgie',
  'JURI': 'Professions juridiques',
  'SANTE': 'Santé, action sociale',
  'SERVICE': 'Services aux particuliers, collectivités, entreprises',
}

const ADMIN='ADMIN'
const MANAGER='MANAGER'
const EMPLOYEE='EMPLOYEE'

const ROLES = {
  ADMIN: 'Administrateur',
  MANAGER: 'Manager',
  EMPLOYEE: 'Collaborateur',
}

const MONTH_PERIOD='MONTHLY'
const YEAR_PERIOD='ANNUALY'

const BUDGET_PERIOD = {
  [ MONTH_PERIOD ]: 'Mois',
  [ YEAR_PERIOD ]: 'An',
}

const PRO='professional'
const PART='particular'

const CREASHOP_MODE={
  CREATION: 'creation',
  SERVICE_ADD: 'add',
  SERVICE_UPDATE: 'edit',
}

const REGISTER_MODE={
  COMPLETE: 'fullRegister',
  INCOMPLETE: 'setAlfredRegister',
}

const MICROSERVICE_MODE='MICROSERVICE'
const CARETAKER_MODE='CARETAKER'

const DASHBOARD_MODE ={
  [ MICROSERVICE_MODE ]: 'microservice',
  [ CARETAKER_MODE ]: 'conciergerie',
}

const PEND_EMPLOYEE_REGISTER='PEND_EMPLOYEE_REGISTER'
const PEND_ALFRED_PRO_REGISTER='PEND_ALFRED_PRO_REGISTER'

const PENDING_REASONS= {
  [ PEND_EMPLOYEE_REGISTER ]: 'Inscription employé',
  [ PEND_ALFRED_PRO_REGISTER ]: 'Inscription Alfred',
}

module.exports = {
  ALL_SERVICES, ALF_CONDS, CANCEL_MODE, CUSTOM_PRESTATIONS_FLTR,
  generate_id, COMM_ALFRED, COMM_CLIENT, GID_LEN, ENTITES, CESU,
  MODES, GOOGLE_PROVIDER, FACEBOOK_PROVIDER, AMAZON_HOST, LOCAL_HOST,
  SKILLS, LANGUAGES, MAX_DESCRIPTION_LENGTH, BOOK_STATUS, EXPIRATION_DELAY,
  CLOSE_NOTIFICATION_DELAY, ACCOUNT_MIN_AGE, COMPANY_SIZE, COMPANY_ACTIVITY,
  ADMIN, MANAGER, EMPLOYEE, ROLES, BUDGET_PERIOD, PRO, PART, CREASHOP_MODE,
  MONTH_PERIOD, YEAR_PERIOD, DASHBOARD_MODE, MICROSERVICE_MODE, CARETAKER_MODE, REGISTER_MODE,
}
