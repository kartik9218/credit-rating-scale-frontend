import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import {
  DashboardOutlined,
  ArchiveOutlined,
  SettingsOutlined,
  SupervisorAccountOutlined,
  PersonOutlineOutlined,
  WorkOutlineOutlined,
  KeyOutlined,
  MailOutlineOutlined,
  GroupsOutlined,
  NearMeOutlined,
  ManageAccountsOutlined,
  HomeWorkOutlined,
  StadiumOutlined,
  WorkHistoryOutlined,
  StarHalfOutlined,
  ManageHistoryOutlined,
  StarsOutlined,
} from "@mui/icons-material";
import { useArgonController } from "context";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import { GET_USER_PROPS } from "helpers/Base";
import ArgonBox from "components/ArgonBox";
import ArgonAvatar from "components/ArgonAvatar";
import ArgonTypography from "components/ArgonTypography";
import SidenavItem from "./SidenavItem";
import SidenavList from "./SidenavList";
import SidenavRoot from "./SidenavRoot";
import SidenavFooter from "./SidenavFooter";

function Sidenav({ color, brand, brandName, routes, minisidenav, ...rest }) {
  const [controller, dispatch] = useArgonController();
  const location = useLocation();
  const { darkSidenav, layout } = controller;
  const [navigationPath, setNavigationPath] = useState([]);
  const [menu, setMenu] = useState([]);
  const [openNestedCollapse, setOpenNestedCollapse] = useState(false);
  const [icons, setIcons] = useState({
    "Dashboard": <DashboardOutlined />,
    "Inbox": <MailOutlineOutlined />,
    "Settings": <SettingsOutlined />,
    "UserManagement": <SupervisorAccountOutlined />,
    "Users": <PersonOutlineOutlined />,
    "Roles": <GroupsOutlined />,
    "Permissions": <KeyOutlined />,
    "Navigations": <NearMeOutlined />,
    "RatingModules": <StarHalfOutlined />,
    "CompanyManagement": <WorkOutlineOutlined />,
    "UserSettings": <ManageAccountsOutlined />,
    "CompanyMandate": <ManageAccountsOutlined />,
    "Masters": <SettingsOutlined />,
    "WorkflowManagement":<WorkHistoryOutlined/>,
    "Workflow":<HomeWorkOutlined/>,
    "Activities":<StadiumOutlined/>,
    "RatingProcess":<ManageHistoryOutlined/>,
    "RatingLetter":<StarsOutlined/>
  });

  useEffect(() => {
    prepareMenuEntries();
  }, []);

  const prepareMenuEntries = () => {
    const menu = GET_USER_PROPS("menu", "active_role");
    let navigationpaths = {};
    if (menu.length > 0) {
      menu.forEach((parentMenu) => {
        if (parentMenu.inner_menu && parentMenu.inner_menu.length > 0) {
          navigationpaths[parentMenu.path] = [parentMenu.path];
          parentMenu.inner_menu.forEach((childMenu) => {
            if (parentMenu.path in navigationpaths) {
              navigationpaths[parentMenu.path].push(childMenu.path);
            } else {
              navigationpaths[parentMenu.path] = [parentMenu.path];
            }
          });
        } else {
          navigationpaths[parentMenu.path] = [parentMenu.path];
        }
      });
    }
    setNavigationPath(navigationpaths)
    setMenu(menu);
  };


  return (
    <SidenavRoot
      {...rest}
      variant="permanent"
      minisidenav={`${minisidenav}`}
      ownerState={{ darkSidenav, layout }}
    >
      <ArgonBox pt={3} pb={1} px={2} textAlign="center">
        <ArgonBox
          display={{ xs: "block", xl: "none" }}
          position="absolute"
          top={0}
          right={0}
          p={1.625}
          // onClick={closeSidenav}
          sx={{ cursor: "pointer" }}
        >
          <ArgonTypography variant="h6" color="secondary">
            <Icon sx={{ fontWeight: "bold" }}>close</Icon>
          </ArgonTypography>
        </ArgonBox>

        <ArgonBox component={NavLink} to="/dashboard" display="flex" alignItems="center">
          <ArgonBox width="100%">
            <ArgonTypography
              component="h6"
              variant="button"
              fontWeight="medium"
              color={darkSidenav ? "white" : "dark"}
              sx={{ width: "200px" }}
            >
              <ArgonAvatar
                src={brandName}
                alt="Infomerics"
                variant="square"
                sx={{
                  width: `${minisidenav ? "60px" : "auto"}`,
                  height: "auto",
                  objectFit: "contain",
                }}
              />
            </ArgonTypography>
          </ArgonBox>
        </ArgonBox>
      </ArgonBox>

      <Divider light={darkSidenav} />

      <SidenavList
       className="sidenav-box"
      >
        {[...new Map(menu.map((item) => [item["uuid"], item])).values()].map((entry) => {
          if (entry.inner_menu && entry.inner_menu.length > 0) {
            return (
              <React.Fragment key={entry.uuid}>
                <SidenavItem
                  sx={{
                    cursor:"pointer !important",                    
                    ".MuiSvgIcon-root": {
                      fontSize: `${minisidenav ? '25px !important': 'auto'}`,
                     },
                  }}
                  active={navigationPath[entry.path].indexOf(location.pathname) !== -1 && true}
                  key={entry.uuid}
                  name={!minisidenav ? entry.name :""}
                  open={
                    openNestedCollapse === entry.name ||
                    (navigationPath[entry.path].indexOf(location.pathname) !== -1 && true)
                  }
                  icon={entry.icon ? icons[`${entry.icon}`] : <DashboardOutlined /> }
                  onClick={() => {
                    openNestedCollapse === entry.name
                      ? setOpenNestedCollapse(false)
                      : setOpenNestedCollapse(entry.name)
                  }
                  }
                >
                  {[...new Map(entry.inner_menu.map(item => [item["uuid"], item])).values()].map((innerMenu) => {
                    return (
                      <NavLink to={innerMenu.path} key={innerMenu.uuid}>
                        <SidenavItem
                          key={innerMenu.uuid}
                          name={!minisidenav ? innerMenu.name : ""}
                          sx={{
                            paddingLeft: "10px",
                            ".MuiSvgIcon-root": {
                              fontSize: `${minisidenav ? '25px !important': 'auto'}`,
                            },
                          }}
                          icon={innerMenu.icon ? icons[innerMenu.icon] : <DashboardOutlined /> }
                          active={innerMenu.path === location.pathname}
                          style={{ fontSize: "90%" }}
                        />
                      </NavLink>
                    );
                  })}
                </SidenavItem>
              </React.Fragment>
            );
          } else {
            return (
              <NavLink to={entry.path} key={entry.uuid} display="flex">
                <SidenavItem
                  sx={{
                    ".MuiSvgIcon-root": {
                      fontSize: `${minisidenav ? '25px !important': 'auto'}`,
                    },
                  }}
                  name={!minisidenav && entry.name}
                  icon={entry.icon ? icons[`${entry.icon}`] : <DashboardOutlined /> }
                  active={entry.path === location.pathname}
                />
              </NavLink>
            );
          }
        })}
      </SidenavList>

      <Divider light={darkSidenav} />

      <ArgonBox pt={1} mt="auto" mb={2} mx={2}>
        {!minisidenav && <SidenavFooter />}
      </ArgonBox>
    </SidenavRoot>
  );
}

// Setting default values for the props of Sidenav
Sidenav.defaultProps = {
  color: "info",
  brand: "",
};

// Typechecking props for the Sidenav
Sidenav.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  brand: PropTypes.string,
  minisidenav: PropTypes.bool,
  brandName: PropTypes.string.isRequired,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Sidenav;
 