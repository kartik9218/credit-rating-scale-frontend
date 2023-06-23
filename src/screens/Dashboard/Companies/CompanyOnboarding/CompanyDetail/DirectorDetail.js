import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import ArgonTypography from "components/ArgonTypography";
import { ArgonBox } from "components/ArgonTheme";
import FormField from "slots/FormField";
import { Grid, FormControlLabel, Switch, TextField, Button } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import DataTable from "slots/Tables/DataTable";
import ArgonButton from "components/ArgonButton";
import { getCompanyOnboardingSchema } from "helpers/validationSchema";
import { boardOfDirectorSchema } from "helpers/formikSchema";
import { useFormik } from "formik";
import ErrorTemplate from "slots/Custom/ErrorTemplate";
import { ArgonSnackbar } from "components/ArgonTheme";
import moment from "moment";
import { HTTP_CLIENT, APIFY } from "helpers/Api";
import { GET_QUERY } from "helpers/Base";
import { EditOutlined } from "@mui/icons-material";
import { TAB } from "helpers/constants";
import { DEBOUNCE } from "helpers/Base";
import { FORMATE_DATE } from "helpers/Base";

const DirectorDetail = (props) => {
  const { companyUuid } = props;
  const uuid = GET_QUERY("uuid");
  const [response, setResponse] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("Please check all required fields");
  const [directorUuid, setDirectorUuid] = useState("");
  const [mode, setMode] = useState("ADD");
  const columns = [
    {
      accessor: "action",
      Header: "Action",
      Cell: row => (
        <Button onClick={() => {handleReset(); handleSetFieldValues(row.row.original)}}>
          <EditOutlined />
        </Button>
      ),
    },
    { accessor: "name", Header: "Director Name" },
    { accessor: "din", Header: "DIN" },
    { accessor: "position", Header: "Position" },
    { accessor: "director_function", Header: "Function" },
    { accessor: "date_of_joining", Header: "Date of Joining", Cell: row => <>{FORMATE_DATE(row.cell.value)}</> },
    { accessor: "qualification", Header: "Qualification" },
    { accessor: "total_experiance", Header: "Total Year of Experience" },
    { accessor: "past_experiance", Header: "Past Work Experience" },
    { accessor: "director_status", Header: "Director Status", Cell: row => <>{row.cell.value ? "Yes" : "No"}</> },
    { accessor: "is_wilful_defaulter", Header: "Is Wilful Defaulter",Cell: row => <>{row.cell.value ? "Yes" : "No"}</> },
  ];
  const [rows, setRows] = useState([]);
  const formik = useFormik({
    initialValues: boardOfDirectorSchema,
    validationSchema: getCompanyOnboardingSchema(TAB.BOARD_DIRECTOR),
    onSubmit: (values) => handlePerformAjaxRqst(values),
  });
  const {
    errors,
    touched,
    setFieldValue,
    handleSubmit,
    handleChange,
    handleReset,
    values: formikValue,
  } = formik;

  useEffect(() => {
    if(!uuid) return;
    getAllDirectorsLists();
  }, []);

  const handleSetFormikValues = (key, value) => setFieldValue(key, value ?? {label:"", value:""});

  const onCloseSnackbar = () => setSnackbarOpen(false);

  const handleResetStates = () => { 
    handleReset()
    setFieldValue("date_of_joining",null);
    setMode("ADD")
  }
  
  const handleShowSnackBar = (messageType) => (message) => {
    setSnackbarOpen(true);
    setResponse(messageType);
    setSnackbarMessage(message);
  };

  const handlePerformAjaxRqst = directorDetailData => {
    if(uuid && mode === "EDIT") {
      HTTP_CLIENT(APIFY("/v1/companies/edit_board_of_directors"), {
        params: processApiData(directorDetailData),
      }).then(success => {
        handleShowSnackBar("success")("Directors Detail updated successfully")
        handleResetStates();
        getAllDirectorsLists();
      }).catch(error => {
        handleShowSnackBar("error")("Something went wrong!")
      });
      setMode("ADD")
      return;
    }
    HTTP_CLIENT(APIFY("/v1/companies/assign_board_of_directors"), {
      params: processApiData(directorDetailData),
    })
      .then((data) => {
        handleShowSnackBar("success")("Directors Detail added successfully")
        handleResetStates();
        getAllDirectorsLists();
      })
      .catch((error) => {
        console.error(error);
        handleShowSnackBar("error")("Something went wrong!")
      });
      setMode("ADD");
  };

  const getAllDirectorsLists = () => {
    HTTP_CLIENT(APIFY("/v1/companies/view_board_of_directors"), {
      company_uuid: uuid,
    })
      .then((response) => {
        const { board_of_directors } = response;
        setRows([...board_of_directors]);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  
  const handleSetFieldValues = data => {
    setMode("EDIT")
    setDirectorUuid(data?.uuid);
    setFieldValue("director_name", data?.name)
    setFieldValue("din", data?.din)
    setFieldValue("position", data?.position)
    setFieldValue("director_function", data?.director_function)
    setFieldValue("date_of_joining",data?.date_of_joining ? data?.date_of_joining  : "")
    setFieldValue("is_wilful_defaulter", data?.is_wilful_defaulter)
    setFieldValue("total_experiance", data?.total_experiance ? data?.total_experiance+"" : "")
    setFieldValue("past_experiance", data?.past_experiance ? data?.past_experiance+"" : "")
    setFieldValue("director_status", data?.director_status) 
    setFieldValue("qualification", data?.qualification)
  }

  const processApiData = (data) => {
    const processedData = {
      company_uuid: companyUuid,
      name: data["director_name"],
      din: data["din"],
      date_of_joining: data["date_of_joining"] === null ? null : moment(data["date_of_joining"]).format("YYYY/MM/DD"),
      position: data["position"],
      director_function: data["director_function"],
      qualification: data["qualification"],
      is_wilful_defaulter: data["is_wilful_defaulter"],
      total_experiance: data["total_experiance"] ? +data["total_experiance"] : null,
      past_experiance: data["past_experiance"] ? +data["past_experiance"] : null,
      director_status: data["director_status"],
    };
    if(uuid && mode === "EDIT") {
      return Object.assign(processedData, {
        uuid:directorUuid,
        company_uuid: uuid
      })
    } else return Object.assign(processedData, {company_uuid:uuid});
  };
  
  const debounceHandler = DEBOUNCE(handleSubmit, 300);

  return (
    <form onSubmit={(e) => { e.preventDefault(); debounceHandler(e)}}>
      <Grid container spacing={3} marginTop={"1px"} paddingLeft="1rem" paddingRight="1rem">
        <Grid item xs={12} sm={6} md={4} position="relative">
          <FormField
            type="text"
            name="director_name"
            label="Director Name *"
            placeholder="Director Name"
            value={formikValue["director_name"]}
            onChange={handleChange}
            style={{
              borderColor: `${
                touched?.director_name && errors.director_name ? "red" : "lightgray"
              }`,
            }}
          />
          {touched.director_name && errors.director_name && (
            <ErrorTemplate message={errors?.director_name} />
          )}
        </Grid>

        <Grid item xs={12} sm={6} md={4} position="relative">
          <FormField
            type="text"
            name="din"
            label="DIN *"
            placeholder="Din"
            value={formikValue["din"]}
            onChange={handleChange}
            style={{
              borderColor: `${touched?.din && errors.din ? "red" : "lightgray"}`,
            }}
          />
          {touched.din && errors.din && <ErrorTemplate message={errors?.din} />}
        </Grid>

        <Grid item xs={12} sm={6} md={4} position="relative">
          <FormField
            type="text"
            name="position"
            label="Position in BOD *"
            placeholder="Position in BOD"
            value={formikValue["position"]}
            onChange={handleChange}
            style={{
              borderColor: `${touched?.position && errors.position ? "red" : "lightgray"}`,
            }}
          />
          {touched.position && errors.position && <ErrorTemplate message={errors?.position} />}
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <FormField
            type="text"
            name="director_function"
            label="Function look after (for Eds)"
            value={formikValue["director_function"]}
            onChange={handleChange}
            placeholder="Function"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <ArgonBox mb={1} ml={0.5} lineHeight={0}>
            <ArgonTypography
              component="label"
              variant="caption"
              fontWeight="bold"
              textTransform="capitalize"
            >
              Date of Joining
            </ArgonTypography>
          </ArgonBox>
          <LocalizationProvider dateAdapter={AdapterMoment} sx={{ maxWidth: "100%" }}>
            <DatePicker
              inputFormat="DD/MM/YYYY"
              className={"date-picker-width"}
              name="date_of_joining"
              value={formikValue["date_of_joining"]}
              onChange={(newValue) => handleSetFormikValues("date_of_joining", newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  sx={{
                    ".MuiOutlinedInput-root": {
                      marginTop: "4px",
                      paddingLeft:"0px",
                      display:"flex",
                      justifyContent:"space-between"
                    },
                  }}
                />
              )}
            />
          </LocalizationProvider>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <FormField
            type="text"
            name="qualification"
            label="Qualification"
            value={formikValue["qualification"]}
            onChange={handleChange}
            placeholder="Qualification"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <FormField
            type="text"
            name="total_experiance"
            label="Total Years of Experience"
            onChange={handleChange}
            value={formikValue["total_experiance"]}
            placeholder="Total Experiance"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <FormField
            type="text"
            name="past_experiance"
            label="Past Work Experience"
            onChange={handleChange}
            value={formikValue["past_experiance"]}
            placeholder="Past Experiance"
          />
        </Grid>

        <Grid item xs={12} sm={3} md={2}>
          <FormControlLabel
            sx={{ paddingLeft: "20px", paddingTop: "35px" }}
            control={
              <Switch name="director_status" onChange={handleChange} checked={formikValue["director_status"]} />
            }
            label="Director Status"
          />
        </Grid>

        <Grid item xs={6} sm={3} md={2}>
          <FormControlLabel
            sx={{ paddingTop: "35px", }}
            control={
              <Switch
                name="is_wilful_defaulter"
                onChange={handleChange}
                checked={formikValue["is_wilful_defaulter"]}
              />
            }
            label="Is Wilful Defaulter"
          />
        </Grid>
      </Grid>
      <Grid
        container
        md={12}
        paddingRight="1rem"
        sx={{ display: "flex", justifyContent: "end", gap: "10px", marginTop: "19px" }}
      >
        <ArgonButton color="error" onClick={handleResetStates}>
          Reset
        </ArgonButton>
        <ArgonButton color="primary" type={"submit"}>
        {mode === "EDIT" ? "Update" : "Add"}
        </ArgonButton>
      </Grid>
      <ArgonBox sx={{ marginTop: "20px" }}>
        <DataTable
          table={{
            columns: columns,
            rows: rows,
          }}
          canSearch={false}
          entriesPerPage={false}
        />
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
    </form>
  );
};

DirectorDetail.propTypes = {
  companyUuid: PropTypes.string,
};

export default DirectorDetail;
