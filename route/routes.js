const express = require('express');
const router = express.Router();

const multer = require("multer");
const fs = require("fs");
const path = require("path");


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      if (!fs.existsSync("public")) {
        fs.mkdirSync("public");
      }
  
      if (!fs.existsSync("public/csv")) {
        fs.mkdirSync("public/csv");
      }
  
      cb(null, "public/csv");
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + file.originalname);
    },
  });
  
  const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
      var ext = path.extname(file.originalname);
  
      if (ext !== ".csv" ) {
        return cb(new Error("Only csvs are allowed!"));
      }
      cb(null, true);
    },
  });

const { exportData, filterExportData, textExportData, text  , getAllexports, exportPagination, filtering } = require("../Controller/exportController")
const {imports , filterImortData, getDataByHsn, getAllImports, importPagination} = require('../Controller/importController');

router.post("/export", upload.single('csvFile'), exportData);
router.post("/import", upload.single('csvFile'), imports);


router.get('/export/filter', exportPagination)
router.get('/filter/export', text)



router.get('/import/filter', importPagination)
router.get('/getByHsn', getDataByHsn)
router.get('/import/getAllImport', getAllImports)


const {registerAUser , loginUser , updatedUser, getUser, logout } = require('../Controller/userController');
const { authMiddleware} = require("../middleware/authMiddleware")

router.post("/register", registerAUser)
router.post("/login", loginUser)

router.put("/updateUser", authMiddleware, updatedUser)
router.get('/user/:userId', authMiddleware, getUser)

router.post("/logout", logout)

module.exports=router   