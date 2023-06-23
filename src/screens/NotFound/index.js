import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { SET_PAGE_TITLE } from "helpers/Base";
import { Grid } from "@mui/material";
import { ArgonBox, ArgonButton, ArgonTypography } from "components/ArgonTheme";
import { DashboardLayout } from "layouts";
import { GET_USER_PROPS } from "helpers/Base";

function NotFoundContent() {
  return (
    <ArgonBox
      minHeight="100vh"
      sx={{
        display: "grid",
        placeItems: "center",
        backgroundSize: "cover",
        backgroundColor: "#eee",
        backgroundPosition: "50%",
      }}
    >
      <Grid container justifyContent="center">
        <Grid item xs={12} md={7} lg={6} sx={{ textAlign: "center", mx: "auto" }}>
          <img src="/assets/images/error-404.png" style={{width: '250px'}} />
          <ArgonBox
            color="info"
            fontWeight="bold"
            lineHeight={1.2}
            mb={2}
            textTransform="uppercase"
            letterSpacing={3}
          >
            Not Found
          </ArgonBox>

          <ArgonTypography variant="h2" color="dark" fontWeight="bold">
            Ssh! Something stucked.
          </ArgonTypography>

          <ArgonTypography variant="body1">
            We are unable to find requested page / module / resource.
          </ArgonTypography>

          <ArgonButton variant="gradient" color="dark" sx={{ mt: 5 }} component={Link} to="/dashboard">
            Back to Dashboard
          </ArgonButton>

          <ArgonBox mt={5} textAlign="center" color="#999">
            Copyright 2023. Infomerics
          </ArgonBox>
        </Grid>
      </Grid>
    </ArgonBox>
  )
}

function NotFound() {
  const user = GET_USER_PROPS('uuid');
  
  useEffect(() => {
    SET_PAGE_TITLE("Not Found");
  }, []);

  return (
    <React.Fragment>
      { user && <DashboardLayout><NotFoundContent /></DashboardLayout>}
      { !user && <NotFoundContent />}
    </React.Fragment>
  );
}
export default NotFound;
