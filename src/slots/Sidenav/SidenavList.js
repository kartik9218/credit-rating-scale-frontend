// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";
// @mui material components
import List from "@mui/material/List";

function SidenavList({ children, className = "" }) {
  return (
    <List sx={{paddingLeft:"5px"}}
    className={className}  
    >
      {children}
    </List>
  );
}

// Typechecking props for the SidenavItem
SidenavList.propTypes = {
  children: PropTypes.node.isRequired,
  className:PropTypes.string
};

export default SidenavList;
