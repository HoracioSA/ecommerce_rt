'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with products
 */
const Product = use('App/Models/Product')
class ProductController {
  /**
   * Show a list of all products.
   * GET products
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   * @param {object} ctx.pagination
   */
  async index ({ request, response, pagination}) {
    const name = request.input('name')
    const search = await Product.query()
    if (name) {
      search.where('name', 'ILIKE', `%${name}%`)

    }
    const products = await search.paginate(pagination.page, pagination.limit)
    return response.send(products)
  }

  /**
   * Create/save a new product.
   * POST products
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {
    try {
      
      const {name, image_id, description, price}= request.all()
      const products =await Product.create({name, image_id, description, price})
      return response.status(201).send(products)
    } catch (error) {
      return response.status(400).send({
        message:'Something wrong in storing the data'
      })
      
    }
  }


  /**
   * Display a single product.
   * GET products/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params:{id}, response,}) {
    const product = await Product.findOrFail(id)
    return response.send(product)
  }

  /**
   * Update product details.
   * PUT or PATCH products/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params:{id}, request, response }) {
    const product = await Product.findOrFail(id)
    const {name, image_id, description, price}= request.all()
    product.merge({name,image_id, description, price})
    await product.save()
    return response.send(product)

  }

  /**
   * Delete a product with id.
   * DELETE products/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params:{id}, response }) {

    const product = await Product.findOrFail(id)
    try {
      await product.delete()
      return response.status(204).send()
    } catch (error) {
      return response.status(500).send({
        message:'Something was wrong for deleting tis product'
      })
    }
  }
}

module.exports = ProductController
