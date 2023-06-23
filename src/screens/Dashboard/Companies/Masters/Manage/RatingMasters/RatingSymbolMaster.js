import { FormControlLabel, Grid, Switch } from "@mui/material";
import ArgonSelect from "components/ArgonSelect";
import { ArgonTypography } from "components/ArgonTheme";
import ErrorTemplate from "slots/Custom/ErrorTemplate";
import FormField from "slots/FormField";
import PropTypes from "prop-types";

const RatingSymbolMaster = (props) => {
    const { formik, optionsState } = props;
    const {
      errors, touched, setFieldValue, handleChange, values: formikValue 
    } = formik;
    
    const isFieldValid = (fieldName) => {
        return !!(touched[fieldName] && errors[fieldName]);
    };
    
    return (
      <>
        <Grid item xs={3} sm={6} md={12} position="relative">
        <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
            Rating Symbol *
          </ArgonTypography>
          <FormField 
           name="ratingSymbol" 
           value={formikValue?.ratingSymbol} 
           onChange={handleChange} 
           type="text" 
           placeholder="Rating Symbol" 
           />
          {isFieldValid("ratingSymbol") && <ErrorTemplate message={errors["ratingSymbol"]} />}
        </Grid>
  
        <Grid item xs={3} sm={6} md={12} position="relative">
          <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
            Rating Scale * 
          </ArgonTypography>
          <ArgonSelect 
            name="ratingScale" 
            value={formikValue["ratingScale"]} 
            onChange={(options) => setFieldValue("ratingScale", options)} 
            options={optionsState?.ratingScale?.map(scale => Object.assign({}, {
              label:scale.name, 
              value:scale.uuid
            }))} 
          />
         {isFieldValid("ratingScale") && <ErrorTemplate message={errors["ratingScale"].value} />}
        </Grid>
  
        <Grid item xs={3} sm={6} md={12} position="relative">
          <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
            Description 
          </ArgonTypography>
          <FormField name="description" value={formikValue?.description} onChange={handleChange} type="text" placeholder="Description" />
        </Grid>
  
        <Grid item xs={3} sm={6} md={12} position="relative">
          <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
            Grade *
          </ArgonTypography>
          <FormField name="grade" value={formikValue?.grade} onChange={handleChange} type="text" placeholder="Grade" />
          {isFieldValid("grade") && <ErrorTemplate message={errors["grade"]} />}
        </Grid>
  
        <Grid item xs={3} sm={6} md={12} position="relative">
          <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
            Weightage *
          </ArgonTypography>
          <FormField name="weightage" value={formikValue?.weightage} onChange={handleChange} type="number" placeholder="Weightage" />
          {isFieldValid("weightage") && <ErrorTemplate message={errors["weightage"]} />}
        </Grid>

        <Grid item xs={3} sm={6} md={12} position="relative">
        <FormControlLabel
            sx={{paddingLeft:"10px" }}
            control={
              <Switch name="is_active" onChange={handleChange} checked={formikValue["is_active"]} />
            }
            label="Is Active"
          /> 
        </Grid>
      </>
    );
  };

  export default RatingSymbolMaster;

  RatingSymbolMaster.propTypes = {
    formik: PropTypes.object,
    optionsState: PropTypes.object
   }