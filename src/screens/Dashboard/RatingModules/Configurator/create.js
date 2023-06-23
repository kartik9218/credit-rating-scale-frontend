import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import { ArrowBackRounded, Add } from "@mui/icons-material";
import { DashboardLayout } from "layouts";
import { HTTP_CLIENT, APIFY } from "helpers/Api";
import { GET_ROUTE_NAME, SET_PAGE_TITLE } from "helpers/Base";
import ArgonButton from "components/ArgonButton";
import { ArgonBox } from "components/ArgonTheme";
import ArgonTypography from "components/ArgonTypography";
import { ArgonSnackbar } from "components/ArgonTheme";
import { Backdrop, CircularProgress } from "@mui/material";
import HasPermissionButton from "slots/Custom/Buttons/HasPermissionButton";
import ArgonSelect from "components/ArgonSelect";
import ConfiguratorTreeView from "./TreeView";
import AddQuestion from "./AddQuestion";
import { ArgonInput } from "components/ArgonTheme";

function ConfiguratorAdd() {
  const [modelName, setModelName] = useState("");
  const [risk, setRisk] = useState(undefined);
  const [factorUUID, setFactorUUID] = useState(undefined);
  const [selectedModal, setSelectedModal] = useState({});
  const [modelUuid, setModelUuid] = useState("");
  const [msg, setMsg] = useState("");
  const [notchingMaster, setNotchingMaster] = useState(undefined);
  const [ratingModel, setRatingModel] = useState(undefined);
  const [riskTypes, setRiskTypes] = useState(undefined);
  const [selectedRisk, setSelectedRisk] = useState({});
  const [factorData, setFactorData] = useState(undefined);
  const [riskTypesandFactors, setRiskTypesandFactors] = useState(undefined);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [showFactor, setShowFactor] = useState(false);
  const [backdropOpen, setBackdropOpen] = useState(false);
  const [isRiskDisabled, setIsRiskDisabled] = useState(true);
  const [response, setResponse] = useState(null);

  const onChangeModel = (opt) => {
    setBackdropOpen(true);
    setModelUuid(opt.value);
    setShowFactor(false);
    setSelectedModal(opt);
    HTTP_CLIENT(APIFY("/v1/risk_types"), { params: { is_active: true } }).then((response) => {
      let risk_types = response["risk_types"];


      HTTP_CLIENT(APIFY("/v1/rating_models/view_risk_types"), {
        params: {
          rating_model_uuid: opt.value,
        },
      }).then((data) => {
        for (let index = risk_types.length; index > 0; index--) {
          const element = risk_types[index - 1];
          data.risk_types.map((selectedRisk) => {
            if (selectedRisk?.name === element.name) {
              risk_types.splice(index - 1, 1);
            }
          });
        }
        data.risk_types.map((selectedRisk, key) => {
          if (selectedRisk.name === "Notching") {
            HTTP_CLIENT(APIFY("/v1/master"), { group: "NOTCHING_TYPE" }).then((master) => {
              setNotchingMaster(master.masters)
            });
          }
          let where = {
            params: {
              rating_model_uuid: opt.value,
              risk_type_uuid: selectedRisk.uuid,
            },
          };
          HTTP_CLIENT(APIFY("/v1/rating_models/view_factors"), where).then((factorData) => {
            data.risk_types[key].factors = factorData.factors
          });
        });

        let result = risk_types.map((risk_type) => {
          
          return {
            label: risk_type.name,
            value: risk_type.uuid,
          };
        });
        setRiskTypes(result);
        setRiskTypesandFactors(data.risk_types);
      });
    });
    setIsRiskDisabled(false);
    setBackdropOpen(false);
  };

  const hendleAsignRisk = () => {
    HTTP_CLIENT(APIFY("/v1/rating_models/assign_risk_types"), { params: { rating_model_uuid: modelUuid, risk_type_uuid: selectedRisk.value } }).then((factorData) => {
      onChangeModel(selectedModal)
      setSelectedRisk({});
    });
  }
  const hendleRiskSelect = (opt) => {
    setSelectedRisk(opt);
  }

  const onCloseSnackbar = () => {
    setSnackbarOpen(false);
    setMsg("");
  };

  const fetchRatingModelData = () => {
    setBackdropOpen(true);
    HTTP_CLIENT(APIFY("/v1/rating_models"), { is_active: true }).then((data) => {
      let result = data.rating_models.map((rating_model) => {
        return {
          label: rating_model.name,
          value: rating_model.uuid,
        };
      });
      setRatingModel(result);
      setBackdropOpen(false);
    });
  };

  const getFactors = (opt) => {
    setBackdropOpen(true);
    setRisk(opt);
    setBackdropOpen(false);
  };

  const onRatingModelFormSubmit = async (ev) => {
    ev.preventDefault();
    HTTP_CLIENT(APIFY("/v1/rating_models/create"), { params: { name: modelName } })
      .then((data) => {
        if (data["success"]) {
          setModelName("");
          fetchRatingModelData();
          setResponse("success");
          setMsg("Rating Model Created Successfully.");
          setSnackbarOpen(true);

          return;
        }
      })
      .catch((err) => {
        setResponse("error");
        setMsg("Rating Model Creation Failed!!");
        setSnackbarOpen(true);
      });
  };

  const factorChange = (factorUUID, rk) => {
    setRisk(rk);
    setFactorUUID(factorUUID);
    HTTP_CLIENT(APIFY("/v1/factors/view"), { params: { uuid: factorUUID } })
      .then((data) => {
        if (data["success"]) {
          setFactorData(data.factor);
          setShowFactor(true);
          return;
        }
      })
      .catch((err) => {
        setResponse("error");
        setMsg("Factor not found!!");
        setSnackbarOpen(true);
      });
  };
  const AddNewQuestion = () => {
    setFactorUUID(undefined);
    setFactorData(undefined)
    setShowFactor(true);
  };

  useEffect(() => {
    SET_PAGE_TITLE(`Configurator Create`);

    let ajaxEvent = true;
    if (ajaxEvent) {
      fetchRatingModelData();
    }

    return () => {
      ajaxEvent = false;
    };
  }, []);

  return (
    <DashboardLayout breadcrumbTitle="Configurator Create">
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
              sx={{ height: "calc(100vh - 20vh)", overflow: "scroll" }}
            >
              <ArgonBox
                display="flex"
                flexDirection="row"
                justifyContent="space-between"
                px={1}
                py={2}
              >
                <ArgonTypography variant="h4" paddingLeft="5px">
                  Rating Model Configurator
                </ArgonTypography>
                <ArgonBox paddingRight="10px">
                  <HasPermissionButton
                    color="primary"
                    permissions={["/dashboard/rating-modules/configurators"]}
                    route={GET_ROUTE_NAME("LIST_CONFIGURATOR")}
                    text={`Back to Configurators`}
                    icon={<ArrowBackRounded />}
                  />
                </ArgonBox>
              </ArgonBox>
              <ArgonBox
                container
                display="flex"
                justifyContent="space-between"
                flexDirection="row"
                px={3}
                py={2}
              >
                <Grid item xs={12} md={6}>
                  <ArgonTypography variant="h5" marginBottom="1rem">
                    Select Risk/Model
                  </ArgonTypography>
                  <ArgonBox component="form" role="form" onSubmit={onRatingModelFormSubmit}>
                    <Grid
                      paddingRight="1rem"
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Grid item xs={4}>
                        <b>Add model :</b>
                      </Grid>
                      <Grid
                        item
                        xs={8}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <ArgonInput
                          type="text"
                          name="model_name"
                          placeholder="Enter Model Name "
                          onChange={(ev) => setModelName(ev.target.value)}
                          value={modelName}
                          required
                          sx={{ marginRight: "5px" }}
                        />
                        <ArgonButton
                          type="submit"
                          color="success"
                          sx={{ padding: "10px 15px", minHeight: "0", minWidth: "0", marginLeft: "15px", boxShadow: "none" }}
                        >
                          <Add />
                        </ArgonButton>
                      </Grid>
                    </Grid>
                  </ArgonBox>
                  <Grid
                    paddingRight="1rem"
                    marginTop="1rem"
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Grid item xs={4}>
                      <b>Select Model :</b>
                    </Grid>
                    <Grid
                      item
                      xs={8}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Grid item xs={10}>
                        <ArgonSelect
                          sx={{ width: "100%", borderRadius: "10px" }}
                          placeholder="Select Model"
                          options={ratingModel}
                          onChange={onChangeModel}
                          value={selectedModal}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid
                    paddingRight="1rem"
                    marginTop="1rem"
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Grid item xs={4}>
                      <b>Select Risk Type:</b>
                    </Grid>
                    <Grid
                      item
                      xs={8}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Grid item xs={10}>
                        <ArgonSelect
                          sx={{ width: "100%", borderRadius: "10px" }}
                          placeholder="Select Risk"
                          options={riskTypes}
                          isDisabled={isRiskDisabled}
                          onChange={hendleRiskSelect}
                          value={selectedRisk}
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <ArgonButton
                          type="submit"
                          color="success"
                          sx={{ padding: "10px 15px", minHeight: "0", minWidth: "0", marginLeft: "20px", boxShadow: "none" }}

                          onClick={hendleAsignRisk}
                        >
                          <Add />
                        </ArgonButton>
                      </Grid>
                    </Grid>
                  </Grid>
                  {modelUuid && riskTypesandFactors && (
                    <Grid>
                      <ConfiguratorTreeView
                        fectors={riskTypesandFactors}
                        getFactors={getFactors}
                        factorChange={factorChange}
                        AddNewQuestion={AddNewQuestion}
                        setSnackbarOpen={setSnackbarOpen}
                        setMsg={setMsg}
                        setResponse={setResponse}
                        onChangeModel={onChangeModel}
                        selectedModal={selectedModal}
                        notchingMaster={notchingMaster}
                      />
                    </Grid>
                  )}
                </Grid>
                <Grid item xs={12} md={6} sx={{ borderLeft: "1px solid #c2c2c2" }}>
                  {showFactor && (
                    <Grid item sx={{ position: "sticky", top: "15px", paddingBottom: "20px" }}>
                      <AddQuestion
                        modelUuid={modelUuid}
                        risk={risk}
                        getFactors={getFactors}
                        setSnackbarOpen={setSnackbarOpen}
                        setMsg={setMsg}
                        setResponse={setResponse}
                        factorUUID={factorUUID}
                        onChangeModel={onChangeModel}
                        setBackdropOpen={setBackdropOpen}
                        selectedModal={selectedModal}
                        factorData={factorData}
                        setShowFactor={setShowFactor}
                      />
                    </Grid>
                  )}
                </Grid>
              </ArgonBox>
            </ArgonBox>
          </Grid>
        </Grid>
      </ArgonBox>

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

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={backdropOpen}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </DashboardLayout>
  );
}

export default ConfiguratorAdd;
