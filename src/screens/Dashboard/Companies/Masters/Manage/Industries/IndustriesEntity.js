import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import { useNavigate } from "react-router-dom";
import { ArrowBackRounded, Edit } from "@mui/icons-material";
import { Button, Switch } from "@mui/material";
import { HTTP_CLIENT, APIFY } from "helpers/Api";
import { SET_PAGE_TITLE } from "helpers/Base";
import { GET_ROUTE_NAME } from "helpers/Base";
import { GET_QUERY } from "helpers/Base";
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

function MasterIndustriesEntity() {
  const navigate = useNavigate();
  const uuid = GET_QUERY("uuid");
  const [title, setTitle] = useState(uuid ? "Edit Industry" : "Add Industry");

  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [selectedSector, setSelectedSector] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [response, setResponse] = useState(null);
  const [backdropOpen, setBackdropOpen] = useState(false);
  const [params, setParams] = useState({
    uuid: uuid,
    name: "",
    sector_uuid: "",
    description: "",
    is_active: true,
  });

  const hendleSelect = (obj) => {
    updateParams("sector_uuid", obj.value);
    setSelectedSector(obj);
  };
  const onFormSubmit = async (ev) => {
    ev.preventDefault();

    let url = uuid ? "/v1/industries/edit" : "/v1/industries/create";
    if (!uuid) {
      delete params.uuid;
      delete params.is_active;
    }

    HTTP_CLIENT(APIFY(url), { params: params })
      .then((response) => {
        if (response["success"]) {
          setResponse("success");
          setSnackbarOpen(true);
          navigate(GET_ROUTE_NAME("LIST_INDUSTRIES"), {
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
    HTTP_CLIENT(APIFY("/v1/industries/view"), {
      params: {
        uuid: uuid,
      },
    }).then((response) => {
      if (response["success"]) {
        updateParams("name", response.industries.name);
        updateParams("description", response.industries.description);
        updateParams("is_active", response.industries.is_active);
        hendleSelect({
          label: response.industries.industry_sector?.name,
          value: response.industries.industry_sector?.uuid,
        });
        return;
      }
    });

    setBackdropOpen(false);
  };

  const updateParams = (key, value) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const fetchSectors = async () => {
    HTTP_CLIENT(APIFY("/v1/sectors"), { params: {} }).then((response) => {
      const sectors = response["sectors"];
      setSectors(
        sectors.map((sector) => {
          return {
            label: sector.name,
            value: sector.uuid,
          };
        })
      );
    });
  };

  const onCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    SET_PAGE_TITLE(title);

    let ajaxEvent = true;
    if (ajaxEvent) {
      fetchSectors();
      if (uuid) {
        fetchData();
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
                permissions={["/dashboard/company/master/industries"]}
                route={GET_ROUTE_NAME("LIST_INDUSTRIES")}
                text={`Back to Industries`}
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
                    Sector*
                  </ArgonTypography>
                </ArgonBox>
                {console.log(selectedSector)}
                <ArgonSelect
                  sx={{ width: "100%", borderRadius: "10px" }}
                  placeholder="Select Sector"
                  name="sector_uuid"
                  options={sectors}
                  onChange={hendleSelect}
                  value={selectedSector}
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
                  required
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

export default MasterIndustriesEntity;
