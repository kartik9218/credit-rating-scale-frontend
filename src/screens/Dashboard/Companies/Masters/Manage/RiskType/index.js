import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Add, Edit } from "@mui/icons-material";
import { HTTP_CLIENT, APIFY } from "helpers/Api";
import { SET_PAGE_TITLE } from "helpers/Base";
import { GET_ROUTE_NAME } from "helpers/Base";
import { DashboardLayout } from "layouts";
import { ArgonSnackbar, ArgonBox } from "components/ArgonTheme";
import HasPermissionButton from "slots/Custom/Buttons/HasPermissionButton";
import DataTable from "slots/Tables/DataTable";
import ArgonBadge from "components/ArgonBadge";
import CardWrapper from "slots/Cards/CardWrapper";

function RiskType() {
  
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

  const fetchRiskType = async () => {
    HTTP_CLIENT(APIFY("/v1/risk_types"), {}).then((response) => {
      const risk_types = response["risk_types"];
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
                  permissions={["/dashboard/company/master/risk_type/edit"]}
                  route={GET_ROUTE_NAME("EDIT_RISKTYPE", { uuid: row.cell.value })}
                  text={`Edit`}
                  icon={<Edit />}
                />
              </ArgonBox>
            );
          },
        },
      ]);
      risk_types.forEach((types, key) => {
        risk_types[key].id = key + 1;
      })
      setRows(risk_types);
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
    SET_PAGE_TITLE(`Manage Risk Type`);

    let ajaxEvent = true;
    if (ajaxEvent) {
      fetchRiskType();
      if (state) {
        handleSuccessState();
      }
    }

    return () => {
      ajaxEvent = false;
    };
  }, []);

  return (
    <DashboardLayout breadcrumbTitle="Manage Risk Type">
      <CardWrapper
        headerTitle="Manage Risk Type"
        headerActionButton={() => {
          return (
            <HasPermissionButton
              color="primary"
              permissions={["/dashboard/company/master/risk_type/create"]}
              route={GET_ROUTE_NAME("ADD_RISKTYPE")}
              text={`Add New Risk Type`}
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
              ? "Risk Type Created Successfully"
              : snackbarParams.type === "UPDATE"
              ? "Risk Type Updated Successfully"
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

export default RiskType;
