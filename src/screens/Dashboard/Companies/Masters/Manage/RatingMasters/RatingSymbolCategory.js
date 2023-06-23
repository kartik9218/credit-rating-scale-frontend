import { FormControlLabel, Grid, Switch } from "@mui/material";
import { ArgonTypography } from "components/ArgonTheme";
import ErrorTemplate from "slots/Custom/ErrorTemplate";
import FormField from "slots/FormField";
import PropTypes from "prop-types";

const RatingSymbolCategory = (props) => {
    const { formik } = props;

    const {
     errors, touched, handleChange, values: formikValue 
   } = formik;
      
  const isFieldValid = (fieldName) => {
    return !!(touched[fieldName] && errors[fieldName]);
};
  
    return (
      <>
      <Grid item xs={3} sm={6} md={12} position="relative">
        <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
          Symbol Type Category *
        </ArgonTypography>
        <FormField name="symbolTypeCategory" value={formikValue?.symbolTypeCategory} onChange={handleChange} type="text" placeholder="Symbol Type Category" />
        {isFieldValid("symbolTypeCategory") && <ErrorTemplate message={errors["symbolTypeCategory"]} />}
      </Grid>
      <Grid item xs={3} sm={6} md={12} position="relative">
        <FormControlLabel
            sx={{ paddingLeft: "20px", paddingTop: "35px" }}
            control={
              <Switch name="is_active" onChange={handleChange} checked={formikValue["is_active"]} />
            }
            label="Is Active"
          /> 
        </Grid>
      </>
    )
}

export default RatingSymbolCategory;

RatingSymbolCategory.propTypes = {
    formik: PropTypes.object,
}