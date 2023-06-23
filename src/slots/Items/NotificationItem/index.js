import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import MenuItem from "@mui/material/MenuItem";
import Icon from "@mui/material/Icon";
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import { menuItem } from "./styles";

const NotificationItem = forwardRef(({ color, image, title, date, ...rest }, ref) => (
  <MenuItem {...rest} ref={ref} sx={(theme) => menuItem(theme)}>
    <ArgonBox>
      <ArgonTypography variant="button" textTransform="capitalize" fontWeight="regular">
        {title[0] && (
          <React.Fragment>
            <small>
              <strong>{title[0]}</strong>
            </small>{" "}
            <br />
          </React.Fragment>
        )}
        {title[1]}
      </ArgonTypography>
      <ArgonTypography
        variant="caption"
        color="secondary"
        sx={{
          display: "flex",
          alignItems: "center",
          mt: 0.5,
        }}
      >
        <ArgonTypography variant="button" color="secondary">
          <Icon
            sx={{
              lineHeight: 1.2,
              mr: 0.5,
            }}
          >
            watch_later
          </Icon>
        </ArgonTypography>
        {date}
      </ArgonTypography>
    </ArgonBox>
  </MenuItem>
));

// Setting default values for the props of NotificationItem
NotificationItem.defaultProps = {
  color: "dark",
};

// Typechecking props for the NotificationItem
NotificationItem.propTypes = {
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "light",
    "dark",
  ]),
  image: PropTypes.node.isRequired,
  title: PropTypes.arrayOf(PropTypes.string).isRequired,
  date: PropTypes.string.isRequired,
};

export default NotificationItem;
