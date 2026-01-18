// src/routes/AppRoutes.js
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "../pages/Home/Home";
import Profile from "../pages/Profile/Profile";
import Accounts from "../pages/Accounts/Accounts";
import Notifications from "../pages/Notifications/Notifications";
import Login from "../pages/Login/Login";
import ResetPassword from "../pages/Login/ResetPassword"
import FlightRequestForm from "../pages/FlightRequestForm/FlightRequestForm";
import Review from "../pages/Review/Review";
import TwoFactorAuth from "../pages/Login/TwoFactorAuth";
import ErrorBoundary from "../pages/ErrorHandling/ErrorPage";
import BookingDetails from "../pages/BookingDetails/BookingDetails";

const router = createBrowserRouter([ // A JSON formatted route list
  {
    path: "/",
    Component: Home,
    ErrorBoundary: ErrorBoundary, // component and handler for errors
  },
  {
    path: "login",
    Component: Login,
  },
  {
    path: "reset-password",
    Component: ResetPassword,
  },
  {
    path: "two-factor-auth",
    Component: TwoFactorAuth,
  },
  {
    path: "profile",
    Component: Profile,
  },
  {
    path: "accounts",
    Component: Accounts,
  },
  {
    path: "notifications",
    Component: Notifications,
  },
  {
    path: "flight-request-form",
    Component: FlightRequestForm,
  },
  {
    path: "review",
    Component: Review,
  },
  {
    path: "booking-details",
    Component: BookingDetails,
  },
]);


function AppRoutes() { // TODO: Change Home Route
  return (
    <RouterProvider router={router}/>
  );
}

export default AppRoutes;
