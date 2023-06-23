import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import { ArrowBackRounded, Edit } from "@mui/icons-material";
import { Button, Switch } from "@mui/material";
import { HTTP_CLIENT, APIFY } from "helpers/Api";
import { SET_PAGE_TITLE } from "helpers/Base";
import { GET_ROUTE_NAME } from "helpers/Base";
import { DashboardLayout } from "layouts";
import { ArgonSnackbar, ArgonBox } from "components/ArgonTheme";
import ArgonButton from "components/ArgonButton";
import ArgonTypography from "components/ArgonTypography";
import HasPermissionButton from "slots/Custom/Buttons/HasPermissionButton";
import DataTable from "slots/Tables/DataTable";
import ArgonBadge from "components/ArgonBadge";
import CardWrapper from "slots/Cards/CardWrapper";
import { ArgonInput } from "components/ArgonTheme";
import { useNavigate } from "react-router-dom";
import { GET_QUERY } from "helpers/Base";

function NotchingModelEntity() {
  const navigate = useNavigate();
  const uuid = GET_QUERY("uuid");
  const [title, setTitle] = useState(uuid ? "Edit Notching Model" : "Add Notching Model");

  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [response, setResponse] = useState(null);
  const [backdropOpen, setBackdropOpen] = useState(false);
  const [params, setParams] = useState({
    uuid: uuid,
    name: "",
    is_active: "",
  });

  const updateParams = (key, value) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const fetchData = async () => {
    setBackdropOpen(true);
    HTTP_CLIENT(APIFY("/v1/notching_models/view"), {
      // params: {
      uuid: uuid,
      // },
    }).then((response) => {
      if (response["success"]) {
        updateParams("name", response.notching_model.name);
        updateParams("is_active", response.notching_model.is_active);

        return;
      }
    });

    setBackdropOpen(false);
  };

  const onFormSubmit = async (ev) => {
    ev.preventDefault();

    let url = uuid ? "/v1/notching_models/edit" : "/v1/notching_models/create";
    if (!uuid) {
      delete params.uuid;
      delete params.is_active;
    }

    HTTP_CLIENT(APIFY(url), { params: params })
      .then((response) => {
        if (response["success"]) {
          setResponse("success");
          setSnackbarOpen(true);
          navigate(GET_ROUTE_NAME("LIST_NOTCHING_MODEL"), { state: { success: true, type: uuid ? "UPDATE" : "CREATE" } });
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
    SET_PAGE_TITLE(title);
    if (uuid) {
      fetchData();
    }
  }, []);

  return (
    <DashboardLayout breadcrumbTitle={title}>
      <ArgonBox component="form" role="form" onSubmit={onFormSubmit}>
        <CardWrapper
          headerTitle={title}
          headerActionButton={() => {
            return <HasPermissionButton color="primary" permissions={["/dashboard/company/master/notching_models"]} route={GET_ROUTE_NAME("LIST_NOTCHING_MODEL")} text={`Back to NOTCHING MODELS`} icon={<ArrowBackRounded />} />;
          }}
          footerActionButton={() => {
            return (
              <>
                <ArgonBox display="flex" justifyContent="end" spacing={3} marginTop={"18px"} padding="1rem">
                  <ArgonButton type="submit" color="success">
                    {uuid ? "Update" : "Submit"}
                  </ArgonButton>
                </ArgonBox>
              </>
            );
          }}
        >
          {!backdropOpen && (
            <Grid container spacing={1} paddingLeft="1rem" paddingRight="1rem">
              <Grid item xs={12} sm={6} md={6}>
                <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
                  <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
                    Notching Model Name*
                  </ArgonTypography>
                </ArgonBox>
                <ArgonInput type="text" name="name" label="Name*" placeholder="Enter Notching Model Name " onChange={(ev) => updateParams("name", ev.target.value)} value={params["name"]} required />
              </Grid>

              {uuid && (
                <Grid item paddingLeft={3} marginTop={4} xs={12} sm={3} display="flex">
                  <ArgonBox mr={1}>
                    <Switch name="is_active" checked={params["is_active"]} onChange={(e) => updateParams("is_active", e.target.checked)} />
                    {params["is_active"] ? "  Active" : "  Inactive"}
                  </ArgonBox>
                </Grid>
              )}
            </Grid>
          )}
        </CardWrapper>
      </ArgonBox>
    </DashboardLayout>
  );
}

export default NotchingModelEntity;
