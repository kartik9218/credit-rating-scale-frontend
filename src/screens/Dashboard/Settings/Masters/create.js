import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import { ArrowBackRounded } from "@mui/icons-material";
import { HTTP_CLIENT, APIFY } from "helpers/Api";
import { GET_ROUTE_NAME } from "helpers/Base";
import { ArgonSnackbar } from "components/ArgonTheme";
import ArgonButton from "components/ArgonButton";
import ArgonTypography from "components/ArgonTypography";
import { ArgonBox } from "components/ArgonTheme";
import FormField from "slots/FormField";
import { DashboardLayout } from "layouts";
import HasPermissionButton from "slots/Custom/Buttons/HasPermissionButton";
import { Autocomplete, TextField } from "@mui/material";

function MasterCreate() {
  const navigate = useNavigate();

  const [msg, setMsg] = useState("");
  const [params, setParams] = useState({
    group: "",
    name: "",
    value: "",
    type: "",
    order: "",
  });
  const [Masters, setMasters] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [response, setResponse] = useState(null);

  const fetchMastersGroup = () => {
    HTTP_CLIENT(APIFY("/v1/master_groups"), {}).then((data) => {
      setMasters(data["masters"]);
    });
  };

  const updateParams = (key, value) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const onFormSubmit = async (ev) => {
    ev.preventDefault();
    if(params.order >= 0){
      HTTP_CLIENT(APIFY("/v1/master/create"), { params: params })
        .then((response) => {
          if (response["success"]) {
            setResponse("success");
            setSnackbarOpen(true);
            navigate(GET_ROUTE_NAME("LIST_MASTER"), { state: { success: true, type: "CREATE" } });
            return;
          }
        })
        .catch((err) => {
          setMsg("Master Creation Failed")
          setResponse("error");
          setSnackbarOpen(true);
        });
    }else{
      setMsg("Order no. should be positive.")
      setResponse("error");
      setSnackbarOpen(true);
    }
  };

  const onCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    fetchMastersGroup();
  }, []);

  return (
    <DashboardLayout breadcrumbTitle="Manage Masters">
      <ArgonBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ArgonBox
              bgColor="white"
              borderRadius="lg"
              shadow="lg"
              opacity={1}
              py={2}
              padding="10px"
            >
              <ArgonBox
                display="flex"
                flexDirection="row"
                justifyContent="space-between"
                px={1}
                py={2}
              >
                <ArgonTypography variant="h5" paddingTop="10px" paddingLeft="10px">
                  Create Masters
                </ArgonTypography>
                <ArgonBox>
                  <HasPermissionButton
                    color="primary"
                    permissions={["/dashboard/settings/masters"]}
                    route={GET_ROUTE_NAME("LIST_MASTER")}
                    text={`Back to Masters`}
                    icon={<ArrowBackRounded />}
                  />
                </ArgonBox>
              </ArgonBox>
              <ArgonBox component="form" role="form" onSubmit={onFormSubmit}>
                <Grid container spacing={3} paddingLeft="1rem" paddingRight="1rem">
                  <Grid item xs={3} sm={6} md={6}>
                    <FormField
                      type="text"
                      name="name"
                      label="Name*"
                      placeholder="Enter Name "
                      onChange={(ev) => updateParams("name", ev.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
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
                      freeSolo
                      disableClearable
                      textTransform="capitel"
                      options={Masters.map((master) => {
                        return {
                          value: master.key,
                          label: master.key,
                        };
                      })}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label=""
                          value={params["group"]}
                          onChange={(e) => updateParams("group", e.target.value)}
                          InputProps={{
                            ...params.InputProps,
                            type: "search",
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={3} sm={6} md={6}>
                    <FormField
                      type="text"
                      name="value"
                      label="Value*"
                      placeholder="Enter Value "
                      onChange={(ev) => updateParams("value", ev.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={3} sm={6} md={6}>
                    <FormField
                      type="text"
                      name="type"
                      label="Type*"
                      placeholder="Enter Type "
                      onChange={(ev) => updateParams("type", ev.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={3} sm={6} md={6}>
                    <FormField
                      type="number"
                      name="order"
                      label="Order"
                      placeholder="Enter Order "
                      min={0}
                      onChange={(ev) => updateParams("order", ev.target.value)}
                    />
                  </Grid>
                </Grid>
                <ArgonBox spacing={3} padding="1rem">
                  <ArgonButton type="submit" color="success">
                    Submit
                  </ArgonButton>
                </ArgonBox>
              </ArgonBox>
            </ArgonBox>
          </Grid>
        </Grid>
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
      </ArgonBox>
    </DashboardLayout>
  );
}
export default MasterCreate;
