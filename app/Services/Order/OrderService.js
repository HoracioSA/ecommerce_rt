'use strict'
const Database = use('Database')
class OrderService{
    constructor(model, trx=false){
        this.model = model;
        this.trx= trx
    }
    async syncItems_Order(items){
        if (!Array.isArray(items)) {
            return false
        }
        await this.model(items).delete(this.trx)
        await this.model.items().createMany(items, this.trx)
    }
    async update_Order_Items(items){
        let current_order_items =await this.model.items().whereIn('id', items.map(item =>item.id)).fetch()
        // Delete the items order that user does not want anymore
        await this.model.items().whereNotIn('id', items.map(item=>item.id)).delete(this.trx)
        // Update the order items
        await Promise.all(current_order_items.rows.map(async item=>{
            item.fill(items.find(n=>n.id ===item.id))
            await item.save(this.trx)
        }))
    }
    async canApply_Discount(coupon){
        // pluck= for removing key association with id
        const couponProduct=await Database
            .from('cupon_product')
            .where('cupon_id', coupon.id)
            .pluck('product_id')
        const couponClient = await Database
            .from('cupon_users')
            .where('cupon_id', coupon.id)
            .pluck('user_id')
        // Verifying if coupon value is associeted with product & specific Client
        if (
            Array.isArray(couponProduct) && couponProduct.length <1 && 
            Array.isArray(couponClient) && couponClient.length <1) {
     /**
      *If  it is not associeted with cilent & product it meen that the coupon is for free use for anyone  
      */ 
                return true
        }
        let isAssocietedToProduct,isAssocietedToClient =true
        if (Array.isArray(couponProduct) && couponProduct.length >0) {
            isAssocietedToProduct=true
        } 
        if (Array.isArray(couponClient) && couponClient.length >0) {
            isAssocietedToClient=true
        } 
        const productMatch=await Database
            .from('order_items')
            .where('order_id', this.model.id)
            .whereIn('product_id', couponProduct)
            .pluck('product_id')
            /**
             * CASE OF USE 1= The coupon is associeted with Cient & Product
             */
            if(isAssocietedToClient && isAssocietedToProduct){
                const clientMatch=couponClient.find(
                    client =>client === this.model.user_id
                    )
                    if(clientMatch && Array.isArray(productMatch)&& productMatch.length>0){
                        return true
                    }
            }
            /**
             * CASE OF USE 2= The coupon is associeted only to Product
             */
            if(isAssocietedToProduct && Array.isArray(productMatch)&& productMatch.length>0){
                return true
            }
            /**
             * CASE OF USE 3= The coupon is associeted to one or more Clients and to any product
             */
            if(isAssocietedToClient && Array.isArray(couponClient)&& couponClient.length >0 ){
                const match = couponClient.find(client => client === this.model.user_id)
                if (match) {
                    return true
                }
            }
            /**
             * CASE OF USE 4= If none of the above verification matchs
             * So the coupon is associeted to client or to the product or both of them
             * But none of this product is ilegible for discount
             * In this case can not use the coupon
             */
            return false

    }
}
module.exports=OrderService