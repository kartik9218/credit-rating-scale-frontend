import React, { useEffect, useState } from "react";
import { Button, Grid } from "@mui/material";
import { Delete, Add } from "@mui/icons-material";
import PropTypes from "prop-types";
import { HTTP_CLIENT, APIFY } from "helpers/Api";
import { ArgonInput } from "components/ArgonTheme";
import { ArgonTypography, ArgonButton } from "components/ArgonTheme";
import { ArgonBox } from "components/ArgonTheme";

function AddQuestion(props) {
  const { risk, modelUuid, selectedModal, setSnackbarOpen, setResponse, setShowFactor, setMsg, factorData, onChangeModel, factorUUID } =
    props;

  const [parameterValues, setParameterValues] = useState([{ label: "", value: "", uuid:"" }]);
  const [params, setParams] = useState({ factor_name: "", coefficient: "" });
  const [ratingModelRiskType, setRatingModelRiskType] = useState(undefined);

  let handleParameter = (i, value, name) => {
    let newFormValues = [...parameterValues];
    newFormValues[i][name] = value;
    setParameterValues(newFormValues);
  };

  const updateParams = (key, value) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  let addFormFields = () => {
    setParameterValues([...parameterValues, { label: "", value: "", uuid:"" }]);
  };

  let removeFormFields = async (i, parameter) => {
    if(parameter.uuid){
      await HTTP_CLIENT(APIFY("/v1/factor_parameters/edit"), {
        params: {
          uuid:parameter.uuid,
          factor_uuid: factorUUID,
          name: parameter.label,
          score: parameter.value,
          is_active:false
        },
      });
    }

    let newFormValues = [...parameterValues];
    newFormValues.splice(i, 1);
    setParameterValues(newFormValues);
  };

  const getratingModalDetail = () => {
    let data = {
      rating_model_uuid: modelUuid,
      risk_type_uuid: risk.value,
    };
    HTTP_CLIENT(APIFY("/v1/rating_model_risk_type/view"), { params: data })
      .then((response) => {
        if (response["success"]) {
          setRatingModelRiskType(response.rating_model_risk_type.uuid);
          return;
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const onFormSubmit = async (e) => {
    e.preventDefault();

    let data = {
      rating_model_risk_type_uuid: ratingModelRiskType,
      question: params.factor_name,
      coefficient: params.coefficient,
      max_score: Math.max(
        ...parameterValues.map((para) => {
          return para.value;
        })
      ),
    };
    HTTP_CLIENT(APIFY("/v1/rating_models/create_risk_type_factors"), { params: data })
      .then((response) => {
        parameterValues.map(async (parameter) => {
          await HTTP_CLIENT(APIFY("/v1/factor_parameters/create"), {
            params: {
              factor_uuid: response.rating_model_risk_type_factor,
              name: parameter.label,
              score: parameter.value,
            },
          });
        });

        setResponse("success");
        setMsg("Factor Created successfully");
        setSnackbarOpen(true);
        setShowFactor(false);
        onChangeModel(selectedModal)
        return;
      })
      .catch((err) => {
        setResponse("error");
        setMsg(err.error?.name ? err.error?.name : "Factor Must Be Unique ");
        setSnackbarOpen(true);
      });
  };

  const onEditFormSubmit = async (e) => {
    e.preventDefault();

    let data = {
      uuid: factorUUID,
      question: params.factor_name,
      coefficient: params.coefficient,
      max_score: Math.max(
        ...parameterValues.map((para) => {
          return para.value;
        })
      ),
    };
    HTTP_CLIENT(APIFY("/v1/rating_models/edit_risk_type_factors"), { params: data })
      .then((response) => {
        parameterValues.map(async (parameter) => {
          if(parameter.uuid){
            await HTTP_CLIENT(APIFY("/v1/factor_parameters/edit"), {
              params: {
                uuid: parameter.uuid,
                factor_uuid: factorUUID,
                name: parameter.label,
                score: parameter.value,
              },
            });
          }else{
            await HTTP_CLIENT(APIFY("/v1/factor_parameters/create"), {
              params: {
                factor_uuid: factorUUID,
                name: parameter.label,
                score: parameter.value,
              },
            });
          }
        });

        setResponse("success");
        setMsg("Factor Updated successfully");
        setSnackbarOpen(true);
        setShowFactor(false);
        onChangeModel(selectedModal)
        return;
      })
      .catch((err) => {
        setResponse("error");
        setMsg(err.error?.name ? err.error?.name : "Factor Must Be Unique");
        setSnackbarOpen(true);
      });
  };

  const setFactorData = () => {
    updateParams('factor_name', factorData.question);
    updateParams('coefficient', factorData.coefficient);
    if (factorData.factor_parameters.length > 0) {
      setParameterValues(factorData.factor_parameters.map(parameter => {
        return { label: parameter.name, value: parameter.score , uuid:parameter.uuid};
      }))
    }
  }
  const resetFactorData = () => {
    updateParams('factor_name', "");
    updateParams('coefficient', "");
    setParameterValues([{ label: "", value: "", uuid:"" }])
  }

  useEffect(() => {
    if (factorUUID && factorUUID !== undefined) {
      setFactorData();
    }else{
      resetFactorData();

    }
  }, [factorUUID, factorData]);

  useEffect(() => {
    let ajaxEvent = true;
    if (ajaxEvent) {
      getratingModalDetail();
    }
    if (factorUUID && factorUUID !== undefined) {
      setFactorData();
    }else{
      resetFactorData();

    }

    return () => {
      ajaxEvent = false;
    };
  }, []);

  return (
    <>
      <ArgonTypography variant="h5" paddingLeft="10px" marginBottom="1rem">
        Factor Configurator
      </ArgonTypography>
      <ArgonBox component="form" role="form" marginBottom="2rem" onSubmit={factorUUID && factorUUID !== undefined ? onEditFormSubmit : onFormSubmit}>
        <Grid
          container
          paddingLeft="10px"
          paddingRight="1rem"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Grid item xs={4}>
            <b>Factor Name :</b>
          </Grid>
          <Grid item xs={8}>
            <ArgonInput
              name="factor_name"
              onChange={(ev) => updateParams("factor_name", ev.target.value)}
              placeholder="Type here..."
              multiline
              value={params['factor_name']}
              rows={2}
              required={true}
            />
          </Grid>
        </Grid>
        <Grid
          container
          paddingLeft="10px"
          paddingRight="1rem"
          marginTop="0.5rem"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Grid item xs={4}>
            <b>Coefficient :</b>
          </Grid>
          <Grid item xs={8}>
            <ArgonInput
              name="coefficient"
              type="number"
              onChange={(ev) => updateParams("coefficient", ev.target.value)}
              placeholder="Enter Coefficient"
              value={params['coefficient']}
              required={true}
            />
          </Grid>
        </Grid>
        <Grid
          spacing={2}
          marginTop="1rem"
        >
          <ArgonTypography variant="p" paddingLeft="10px" >
            <b>Parameters</b>
          </ArgonTypography>
          <ArgonBox sx={{paddingTop: "10px" }}>
            {parameterValues.map((element, index) => (
              <>
                <Grid item container xs={12} spacing={3} px={1} mb={1} key={index + 1}>
                  <Grid item xs={3} sm={6}
                    sx={{ paddingTop: "20px" }}>
                    {!index && (
                      <ArgonTypography
                        component="label"
                        variant="caption"
                        fontWeight="bold"
                        textTransform="capitalize"
                        sx={{ marginTop: "20px" }}
                      >
                        Display Text
                      </ArgonTypography>
                    )}
                    <ArgonInput
                      name="label"
                      placeholder="Enter Display Text"
                      onChange={(e) => handleParameter(index, e.target.value, e.target.name)}
                      value={element.label}
                      required={true}

                    />
                  </Grid>
                  <Grid item xs={3} sm={5}>
                    {!index && (
                      <ArgonTypography
                        component="label"
                        variant="caption"
                        fontWeight="bold"
                        textTransform="capitalize"
                        sx={{ marginBottom: "20px" }}
                      >
                        Value
                      </ArgonTypography>
                    )}
                    <ArgonInput
                      name="value"
                      type="number"
                      placeholder="Enter Value"
                      onChange={(e) => handleParameter(index, e.target.value, e.target.name)}
                      value={element.value}
                      required={true}
                    />
                  </Grid>

                  {index ? (
                    <Grid item xs={3} sm={1}>
                      <Button
                        sx={{ paddingTop: "10px", color: "#c20e3c" }}
                        size="large"
                        color="error"
                        onClick={() => removeFormFields(index, element)}
                      >
                        <Delete title="Remove" />
                      </Button>
                    </Grid>
                  ) : null}
                </Grid>
              </>
            ))}
            <Grid item xs={12} sx={{ clear: "both", marginBottom: "30px" }}>
              <Button
                sx={{
                  color: "#11cdef",
                  border: "1px solid #11cdef",
                  float: "right",
                  "&:hover": {
                    color: "#000000",
                  },
                }}
                mt={3}
                onClick={() => addFormFields()}
              >
                Add Parameter <Add />
              </Button>
            </Grid>
            <Grid item xs={12} sx={{ clear: "both", paddingTop: "50px" }}>
              <ArgonButton sx={{ float: "right" }} type="submit" color="success">
                Submit
              </ArgonButton>
            </Grid>
          </ArgonBox>
        </Grid>
      </ArgonBox>
    </>
  );
}

AddQuestion.propTypes = {
  risk: PropTypes.any.isRequired,
  setResponse: PropTypes.any.isRequired,
  setSnackbarOpen: PropTypes.any.isRequired,
  setMsg: PropTypes.any.isRequired,
  onChangeModel: PropTypes.any.isRequired,
  setBackdropOpen: PropTypes.any.isRequired,
  setShowFactor: PropTypes.any.isRequired,
  modelUuid: PropTypes.string.isRequired,
  selectedModal: PropTypes.any.isRequired,
  factorData: PropTypes.any,
  factorUUID: PropTypes.any,
};

export default AddQuestion;
