import jsonRestProvider from 'ra-data-fakerest';

import MockData from '../mock-data';

const dataProvider = jsonRestProvider(MockData, true);
const sometimesFailsDataProvider = (type, resource, params) =>
  new Promise(resolve => {
    return resolve(
      dataProvider(type, resource, params).then(res => {
        if (type === 'GET_LIST' && resource === 'businesses') {
          if (res.total === 1) {
            window.location.replace(`/#/businesses/${res.data[0].id}`);
          }
        }
        return res;
      })
    );
  });
const delayedDataProvider = (type, resource, params) =>
  new Promise(resolve => setTimeout(() => resolve(sometimesFailsDataProvider(type, resource, params)), 1000));

export default delayedDataProvider;
