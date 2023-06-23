import React, { useEffect, useState } from "react";
import { SET_PAGE_TITLE } from "helpers/Base";
import DashboardLayout from "layouts/DashboardLayout";
import CardWrapper from "slots/Cards/CardWrapper";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  IconButton,
  Switch,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import { Box } from "@mui/system";
import PropTypes from "prop-types";
import colors from "assets/theme/base/colors";

const CopyModal = ({ open, setOpen, disableModal, setDisableModal }) => {
  return (
    <>
      <Dialog
        disableEscapeKeyDown
        sx={{
          zIndex: "1600",
        }}
        maxWidth="sm"
        open={open}
        onClose={() => {
          setOpen(false);
          setDisableModal(false);
        }}
      >
        <DialogContent>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography sx={{ width: "80%" }}>
              Currently, you can’t {disableModal ? "active" : "clone"} this version because one
              workflow is already Active in the system !!!
            </Typography>
            <ErrorOutlinedIcon
              sx={{
                height: "5rem",
                width: "5rem",
                color: "rgba(255, 140, 140, 0.56);",
                borderRadius: "50%",
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            sx={{
              backgroundColor: "#3c5cd2",
              color: "#ffffff",
              ml: "2rem",
              display: "flex",
              alignItems: "center",
              "&:hover": {
                backgroundColor: "#3c5cd2",
                color: "#ffffff",
              },
            }}
            onClick={() => {
              setOpen(false);
              setDisableModal(false);
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const Version = () => {
  const [copy, setCopy] = useState(false);
  // const [disable, setDisable] = useState(false);
  const [disableModal, setDisableModal] = useState(false);
  // const [disableModalData, setDisableData] = useState("");

  useEffect(() => {
    SET_PAGE_TITLE("Version");
  });
  const columns = [
    {
      field: "versionName",
      headerName: "Version Name",
      minWidth: 200,
      flex: 1,
    },
    {
      field: "versionCode",
      headerName: "Version Code",
      minWidth: 200,
      flex: 1,
    },
    // {
    //   field: "noOfQuestions",
    //   headerName: "No. of Questions",
    //   minWidth: 150,
    //   flex: 1,
    // },
    {
      field: "noOfRiskType",
      headerName: "No. of Risk Type",
      minWidth: 200,
      flex: 1,
      // renderCell: (cell) => {
      //   return (<>
      //     {cell.row.status ==="disable" &&

      //     }

      //   </>)
      // },
    },
    {
      field: "status",
      headerName: "Status",
      minWdth: 250,
      flex: 1,
      renderCell: (cell) => {
        console.log(cell.row.id);
        return (
          <>
            {cell.row.status === "disable" ? (
              <>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography textTransform="capitalize" mr="0.6rem" fontSize="13px">
                    {cell.row.status}
                  </Typography>
                  <Switch
                    checked={false}
                    onClick={() => {
                      setDisableModal(true);
                      setCopy(true);
                    }}
                  />
                </Box>
              </>
            ) : (
              <>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography textTransform="capitalize" mr="0.6rem" fontSize="13px">
                    {cell.row.status}
                  </Typography>
                  <Switch defaultChecked />
                </Box>
              </>
            )}
          </>
        );
      },
    },
    {
      field: "action",
      headerName: "Action",
      minWidth: 320,
      flex: 1,
      renderCell: (cell) => {
        return (
          <>
            <Grid container>
              <Grid item xs={2}>
                <IconButton
                  size="medium"
                  variant="contained"
                  sx={{
                    borderRadius: "3px !important",
                    backgroundColor: colors.primary.main,
                    color: "white !important",
                    fontSize: "18px !important",
                    "&:hover": {
                      backgroundColor: "#4159de",
                    },
                  }}
                >
                  <RemoveRedEyeOutlinedIcon />
                </IconButton>
              </Grid>
              <Grid item xs={2}>
                <IconButton
                  size="medium"
                  variant="contained"
                  sx={{
                    borderRadius: "3px !important",
                    backgroundColor: colors.primary.main,
                    color: "white !important",
                    fontSize: "18px !important",
                    "&:hover": {
                      backgroundColor: "#4159de",
                    },
                  }}
                >
                  <EditOutlinedIcon />
                </IconButton>
              </Grid>
              <Grid item xs={2}>
                <IconButton
                  size="medium"
                  variant="contained"
                  sx={{
                    borderRadius: "3px !important",
                    backgroundColor: colors.primary.main,
                    color: "white !important",
                    fontSize: "18px !important",
                    "&:hover": {
                      backgroundColor: "#4159de",
                    },
                  }}
                  onClick={() => {
                    setCopy(true);
                  }}
                >
                  <ContentCopyOutlinedIcon />
                </IconButton>
              </Grid>
            </Grid>
          </>
        );
      },
    },
  ];
  const rows = [
    {
      id: 1,
      versionName: "Infrastructure Model",
      noOfQuestions: 5,
      noOfRiskType: 5,
      status: "disable",
    },
    {
      id: 2,
      versionName: "Infrastructure Model",
      noOfQuestions: 5,
      noOfRiskType: 5,
      status: "disable",
    },
    {
      id: 3,
      versionName: "Infrastructure Model",
      noOfQuestions: 5,
      noOfRiskType: 5,
      status: "disable",
    },
    {
      id: 4,
      versionName: "Infrastructure Model",
      noOfQuestions: 5,
      noOfRiskType: 5,
      status: "active",
    },
  ];
  return (
    <>
      <DashboardLayout>
        <CardWrapper headerTitle="Model Management Version">
          <Grid sx={{ height: 400, mx: "0.8rem" }}>
            <DataGrid rows={rows} columns={columns} pageSize={5} rowsPerPageOptions={[5]} />
          </Grid>
          <CopyModal
            open={copy}
            setOpen={setCopy}
            disableModal={disableModal}
            setDisableModal={setDisableModal}
          />
        </CardWrapper>
      </DashboardLayout>
    </>
  );
};

export default Version;

CopyModal.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  disableModal: PropTypes.bool,
  setDisableModal: PropTypes.func,
};
