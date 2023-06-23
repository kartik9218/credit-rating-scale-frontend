import React, { useEffect, useState } from "react";
import { Add, ArrowBackRounded, Edit } from "@mui/icons-material";
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

function SubIndustries() {
  
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

  const fetchSubIndustries = async () => {
    HTTP_CLIENT(APIFY("/v1/sub_industries"), { params: {} }).then((response) => {
      const sub_industries = response["sub_industries"];
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
          accessor: "industry",
          Header: "Industry",
          Cell: (row) => {
            return <>{row.cell?.value?.name}</>;
          },
        },
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
                  permissions={["/dashboard/company/master/sub_industries/edit"]}
                  route={GET_ROUTE_NAME("EDIT_SUBINDUSTRIES", { uuid: row.cell.value })}
                  text={`Edit`}
                  icon={<Edit />}
                />
              </ArgonBox>
            );
          },
        },
      ]);
      sub_industries.forEach((sub_industry, key) => {
        sub_industries[key].id = key + 1;
      })
      setRows(sub_industries);
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
    SET_PAGE_TITLE(`Manage Sub Industries`);

    let ajaxEvent = true;
    if (ajaxEvent) {
      fetchSubIndustries();
      if (state) {
        handleSuccessState();
      }
    }

    return () => {
      ajaxEvent = false;
    };
  }, []);

  return (
    <DashboardLayout breadcrumbTitle="Manage Sub Industries">
      <CardWrapper
        headerTitle="Manage Sub Industries"
        headerActionButton={() => {
          return (
            <HasPermissionButton
              color="primary"
              permissions={["/dashboard/company/master/sub_industries/create"]}
              route={GET_ROUTE_NAME("ADD_SUBINDUSTRIES")}
              text={`Add Sub Industries`}
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
              ? "Sub Industry Created Successfully"
              : snackbarParams.type === "UPDATE"
              ? "Sub Industry Updated Successfully"
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

export default SubIndustries;
