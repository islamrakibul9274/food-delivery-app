import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import Main from "../layouts/Main";
import { Loading } from "../components/ui";
import Protected from "../components/Protected";
const RouteError = lazy(() =>
  import("../views/Info").then((m) => ({ default: m.RouteError })),
);
const Home = lazy(() => import("../views/Home"));
const Menu = lazy(() => import("../views/Menu"));
const Detail = lazy(() =>
  import("../views/Menu").then((m) => ({ default: m.ProductDetails })),
);
const Auth = lazy(() => import("../views/Auth"));
const Cart = lazy(() => import("../views/Cart"));
const Info = lazy(() => import("../views/Info"));
const Missing = lazy(() =>
  import("../views/Info").then((m) => ({ default: m.NotFound })),
);
const Account = lazy(() => import("../views/Account"));
const Admin = lazy(() => import("../views/Admin"));
const accountPage = (name) =>
  lazy(() => import("../views/Account").then((m) => ({ default: m[name] })));
const adminPage = (name) =>
  lazy(() => import("../views/Admin").then((m) => ({ default: m[name] })));
const Profile = accountPage("Profile"),
  Orders = accountPage("Orders"),
  Addresses = accountPage("Addresses"),
  Favorites = accountPage("Favorites"),
  OrderDetails = accountPage("OrderDetails");
const Overview = adminPage("Overview"),
  AdminOrders = adminPage("AdminOrders"),
  AdminMenu = adminPage("AdminMenu"),
  Editor = adminPage("ProductEditor"),
  Customers = adminPage("Customers"),
  Settings = adminPage("RestaurantSettings"),
  Messages = adminPage("Messages");
const wrap = (element) => <Suspense fallback={<Loading />}>{element}</Suspense>;
export const router = createBrowserRouter([
  {
    element: <Main />,
    errorElement: wrap(<RouteError />),
    children: [
      { index: true, element: wrap(<Home />) },
      { path: "menu", element: wrap(<Menu />) },
      { path: "menu/:slug", element: wrap(<Detail />) },
      ...[
        "about",
        "contact",
        "how-it-works",
        "faq",
        "privacy",
        "terms",
        "delivery-policy",
        "refund-policy",
      ].map((page) => ({ path: page, element: wrap(<Info page={page} />) })),
      { path: "login", element: wrap(<Auth key="login" />) },
      { path: "signup", element: wrap(<Auth key="signup" mode="signup" />) },
      {
        path: "forgot-password",
        element: wrap(<Auth key="forgot" mode="forgot-password" />),
      },
      {
        path: "reset-password/:token",
        element: wrap(<Auth key="reset" mode="reset-password" />),
      },
      { path: "cart", element: wrap(<Cart />) },
      {
        element: <Protected />,
        children: [
          { path: "checkout", element: wrap(<Cart checkout />) },
          { path: "orders/:id/confirmation", element: wrap(<OrderDetails />) },
          {
            path: "account",
            element: wrap(<Account />),
            children: [
              { index: true, element: wrap(<Profile />) },
              { path: "orders", element: wrap(<Orders />) },
              { path: "orders/:id", element: wrap(<OrderDetails />) },
              { path: "addresses", element: wrap(<Addresses />) },
              { path: "favorites", element: wrap(<Favorites />) },
            ],
          },
        ],
      },
      { path: "service", element: <Navigate to="/how-it-works" replace /> },
      { path: "profile", element: <Navigate to="/account" replace /> },
      { path: "my-orders", element: <Navigate to="/account/orders" replace /> },
      { path: "*", element: wrap(<Missing />) },
    ],
  },
  {
    element: <Protected admin />,
    errorElement: wrap(<RouteError />),
    children: [
      {
        path: "admin",
        element: wrap(<Admin />),
        children: [
          { index: true, element: wrap(<Overview />) },
          { path: "orders", element: wrap(<AdminOrders />) },
          { path: "orders/:id", element: wrap(<OrderDetails />) },
          { path: "menu", element: wrap(<AdminMenu />) },
          { path: "menu/new", element: wrap(<Editor key="new" />) },
          { path: "menu/:id/edit", element: wrap(<Editor key="edit" />) },
          { path: "customers", element: wrap(<Customers />) },
          { path: "settings", element: wrap(<Settings />) },
          { path: "messages", element: wrap(<Messages />) },
          {
            path: "add-item",
            element: <Navigate to="/admin/menu/new" replace />,
          },
          {
            path: "manage-items",
            element: <Navigate to="/admin/menu" replace />,
          },
          { path: "*", element: wrap(<Missing />) },
        ],
      },
    ],
  },
]);
