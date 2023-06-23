import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Grid } from "@mui/material";
import { DashboardLayout } from "layouts";
import { SET_PAGE_TITLE, GET_DATA, GET_ROUTE_NAME } from "helpers/Base";
import { ArgonBox, ArgonTypography } from "components/ArgonTheme";

function DashboardEmpty() {
  const navigate = useNavigate();

  useEffect(() => {
    SET_PAGE_TITLE("Please wait...");

    try {
      const user = GET_DATA("user");
      const defaultCompany = user["companies"][0];
      navigate(GET_ROUTE_NAME("DASHBOARD_FOR_COMPANY", { uuid: defaultCompany["uuid"] }));
    } catch (error) {}
  }, []);

  return (
    <DashboardLayout breadcrumbTitle="Dashboard" showCompany={true}>
      <ArgonBox
        minHeight="80vh"
        mt={3}
        borderRadius="md"
        shadow="lg"
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
            <ArgonBox
              color="info"
              fontWeight="bold"
              lineHeight={1.2}
              mb={2}
              textTransform="uppercase"
              letterSpacing={3}
            >
              Unable to process
            </ArgonBox>

            <ArgonTypography variant="h2" color="dark" fontWeight="bold">
              No Company Assigned.
            </ArgonTypography>

            <ArgonTypography variant="body1">
              Please ask <strong>business developer / group head</strong> to assign you company.
            </ArgonTypography>

            <ArgonBox mt={5} textAlign="center" color="#999">
              Copyright 2023. Infomerics
            </ArgonBox>
          </Grid>
        </Grid>
      </ArgonBox>
    </DashboardLayout>
  );
}
export default DashboardEmpty;
