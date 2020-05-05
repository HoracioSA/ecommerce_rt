'use strict'
const Coupon = uese('App/Models/Coupon')
const Order = uese('App/Models/Order')
const Database =use('Database')

const DiscountHook = exports = module.exports = {}

DiscountHook.calculateValues = async (model) => {
    var couponProduct, discountItems=[]
    model.discount=0
    const coupon = await Coupon.find(model.coupon_id)
    const order = await Order.find(model.order_id)

    //Start Validation
    switch (coupon.can_use_for) {
        case 'product_client' ||'product':
            couponProduct=await Database.from('cupon_product').where('cupon_id',model.coupon_id).pluck('product_id')
            discountItems=await Database
            .from('order_items')
            .where('order_id', model.order_id)
            .whereIn('product_id')
            if (coupon.type =='percent') {
                for(let orderItems of discountItems){
                    model.discount +=(orderItems.subtotal/100)*coupon.discount
                }       
            }else if(coupon.type == 'currency'){
                for (let orderItem of discountItems){
                    model.discount +=coupon.discount * orderItem.quantity
                }
            }else {
                for (let orderItem of discountItems){
                    model.discount += orderItem.subtotal
                }
            }
            break;
    
        default:
            // Can be used for Client || All
            if (coupon.type='percent') {
                model.discount =(order.subtotal/100)*coupon.discount
            }else if (coupon.type='currency') {
                model.discount =coupon.discount
            }else{
                model.discount=order.subtotal
            }
            break;
    }
    return model
}

//Decrement the quantity of avalueble coupon to be used
DiscountHook.decrementCoupons=async model=>{
    const query =await Database.from('cupons')
    if (model.$transaction){
        query.transacting(model.$transaction)
    }
    await query.where('id', model.coupon_id).decrement('quantity', 1)
}
//Increment the quantity of avalueble coupon to be used
DiscountHook.incrementCoupons=async model=>{
    const query = await Database.from('cupons')
    if (model.$transaction) {
        query.transacting(model.$transaction)
    }
    await query.where('id', model.coupon_id).increment('quantity', 1)
}
