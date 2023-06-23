import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AddBox, Edit } from "@mui/icons-material";
import { DashboardLayout } from "layouts";
import { SET_PAGE_TITLE } from "helpers/Base";
import { ArgonBox } from "components/ArgonTheme";
import { ArgonSnackbar } from "components/ArgonTheme";
import DataTable from "slots/Tables/DataTable";
import { HTTP_CLIENT, APIFY } from "helpers/Api";
import { GET_ROUTE_NAME } from "helpers/Base";
import HasPermissionButton from "slots/Custom/Buttons/HasPermissionButton";
import ArgonBadge from "components/ArgonBadge";
import CardWrapper from "slots/Cards/CardWrapper";

function Roles() {
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
    HTTP_CLIENT(APIFY("/v1/roles"), {params:{}}).then((data) => {
      setColumns([
        { accessor: "name", Header: "Name" },
        { accessor: "description", Header: "Description" },
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
                  permissions={["/dashboard/roles/edit"]}
                  route={GET_ROUTE_NAME("EDIT_ROLE", { uuid: row.cell.value })}
                  text={`Edit`}
                  icon={<Edit />}
                />
              </ArgonBox>
            );
          },
        },
      ]);
      setRows(data["roles"]);
    });
  };

  useEffect(() => {
    SET_PAGE_TITLE("Roles");
    let ajaxEvent = true;
    if (ajaxEvent) {
      fetchData();
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
    <DashboardLayout breadcrumbTitle="Roles">
      <CardWrapper
        headerTitle="Roles"
        headerActionButton={() => {
          return (
            <HasPermissionButton
              color="primary"
              route={GET_ROUTE_NAME("ADD_ROLE")}
              permissions={["/dashboard/roles/create"]}
              text={`Add New Role`}
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
            ? "Role Created Successfully"
            : snackbarParams.type === "UPDATE"
            ? "Role Updated Successfully"
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
export default Roles;
