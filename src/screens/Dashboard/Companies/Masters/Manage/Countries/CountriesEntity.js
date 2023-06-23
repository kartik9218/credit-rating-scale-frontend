import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import { Link, useNavigate } from "react-router-dom";
import { ArrowBackRounded, Edit } from "@mui/icons-material";
import { Autocomplete, Button, Switch, TextField } from "@mui/material";
import { HTTP_CLIENT, APIFY } from "helpers/Api";
import { SET_PAGE_TITLE } from "helpers/Base";
import { GET_ROUTE_NAME } from "helpers/Base";
import { GET_QUERY } from "helpers/Base";
import FormField from "slots/FormField";
import { DashboardLayout } from "layouts";
import { ArgonSnackbar, ArgonBox } from "components/ArgonTheme";
import ArgonButton from "components/ArgonButton";
import ArgonTypography from "components/ArgonTypography";
import ArgonSelect from "components/ArgonSelect";
import HasPermissionButton from "slots/Custom/Buttons/HasPermissionButton";
import DataTable from "slots/Tables/DataTable";
import ArgonBadge from "components/ArgonBadge";
import CardWrapper from "slots/Cards/CardWrapper";
import { ArgonInput } from "components/ArgonTheme";

function CountriesEntity() {
  const navigate = useNavigate();
  const uuid = GET_QUERY("uuid");
  const [title, setTitle] = useState(uuid ? "Edit Countries" : "Add Countries");

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [response, setResponse] = useState(null);
  const [backdropOpen, setBackdropOpen] = useState(false);
  const [params, setParams] = useState({
    uuid: uuid,
    name: "",
  });
  const updateParams = (key, value) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const onFormSubmit = async (ev) => {
    ev.preventDefault();

    let url = uuid ? "/v1/countries/edit" : "/v1/countries/create";
    if (!uuid) {
      delete params.uuid;
    }

    HTTP_CLIENT(APIFY(url), { params: params })
      .then((response) => {
        if (response["success"]) {
          setResponse("success");
          setSnackbarOpen(true);
          navigate(GET_ROUTE_NAME("LIST_COUNTRY"), {
            state: { success: true, type: uuid ? "UPDATE" : "CREATE" },
          });
          return;
        }
      })
      .catch((err) => {
        setResponse("error");
        setSnackbarOpen(true);
      });
  };

  const fetchCountry = async () => {
    HTTP_CLIENT(APIFY("/v1/countries/view"), {
      params: {
        uuid: uuid,
      },
    }).then((response) => {
      const country = response["country"];
      updateParams("name", country.name);
    });
  };

  const onCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    SET_PAGE_TITLE(title);
    let ajaxEvent = true;
    if (ajaxEvent && uuid) {
      fetchCountry();
    }

    return () => {
      ajaxEvent = false;
    };
  }, []);

  return (
    <DashboardLayout breadcrumbTitle={title}>
      <ArgonBox component="form" role="form" onSubmit={onFormSubmit}>
        <CardWrapper
          headerTitle={title}
          headerActionButton={() => {
            return <HasPermissionButton color="primary" permissions={["/dashboard/company/master/countries"]} route={GET_ROUTE_NAME("LIST_COUNTRY")} text={`Back to Countries`} icon={<ArrowBackRounded />} />;
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
                    Name*
                  </ArgonTypography>
                </ArgonBox>
                <ArgonInput type="text" name="name" label="Name*" placeholder="Enter Name " onChange={(ev) => updateParams("name", ev.target.value)} value={params["name"]} required />
              </Grid>
            </Grid>
          )}
        </CardWrapper>
      </ArgonBox>
    </DashboardLayout>
  );
}

export default CountriesEntity;
