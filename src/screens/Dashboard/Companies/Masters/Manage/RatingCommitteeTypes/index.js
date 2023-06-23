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

function RatingCommitteeTypes() {
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

  const fetchRatingCommitteeTypes = async () => {
    HTTP_CLIENT(APIFY("/v1/rating_committee_types"), { params: {} }).then(
      (response) => {
        const rating_committee_types = response["rating_committees"];
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
          { accessor: "short_name", Header: "Short Name" },
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
                    permissions={["/dashboard/company/master/rating-committee-types/edit"]}
                    route={GET_ROUTE_NAME("EDIT_RATING_COMMITTEE_TYPES", {
                      uuid: row.cell.value,
                    })}
                    text={`Edit`}
                    icon={<Edit />}
                  />
                </ArgonBox>
              );
            },
          },
        ]);
        rating_committee_types.forEach((types, key) => {
          rating_committee_types[key].id = key + 1;
        })
        setRows(rating_committee_types);
      }
    );
    setBackdropOpen(false);
  };

  const onCloseSnackbar = () => {
    setSnackbarParams({
      success: false,
      type: "",
    });
  };

  useEffect(() => {
    SET_PAGE_TITLE(`Rating Committee Types`);

    let ajaxEvent = true;
    if (ajaxEvent) {
      fetchRatingCommitteeTypes();
      if (state) {
        handleSuccessState();
      }
    }

    return () => {
      ajaxEvent = false;
    };
  }, []);

  return (
    <DashboardLayout breadcrumbTitle="Rating Committee Types">
      <CardWrapper
        headerTitle="Rating Committee Types"
        headerActionButton={() => {
          return (
            <HasPermissionButton
              color="primary"
              permissions={["/dashboard/company/master/rating-committee-types/create"]}
              route={GET_ROUTE_NAME("ADD_RATING_COMMITTEE_TYPES")}
              text={`Add Rating Committee Types`}
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
              ? "Rating Committee Type Created Successfully"
              : snackbarParams.type === "UPDATE"
              ? "Rating Committee Type Updated Successfully"
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

export default RatingCommitteeTypes;
