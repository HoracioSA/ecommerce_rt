'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
const Image = use('App/Models/Image')
const Helpers =use('Helpers')
const fs = use('fs')
const Transformer=use('App/Transformers/Admin/ImageTransformer')
const {manage_single_upload} = use('App/Helpers')
const {manage_multiple_upload} = use('App/Helpers')

/**
 * Resourceful controller for interacting with images
 */
class ImageController {
  /**
   * Show a list of all images.
   * GET images
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {TransformerWith} ctx.transform
   */
  async index ({response, pagination, transform }) {
    let images = await Image
    .query()
    .orderBy('id', 'DESC')
    .paginate(
      pagination.page, 
      pagination.limit)
      images = await transform.paginate(images, Transformer)
    return response.send(images)
  }

  /**
   * Create/save a new image.
   * POST images
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response, transform }) {
    try {
      const fileJar = request.file('images',{
        types:['image'],
        size:'2mb'
      })
      // return the image
      let images =[]
      // If single upload = manage_single_upload

      if (!fileJar.files) {
        const file = await manage_single_upload(fileJar) 
        if (file.moved()) {
          const image = await Image.create({
            path: file.fileName,
            size: file.size,
            original_name: file.clientName,
            extension: file.subtype
          })
          const transformImage= await transform.item(image, Transformer)
          images.push(transformImage)
          return response
          .status(201)
          .send({
            successes:images, 
            errors:{}
          })
        }
        return response.status(400).send({
          message:'Was not possible to process this image at moment'
        })
      }

      // If multiple upload = manage_multiple_upload
      let files =await manage_multiple_upload(fileJar)
      await Promise.all(
        files.successes.map(async file =>{
          const image = await Image.create({
            path: file.fileName,
            size:file.size,
            original_name: file.clientName,
            extension: file.subtype
          })
          const transformImage= await transform.item(image, Transformer)
          images.push(transformImage)
        })
      )
      return response.status(201).send({
        successes:images,
        errors:files.error
      })
    } catch (error) {
      return response.status(400).send({
        message:'Error in your multiple Upload'
      })
      
    }
  }

  /**
   * Display a single image.
   * GET images/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params:{id},response, transform }) {
    let image = await Image.findOrFail(id)
    image=await transform.item(image,Transformer)
    return response.send(image)
  }

  /**
   * Update image details.
   * PUT or PATCH images/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params:{id}, request, response, transform }) {
    var image=await Image.findOrFail(id)
    try {
      image.merge(request.only(['original_name']))
      await image.save()
      image=await transform.item(image,Transformer)
      return response.status(200).send(image)
    } catch (error) {
      return response.status(400).send({
        message:'Something wents wrong in update the name of image'
      })
    }
  }

  /**
   * Delete a image with id.
   * DELETE images/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params:{id}, request, response }) {
    const image = await Image.findOrFail(id)
    try {
      let filepath = Helpers.publicPath(`uploads/${image.path}`)
      fs.unlinkSync(filepath)
        await image.delete()  
      return response.status(204).send()
    } catch (error) {
      return response.status(400).send({
        message:'It was not possible to delete trhe image!'
      })
    }
  }
}

module.exports = ImageController
