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

function Categories() {
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
    HTTP_CLIENT(APIFY("/v1/categories"), { params: {} }).then((response) => {
      const categories = response["instrument_categories"];
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
        { accessor: "category_name", Header: "Name" },
        {
          accessor: "mandate_types", Header: "Mandate Type",
          Cell: (row) => {
            return (
              <>
                {row.cell.value?.name}
              </>
            );
          }
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
                  permissions={["/dashboard/company/master/categories/edit"]}
                  route={GET_ROUTE_NAME("EDIT_CATEGORIES", { uuid: row.cell.value })}
                  text={`Edit`}
                  icon={<Edit />}
                />
              </ArgonBox>
            );
          },
        },
      ]);

      categories.forEach((category, key) => {
        categories[key].id = key + 1;
      })
      setRows(categories);
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
    SET_PAGE_TITLE(`Manage Categories`);
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
    <DashboardLayout breadcrumbTitle="Manage Categories">
      <CardWrapper
        headerTitle="Manage Instrument Category"
        headerActionButton={() => {
          return (
            <HasPermissionButton
              color="primary"
              permissions={["/dashboard/company/master/categories/create"]}
              route={GET_ROUTE_NAME("ADD_CATEGORIES")}
              text={`Add Category`}
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
              ? "Category Created Successfully"
              : snackbarParams.type === "UPDATE"
                ? "Category Updated Successfully"
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

export default Categories;
