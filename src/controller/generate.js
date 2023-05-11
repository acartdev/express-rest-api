const path = require('path')
const db = require('../models')
const fs = require('fs');
const controllerFile =(table)=>{
    const File = `const ${table}Service = require('../service/${table}.service')

    const crudRead = async (req, res) => {
        try {
          let ${table} = await ${table}Service.findAll();
          return res.status(200).json({
            error: false
            , data: ${table}
          });
        } catch (e) {
          return res.status(500).json({
            error: true
            , message:e
          });
        }
      }
      const crudReadSingle = async (req, res) => {
        try {
      
          let ${table} = await ${table}Service.findById(req.query.id);
          return res.status(200).json({
            error: false
            , data: ${table}
          });
        } catch (e) {
          return res.status(500).json({
            error: true
            , message:e
          });
        }
      }
      const crudAdd = async (req, res) => {
        try {
          
            const ${table} = await ${table}Service.createByObject(req.body);
            return res.status(201).json({
                error: true
              , data: ${table}
            });
          } catch (e) {
            return res.status(500).json({
              status: 500
              , message:e
            });
          }
      }
      const crudUpdate = async (req, res) => {
        try {
            let lastId = undefined
            const ${table} = await ${table}Service.updateByObject(req.body);
            if(${table}){
              for(let data of ${table}){
                lastId = data
              }
            }
            const response = await ${table}Service.findById(lastId)
          
            return res.status(201).json({
                error: false
              , data: response
            });
          } catch (e) {
            return res.status(500).json({
                error: true
              , message:e
            });
          }
      }
    
      const crudDelete = async (req, res) => {
        try {
          
            const ${table} = await ${table}Service.deleteById(req.query.ids);
            return res.status(201).json({
                error: false
              , message: "Delete Success!!"
            });
          } catch (e) {
            return res.status(500).json({
                error: true
              , message: e
            });
          }
      }
    
      module.exports = {
        crudRead,
        crudReadSingle,
        crudAdd,
        crudUpdate,
        crudDelete
        
      }`
    return File
}
const serviceFile = (table,pk)=>{
    const File = `const db = require('../models')
    const ${table} = db.${table}

    const findAll = async ()=>{
        return  await ${table}.findAll()
    }
    const findById = async (req)=>{
        return  await ${table}.findByPk(req)
    }
    const updateByObject = async (req={})=>{
        return  await ${table}.update(req,{where:{${pk}:req.id}})
    }
    const createByObject = async (req={})=>{
        
        return await ${table}.create(req);
    }
    const deleteById = async (req)=>{
        return await ${table}.destroy({where:{
            ${pk}:req
        }});
    }
    
    module.exports = {
        findAll,
        findById,
        createByObject,
        updateByObject,
        deleteById
    }`
    return File
}
const routeFile = (table)=>{
    const File = `
const ${table}Controller =  require('../src/controller/${table}.controller.js')

router.get('/${table}', ${table}Controller.crudRead);
router.get('/${table}ReadSingle', ${table}Controller.crudReadSingle);
router.post('/${table}', ${table}Controller.crudAdd);
router.put('/${table}', ${table}Controller.crudUpdate);
router.delete('/${table}', ${table}Controller.crudDelete); 

module.exports = router`
    return File
}

const generateTable = async(req,res)=>{
    try{
        const tableName = req.body.table
        let pk = ""
        let attr = []
        const Uper = String(tableName).charAt(0).toUpperCase()+String(tableName).slice(1)
        console.log(Uper)
        const table = await db.sequelize.query(`DESCRIBE ${tableName}`)
        table[0].forEach(element => {
            let subType = String(element.Type).substring(0,1)
            let type = ""
            if(element.Key == 'PRI'){
                pk = element.Field
            }
            switch (subType) {
                case "i":
                         type = 'integer'
                    break;
                case "v":
                         type = 'string'
                    break;
                case "d":
                         type = 'date'

                    break;
                default:
                    break;
            }
            if(element.Key != 'PRI'){
                attr.push(element.Field+":"+type)
            }
            });
            const directories = path.dirname(__dirname);
            fs.writeFileSync(__dirname+`\\${tableName}.controller.js`,controllerFile(tableName))
            fs.writeFileSync(directories+'\\service'+`\\${tableName}.service.js`,serviceFile(Uper,pk))
            fs.readFile(directories+'\\router.js','utf-8',(err,data)=>{
                const newVal = data.replace("module.exports = router",routeFile(tableName))
                fs.writeFileSync(directories+'\\router.js',newVal)
            })
           
            
        
        return res.json({
            model:`sequelize-cli model:generate --name ${Uper} --attributes ${attr}`
        });
    }catch(e){
        return res.status(500).json({
            status: 500
            , message: `Internal Server Error. ${e}`
          });
    }
}
module.exports= {generateTable}
