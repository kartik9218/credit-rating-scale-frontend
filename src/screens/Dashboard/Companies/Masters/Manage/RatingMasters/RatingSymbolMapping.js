import React from "react";
import { FormControlLabel, Grid, Switch } from "@mui/material";
import { ArgonTypography } from "components/ArgonTheme";
import ErrorTemplate from "slots/Custom/ErrorTemplate";
import FormField from "slots/FormField";
import PropTypes from "prop-types";
import ArgonSelect from "components/ArgonSelect";

const RatingSymbolMapping = (props) => {
  const { formik, optionsState } = props;
  const { errors, touched, setFieldValue, handleChange, values: formikValue } = formik;

  const isFieldValid = (fieldName) => {
    return !!(touched[fieldName] && errors[fieldName]);
  };

  return (
    <>
      <Grid item xs={3} sm={6} md={12} position="relative">
        <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
          Rating Symbol Master*
        </ArgonTypography>
        <ArgonSelect name="ratingSymbolMaster" value={formikValue?.ratingSymbolMaster} options={optionsState.ratingSymbolMaster} onChange={(value) => setFieldValue("ratingSymbolMaster", value)} type="text" placeholder="Rating Symbol Master" />
        {isFieldValid("ratingSymbolMaster") && <ErrorTemplate message={errors["ratingSymbolMaster"].value} />}
      </Grid>

      <Grid item xs={3} sm={6} md={12} position="relative">
        <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
          Rating Symbol Category*
        </ArgonTypography>
        <ArgonSelect name="ratingSymbolCategory" value={formikValue?.ratingSymbolCategory} options={optionsState.ratingSymbolCategory} onChange={(value) => setFieldValue("ratingSymbolCategory", value)} type="text" placeholder="Rating Symbol" />
        {isFieldValid("ratingSymbolCategory") && <ErrorTemplate message={errors["ratingSymbolCategory"].value} />}
      </Grid>

      <Grid item xs={3} sm={6} md={12} position="relative">
        <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
          Prefix
        </ArgonTypography>
        <FormField name="prefix" value={formikValue?.prefix} onChange={handleChange} type="text" placeholder="Prefix" />
      </Grid>

      <Grid item xs={3} sm={6} md={12} position="relative">
        <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
          Suffix
        </ArgonTypography>
        <FormField name="suffix" value={formikValue?.suffix} onChange={handleChange} type="text" placeholder="Suffix" />
      </Grid>

      <Grid item xs={3} sm={6} md={12} position="relative">
        <FormControlLabel sx={{ paddingLeft: "20px", paddingTop: "35px" }} control={<Switch name="is_active" onChange={handleChange} checked={formikValue["is_active"]} />} label="Is Active" />
      </Grid>
    </>
  );
};

export default RatingSymbolMapping;

RatingSymbolMapping.propTypes = {
  formik: PropTypes.object,
  optionsState: PropTypes.array,
};
