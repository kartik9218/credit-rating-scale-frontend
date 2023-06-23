import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import { useNavigate } from "react-router-dom";
import { ArrowBackRounded, Edit } from "@mui/icons-material";
import { Autocomplete, Button, Switch, TextField } from "@mui/material";
import { HTTP_CLIENT, APIFY } from "helpers/Api";
import { SET_PAGE_TITLE, GET_ROUTE_NAME, GET_QUERY } from "helpers/Base";
import FormField from "slots/FormField";
import { DashboardLayout } from "layouts";
import { ArgonSnackbar, ArgonBox } from "components/ArgonTheme";
import ArgonButton from "components/ArgonButton";
import ArgonTypography from "components/ArgonTypography";
import HasPermissionButton from "slots/Custom/Buttons/HasPermissionButton";
import DataTable from "slots/Tables/DataTable";
import ArgonBadge from "components/ArgonBadge";
import CardWrapper from "slots/Cards/CardWrapper";

function MasterEdit() {
  const navigate = useNavigate();
  const masterSlug = GET_QUERY("slug");
  const [params, setParams] = useState({
    uuid: "",
    group: masterSlug,
    name: "",
    value: "",
    type: "text",
    order: "",
    is_active: "",
  });

  const [Master, setMaster] = useState([]);
  const [Masters, setMasters] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(undefined);
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [response, setResponse] = useState(null);
  const [backdropOpen, setBackdropOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const onFormSubmit = async (ev) => {
    ev.preventDefault();
    if (params.order >= 0) {
      let url = isEdit ? "/v1/master/edit" : "/v1/master/create";
      if (!isEdit) {
        delete params.uuid;
        delete params.is_active;
      }

      HTTP_CLIENT(APIFY(url), { params: params })
        .then((response) => {
          if (response["success"]) {
            groupDetail();
            if (isEdit) {
              setMsg("Master Updated Successfully")
            } else {
              setMsg("Master Created Successfully")
            }
            updateParams("uuid", "");
            updateParams("name", "");
            updateParams("value", "");
            updateParams("order", "");
            updateParams("is_active", "");
            setResponse("success");
            setSnackbarOpen(true);
            return;
          }
        })
        .catch((err) => {

          setMsg("Master Creation Failed")
          setResponse("error");
          setSnackbarOpen(true);
        });
    } else {

      setMsg("Order no. should be positive.")
      setResponse("error");
      setSnackbarOpen(true);
    }
  };

  const handelEdit = (masterData) => {
    updateParams("uuid", masterData.uuid);
    updateParams("group", masterData.group);
    updateParams("name", masterData.name);
    updateParams("value", masterData.value);
    updateParams("type", masterData.type);
    updateParams("order", masterData.order);
    updateParams("is_active", masterData.is_active);
    setIsEdit(true);
  };

  const updateParams = (key, value) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const groupDetail = async () => {
    HTTP_CLIENT(APIFY("/v1/master"), { group: masterSlug }).then((response) => {
      const masters = response["masters"];
      setColumns([
        { accessor: "name", Header: "Name" },
        { accessor: "value", Header: "Value" },
        { accessor: "order", Header: "Order", align: "left" },
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
                <Button onClick={() => handelEdit(row.row.original)}>
                  <Edit />
                </Button>
              </ArgonBox>
            );
          },
        },
      ]);
      setRows(masters);
    });
    setBackdropOpen(false);
  };

  const fetchMastersGroup = () => {
    HTTP_CLIENT(APIFY("/v1/master_groups"), {}).then((data) => {
      let masterGroup = data["masters"];
      let masters = masterGroup.map((mg) => {
        return {
          value: mg.key,
          label: mg.key,
        };
      });

      setMasters(masters);
      let selectedGroup = masters.findIndex((m) => m.label === params["group"]);
      if (selectedGroup >= 0) {
        setSelectedGroup([masters[selectedGroup]]);
      }
      setIsVisible(true);
    });
  };

  const onCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    SET_PAGE_TITLE(`Master Update`);

    let ajaxEvent = true;
    if (ajaxEvent) {
      fetchMastersGroup();
      groupDetail();
    }

    return () => {
      ajaxEvent = false;
    };
  }, []);

  return (
    <DashboardLayout breadcrumbTitle={`${masterSlug} - Manage Master`}>
      <ArgonBox component="form" role="form" onSubmit={onFormSubmit}>
        <CardWrapper
          headerTitle={`${masterSlug} - Manage Master`}
          headerActionButton={() => {
            return (
              <HasPermissionButton
                color="primary"
                permissions={["/dashboard/settings/masters"]}
                route={GET_ROUTE_NAME("LIST_MASTER")}
                text={`Back to Master`}
                icon={<ArrowBackRounded />}
              />
            );
          }}
          footerActionButton={() => {
            return <></>;
          }}
        >
          {!backdropOpen && Master && isVisible && (
            <Grid container spacing={1} paddingLeft="1rem" paddingRight="1rem">
              <Grid item xs={12} sm={6} md={3}>
                <FormField
                  type="text"
                  name="name"
                  label="Name*"
                  placeholder="Enter Name "
                  onChange={(ev) => updateParams("name", ev.target.value)}
                  value={params["name"]}
                  required
                />
              </Grid>
              <Grid item xs={6} display="none">
                <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
                  <ArgonTypography
                    component="label"
                    variant="caption"
                    fontWeight="bold"
                    textTransform="capitalize"
                  >
                    Select Group*
                  </ArgonTypography>
                </ArgonBox>
                <Autocomplete
                  id="free-solo-2-demo"
                  disableClearable
                  options={Masters}
                  value={params["group"]}
                  disabled={true}
                  renderInput={(groupParams) => (
                    <TextField
                      {...groupParams}
                      value={params["group"]}
                      InputProps={{
                        ...groupParams.InputProps,
                        type: "search",
                      }}
                      disabled={true}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormField
                  type="text"
                  name="value"
                  label="Value*"
                  placeholder="Enter Value "
                  onChange={(ev) => updateParams("value", ev.target.value)}
                  value={params["value"]}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3} display="none">
                <FormField
                  type="text"
                  name="type"
                  label="Type*"
                  placeholder="Enter Type "
                  onChange={(ev) => updateParams("type", ev.target.value)}
                  value={params["type"]}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormField
                  type="number"
                  name="order"
                  label="Order"
                  placeholder="Enter Order "
                  onChange={(ev) => updateParams("order", ev.target.value)}
                  value={params["order"]}
                />
              </Grid>
              {isEdit && (
                <Grid item paddingLeft={3} marginTop={4} xs={12} sm={3} display="flex">
                  <ArgonBox mr={1}>
                    <Switch
                      name="is_active"
                      checked={params["is_active"]}
                      onChange={(e) => updateParams("is_active", e.target.checked)}
                    />
                    {params["is_active"] ? "  Active" : "  Inactive"}
                  </ArgonBox>
                </Grid>
              )}
              <ArgonBox spacing={3} marginTop={"18px"} padding="1rem">
                <ArgonButton type="submit" color="success">
                  {isEdit ? "Update" : "Submit"}
                </ArgonButton>
              </ArgonBox>
            </Grid>
          )}
          <DataTable
            table={{
              columns: columns,
              rows: rows,
            }}
          />
          <ArgonSnackbar
            color={response}
            icon={response ? response : "error"}
            title={msg}
            content=""
            translate="yes"
            dateTime=""
            open={snackbarOpen}
            close={onCloseSnackbar}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
          />
        </CardWrapper>
      </ArgonBox>
    </DashboardLayout>
  );
}
export default MasterEdit;
