import { ArrowBackRounded, PercentOutlined } from "@mui/icons-material";
import { Box, FormControlLabel, Grid, Switch } from "@mui/material";
import ArgonBadge from "components/ArgonBadge";
import ArgonSelect from "components/ArgonSelect";
import { ArgonTypography } from "components/ArgonTheme";
import { ArgonSnackbar } from "components/ArgonTheme";
import { ArgonBox } from "components/ArgonTheme";
import { ArgonButton } from "components/ArgonTheme";
import { useFormik } from "formik";
import { APIFY } from "helpers/Api";
import { HTTP_CLIENT } from "helpers/Api";
import { GET_QUERY } from "helpers/Base";
import { subsidiarySchema } from "helpers/formikSchema";
import { getSubsidiarySchema } from "helpers/validationSchema";
import { DashboardLayout } from "layouts";
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CardWrapper from "slots/Cards/CardWrapper";
import ErrorTemplate from "slots/Custom/ErrorTemplate";
import FormField from "slots/FormField";
import DataTable from "slots/Tables/DataTable";

const SubsidiaryEntity = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [response, setResponse] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("Please check all required fields");
  const [companyiesOptions, setCompaniesOptions] = useState([]);
  const [parentCompanyOptions, setParentCompanyOptions] = useState([]);
  const [relationshipOptions, setRelationshipOptions] = useState([]);
  const [selectedParent, setSelectedParent] = useState({});
  const [subsidiaryUuid, setSubsidiaryUuid] = useState("");
  const [mode, setMode] = useState("ADD");
  const [totalStakePercent, SetTotalStakePercent] = useState(0);

  const formik = useFormik({
    initialValues: subsidiarySchema,
    validationSchema: getSubsidiarySchema(),
    onSubmit: (values) => handlePerformAjaxRequest(values),
  });
  const { errors, touched, setFieldValue, handleSubmit, handleChange, handleReset, values: formikValue } = formik;

  useEffect(() => {
    getAllCompanies();
    getRelationshipOptions();
    if (GET_QUERY("parent-company")) {
      setFieldValue("parent_company", { label: GET_QUERY("parent-company"), value: GET_QUERY("uuid") });
      // setFieldValue("relationship", relationshipOptions[0]);
      getStakePercent();
    }
    if (location.state?.values != null) {
      // getStakePercent();
      handleSetFieldValues(location.state.values);
    }
  }, []);

  useEffect(() => {
    if (!formikValue["parent_company"].value) return;
    getParentCompanyOptions(formikValue["parent_company"].value);
  }, [formikValue["parent_company"].value]);
  
  useEffect(() => {
  if (!GET_QUERY("uuid")) return;
  getParentCompanyOptions(GET_QUERY("uuid"));
  },[GET_QUERY("uuid")]);

  const getRelationshipOptions = () => {
    HTTP_CLIENT(APIFY("/v1/master"), { group: "company_type" }).then((response) => {
      const { masters } = response;
      const options = [];
      masters.forEach(({ name, uuid }) => name != "Parent" && options.push({ label: name, value: uuid }));
      setRelationshipOptions([...options]);
    });
  };

  const getAllCompanies = () => {
    HTTP_CLIENT(APIFY("/v1/companies"))
      .then((response) => {
        const { companies } = response;
        const options = [];
        companies.forEach(({ name, uuid }) => {
          options.push({ label: name, value: uuid });
        });
        setParentCompanyOptions([...options]);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const getParentCompanyOptions = (companyUuid) => {
    HTTP_CLIENT(APIFY("/v1/companies/get_subsidiaries"), { company_uuid: companyUuid })
      .then((data) => {
        const { companies } = data;
        const options = [];
        companies.forEach(({ uuid, name, sector }) => {
          options.push(Object.assign({}, { uuid, name, sector }));
        });
        setCompaniesOptions([...options]);
      })
      .catch((err) => console.error(err));
  };

  const handleSetFieldValues = (data) => {
    setMode("EDIT");
    setSubsidiaryUuid(data?.uuid);
    setFieldValue("relationship", data?.relationship);
    setFieldValue("parent_company", { label: data?.parent_company.name, value: data?.parent_company.uuid });
    setFieldValue("company_name", {
      label: data.subsidiary_company?.name,
      value: data.subsidiary_company?.uuid,
    });
    setFieldValue("stake", data?.stake);
    setFieldValue("is_active", data?.is_active);
  };

  const handleSetFormikValues = (key) => (value) => {
    if (key === "parent_company") {
      setSelectedParent(value);
    }
    setFieldValue(key, value);
  };
  const handleResetFields = () => {
    handleReset();
    setFieldValue("parent_company", selectedParent);
  };

  const handleShowSnackbar = (messageType) => (message) => {
    setResponse(messageType);
    setSnackbarOpen(true);
    setSnackbarMessage(message);
  };

  const handlePerformAjaxRequest = (data) => {
    if (mode === "EDIT") {
      HTTP_CLIENT(APIFY("/v1/companies/edit_subsidiaries"), { params: processApiData(data) })
        .then((suceess) => {
          handleShowSnackbar("success")("Subsidiary updated successfully");
          handleResetFields();
          // getSavedSubsidiariesList(formikValue["parent_company"].value);
        })
        .catch((err) => {
          console.error(err);
          handleShowSnackbar("error")("Something went wrong!");
        });
        setMode("ADD");
        setSubsidiaryUuid("");
        setTimeout(() => navigate("/dashboard/company/subsidiary"),1000)
      return;
    }
    HTTP_CLIENT(APIFY("/v1/companies/assign_subsidiaries"), { params: processApiData(data) })
      .then((suceess) => {
        handleShowSnackbar("success")("Subsidiary updated successfully");
        handleResetFields();
        // getSavedSubsidiariesList(formikValue["parent_company"].value);
      })
      .catch((err) => {
        console.error(err);
        handleShowSnackbar("error")("Something went wrong!");
      });
      setMode("ADD");
      setSubsidiaryUuid("");
      setTimeout(() => navigate("/dashboard/company/subsidiary"),1000)
  };

  const onCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const processApiData = (data) => {
    const processedData = {
      company_uuid: data.parent_company["value"],
      subsidiary_company_uuid: data.company_name["value"],
      stake: data["stake"] + "",
      type: data.relationship["label"],
      is_active: data["is_active"],
    };
    if (mode === "EDIT") {
      return Object.assign(processedData, {
        uuid: subsidiaryUuid,
      });
    } else {
      return processedData;
    }
  };

  const getStakePercent = (uuid) => {
    HTTP_CLIENT(APIFY("/v1/companies/view_subsidiaries"), { company_uuid: GET_QUERY("uuid") })
      .then((success) => {
        const { subsidiaries } = success;
        SetTotalStakePercent(() => {
          return subsidiaries.reduce((acc, obj) => acc + +obj.stake, 0);
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getHeaderTitle = () => {
    return GET_QUERY("parent-company") != null ? (mode === "ADD" ? GET_QUERY("parent-company") : "Update Subsidiary") : "Create Subsidiary";
  };

  return (
    <DashboardLayout>
      <CardWrapper
        headerTitle={getHeaderTitle()}
        headerSubtitle={() => {
          return mode === "ADD" ? "Create Subsidiary for" : ""}
        }
        headerActionButton={() => {
          return (
            <ArgonButton variant={"contained"} color="primary" onClick={() => navigate("/dashboard/company/subsidiary")}>
              <ArrowBackRounded />
              <Box marginX={"5px"} />
              Back
            </ArgonButton>
          );
        }}
      >
        <ArgonBox
          sx={{
            background: "white !important",
            height: "calc(100vh - 17vh)",
            borderRadius: "20px",
          }}
        >
          <ArgonBox paddingX="3rem">
            <form onSubmit={handleSubmit}>
              <Grid container xs={12} spacing={1} m="0" padding="10px" rowSpacing={2}>
                <Grid item xs={3} sm={6} md={12} position="relative">
                  <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
                    Parent Company *
                  </ArgonTypography>
                  <ArgonSelect
                    name="parent_company"
                    isDisabled={GET_QUERY("parent-company") ? true : false}
                    value={formikValue["parent_company"]}
                    isInvalid={errors["parent_company"] && touched["parent_company"]}
                    onChange={(options) => handleSetFormikValues("parent_company")(options)}
                    options={parentCompanyOptions}
                  />
                  {errors["parent_company"] && touched["parent_company"] && <ErrorTemplate message={errors["parent_company"].value} />}
                </Grid>

                <Grid item xs={3} sm={6} md={12}>
                  <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
                    Company Name *
                  </ArgonTypography>
                  <ArgonSelect
                    name="company_name"
                    value={formikValue["company_name"]}
                    isInvalid={errors["company_name"] && touched["company_name"]}
                    onChange={(options) => handleSetFormikValues("company_name")(options)}
                    options={companyiesOptions.map(({ name, uuid }) => {
                      return { value: uuid, label: name };
                    })}
                  />
                  {errors["company_name"] && touched["company_name"] && <ErrorTemplate message={errors["company_name"].value} />}
                </Grid>

                <Grid item xs={3} sm={6} md={12} position="relative">
                  <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
                    Relationship *
                  </ArgonTypography>
                  <ArgonSelect
                    name="relationship"
                    // isDisabled={GET_QUERY("parent-company") ? true : false}
                    value={formikValue["relationship"]}
                    onChange={(options) => handleSetFormikValues("relationship")(options)}
                    isInvalid={errors["relationship"] && touched["relationship"]}
                    options={relationshipOptions}
                  />
                  {errors["relationship"] && touched["relationship"] && <ErrorTemplate message={errors["relationship"].value} />}
                </Grid>

                <Grid item xs={3} sm={6} md={12} position="relative">
                  <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
                    Stake *
                  </ArgonTypography>
                  <ArgonBox
                    sx={{
                      border: "1px solid lightgray",
                      display: "flex",
                      borderRadius: "5px",
                      alignItems: "center",
                      marginTop: "7px",
                    }}
                    style={{
                      borderColor: `${touched?.stake && errors.stake ? "red" : "lightgray"}`,
                    }}
                  >
                    <FormField
                      name="stake"
                      value={formikValue["stake"]}
                      onChange={(e) => {
                        e.target.value >= 0 && setFieldValue("stake", e.target.value);
                      }}
                      type="number"
                      sx={{ border: "none" }}
                      placeholder="Stake Percentage"
                    />
                    <PercentOutlined sx={{ color: "gray", marginRight: "4px" }} />
                  </ArgonBox>
                  {errors["stake"] && touched["stake"] && <ErrorTemplate message={errors["stake"]} />}
                </Grid>

                <Grid item xs={12} sm={12} md={4}>
                  <FormControlLabel sx={{ paddingLeft: "20px", marginTop: "25px" }} control={<Switch name="is_active" onChange={handleChange} checked={formikValue["is_active"]} />} label="Is Active" />
                </Grid>

                {/* <Grid item xs={12} sm={6} md={4}>
                <ArgonBox mb={1} ml={""} lineHeight={0} display="flex" flexDirection="column">
                  <ArgonTypography
                    component="label"
                    variant="caption"
                    fontWeight="bold"
                    textTransform="capitalize"
                  >
                    Total stake %
                  </ArgonTypography>
                  <ArgonTypography variant="p" padding="1rem" paddingLeft="0">
                    <ArgonBadge
                      badgeContent={location?.state?.totalStakePercent + "%"}
                      color={`${location?.state?.totalStakePercent < 100 ? "error" : "success"}`}
                      container
                    />
                  </ArgonTypography>
                </ArgonBox>
              </Grid> */}

                <Grid container md={12} paddingRight="1rem" sx={{ display: "flex", justifyContent: "end", gap: "10px", marginTop: "4px" }}>
                  <ArgonButton color="success" type={"submit"}>
                    Save
                  </ArgonButton>
                </Grid>
              </Grid>
            </form>
          </ArgonBox>
        </ArgonBox>
        <ArgonSnackbar
          color={response}
          icon={response ? response : "error"}
          title={response === "success" ? "Success" : response === "error" ? "Error" : ""}
          content={snackbarMessage}
          translate="yes"
          dateTime=""
          open={snackbarOpen}
          close={onCloseSnackbar}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        />
      </CardWrapper>
    </DashboardLayout>
  );
};

export default SubsidiaryEntity;
