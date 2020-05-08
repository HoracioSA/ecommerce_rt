'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')

/**
 * OrderItemTransformer class
 *
 * @class OrderItemTransformer
 * @constructor
 */
class OrderItemTransformer extends BumblebeeTransformer {
  /**
   * This method is used to transform the data.
   */
  transform (model) {
    return {
     // add your transformation object here
     id:model.id,
     subtotal:model.subtotal,
     quantity:model.quantity
    }
  }
}

module.exports = OrderItemTransformer
