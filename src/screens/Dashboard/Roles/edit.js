import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { Backdrop, CircularProgress, Switch } from "@mui/material";
import { GET_QUERY } from "helpers/Base";
import HasPermissionButton from "slots/Custom/Buttons/HasPermissionButton";
import CardWrapper from "slots/Cards/CardWrapper";

function RoleEdit() {
  const navigate = useNavigate();
  const [role, setRole] = useState(undefined);
  const [params, setParams] = useState({
    uuid: "",
    name: "",
    description: "",
    permissions_uuid: [],
    is_active: true,
  });
  const [permissionsOption, setPermissionsOption] = useState([]);
  const [permissionsSelected, setPermissionsSelected] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState(false);
  const [backdropOpen, setBackdropOpen] = useState(false);

  const roleUuid = GET_QUERY("uuid");

  const updateParams = (key, value) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const fetchInitData = async () => {
    setBackdropOpen(true);
    const response = await HTTP_CLIENT(APIFY("/v1/roles/view"), { uuid: roleUuid });
    const role = response["role"];
    if (role) {
      const data = await HTTP_CLIENT(APIFY("/v1/permissions"), {});
      const permissions = data["permissions"].map((permission) => {
        return {
          label: permission["name"],
          value: permission["uuid"],
        };
      });

      var permissionsUuid = [];
      const permissionsSelected = role["permissions"].map((permission) => {
        permissionsUuid.push(permission["uuid"]);
        return {
          label: permission["name"],
          value: permission["uuid"],
        };
      });

      setPermissionsOption(permissions);
      setPermissionsSelected(permissionsSelected);
      setRole(role);

      updateParams("uuid", role["uuid"]);
      updateParams("name", role["name"]);
      updateParams("description", role["description"] ?? "");
      updateParams("permissions_uuid", permissionsUuid);
      updateParams("is_active", role["is_active"]);

      setBackdropOpen(false);
    }
  };

  const onChangePermissionsOption = (opts) => {
    var permissionUuids = [];
    opts.forEach((opt) => {
      permissionUuids.push(opt["value"]);
    });
    updateParams("permissions_uuid", permissionUuids);
    setPermissionsSelected(opts);
  };

  const onFormSubmit = (ev) => {
    ev.preventDefault();

    if (params["permissions_uuid"].length === 0) {
      setSnackbarMessage(`Please select at-least one or more permissions.`);
      setSnackbarOpen(true);
      return;
    }

    setBackdropOpen(true);

    HTTP_CLIENT(APIFY("/v1/roles/edit"), { params })
      .then((res) => {
        if (res["success"]) {
          navigate(GET_ROUTE_NAME("LIST_ROLES"), { state: { success: true, type: "UPDATE" } });
          return;
        }
      })
      .catch((err) => {
        setSnackbarMessage(`Something went wrong while updating role.`);
        setSnackbarOpen(true);
      });
  };

  useEffect(() => {
    SET_PAGE_TITLE(`Role Update`);

    let ajaxEvent = true;
    if (ajaxEvent) {
      fetchInitData();
    }

    return () => {
      ajaxEvent = false;
    };
  }, []);

  return (
    <DashboardLayout breadcrumbTitle="Role Update">
      <ArgonBox component="form" role="form" onSubmit={onFormSubmit}>
      <CardWrapper
        headerTitle="Update Role"
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
          return <ArgonBox padding={"1rem"} display={"flex"} justifyContent="flex-end">
          <ArgonButton color="success" type="submit">
            Update
          </ArgonButton>
        </ArgonBox>
        }}
      >
        {!backdropOpen && role && (
            <Grid container spacing={3} paddingLeft="1rem" paddingRight="1rem">
              <Grid item xs={12}>
                <FormField
                  name="name"
                  type="text"
                  label="Provide Role Name*"
                  placeholder="Role Name (Eg: Group Head)"
                  value={params["name"]}
                  disabled={true}
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
                  value={permissionsSelected}
                  isMulti="true"
                />
              </Grid>
              <Grid item paddingLeft={3} xs={3} sm={6} md={6} display="flex">
                <ArgonBox mr={1}>
                  <Switch
                    name="is_active"
                    checked={params["is_active"]}
                    onChange={(e) => updateParams("is_active", e.target.checked)}
                  />
                  {params["is_active"] ? "  Active" : "  Inactive"}
                </ArgonBox>
              </Grid>
            </Grid>
        )}
      </CardWrapper>
      </ArgonBox>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={backdropOpen}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      {!backdropOpen && !role && <div>No such role!</div>}
    </DashboardLayout>
  );
}

export default RoleEdit;
