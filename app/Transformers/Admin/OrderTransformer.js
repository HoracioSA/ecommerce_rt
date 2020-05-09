'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')
const UserTransformer = use('App/Transformers/Admin/UserTransformer')
const OrderItemTransformer = use('App/Transformers/Admin/OrderItemTransformer')
const CouponTransformer = use('App/Transformers/Admin/CouponTransformer')
const DiscountTransformer = use('App/Transformers/Admin/DiscountTransformer')



/**
 * OrderTransformer class
 *
 * @class OrderTransformer
 * @constructor
 */
class OrderTransformer extends BumblebeeTransformer {
  availableInclude(){
    return ['user', 'cupons', 'items','discounts']
  }
  /**
   * This method is used to transform the data.
   * $sideLoaded from OrderHook= __meta__
   */
  transform (order) {
    order=order.toJSON()
    return {
     // add your transformation object here
     id:order.id,
     status:order.status,
     date:order.created_at,
     total:order.total ? parseFloat(order.total.toFixed(2)):0,
     qty_items:order.__meta__ && order.__meta__.qty_items ? order.__meta__.qty_items: 0,
     discount:order.__meta__ && order.__meta__.discount ? order.__meta__.discount: 0,
     subtotal:order.__meta__ && order.__meta__.subtotal ? order.__meta__.subtotal: 0
    }
  }
  includeUser(order){
    return this.item(order.getRelated('user'), UserTransformer)
  }
  includeItems(){
    return this.collection(order.getRelated('items'), OrderItemTransformer)

  }
  includeCupons(){
    return this.collection(order.getRelated('cupons'), CouponTransformer)

  }
  includeDiscounts(){
    return this.collection(order.getRelated('discounts'), DiscountTransformer)

  }
}

module.exports = OrderTransformer
