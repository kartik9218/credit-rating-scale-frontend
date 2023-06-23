import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import { ArrowBackRounded } from "@mui/icons-material";
import { HTTP_CLIENT, APIFY } from "helpers/Api";
import { GET_ROUTE_NAME } from "helpers/Base";
import { ArgonSnackbar } from "components/ArgonTheme";
import ArgonButton from "components/ArgonButton";
import ArgonTypography from "components/ArgonTypography";
import { ArgonBox } from "components/ArgonTheme";
import FormField from "slots/FormField";
import { DashboardLayout } from "layouts";
import { Checkbox, FormControlLabel } from "@mui/material";
import ArgonSelect from "components/ArgonSelect";
import HasPermissionButton from "slots/Custom/Buttons/HasPermissionButton";
import CardWrapper from "slots/Cards/CardWrapper";

function NavigationAdd() {
  const navigate = useNavigate();
  const [params, setParams] = useState({
    name: "",
    path: "",
    description: "",
    menu_position: "",
    is_sidebar_visible: "",
    icon: "",
    parent_navigation_id: "",
  });

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [response, setResponse] = useState(null);
  const [navigations, setNavigations] = useState([]);

  const getNavigations = (params) => {
    HTTP_CLIENT(APIFY("/v1/navigations"), params).then((data) => {
      setNavigations(data["navigations"]);
    });
  };

  const onFormSubmit = async (ev) => {
    ev.preventDefault();
    HTTP_CLIENT(APIFY("/v1/navigations/create"), { params: params })
      .then((response) => {
        if (response["success"]) {
          setResponse("success");
          setSnackbarOpen(true);
          getNavigations();
          navigate(GET_ROUTE_NAME("LIST_NAVIGATION"), { state: { success: true, type: "CREATE" } });
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

  useEffect(() => {
    getNavigations({ is_parent: true });
  }, []);
  return (
    <DashboardLayout breadcrumbTitle="Manage Navigation">
      <ArgonBox component="form" role="form" onSubmit={onFormSubmit}>
        <CardWrapper
          headerTitle="Create Navigation"
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
              <ArgonBox spacing={3} padding="1rem" display="flex" justifyContent={"flex-end"}>
                <ArgonButton type="submit" color="success">
                  Submit
                </ArgonButton>
              </ArgonBox>
            );
          }}
        >
          <Grid container spacing={3} paddingLeft="1rem" paddingRight="1rem">
            <Grid item xs={3} sm={6} md={6}>
              <FormField
                type="text"
                name="name"
                label="Navigation Name*"
                placeholder="Enter Navigation Name "
                onChange={(e) => updateParams("name", e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={3} sm={6} md={6}>
              <FormField
                type="text"
                name="path"
                label="Path Name*"
                placeholder="Enter Path Name"
                onChange={(e) => updateParams("path", e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={3} sm={6} md={6}>
              <FormField
                type="text"
                name="description"
                label="Description"
                placeholder="Enter Description"
                onChange={(e) => updateParams("description", e.target.value)}
              />
            </Grid>
            <Grid item xs={3} sm={6} md={6}>
              <FormField
                type="number"
                name="menu_position"
                label="Menu Position"
                placeholder="Enter Menu Position"
                onChange={(e) => updateParams("menu_position", e.target.value)}
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
                onChange={(e) => updateParams("icon", e.value)}
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
                {
                  label:"Rating Letter",
                  value: "RatingLetter",
                }
                ]}
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
                onChange={(e) => updateParams("parent_navigation_id", e.value)}
                options={navigations.map((navigation) => {
                  return {
                    label: navigation.name,
                    value: navigation.uuid,
                  };
                })}
              />
            </Grid>
            <Grid item paddingLeft={3} xs={3} sm={6} md={6} display="flex">
              <FormControlLabel
                control={
                  <Checkbox
                    name="is_sidebar_visible"
                    onChange={(e) => updateParams("is_sidebar_visible", e.target.checked)}
                  />
                }
                label="Is Sidebar Visible"
              />
            </Grid>
          </Grid>
        </CardWrapper>
      </ArgonBox>

      <ArgonSnackbar
        color={response}
        icon={response ? response : "error"}
        title={
          response === "success"
            ? "Navigation Created Successfully"
            : response === "error"
            ? "Navigation Creation Failed"
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
    </DashboardLayout>
  );
}
export default NavigationAdd;
