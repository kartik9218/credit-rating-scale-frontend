import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import PageLayout from "layouts/PageLayout";
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";

function IllustrationLayout({ color, header, title, description, button, illustration, children }) {
  return (
    <PageLayout background="white">
      <Grid container>
        <Grid item xs={12} lg={12} height="100vh">
          <ArgonBox
            display={{ xs: "flex", lg: "flex" }}
            justifyContent="center"
            alignItems="center"
            height="100%"
            position="relative"
            textAlign="center"
            px={13}
            sx={{ overflow: "hidden" }}
          >
            <ArgonBox
              bgColor={color}
              variant="gradient"
              width="100%"
              height="100%"
              position="absolute"
            />
            <ArgonBox position="relative">
              {illustration.title && (
                <ArgonBox mt={6} mb={1}>
                  <ArgonTypography variant="h4" color="white" fontWeight="bold">
                    {illustration.title}
                  </ArgonTypography>
                </ArgonBox>
              )}
              {illustration.description && (
                <ArgonBox mb={1}>
                  <ArgonTypography variant="body2" color="white">
                    {illustration.description}
                  </ArgonTypography>
                </ArgonBox>
              )}
            </ArgonBox>
            <ArgonBox width={{lg:"40%"}} display="flex" flexDirection="column" justifyContent="center" sx={{marginLeft:"auto",marginTop:"3rem"}} height="100vh">
              <ArgonBox pt={3} px={3} sx={{position:"relative"}} textAlign="left" >
                {!header ? (
                  <>
                    <ArgonBox mb={1}>
                      <ArgonTypography variant="h4" sx={{ color: "#ffffff"}} fontWeight="bold">
                        {title}
                      </ArgonTypography>
                    </ArgonBox>
                    <ArgonTypography variant="body2" sx={{ color: "#ffffff"}} fontWeight="regular">
                      {description}
                    </ArgonTypography>
                  </>
                ) : (
                  header
                )}
              </ArgonBox>
              <ArgonBox p={3}>{children}</ArgonBox>
            </ArgonBox>
          </ArgonBox>
        </Grid>
      </Grid>
    </PageLayout>
  );
}

// Setting default values for the props of IllustrationLayout
IllustrationLayout.defaultProps = {
  color: "info",
  header: "",
  title: "",
  description: "",
  button: { color: "info" },
  illustration: {},
};

// Typechecking props for the IllustrationLayout
IllustrationLayout.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  header: PropTypes.node,
  title: PropTypes.string,
  description: PropTypes.string,
  button: PropTypes.object,
  children: PropTypes.node.isRequired,
  illustration: PropTypes.shape({
    image: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
  }),
};

export default IllustrationLayout;