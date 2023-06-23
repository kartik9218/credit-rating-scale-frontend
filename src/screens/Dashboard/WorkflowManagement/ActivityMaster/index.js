import React, { useState, useEffect } from "react";
import { DashboardLayout } from "layouts";
import CardWrapper from "slots/Cards/CardWrapper";
import Modal from "@mui/material/Modal";
import { Box, Button, Grid, IconButton, Input, Switch, Typography } from "@mui/material";
import { ArgonBox } from "components/ArgonTheme";
import DataTable from "slots/Tables/DataTable";
import { ArgonButton } from "components/ArgonTheme";
import { CloseOutlined, EditOutlined } from "@mui/icons-material";
import { AddBoxOutlined } from "@mui/icons-material";
import { HTTP_CLIENT } from "helpers/Api";
import { APIFY } from "helpers/Api";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ArgonSnackbar } from "components/ArgonTheme";
import ArgonBadge from "components/ArgonBadge";

const ActivityMaster = () => {
  const [response, setResponse] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("Please check all required fields");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [uuid, setUuid] = useState("");
  const formik = useFormik({
    initialValues: {
      code: "",
      name: "",
      completion_status: "",
      alert_message: "",
      remarks: "",
      status: true,
    },
    validationSchema: Yup.object().shape({
      code: Yup.number().required("Activity Code is required"),
      name: Yup.string().required("Description is required"),
      completion_status: Yup.string().required("Activity Completion status is required"),
      alert_message: Yup.string().required("Alert message is required"),
      remarks: Yup.string(),
      status: Yup.bool(),
    }),
    onSubmit: (values) => handlePerformAjaxRqst(values),
  });

  const { errors, touched, setFieldValue ,handleSubmit, handleChange, handleReset, values: formikValue } = formik;

  const Columns = [
    {
      accessor: "code",
      Header: "Activity Code",
    },
    {
      accessor: "name",
      Header: "Acitivity Description",
      Cell: (row) => <Box sx={{width:"200px"}}>{row.cell.value}</Box>,
    },
    {
      accessor: "completion_status",
      Header: "Activity Completion Status",
      Cell: (row) => <Box sx={{width:"200px"}}>{row.cell.value}</Box>,

    },
    {
      accessor: "alert_message",
      Header: "Alert Message",
      Cell: (row) => <Box sx={{width:"200px"}}>{row.cell.value}</Box>,
    },
    {
      accessor: "remarks",
      Header: "Activity Remark",
      Cell: (row) => <Box sx={{width:"200px"}}>{row.cell.value}</Box>,
    },
    {
      accessor: "is_active",
      Header: "Status",
      Cell: (row) => <ArgonBadge badgeContent={row.cell.value ? "Active" : "InActive"} color={row.cell.value ? "success" : "error"} />,
    },
    {
      accessor: "uuid",
      Header:"Action",
      Cell: row => {
        return (
          <Box>
            <IconButton color={"primary"} onClick={() => handleEditActivityMaster(row.cell.row.original)}>
              <EditOutlined  />
            </IconButton>
          </Box>
        )
      }
    }
  ];
  
  useEffect(() => {
    getActiveListing();
  }, []);

  const handleEditActivityMaster = (data) => {
    setIsModalOpen(true);
    setUuid(data.uuid)
    setFieldValue("code",data?.code);
    setFieldValue("name",data?.name);
    setFieldValue("completion_status",data?.completion_status);
    setFieldValue("alert_message",data?.alert_message);
    setFieldValue("remarks",data?.remarks);
    setFieldValue("status", data?.is_active)
  }

  const handleModalState = () => { 
    setIsModalOpen((prev) => !prev);
    handleReset();
    setUuid("");
  }

  const getActiveListing = () => {
    HTTP_CLIENT(APIFY("/v1/activity"), { params: {} })
      .then((success) => {
        const { activities } = success;
        setRows([...activities]);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handlePerformAjaxRqst = ({status, ...values}) => {
    if(uuid) {
      HTTP_CLIENT(APIFY("/v1/activity/edit"),{params:{...values, uuid, is_active : status}}).then(success => {
        if(success) {
         handleShowSnackBar("success")("Activity updated successfully.");
         setIsModalOpen(false);
         handleReset();
         getActiveListing();
         setUuid("");
        }
     }).catch(err => {
       handleShowSnackBar("error")("Please check all the fields.")
       console.error(err);
     })
      return;
    }
    HTTP_CLIENT(APIFY("/v1/activity/create"),{params:{...values, is_active : status}}).then(success => {
       if(success) {
        handleShowSnackBar("success")("Activity created successfully.");
        setIsModalOpen(false);
        handleReset();
        getActiveListing();
       }
    }).catch(err => {
      handleShowSnackBar("error")("Please check all the fields.")
      console.error(err);
    })
  };
  
 
  // const isFieldValid = (params) => (fieldName) => {
  //   if (typeof errors[params] != "undefined" && typeof errors[params][fieldName] != "undefined") {
  //     return !!(touched[params][fieldName] && errors[params][fieldName]);
  //   }
  // };

  const handleShowSnackBar = (messageType) => (message) => {
    setSnackbarOpen(true);
    setResponse(messageType);
    setSnackbarMessage(message);
  };


  return (
    <DashboardLayout breadcrumbTitle="Workflow">
      <CardWrapper
        headerSubtitle={"Workflow Management"}
        headerTitle={"Activity Master"}
        headerActionButton={() => {
          return (
            <ArgonBox sx={{ display: "flex", gap: "10px" }}>
              <Button
                variant="contained"
                sx={{
                  background: "#5e72e3",
                  color: "white !important",
                  ":hover": {
                    background: "#697ef0",
                  },
                }}
                startIcon={<AddBoxOutlined />}
                onClick={handleModalState}
              >
                Add Activity
              </Button>
            </ArgonBox>
          );
        }}
      >
        <ArgonBox padding="10px">
          {/* <Box
            sx={{
              height: "calc(100vh - 52vh)",
              width: "100%",
              overflow: "hidden",
              overflowY: "scroll",
            }}
          > */}
          <DataTable
            table={{
              columns: Columns,
              rows: rows,
            }}
            isPaginationVisible={false}
            canSearch={true}
            entriesPerPage={{ entries: rows.length, defaultValue: rows.length }}
          />
          {/* </Box> */}
        </ArgonBox>
      </CardWrapper>
      <Modal open={isModalOpen} onClose={handleModalState} className="modal-wrapper">
        <form onSubmit={handleSubmit}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 900,
              height: 600,
              border: "none !important",
              outline: "none !important",
              bgcolor: "background.paper",
              borderRadius: "10px",
              boxShadow: 24,
              p: 1,
            }}
          >
            <Grid container spacing={3.5} padding={".8rem"}>
              <Grid item xs={12}>
                <Box display={"flex"} justifyContent="space-between" borderBottom="1px solid lightgray">
                  <Typography fontSize={"26px"} fontWeight={"600"}>
                    Activity
                  </Typography>
                  <IconButton size={"large"} onClick={handleModalState}>
                    <CloseOutlined />
                  </IconButton>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box display={"flex"} alignItems={"center"}>
                  <Typography sx={{ flex: "2" }} fontSize={"14px"}>
                    Activity Code *
                  </Typography>
                  <Box sx={{ flex: "4" }}>
                    <Input
                      disableUnderline={true}
                      sx={{ ".MuiInputBase-input": { width: "100% !important" }, borderColor: `${touched.code && errors.code ? "red" : "lightgray"}` }}
                      type="number"
                      name="code"
                      error={true}
                      value={formikValue["code"]}
                      onChange={handleChange}
                      placeholder="Activity Code"
                    />
                    {touched.code && errors.code && (
                      <Typography sx={{ color: "red" }} fontSize={"11px"}>
                        {errors?.code}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box display={"flex"} alignItems={"center"}>
                  <Typography sx={{ flex: "2" }} fontSize={"14px"}>
                    Activity Description *
                  </Typography>
                  <Box sx={{ flex: "4" }}>
                    <Input disableUnderline={true} sx={{ ".MuiInputBase-input": { width: "100% !important" }, borderColor: `${touched.name && errors.name ? "red" : "lightgray"}` }} type="text" name="name" value={formikValue["name"]} onChange={handleChange} placeholder="Activity Description" />
                    {touched.name && errors.name && (
                      <Typography sx={{ color: "red" }} fontSize={"11px"}>
                        {errors?.name}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box display={"flex"} alignItems={"center"}>
                  <Typography sx={{ flex: "2" }} fontSize={"14px"}>
                    Activity Completion status *
                  </Typography>
                  <Box sx={{ flex: "4" }}>
                    <Input
                      disableUnderline={true}
                      sx={{ ".MuiInputBase-input": { width: "100% !important" }, borderColor: `${touched.completion_status && errors.completion_status ? "red" : "lightgray"}` }}
                      type="text"
                      name="completion_status"
                      value={formikValue["completion_status"]}
                      onChange={handleChange}
                      placeholder="Activity Description"
                    />
                    {touched.completion_status && errors.completion_status && (
                      <Typography sx={{ color: "red" }} fontSize={"11px"}>
                        {errors?.completion_status}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box display={"flex"} alignItems={"center"}>
                  <Typography sx={{ flex: "2" }} fontSize={"14px"}>
                    Alert Message *
                  </Typography>
                  <Box sx={{ flex: "4" }}>
                    <Input
                      disableUnderline={true}
                      sx={{ ".MuiInputBase-input": { width: "100% !important" }, borderColor: `${touched.alert_message && errors.alert_message ? "red" : "lightgray"}` }}
                      type="text"
                      name="alert_message"
                      value={formikValue["alert_message"]}
                      onChange={handleChange}
                      placeholder="Message "
                    />
                    {touched.alert_message && errors.alert_message && (
                      <Typography sx={{ color: "red" }} fontSize={"11px"}>
                        {errors?.alert_message}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box display={"flex"} alignItems={"center"}>
                  <Typography sx={{ flex: "2" }} fontSize={"14px"}>
                    Acitivity Remark 
                  </Typography>
                  <Box sx={{ flex: "4" }}>
                    <Input
                      multiline={true}
                      rows={4}
                      fullWidth={true}
                      disableUnderline={true}
                      sx={{ ".MuiInputBase-input": { width: "100% !important" }, borderColor: `${touched.remarks && errors.remarks ? "red" : "lightgray"}` }}
                      type="text"
                      name="remarks"
                      value={formikValue["remarks"]}
                      onChange={handleChange}
                      placeholder="Remark "
                    />
                    {touched.remarks && errors.remarks && (
                      <Typography sx={{ color: "red" }} fontSize={"11px"}>
                        {errors?.remarks}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box display={"flex"} alignItems={"center"}>
                  <Typography sx={{ flex: "2" }} fontSize={"14px"}>
                    Status
                  </Typography>
                  <Box sx={{ flex: "4", display: "flex", justifyContent: "start" }}>
                    <Switch name="status" checked={formikValue["status"]} onChange={handleChange} />
                  </Box>
                </Box>
              </Grid>

            </Grid>
            <Box sx={{ position: "inherit", bottom: "8px", right: "19px" }}>
              <ArgonButton type={"submit"} variant="contained" color="success">
                {uuid ? "update" : "save"}
              </ArgonButton>
            </Box>
          </Box>
        </form>
      </Modal>
      <ArgonSnackbar
          color={response}
          icon={response ? response : "error"}
          title={response === "success" ? "Success" : response === "error" ? "Error" : ""}
          content={snackbarMessage}
          translate="yes"
          dateTime=""
          open={snackbarOpen}
          close={() => setSnackbarOpen(false)}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        />
    </DashboardLayout>
  );
};

export default ActivityMaster;
