'use strict'
/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')
Route.group(()=>{
    /**
     * Categories Ressurce routes
     */
    Route.resource('categories', 'CategoryController').apiOnly()
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
    Route.resource('orders', 'OrderController').apiOnly()

    Route.resource('users', 'UserController').apiOnly()
    Route.resource('images', 'ImageController').apiOnly()

}).prefix('v1/admin').namespace('Admin')