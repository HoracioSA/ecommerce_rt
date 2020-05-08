'use strict'

class Register {
  get rules () {
    return {
      // validation rules
      name:'required',
      surname:'required',
      email:'required|email|unique:users,email',
      password:'required|confirmed',
    }
  }
  get messages(){
    return {
      'name.required':'The name is required!',
      'surname.required':'The Surname is required!',
      'email.required':'O email is required!',
      'email.email':'The e-mail is wrong!',
      'email.unique':'This email already exists!',
      'password.required':'The Password is required!',
      'password.confirmed':'The passwor does not match!'
    }
  }
}

module.exports = Register
