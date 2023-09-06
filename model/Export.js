const mongoose = require("mongoose");


const exportSchema = new mongoose.Schema({
  DATE: {
    type: String,
  },
  EXPORTER_NAME: {
    type: String,
  },
  EXPORTER_CITY_STATE: {
    type: String,
  },
  IMPORTER_NAME: {
    type: String,
  },
  COUNTRY_OF_DESTINATION: {
    type: String,
  },
  PORT_OF_DISCHARGE: {
    type: String,
  },
  HSN_CODE: {
    type: String,
  },
  HSN_CODE_DESCRIPTION: {
    type: String,
  },
  QUANTITY: {
    type: String,
  },
  UQC: {
    type: String,
  },
  INV_VALUE_FC: {
    type: String,
  },
  TOTAL_VALUE_FC: {
    type: String,
  },
  CURRENCY: {
    type: String,
  },
  
  PORT_OF_LOADING: {
    type: String,
  },
}, { timestamps: true })

exportSchema.index({HSN_CODE: "text", HSN_CODE_DESCRIPTION: "text", IMPORTER_NAME: "text"})

module.exports = mongoose.model('Export', exportSchema)
