import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import { ArrowBackRounded } from "@mui/icons-material";
import { HTTP_CLIENT, APIFY } from "helpers/Api";
import { ArgonSnackbar } from "components/ArgonTheme";
import ArgonButton from "components/ArgonButton";
import ArgonTypography from "components/ArgonTypography";
import { ArgonBox } from "components/ArgonTheme";
import FormField from "slots/FormField";
import { DashboardLayout } from "layouts";
import { Backdrop, CircularProgress, Switch } from "@mui/material";
import { SET_PAGE_TITLE } from "helpers/Base";
import { GET_QUERY } from "helpers/Base";
import { GET_ROUTE_NAME } from "helpers/Base";
import ArgonSelect from "components/ArgonSelect";
import HasPermissionButton from "slots/Custom/Buttons/HasPermissionButton";
import CardWrapper from "slots/Cards/CardWrapper";

function NavigationEdit() {
  const navigate = useNavigate();
  const [params, setParams] = useState({
    uuid: "",
    name: "",
    path: "",
    description: "",
    menu_position: "",
    is_sidebar_visible: "",
    icon: "",
    parent_navigation_id: "",
    navigation_id: "",
  });

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [navigation, setNavigation] = useState(undefined);
  const [response, setResponse] = useState(null);
  const [navigations, setNavigations] = useState([]);
  const [selectedIcon, setSelectedIcon] = useState([]);
  const [backdropOpen, setBackdropOpen] = useState(false);
  const [selectedNavigation, setSelectedNavigation] = useState([]);

  const navigationUuid = GET_QUERY("uuid");

  const onChangeIcon = (opt) => {
    updateParams("icon", opt.value);
    setSelectedIcon(opt);
  };
  const onChangeNavigation = (opt) => {
    updateParams("parent_navigation_id", opt.value);
    setSelectedNavigation(opt);
  };

  const onFormSubmit = async (ev) => {
    ev.preventDefault();
    HTTP_CLIENT(APIFY("/v1/navigations/edit"), { params: params })
      .then((response) => {
        if (response["success"]) {
          setResponse("success");
          setSnackbarOpen(true);
          navigate(GET_ROUTE_NAME("LIST_NAVIGATION"), { state: { success: true, type: "UPDATE" } });
          return;
        }
      })
      .catch((err) => {
        setResponse("error");
        setSnackbarOpen(true);
      });
  };

  const onCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const updateParams = (key, value) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const fetchInitData = async () => {
    setBackdropOpen(true);
    const response = await HTTP_CLIENT(APIFY("/v1/navigations/view"), { uuid: navigationUuid });
    const navigation = response["navigation"];
    if (navigation) {
      HTTP_CLIENT(APIFY("/v1/navigations"), { is_parent: true }).then((data) => {
        setNavigations(data["navigations"]);
        data["navigations"].map((nav) => {
          if (nav.uuid === navigation.parent_navigation.uuid) {
            setSelectedNavigation({ label: nav["name"], value: nav["uuid"] });
          }
        });
      });
      updateParams("uuid", navigationUuid);
      updateParams("name", navigation["name"]);
      updateParams("path", navigation["path"]);
      updateParams("description", navigation["description"] ?? "");
      updateParams("menu_position", navigation["menu_position"]);
      updateParams("is_sidebar_visible", navigation["is_sidebar_visible"]);
      updateParams("icon", navigation["icon"]);
      setSelectedIcon({ value: navigation["icon"], label: navigation["icon"] });
      updateParams("parent_navigation_id", navigation?.parent_navigation?.uuid);
      updateParams("navigation_id", navigation["navigation_id"]);
      setNavigation(navigation);
    }

    setBackdropOpen(false);
  };

  useEffect(() => {
    SET_PAGE_TITLE(`Navigation Update`);

    let ajaxEvent = true;
    if (ajaxEvent) {
      fetchInitData();
    }

    return () => {
      ajaxEvent = false;
    };
  }, []);

  return (
    <DashboardLayout breadcrumbTitle="Manage Navigation">
      <ArgonBox component="form" role="form" onSubmit={onFormSubmit}>
        <CardWrapper
          headerTitle="Update Navigation"
          headerActionButton={() => {
            return (
              <HasPermissionButton
                color="primary"
                permissions={["/dashboard/navigations"]}
                route={GET_ROUTE_NAME("LIST_NAVIGATION")}
                text={`Back to Navigation`}
                icon={<ArrowBackRounded />}
              />
            );
          }}
          footerActionButton={() => {
            return (
              <ArgonBox spacing={3} padding="1rem" display="flex" justifyContent="flex-end">
                <ArgonButton type="submit" color="success">
                  Update
                </ArgonButton>
              </ArgonBox>
            );
          }}
        >
          {!backdropOpen && navigation && (
            <Grid container spacing={3} paddingLeft="1rem" paddingRight="1rem">
              <Grid item xs={3} sm={6} md={6}>
                <FormField
                  type="text"
                  name="name"
                  label="Navigation Name*"
                  value={params["name"]}
                  disabled={true}
                />
              </Grid>
              <Grid item xs={3} sm={6} md={6}>
                <FormField
                  type="text"
                  name="path"
                  label="Path Name"
                  placeholder="Enter Path Name* "
                  onChange={(e) => updateParams("path", e.target.value)}
                  value={params["path"]}
                  required={true}
                />
              </Grid>
              <Grid item xs={3} sm={6} md={6}>
                <FormField
                  type="text"
                  name="description"
                  label="Description"
                  placeholder="Enter Description"
                  onChange={(e) => updateParams("description", e.target.value)}
                  value={params["description"]}
                />
              </Grid>
              <Grid item xs={3} sm={6} md={6}>
                <FormField
                  type="number"
                  name="menu_position"
                  label="Menu Position"
                  placeholder="Enter Menu Position"
                  onChange={(e) => updateParams("menu_position", e.target.value)}
                  value={params["menu_position"]}
                />
              </Grid>
              <Grid item xs={6}>
                <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
                  <ArgonTypography
                    component="label"
                    variant="caption"
                    fontWeight="bold"
                    textTransform="capitalize"
                  >
                    Icon
                  </ArgonTypography>
                </ArgonBox>
                <ArgonSelect
                  placeholder="Select Icon"
                  onChange={onChangeIcon}
                  options={[
                    {
                      label: "Dashboard",
                      value: "Dashboard",
                    },
                    {
                      label: "Inbox",
                      value: "Inbox",
                    },
                    {
                      label: "Settings",
                      value: "Settings",
                    },
                    {
                      label: "User Management",
                      value: "UserManagement",
                    },
                    {
                      label: "Users",
                      value: "Users",
                    },
                    {
                      label: "Roles",
                      value: "Roles",
                    },
                    {
                      label: "Permissions",
                      value: "Permissions",
                    },
                    {
                      label: "Navigations",
                      value: "Navigations",
                    },
                    {
                      label: "Rating Modules",
                      value: "RatingModules",
                    },
                    {
                      label: "Company Management",
                      value: "CompanyManagement",
                    },
                    {
                      label: "User Settings",
                      value: "UserSettings",
                    },
                    {
                      label: "Company Mandate",
                      value: "CompanyMandate",
                    },
                    {
                      label: "Masters",
                      value: "Masters",
                    },
                    {
                      label: "Workflow Management",
                      value: "WorkflowManagement",
                    },
                    {
                      label: "Workflow",
                      value: "Workflow",
                    },
                    {
                      label: "Activities",
                      value: "Activities",
                    },
                    {
                      label: "Workflow Instances",
                      value: "WorkflowInstances",
                    },
                  ]}
                  value={[selectedIcon]}
                />
              </Grid>
              <Grid item xs={6}>
                <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
                  <ArgonTypography
                    component="label"
                    variant="caption"
                    fontWeight="bold"
                    textTransform="capitalize"
                  >
                    Parent Navigation
                  </ArgonTypography>
                </ArgonBox>

                <ArgonSelect
                  placeholder="Select Parent Navigation"
                  onChange={onChangeNavigation}
                  options={navigations.map((navigation, key) => {
                    return {
                      label: navigation.name,
                      value: navigation.uuid,
                    };
                  })}
                  value={[selectedNavigation]}
                />
              </Grid>
              <Grid item paddingLeft={3} xs={3} sm={6} md={6} display="flex">
                <ArgonBox mr={1}>
                  <Switch
                    name="is_sidebar_visible"
                    checked={params["is_sidebar_visible"]}
                    onChange={(e) => updateParams("is_sidebar_visible", e.target.checked)}
                  />
                  {params["is_sidebar_visible"]
                    ? "  Is Visible on Sidebar"
                    : "  Is Not Visible on Sidebar"}
                </ArgonBox>
              </Grid>
            </Grid>
          )}
        </CardWrapper>
      </ArgonBox>

      <ArgonSnackbar
        color={response}
        icon={response ? response : "error"}
        title={
          response === "success"
            ? "Navigation Updated Successfully"
            : response === "error"
            ? "Navigation Updation Failed"
            : ""
        }
        content=""
        translate="yes"
        dateTime=""
        open={snackbarOpen}
        close={onCloseSnackbar}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      />
      {!backdropOpen && !navigation && <div>No such navigation!</div>}
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={backdropOpen}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </DashboardLayout>
  );
}
export default NavigationEdit;
