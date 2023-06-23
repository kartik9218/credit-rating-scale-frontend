import React, { useState } from "react";
import propTypes from "prop-types";
import Modal from "@mui/material/Modal";
import NativeSelect from '@mui/material/NativeSelect';
import FormControl from '@mui/material/FormControl';
import Grid from "@mui/material/Grid";
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { APIFY, HTTP_CLIENT } from "helpers/Api";
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

function AddMandateModal({ open, handleOpen }) {
  const [data, setData] = useState(
    {
      mandate_id: "",
      category: "",
      sub_category: "",
      instrument: "",
      size: "",
      rating: "",
      mandate_status: "",
    }
  );

  const onFormSubmit = async (ev) => {
    ev.preventDefault();
    HTTP_CLIENT(APIFY('/'), data
    ).then(response => {
      handleOpen();
    });
  };
  const handleChange = (e) => {
    e.preventDefault;
    const { name, value } = e.target;
    let mandateDetails = data;
    mandateDetails[name] = value;
    setData(mandateDetails);
  }
  return (
    <Modal
      open={open}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <ArgonBox sx={style}>
        <ArgonBox sx={{ display: "flex", flexDirction: "row", justifyContent: "space-between" }}>
          <ArgonTypography variant="h5" padding="1rem">
            Add Mandate Details
          </ArgonTypography>
          <CancelRoundedIcon color="primary" size="medium" onClick={handleOpen} />

        </ArgonBox>
        <ArgonBox component="form" role="form" onSubmit={onFormSubmit}>
          <Grid container spacing={3} paddingLeft="1rem" paddingRight="1rem">
            <Grid item xs={3} sm={6} md={6}>
              <FormField name="mandate_id" type="text" label="Mandate ID" placeholder="Enter Mandate ID" onChange={(e) => handleChange(e)} />
            </Grid>
            <Grid item xs={3} sm={6} md={6}>
              <ArgonBox sx={{ m: 1, minWidth: 120 }} >
                <FormControl fullWidth>
                  <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
                    <ArgonTypography
                      component="label"
                      variant="caption"
                      fontWeight="bold"
                      textTransform="capitalize"
                    >
                      Category
                    </ArgonTypography>
                  </ArgonBox>
                  <NativeSelect
                    defaultValue="select_category"
                    inputProps={{
                      name: "category",
                      id: 'uncontrolled-native',
                    }}
                    label="Category"
                    onChange={handleChange}
                  >
                    <option value="select_category">Select Category</option>
                    <option value="short_term_instrument">Short Term Instrument</option>
                    <option value="long_term_instrument">Long Term Instrument</option>
                  </NativeSelect>
                </FormControl>
              </ArgonBox>
            </Grid>
            <Grid item xs={3} sm={6} md={6}>
              <ArgonBox sx={{ m: 1, minWidth: 120 }} >
                <FormControl fullWidth>
                  <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
                    <ArgonTypography
                      component="label"
                      variant="caption"
                      fontWeight="bold"
                      textTransform="capitalize"
                    >
                      Sub-Category
                    </ArgonTypography>
                  </ArgonBox>
                  <NativeSelect
                    defaultValue="select_subcategory"
                    inputProps={{
                      name: "sub_category",
                      id: 'uncontrolled-native',
                    }}
                    label="Sub-Category"
                    onChange={handleChange}
                  >
                    <option value="select_subcategory">Select Sub-Category</option>
                    <option value="debenture">Debenture</option>
                    <option value="non-debenture">Non-Debenture</option>
                  </NativeSelect>
                </FormControl>
              </ArgonBox>
            </Grid>
            <Grid item xs={3} sm={6} md={6}>
              <ArgonBox sx={{ m: 1, minWidth: 120 }} >
                <FormControl fullWidth>
                  <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
                    <ArgonTypography
                      component="label"
                      variant="caption"
                      fontWeight="bold"
                      textTransform="capitalize"
                    >
                      Instrument
                    </ArgonTypography>
                  </ArgonBox>
                  <NativeSelect
                    defaultValue="select_instrument"
                    inputProps={{
                      name: "instrument",
                      id: 'uncontrolled-native',
                    }}
                    label="Instrument"
                    onChange={handleChange}
                  >
                    <option value="select_instrument">Select Instrument</option>
                    <option value="convertable_debenture">Convertable Debenture</option>
                    <option value="non_convertable_debenture">Non-Convertable Debenture</option>
                  </NativeSelect>
                </FormControl>
              </ArgonBox>
            </Grid>
            <Grid item xs={3} sm={6} md={6}>
              <FormField name="size" type="text" label="Size (In Cr)" placeholder="Enter Size" onChange={(e) => handleChange(e)} />
            </Grid>
            <Grid item xs={3} sm={6} md={6}>
              <ArgonBox sx={{ m: 1, minWidth: 120 }} >
                <FormControl fullWidth>
                  <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
                    <ArgonTypography
                      component="label"
                      variant="caption"
                      fontWeight="bold"
                      textTransform="capitalize"
                    >
                      Rating
                    </ArgonTypography>
                  </ArgonBox>
                  <NativeSelect
                    defaultValue="select_rating"
                    inputProps={{
                      name: "rating",
                      id: 'uncontrolled-native',
                    }}
                    label="Rating"
                    onChange={handleChange}
                  >
                    <option value="select_rating">Select Rating</option>
                    <option value="aaa">AAA</option>
                    <option value="bbb">BBB</option>
                  </NativeSelect>
                </FormControl>
              </ArgonBox>
            </Grid>
            <Grid item xs={6} sm={6} md={6}>
              <ArgonBox sx={{ m: 1, minWidth: 120 }} >
                <FormControl fullWidth>
                  <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
                    <ArgonTypography
                      component="label"
                      variant="caption"
                      fontWeight="bold"
                      textTransform="capitalize"
                    >
                      Mandate Status
                    </ArgonTypography>
                  </ArgonBox>
                  <NativeSelect
                    defaultValue="select_mandate_status"
                    inputProps={{
                      name: "mandate_status",
                      id: 'uncontrolled-native',
                    }}
                    label="Mandate Status"
                    onChange={handleChange}
                  >
                    <option value="select_mandate_status">Select Mandate Status</option>
                    <option value="completed">Completed</option>
                    <option value="in_progress">In Progress</option>
                  </NativeSelect>
                </FormControl>
              </ArgonBox>
            </Grid>
          </Grid>
          <ArgonBox spacing={3} padding="1rem" >
            <ArgonButton type="submit" variant="contained" color="info" >
              Submit
            </ArgonButton>
          </ArgonBox>
        </ArgonBox>
      </ArgonBox>
    </Modal >
  );
}

AddMandateModal.propTypes = {
  open: propTypes.isRequired,
  handleOpen: propTypes.isRequired
};

export default AddMandateModal;
