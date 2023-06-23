import React, { useEffect, useState } from "react";
import { SET_PAGE_TITLE } from "helpers/Base";
import DashboardLayout from "layouts/DashboardLayout";
import CardWrapper from "slots/Cards/CardWrapper";
import { DataGrid } from "@mui/x-data-grid";
import { Button, Grid, IconButton, Stack } from "@mui/material";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ShowIndustries from "./ShowIndustries";
import { Link, useLocation } from "react-router-dom";
import colors from "assets/theme/base/colors";
import HasPermissionButton from "slots/Custom/Buttons/HasPermissionButton";
import { AddBox } from "@mui/icons-material";
import { GET_ROUTE_NAME } from "helpers/Base";
import { APIFY } from "helpers/Api";
import { HTTP_CLIENT } from "helpers/Api";
import moment from "moment/moment";
import ArgonSnackbar from "components/ArgonSnackbar";
import { HAS_PERMISSIONS } from "helpers/Base";

const ModelMapping = () => {
  let { state } = useLocation();

  const [openModal, setOpenModal] = useState(false);
  const [rows, setRows] = useState([]);
  const [mappedIndustries, setMappedIndustries] = useState([]);
  const [snackbarParams, setSnackbarParams] = useState({
    success: false,
    type: "",
  });
  const handleSuccessState = () => {
    const { success, type } = state;
    setSnackbarParams({
      success: success,
      type: type,
    });
    state = null;
  };

  const getModels = () => {
    HTTP_CLIENT(APIFY("/v1/industry_model_mapping"), { params: "" })
      .then((data) => {
        const { mappings } = data;
        setRows(mappings);
      })
      .catch((err) => {
        console.error(err);
      });
  };
  const columns = [
    {
      field: "rating_model",
      headerName: "Model",
      minWidth: 200,
      flex: 1,
      renderCell: (cell) => {
        return cell.row.rating_model_name;
      },
    },
    {
      field: "sub_industry",
      headerName: "Mapped Industries",
      minWidth: 200,
      flex: 1,
      renderCell: (cell) => {
        return cell.row.sub_industries.length;
      },
    },
    {
      field: "version",
      headerName: "No. of Versions",
      minWidth: 200,
      flex: 1,
    },
    {
      field: "updated_at",
      headerName: "Last Updated",
      minWidth: 200,
      flex: 1,
      renderCell: (cell) => {
        return moment(cell.row?.updated_at).format("DD-MM-YYYY");
      },
    },
    {
      field: "action",
      headerName: "Action",
      minWidth: 200,
      flex: 1,
      renderCell: (cell) => {
        return (
          <>
            <Grid container>
              <Grid item xs={3}>
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
                    setOpenModal(true);
                    setMappedIndustries(cell.row);
                  }}
                >
                  <RemoveRedEyeOutlinedIcon />
                </IconButton>
              </Grid>
              <Grid item xs={3}>
                {/* <HasPermissionButton color="primary" permissions={["/dashboard/rating-modules/model-mapping/industry-mapping/edit"]} route={GET_ROUTE_NAME("EDIT_MODEL_MAPPED_INDUSTRIES", { uuid: cell.row.rating_model_uuid })} icon={<EditOutlinedIcon />} /> */}
                {HAS_PERMISSIONS(["/dashboard/rating-modules/model-mapping/industry-mapping/edit"]) && (
                  <Link to={GET_ROUTE_NAME("EDIT_MODEL_MAPPED_INDUSTRIES", { uuid: cell.row.rating_model_uuid })}>
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
                  </Link>
                )}
                {/* <Link to="/dashboard/rating-modules/model-mapping/industry-mapping">
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
                    onClick={() => {}}
                  >
                    <EditOutlinedIcon />
                  </IconButton>
                </Link> */}
              </Grid>
            </Grid>
          </>
        );
      },
    },
  ];

  const onCloseSnackbar = () => {
    setSnackbarParams({
      success: false,
      type: "",
    });
  };

  // const rows = [
  //   {
  //     id: 1,
  //     modelName: "Manufacturing Model",
  //     noOfVersions: 2,
  //     mappedIndustries: 2,
  //     lastEdited: "01 March 2022",
  //   },
  //   {
  //     id: 2,
  //     modelName: "Infrastructure Model",
  //     noOfVersions: 4,
  //     mappedIndustries: 10,
  //     lastEdited: "07 March 2022",
  //   },
  //   {
  //     id: 3,
  //     modelName: "NBFC Model",
  //     noOfVersions: 8,
  //     mappedIndustries: 12,
  //     lastEdited: "02 March 2022",
  //   },
  //   {
  //     id: 4,
  //     modelName: "SME Model",
  //     noOfVersions: 78,
  //     mappedIndustries: 11,
  //     lastEdited: "06 March 2022",
  //   },
  //   {
  //     id: 5,
  //     modelName: "Banks",
  //     noOfVersions: 8,
  //     mappedIndustries: 9,
  //     lastEdited: "05 March 2022",
  //   },
  //   {
  //     id: 6,
  //     modelName: "Trading",
  //     noOfVersions: 7,
  //     mappedIndustries: 15,
  //     lastEdited: "012 March 2022",
  //   },
  // ];

  useEffect(() => {
    SET_PAGE_TITLE("List of Model Mapping");
    let ajaxEvent = true;
    if (ajaxEvent) {
      getModels();
      if (state) {
        handleSuccessState();
      }
    }

    return () => {
      ajaxEvent = false;
    };
  }, []);

  // useEffect(() => {
  //   let apiSubscribed = true;
  //   if (apiSubscribed) {
  //     getModels();
  //   }
  //   return () => {
  //     apiSubscribed = false;
  //   };
  // }, []);

  return (
    <>
      <DashboardLayout>
        <CardWrapper
          headerTitle="List of Model Mapping"
          headerActionButton={() => {
            return <HasPermissionButton color="primary" permissions={["/dashboard/rating-modules/add-model-map"]} route={GET_ROUTE_NAME("ADD_MODEL_MAP")} text={`Add Model Map`} icon={<AddBox />} />;
          }}
        >
          <Grid sx={{ height: 400, mx: "0.8rem" }}>
            <DataGrid sx={{fontSize:"13px"}}
              getRowId={(row) => row.rating_model_uuid}
              components={{
                NoRowsOverlay: () => (
                  <Stack height="100%" alignItems="center" justifyContent="center">
                    No model map to show. Create model map by clicking add model map button.
                  </Stack>
                ),
              }}
              rows={rows}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5]}
            />
          </Grid>
          {openModal && <ShowIndustries mappedIndustries={mappedIndustries} open={openModal} setOpen={setOpenModal} />}
          <ArgonSnackbar
            color={"success"}
            icon="success"
            title={snackbarParams.type === "CREATE" ? "Rating Model Map Created Successfully" : snackbarParams.type === "UPDATE" ? "Rating Model Map Updated Successfully" : ""}
            content=""
            translate="yes"
            dateTime=""
            open={snackbarParams.success}
            close={onCloseSnackbar}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
          />
        </CardWrapper>
      </DashboardLayout>
    </>
  );
};

export default ModelMapping;
