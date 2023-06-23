import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useArgonController } from "context";
import { routes } from "routes";
import { GET_USER_PROPS } from "helpers/Base";
import { Backdrop, CircularProgress } from "@mui/material";
import ArgonBox from "components/ArgonBox";
import Sidenav from "slots/Sidenav";

import DashboardNavbar from "slots/Navbars/DashboardNavbar";
import NotAllowed from "screens/NotAllowed";

import dashboardBg from "assets/images/dashboard.jpg"
import logo from "assets/images/logo.png"
import minilogo from "assets/images/minilogo.png"

function DashboardLayout({ bgColor, children, breadcrumbTitle, showCompany, ...rest }) {
  const [controller, dispatch] = useArgonController();
  const { sidenavColor } = controller;
  const [isLoading, setIsLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const [miniSidenav, setMiniSidenav] = useState(false);

  const checkRole = () => {
    const navigations_path = GET_USER_PROPS('navigations_path', 'active_role');
    const path = document.location.pathname;
    const canAccess = navigations_path.includes(path) 
    setIsAllowed(canAccess);
  }

  const hendleSideNav = () => {
    setMiniSidenav(!miniSidenav);
  }

  useEffect(() => {
    setIsLoading(false);
  }, [isAllowed]);

  useEffect(() => {
    checkRole();
  }, []);
  

  return (
    <ArgonBox sx={{background:"#ebebeb", height:"100vh", overflow:"hidden"}}>
      <ArgonBox display={{ xs: "none", lg: "block" }}>
        <Sidenav color={sidenavColor} brandName={!miniSidenav ? logo : minilogo} routes={routes} minisidenav={miniSidenav}/>
      </ArgonBox>
      <ArgonBox
        sx={({ breakpoints, transitions, functions: { pxToRem } }) => ({
          p: 2.2,
          [breakpoints.up("xl")]: {
            marginLeft: miniSidenav ? pxToRem(120) : pxToRem(265),
            transition: transitions.create(["margin-left", "margin-right"], {
              easing: transitions.easing.easeInOut,
              duration: transitions.duration.standard,
            }),
          },
        })}
      >
        <ArgonBox
          height="300px"
          width="100vw"
          position="absolute"
          top={0}
          left={0}
          sx={{backgroundImage: `url(${dashboardBg})`, backgroundSize: "cover"} }
          zIndex="1"
          {...rest}
        />
        <DashboardNavbar breadcrumbTitle={breadcrumbTitle} showCompany={showCompany} hendleSideNav={hendleSideNav}/>
        <div style={{minHeight: '80vh', position:"relative", zIndex:"1200" }}>
          { !isLoading && isAllowed   && children }
          { !isLoading && !isAllowed  && <NotAllowed /> }
        </div>
      </ArgonBox>

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </ArgonBox>
  );
}

// Typechecking props for the DashboardLayout
DashboardLayout.propTypes = {
  bgColor: PropTypes.string,
  showCompany: PropTypes.bool,
  breadcrumbTitle: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default DashboardLayout;
