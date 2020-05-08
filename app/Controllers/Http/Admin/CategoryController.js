'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
const Category = use('App/Models/Category')
/**
 * Resourceful controller for interacting with categories
 */
class CategoryController {
  /**
   * Show a list of all categories.
   * GET categories
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   * @param {object} ctx.pagination
   * 
   */
  async index ({ request, response, pagination }) {
    const title = request.input('title');
    let categories = [];
    // const search = await Category.query() 
    if (title) {
      categories = await Category
      .query()
      .where('title', 'ILIKE', `%${title}%`)
      .paginate(pagination.page, pagination.limit);
    } else {
      categories = await Category
      .query()
      .paginate(pagination.page, pagination.limit);
    }
    return response.send(categories);
  }

  /**
   * Render a form to be used for creating a new category.
   * GET categories/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async store ({ request, response }) {
    try {
      
    } catch (error) {
      return response.status(400).send({
        message:'Something wrong in storing the data'
      })
    }
    const {title, description, image_id}= request.all()
    const category=await Category.create({title, description, image_id})
    return response.status(201).send(category)
  }

  /**
   * Display a single category.
   * GET categories/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params:{id}, request, response, view }) {
    const category = await Category.findOrFail(id)
    return response.send(category)
  }

  /**
   * Render a form to update an existing category.
   * GET categories/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */

  async update ({ params:{id}, request, response }) {
    const category = await Category.findOrFail(id)
    const {title, description, image_id}= request.all()
    category.merge({title, description, image_id})
    await category.save()
    return response.send(category)
  }

  /**
   * Delete a category with id.
   * DELETE categories/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params:{id}, response }) {
    const category = await Category.findOrFail(id)
    await category.delete()
    return response.status(204).send()
  }
}

module.exports = CategoryController
