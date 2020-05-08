'use strict'

class Login {
  get rules () {
    return {
      // validation rules
      email:'required|email',
      password:'required'
    }
  }
  get messages(){
    return{
    'email.required':'The e-email is required!',
    'email.email':'It is not an e-mail!',
    'password.required':'Password is required'
  }
  }
}

module.exports = Login
