'use strict'

/*
|--------------------------------------------------------------------------
| ClientSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory =use('Factory')
const Role = use('Role')
const User =use('App/Models/User')
class ClientSeeder {
  async run () {
     const role = await Role.findBy('slug', 'client_a')
     const clients= await Factory.model('App/Models/User').createMany(30)
     await Promise.all(clients.map(async client=>{
       await client.roles().attach([role.id])
     })) 
     const user = await User.create({
       name:'Horacio_1',
       surname:'Sapato_0',
       email:'horaciosapoto2015@gmail.com',
       password:'secret'
     }) 
     const AdminRole=await Role.findBy('slug','admin_a');
     await user.roles().attach([AdminRole.id])
    }
    
}

module.exports = ClientSeeder
