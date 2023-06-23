import { ArrowBackRounded } from "@mui/icons-material";
import { Button, Grid, Icon, IconButton, Snackbar, Typography } from "@mui/material";
import ArgonSnackbar from "components/ArgonSnackbar";
import { APIFY } from "helpers/Api";
import { HTTP_CLIENT } from "helpers/Api";
import { SET_PAGE_TITLE } from "helpers/Base";
import { GET_ROUTE_NAME } from "helpers/Base";
import DashboardLayout from "layouts/DashboardLayout";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import CardWrapper from "slots/Cards/CardWrapper";
import HasPermissionButton from "slots/Custom/Buttons/HasPermissionButton";

const AddModelMap = () => {
  const navigate = useNavigate();
  const [industriesData, setIndustriesData] = useState([]);
  const [modelData, setModelData] = useState({
    models: [],
    version: [],
  });
  const [response, setResponse] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("Please check all required fields");
  const [params, setParams] = useState({
    rating_model_uuid: "",
    sub_industry_uuid: [],
  });

  const getModelAndVersions = () => {
    let ratingModels = [];
    HTTP_CLIENT(APIFY("/v1/rating_models"), { params: "" })
      .then((data) => {
        const { rating_models } = data;
        rating_models.forEach((rm) => {
          ratingModels.push({ label: rm.name, value: rm.uuid, id: rm.id });
        });
        setModelData({ ...modelData, models: ratingModels });
      })
      .catch((err) => console.error(err));
  };
  const handleShowSnackBar = (messageType) => (message) => {
    setSnackbarOpen(true);
    setResponse(messageType);
    setSnackbarMessage(message);
  };
  const onCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  const getSubIndustries = () => {
    let industriesD = [];
    HTTP_CLIENT(APIFY("/v1/sub_industries"), { params: "" })
      .then((data) => {
        const { sub_industries } = data;
        sub_industries.forEach((industry) => {
          industriesD.push({ label: industry.name, value: industry.uuid });
          setIndustriesData(industriesD);
        });
      })
      .catch((err) => console.error(err));
  };

  const handleModelChange = (e) => {
    let version = [];
    modelData.models.forEach((i) => {
      if (i.value === e.value) {
        version.push({ label: i.id, value: i.id });
      }
    });
    setModelData({ ...modelData, version: version });
    setParams({ ...params, rating_model_uuid: e.value });
  };

  const createModel = () => {
    HTTP_CLIENT(APIFY("/v1/industry_model_mapping/create"), { params: params })
      .then((data) => {
        const { industry_model_mapping, success } = data;
        navigate(GET_ROUTE_NAME("LIST_MODEL_MAPPING"));
        handleShowSnackBar("success")(`New model map created successfully`);
        return;
      })
      .catch((err) => {
        handleShowSnackBar("error")(`Something went wrong!`);
      });
  };

  // const handleVersion = (e) => {
  //   setParams({ ...params, version: e.value });
  // };

  const handleIndustryChange = (event) => {
    let industryUUID = [];
    event.forEach((e) => {
      industryUUID.push(e.value);
    });
    setParams({ ...params, sub_industry_uuid: industryUUID });
  };

  useEffect(() => {
    SET_PAGE_TITLE("Add New Model");
  });

  useEffect(() => {
    getModelAndVersions();
    getSubIndustries();
  }, []);

  return (
    <DashboardLayout>
      <CardWrapper
        headerTitle="Add New Model"
        headerActionButton={() => {
          return <HasPermissionButton color="primary" permissions={["/dashboard/rating-modules/model-mapping"]} route={GET_ROUTE_NAME("LIST_MODEL_MAPPING")} text={`Back to List of Model Mapping`} icon={<ArrowBackRounded />} />;
        }}
      >
        <Grid container xs={6} ml="2rem">
          <Grid container alignItems="center">
            <Grid xs={3}>
              <Typography sx={{ fontSize: "14px" }}>Select Model</Typography>
            </Grid>
            <Grid xs={6}>
              <Select options={modelData.models} onChange={handleModelChange} placeholder="Select Model" />
            </Grid>
          </Grid>
          <Grid container my="0.6rem" alignItems="center">
            <Grid xs={3}>
              <Typography sx={{ fontSize: "14px" }}>Select Version</Typography>
            </Grid>
            <Grid xs={6}>
              <Select options={modelData.version} value={modelData.version} placeholder="Select Version" />
            </Grid>
          </Grid>
          <Grid container alignItems="center">
            <Grid xs={3}>
              <Typography sx={{ fontSize: "14px" }}>Select Industries</Typography>
            </Grid>
            <Grid xs={6}>
              <Select options={industriesData} onChange={handleIndustryChange} placeholder="Select Industries" isMulti="true" />
            </Grid>
          </Grid>
          <Button
            disabled={params.sub_industry_uuid.length > 0 && params.rating_model_uuid ? false : true}
            onClick={createModel}
            sx={{
              backgroundColor: "#2dce89",
              color: "#ffffff",
              mt: "2rem",
              borderRadius: "0.5rem",
              padding: "0.6rem 1.4rem",
              "&:hover": {
                backgroundColor: "#2dce89",
                color: "#ffffff",
              },
            }}
          >
            Assign
          </Button>
        </Grid>
        <ArgonSnackbar
          color={response}
          icon={response ? response : "error"}
          title={response === "success" ? "Success" : response === "error" ? "Error" : ""}
          content={snackbarMessage}
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
    </DashboardLayout>
  );
};

export default AddModelMap;
