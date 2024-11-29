const path=require('path')
const moment=require('moment')
const fs=require('fs')
const csv_parse = require('csv-parse/lib/sync')
const { getDatabaseUri } = require('../../config/config')
const mongoose = require('mongoose')
const Lead = require('../../server/models/Lead')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const { CALL_STATUS_MAPPING } = require('../../server/plugins/smartdiet/import')
const { CREATED_AT_ATTRIBUTE } = require('../../utils/consts')

const ROOT=path.join(__dirname, '../../tests/smartdiet/data/migration')
const LEADS_PATH=path.join(ROOT, 'smart_prospect.csv')

const TEST=1e8
// All appts not valid in import file having no progress must not be valid
const fixCallDatesFromMigrationFile = async () => {
  const contents=fs.readFileSync(LEADS_PATH).toString()
  let records=csv_parse(contents, {delimiter: ';', columns: true, })
  
  const generateBulk=r => ({
    updateOne: {
      filter: {migration_id: parseInt(r.SDPROSPECTID), _call_status_history: null},
      update: {
        $set: {
          call_date: moment(r.lastcall || r.created),
          _call_status_history: [{
            date: moment(r.lastcall || r.created),
            call_status: CALL_STATUS_MAPPING[r.status]
          }]
        }
      }
    }
  })
  const bulks=records.slice(0, TEST).map(generateBulk)
  console.log(bulks)
  await mongoose.connect(getDatabaseUri(), MONGOOSE_OPTIONS)
  const res=await Lead.bulkWrite(bulks)
  console.log(JSON.stringify(res, null, 2))
}

const updateCallDateFromHistory = async () => {
  const result = await Lead.updateMany(
    { _call_status_history: { $exists: true, $not: { $size: 0 } } }, // Filter documents with non-empty `_call_status_history`
    [
      {
        $set: {
          call_date: {
            $max: "$_call_status_history.date", // Set `call_date` to the latest date
          },
        },
      },
    ]
  );

  console.log(`${result.modifiedCount} documents updated.`);
}

const updateMissingCallStatusHistory = async () => {
  try {
    const result = await Lead.updateMany(
      {
        $or: [
          { _call_status_history: { $exists: false } }, // If `_call_status_history` does not exist
          { _call_status_history: { $size: 0 } },      // If `_call_status_history` exists but is empty
        ],
      },
      [
        {
          $set: {
            call_date: `$${CREATED_AT_ATTRIBUTE}`, 
            _call_status_history: [
              {
                date: `$${CREATED_AT_ATTRIBUTE}`,          // Use `creation_date` (assumes it is stored as `createdAt` by `schemaOptions`)
                call_status: "$call_status", // Use the existing `call_status` attribute
              },
            ],
          },
        },
      ]
    );

    console.log(`${result.modifiedCount} documents updated.`);
  } catch (err) {
    console.error("Error updating missing _call_status_history:", err);
  }
};

return fixCallDatesFromMigrationFile()
  .then(() => updateCallDateFromHistory())
  .then(() => updateMissingCallStatusHistory())
  .then(r => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1)
  })
