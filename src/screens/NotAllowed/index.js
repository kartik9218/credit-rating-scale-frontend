import { useEffect } from "react";
import { Link } from "react-router-dom";
import { SET_PAGE_TITLE } from "helpers/Base";
import { Grid } from "@mui/material";
import { ArgonBox, ArgonButton, ArgonTypography } from "components/ArgonTheme";
import CardWrapper from "slots/Cards/CardWrapper";

function NotAllowed() {
  useEffect(() => {
    SET_PAGE_TITLE("Module Access Not Allowed");
  }, []);

  return (
    <CardWrapper>
    <ArgonBox
      sx={{
        display: "grid",
        placeItems: "center",
        backgroundSize: "cover",
        backgroundColor: "#fff",
        backgroundPosition: "50%",
        fontSize:"10px"
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
            Restricted Access
          </ArgonBox>

          <ArgonTypography fontWeight="bold">
           Sorry, you are not allowed to access this page.
          </ArgonTypography>

          <ArgonButton variant="gradient" color="dark" sx={{ mt: 5 }} component={Link} to="/dashboard">
            Back to Dashboard
          </ArgonButton>
        </Grid>
      </Grid>
    </ArgonBox>
    </CardWrapper>
  );
}
export default NotAllowed;
