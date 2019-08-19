import React from 'react';
import ReactDOM from 'react-dom';
import { Admin, Resource } from 'react-admin';
import { Route } from 'react-router-dom';
import dataProvider from './core/data-provider-mock';
import authProvider from './core/auth-provider-mock';
// import Editor from './components/editor';
import Editor from './components/editor';
import Engineering from './components/engineering';
import CustomLayout from './core/layout';
import reducers from './core/reducers';

const customRoutes = [<Route path="/engineering" component={Engineering} noLayout />];

function ReactAdmin() {
  // TODO: React-Admin goes here
  return (
    <Admin
      customReducers={{ ...reducers }}
      appLayout={CustomLayout}
      authProvider={authProvider}
      dataProvider={dataProvider}
      customRoutes={customRoutes}
    >
      <Resource name="editor" list={Editor} />
    </Admin>
  );
}

document.addEventListener('contextmenu', event => event.preventDefault());
ReactDOM.render(<ReactAdmin />, document.getElementById('root'));
