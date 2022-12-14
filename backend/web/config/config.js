const isEmpty = require("../server/validation/is-empty");
const {
  MODE,
  TAWKTO_URL,
  DISABLE_ALFRED_SELF_REGISTER,
  DISABLE_ALFRED_PARTICULAR_REGISTER,
  SIB_TEMPLATES,
  DATABASE_NAME,
  HIDE_STORE_DIALOG,
  SITE_MODE,
  SIB_APIKEY,
  DATA_MODEL,
  SKIP_FAILED_PAYMENT,
  HOSTNAME,
  PORT,
  MONO_PROVIDER,
  PRODUCTION_ROOT,
  PRODUCTION_PORT
} = require("../mode");

const SITE_MODES = {
  MARKETPLACE: "marketplace",
  PLATFORM: "platform"
};

const MODES = {
  PRODUCTION: "production",
  VALIDATION: "validation",
  DEVELOPMENT: "development",
  DEVELOPMENT_NOSSL: "development_nossl"
};

const get_mode = () => {
  if (!Object.values(MODES).includes(MODE)) {
    console.error(
      `Incorrect startup mode ${MODE}, expecting ${Object.values(MODES)}`
    );
    process.exit(-1);
  }
  return MODE;
};

const is_production = () => {
  return get_mode() == MODES.PRODUCTION;
};

const is_validation = () => {
  return get_mode() == MODES.VALIDATION;
};

const is_development = () => {
  return (
    get_mode() == MODES.DEVELOPMENT || get_mode() == MODES.DEVELOPMENT_NOSSL
  );
};

const getProductionRoot = () => {
  return PRODUCTION_ROOT;
};

const getProductionPort = () => {
  return PRODUCTION_PORT;
};

const MONGO_BASE_URI = "mongodb://localhost/";

const getChatURL = () => {
  return TAWKTO_URL;
};

const getHostName = () => {
  if (is_development()) {
    return HOSTNAME || "localhost";
  }
  if (!HOSTNAME) {
    throw new Error(`HOSTNAME config missing`);
  }
  return HOSTNAME;
};

const getPort = () => {
  if (is_validation() && isNaN(parseInt(PORT))) {
    throw new Error(`PORT config missing or not an integer`);
  }
  return PORT || 443;
};

const mustDisplayChat = () => {
  return Boolean(TAWKTO_URL);
};

const is_development_nossl = () => {
  return get_mode() == MODES.DEVELOPMENT_NOSSL;
};

const isPlatform = () => {
  return SITE_MODE == SITE_MODES.PLATFORM;
};

const isMarketplace = () => {
  return SITE_MODE == SITE_MODES.MARKETPLACE;
};

const isMonoProvider = () => {
  return MONO_PROVIDER;
};

const appName = "myalfred";

const databaseName = DATABASE_NAME;
const serverPort = process.env.PORT || 3122;

const SERVER_PROD = is_production() || is_development();

const ENABLE_MAILING = is_production();

const getHostUrl = () => {
  const protocol = "https";
  const hostname = getHostName();
  const port = getPort();
  const includePort =
    (protocol == "https" && port != 443) || (protocol == "http" && port != 80);
  const host_url = `${protocol}://${hostname}${includePort ? `:${port}` : ""}/`;
  return host_url;
};

const completeConfig = {
  default: {
    appName,
    serverPort,
    databaseUrl:
      process.env.MONGODB_URI || `mongodb://localhost/${databaseName}`,
    jsonOptions: {
      headers: {
        "Content-Type": "application/json"
      }
    }
  }
};

const SIRET = {
  token: "ca27811b-126c-35db-aaf0-49aea431706e",
  siretUrl: "https://api.insee.fr/entreprises/sirene/V3/siret",
  sirenUrl: "https://api.insee.fr/entreprises/sirene/V3/siren"
};

const getSibApiKey = () => {
  return SIB_APIKEY;
};

const canAlfredSelfRegister = () => {
  return !isMonoProvider() && !DISABLE_ALFRED_SELF_REGISTER;
};

const canAlfredParticularRegister = () => {
  return !isMonoProvider() && !DISABLE_ALFRED_PARTICULAR_REGISTER;
};

const displayConfig = () => {
  console.log(`Configuration is:\n\
\tMode:${get_mode()}\n\
\tProduction root:${getProductionRoot()}\n\
\tSite mode:${
    isPlatform() ? "plateforme" : isMarketplace() ? "marketplace" : "inconnu"
  }\n\
\tDatabase:${databaseName}\n\
\tData model:${DATA_MODEL}\n\
\tServer prod:${SERVER_PROD}\n\
\tServer port:${getPort()}\n\
\tHost URL:${getHostUrl()}\n\
\tDisplay chat:${mustDisplayChat()} ${mustDisplayChat() ? getChatURL() : ""}\n\
\tSendInBlue actif:${ENABLE_MAILING}\n\
\tSendInBlue templates:${DATA_MODEL}\n\
`);
};

const checkConfig = () => {
  return new Promise((resolve, reject) => {
    if (!Object.values(MODES).includes(MODE)) {
      reject(
        `MODE: ${MODE} inconnu, attendu ${JSON.stringiffy(
          Object.values(MODES)
        )}`
      );
    }
    if (!Object.values(SITE_MODES).includes(SITE_MODE)) {
      reject(
        `SITE_MODE: ${SITE_MODE} inconnu, attendu ${JSON.stringify(
          Object.values(SITE_MODES)
        )}`
      );
    }

    if (!is_development() && !HOSTNAME) {
      reject(`HOSTNAME: obligatoire en mode ${MODE}`);
    }

    if (is_validation() && isNaN(parseInt(PORT))) {
      reject(`PORT: obligatoire en mode ${MODE}`);
    }

    if (isEmpty(DATABASE_NAME)) {
      reject(`DATABASE_NAME non renseigné`);
    }
    if (isEmpty(PRODUCTION_ROOT)) {
      reject(`PRODUCTION_ROOT non renseigné`);
    }
    if (isEmpty(PRODUCTION_PORT)) {
      reject(`PRODUCTION_PORT non renseigné`);
    }
    // Deprecated
    if (SIB_TEMPLATES) {
      console.warn(
        `** deprecated SIB_TEMPLATE, using DATA_MODEL instead:remove it in configuration file`
      );
    }
    // TODO check database name correctness
    if (isEmpty(SIB_APIKEY)) {
      reject(`SIB_APIKEY non renseigné`);
    }
    if (isEmpty(DATA_MODEL)) {
      reject(`DATA_MODEL non renseigné`);
    }
    if (isEmpty(SIB_APIKEY)) {
      reject(`SIB_APIKEY non renseigné`);
    }
    displayConfig();
    resolve("Configuration OK");
  });
};

const getDatabaseUri = () => {
  return `${MONGO_BASE_URI}${DATABASE_NAME}`;
};

const getDataModel = () => {
  return DATA_MODEL;
};

// Hide application installation popup
const hideStoreDialog = () => {
  return !!HIDE_STORE_DIALOG;
};

/**
ONLY DEV & VALIDATION MODES
Consider failed payment succeeded
*/
const skipFailedPayment = () => {
  return !is_production() && !!SKIP_FAILED_PAYMENT;
};

// DEV mode: allow https without certificate
if (is_development()) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

// FTP direcctory for incoming data
const getExchangeDirectory = () => {
  if (is_development()) {
    return "/home/seb/test";
  }
  return "/home/feurst_ftp/www";
};
const RANDOM_ID = new Date().getTime();

const DOC_PATH = `/static/assets/docs/${getDataModel()}`;
const CGV_PATH = `${DOC_PATH}/cgv.pdf`;
// CGV expires afeter. If null, does never expire
const CGV_EXPIRATION_DELAY = 365;

const bookingUrl = (serviceUserId, extraParams = {}) => {
  let params = new URLSearchParams();
  let url = null;
  if (getDataModel() == "aftral") {
    url = `/training/${serviceUserId}`;
  } else {
    url = "/userServicePreview";
    params.append("id", serviceUserId);
  }
  Object.entries(extraParams).forEach(([key, value]) => {
    params.append(key, value);
  });
  if ([...params].length > 0) {
    url = `${url}?${params.toString()}`;
  }
  return url;
};

// Public API
module.exports = {
  databaseName: databaseName,
  config: {
    ...completeConfig.default,
    ...completeConfig[process.env.NODE_ENV]
  },
  completeConfig,
  SIRET,
  is_production,
  is_validation,
  is_development,
  is_development_nossl,
  SERVER_PROD,
  getHostUrl,
  ENABLE_MAILING,
  mustDisplayChat,
  getChatURL,
  canAlfredSelfRegister,
  canAlfredParticularRegister,
  checkConfig,
  getDatabaseUri,
  hideStoreDialog,
  isPlatform,
  isMarketplace,
  isMonoProvider,
  getDataModel,
  skipFailedPayment,
  getSibApiKey,
  getPort,
  getExchangeDirectory,
  RANDOM_ID,
  displayConfig,
  DOC_PATH,
  CGV_PATH,
  CGV_EXPIRATION_DELAY,
  bookingUrl,
  getProductionRoot,
  getProductionPort
};
