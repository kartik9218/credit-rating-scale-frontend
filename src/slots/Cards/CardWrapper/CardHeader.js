import React from "react";
import { ArgonTypography } from "components/ArgonTheme";
import { ArgonBox } from "components/ArgonTheme";
import PropTypes from "prop-types";

const CardHeader = ({ subtitle = "", title = "", HeaderBtn }) => {
  return (
    <ArgonBox padding=".8rem">
      <ArgonTypography fontWeight="bold" opacity={0.9} fontSize="13px">
        {subtitle}
      </ArgonTypography>
      <ArgonBox sx={{ display: "flex", alignItems: "center" }}>
        <ArgonTypography fontWeight="600" fontSize="20px" marginRight="1rem">
          {title}
        </ArgonTypography>
        {HeaderBtn && <HeaderBtn />}
      </ArgonBox>
    </ArgonBox>
  );
};

export default CardHeader;

CardHeader.propTypes = {
  subtitle: PropTypes.string,
  title: PropTypes.string,
  HeaderBtn: PropTypes.func | null,
};
