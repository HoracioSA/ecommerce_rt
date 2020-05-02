'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
const Coupon = use('App/Models/Coupon')
const Database = use('Database')
const Service = use('App/Services/Coupon/CouponService')
/**
 * Resourceful controller for interacting with coupons
 */
class CouponController {
  /**
   * Show a list of all coupons.
   * GET coupons
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Object} ctx.pagination
   */
  async index ({ request, response, pagination }) {
    const code = request.input('code')
    const query = await Coupon.query()
    if (code) {
      query.where('code', 'ILIKE', `%${code}%`)
    }
    const coupons = await query.paginate(pagination.page, pagination.limit)
    return response.send(coupons)
  }

  /**
   * Create/save a new coupon.
   * POST coupons
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {
    const trx =await Database.beginTransaction()
    /**
     * 1- product = the coupon code can be used in a specific product
     * 2- clients = coupons can be used only for specific clients
     * 3- clients & product = can be used for specific client & product
     * 4- both of all = it can be used for any client & product
     */
    var can_use_for ={
      client:false,
      product:false
    }
    try {
      const couponData= request.
      only([
        'code',
        'discount',
        'valid_from',
        'valid_until',
        'type',
        'recuesive']) 
        const {users, products}=request.only(['users','products'])
        const coupon = await Coupon.create(couponData, trx)
        // Starts service layer
        const service = new Service(coupon, trx)
    } catch (error) {
      
    }
  }

  /**
   * Display a single coupon.
   * GET coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params:{id}, response, view }) {
    const coupon = await Coupon.findOrFail(id)
    return response.send(coupon)
  }

  /**
   * Update coupon details.
   * PUT or PATCH coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
  }

  /**
   * Delete a coupon with id.
   * DELETE coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params:{id}, response }) {
    const trx =await Database.beginTransaction()
    const coupon =await Coupon.findOrFail(id)
    try {
      await coupon.products().detach([], trx)
      await coupon.orders().detach([], trx)
      await coupon.users().detach([], trx)
      await coupon.delete(trx)
      await trx.commit()
      return response.status(204).send()
    } catch (error) {
      await trx.rollback()
      return response.status(400).send({
        message:'It was not possible to delete te coupon'
      })
    }
  }
}

module.exports = CouponController
