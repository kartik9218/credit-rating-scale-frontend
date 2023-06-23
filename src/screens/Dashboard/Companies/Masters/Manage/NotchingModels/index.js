import React, { useEffect, useState } from "react";
import { Add, Edit } from "@mui/icons-material";
import { useLocation } from "react-router-dom";
import { HTTP_CLIENT, APIFY } from "helpers/Api";
import { SET_PAGE_TITLE } from "helpers/Base";
import { GET_ROUTE_NAME } from "helpers/Base";
import { DashboardLayout } from "layouts";
import { ArgonSnackbar, ArgonBox } from "components/ArgonTheme";
import HasPermissionButton from "slots/Custom/Buttons/HasPermissionButton";
import DataTable from "slots/Tables/DataTable";
import ArgonBadge from "components/ArgonBadge";
import CardWrapper from "slots/Cards/CardWrapper";

function NotchingModels() {
  var { state } = useLocation();
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [backdropOpen, setBackdropOpen] = useState(false);
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

  const fetchNotchingModels = async () => {
    HTTP_CLIENT(APIFY("/v1/notching_models"), { params: {} }).then((response) => {
      const notching_models = response["notching_models"];
      setColumns([
        {
          accessor: "id",
          Header: "S. No.",
          width: 10,
          Cell: (row) => {
            return <>{row.cell.value + "."}</>;
          },
        },
        { accessor: "name", Header: "Name" },
        {
          accessor: "is_active",
          Header: "Status",
          Cell: (row) => {
            return (
              <>
                {row.cell.value ? (
                  <>
                    <ArgonBadge badgeContent="Active" color="success" container />
                  </>
                ) : (
                  <>
                    <ArgonBadge badgeContent="Inactive" color="error" container />
                  </>
                )}
              </>
            );
          },
        },
        {
          accessor: "uuid",
          Header: "",
          align: "right",
          Cell: (row) => {
            return (
              <ArgonBox display="Flex" flexDirection="row" justifyContent="space-between">
                <HasPermissionButton color="primary" permissions={["/dashboard/company/master/notching-model/edit"]} route={GET_ROUTE_NAME("EDIT_NOTCHING_MODEL", { uuid: row.cell.value })} text={`Edit`} icon={<Edit />} />
              </ArgonBox>
            );
          },
        },
      ]);

      notching_models.forEach((notching_model, key) => {
        notching_models[key].id = key + 1;
      });
      setRows(notching_models);
    });
    setBackdropOpen(false);
  };

  const onCloseSnackbar = () => {
    setSnackbarParams({
      success: false,
      type: "",
    });
  };

  useEffect(() => {
    SET_PAGE_TITLE(`Manage NotchingModels`);
    let ajaxEvent = true;
    if (ajaxEvent) {
      fetchNotchingModels();
      if (state) {
        handleSuccessState();
      }
    }
    return () => {
      ajaxEvent = false;
    };
  }, []);

  return (
    <DashboardLayout breadcrumbTitle="Manage Notching Model">
      <CardWrapper
        headerTitle="Manage Notching Model"
        headerActionButton={() => {
          return <HasPermissionButton color="primary" permissions={["/dashboard/company/master/notching-model/create"]} route={GET_ROUTE_NAME("ADD_NOTCHING_MODEL")} text={`Add Notching Model`} icon={<Add />} />;
        }}
        footerActionButton={() => {
          return <></>;
        }}
      >
        <DataTable
          table={{
            columns: columns,
            rows: rows,
          }}
        />
        <ArgonSnackbar
          color={"success"}
          icon="success"
          title={snackbarParams.type === "CREATE" ? "Notching Model Created Successfully" : snackbarParams.type === "UPDATE" ? "Notching Model Updated Successfully" : ""}
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
  );
}

export default NotchingModels;
