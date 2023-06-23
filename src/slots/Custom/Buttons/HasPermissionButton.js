import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { HAS_PERMISSIONS } from "helpers/Base";
import { ArgonBox } from "components/ArgonTheme";
import { ArgonButton } from "components/ArgonTheme";

function HasPermissionButton(props) {
  const { permissions, route, text, color, icon, onClick = null } = props;
  return (
    <React.Fragment>
      {HAS_PERMISSIONS(permissions) && (
        <ArgonBox paddingRight="10px">
          <ArgonButton color={color ? color : "primary"} component={Link} to={route} onClick={onClick}>
            {icon}
            <ArgonBox margin={"3px"} />
            {text}
          </ArgonButton>
        </ArgonBox>
      )}
    </React.Fragment>
  );
}

HasPermissionButton.propTypes = {
  permissions: PropTypes.array,
  route: PropTypes.string,
  text: PropTypes.string,
  color: PropTypes.string,
  icon: PropTypes.element,
  onClick: PropTypes.func,
};

export default HasPermissionButton;
