const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const importModel = require("../model/Import")

const imports = async (req, res) => {

    const totalRecords = [];
    try {
      console.log(path.join(__dirname, '../', '/public/csv/' + req.file.filename))
      fs.createReadStream(path.join(__dirname, '../', '/public/csv/' + req.file.filename))
        .pipe(csv.parse({ headers: true }))
        .on('error', error => console.error(error))
        .on('data', row => totalRecords.push(row)) //totalRecords.push(row)
        .on('end', async rowCount => {
          try {
            const users = await importModel.insertMany(totalRecords);
            res.json({ message: `Total ${rowCount} Data inserted successfully` });
          } catch (err) {
            res.status(400).json({ message: "Error while data uploading", err });
          }
        });
  
    } catch (error) {
      res.status(400).json(error)
    }
  };
  
  const filterImortData = async (req, res) => {
    try {
      let match = {}
      if (req.query.HSN_CODE) {
        match.HSN_CODE = new RegExp(req.query.HSN_CODE, "i")
      }
  
      if (req.query.HSN_CODE_DESCRIPTION) {
        match.HSN_CODE_DESCRIPTION = new RegExp(req.query.HSN_CODE_DESCRIPTION, "i")
      }
  
      if (req.query.EXPORTER_NAME) {
        match.EXPORTER_NAME = new RegExp(req.query.EXPORTER_NAME, "i")
      }
  
      const responce = await importModel.aggregate([{ $match: match }])
      return res.status(200).send({ status: true, total:responce.length, responce })
    }
    catch (err) {
      return res.status(500).send({ status: false, message: err.message })
    }
  }
  
  const getDataByHsn = async (req, res) => {
    try {
  
      let hsnIndex = await importModel.createIndexes({ HSN_CODE: 1 })
      console.log(`index created ${hsnIndex}`)
      // let HSN_CODE = req.params.HSN_CODE
      // console.log(HS_CODE);
      //const findData = await importModel.find({ HSN_CODE: HSN_CODE })
      
      // let query = { HSN_CODE: "54076190" }
      // const sort = { HSN_CODE: 1 }
  
      // const cursor = importModel.find(query).sort(sort)
      // return res.send(cursor)
    }
    catch (err) {
      return res.status(500).send({ status: false, message: err.message })
    }
  
  }
  
  const getAllImports = async function (req, res) {
    try {
        // filtering
        const queryObj = { ...req.query }
        const excludeFields = ["page" , "sort" , "limit" , "fields"]
        excludeFields.forEach((el)=>delete queryObj[el])
        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
        let query = importModel.find(JSON.parse(queryStr))
  
        // sorting
        // if(req.query.sort){
        //     const sortBy = req.query.sort.split(",").join(" ")
        //     query = query.sort(sortBy)
        // }else{
        //     query = query.sort("-createdAt")
        // }
        //  limiting the fields
        if(req.query.fields){
            const fields = req.query.fields.split(",").join(" ")
            query = query.select(fields)
        }else{
            query = query.select("-__v")
        }
        // pagination
        const page = req.query.page
        const limit = req.query.limit 
        // const limit = 20
        const skip = (page - 1)* limit
        query = query.skip(skip).limit(limit)
        if(req.query.page){
            const documentCount = await importModel.countDocuments()
            if(skip >= documentCount) return res.status(400).send({message: "This page dose not exist"})
        }
        
        const data = await query
        res.status(200).send({status:true, count: data?.length, data})
        
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
  }
  
  const importPagination = async (req, res) => {
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
  
      if (req.query.EXPORTER_NAME) {
        queryConditions.push({
            EXPORTER_NAME: { $regex: req.query.EXPORTER_NAME, $options: 'i' }
        });
      }
  
      if (queryConditions.length > 0) {
        filter.$or = queryConditions;
      }
  
      let page = req.query.page ;
      let limit = req.query.limit ;

      const count = await importModel.find(filter).count()
  
      const findData = await importModel
        .find(filter)
        .limit(limit * 1)
        .skip((page - 1) * limit);
        if(!findData.length ) return res.status(400).send({message: "No Data Found"})
  
      res.status(200).send({status: true, count: count, data: findData });
    } catch (err) {
      return res.status(500).send({ status: false, message: err.message });
    }
  };
  
  module.exports = { imports, filterImortData, getDataByHsn, getAllImports, importPagination }
  