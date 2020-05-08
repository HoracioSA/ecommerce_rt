'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')
const CouponTransformer = use('App/Transformers/Admin/CouponsTransformer')

/**
 * DiscountTransformer class
 *
 * @class DiscountTransformer
 * @constructor
 */
class DiscountTransformer extends BumblebeeTransformer {
  defaultInclude(){
    return ['coupon']
  }
  /**
   * This method is used to transform the data.
   */
  transform (model) {
    return {
     // add your transformation object here
     id: model.id,
     amount:model.discount
    }
  }
  includeCoupon(discount){
    return this.item(discount.getRelated('coupon'), CouponTransformer)
  }
}

module.exports = DiscountTransformer
