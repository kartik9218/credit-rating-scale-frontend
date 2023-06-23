import React, { useState, useEffect } from "react";
import { ArrowBackRounded } from "@mui/icons-material";
import { Box, Grid, Typography } from "@mui/material";
import { ArgonTypography } from "components/ArgonTheme";
import { ArgonButton } from "components/ArgonTheme";
import { ArgonBox } from "components/ArgonTheme";
import { DashboardLayout } from "layouts";
import CardWrapper from "slots/Cards/CardWrapper";
import Select from "react-select";
import { useFormik } from "formik";
import { getRatingMasterValidationSchema } from "helpers/validationSchema";
import { ratingMasterShema, ratingCategorySchema } from "helpers/formikSchema";
import { HTTP_CLIENT } from "helpers/Api";
import { APIFY } from "helpers/Api";
import { ArgonSnackbar } from "components/ArgonTheme";
import { useNavigate } from "react-router-dom";
import { GET_ROUTE_NAME, GET_QUERY} from "helpers/Base";
import RatingSymbolCategory from "./RatingSymbolCategory";
import RatingSymbolMaster from "./RatingSymbolMaster";
import RatingSymbolMapping from "./RatingSymbolMapping";

const ratingSymbolOptions = [
  {
    label: "Rating Symbol Master",
    value: "Rating Symbol Master",
  },
  {
    label: "Rating Symbol Category",
    value: "Rating Symbol Category",
  },
  {
    label: "Rating Symbol Mapping",
    value: "Rating Symbol Mapping",
  },
];

const RatingMasterEntity = () => {
  const navigate = useNavigate();
  const uuid = GET_QUERY("uuid");
  const [response, setResponse] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("Please check all required fields");  
  const [selectedRatingType, setSelectedRatingType] = useState({ label: "Select...", value: "" });
  const [optionsState, setOptiondState] = useState({
    ratingScale:[],
    ratingSymbolMaster: [],
    ratingSymbolCategory: []
  });
  const formikMaster = useFormik({
    initialValues: ratingMasterShema,
    validationSchema: getRatingMasterValidationSchema(selectedRatingType.value),
    onSubmit: (values) => handlePerformAjaxRqst(values),
  });
  const formikCategory = useFormik({
      initialValues: ratingCategorySchema,
      validationSchema: getRatingMasterValidationSchema(selectedRatingType.value),
      onSubmit: (values) => handlePerformAjaxRqst(values),
    });
  const formikMapping = useFormik({
    initialValues: {
      prefix:"",
      suffix:"",
      ratingSymbolMaster:{label:"", value:""},
      ratingSymbolCategory: {label:"", value:""},
      is_active:true
    },
    validationSchema: getRatingMasterValidationSchema(selectedRatingType.value),
    onSubmit: (values) => handlePerformAjaxRqst(values)
  });

  const { handleSubmit:onSubmitRatingMaster } = formikMaster;
  const { handleSubmit:onSubmitRatingCategory } = formikCategory;
  const { handleSubmit:onSubmitRatingMapping } = formikMapping;

  useEffect(() => {
    if(!uuid) return;
    handleSetFormikValues(); 
  },[]);

  useEffect(() => {
   getRatingScaleOptions();
   getRatingSymbolMaster();
   getRatingSymbolCategory();
  }, [])
  
 
  const getRatingSymbolMaster = () => {
    HTTP_CLIENT(APIFY("/v1/rating_symbol_master"),{params:{}}).then(response => {
      if(response.success) {
        const { rating_symbol_master } = response;
        handleSetParams("ratingSymbolMaster", 
        rating_symbol_master.map(rating => Object.assign({},{label:rating.rating_symbol, value:rating.uuid}))
        )
      }
    }).catch(err => console.log(err));
  };

  const getRatingSymbolCategory = () => {
    HTTP_CLIENT(APIFY("/v1/rating_symbol_category"),{params:{}}).then(response => {
      if(response.success) {
        const { rating_symbol_category } = response;
        handleSetParams("ratingSymbolCategory",
        rating_symbol_category.map(rating => Object.assign({},{label:rating.symbol_type_category, value:rating.uuid}))
        )
      }

    })
    .catch(err => console.log(err));
  };

  const getRatingScaleOptions = () => {
    HTTP_CLIENT(APIFY("/v1/rating_scale"),{params:{}}).then(
      success => {
        if(success) {
          const { rating_scale } = success; 
          handleSetParams("ratingScale",rating_scale );
        }
      }
    ).catch(err => {
      console.log(err);
    })
  };

  
  const handleSetParams = (fieldName, value) => { 
    setOptiondState((prev) => {
      return {
        ...prev, 
        [fieldName] : [...value]
      }
    })
  } 
  
  const handleSetFormikValues = () => {
    switch(GET_QUERY("rating-type")){
      case "master" : {
        setSelectedRatingType(Object.assign({},{label:"Rating Symbol Master", value:"Rating Symbol Master"}));  
        (function(){
         HTTP_CLIENT(APIFY("/v1/rating_symbol_master/view"),{params: {uuid}}).then(success => {
           if(success) {
            const { rating_symbol_master:data } = success;
            formikMaster.setFieldValue("ratingScale", {label:data.rating_scale.name, value:data.rating_scale.uuid});
            formikMaster.setFieldValue("description", data.description);
            formikMaster.setFieldValue("grade", data.grade);
            formikMaster.setFieldValue("weightage", data.weightage);
            formikMaster.setFieldValue("ratingSymbol", data.rating_symbol);
            formikMaster.setFieldValue("is_active", data.is_active);
          }
        })
       }())
      } 
      break;
      case "category": {
        setSelectedRatingType(Object.assign({},{label:"Rating Symbol Category", value:"Rating Symbol Category"})); 
        (function(){
         HTTP_CLIENT(APIFY("/v1/rating_symbol_category/view"),{params: {uuid}}).then(success => {
          if(success) {
            const { rating_symbol_category:data } = success;
            formikCategory.setFieldValue("symbolTypeCategory", data.symbol_type_category);
            formikMaster.setFieldValue("is_active", data.is_active);
            }
         })
        }())
      }
      break;   
      case "mapping" : {
        setSelectedRatingType(Object.assign({},{label:"Rating Symbol Mapping", value:"Rating Symbol Mapping"})); 
        (function(){
          HTTP_CLIENT(APIFY("/v1/rating_symbol_mapping/view"),{params: {uuid}}).then(success => {
            if(success) {
              const { rating_symbol_mapping:data } = success;
              formikMapping.setFieldValue("prefix", data?.prefix);
              formikMapping.setFieldValue("suffix", data?.suffix);
              formikMapping.setFieldValue("ratingSymbolMaster", {label:data?.rating_symbol_master?.rating_symbol, value:data?.rating_symbol_master?.uuid});
              formikMapping.setFieldValue("ratingSymbolCategory", {label:data?.rating_symbol_category?.symbol_type_category, value:data?.rating_symbol_category?.uuid});
              formikMapping.setFieldValue("is_active", data?.is_active);
              }
           })
        }())     
      }
    }
  }
   
  const handleSubmit = (values) => {
    if(selectedRatingType.value === "Rating Symbol Master") {
        onSubmitRatingMaster(values)
    } else if(selectedRatingType.value === "Rating Symbol Category") {
        onSubmitRatingCategory(values)
    } else {
      onSubmitRatingMapping(values)
    }
  }
  
  const renderRatingMaster = () => {
    switch(selectedRatingType.value) {
      case "Rating Symbol Master": return <RatingSymbolMaster formik={formikMaster} optionsState={optionsState}/>;
      case "Rating Symbol Category": return <RatingSymbolCategory formik={formikCategory}/>;
      case "Rating Symbol Mapping": return <RatingSymbolMapping formik={formikMapping} optionsState={optionsState}/>;
      default : return <RatingSymbolMaster formik={formikMaster} optionsState={optionsState}/>;;
    }
  }
  
  const handleShowSnackBar = (messageType) => (message) => {
    setSnackbarOpen(true);
    setResponse(messageType);
    setSnackbarMessage(message);
  };

  const handlePerformAjaxRqst = (data) => {
    if(selectedRatingType.value === "Rating Symbol Master") {
       if(uuid) {
        HTTP_CLIENT(APIFY("/v1/rating_symbol_master/edit"), {params: processApiData(data)}).then(
          success => {
            if(success) {
              handleShowSnackBar("success")(`Rating Symbol Master updated successfully`);
              formikMaster.handleReset();
              setTimeout(() => navigate(GET_ROUTE_NAME("RATING_SYMBOL_LISTING")), 900) 
            }
          }
        ).catch(err => {
          console.error(err);
          handleShowSnackBar("error")(`Something went wrong!`);
      })
        return;
       }
        HTTP_CLIENT(APIFY("/v1/rating_symbol_master/create"),{params:processApiData(data) }).then(
            success => {
                if(success) {
                    handleShowSnackBar("success")(`Rating Symbol Master created successfully`);
                    formikMaster.handleReset();
                    setTimeout(() => navigate(GET_ROUTE_NAME("RATING_SYMBOL_LISTING")), 900) 
                }
            }
        ).catch(err => {
            console.error(err);
            handleShowSnackBar("error")(`Something went wrong!`);
        })
    } else if(selectedRatingType.value === "Rating Symbol Category"){
       if(uuid) {
        HTTP_CLIENT(APIFY("/v1/rating_symbol_category/edit"),{params:processApiData(data)}).then(
          success => {
              if(success) {
                  handleShowSnackBar("success")(`Rating Symbol Category updated successfully`);
                  formikMaster.handleReset();
                  setTimeout(() => navigate(GET_ROUTE_NAME("RATING_SYMBOL_LISTING")), 900) 
              }
          }
      ).catch(err => {
          console.error(err);
          handleShowSnackBar("error")(`Something went wrong!`);
      })
        return;
       }
         HTTP_CLIENT(APIFY("/v1/rating_symbol_category/create"),{params:processApiData(data)}).then(
            success => {
                if(success) {
                    handleShowSnackBar("success")(`Rating Symbol Category created successfully`);
                    formikMaster.handleReset();
                    setTimeout(() => navigate(GET_ROUTE_NAME("RATING_SYMBOL_LISTING")), 900) 
                }
            }
        ).catch(err => {
            console.error(err);
            handleShowSnackBar("error")(`Something went wrong!`);
        })
    } else {
      if(uuid) {
        HTTP_CLIENT(APIFY("/v1/rating_symbol_mapping/edit"),{params:processApiData(data)}).then(
          success => {
              if(success) {
                  handleShowSnackBar("success")(`Rating Symbol Mapping updated successfully`);
                  formikMaster.handleReset();
                  setTimeout(() => navigate(GET_ROUTE_NAME("RATING_SYMBOL_LISTING")), 900) 
              }
          }
      ).catch(err => {
          console.error(err);
          handleShowSnackBar("error")(`Something went wrong!`);
      })
        return;
       }
         HTTP_CLIENT(APIFY("/v1/rating_symbol_mapping/create"),{params:processApiData(data)}).then(
            success => {
                if(success) {
                    handleShowSnackBar("success")(`Rating Symbol Mapping created successfully`);
                    formikMaster.handleReset();
                    setTimeout(() => navigate(GET_ROUTE_NAME("RATING_SYMBOL_LISTING")), 900) 
                }
            }
        ).catch(err => {
            console.error(err);
            handleShowSnackBar("error")(`Something went wrong!`);
        })
    }
  }
  
  const processApiData = (data) => { 
    if(selectedRatingType.value === "Rating Symbol Master") {
       const apiData = {
        "rating_scale_uuid": data.ratingScale.value,
        "rating_symbol": data.ratingSymbol,
        "description": data.description,
        "grade": data.grade,
        "weightage": data.weightage,
        "is_active":data.is_active
       }
       if(uuid) {
        return Object.assign(apiData,{uuid});
       }
       return apiData;
    } else if(selectedRatingType.value === "Rating Symbol Category") {
        const apiData = {
          symbol_type_category: data.symbolTypeCategory,
          "is_active":data.is_active
        } 
        if(uuid) return Object.assign(apiData,{uuid});
        return apiData;
    } else {
      const apiData = {
        "rating_symbol_master_uuid": data.ratingSymbolMaster.value,
        "rating_symbol_category_uuid": data.ratingSymbolCategory.value,
        "prefix": data.prefix,
        "suffix": data.suffix,
        "is_active":data.is_active
      }
      if(uuid) return Object.assign(apiData,{uuid});
      return apiData;
    }
  }

  return (
    <DashboardLayout>
      <CardWrapper
        headerTitle={uuid ? "Update Rating Symbol" : "Rating Symbol"}
        headerSubtitle={uuid ? "" :"Rating Master"}
        headerActionButton={() => {
          return (
            <ArgonButton variant={"contained"} color="primary" onClick={() => navigate("/dashboard/company/master/rating-symbol")}>
              <ArrowBackRounded />
              <Box marginX={"5px"} />
              Back
            </ArgonButton>
          );
        }}
      >
        <ArgonBox
          paddingX="3rem"
          sx={{
            background: "white !important",
            height: "calc(100vh - 30vh)",
            overflowY:"scroll",
          }}
        >
          <form onSubmit={handleSubmit}>
            <Grid container xs={12} spacing={1} m="0" marginTop="-20px" rowSpacing={2}>
              <Grid item xs={12}>
                <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
                  Select Rating Symbol Type
                </ArgonTypography>
                <Select 
                value={selectedRatingType} 
                options={ratingSymbolOptions} 
                onChange={(value) => setSelectedRatingType(value)}
                isDisabled={!!uuid}
                />
              </Grid>
                {renderRatingMaster()}
              <Grid xs={12} marginTop={"10px"}>
                <ArgonBox sx={{ display: "flex", justifyContent: "end" }}>
                  <ArgonButton color="success" type="submit">
                    {uuid ? "update" : "Submit"}
                  </ArgonButton>
                </ArgonBox>
              </Grid>
            </Grid>
          </form>
        </ArgonBox>
      </CardWrapper>
      <ArgonSnackbar
          color={response}
          icon={response ? response : "error"}
          title={response === "success" ? "Success" : response === "error" ? "Error" : ""}
          content={snackbarMessage}
          translate="yes"
          dateTime=""
          open={snackbarOpen}
          close={() => setSnackbarOpen(false)}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        />
    </DashboardLayout>
  );
};

export default RatingMasterEntity;



