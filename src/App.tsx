import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';

import './App.css';

import Client from './Client';
import Dashboard from './Dashboard';

function App() {
  return (
    <Router>
      <Switch>
        <Route path='/client' exact>
          <Client />
        </Route>
        <Route path='/dashboard' exact>
          <Dashboard />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
