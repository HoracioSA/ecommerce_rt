'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Discount extends Model {
    static get table(){
        return 'cupon_order'
    }
    order(){
        return this.belongsToMany('App/Models/Order', 'order_id', 'id')
    }
    coupon(){
        return this.belongsTo('App/Models/Coupon', 'cupon_id', 'id')
    }
}

module.exports = Discount
