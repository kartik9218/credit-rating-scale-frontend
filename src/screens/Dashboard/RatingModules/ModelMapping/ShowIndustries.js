import React, { useEffect, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import PropTypes from "prop-types";

let members = ["Aluminium", "Abrasives", "Air Conditioner", "Bicycle", "Breweries", "Cables", "Casting & Forging", "Auto Ancillary", "Cement", "Automobile", "Chemical", "Bearing", "Cigarettes"];
const ShowIndustries = ({ open, setOpen, mappedIndustries }) => {
  const [industries, setIndustries] = useState([]);

  // const handleFilterUsers = (member) => {
  //   let filteredMembersArr = users.filter((mem) => member !== mem);
  //   setUsers(filteredMembersArr);
  // };
  const industryMappingFn = () => {
    let industriesArr = [];
    mappedIndustries.sub_industries.forEach((subIndustry) => {
      industriesArr.push(subIndustry.sub_industry_name);
    });
    setIndustries(industriesArr);
  };
  useEffect(() => {
    industryMappingFn();
  }, []);
  return (
    <>
      <Dialog disableEscapeKeyDown fullWidth maxWidth="lg" open={open} onClose={() => setOpen(false)} sx={{ zIndex: 1600 }}>
        <DialogTitle sx={{ fontSize: "18px" }}>
          Model Name: <span>{mappedIndustries.rating_model_name}</span>
        </DialogTitle>
        <DialogContent>
          <Typography mb="10px" sx={{ fontSize: "18px" }}>
            Mapped Industries:{" "}
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              border: "1px solid",
              borderColor: "gray",
              borderRadius: "1rem",
              p: "0.6rem",
              minHeight: "2rem",
            
            }}
          >
            {industries?.map((industry) => {
              return (
                <React.Fragment key={industry}>
                  <Box
                    sx={{
                      border: "1px solid",
                      borderRadius: "1rem",
                      m: "0.5rem",
                      pr: "0.5rem",
                    }}
                  >
                    <Typography sx={{ mx: "0.8rem", fontSize: "14px" }}>{industry}</Typography>
                  </Box>
                </React.Fragment>
              );
            })}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            sx={{
              backgroundColor: "#3c5cd2",
              color: "#ffffff",
              ml: "2rem",
              display: "flex",
              alignItems: "center",
              "&:hover": {
                backgroundColor: "#3c5cd2",
                color: "#ffffff",
              },
            }}
            onClick={() => setOpen(false)}
          >
            Back
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ShowIndustries;

ShowIndustries.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  mappedIndustries: PropTypes.array,
};
