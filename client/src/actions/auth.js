import axios from 'axios';
import {
  REGISTER_SUCCESS,
  REGISTER_FAIL
} from './types';


//Register User 
export const register = ({
  name,
  email,
  password
}) => async dispatch => {
  const config = {
    header: {
      'Content-Type': 'application/json'
    }
  }
  const body = JSON.stringify({
    name,
    email,
    password
  });
  try {
    const res = await axios.post('/api/users', body, config);

    dispatch({
      type: REGISTER_SUCCESS,
      payload: res.data
    })

  } catch (err) {
    dispatch({
      type: REGISTER_FAIL
    });
    if (errors)
      const errors = err.response.data.errors;

    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({
      type: REGISTER_FAIL
    })
  }
}