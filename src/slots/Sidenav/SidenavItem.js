import PropTypes from "prop-types";
import Collapse from "@mui/material/Collapse";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Icon from "@mui/material/Icon";
import ArgonBox from "components/ArgonBox";
import { itemArrow, itemContent } from "./styles/sidenavItem";

function SidenavItem({ name, active, nested, children,icon='', open, ...rest }) {
  const { miniSidenav, darkSidenav } = {
    miniSidenav: false,
    darkSidenav: false 
  };

  return (
    <>
      <ListItem {...rest} component="li" >
        <ArgonBox 
          sx={(theme) => itemContent(theme, { active, miniSidenav, darkSidenav, name, nested })}
        >
          {icon} 
          <ListItemText primary={`${name}`} sx={{marginLeft:'10px'}}/>
          {children && (
            <Icon component="i" sx={(theme) => itemArrow(theme, { open, miniSidenav  })}>
              expand_less 
            </Icon>
          )}
        </ArgonBox>
      </ListItem>
      {children && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          {children}
        </Collapse>
      )}
    </>
  );
}

// Setting default values for the props of SidenavItem
SidenavItem.defaultProps = {
  active: false,
  nested: false,
  children: false,
  open: false,
};

// Typechecking props for the SidenavItem
SidenavItem.propTypes = {
  name: PropTypes.string.isRequired,
  active: PropTypes.bool,
  nested: PropTypes.bool,
  children: PropTypes.node,
  open: PropTypes.bool,
  icon: PropTypes.element
};

export default SidenavItem;
