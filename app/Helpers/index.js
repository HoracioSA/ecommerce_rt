'use strict'
const crypto = use('crypto')
const Helpers= use('Helpers')

/**
 * Generate a random string
 * @param {int} length : the length of the string
 * @return {string} the random string  
 */

 const str_random = async (length = 40)=>{
     let string =''
     let len = string.length
     if (len < length) {
         let size = length - len
         let bytes = await crypto.randomBytes(size)
         let buffer = Buffer.from(bytes)
         string += buffer
         .toString('base64')
         .replace(/[^a-zA-Z0-9]/g, '')
         .substr(0, size)

     }
     return string
 }
 /**
  * Move the single created file to the specified path
  * The path 'public/uploads' will be used 
  * @param {FileJar} file the file being generated
  * @param {String} path   
  * @return {Object<FileJar>}
  */
    const manage_single_upload = async(file, path =null)=>{
        path = path ? path: Helpers.publicPath('uploads')
        // generate a random name for the file
        const random_name = await str_random(30)
        let filename =`${new Date().getTime()}-${str_random}.${file.subtype}`

        //It renames the file and move to the path
        await file.move(path,{
            name: filename
        })
        return file
    }
/**
  * Move the multiple created file to the specified path
  * The path 'public/uploads' will be used 
  * @param {FileJar} fileJar the file being generated
  * @param {String} path 
  * @return {Object}   
  */
 const manage_multiple_upload = async (fileJar, path =null)=>{
    path = path ? path:Helpers.publicPath('uploads')
    let successes =[], 
        errors=[]
        await Promise.all(fileJar.files.map(async file =>{
            let random_name = await str_random(30)
        let filename =`${new Date().getTime()}-${random_name}.${file.subtype}`
            await file.move(path,{
                name: filename
            })
            if (file.moved()) {
                successes.push(file)
            }else{
                errors.push(file.error())
            }
        }))
        return (successes, errors)
 }
 module.exports={
str_random,
manage_single_upload,
manage_multiple_upload
 }