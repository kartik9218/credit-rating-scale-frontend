import React from "react";
import { CancelOutlined, HistoryOutlined, SearchOutlined } from "@mui/icons-material";
import { Grid } from "@mui/material";
import { Box } from "@mui/system";
import { ArgonTypography } from "components/ArgonTheme";
import { ArgonBox } from "components/ArgonTheme";
import FormField from "slots/FormField";
import PropTypes from "prop-types";

const SmartCard = ({onCloseModal = () => {}}) => {
  return (
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 700,
        height: 500,
        border: "none !important",
        outline: "none !important",
        bgcolor: "background.paper",
        borderRadius: "10px",
        boxShadow: 24,
        p: 1,
      }}
    >
      <ArgonBox padding={2}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <ArgonBox
              sx={{
                border: "1px solid lightgray",
                padding: "10px",
                borderRadius: "10px",
                fontSize: "25px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around",
                flexGrow: "0 !important",
            }}
            >
              <SearchOutlined />
              <FormField
                placeholder="Search..."
                sx={{
                    border: "none !important",
                    outline: "none !important",
                }}
              />
              <ArgonTypography
                borderRadius="6px"
                fontSize="12px"
                backgroundColor="lightgray"
                px="4px"
                borderColor="lightgray"
                sx={{
                  cursor: "pointer",
                }}
                onClick={onCloseModal}
              >
                esc
              </ArgonTypography>
            </ArgonBox>
          </Grid>

          <Grid item xs={12}>
            <ArgonTypography fontSize="15px">Recent</ArgonTypography>

            <ArgonBox
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              borderRadius="10px"
              border="1px solid blue"
              padding="10px"
              sx={{color:"blue !important",
              backgroundColor:"rgb(0,0,255, 0.1)", 
              }}
            >
              <ArgonBox display="flex" alignItems="center" gap="20px"
               sx={{color:"blue !important"}}
              >
                <HistoryOutlined />
                <ArgonTypography
                sx={{color:"blue !important"}}
                >Adani Interperise</ArgonTypography>
              </ArgonBox>
              <CancelOutlined />
            </ArgonBox>
          </Grid>
        </Grid>
      </ArgonBox>
    </Box>
  );
};

export default SmartCard;

SmartCard.propTypes = {
    onCloseModal: PropTypes.func.isRequired,
}