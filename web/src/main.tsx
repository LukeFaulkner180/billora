import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './styles.css';
import './react-tweaks.css';
import './premium.css';
import './mobile-polish.css';
import './midnight.css';

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
