import axios from 'axios';
import { showAlert } from './alert';

export const updateSettings = async (data, type) => {
  try {
    const url = type === 'password' ? '/api/v1/users/updatemypassword' : '/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url,
      data
    });

    console.log(res.data);
    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updates succesfuly`);
      //location.assign('/account');
    }
  } catch (e) {
    showAlert('error', e.response.data.message);
  }
};
