'use strict'
/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')
Route.group(()=>{
    /**
     * Categories Ressurce routes
     */
    Route.resource('categories', 'CategoryController').apiOnly().validator(new Map([
        [['categories.store'], ['Admin/StoreCategory']],
        [['categories.update'], ['Admin/StoreCategory']]
    ]))
    /**
     * Products Ressurce routes
     */
    Route.resource('products', 'ProductController').apiOnly()
/**
     * Products Ressurce routes
     */
    Route.resource('coupons', 'CouponController').apiOnly()
    /**
     * Products Ressurce routes
     */
    Route.post('orders/:id/discount', 'OrderController.applyDiscount')
    Route.delete('orders/:id/discount', 'OrderController.removeDiscount')

    Route.resource('orders', 'OrderController').apiOnly().validator(new Map([
        [['orders.store'],['Admin/StoreOrder']]
    ]))

    Route.resource('users', 'UserController').apiOnly()
    Route.resource('images', 'ImageController').apiOnly()

}).prefix('v1/admin').namespace('Admin').middleware(['auth', 'is:(admin_a ||maneger_a)'])