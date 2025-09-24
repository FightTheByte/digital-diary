import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';
import {Landing} from '../src/components/landing-page';
import { CreatePost } from './components/create-post';
import { ReadPosts } from './components/read-page';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <Routes>
      <Route path='/' element={<Landing/>}></Route>
      <Route path='/post' element={<CreatePost/>}></Route>
      <Route path='/read' element={<ReadPosts/>}></Route>
    </Routes>
  </Router>
);


