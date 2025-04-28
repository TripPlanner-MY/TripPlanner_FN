import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from './components/Header';
import Body from './components/Body';
import '../src/public/public.css';
import '../src/public/reset.css';

const App = () => {

  return (
    <Router>

      <Header />
      <Body />


    </Router>
  );
}
export default App;
