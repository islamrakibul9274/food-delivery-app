import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { RouterProvider } from "react-router-dom";
import { router } from './routes/Router'
import { CartProvider } from './context/CartContext';
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CartProvider> {/* Now everyone can talk to the cart! */}
      <RouterProvider router={router} />
    </CartProvider>
  </React.StrictMode>,
)