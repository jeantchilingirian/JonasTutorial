import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password
      }
    });
    console.log(res);

    if (res.data.status == 'success') {
      showAlert('success', 'Logged in successfuly');

      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (e) {
    //console.log(e.response.data);
    showAlert('error', e.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout'
    });

    if (res.data.status == 'success') window.location.reload(true);
  } catch (e) {
    showAlert('error', 'Error logging out. Try again.');
  }
};
