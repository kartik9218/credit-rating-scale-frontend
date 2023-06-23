import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import { useNavigate } from "react-router-dom";
import { ArrowBackRounded } from "@mui/icons-material";
import { HTTP_CLIENT, APIFY } from "helpers/Api";
import { SET_PAGE_TITLE, GET_ROUTE_NAME, GET_QUERY } from "helpers/Base";
import { DashboardLayout } from "layouts";
import { ArgonBox, ArgonInput } from "components/ArgonTheme";
import ArgonButton from "components/ArgonButton";
import ArgonTypography from "components/ArgonTypography";
import ArgonSelect from "components/ArgonSelect";
import HasPermissionButton from "slots/Custom/Buttons/HasPermissionButton";
import CardWrapper from "slots/Cards/CardWrapper";

function CitiesEntity() {
  const navigate = useNavigate();
  const uuid = GET_QUERY("uuid");
  const [title, setTitle] = useState(uuid ? "Edit City" : "Add City");

  const [states, setStates] = useState([]);
  const [countries, setCountries] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [response, setResponse] = useState(null);
  const [backdropOpen, setBackdropOpen] = useState(false);
  const [isStateDisabled, setIsStateDisabled] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState({});
  const [selectedStates, setSelectedStates] = useState({});
  const [params, setParams] = useState({
    uuid: uuid,
    name: "",
    state_uuid: "",
    country_uuid: "",
  });

  const updateParams = (key, value) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const onChangeSelect = (opt) => {
    updateParams("state_uuid", opt.value);
    setSelectedStates(opt);
  };

  const onFormSubmit = async (ev) => {
    ev.preventDefault();

    let url = uuid ? "/v1/cities/edit" : "/v1/cities/create";
    if (!uuid) {
      delete params.uuid;
      delete params.is_active;
    }

    HTTP_CLIENT(APIFY(url), { params: params })
      .then((response) => {
        if (response["success"]) {
          setResponse("success");
          setSnackbarOpen(true);

          navigate(GET_ROUTE_NAME("LIST_CITY"), {
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

  const fetchStates = async (opt) => {
    updateParams("country_uuid", opt.value);
    setSelectedCountry(opt);
    HTTP_CLIENT(APIFY("/v1/countries/states/view"), {
      params: {
        country_uuid: opt.value,
      },
    }).then((response) => {
      const states = response["states"];
      setStates(
        states.map((state) => {
          return {
            label: state.name,
            value: state.uuid,
          };
        })
      );
    });
    setIsStateDisabled(false);
  };

  const fetchCountries = async () => {
    HTTP_CLIENT(APIFY("/v1/countries"), { params: {} }).then((response) => {
      const countries = response["countries"];
      setCountries(
        countries.map((country) => {
          return {
            label: country.name,
            value: country.uuid,
          };
        })
      );
    });
  };

  const fetchData = async () => {
    setBackdropOpen(true);
    HTTP_CLIENT(APIFY("/v1/cities/view"), {
      params: {
        uuid: uuid,
      },
    }).then((response) => {
      if (response["success"]) {
        updateParams("name", response.city.name);
        onChangeSelect({
          label: response.state.name,
          value: response.state.uuid,
        });
        fetchStates({
          label: response.country.name,
          value: response.country.uuid,
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
      if (uuid) {
        fetchData();
      }
      fetchCountries();
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
                permissions={["/dashboard/company/master/cities"]}
                route={GET_ROUTE_NAME("LIST_CITY")}
                text={`Back to Cities`}
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
                    Country*
                  </ArgonTypography>
                </ArgonBox>

                <ArgonSelect
                  sx={{ width: "100%", borderRadius: "10px" }}
                  placeholder="Select Country"
                  options={countries}
                  value={selectedCountry}
                  onChange={fetchStates}
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
                    State*
                  </ArgonTypography>
                </ArgonBox>

                <ArgonSelect
                  sx={{ width: "100%", borderRadius: "10px" }}
                  placeholder="Select State"
                  options={states}
                  value={selectedStates}
                  isDisabled={isStateDisabled}
                  onChange={onChangeSelect}
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
                    City Name*
                  </ArgonTypography>
                </ArgonBox>
                <ArgonInput
                  type="text"
                  name="name"
                  label="City Name*"
                  placeholder="Enter City Name "
                  onChange={(ev) => updateParams("name", ev.target.value)}
                  value={params["name"]}
                  required
                />
              </Grid>
            </Grid>
          )}
        </CardWrapper>
      </ArgonBox>
    </DashboardLayout>
  );
}

export default CitiesEntity;
