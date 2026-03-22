import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider, } from "react-router-dom";
import Viewer from './userside/userhome/viewer';
import Signin from './userside/auth/Csignin';
import SignUp from './userside/auth/Csignup';
import Client from './userside/Client/Cprofile';
import Buypackage from './userside/buypackage/buypackage';
import Requireddetails from './userside/buypackage/requireddetails';
import Aboutus from './userside/userhome/aboutus/aboutus';
import Team from './userside/Team/team';
import Career from './userside/career/career';
import AuthProvider from './userside/Provider/AuthProvider';
import MProfile from './userside/Employee/Mprofile';
import ESignUp from './userside/auth/Esignup';
import EmployeeProfile from './userside/Employee/Eprofile';
import CSignUp from './userside/auth/Csignup';
import Csignin from './userside/auth/Csignin';
import Clientprofile from './userside/Client/Cprofile';
import PackDetails from './userside/packages/packdetails';
import { base_url } from './config/config';
import HomePortfolio from './userside/userhome/homeportfolio/homeportfolio';
import { HelmetProvider } from 'react-helmet-async'
import PortfolioDetail from './userside/userhome/homeportfolio/PortfolioDetails';
import PaymentGateway from './userside/buypackage/paymentGateway';
import SupportChat from './userside/userhome/supportchat/SupportChat';
import Social from './userside/userhome/Social/Social';


const router = createBrowserRouter([
  {
    path: "/",
    element: <Viewer></Viewer>,
  },

  {
    path: "/signin",
    element: <Signin></Signin>,
  },

  {
    path: "/clientsignup",
    element: <SignUp></SignUp>,
  },

  {
    path: "/client",
    element: <Client></Client>,
  },
  {
    path: "/buypackage",
    element: <Buypackage></Buypackage>,
  },

  {
    path: "/requireddetails",
    element: <Requireddetails></Requireddetails>,
  },
  {
    path: "/packdetails/:id",
    element: <PackDetails />,
    loader: ({ params }) => fetch(`${base_url}/packdetails/${params.id}`),
  },
  {
    path: "/aboutus",
    element: <Aboutus></Aboutus>,
  },
  {
    path: "/ourteam",
    element: <Team></Team>,
  },
  {
    path: "/portfolio",
    element: <HomePortfolio></HomePortfolio>,
  },

  {
    path: '/paymentgateway',
    element: <PaymentGateway></PaymentGateway>
  },
  {
    path: "/portfolio/:id",
    element: <PortfolioDetail />,
    loader: ({ params }) => fetch(`${base_url}/getportfolio/${params.id}`),
  },
  {
    path: "/career",
    element: <Career></Career>,
  },
  {
    path: "/marketerprofile/:id",
    element: <MProfile />,
    loader: ({ params }) => fetch(`${base_url}/employeeprofile/${params.id}`),
  },
  {
    path: "/employeeprofile/:id",
    element: <EmployeeProfile />,
    loader: ({ params }) => fetch(`${base_url}/employeeprofile/${params.id}`),
  },
  {
    path: "/clientprofile/:id",
    element: <Clientprofile />,
    loader: ({ params }) => fetch(`${base_url}/clientprofile/${params.id}`),
  }
  ,
  {
    path: "/employeesignup",
    element: <ESignUp></ESignUp>,
  },
  {
    path: "/clientsignup",
    element: <CSignUp></CSignUp>,
  },

  {
    path: "/clientsignin",
    element: <Csignin></Csignin>,
  },

  // {
  //   path: "/marketerprofile",
  //   element: <MProfile></MProfile>
  // },



]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <Social />
        <SupportChat />
        <RouterProvider router={router} />
      </AuthProvider>
    </HelmetProvider>

  </React.StrictMode>,
)
