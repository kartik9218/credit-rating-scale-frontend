import React from "react";
import PropTypes from "prop-types";
import { Box, Grid } from "@mui/material";
import CardHeader from "./CardHeader";
import { ArgonBox } from "components/ArgonTheme";

const CardWrapper = ({
  headerTitle = "",
  headerSubtitle = "",
  headerBtn = false,
  headerActionButton: ActionButton = false,
  children,
  footerActionButton: SubmitButton = false

}) => {
  return (
    <ArgonBox
      bgColor="white"
      sx={{
        height: "calc(100vh - 16vh)",
        marginTop: "10px",
        borderRadius: "20px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Grid container spacing={3}>
        <Grid
          item
          xs={12}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px",
            background: "rgb(93 113 226 / 29%)",
            background: "linear-gradient(180deg, rgb(93 113 226 / 12%) 0%, rgba(0,212,255,0) 100%)",
          }}
        >
          <CardHeader subtitle={headerSubtitle} title={headerTitle} HeaderBtn={headerBtn} />
          <ArgonBox sx={{ width: "35%", display: "flex", justifyContent: "flex-end" }}>{ActionButton && <ActionButton />}</ArgonBox>
        </Grid>
        <Grid item xs={12}>
          <Box marginTop={"-20px"}>{children}</Box>
        </Grid>

        {SubmitButton && (
          <ArgonBox
            sx={{
              position: "absolute",
              width: "100%",
              bottom: "0",
            }}
          >
            <SubmitButton />
          </ArgonBox>
        )}
      </Grid>
    </ArgonBox>
  );
};

CardWrapper.propTypes = {
  headerTitle: PropTypes.string,
  headerSubtitle: PropTypes.string,
  headerBtn: PropTypes.func || PropTypes.bool,
  headerActionButton: PropTypes.func || PropTypes.bool,
  children: PropTypes.object.isRequired,
  footerActionButton: PropTypes.func || PropTypes.bool,

};

export default CardWrapper;
