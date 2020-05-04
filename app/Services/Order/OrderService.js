'use strict'
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
    async updateOrder_Items(items){
        let current_order_items =await this.model.items().whereIn('id', items.map(item =>item.id)).fetch()
        // Delete the items order that user does not want anymore
        await this.model.items().whereNotIn('id', items.map(item=>item.id)).delete(this.trx)
        // Update the order items
        await Promise.all(current_order_items.rows.map(async item=>{
            item.fill(items.find(n=>n.id ===item.id))
            await item.save(this.trx)
        }))
    }
}
module.exports=OrderService