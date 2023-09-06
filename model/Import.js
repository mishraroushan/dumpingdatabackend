const mongoose = require("mongoose");


const importSchema = new mongoose.Schema({
    DATE: {
        type: String,
    },
    IMPORTER_NAME: {
        type: String,
    },
    IMPORTER_CITY_STATE: {
        type: String,
    },
    EXPORTER_NAME: {
        type: String,
    },
    COUNTRY_OF_ORIGIN: {
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
    UNT_PRICE_FC: {
        type: String,
    },
    INV_VALUE_FC: {
        type: String,
    },
    CURRENCY: {
        type: String,
    },
    PORT_OF_DISCHARGE : {
        type: String,
    },
}, { timestamps: true })

importSchema.index({HSN_CODE: "text", HSN_CODE_DESCRIPTION: "text", EXPORTER_NAME: "text"})

module.exports = mongoose.model('Import', importSchema)
