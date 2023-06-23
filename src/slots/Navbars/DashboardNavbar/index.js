import { useEffect, useState } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { HTTP_CLIENT, APIFY } from "helpers/Api";
import { GET_ROUTE_NAME, GET_USER_PROPS, GET_USER_TYPE, DESTROY_DATA } from "helpers/Base";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Icon from "@mui/material/Icon";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { LogoutOutlined } from "@mui/icons-material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import NotificationItem from "slots/Items/NotificationItem";
import ArgonSelect from "components/ArgonSelect";
import { navbar, navbarContainer, navbarIconButton, navbarRow } from "./styles";
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemButton,
} from "@mui/material";
import { SET_DATA } from "helpers/Base";

function DashboardNavbar({ absolute, light, isMini, hendleSideNav }) {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(false);
  const [navbarType, setNavbarType] = useState(`sticky`);
  const [companies, setCompanies] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const { miniSidenav, transparentNavbar, fixedNavbar, openConfigurator } = false;
  const route = useLocation().pathname.split("/").slice(1);
  const handleOpenMenu = (event) => setOpenMenu(event.currentTarget);
  const handleCloseMenu = () => setOpenMenu(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const [profileEl, setProfileEl] = useState(null);

  const openRole = Boolean(anchorEl);
  const openProfile = Boolean(profileEl);

  const [selectedCompany, setSelectedCompany] = useState(undefined);
  const [roles, setRoles] = useState([]);

  const handleMenuOpen = (event) => (menuType) => {
    if (menuType === "ROLE") {
      setAnchorEl(event.currentTarget);
      return;
    }
    setProfileEl(event.currentTarget);
  };
  const handleMenuClose = (menuType) => {
    if (menuType === "ROLE") {
      setAnchorEl(null);
      return;
    }
    setProfileEl(null);
  };

  const getCompanies = () => {
    HTTP_CLIENT(APIFY("/v1/companies"), { is_active: true }).then((data) => {
      let result = data.companies.map((company) => {
        return {
          label: company.name,
          value: company.uuid,
        };
      });
      setCompanies(result);

      result.map((row) => {
        if (uuid === row["value"]) {
          setSelectedCompany(row);
        }
      });
    }).catch(err => {
      DESTROY_DATA();
      document.location.href = "/";
    });
  };

  // Render the notifications menu
  const renderMenu = () => (
    <Menu
      anchorEl={openMenu}
      anchorReference={null}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      open={Boolean(openMenu)}
      onClose={handleCloseMenu}
      sx={{ mt: 2 }}
    >
      <NotificationItem
        image={
          <Icon fontSize="small" sx={{ color: ({ palette: { white } }) => white.main }}>
            message
          </Icon>
        }
        title={["Task Created", "TATA Tea Pvt. Ltd."]}
        date="13 minutes ago"
        onClick={handleCloseMenu}
        style={{ width: "230px" }}
      />
      <NotificationItem
        image={
          <Icon fontSize="small" sx={{ color: ({ palette: { white } }) => white.main }}>
            message
          </Icon>
        }
        title={["Task Updated", "Ultra Tech Pvt. Ltd."]}
        date="1 day"
        onClick={handleCloseMenu}
      />
      <NotificationItem
        color="secondary"
        image={
          <Icon fontSize="small" sx={{ color: ({ palette: { white } }) => white.main }}>
            message
          </Icon>
        }
        title={["Data Uploaded", "Ultra Tech Pvt. Ltd."]}
        date="2 days"
        onClick={handleCloseMenu}
      />
    </Menu>
  );

  // Logout
  const logout = () => {
    var confirmLogout = confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      DESTROY_DATA();
      document.location.href = "/";
    } else {
      return false;
    }
  };

  // Change selected company
  const onChangeSelectedCompany = (ev) => {
    let route = GET_ROUTE_NAME("DASHBOARD_FOR_COMPANY", { uuid: ev["value"] });
    document.location.href = route;
  };

  const triggerAccountSwitch = (role) => {
    SET_DATA("active_role", role);
    navigate("/redirect");
  };

  useEffect(() => {
    // getCompanies();
    var roles = GET_USER_PROPS("roles");
    setRoles(roles);
  }, []);

  return (
    <AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={(theme) => navbar(theme, { transparentNavbar, absolute, light })}
    >
      <Toolbar sx={(theme) => navbarContainer(theme, { navbarType })}>
        <ArgonBox display="flex">
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={hendleSideNav}
            edge="start"
            sx={{ mr: 2, color: "#000000" }}
          >
            <MenuIcon />
          </IconButton>
          {false && <ArgonBox
            color={light && transparentNavbar ? "white" : "dark"}
            mb={{ xs: 1, md: 0 }}
            sx={(theme) => navbarRow(theme, { isMini })}
          >
            <ArgonBox style={{ width: "400px" }}>
              <ArgonSelect
                placeholder="Switch Companies"
                options={companies}
                value={selectedCompany}
                onChange={(ev) => onChangeSelectedCompany(ev)}
              />
            </ArgonBox>
            <ArgonBox
              color={light ? "white" : "inherit"}
              sx={{
                border: "1px solid #c2c2c2",
                borderRadius: "10px",
                padding: "10px",
                minWidth: "80px",
                marginLeft: "15px",
              }}
            >
              <>
                <IconButton
                  sx={{
                    justifyContent: "space-between",
                    display: "flex",
                    width: "100%",
                    padding: "0",
                  }}
                  size="small"
                >
                  <ArgonTypography
                    variant="button"
                    fontWeight="medium"
                    color={light && transparentNavbar ? "white" : "dark"}
                    textAlign="left"
                  >
                    <small>All Category</small>
                  </ArgonTypography>
                </IconButton>
              </>
            </ArgonBox>
          </ArgonBox>}
        </ArgonBox>

        <ArgonBox sx={(theme) => navbarRow(theme, { isMini })}>
          <IconButton
            size="small"
            title="Click to view Inbox"
            color={light && transparentNavbar ? "white" : "dark"}
            sx={navbarIconButton}
            variant="contained"
            onClick={() => navigate(GET_ROUTE_NAME("INBOX"))}
          >
            <Icon>notifications</Icon>
          </IconButton>
          {renderMenu()}
          <ArgonBox
            color={light ? "white" : "inherit"}
            sx={{
              border: "1px solid #c2c2c2",
              borderRadius: "10px",
              padding: "5px",
              minWidth: "150px",
              marginLeft: "15px",
              position: "relative",
              zIndex: "1500",
            }}
          >
            <Box onClick={(e) => handleMenuOpen(e)("ROLE")}>
              <Button
                sx={{
                  justifyContent: "space-between",
                  display: "flex",
                  width: "100%",
                  padding: "0",
                }}
                size="small"
                endIcon={
                  <KeyboardArrowDownIcon color="action" sx={{ height: "2em", width: "3em" }} />
                }
              >
                <ArgonTypography
                  variant="button"
                  fontWeight="medium"
                  color={light && transparentNavbar ? "white" : "dark"}
                  textAlign="left"
                >
                  <small>Signed in As</small> <br />
                  <b>{GET_USER_PROPS("name", "active_role")}</b>
                </ArgonTypography>
              </Button>
            </Box>
          </ArgonBox>
          <Menu
            id="demo-positioned-menu-role"
            anchorEl={anchorEl}
            open={openRole}
            onClose={() => handleMenuClose("ROLE")}
            sx={{
              marginTop: "3.5rem",
              zIndex: "1500",
              ".MuiPaper-root": {
                boxShadow: "0px 4px 16px -2px rgb(0 0 0)",
              },
            }}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
          >
            {roles?.map((row, key) => {
              return (
                <List key={row["uuid"]}>
                  <ListItem disableGutters>
                    <ListItemButton onClick={(ev) => triggerAccountSwitch(row)}>
                      {row["name"]}
                    </ListItemButton>
                  </ListItem>
                </List>
              );
            })}
          </Menu>

          <ArgonBox
            color={light ? "white" : "inherit"}
            sx={{
              border: "1px solid #c2c2c2",
              borderRadius: "10px",
              padding: "5px",
              minWidth: "150px",
              marginLeft: "15px",
              position: "relative",
              zIndex: "1500",
            }}
          >
            <Box onClick={(e) => handleMenuOpen(e)()}>
              <Button
                sx={{
                  justifyContent: "space-between",
                  display: "flex",
                  width: "100%",
                  padding: "0",
                }}
                size="small"
                endIcon={<AccountCircleIcon color="action" sx={{ height: "2em", width: "3em" }} />}
              >
                <ArgonTypography
                  variant="button"
                  fontWeight="medium"
                  color={light && transparentNavbar ? "white" : "dark"}
                  textAlign="left"
                >
                  <small style={{ fontSize: "9px" }}>Welcome,</small> <br />
                  <b style={{ fontSize: "12px" }}>
                    {user?.full_name && GET_USER_TYPE(user["full_name"])}
                  </b>
                </ArgonTypography>
              </Button>
            </Box>
          </ArgonBox>
          <Menu
            id="demo-positioned-menu-profile"
            anchorEl={profileEl}
            open={openProfile}
            onClose={handleMenuClose}
            sx={{
              marginTop: "3.5rem",
              zIndex: "1500",
              ".MuiPaper-root": {
                boxShadow: "0px 4px 16px -2px rgb(0 0 0)",
                width:"141px"
              },
            }}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
          >
            <List key={"logout"}>
              <ListItem disableGutters>
                <ListItemButton onClick={logout} sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}>
                  <span>Logout</span>
                  <LogoutOutlined />
                </ListItemButton>
              </ListItem>
            </List>
          </Menu>
        </ArgonBox>
      </Toolbar>
    </AppBar>
  );
}

// Setting default values for the props of DashboardNavbar
DashboardNavbar.defaultProps = {
  absolute: false,
  light: true,
  isMini: false,
  showCompany: false,
};

// Typechecking props for the DashboardNavbar
DashboardNavbar.propTypes = {
  showCompany: PropTypes.bool,
  breadcrumbTitle: PropTypes.string,
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
  hendleSideNav: PropTypes.func,
};

export default DashboardNavbar;
