import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import { useNavigate } from "react-router-dom";
import { ArrowBackRounded, Edit } from "@mui/icons-material";
import { Switch } from "@mui/material";
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
import CardWrapper from "slots/Cards/CardWrapper";
import { ArgonInput } from "components/ArgonTheme";

function SubIndustriesEntity() {
  const navigate = useNavigate();
  const uuid = GET_QUERY("uuid");
  const [title, setTitle] = useState(uuid ? "Edit Sub Industry" : "Add Sub Industry");

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState({});
  const [response, setResponse] = useState(null);
  const [backdropOpen, setBackdropOpen] = useState(false);
  const [industries, setIndustries] = useState([]);
  const [params, setParams] = useState({
    uuid: uuid,
    name: "",
    industry_id: "",
    is_active: "",
  });

  const updateParams = (key, value) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const hendleSelect = (obj) => {
    updateParams("industry_id", obj.value);
    setSelectedIndustry(obj);
  };

  const fetchindustries = async () => {
    setBackdropOpen(true);
    HTTP_CLIENT(APIFY("/v1/industries"), {
      params: {
        is_active: true,
      },
    }).then((response) => {
      const industriesData = response["industries"];

      setIndustries(
        industriesData.map((industry) => {
          return {
            label: industry.name,
            value: industry.uuid,
          };
        })
      );
    });
    setBackdropOpen(false);
  };

  const onFormSubmit = async (ev) => {
    ev.preventDefault();

    let url = uuid ? "/v1/sub_industries/edit" : "/v1/sub_industries/create";
    if (!uuid) {
      delete params.uuid;
      delete params.is_active;
    }

    HTTP_CLIENT(APIFY(url), { params: params })
      .then((response) => {
        if (response["success"]) {
          setResponse("success");
          setSnackbarOpen(true);
          navigate(GET_ROUTE_NAME("LIST_SUBINDUSTRIES"), {
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
    HTTP_CLIENT(APIFY("/v1/sub_industries/view"), {
     params:{
      uuid: uuid,
     }
    }).then((response) => {
      if (response["success"]) {
        updateParams("name", response.sub_industry.name);
        updateParams("description", response.sub_industry.description);
        updateParams("is_active", response.sub_industry.is_active);
        hendleSelect({
          label: response.sub_industry.industry?.name,
          value: response.sub_industry.industry?.uuid,
        });

        return;
      }
    });

    setBackdropOpen(false);
  };

  const onCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    SET_PAGE_TITLE(title);

    let ajaxEvent = true;
    if (ajaxEvent) {
      fetchindustries();
      if(uuid){
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
                permissions={["/dashboard/company/master/sub_industries"]}
                route={GET_ROUTE_NAME("LIST_SUBINDUSTRIES")}
                text={`Back to Sub Industries`}
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
                  sx={{ tetxAlign: "end" }}
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
                  placeholder="Enter Name"
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
                    Industries*
                  </ArgonTypography>
                </ArgonBox>

                <ArgonSelect
                  sx={{ width: "100%", borderRadius: "10px" }}
                  placeholder="Select Industries"
                  options={industries}
                  onChange={hendleSelect}
                  value={selectedIndustry}
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

export default SubIndustriesEntity;
