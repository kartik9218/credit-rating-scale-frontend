import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { Grid } from "@mui/material";
import { AddBox, Edit } from "@mui/icons-material";
import { DataGrid, GridToolbar, GridToolbarContainer } from "@mui/x-data-grid";
import { DashboardLayout } from "layouts";
import { SET_PAGE_TITLE } from "helpers/Base";
import { ArgonBox } from "components/ArgonTheme";
import { ArgonTypography } from "components/ArgonTheme";
import { ArgonSnackbar } from "components/ArgonTheme";
import { HTTP_CLIENT, APIFY } from "helpers/Api";
import { GET_ROUTE_NAME } from "helpers/Base";
import HasPermissionButton from "slots/Custom/Buttons/HasPermissionButton";

const CustomToolbar = ({ setFilterButtonEl }) => (
  <GridToolbarContainer sx={{ float: "right", width: "30%", position: "relative" }}>
    <GridToolbar ref={setFilterButtonEl} />
  </GridToolbarContainer>
);

CustomToolbar.propTypes = {
  setFilterButtonEl: PropTypes.func.isRequired,
};

function Configurator() {
  var { state } = useLocation();
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [filterButtonEl, setFilterButtonEl] = useState(null);
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

  const fetchData = () => {
    HTTP_CLIENT(APIFY("/v1/configurator"), {}).then((data) => {
      setColumns([
        { field: "id", headerName: "ID", hide: true },
        { field: "name", headerName: "Name", width: 350 },
        { field: "navigation", headerName: "Navigation", width: 350 },
        {
          field: "uuid",
          headerName: "Action",
          align: "right",
          sortable: false,
          width: 350,
          renderCell: (params) => {
            return (
              <>
                <ArgonBox display="Flex" flexDirection="row" justifyContent="space-between">
                  <HasPermissionButton
                    color="info"
                    permissions={["/dashboard/rating-modules/configurator/edit"]}
                    route={GET_ROUTE_NAME("EDIT_CONFIGURATOR", {uuid: params.value})}
                    text={`Edit Configurator`}
                    icon={<Edit />}
                  />
                </ArgonBox>
              </>
            );
          },
        },
      ]);

      let TableRows = data["configurator"].map((permission, key) => {
        return {
          id: ++key,
          name: permission.name,
          navigation:
            permission.navigations && permission.navigations.length > 0
              ? permission.navigations[0].name
              : "",
        };
      });
      setRows(TableRows);
    });
  };

  useEffect(() => {
    SET_PAGE_TITLE("Configurator");
    let ajaxEvent = true;
    if (ajaxEvent) {
      // fetchData();
      if (state) {
        handleSuccessState();
      }
    }

    return () => {
      ajaxEvent = false;
    };
  }, []);

  const onCloseSnackbar = () => {
    setSnackbarParams({
      success: false,
      type: "",
    });
  };

  return (
    <DashboardLayout breadcrumbTitle="Configurator">
      <ArgonBox py={3} sx={{ height: "calc(100vh - 80vh)" }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ArgonBox
              bgColor="white"
              borderRadius="lg"
              shadow="lg"
              opacity={1}
              py={2}
              padding="10px"
            >
              <ArgonBox
                display="flex"
                flexDirection="row"
                justifyContent="space-between"
                px={1}
                py={2}
              >
                <ArgonTypography variant="h5" padding="10px">
                Rating Model Configurator
                </ArgonTypography>
                <ArgonBox paddingRight="10px">
                  <HasPermissionButton
                    color="primary"
                    route={GET_ROUTE_NAME("ADD_CONFIGURATOR")}
                    permissions={["/dashboard/rating-modules/configurators/create"]}
                    text={`Add New Configurator`}
                    icon={<AddBox />}
                  />
                </ArgonBox>
              </ArgonBox>
              <Grid sx={{ height: 500, width: "100%" }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  pageSize={10}
                  rowsPerPageOptions={[10]}
                  components={{
                    Toolbar: CustomToolbar,
                  }}
                  componentsProps={{
                    panel: {
                      anchorEl: filterButtonEl,
                    },
                    toolbar: {
                      setFilterButtonEl,
                    },
                  }}
                />
              </Grid>
            </ArgonBox>
          </Grid>
        </Grid>
        <ArgonSnackbar
          color={"success"}
          icon="success"
          title={
            snackbarParams.type === "CREATE"
              ? "Configurator Created Successfully"
              : snackbarParams.type === "UPDATE"
              ? "Configurator Updated Successfully"
              : ""
          }
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
      </ArgonBox>
    </DashboardLayout>
  );
}
export default Configurator;
