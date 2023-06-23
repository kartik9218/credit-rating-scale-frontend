import { useEffect } from "react";

// react-router-dom components
import { useLocation } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// MUI components
import ArgonBox from "components/ArgonBox";

// MUI context
// import { useArgonController, setLayout } from "context";

function PageLayout({ background, children }) {
  // const [controller, dispatch] = useArgonController();
  // const { darkMode } = controller;
  const darkMode = false;

  const { pathname } = useLocation();

  useEffect(() => {
    // setLayout(dispatch, "page");
  }, [pathname]);

  return <div>{children}</div>;
}

// Setting default values for the props for PageLayout
PageLayout.defaultProps = {
  background: "default",
};

// Typechecking props for the PageLayout
PageLayout.propTypes = {
  background: PropTypes.oneOf(["white", "light", "default"]),
  children: PropTypes.node.isRequired,
};

export default PageLayout;
