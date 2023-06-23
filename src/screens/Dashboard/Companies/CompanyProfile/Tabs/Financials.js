import { useEffect } from "react";
import { Grid } from "@mui/material";
import { SET_PAGE_TITLE } from "helpers/Base";
import { ArgonBox } from "components/ArgonTheme";
import { ArgonTypography } from "components/ArgonTheme";

function Financials() {
  useEffect(() => {
    SET_PAGE_TITLE("Financials");
  }, []);

  return (
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
          <img src="/assets/images/error-404.png" style={{ width: '250px' }} />
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
  );
}
export default Financials;
