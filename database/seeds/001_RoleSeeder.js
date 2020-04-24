'use strict'

/*
|--------------------------------------------------------------------------
| RoleSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Role = use('Role')

class RoleSeeder {
  async run () {
    // Create Admin Role
     await Role.create({
      name: 'Admin',
      slug:'admin_a',
      description:'Administrator of the system.'
    })
    await Role.create({
      name:'Maneger_01',
      slug:'maneger_a',
      description:'Maneger of the system'
    })
    await Role.create({
      name:'Client_01',
      slug:'client_a',
      description:'Client of the shop'
    })
  }
}

module.exports = RoleSeeder
