import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import { ArrowBackRounded } from "@mui/icons-material";
import { Switch } from "@mui/material";
import { HTTP_CLIENT, APIFY } from "helpers/Api";
import { SET_PAGE_TITLE, GET_ROUTE_NAME, GET_QUERY, CHECK_IF_OBJECT_EMPTY } from "helpers/Base";
import { DashboardLayout } from "layouts";
import { ArgonBox, ArgonInput } from "components/ArgonTheme";
import ArgonButton from "components/ArgonButton";
import ArgonTypography from "components/ArgonTypography";
import HasPermissionButton from "slots/Custom/Buttons/HasPermissionButton";
import CardWrapper from "slots/Cards/CardWrapper";
import ArgonSelect from "components/ArgonSelect";

function CategoryEntity() {
  const navigate = useNavigate();
  const uuid = GET_QUERY("uuid");
  const [title, setTitle] = useState(uuid ? "Edit Category" : "Add Category");

  const [selectedMandateType, setSelectedMandateType] = useState({});
  const [mandateTypeOptions, setMandateTypeOptions] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [response, setResponse] = useState(null);
  const [backdropOpen, setBackdropOpen] = useState(false);
  const [params, setParams] = useState({
    uuid: uuid,
    mandate_type: "",
    category_name: "",
    is_active: "",
  });

  const updateParams = (key, value) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getMasters = () => {
    HTTP_CLIENT(APIFY("/v1/master"), { group: "MANDATE_TYPE", is_active: true }).then((data) => {
      let masters = data["masters"];
      let mandateType = [];
      masters.forEach((master) => {
        mandateType.push({ label: master["name"], value: master["value"] });
      });
      setMandateTypeOptions(mandateType);
    });
  };

  const fetchData = async () => {

    setBackdropOpen(true);
    HTTP_CLIENT(APIFY("/v1/categories/view"), {
      params: {
        uuid: uuid
      }
    })
      .then((response) => {
        if (response["success"]) {
          updateParams('category_name', response.instrument_category.category_name);
          updateParams('is_active', response.instrument_category.is_active);
          onChangeSelect(
            {
              label: response.instrument_category?.mandate_types?.name,
              value: response.instrument_category?.mandate_types?.name
            }
          )

          return;
        }
      });

    setBackdropOpen(false);
  };

  const onChangeSelect = (opt) => {
    updateParams("mandate_type", opt.value);
    setSelectedMandateType(opt);
  };


  const onFormSubmit = async (ev) => {
    ev.preventDefault();

    let url = uuid ? "/v1/categories/edit" : "/v1/categories/create";
    if (!uuid) {
      delete params.uuid;
      delete params.is_active;
    }

    HTTP_CLIENT(APIFY(url), { params: params })
      .then((response) => {
        if (response["success"]) {
          setResponse("success");
          setSnackbarOpen(true);
          navigate(GET_ROUTE_NAME("LIST_CATEGORIES"), { state: { success: true, type: uuid ? "UPDATE" : "CREATE" } });
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
    getMasters();
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
            return (
              <HasPermissionButton
                color="primary"
                permissions={["/dashboard/company/master/categories"]}
                route={GET_ROUTE_NAME("LIST_CATEGORIES")}
                text={`Back to Categories`}
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
              <Grid item xs={3} sm={6} pr={2} mt={1} position="relative">
                <ArgonTypography
                  component="label"
                  variant="caption"
                  fontWeight="bold"
                  textTransform="capitalize"
                  sx={{ display: "block" }}
                  paddingBottom={0.5}
                >
                  Type of Mandate*
                </ArgonTypography>
                <ArgonSelect
                  options={mandateTypeOptions}
                  value={CHECK_IF_OBJECT_EMPTY(selectedMandateType)}
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
                    Category Name*
                  </ArgonTypography>
                </ArgonBox>
                <ArgonInput
                  type="text"
                  name="category_name"
                  label="Name*"
                  placeholder="Enter Category Name "
                  onChange={(ev) => updateParams("category_name", ev.target.value)}
                  value={params["category_name"]}
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

export default CategoryEntity;
