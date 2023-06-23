import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRightAlt } from "@mui/icons-material";
import { Box, Button, Grid, Input, MenuItem, Select, Typography } from "@mui/material";
import colors from "assets/theme/base/colors";
import { APIFY, HTTP_CLIENT } from "helpers/Api";
import { SET_PAGE_TITLE, GET_ROUTE_NAME } from "helpers/Base";
import { DashboardLayout } from "layouts";
import ArgonSelect from "components/ArgonSelect";
import CardWrapper from "slots/Cards/CardWrapper";
import { ArgonSnackbar } from "components/ArgonTheme";

function InitiateRatingModel() {
  
  const navigate = useNavigate();
  const [optionList, setOptionList] = useState([]);
  const [Companies, setCompanies] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [content, setContent] = useState(undefined);
  const [selectedModel, setSelectedModel] = useState(undefined);
  const [turnover, setTurnOver] = useState(0);
  const [SelectedCompany, setSelectedCompany] = useState(undefined);
  const fetchData = () => {
    HTTP_CLIENT(APIFY("/v1/companies"), {}).then((data) => {
      let result = data.companies.map((company) => {
        return {
          label: company.name,
          value: company.uuid,
          industry: company.company_industry,
          subIndustry: company.company_sub_industry,
        };
      });
      setCompanies(result);
    });
  };
  const hendleCompanyChange = (e) => {
    setSelectedCompany(e.target.value);
  };

  const hendleTurnOverChange = (e) => {
    if (e.target.value >= 0) {
      setTurnOver(parseInt(e.target.value));
    }
    return true;
  };

  const handleModelChange = (e) => {
    setSelectedModel(e);
  };
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    HTTP_CLIENT(APIFY("/v1/company_rating_model/create"), {
      params: {
        company_uuid: SelectedCompany.value,
        model_type_uuid: selectedModel?.value,
        turnover: turnover,
        status: "Initiated",
      },
    })
      .then((response) => {
        if (response["success"]) {
          navigate(GET_ROUTE_NAME("RATING_MODEL_INPUT", { uuid: SelectedCompany.value, modelUuid: selectedModel.value }));
          return;
        }
      })
      .catch((err) => {
        setContent("Please fill all required field!");
        setSnackbarOpen(true);
      });
  };

  const fetchRatingModelData = () => {
    HTTP_CLIENT(APIFY("/v1/rating_models"), { is_active: true }).then((data) => {
      let result = data.rating_models.map((rating_model) => {
        return {
          label: rating_model.name,
          value: rating_model.uuid,
        };
      });
      setOptionList(result);
    });
  };

  const onCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    SET_PAGE_TITLE("Initiate Rating Model");
    let ajaxEvent = true;
    if (ajaxEvent) {
      fetchData();
      fetchRatingModelData();
    }
    return () => {
      ajaxEvent = false;
    };
  }, []);

  return (
    <DashboardLayout>
      <form onSubmit={handleSubmit}>
        <CardWrapper
          headerTitle={"Initiate Rating Model"}
          footerActionButton={() => {
            return (
              <Box spacing={3}>
                <Button
                  type="submit"
                  sx={{
                    backgroundColor: colors.primary.main,
                    color: "white !important",
                    "&:hover": {
                      backgroundColor: "#4159de",
                    },
                    float: "right",
                    marginBottom: "15px",
                  }}
                >
                  Next <ArrowRightAlt />
                </Button>
              </Box>
            );
          }}
        >
          <Grid container spacing={2} px={2}>
            <Grid container item xs={4}>
              <Grid item xs={6} lg={4} sx={{ display: "flex", alignItems: "center" }}>
                <Typography component="label" variant="caption" sx={{ fontSize: "14px" }}>
                  Select Company :
                </Typography>
              </Grid>
              <Grid item xs={6} lg={8} sx={{ display: "flex", alignItems: "center" }}>
                <Select labelId="demo-simple-select-label" placeholder="Select Model" className="mui-select" id="demo-simple-select" sx={{ width: "100%" }} name="company" label="Company" onChange={hendleCompanyChange} required>
                  {Companies.map((Company, key) => {
                    return (
                      <MenuItem key={key} sx={{ width: "100%" }} value={Company}>
                        {Company.label}
                      </MenuItem>
                    );
                  })}
                </Select>
              </Grid>
            </Grid>
            <Grid item xs={4} sx={{ display: "flex", alignItems: "center" }}>
              {SelectedCompany && (
                <Grid container xs={12} spacing={2}>
                  <Grid item xs={3}>
                    <Typography component="label" variant="caption" sx={{ fontSize: "14px" }}>
                      Industry :
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography component="label" variant="caption" sx={{ fontSize: "14px", fontWeight: "bold" }}>
                      {SelectedCompany?.industry?.name}
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </Grid>
            <Grid item xs={4} sx={{ display: "flex", alignItems: "center" }}>
              {SelectedCompany && (
                <Grid container xs={12} spacing={2} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Grid item xs={3}>
                    <Typography component="label" variant="caption" sx={{ fontSize: "14px" }}>
                      Sub Industry :
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography component="label" variant="caption" sx={{ fontSize: "14px", fontWeight: "bold" }}>
                      {SelectedCompany?.subIndustry?.name}
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </Grid>
            <Grid item xs={4}>
              <Grid container xs={12} spacing={2} margin={0}>
                <Grid item xs={4} sx={{ display: "flex", alignItem: "center", paddingLeft: "0 !important", paddingRight: "0" }}>
                  <Typography component="label" variant="caption" sx={{ fontSize: "14px", marginTop: "15px" }}>
                    Turnover (in Cr.) :
                  </Typography>
                </Grid>
                <Grid item xs={8} sx={{ paddingLeft: "0 !important", paddingRight: "0", display: "block" }} mx={0}>
                  <Input type="number" variant="outlined" placeholder="Turnover" value={turnover} onChange={hendleTurnOverChange} sx={{ width: "100% !important", display: "block" }} />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container xs={12} spacing={2} margin={0}>
                <Grid item xs={4} sx={{ display: "flex", alignItem: "center", paddingLeft: "0 !important" }}>
                  <Typography component="label" variant="caption" sx={{ fontSize: "14px", marginTop: "15px" }}>
                    Select Model :
                  </Typography>
                </Grid>
                <Grid item xs={8} pr={0}>
                  <ArgonSelect value={selectedModel} placeholder="Select Model" onChange={handleModelChange} options={optionList} required={true} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <ArgonSnackbar
            color={"error"}
            icon={"error"}
            title={"Error"}
            content={content}
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
      </form>
    </DashboardLayout>
  );
}

export default InitiateRatingModel;
