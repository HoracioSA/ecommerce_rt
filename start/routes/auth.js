'use strict'
/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.group(()=>{
    Route.post('auth/register', 'AuthController.register').as('auth.register').middleware(['guest']).validator('Auth/Register')
    Route.post('auth/login', 'AuthController.login').as('auth.login').middleware(['guest']).validator('Auth/Login')
    Route.post('refresh', 'AuthController.refresh').as('auth.refresh').middleware(['guest'])
    Route.post('auth/logout', 'AuthController.logout').as('auth.logout').middleware(['auth'])

    Route.post('reset-password','AuthController.forgot').as('auth.forgot').middleware(['guest'])
    Route.get('reset-password','AuthController.remember').as('auth.remember').middleware(['guest'])
    Route.put('reset-password','AuthController.reset').as('auth.reset').middleware(['guest'])

}).prefix('v1').namespace('Auth')