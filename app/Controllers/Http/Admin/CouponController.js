'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
const Coupon = use('App/Models/Coupon')
const Database = use('Database')
const Service = use('App/Services/Coupon/CouponService')
const Transformer = use('App/Transformers/Admin/CouponsTransformer')

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
  async index ({ request, response, pagination, transform }) {
    const code = request.input('code')
    const query = await Coupon.query()
    if (code) {
      query.where('code', 'ILIKE', `%${code}%`)
    }
    let coupons = await query.paginate(pagination.page, pagination.limit)
    coupons = await transform.paginate(coupons, Transformer)
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
  async store ({ request, response, transform }) {
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
        var coupon = await Coupon.create(couponData, trx)
        // Starts service layer
        const service = new Service(coupon, trx)
        // To insert the relation on DB
        if (users && users.length >0) {
          await service.syncUsers(users)
          can_use_for.client= true
        }
        if (products && products.length >0) {
          await service.syncProducts(products)
          can_use_for.product= true
        }
        if (can_use_for.product && can_use_for.client) {
          coupon.can_use_for = 'product_client'
        }else if(can_use_for.product && !can_use_for.client){
          coupon.can_use_for= 'product'
        }else if (!can_use_for.product && can_use_for.client){
          coupon.can_use_for='client'
        } else {coupon.can_use_for='all'}
        await coupon.save()
        await trx.commit()
        coupon =await transform.item(coupon,Transformer)
        return response.status(201).send(coupon)
    } catch (error) {
      await trx.rollback()
      return response.status(400).send({
        message:'It fail to create a coupon'
      })
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
  async show ({ params:{id}, response, transform }) {
    let coupon = await Coupon.findOrFail(id)
    coupon =await transform.item(coupon, Transformer)
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
  async update ({ params:{id}, request, response, transform }) {
    const trx =await Database.beginTransaction()
    var coupon = await Coupon.findOrFail(id)
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
        coupon.merge(couponData)
        const {users, products}=request.only(['users','products'])
        const service = new Service(coupon, trx)
        if (users && users.length >0) {
          await service.syncUsers(users)
          can_use_for.client= true
        }
        if(products && products.length >0){
          can_use_for.product = true
        }
        if (can_use_for.product && can_use_for.client) {
          coupon.can_use_for = 'product_client'
        }else if(can_use_for.product && !can_use_for.client){
          coupon.can_use_for= 'product'
        }else if (!can_use_for.product && can_use_for.client){
          coupon.can_use_for='client'
        } else {coupon.can_use_for='all'}
        await coupon.save(trx)
        await trx.commit()
        coupon=await transform.item(coupon, Transformer)
        return response.send(coupon)

    } catch (error) {
      await trx.rollback()
      return response.status(400).send({
        message:'It fail to create a coupon'
      })
    }

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
