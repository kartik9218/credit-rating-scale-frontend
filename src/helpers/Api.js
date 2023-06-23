import axios from "axios";
import { DESTROY_DATA, GET_DATA, GET_USER_PROPS } from "./Base";
import { ERRORS } from "./constants";

export function APIFY(path) {
  return process.env['REACT_APP_API_ENDPOINT'].concat(path);W
}

export async function HTTP_CLIENT(url, data, isMutipartFormDataRequest=false) {
  const handleJWTExpireError = (err) => {
    if(err.response.data.error === ERRORS.TOKEN_EXPIRED) {
      DESTROY_DATA();
      document.location.href = "/"
    }
  }
  return new Promise((resolve, reject) => {
    const accessToken = GET_USER_PROPS('access_token', 'active_role');
    
    const headers = {};
    headers['Content-Type'] = 'application/json';
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    if(isMutipartFormDataRequest) {
      headers['Content-Type'] = "multipart/form-data";
    }
    
    const options = {
      method: 'POST',
      url: url,
      headers: headers,
      data: data
    }; 

    axios.request(options).then(function (response) {
      resolve(response.data);
    }).catch(function (error) {
      handleJWTExpireError(error);
      reject(error);
    });
  })
}

