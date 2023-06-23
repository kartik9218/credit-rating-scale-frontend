import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Grid } from "@mui/material";
import { AddBox, Edit } from "@mui/icons-material";
import { SET_PAGE_TITLE } from "helpers/Base";
import { DashboardLayout } from "layouts";
import { ArgonBox } from "components/ArgonTheme";
import Table from "slots/Tables/Table";
import { ArgonTypography } from "components/ArgonTheme";
import { ArgonSnackbar } from "components/ArgonTheme";
import { HTTP_CLIENT } from "helpers/Api";
import { APIFY } from "helpers/Api";
import { GET_ROUTE_NAME } from "helpers/Base";
import HasPermissionButton from "slots/Custom/Buttons/HasPermissionButton";
import DataTable from "slots/Tables/DataTable";

function Masters() {
  var { state } = useLocation();
  const [masters, setMasters] = useState([]);

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
    HTTP_CLIENT(APIFY("/v1/master_groups"), {}).then((data) => {
      setMasters(data["masters"]);
    });
  };
  useEffect(() => {
    SET_PAGE_TITLE("Masters List");
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
    <DashboardLayout breadcrumbTitle="Manage Masters">
      <ArgonBox py={3} sx={{ height: "calc(100vh - 20vh)", maxHeight: "100%", overflow: "scroll" }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ArgonBox
              bgColor="white"
              borderRadius="lg"
              shadow="lg"
              opacity={1}
              py={2}
              px={3}
              padding="10px"
            >
              <ArgonBox
                display="flex"
                flexDirection="row"
                justifyContent="space-between"
                px={1}
                py={2}
              >
                <ArgonTypography variant="h5" padding="10px">
                  Master Group
                </ArgonTypography>
                <ArgonBox paddingRight="10px">
                  <HasPermissionButton
                    color="primary"
                    route={GET_ROUTE_NAME("MASTER_CREATE")}
                    permissions={["/dashboard/settings/masters/create"]}
                    text={`Add New Master`}
                    icon={<AddBox />}
                  />
                </ArgonBox>
              </ArgonBox>

              <ArgonBox>
                <DataTable
                  table={{
                    columns:
                      [
                        { accessor: "ID", Header: "No." ,align: "left",width:"20px" },
                        { accessor: "Group", Header: "Group" ,align: "left" },
                        { accessor: "uuid", Header: "" ,align: "right" },
                      ],
                    rows:
                      masters.map((master, key) => {
                        return {
                          ID: key+1 +".",
                          Group: master.key,
                          "uuid": (
                            <>
                              <ArgonBox
                                display="Flex"
                                flexDirection="row"
                                justifyContent="space-between"
                              >
                                <HasPermissionButton
                                  color="info"
                                  permissions={["/dashboard/settings/masters/edit"]}
                                  route={GET_ROUTE_NAME("MASTER_EDIT", {
                                    slug: master.key,
                                  })}
                                  text={`Edit`}
                                  icon={<Edit />}
                                />
                              </ArgonBox>
                            </>
                          ),
                        };
                      })
                  }}
                  canSearch={true}
                  customHeight={"calc(100vh - 30vh)"}
                />
              </ArgonBox>
            </ArgonBox>
          </Grid>
        </Grid>
        <ArgonSnackbar
          color={"success"}
          icon="success"
          title={
            snackbarParams.type === "CREATE"
              ? "Master Created Successfully"
              : snackbarParams.type === "UPDATE"
                ? "Master Updated Successfully"
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
      </ArgonBox>
    </DashboardLayout>
  );
}
export default Masters;
