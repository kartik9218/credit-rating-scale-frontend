// @mui material components
import Drawer from "@mui/material/Drawer";
import { styled } from "@mui/material/styles";

export default styled(Drawer)(({ theme, ownerState, minisidenav }) => {
  const { palette, boxShadows, transitions, breakpoints, functions } = theme;
  const { darkSidenav, layout } = ownerState;

  const { white, background, transparent } = palette;
  const { xxl } = boxShadows;
  const { pxToRem } = functions;

  let bgColor;

  if ((darkSidenav && layout === "landing") || (!darkSidenav && layout === "landing")) {
    bgColor = transparent.main;
  } else if (darkSidenav) {
    bgColor = background.dark;
  } else {
    bgColor = white.main;
  }
  // styles for the sidenav when
  const drawerOpenStyles = () => {
    return {
    transform: "translateX(0)",
    transition: transitions.create("transform", {
      easing: transitions.easing.sharp,
      duration: transitions.duration.shorter,
    }),
    [breakpoints.up("xl")]: {
      backgroundColor: bgColor,
      boxShadow: darkSidenav ? "none" : xxl,
      marginBottom: darkSidenav ? 0 : "inherit",
      left: "0",
      width:pxToRem(250),
      transform: "translateX(0)",
      transition: transitions.create(["width", "background-color"], {
        easing: transitions.easing.sharp,
        duration: transitions.duration.enteringScreen,
      }),
    },
  }
};

  
  const drawerCloseStyles = () => ({
    transform: `translateX(${pxToRem(-320)})`,
    transition: transitions.create("transform", {
      easing: transitions.easing.sharp,
      duration: transitions.duration.shorter,
    }),

    [breakpoints.up("xl")]: {
      backgroundColor: bgColor,
      boxShadow: darkSidenav ? "none" : xxl,
      marginBottom: darkSidenav ? 0 : "inherit",
      left: "0",
      width: pxToRem(96),
      overflowX: "hidden",
      transform: "translateX(0)",
      transition: transitions.create(["width", "background-color"], {
        easing: transitions.easing.sharp,
        duration: transitions.duration.shorter,
      }),
    },
  });

  return {
    "& .MuiDrawer-paper": {
      boxShadow: xxl,
      border: "none",
      backgroundColor: transparent.main,
      ...(minisidenav === "true" ? drawerCloseStyles() : drawerOpenStyles()),
    },
  };
});
