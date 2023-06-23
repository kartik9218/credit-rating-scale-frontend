import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import { Box, Grid, IconButton, Tab, Tabs, Typography } from "@mui/material";
import { styled } from '@mui/material/styles';
import { Info } from "@mui/icons-material";
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { SET_PAGE_TITLE, GET_QUERY } from "helpers/Base";
import DashboardLayout from "layouts/DashboardLayout";
import CardWrapper from "slots/Cards/CardWrapper";
import FactorTemplate from "./FactorTemplate";
import { HTTP_CLIENT, APIFY } from "helpers/Api";
import RatingSheet from "./RatingSheet";
import NotchingTab from "./NotchingTab";
import IndustryTemplate from "./IndustryTemplate";



const CustomWidthTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    minWidth: 350,
    backgroundColor: "#f8f9fa",
    color: "#000",
    borderRadius: 0,
    boxShadow: "2px 4px 12px rgba(0, 0, 0, 0.25)"
  },
});




function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

const RatingModelInput = () => {

  const navigate = useNavigate();
  const uuid = GET_QUERY("uuid");
  const modelUuid = GET_QUERY("model-uuid");

  const [value, setValue] = useState(0);
  const [risks, setRisks] = useState([]);
  const [industry, setIndustry] = useState(undefined);
  const [companyDetail, setCompanyDetail] = useState(undefined);
  const [notchingMaster, setNotchingMaster] = useState(undefined);


  const longText = <>
    <Grid item xs={12} boxShadow={4}>
      <Grid item xs={12} py={1} px={2} sx={{ display: "flex", alignItems: "center" }}>
        <b>Info</b>
      </Grid>
      <Grid container item xs={12} py={1} px={2} sx={{ display: "flex", alignItems: "center" }}>
        <Grid item xs={5} sx={{ display: "flex", alignItems: "center" }}>
          <span>Last Edited on:</span>
        </Grid>
        <Grid item xs={7} sx={{ display: "flex", alignItems: "center" }}>
          <b>14 April 2023 11:30 am </b>
        </Grid>
      </Grid>
      <Grid container item xs={12} py={1} px={2} sx={{ display: "flex", alignItems: "center" }}>
        <Grid item xs={5} sx={{ display: "flex", alignItems: "center" }}>
          <span>Last Edited by:</span>
        </Grid>
        <Grid item xs={7} sx={{ display: "flex", alignItems: "center" }}>
          <b>Manoj Thakur</b>
        </Grid>
      </Grid>
      <Grid container item xs={12} py={1} px={2} sx={{ display: "flex", alignItems: "center" }}>
        <Grid item xs={5} sx={{ display: "flex", alignItems: "center" }}>
          <span>Status:</span>
        </Grid>
        <Grid item xs={7} sx={{ display: "flex", alignItems: "center" }}>
          <b>Incomplete</b>
        </Grid>
      </Grid>
    </Grid>
  </>;

  const handleChange = (newValue) => {
    setValue(newValue);
  };

  const handleTabChange = (e, newValue) => {
    setValue(newValue);
  };

  const fetchData = async () => {
    HTTP_CLIENT(APIFY("/v1/company_rating_model/view"), {
      params: {
        company_uuid: uuid,
        model_type_uuid: modelUuid
      }
    }).then((response) => {
      setCompanyDetail(response.company_rating_model);
    });
  };

  const fetchRIsk = async () => {
    HTTP_CLIENT(APIFY("/v1/rating_models/view_risk_types"), {
      params: {
        rating_model_uuid: modelUuid
      }
    }).then((response) => {
      for (let key in response.risk_types) {
        if (response.risk_types[key].name === "Notching") {
          HTTP_CLIENT(APIFY("/v1/notching_models"), {
            params: {
              is_active: true
            }
          }).then((data) => {
            for (let notchingKey in data.notching_models) {
              let where = {
                params: {
                  notching_model_uuid: data.notching_models[notchingKey].uuid
                },
              };
              HTTP_CLIENT(APIFY("/v1/notching_model/view_factors"), where).then((factorData) => {
                data.notching_models[notchingKey].factors = factorData.factors
              });
            }
            setNotchingMaster(data.notching_models)
          });
        }else if(response.risk_types[key].name === "Industry Risk") {
          HTTP_CLIENT(APIFY("/v1/industry_score/view"), {
            params: {
              sub_industry_uuid: companyDetail?.company?.company_sub_industry.uuid,
              is_active: true
            }
          }).then((data) => {
            console.log(data);
            setIndustry(data.industry_score)
          });

        }else{
          let where = {
            params: {
              rating_model_uuid: modelUuid,
              risk_type_uuid: response.risk_types[key].uuid,
            },
          };
          HTTP_CLIENT(APIFY("/v1/rating_models/view_factors"), where).then((factorData) => {
            response.risk_types[key].factors = factorData.factors
          });
        }
      }
      setRisks(response.risk_types)
    });
  };

  const updateFactor = (e, riskIndex, factorIndex, notchingIndex = null) => {

    let riskData = [...risks];
    riskData[riskIndex].factors[factorIndex].score = e.target.value
    riskData[riskIndex].factors[factorIndex].product = e.target.value * riskData[riskIndex].factors[factorIndex].coefficient;
    riskData[riskIndex].totalManagementRisk = 0;
    riskData[riskIndex].factors.forEach(factor => {
      riskData[riskIndex].totalManagementRisk = riskData[riskIndex].totalManagementRisk + factor.product;
    })
    setRisks(riskData)
  }
  const updateNotchingFactor = (e, riskIndex, factorIndex, notchingIndex = null) => {
    let notchingMasterData = [...notchingMaster];

    notchingMasterData[notchingIndex].factors[factorIndex].score = e.target.value
    setNotchingMaster(notchingMasterData);
  }

  useEffect(() => {
    fetchRIsk();
  }, [companyDetail])

  useEffect(() => {
  }, [risks, value, notchingMaster])

  useEffect(() => {
    SET_PAGE_TITLE("Rating Model Input");
    let ajaxEvent = true;
    if (ajaxEvent) {
      fetchData();
    }

    return () => {
      ajaxEvent = false;
    };
  }, []);
  return (
    <>
      <DashboardLayout>
        <CardWrapper headerTitle="Rating Model Input"
          headerActionButton={() => {
            return (
              <CustomWidthTooltip title={longText} placement="left-start">
                <IconButton>
                  <Info />
                </IconButton>
              </CustomWidthTooltip>
            );
          }}
        >
          {companyDetail &&
            <Grid container spacing={2} px={2} marginBottom={2}>
              <Grid container item xs={4}>
                <Grid item xs={6} lg={4} sx={{ display: "flex", alignItems: "center", padding: 0 }}>
                  <Typography component="label" variant="caption" sx={{ fontSize: "17px" }}>
                    Company Name :
                  </Typography>
                </Grid>
                <Grid item xs={6} lg={8} sx={{ display: "flex", alignItems: "center" }}>
                  <Typography component="label" variant="caption" sx={{ fontSize: "17px" }}>
                    {companyDetail.company.name}
                  </Typography>
                </Grid>
              </Grid>
              <Grid container item xs={3}>
                <Grid item xs={4} sx={{ display: "flex", alignItems: "center" }}>
                  <Typography component="label" variant="caption" sx={{ fontSize: "17px" }}>
                    Industry :
                  </Typography>
                </Grid>
                <Grid item xs={8} sx={{ display: "flex", alignItems: "center" }}>
                  <Typography component="label" variant="caption" sx={{ fontSize: "17px" }}>
                    {companyDetail.company.company_sub_industry?.name}
                  </Typography>
                </Grid>
              </Grid>
              <Grid container item xs={3}>
                <Grid item xs={4} sx={{ display: "flex", alignItems: "center" }}>
                  <Typography component="label" variant="caption" sx={{ fontSize: "17px" }}>
                    Model :
                  </Typography>
                </Grid>
                <Grid item xs={8} sx={{ display: "flex", alignItems: "center" }}>
                  <Typography component="label" variant="caption" sx={{ fontSize: "17px" }}>
                    {companyDetail.model_type.name}
                  </Typography>
                </Grid>
              </Grid>
              <Grid container item xs={2}>
                <Grid item xs={6} sx={{ display: "flex", alignItems: "center" }}>
                  <Typography component="label" variant="caption" sx={{ fontSize: "17px" }}>
                    Turnover :
                  </Typography>
                </Grid>
                <Grid item xs={6} sx={{ display: "flex", alignItems: "center" }}>
                  <Typography component="label" variant="caption" sx={{ fontSize: "17px" }}>
                    {companyDetail.turnover} Cr.
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          }
          {risks.length > 0 &&
            <Box sx={{ bgcolor: 'background.paper', height: "calc(100vh - 32vh)", overflowY: "scroll" }} px={1}>
              <Tabs
                value={value}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                className="risk-tabs"
              >
                {risks.map((risk, key) => {
                  return <Tab className="risk-tab-inner" key={key + 1} label={risk.name} />
                })}
                <Tab className="risk-tab-inner" label="Rating Sheet" />
              </Tabs>
              {risks.map((risk, key) => {
                if (risk.name === "Notching") {
                  return <TabPanel value={value} key={key + 1} index={key} sx={{ padding: 0 }}>
                    <NotchingTab risk={risk} index={key} updateNotchingFactor={updateNotchingFactor} handleMainTabChange={handleChange} notchingMaster={notchingMaster} />
                  </TabPanel>
                } else if (risk.name === "Industry Risk") {
                  return <TabPanel value={value} key={key + 1} index={key} sx={{ padding: 0 }}>
                    <IndustryTemplate risk={risk} index={key} updateNotchingFactor={updateNotchingFactor} handleChange={handleChange} industry={industry} />
                  </TabPanel>
                } else {
                  return <TabPanel value={value} key={key + 1} index={key} sx={{ padding: 0 }}>
                    <FactorTemplate risk={risk} index={key} handleChange={handleChange} updateFactor={updateFactor} />
                  </TabPanel>
                }
              })}
              <TabPanel value={value} index={risks.length}>
                <RatingSheet handleChange={handleChange} />
              </TabPanel>
            </Box>
          }
        </CardWrapper>
      </DashboardLayout>
    </>
  );
};

export default RatingModelInput;
