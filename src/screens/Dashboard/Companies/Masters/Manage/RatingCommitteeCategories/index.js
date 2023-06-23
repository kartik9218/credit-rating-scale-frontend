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

function RatingCommitteeCategories() {
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

  const fetchRatingCommitteeCategories = async () => {
    HTTP_CLIENT(APIFY("/v1/rating_committee_meeting_categories"), { params: {} }).then(
      (response) => {
        const rating_committee_meeting_categories = response["rating_committee_meeting_categories"];
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
                    permissions={["/dashboard/company/master/rating-committee-categories/edit"]}
                    route={GET_ROUTE_NAME("EDIT_RATING_COMMITTEE_CATEGORIES", {
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
        rating_committee_meeting_categories.forEach((category, key) => {
          rating_committee_meeting_categories[key].id = key + 1;
        })
        setRows(rating_committee_meeting_categories);
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
    SET_PAGE_TITLE(`Rating Committee Categories`);

    let ajaxEvent = true;
    if (ajaxEvent) {
      fetchRatingCommitteeCategories();
      if (state) {
        handleSuccessState();
      }
    }

    return () => {
      ajaxEvent = false;
    };
  }, []);

  return (
    <DashboardLayout breadcrumbTitle="Rating Committee Categories">
      <CardWrapper
        headerTitle="Rating Committee Categories"
        headerActionButton={() => {
          return (
            <HasPermissionButton
              color="primary"
              permissions={["/dashboard/company/master/rating-committee-categories/create"]}
              route={GET_ROUTE_NAME("ADD_RATING_COMMITTEE_CATEGORIES")}
              text={`Add Rating Committee Category`}
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
              ? "Rating Committee Category Created Successfully"
              : snackbarParams.type === "UPDATE"
              ? "Rating Committee Category Updated Successfully"
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

export default RatingCommitteeCategories;
