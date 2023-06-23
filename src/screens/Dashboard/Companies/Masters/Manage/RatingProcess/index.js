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

function RatingProcess() {
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

  const fetchCategories = async () => {
    HTTP_CLIENT(APIFY("/v1/rating_process"), { params: {} }).then((response) => {
      const rating_processes = response["rating_processes"];
      setColumns([
        {
          accessor: "id", Header: "S. No.", width: 10, Cell: (row) => {
            return (
              <>
                {row.cell.value + "."}
              </>
            );
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
                <HasPermissionButton
                  color="primary"
                  permissions={["/dashboard/company/master/rating-process/edit"]}
                  route={GET_ROUTE_NAME("EDIT_RATING_PROCESS", { uuid: row.cell.value })}
                  text={`Edit`}
                  icon={<Edit />}
                />
              </ArgonBox>
            );
          },
        },
      ]);
      
      rating_processes.forEach((rating_process, key) => {
        rating_processes[key].id = key + 1;
      })
      setRows(rating_processes);
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
    SET_PAGE_TITLE(`Manage Rating Process`);
    let ajaxEvent = true;
    if (ajaxEvent) {
      fetchCategories();
      if (state) {
        handleSuccessState();
      }
    }
    return () => {
      ajaxEvent = false;
    };
  }, []);

  return (
    <DashboardLayout breadcrumbTitle="Manage Rating Process">
      <CardWrapper
        headerTitle="Manage Rating Process"
        headerActionButton={() => {
          return (
            <HasPermissionButton
              color="primary"
              permissions={["/dashboard/company/master/rating-process/create"]}
              route={GET_ROUTE_NAME("ADD_RATING_PROCESS")}
              text={`Add Rating Process`}
              icon={<Add />}
            />
          );
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
          title={
            snackbarParams.type === "CREATE"
              ? "Rating Process Created Successfully"
              : snackbarParams.type === "UPDATE"
              ? "Rating Process Updated Successfully"
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
      </CardWrapper>
    </DashboardLayout>
  );
}

export default RatingProcess;
