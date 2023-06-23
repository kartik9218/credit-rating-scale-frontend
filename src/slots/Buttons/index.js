import { Button } from "@mui/material";
import React from "react";
import PropTypes from "prop-types";

const InfomericButton = (props) => {
  const { children = "", onClick = () => {}, icon = "", color = "primary", disable = false, sx = {} } = props;

  const colorObj = {
    primary: "#5e72e3",
    primary_Light: "#5466cc",
    success: "#2dce8a",
    success_Light: "#56d7a1",
    danger: "#ee395a",
    danger_Light: "#f26881",
  };
  return (
    <Button
      variant={"contained"}
      startIcon={icon}
      onClick={onClick}
      disabled={disable}
      sx={{
        marginRight: "33px",
        color: "white !important",
        cursor: "pointer",
        backgroundColor: colorObj[color],
        ":hover": { backgroundColor: colorObj[`${color}_Light`] },
        ":active": { backgroundColor: colorObj[`${color}_Light`] },
        ":focus:not(:hover)": {
          backgroundColor: colorObj[`${color}_Light`],
          boxShadow: `0rem 0rem 0rem 0.2rem ${colorObj[`${color}_Light`]}`,
        },
        ...sx
      }}
    >
      {children}
    </Button>
  );
};

InfomericButton.propTypes = {
  children: PropTypes.string,
  onClick: PropTypes.func,
  icon: PropTypes.element,
  color: PropTypes.string,
  disable: PropTypes.bool,
  sx : PropTypes.object
};

export default InfomericButton;
