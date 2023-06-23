import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { Backdrop, CircularProgress, Grid } from "@mui/material";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { SET_PAGE_TITLE } from "helpers/Base";
import { DashboardLayout } from "layouts";
import { ArgonBox } from "components/ArgonTheme";
import { ArgonTypography } from "components/ArgonTheme";
import Overview from "./Tabs/Overview/Overview";
import Mandate from "./Tabs/Mandate/Mandate";
import { HTTP_CLIENT, APIFY } from "helpers/Api";
import { GET_QUERY } from "helpers/Base";
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
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

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

function CompanyProfile() {
  const navigate = useNavigate();
  const uuid = GET_QUERY("uuid");
  const [company, setCompany] = useState(undefined);
  const [backdropOpen, setBackdropOpen] = useState(false);

  useEffect(() => {
    SET_PAGE_TITLE("Company Profile");
    let ajaxEvent = true;
    if (ajaxEvent) {
      fetchData();
    }
    return () => {
      ajaxEvent = false;
      setBackdropOpen(false);
    };
  }, []);

  const fetchData = () => {
    setBackdropOpen(true);
    HTTP_CLIENT(APIFY("/v1/companies/overview"), { uuid: uuid }).then((data) => {
      setCompany(data["company"]);
      setBackdropOpen(false);
    });
  };

  const [value, setValue] = React.useState(0);
  
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <DashboardLayout breadcrumbTitle="Company Profile">
      <ArgonBox py={3}>
        {company && (
          <ArgonBox bgColor="white" borderRadius="lg" shadow="lg" opacity={1} p={2}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <ArgonBox display="flex" flexDirection="row">
                  <ArgonBox paddingLeft="10px">
                    <ArgonTypography fontWeight="bold" fontSize={28}>
                      {company["name"]}
                    </ArgonTypography>
                    <ArgonTypography fontWeight="regular" fontSize={16}>
                      {company["industry"]}
                    </ArgonTypography>
                  </ArgonBox>
                </ArgonBox>
                <Box
                  sx={{ width: "100%", overflowY: "scroll", height: "calc(100vh - 32vh)" }}
                  marginTop="20px"
                >
                  <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                      <Tab className="tabs" label="Overview" {...a11yProps(0)} />
                      <Tab className="tabs" label="Mandate" {...a11yProps(1)} />
                      <Tab className="tabs" label="Document" {...a11yProps(2)} />
                    </Tabs>
                  </Box>
                  <TabPanel value={value} index={0}>
                    <Overview company={company} />
                  </TabPanel>
                  <TabPanel value={value} index={1}>
                    <Mandate />
                  </TabPanel>
                  <TabPanel value={value} index={2}>
                    <ArgonBox
                      minHeight="60vh"
                      sx={{
                        display: "grid",
                        placeItems: "center",
                        backgroundSize: "cover",
                        backgroundColor: "#f3f3f3",
                        backgroundPosition: "50%",
                      }}
                    >
                      <Grid container justifyContent="center">
                        <Grid item xs={12} md={7} lg={6} sx={{ textAlign: "center", mx: "auto" }}>
                          <img src="/assets/images/error-404.png" style={{ width: "250px" }} />
                          <ArgonBox
                            color="info"
                            fontWeight="bold"
                            lineHeight={1.2}
                            mb={2}
                            textTransform="uppercase"
                            letterSpacing={3}
                          >
                            Module Under Development
                          </ArgonBox>

                          <ArgonTypography variant="h2" color="dark" fontWeight="bold">
                            Ssh! In development.
                          </ArgonTypography>

                          <ArgonTypography variant="body1">
                            We are developing following module.
                          </ArgonTypography>
                        </Grid>
                      </Grid>
                    </ArgonBox>
                  </TabPanel>
                </Box>
              </Grid>
            </Grid>
          </ArgonBox>
        )}

          <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={backdropOpen}>
            <CircularProgress color="inherit" />
          </Backdrop>
      </ArgonBox>
    </DashboardLayout>
  );
}

export default CompanyProfile;
