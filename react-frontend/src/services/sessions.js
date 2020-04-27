const axios = require('axios').default;

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/',
  timeout: 1000,
  headers: {'Content-Type': 'application/json'}
});

const salt = 10;


export const SignUp = (attributes) => {
  return axiosInstance.post('/users',
    JSON.stringify(
      {
        'name': attributes.firstName,
        'last_name': attributes.lastName,
        'email': attributes.email,
        'password': attributes.password1
      }
    ));
}

export const SignIn = (attributes) => {
  return axiosInstance.post('/sessions/login',
    JSON.stringify(
      {
        'email': attributes.email,
        'password': attributes.password
      }
    ));
}