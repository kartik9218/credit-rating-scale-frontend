import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "layouts";
import Grid from "@mui/material/Grid";
import { ArrowBackRounded } from "@mui/icons-material";
import { HTTP_CLIENT, APIFY } from "helpers/Api";
import { GET_ROUTE_NAME, SET_PAGE_TITLE } from "helpers/Base";
import ArgonButton from "components/ArgonButton";
import { ArgonBox } from "components/ArgonTheme";
import ArgonSelect from "components/ArgonSelect";
import ArgonTypography from "components/ArgonTypography";
import FormField from "slots/FormField";
import { ArgonSnackbar } from "components/ArgonTheme";
import { Backdrop, CircularProgress } from "@mui/material";
import HasPermissionButton from "slots/Custom/Buttons/HasPermissionButton";
import CardWrapper from "slots/Cards/CardWrapper";

function RoleCreate() {
  const navigate = useNavigate();
  const [params, setParams] = useState({
    name: "",
    description: "",
    permissions_uuid: [],
  });
  const [permissionsOption, setPermissionsOption] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState(false);
  const [backdropOpen, setBackdropOpen] = useState(false);

  const updateParams = (key, value) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const fetchInitData = () => {
    HTTP_CLIENT(APIFY("/v1/permissions"), {}).then((data) => {
      const permissions = data["permissions"].map((permission) => {
        return {
          label: permission["name"],
          value: permission["uuid"],
        };
      });
      setPermissionsOption(permissions);
    });
  };

  const onChangePermissionsOption = (opts) => {
    var permissionUuids = [];
    opts.forEach((opt) => {
      permissionUuids.push(opt["value"]);
    });
    updateParams("permissions_uuid", permissionUuids);
  };

  const onFormSubmit = (ev) => {
    ev.preventDefault();

    if (params["permissions_uuid"].length === 0) {
      setSnackbarMessage(`Please select at-least one or more permissions.`);
      setSnackbarOpen(true);
      return;
    }

    setBackdropOpen(true);

    HTTP_CLIENT(APIFY("/v1/roles/create"), { params })
      .then((res) => {
        if (res["success"]) {
          navigate(GET_ROUTE_NAME("LIST_ROLES"), { state: { success: true, type: "CREATE" } });
          return;
        }
      })
      .catch((err) => {
        setSnackbarMessage(`Something went wrong while creating role.`);
        setSnackbarOpen(true);
      });
  };

  useEffect(() => {
    SET_PAGE_TITLE(`Role Create`);

    let ajaxEvent = true;
    if (ajaxEvent) {
      fetchInitData();
    }

    return () => {
      ajaxEvent = false;
    };
  }, []);

  return (
    <DashboardLayout breadcrumbTitle="Role Create">
      <ArgonBox component="form" role="form" onSubmit={onFormSubmit}>
        <CardWrapper
          headerTitle={"Create Role"}
          headerActionButton={() => {
            return (
              <HasPermissionButton
                color="primary"
                permissions={["/dashboard/roles"]}
                route={GET_ROUTE_NAME("LIST_ROLES")}
                text={`Back to Roles`}
                icon={<ArrowBackRounded />}
              />
            );
          }}
          footerActionButton={() => {
            return (
              <ArgonBox spacing={3} padding="1rem"  display={"flex"} justifyContent={"flex-end"}>
                <ArgonButton color="success" type="submit">
                  Submit
                </ArgonButton>
              </ArgonBox>
            );
          }}
        >
          <Grid container spacing={2} paddingLeft="1rem" paddingRight="1rem">
            <Grid item xs={12}>
              <FormField
                name="name"
                type="text"
                label="Provide Role Name*"
                placeholder="Role Name (Eg: Group Head)"
                onChange={(ev) => updateParams("name", ev.target.value)}
                value={params["name"]}
                required={true}
                autoFocus={true}
              />
            </Grid>

            <Grid item xs={12}>
              <FormField
                name="description"
                type="text"
                label="Provide Role Description"
                placeholder="Role Description (Optional)"
                onChange={(ev) => updateParams("description", ev.target.value)}
                value={params["description"]}
              />
            </Grid>

            <Grid item xs={12}>
              <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
                <ArgonTypography
                  component="label"
                  variant="caption"
                  fontWeight="bold"
                  textTransform="capitalize"
                >
                  Select Permissions*
                </ArgonTypography>
              </ArgonBox>

              <ArgonSelect
                placeholder="Select Permissions"
                onChange={onChangePermissionsOption}
                options={permissionsOption}
                isMulti="true"
              />
            </Grid>
          </Grid>
        </CardWrapper>
      </ArgonBox>
      <ArgonSnackbar
        color="error"
        icon="notifications"
        title="Invalid request"
        content={snackbarMessage}
        translate="yes"
        dateTime=""
        open={snackbarOpen}
        close={(ev) => setSnackbarOpen(false)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      />

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={backdropOpen}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </DashboardLayout>
  );
}

export default RoleCreate;
