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
import ArgonSelect from "components/ArgonSelect";
import HasPermissionButton from "slots/Custom/Buttons/HasPermissionButton";
import CardWrapper from "slots/Cards/CardWrapper";

function PermissionAdd() {
  const navigate = useNavigate();

  const [params, setParams] = useState({
    name: "",
    navigation_id: "",
  });
  const [navigations, setNavigations] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [response, setResponse] = useState(null);

  const getNavigations = () => {
    HTTP_CLIENT(APIFY("/v1/navigations"), {}).then((data) => {
      setNavigations(data["navigations"]);
    });
  };

  const updateParams = (key, value) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const onFormSubmit = async (ev) => {
    ev.preventDefault();
    HTTP_CLIENT(APIFY("/v1/permissions/create"), { params: params })
      .then((response) => {
        if (response["success"]) {
          setResponse("success");
          setSnackbarOpen(true);
          navigate(GET_ROUTE_NAME("LIST_PERMISSION"), { state: { success: true, type: "CREATE" } });
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

  useEffect(() => {
    getNavigations();
  }, []);

  return (
    <DashboardLayout breadcrumbTitle="Manage Permission">
      <ArgonBox component="form" role="form" onSubmit={onFormSubmit}>
        <CardWrapper
          headerTitle="Create Permission"
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
                label="Permission Name*"
                placeholder="Enter Permission Name "
                onChange={(ev) => updateParams("name", ev.target.value)}
                required
              />
            </Grid>
            <Grid item xs={6} position={""}>
              <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
                <ArgonTypography
                  component="label"
                  variant="caption"
                  fontWeight="bold"
                  textTransform="capitalize"
                >
                  Select Navigation*
                </ArgonTypography>
              </ArgonBox>

              <ArgonSelect
                placeholder="Select Navigation"
                onChange={(e) => updateParams("navigation_id", e.value)}
                options={navigations.map((navigation, key) => {
                  return {
                    label: navigation.name,
                    value: navigation.uuid,
                  };
                })}
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
            ? "Permission Created Successfully"
            : response === "error"
            ? "Permission Creation Failed"
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
export default PermissionAdd;
