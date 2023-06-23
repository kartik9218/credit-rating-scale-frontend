import React, { useEffect, useState } from "react";
import { Autocomplete, Button, Switch, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ArrowBackRounded } from "@mui/icons-material";
import { DashboardLayout } from "layouts";
import { HTTP_CLIENT, APIFY } from "helpers/Api";
import { SET_PAGE_TITLE, GET_ROUTE_NAME, GET_QUERY } from "helpers/Base";
import { ArgonSnackbar, ArgonBox, ArgonInput } from "components/ArgonTheme";
import ArgonButton from "components/ArgonButton";
import ArgonTypography from "components/ArgonTypography";
import ArgonSelect from "components/ArgonSelect";
import HasPermissionButton from "slots/Custom/Buttons/HasPermissionButton";
import CardWrapper from "slots/Cards/CardWrapper";

function SubCategoryEntity() {
  const navigate = useNavigate();
  const uuid = GET_QUERY("uuid");
  const [title, setTitle] = useState(uuid ? "Edit Sub Category" : "Add Sub Category");

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [instrumentCategories, setInstrumentCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState({});
  const [response, setResponse] = useState(null);
  const [backdropOpen, setBackdropOpen] = useState(false);
  const [params, setParams] = useState({
    uuid: uuid,
    category_name: "",
    instrument_category_uuid: "",
    is_active: "",
  });
  const updateParams = (key, value) => {
    if (typeof value === "string" && value.trim() === "") {
      setParams((prev) => ({
        ...prev,
        [key]: "",
      }));
    } else {
      setParams((prev) => ({
        ...prev,
        [key]: value,
      }));
    }
  };
  const hendleSelect = (obj) => {
    updateParams("instrument_category_uuid", obj.value);
    setSelectedCategory(obj);
  };
  const fetchCategories = async () => {
    setBackdropOpen(true);
    HTTP_CLIENT(APIFY("/v1/categories"), { params: {} }).then((response) => {
      const categories = response["instrument_categories"];

      setInstrumentCategories(
        categories.map((category) => {
          return {
            label: category.category_name,
            value: category.uuid,
          };
        })
      );
    });
    setBackdropOpen(false);
  };

  const onFormSubmit = async (ev) => {
    ev.preventDefault();

    let url = uuid ? "/v1/sub_categories/edit" : "/v1/sub_categories/create";
    if (!uuid) {
      delete params.uuid;
      delete params.is_active;
    }

    HTTP_CLIENT(APIFY(url), { params: params })
      .then((response) => {
        if (response["success"]) {
          setResponse("success");
          setSnackbarOpen(true);
          navigate(GET_ROUTE_NAME("LIST_SUBCATEGORIES"), {
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
    HTTP_CLIENT(APIFY("/v1/sub_categories/view"), {
      uuid: uuid,
    }).then((response) => {
      if (response["success"]) {
        updateParams("category_name", response.sub_instrument_category.category_name);
        updateParams("is_active", response.sub_instrument_category.is_active);
        hendleSelect({
          label: response.sub_instrument_category.instrument_category?.category_name,
          value: response.sub_instrument_category.instrument_category?.uuid,
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
      fetchCategories();
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
                permissions={["/dashboard/company/master/sub_categories"]}
                route={GET_ROUTE_NAME("LIST_SUBCATEGORIES")}
                text={`Back to Sub Categories`}
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
                    Sub Category Name*
                  </ArgonTypography>
                </ArgonBox>
                <ArgonInput
                  type="text"
                  name="category_name"
                  label="Name*"
                  placeholder="Enter Sub Category Name "
                  onChange={(ev) => updateParams("category_name", ev.target.value)}
                  value={params["category_name"]}
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
                    Category*
                  </ArgonTypography>
                </ArgonBox>

                <ArgonSelect
                  sx={{ width: "100%", borderRadius: "10px" }}
                  placeholder="Select Category"
                  options={instrumentCategories}
                  value={selectedCategory}
                  onChange={hendleSelect}
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

export default SubCategoryEntity;
