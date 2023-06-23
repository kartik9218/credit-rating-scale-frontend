import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import { ArrowBackRounded } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { HTTP_CLIENT, APIFY } from "helpers/Api";
import { SET_PAGE_TITLE } from "helpers/Base";
import { GET_ROUTE_NAME } from "helpers/Base";
import { GET_QUERY } from "helpers/Base";
import { ArgonSnackbar } from "components/ArgonTheme";
import ArgonButton from "components/ArgonButton";
import ArgonTypography from "components/ArgonTypography";
import { ArgonBox } from "components/ArgonTheme";
import FormField from "slots/FormField";
import { DashboardLayout } from "layouts";
import { Backdrop, CircularProgress } from "@mui/material";
import ArgonSelect from "components/ArgonSelect";
import HasPermissionButton from "slots/Custom/Buttons/HasPermissionButton";
import CardWrapper from "slots/Cards/CardWrapper";

function PermissionEdit() {
  const navigate = useNavigate();
  const [params, setParams] = useState({
    uuid: "",
    name: "",
    navigation_id: "",
  });

  const [permission, setPermission] = useState(undefined);
  const [navigations, setNavigations] = useState([]);
  const [selectedPermissionNavigation, setSelectedPermissionNavigation] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [response, setResponse] = useState(null);
  const [backdropOpen, setBackdropOpen] = useState(false);

  const navigationUuid = GET_QUERY("uuid");

  const onChangeNavigation = (opt) => {
    updateParams("navigation_id", opt.value);
    setSelectedPermissionNavigation(opt);
  };

  const onFormSubmit = async (ev) => {
    ev.preventDefault();
    HTTP_CLIENT(APIFY("/v1/permissions/edit"), { params: params })
      .then((response) => {
        if (response["success"]) {
          setResponse("success");
          setSnackbarOpen(true);
          navigate(GET_ROUTE_NAME("LIST_PERMISSION"), { state: { success: true, type: "UPDATE" } });
          return;
        }
      })
      .catch((err) => {
        setResponse("error");
        setSnackbarOpen(true);
      });
  };

  const updateParams = (key, value) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const fetchInitData = async () => {
    setBackdropOpen(true);
    const response = await HTTP_CLIENT(APIFY("/v1/permissions/view"), { uuid: navigationUuid });
    const permission = response["permission"];
    if (permission) {
      let isSelectPermission = permission.navigations ? permission.navigations[0].uuid : "";
      updateParams("uuid", navigationUuid);
      updateParams("name", permission["name"]);
      updateParams("navigation_id", isSelectPermission);
      setPermission(permission);
      HTTP_CLIENT(APIFY("/v1/navigations"), {}).then((data) => {
        setNavigations(data["navigations"]);
        data["navigations"].map((nav) => {
          if (nav.uuid === isSelectPermission) {
            setSelectedPermissionNavigation({ label: nav["name"], value: nav["uuid"] });
          }
        });
      });
    }

    setBackdropOpen(false);
  };

  const onCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    SET_PAGE_TITLE(`Permission Update`);

    let ajaxEvent = true;
    if (ajaxEvent) {
      fetchInitData();
    }

    return () => {
      ajaxEvent = false;
    };
  }, []);

  return (
    <DashboardLayout breadcrumbTitle="Manage Permission">
      <ArgonBox component="form" role="form" onSubmit={onFormSubmit}>
        <CardWrapper
          headerTitle="Update Permission"
          headerActionButton={() => {
            return (
              <HasPermissionButton
                color="primary"
                permissions={["/dashboard/permissions"]}
                route={GET_ROUTE_NAME("LIST_PERMISSION")}
                text={`Back to Permissons`}
                icon={<ArrowBackRounded />}
              />
            );
          }}
          footerActionButton={() => {
            return (
              <ArgonBox spacing={3} padding="1rem" display={"flex"} justifyContent="flex-end">
                <ArgonButton type="submit" color="success">
                  Update
                </ArgonButton>
              </ArgonBox>
            );
          }}
        >
          {!backdropOpen && permission && (
            <Grid container spacing={3} paddingLeft="1rem" paddingRight="1rem">
              <Grid item xs={3} sm={6} md={6}>
                <FormField
                  type="text"
                  name="name"
                  label="Permission Name"
                  placeholder="Enter Permission Name"
                  value={params.name}
                  disabled={true}
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
                    Select Navigation
                  </ArgonTypography>
                </ArgonBox>
                <ArgonSelect
                  placeholder="Select Navigation"
                  onChange={onChangeNavigation}
                  options={navigations.map((navigation, key) => {
                    return {
                      label: navigation.name,
                      value: navigation.uuid,
                    };
                  })}
                  value={[selectedPermissionNavigation]}
                />
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
            ? "Permission Updated Successfully"
            : response === "error"
            ? "Permission Updation Failed"
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
      {!backdropOpen && !permission && <div>No such permission!</div>}
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={backdropOpen}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </DashboardLayout>
  );
}
export default PermissionEdit;
