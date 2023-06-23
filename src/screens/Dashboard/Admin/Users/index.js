import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Chip, Tooltip } from "@mui/material";
import { Link } from "react-router-dom";
import { AddBox, Edit } from "@mui/icons-material";
import { DashboardLayout } from "layouts";
import { ArgonBox } from "components/ArgonTheme";
import DataTable from "slots/Tables/DataTable";
import { ArgonSnackbar } from "components/ArgonTheme";
import { HTTP_CLIENT, APIFY } from "helpers/Api";
import { GET_ROUTE_NAME, HAS_PERMISSIONS, SET_PAGE_TITLE } from "helpers/Base";
import HasPermissionButton from "slots/Custom/Buttons/HasPermissionButton";
import ArgonBadge from "components/ArgonBadge";
import CardWrapper from "slots/Cards/CardWrapper";

function Users() {
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
    HTTP_CLIENT(APIFY("/v1/users"), {}).then((data) => {
      setColumns([
        { accessor: "employee_code", Header: "Employee Code" },
        {
          accessor: "full_name",
          Header: "Full Name",
          Cell: (row) => {
            return (
              <Tooltip title={"view user detail"} sx={{ cursor: "pointer" }}>
                {HAS_PERMISSIONS(["/dashboard/users/view"]) ? (
                  <ArgonBox
                    component={Link}
                    to={GET_ROUTE_NAME("VIEW_USER", { uuid: row.cell.row.original["uuid"] })}
                  >
                    <span className="hover-effect">{row.cell.value}</span>
                  </ArgonBox>
                ) : (
                  <span>{row.cell.value}</span>
                )}
              </Tooltip>
            );
          },
        },
        { accessor: "email", Header: "Email" },
        {
          accessor: "departments",
          Header: "Department",
          Cell: (row) => {
            return (
              <>
                {row.cell?.value.map((department, key) => {
                  return <span key={key}>{department.name}</span>;
                })}
              </>
            );
          },
        },
        { accessor: "user_attribute.designation", Header: "Designation" },
        {
          accessor: "roles",
          Header: "Roles",
          Cell: (row) => {
            return (
              <div
                style={{
                  width: "100px",
                  display: "flex",
                  flexWrap: "wrap",
                  fontSize: "12px",
                  gap: "5px",
                }}
              >
                {row.cell.value.map((role, key) => {
                  return (
                    <Tooltip key={key} title={role.name}>
                      <Chip variant={"outlined"} size={"small"} label={role.name} color="primary" />
                    </Tooltip>
                  );
                })}
              </div>
            );
          },
        },
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
                  sx={{ marginLeft: "10px" }}
                  permissions={["/dashboard/users/edit"]}
                  route={GET_ROUTE_NAME("EDIT_USER", { uuid: row.cell.value })}
                  text={`Edit`}
                  icon={<Edit />}
                />
              </ArgonBox>
            );
          },
        },
      ]);
      setRows(data["users"]);
    });
  };

  useEffect(() => {
    SET_PAGE_TITLE("Users");
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
    <DashboardLayout breadcrumbTitle="Manage Users">
      <CardWrapper
        headerTitle={"Users"}
        headerActionButton={() => {
          return (
            <HasPermissionButton
              color="primary"
              permissions={["/dashboard/users/create"]}
              route={GET_ROUTE_NAME("ADD_USER")}
              text={`Add New User`}
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
            ? "User Created Successfully"
            : snackbarParams.type === "UPDATE"
              ? "User Updated Successfully"
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

export default Users;
