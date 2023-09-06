const exportModel = require("../model/Export")
const Export = require("../model/Export")
const csv = require('fast-csv');
const fs = require('fs');
const path = require('path');


const exportData = async (req, res) => {
   
    const totalRecords = [];
    try {
      
      // console.log(path.join(__dirname, '../', '/public/csv/' + req.file.filename))
      console.log("huuu")
      fs.createReadStream(path.join(__dirname, '../', '/public/csv/' + req.file.filename))
        .pipe(csv.parse({ headers: true }))
        .on('error', error => console.error(error))
        .on('data', row => totalRecords.push(row))  //totalRecords.push(row)
        .on('end', async rowCount => {
          try {
            const users = await exportModel.insertMany(totalRecords);
            res.json({ message: `Total ${rowCount} Data inserted successfully` });
          } catch (err) {
            res.status(400).json({ message: "Error while data uploading", err });
          }
        });
    } catch (error) {
      res.status(400).json(error)
    }
  };
  
  
  
  const filterExportData = async (req, res) => {
    try {
      let match = {}
      if (req.query.HSN_CODE) {
        match.HSN_CODE = new RegExp(req.query.HSN_CODE, "i")
      }
  
      if (req.query.HSN_CODE_DESCRIPTION) {
        match.HSN_CODE_DESCRIPTION = new RegExp(req.query.HSN_CODE_DESCRIPTION, "i")
      }
  
      if (req.query.IMPORTER_NAME) {
        match.IMPORTER_NAME = new RegExp(req.query.IMPORTER_NAME, "i")
      }
  
      const page = parseInt(req.query.page)
     console.log(page)
  
      const limit = parseInt(req.query.limit) 
      console.log(limit)
  
      
      // const limit = 20
      const skip = (page - 1) * limit
  
      const responce = await exportModel.aggregate([{ $match: match }, {$skip: skip}, {$limit: limit}])
      return res.status(200).send({ status: true, total: responce.length, responce })
    }
    catch (err) {
      return res.status(500).send({ status: false, message: err.message })
    }
  }
  
  // const textExportData = async(req,res)=>{
  //   console.log("ho")
  //   // let text = req.query.text
  //   // console.log(text)
  //   // let data = await exportModel.find({ $text:{$search: text}})
  //   // return res.send(data)
  // }
  
  const text = async (req, res) => {
    let text = req.query.text
    console.log(text)
    let data = await exportModel.find({ $text: { $search: text } })
    return res.send({ total: data.length, data: data })
  }
  
  const getAllexports = async function (req, res) {
    try {
      // filtering
      const queryObj = { ...req.query }
      const excludeFields = ["page", "sort", "limit", "fields"]
      excludeFields.forEach((el) => delete queryObj[el])
      let queryStr = JSON.stringify(queryObj)
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
      let query = exportModel.find(JSON.parse(queryStr))
      console.log(query)
  
      // sorting
      // if(req.query.sort){
      //     const sortBy = req.query.sort.split(",").join(" ")
      //     query = query.sort(sortBy)
      // }else{
      //     query = query.sort("-createdAt")
      // }
      //  limiting the fields
      if (req.query.fields) {
        const fields = req.query.fields.split(",").join(" ")
        query = query.select(fields)
      } else {
        query = query.select("-__v")
      }
      // pagination
      const page = req.query.page
      const limit = req.query.limit
      // const limit = 20
      const skip = (page - 1) * limit
      query = query.skip(skip).limit(limit)
      if (req.query.page) {
        const documentCount = await exportModel.countDocuments()
        if (skip >= documentCount) return res.status(400).send({ message: "This page dose not exist" })
      }
  
      const data = await query
      res.status(200).send({ status: true, count: data.length, data })
  
    }
    catch (err) {
      return res.status(500).send({ status: false, message: err.message })
    }
  }
  
  const exportPageination = async (req, res) => {
    try {

        let filter = {}

      let HSN_CODE = ''
      if (req.query.HSN_CODE) {
        HSN_CODE = req.query.HSN_CODE
      }

      let HSN_CODE_DESCRIPTION = ''
      if (req.query.HSN_CODE_DESCRIPTION) {
        HSN_CODE_DESCRIPTION = req.query.HSN_CODE_DESCRIPTION
      }

      let IMPORTER_NAME = ''
      if (req.query.IMPORTER_NAME) {
        IMPORTER_NAME = req.query.IMPORTER_NAME
      }

      
  
      let page
      if (req.query.page) {
        page = req.query.page
      }
  
      let limit;
      if (req.query.limit) {
        limit = req.query.limit
      }
  
      const findData = await exportModel.find({
        $or: [
          { HSN_CODE: { $regex: '.*' + search + '.*', $options: 'i' } },
          { HSN_CODE_DESCRIPTION: { $regex: '.*' + search + '.*', $options: 'i' } },
          { IMPORTER_NAME: { $regex: '.*' + search + '.*', $options: 'i' } },
        ]
      }).limit(limit * 1).skip((page - 1) * limit)

      res.status(200).send({ count: findData.length, data: findData })
    }
    catch (err) {
      return res.status(500).send({ status: false, message: err.message })
    }
  }
  
  

  const exportPagination = async (req, res) => {
    try {
      let filter = {};
      let queryConditions = [];
  
      if (req.query.HSN_CODE) {
        queryConditions.push({
          HSN_CODE: { $regex: req.query.HSN_CODE, $options: 'i' }
        });
      }
  
      if (req.query.HSN_CODE_DESCRIPTION) {
        queryConditions.push({
          HSN_CODE_DESCRIPTION: { $regex: req.query.HSN_CODE_DESCRIPTION, $options: 'i' }
        });
      }
  
      if (req.query.IMPORTER_NAME) {
        queryConditions.push({
          IMPORTER_NAME: { $regex: req.query.IMPORTER_NAME, $options: 'i' }
        });
      }
  
      if (queryConditions.length > 0) {
        filter.$or = queryConditions;
      }
  
      let page = req.query.page ;
      let limit = req.query.limit ;
      console.log("hfhffh")
      const count = await exportModel.find(filter).count()
      console.log(count)

      const findData = await exportModel
        .find(filter)
        .limit(limit * 1)
        .skip((page - 1) * limit);
        if(!findData.length ) return res.status(400).send({message: "No Data Found"})
  
      res.status(200).send({ status: true,count: count, data: findData });
    } catch (err) {
      return res.status(500).send({ status: false, message: err.message });
    }
  };
  module.exports = { exportData, filterExportData, text, getAllexports ,  exportPagination}