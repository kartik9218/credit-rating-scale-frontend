import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";

import { Grid } from "@mui/material";
import { AddBox, Edit } from "@mui/icons-material";
import { DataGrid, GridToolbar, GridToolbarContainer } from "@mui/x-data-grid";

import { SET_PAGE_TITLE } from "helpers/Base";
import { DashboardLayout } from "layouts";
import { ArgonBox } from "components/ArgonTheme";
import { ArgonSnackbar } from "components/ArgonTheme";
import { HTTP_CLIENT } from "helpers/Api";
import { APIFY } from "helpers/Api";
import { GET_ROUTE_NAME } from "helpers/Base";
import HasPermissionButton from "slots/Custom/Buttons/HasPermissionButton";
import CardWrapper from "slots/Cards/CardWrapper";

const CustomToolbar = ({ setFilterButtonEl }) => {
  return (
    <GridToolbarContainer>
      <GridToolbar ref={setFilterButtonEl} />
    </GridToolbarContainer>
  );
};

CustomToolbar.propTypes = {
  setFilterButtonEl: PropTypes.func.isRequired,
};

function Permissions() {
  var { state } = useLocation();
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [snackbarParams, setSnackbarParams] = useState({
    success: false,
    type: "",
  });

  const [filterButtonEl, setFilterButtonEl] = useState(null);

  const handleSuccessState = () => {
    const { success, type } = state;
    setSnackbarParams({
      success: success,
      type: type,
    });
    state = null;
  };

  const fetchData = () => {
    HTTP_CLIENT(APIFY("/v1/permissions"), {}).then((data) => {
      setColumns([
        // { field: "id", headerName: "ID", hide: true},
        { field: "name", headerName: "Name", width: 420 },
        { field: "navigation", headerName: "Navigation", width: 420 },
        {
          field: "uuid",
          headerName: "",
          align: "right",
          sortable: false,
          width: 350,
          renderCell: (params) => {
            return (
              <>
                <ArgonBox display="flex" flexDirection="row" justifyContent="flex-end">
                  <HasPermissionButton
                    color="primary"
                    permissions={["/dashboard/permissions/edit"]}
                    route={GET_ROUTE_NAME("EDIT_PERMISSION", { uuid: params.value })}
                    text={`Edit`}
                    icon={<Edit />}
                  />
                </ArgonBox>
              </>
            );
          },
        },
      ]);

      let TableRows = data["permissions"].map((permission, key) => {
        return {
          id: ++key,
          name: permission.name,
          uuid: permission.uuid,
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
    SET_PAGE_TITLE("Permissions List");
    let isSubscribed = true;
    if (isSubscribed) {
      fetchData();
      if (state) {
        handleSuccessState();
      }
    }
    return () => {
      isSubscribed = false;
    };
  }, []);

  const onCloseSnackbar = () => {
    setSnackbarParams({
      success: false,
      type: "",
    });
  };

  return (
    <DashboardLayout breadcrumbTitle="Manage Permissions">
      <CardWrapper
        headerTitle="Permissions"
        headerActionButton={() => {
          return (
            <HasPermissionButton
              color="primary"
              route={GET_ROUTE_NAME("ADD_PERMISSION")}
              permissions={["/dashboard/permissions/create"]}
              text={`Add New Permission`}
              icon={<AddBox />}
            />
          );
        }}
      >
        <Grid sx={{ height: 500, width: "100%" }} item padding="10px">
          <DataGrid
            rows={rows}
            columns={columns}
            className={"datagrid-font"}
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
      </CardWrapper>
      <ArgonSnackbar
        color={"success"}
        icon="success"
        title={
          snackbarParams.type === "CREATE"
            ? "Permission Created Successfully"
            : snackbarParams.type === "UPDATE"
            ? "Permission Updated Successfully"
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
    </DashboardLayout>
  );
}
export default Permissions;
