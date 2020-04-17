'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CuponProductSchema extends Schema {
  up () {
    this.create('cupon_product', (table) => {
      table.increments()
      table.integer('cupon_id').unsigned()
      table.integer('product_id').unsigned()

      table.timestamps()
      table
      .foreign('cupon_id')
      .references('id')
      .inTable('cupons')
      .onDelete('cascade')

      table
      .foreign('product_id')
      .references('id')
      .inTable('users')
      .onDelete('cascade')

    })
  }

  down () {
    this.drop('cupon_product')
  }
}

module.exports = CuponProductSchema
