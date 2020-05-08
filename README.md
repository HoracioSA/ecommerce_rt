# Adonis API application

This is the boilerplate for creating an API server in AdonisJs, it comes pre-configured with.

1. Bodyparser
2. Authentication
3. CORS
4. Lucid ORM
5. Migrations and seeds

## Setup

Use the adonis command to install the blueprint

```bash
adonis new yardstick --api-only
```

or manually clone the repo and then run `npm install`.


### Migrations

Run the following command to run startup migrations.

```js
adonis migration:run
```
 async index ({ request, response, pagination}) {
    const {status, id} =request.only(['status','id'])
    const query = await Order.query()
    if (status && id) {
      query.where('status', status)
      query.orWhere('id', 'ILIKE', `%${id}%`)
    }else if (status) {
      query.where('status', status)
    }else if (id) {
      query.where('id', 'ILIKE', `%${id}%`)
    }
    const orders = query.paginate(pagination.page, pagination.limit)
    return response.send(orders)
  }

  async index ({ request, response, pagination}) {
    const {status, id} = request.only(['status','id'])
    let orders =[]
    
    if (status && id) {
      orders =await Order.query()
      .where('status', status)
      .orWhere('id', 'ILIKE', `%${id}%`)
      .paginate(pagination.page, pagination.limit)
    }else if (status) {
      await Order.query().where('status', status)
      .paginate(pagination.page, pagination.limit)
    }else if (id) {
     await Order.query()
      .where('id', 'ILIKE', `%${id}%`)
      .paginate(pagination.page, pagination.limit)

    }
    return response.send(orders)
  }