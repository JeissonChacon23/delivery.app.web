// src/App.tsx
// App Component
// Componente principal de la aplicación

import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import './styles/globals.css';

function App() {
    return <RouterProvider router={router} />;
}

export default App