import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SET_PAGE_TITLE, GET_DATA, GET_ROUTE_NAME } from "helpers/Base";
import { Grid } from "@mui/material";
import { ArgonBox, ArgonTypography } from "components/ArgonTheme";

function NotPermitComponent() {
  return (
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
            Unable to process
          </ArgonBox>

          <ArgonTypography variant="h2" color="dark" fontWeight="bold">
            No permission assigned.
          </ArgonTypography>

          <ArgonTypography variant="body1">
            Ask ADMIN to provide you access rights/permissions to access this app.
          </ArgonTypography>
        </Grid>
      </Grid>
  )
}

function DashboardRedirect() {
  const navigate = useNavigate();
  const [isPermit, setIsPermit] = useState(true);
  
  useEffect(() => {
    SET_PAGE_TITLE("Please wait...");

    try {
      const user = GET_DATA('user');
      const active_role = GET_DATA('active_role');

      if (active_role['menu'].length === 0) {
        setIsPermit(false);
        return;
      }

      if (user['is_super_account']) {
        navigate(GET_ROUTE_NAME('DEFAULT_SUPER_ADMIN_VIEW'));
        return;
      } else {
        navigate(active_role['menu'][0]['path']);
        return;
      }

    } catch (error) {
      navigate(GET_ROUTE_NAME('DASHBOARD'));
    }

  }, []);

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
      {
        isPermit && 
        <Grid container justifyContent="center">
          <Grid item xs={12} md={7} lg={6} sx={{ textAlign: "center", mx: "auto" }}>
            <ArgonTypography variant="h2" color="dark" fontWeight="bold">
              Welcome.
            </ArgonTypography>

            <ArgonTypography variant="body1">
              We are loading your profile &amp; companies...
            </ArgonTypography>
          </Grid>
        </Grid>
      }

      {
        !isPermit && 
        <NotPermitComponent />
      }
    </ArgonBox>
  );
}
export default DashboardRedirect;
