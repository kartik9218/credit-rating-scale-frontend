// react-router components
import { Link } from "react-router-dom";

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

// MUI components
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonButton from "components/ArgonButton";
import React from "react";

function MessageCard({ image, title, text, action }) {
  return (
    <Card>
      <ArgonBox p={2}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={4}>
            <ArgonBox
              component="img"
              src={image}
              alt="message-image"
              borderRadius="lg"
              shadow="md"
              width="100%"
              display="inherit"
            />
          </Grid>
          <Grid item xs={8}>
            <ArgonBox mb={2} lineHeight={1.4}>
              {title && (
                <ArgonTypography color="text" fontWeight="bold">
                  {title}
                </ArgonTypography>
              )}
              <ArgonTypography variant="button" color="text" fontWeight="medium">
                {text}
              </ArgonTypography>
            </ArgonBox>
            {action && (
              <React.Fragment>
                {action.type === "internal" ? (
                  <ArgonButton
                    component={Link}
                    to={action.route}
                    color={action.color}
                    variant="gradient"
                    size="small"
                  >
                    {action.label}
                  </ArgonButton>
                ) : (
                  <ArgonButton
                    component="a"
                    href={action.route}
                    target="_blank"
                    rel="noreferrer"
                    color={action.color}
                    variant="gradient"
                    size="small"
                  >
                    {action.label}
                  </ArgonButton>
                )}
              </React.Fragment>
            )}
          </Grid>
        </Grid>
      </ArgonBox>
    </Card>
  );
}

// Typechecking props for the MessageCard
MessageCard.propTypes = {
  title: PropTypes.string,
  image: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  action: PropTypes.shape({
    type: PropTypes.oneOf(["external", "internal"]).isRequired,
    route: PropTypes.string.isRequired,
    color: PropTypes.oneOf([
      "default",
      "primary",
      "secondary",
      "info",
      "warning",
      "error",
      "light",
      "dark",
    ]).isRequired,
    label: PropTypes.string.isRequired,
  }),
};

export default MessageCard;
