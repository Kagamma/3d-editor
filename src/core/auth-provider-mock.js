import { AUTH_GET_PERMISSIONS, AUTH_LOGIN, AUTH_LOGOUT, AUTH_ERROR, AUTH_CHECK } from 'react-admin';

const authProvider = (type, params) => {
  switch (type) {
    case AUTH_LOGIN: {
      const { username, password } = params;
      if (username === 'tma' && password === '12345678x@X') {
        return Promise.resolve();
      }
      return Promise.reject();
    }

    case AUTH_LOGOUT: {
      return Promise.resolve();
    }

    case AUTH_ERROR: {
      const { status } = params;
      if (status === 401 || status === 403) {
        sessionStorage.removeItem('accessToken');
        return Promise.reject();
      }
      return Promise.resolve();
    }

    case AUTH_GET_PERMISSIONS: {
      const role = localStorage.getItem('role');
      return role ? Promise.resolve(role) : Promise.reject();
    }

    case AUTH_CHECK: {
      return Promise.resolve();
    }

    default:
      return Promise.reject(new Error('Unknown method'));
  }
};

export default authProvider;
