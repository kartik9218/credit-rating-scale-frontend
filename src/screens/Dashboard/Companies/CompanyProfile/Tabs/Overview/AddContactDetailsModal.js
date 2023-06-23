import React from "react";
import propTypes from "prop-types";
import Modal from "@mui/material/Modal";
import Grid from "@mui/material/Grid";
import ArgonButton from "components/ArgonButton";
import ArgonTypography from "components/ArgonTypography";
import { ArgonBox } from "components/ArgonTheme";
import FormField from "slots/FormField";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "none",
  boxShadow: 24,
  p: 4,
};

function AddContactDetailsModal({ open, handleOpen }) {
  return (
    <Modal
      open={open}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <ArgonBox sx={style}>
        <ArgonTypography variant="h5" padding="1rem">
          Add Contact Details
        </ArgonTypography>
        <form>
          <Grid container spacing={3} paddingLeft="1rem" paddingRight="1rem">
            <Grid item xs={3} sm={6} md={6}>
              <FormField type="text" label="Contact Name" placeholder="Enter Contact Name" />
            </Grid>
            <Grid item xs={3} sm={6} md={6}>
              <FormField type="text" label="Email" placeholder="Enter Email " />
            </Grid>
            <Grid item xs={3} sm={6} md={6}>
              <FormField type="text" label="Phone Number" placeholder="Enter Phone Number " />
            </Grid>
            <Grid item xs={3} sm={6} md={6}>
              <FormField type="text" label="Department" placeholder="Enter Department" />
            </Grid>
            <Grid item xs={3} sm={6} md={6}>
              <FormField type="text" label="Designation" placeholder="Enter Designation" />
            </Grid>
          </Grid>
          <ArgonBox spacing={3} padding="1rem" >
            <ArgonButton variant="contained" color="info" onClick={handleOpen}>
              Submit
            </ArgonButton>
          </ArgonBox>
        </form>
      </ArgonBox>
    </Modal>
  );
}

AddContactDetailsModal.propTypes = {
  open: propTypes.isRequired,
  handleOpen: propTypes.isRequired
};

export default AddContactDetailsModal;
