'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
const Order = use('App/Models/Order')
const Database =use('Database')
const Service=use('App/Services/Order/OrderService')
const Coupon = use('App/Models/Coupon')
const Discount =use('App/Models/Discount')
const OrderTransformer = use('App/Transformers/Admin/OrderTransformer')

/**
 * Resourceful controller for interacting with orders
 */
class OrderController {
  /**
   * Show a list of all orders.
   * GET orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.pagination
   * @param {View} ctx.pagination
   * 
   */
  async index ({ request, response, pagination, transform}) {
    const {status, id} =request.only(['status','id'])
    let orders = [];
    const query = Order.query();
    if (status && id) {
      orders= await query.where('status', status)
      query.orWhere('id', 'ILIKE', `%${id}%`)
      .paginate(pagination.page, pagination.limit)
    }else if (status) {
      orders = await query.where('status', status)
      .paginate(pagination.page, pagination.limit)
    }else if (id) {
      orders = await query.where('id', 'ILIKE', `%${id}%`)
      .paginate(pagination.page, pagination.limit)
    }
    else {
      orders = await query.paginate(pagination.page, pagination.limit);
    }
    orders=await transform.paginate(orders, OrderTransformer)
    return response.send(orders)
  }


  /**
   * Create/save a new order.
   * POST orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response, transform }) {
    const trx =await Database.beginTransaction()
    try {
      const {user_id, items, status}=request.all()
      var order =await Order.create({user_id, status}, trx)
      const service = new Service(order, trx)
      if (items && items.length>0) {
        await service.syncItems_Order(items)
      }
      await trx.commit()
      order= await Order.find(order.id)
      order =await transform.include('users,items').item(order, OrderTransformer)
      return response.status(201).send(order)
    } catch (error) {
      await trx.rollback()
      return response.status(400).send({
        message:'It was not possible to create the order'
      })
      
    } 
  }

  /**
   * Display a single order.
   * GET orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params:{id}, response, transform}) {
    var order = await Order.findOrFail(id)
    order = await transform.include('items,user,discounts').item(order, OrderTransformer)
    return response.send(order)
  }

  /**
   * Update order details.
   * PUT or PATCH orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params:{id}, request, response, transform }) {
    let order= await Order.findOrFail(id)
    const trx = await Database.beginTransaction()
    try {
      
      const {User_Order, items}= request.all(['user_id', 'status'])
      order.merge(User_Order)
      const service = new Service(order,trx)
      await service.update_Order_Items(items)
      await order.save(trx)
      await trx.commit()
      order=await transform.include('items,user,discounts,cupons').item(order, OrderTransformer)
      return response.send(order)
    } catch (error) {
      await trx.rollback()
      return response.status(400).send({
        message:'It was not possible to Update Order'
      })
    }
  }

  /**
   * Delete a order with id.
   * DELETE orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params:{id}, request, response }) {
    const order = await Order.findOrFail(id)
    const trx = await Database.beginTransation()
    try {
      await order.items().delete(trx)
      await order.coupon().delete(trx)
      await order.delete(trx)
      await trx.commit()
      return response.status(204).send()
    } catch (error) {
      await trx.rollback()
      return response.status(400).send({
        message:'It weas impossible to delete the Order'
      })
    }
  }
  async applyDiscount({params:{id}, request, response, transform}){
    const {code}=request.all()
    const coupon = await Coupon.findByOrFail('code', code.toUpperCase())
    var order =await Order.findOrFail(id)
    var discount, information ={}
    try {
      /**
       * @param {Int} getCount It count the quantity of order
       */
      const service = new Service(order)
      const can_apply_discount = await service.canApply_Discount(coupon)
      const orderDiscount = await order.coupon().getCount()
      const canApplyToOrder= orderDiscount <1 || (orderDiscount >=1 && coupon.recursive)
      if (can_apply_discount && canApplyToOrder) {
        discount =await Discount.findOrCreate({
          order_id: order.id,
          coupon_id: coupon.id
        })
        information.message='Coupon was applyed!'
        information.success=true
      }else{
        information.message='Was not possible to apply this coupon!'
        information.success=false
      }
      order =await transform.include('items,user,discounts,cupons').item(order, OrderTransformer)
      return response.send({order, information})
    } catch (error) {
      return response.status(400).send({
        message:'Error to apply coupon'
      })
    }
  }
  async removeDiscount({request, response}){
    const {discount_id}=request.all()
    const discount = await Discount.findOrFail(discount_id)
    await discount.delete()
    return response.status(204).send()

  }
}

module.exports = OrderController
