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

function SectorsEntity() {
  const navigate = useNavigate();
  const uuid = GET_QUERY("uuid");
  const [title, setTitle] = useState(uuid ? "Edit Sector" : "Add Sector");

  const [macroEconomicIndicators, setMacroEconomicIndicators] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [response, setResponse] = useState(null);
  const [backdropOpen, setBackdropOpen] = useState(false);
  const [selectedMEI, setSelectedMEI] = useState([]);
  const [params, setParams] = useState({
    uuid: uuid,
    name: "",
    macro_economic_indicator_uuid: "",
    description: "",
    is_active: "",
  });

  const onChangeSelect = (opt) => {
    updateParams("macro_economic_indicator_uuid", opt.value);
    setSelectedMEI(opt);
  };

  const updateParams = (key, value) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  const onFormSubmit = async (ev) => {
    ev.preventDefault();

    let url = uuid ? "/v1/sectors/edit" : "/v1/sectors/create";
    if (!uuid) {
      delete params.uuid;
      delete params.is_active;
    }

    HTTP_CLIENT(APIFY(url), { params: params })
      .then((response) => {
        if (response["success"]) {
          setResponse("success");
          setSnackbarOpen(true);
          navigate(GET_ROUTE_NAME("LIST_SECTORS"), {
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

  const fetchData = async () => {
    setBackdropOpen(true);
    HTTP_CLIENT(APIFY("/v1/sectors/view"), {
      params: {
        uuid: uuid,
      },
    }).then((response) => {
      if (response["success"]) {
        updateParams("name", response.sectors.name);
        updateParams("description", response.sectors.description);
        updateParams("is_active", response.sectors.is_active);
        updateParams("macro_economic_indicator_uuid", response.sectors.macro_economic_indicator.uuid);
        setSelectedMEI({
          label: response.sectors.macro_economic_indicator.name,
          value: response.sectors.macro_economic_indicator.uuid,
        });
        fetchMacroEconomicIndicator();

        return;
      }
    });

    setBackdropOpen(false);
  };

  const fetchMacroEconomicIndicator = async () => {
    setBackdropOpen(true);
    HTTP_CLIENT(APIFY("/v1/macro_economic_indicators"), { params: {} }).then((response) => {
      const macro_economic_indicators = response["macro_economic_indicators"];
      setMacroEconomicIndicators(
        macro_economic_indicators.map((mei) => {
          return {
            label: mei.name,
            value: mei.uuid,
          };
        })
      );
    });
    setBackdropOpen(false);
  };

  useEffect(() => {
    SET_PAGE_TITLE(title);

    let ajaxEvent = true;
    if (ajaxEvent) {
      if (uuid) {
        fetchData();
      }else{
        fetchMacroEconomicIndicator();
      }
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
            return (
              <HasPermissionButton
                color="primary"
                permissions={["/dashboard/company/master/sectors"]}
                route={GET_ROUTE_NAME("LIST_SECTORS")}
                text={`Back to Sectors`}
                icon={<ArrowBackRounded />}
              />
            );
          }}
          footerActionButton={() => {
            return (
              <>
                <ArgonBox
                  display="flex"
                  justifyContent="end"
                  spacing={3}
                  marginTop={"18px"}
                  padding="1rem"
                >
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
                  <ArgonTypography
                    component="label"
                    variant="caption"
                    fontWeight="bold"
                    textTransform="capitalize"
                  >
                    Name*
                  </ArgonTypography>
                </ArgonBox>
                <ArgonInput
                  type="text"
                  name="name"
                  label="Name*"
                  placeholder="Enter Name "
                  onChange={(ev) => updateParams("name", ev.target.value)}
                  value={params["name"]}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
                  <ArgonTypography
                    component="label"
                    variant="caption"
                    fontWeight="bold"
                    textTransform="capitalize"
                  >
                    Macro Economic Indicator*
                  </ArgonTypography>
                </ArgonBox>
                <ArgonSelect
                  sx={{ width: "100%", borderRadius: "10px" }}
                  placeholder="Select Macro Economic Indicator"
                  options={macroEconomicIndicators}
                  onChange={onChangeSelect}
                  value={[selectedMEI]}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
                  <ArgonTypography
                    component="label"
                    variant="caption"
                    fontWeight="bold"
                    textTransform="capitalize"
                  >
                    Description
                  </ArgonTypography>
                </ArgonBox>
                <ArgonInput
                  type="text"
                  name="description"
                  label="Description"
                  placeholder="Enter Description "
                  onChange={(ev) => updateParams("description", ev.target.value)}
                  value={params["description"]}
                />
              </Grid>

              {uuid && (
                <Grid item paddingLeft={3} marginTop={4} xs={12} sm={3} display="flex">
                  <ArgonBox mr={1}>
                    <Switch
                      name="is_active"
                      checked={params["is_active"]}
                      onChange={(e) => updateParams("is_active", e.target.checked)}
                    />
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

export default SectorsEntity;
