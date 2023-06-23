import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Add, ArrowBackRounded, Edit } from "@mui/icons-material";
import { HTTP_CLIENT, APIFY } from "helpers/Api";
import { SET_PAGE_TITLE } from "helpers/Base";
import { GET_ROUTE_NAME } from "helpers/Base";
import { DashboardLayout } from "layouts";
import { ArgonSnackbar, ArgonBox } from "components/ArgonTheme";
import HasPermissionButton from "slots/Custom/Buttons/HasPermissionButton";
import DataTable from "slots/Tables/DataTable";
import ArgonBadge from "components/ArgonBadge";
import CardWrapper from "slots/Cards/CardWrapper";

function Countries() {
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

  const fetchCountries = async () => {
    HTTP_CLIENT(APIFY("/v1/countries"), { params: {} }).then((response) => {
      const countries = response["countries"];
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
          accessor: "uuid",
          Header: "",
          align: "right",
          Cell: (row) => {
            return (
              <ArgonBox display="Flex" flexDirection="row" justifyContent="space-between">
                <HasPermissionButton color="primary" permissions={["/dashboard/company/master/countries/edit"]} route={GET_ROUTE_NAME("EDIT_COUNTRY", { uuid: row.cell.value })} text={`Edit`} icon={<Edit />} />
              </ArgonBox>
            );
          },
        },
      ]);
      countries.forEach((country, key) => {
        countries[key].id = key + 1;
      })
      setRows(countries);
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
    SET_PAGE_TITLE(`Manage Countries`);

    let ajaxEvent = true;
    if (ajaxEvent) {
      fetchCountries();
      if (state) {
        handleSuccessState();
      }
    }

    return () => {
      ajaxEvent = false;
    };
  }, []);

  return (
    <DashboardLayout breadcrumbTitle="Manage Countries">
      <CardWrapper
        headerTitle="Manage Countries"
        headerActionButton={() => {
          return <HasPermissionButton color="primary" permissions={["/dashboard/company/master/countries/create"]} route={GET_ROUTE_NAME("ADD_COUNTRY")} text={`Add New County`} icon={<Add />} />;
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
          title={snackbarParams.type === "CREATE" ? "Country Created Successfully" : snackbarParams.type === "UPDATE" ? "Country Updated Successfully" : ""}
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

export default Countries;
