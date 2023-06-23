import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AddBox, Edit, Delete } from "@mui/icons-material";
import { SET_PAGE_TITLE } from "helpers/Base";
import { DashboardLayout } from "layouts";
import { ArgonBox } from "components/ArgonTheme";
import DataTable from "slots/Tables/DataTable";
import { ArgonSnackbar } from "components/ArgonTheme";
import { HTTP_CLIENT } from "helpers/Api";
import { APIFY } from "helpers/Api";
import { GET_ROUTE_NAME } from "helpers/Base";
import HasPermissionButton from "slots/Custom/Buttons/HasPermissionButton";
import CardWrapper from "slots/Cards/CardWrapper";

function Navigations() {
  var { state } = useLocation();
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
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
    HTTP_CLIENT(APIFY("/v1/navigations"), {}).then((data) => {
      setColumns([
        { accessor: "name", Header: "Name" },
        { accessor: "path", Header: "Path" },
        { accessor: "description", Header: "Description" },
        {
          accessor: "uuid",
          Header: "",
          align: "right",
          Cell: (row) => {
            return (
              <ArgonBox display="Flex" flexDirection="row" justifyContent="space-between">
                <HasPermissionButton
                  color="primary"
                  permissions={["/dashboard/navigations/edit"]}
                  route={GET_ROUTE_NAME("EDIT_NAVIGATION", { uuid: row.cell.value })}
                  text={`Edit`}
                  icon={<Edit />}
                />
              </ArgonBox>
            );
          },
        },
      ]);
      setRows(data["navigations"]);
    });
  };
  useEffect(() => {
    SET_PAGE_TITLE("Navigations List");
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
    <DashboardLayout breadcrumbTitle="Manage Navigations">
      <CardWrapper
        headerTitle={"Navigations"}
        headerActionButton={() => {
          return (
            <HasPermissionButton
              color="primary"
              permissions={["/dashboard/navigations/create"]}
              route={GET_ROUTE_NAME("ADD_NAVIGATION")}
              text={`Add New Navigation`}
              icon={<AddBox />}
            />
          );
        }}
      >
        <DataTable
          table={{
            columns: columns,
            rows: rows,
          }}
          canSearch={true}
          customHeight={"calc(100vh - 30vh)"}
        />
      </CardWrapper>
      <ArgonSnackbar
        color={"success"}
        icon="success"
        title={
          snackbarParams.type === "CREATE"
            ? "Navigation Created Successfully"
            : snackbarParams.type === "UPDATE"
            ? "Navigation Updated Successfully"
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
export default Navigations;
