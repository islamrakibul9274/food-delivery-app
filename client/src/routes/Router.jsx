import { createBrowserRouter } from "react-router-dom";
import Main from "../layouts/Main";
import LandingPage from "../pages/LandingPage";
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";
import UserProfile from "../pages/UserProfile";
import AdminRoute from "./AdminRoute";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AddProduct from "../pages/Admin/AddProduct";
import CartPage from "../pages/CartPage";
import ManageOrder from "../pages/Admin/ManageOrders"
import ManageMenu from "../pages/Admin/ManageMenu";
import MyOrders from "../pages/MyOrders";
import AdminHome from "../pages/Admin/AdminHome"; // 👈 Added AdminHome Import

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/profile", element: <UserProfile /> },
      { path: "/cart", element: <CartPage /> },
      { path: "/my-orders", element: <MyOrders /> }
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <SignUp /> },

  // Admin Routes
  {
    path: "/admin",
    element: <AdminRoute><AdminDashboard /></AdminRoute>,
    children: [
      {
        index: true,
        element: <AdminHome />
      },
      {
        path: "add-item", 
        element: <AddProduct />
      },
      {
        path: "orders",
        element: <ManageOrder />
      },
      {
        path: "manage-items",
        element: <ManageMenu />
      }
    ]
  }
]);