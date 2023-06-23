import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import moment from "moment";
import { ArrowBackRounded, Close, Add } from "@mui/icons-material";
import { Grid, Button, TextField, Switch } from "@mui/material";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { DashboardLayout } from "layouts";
import FormField from "slots/FormField";
import ErrorTemplate from "slots/Custom/ErrorTemplate";
import { getMandateSchema } from "helpers/validationSchema";
import { HTTP_CLIENT, APIFY } from "helpers/Api";
import { SET_PAGE_TITLE, GET_ROUTE_NAME, GET_QUERY, CHECK_IF_OBJECT_EMPTY, FORMATE_NUMBER, INPUT_DATE_FORMATE } from "helpers/Base";
import { ArgonBox, ArgonTypography, ArgonButton, ArgonInput, ArgonSnackbar } from "components/ArgonTheme";
import ArgonSelect from "components/ArgonSelect";
import CardWrapper from "slots/Cards/CardWrapper";
import HasPermissionButton from "slots/Custom/Buttons/HasPermissionButton";

function CompanyMandateAdd() {
  const navigate = useNavigate();
  const uuid = GET_QUERY("uuid");
  const company_uuid = GET_QUERY("company-uuid");
  const [title, setTitle] = useState(uuid ? "Edit Mandate" : "Add New Mandate");
  const [backdropOpen, setBackdropOpen] = useState(false);
  const [companies, setCompanies] = useState(undefined);
  const [locationOption, setLocationOptions] = useState([]);
  const [mandateTypeOptions, setMandateTypeOptions] = useState([]);
  const [instrumentCategories, setInstrumentCategories] = useState([]);
  const [instrumentSubCategories, setInstrumentSubCategories] = useState([]);
  const [mandateDocuments, setMandateDocuments] = useState(undefined);
  const [RTHUsers, setRTHUsers] = useState([]);
  const [BDUsers, setBDUsers] = useState([]);
  const [response, setResponse] = useState(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isSaveAndVerify, setIssaveAndVerify] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("Please check all required fields");

  const [document, setDocument] = useState({});

  const [instrumentsValues, setInstrumentsValues] = useState([
    { category: {}, sub_category: {}, instruments: [], instrument: {}, size: 0, errors: "", uuid: "" },
  ]);

  const formik = useFormik({
    initialValues: {
      company_uuid: "",
      bd_uuid: "",
      rh_uuid: "",
      mandate_source: "",
      mandate_date: "",
      mandate_type: "",
      branch_office: "",
      total_size: 0,
      initial_fee_charged: 0,
      bases_point: 0,
      surveillance_fee_charged: 0,
      minimum_surveillance_fee: 0,
      surveillance_bases_point: 0,
      received_date: "",
      is_verified: false,
      is_active: true,
      remark: null,
    },
    validationSchema: getMandateSchema(),
    onSubmit: (values) => uuid ? handleEditFormSubmit(values) : handleFormSubmit(values),
  });
  const {
    errors,
    touched,
    setFieldValue,
    handleSubmit,
    handleChange,
    values: formikValue,
  } = formik;

  const fetchData = () => {
    setBackdropOpen(true);
    HTTP_CLIENT(APIFY("/v1/companies"), { is_active: true }).then((data) => {
      let result = data.companies.map((company) => {
        if (company_uuid !== undefined && company.uuid === company_uuid) {
          handleSetFormikValues("company_uuid", {
            label: company.name,
            value: company.uuid,
          })
        }
        return {
          label: company.name,
          value: company.uuid,
        };
      });
      setCompanies(result);
    });
    HTTP_CLIENT(APIFY("/v1/roles/view_users"), {
      role: "Rating Head",
    }).then((data) => {
      let RTdata = data.role?.users || [];
      let RTHUsers = RTdata.map((user) => {
        return {
          label: user.full_name + " (" + user.employee_code + ")",
          value: user.uuid,
        };
      });
      setRTHUsers(RTHUsers);
    });
    HTTP_CLIENT(APIFY("/v1/roles/view_users"), {
      role: "Business Development Coordinator",
    }).then((data) => {
      let BDdata = data.role?.users || [];
      let BDUsers = BDdata.map((user) => {
        return {
          label: user.full_name + " (" + user.employee_code + ")",
          value: user.uuid,
        };
      });
      setBDUsers(BDUsers);
    });

    setBackdropOpen(false);
  };

  const handleMandateType = (obj) => {
    setFieldValue("mandate_type", obj)
    HTTP_CLIENT(APIFY("/v1/mandate_type/view_categories"), {
      params: {
        mandate_type: obj.value,
        is_active: true,
      },
    }).then((data) => {
      let instrument_categories = data["instrument_categories"];

      let instrumentCategories = instrument_categories.map((categoy) => {
        return {
          label: categoy.category_name,
          value: categoy.uuid,
        };
      });
      setInstrumentCategories(instrumentCategories);
    });
  }

  const calculateBasesPoint = () => {
    let totalSize = formikValue["total_size"] * 10000000;
    if (totalSize && formikValue["initial_fee_charged"] > 0) {
      let basesPoint = (formikValue["initial_fee_charged"] / totalSize) * 10000;
      setFieldValue("bases_point", FORMATE_NUMBER(basesPoint));
    }
  }
  const calculateSurveillanceBasesPoint = () => {
    let totalSize = formikValue["total_size"] * 10000000;
    if (totalSize && formikValue["surveillance_fee_charged"] > 0) {
      let basesPoint = (formikValue["surveillance_fee_charged"] / totalSize) * 10000;
      setFieldValue("surveillance_bases_point", FORMATE_NUMBER(basesPoint));
    }
  }

  const getMandate = () => {
    HTTP_CLIENT(APIFY("/v1/companies/mandates/view"), {
      params: {
        uuid: uuid,
      },
    }).then((data) => {
      if (data.mandate.is_verified) {
        navigate(GET_ROUTE_NAME("LIST_MANDATE", { company_uuid: company_uuid }));
      }
      setFieldValue('company_uuid', {
        label: data.mandate.company_mandate.name,
        value: data.mandate.company_mandate.uuid,
      });

      setFieldValue('mandate_date', INPUT_DATE_FORMATE(data.mandate.mandate_date));
      setFieldValue('received_date', INPUT_DATE_FORMATE(data.mandate.received_date));
      setFieldValue('bd_uuid', {
        label: data.mandate.business_developer.full_name,
        value: data.mandate.business_developer.uuid,
      });
      setFieldValue('rh_uuid', {
        label: data.mandate.rating_head.full_name,
        value: data.mandate.rating_head.uuid,
      });
      setFieldValue('mandate_source', data.mandate.mandate_source);
      setFieldValue('branch_office', {
        label: data.mandate.branch_office.name,
        value: data.mandate.branch_office.uuid,
      });
      setFieldValue('mandate_type', {
        label: data.mandate.mandate_type,
        value: data.mandate.mandate_type,
      });
      setFieldValue('total_size', FORMATE_NUMBER(data.mandate.total_size));
      setFieldValue('bases_point', FORMATE_NUMBER(data.mandate.bases_point));
      setFieldValue('is_active', data.mandate.is_active);
      setFieldValue('remark', data.mandate.remark);
      setFieldValue('initial_fee_charged', FORMATE_NUMBER(data.mandate.initial_fee_charged));
      setFieldValue('surveillance_fee_charged', FORMATE_NUMBER(data.mandate.surveillance_fee_charged));
      setFieldValue('minimum_surveillance_fee', FORMATE_NUMBER(data.mandate.minimum_surveillance_fee));
      setFieldValue('surveillance_bases_point', FORMATE_NUMBER(data.mandate.surveillance_bases_point));
      let selectedInstruments = data.mandate.transaction_instruments.map((ti, key) => {
        addFormFields();
        let salectedCategory = {
          label: ti.instrument_category?.category_name,
          value: ti.instrument_category?.uuid
        }
        let selectedSubCategory = {
          label: ti.instrument_sub_category?.category_name,
          value: ti.instrument_sub_category?.uuid
        }
        let selectedInstrument = {
          label: ti.instrument?.name,
          value: ti.instrument?.uuid
        }
        if (key === 0 && salectedCategory.value) {
          handleInstrumentsCategorySelectChange(key, salectedCategory);
        }
        // if (selectedSubCategory.value) {
        //   handleInstrumentsSubCategorySelectChange(key, selectedSubCategory);
        // }
        // if (selectedInstrument.value) {
        //   handleInstrumentsSelectChange(key, selectedInstrument);
        // }
        return {
          category: salectedCategory,
          sub_category: selectedSubCategory,
          instrument: selectedInstrument,
          instruments: [],
          size: FORMATE_NUMBER(ti.instrument_size),
          errors: "",
          uuid: ti.uuid
        }
      })
      setInstrumentsValues(selectedInstruments)
      HTTP_CLIENT(APIFY(`/v1/mandates/view_documents`), {
        mandate_uuid: uuid
      }).then((data) => {
        setMandateDocuments(data.mandate_documents)
      });

    });
  }

  let handleInstrumentsCategorySelectChange = (i, e) => {
    let newFormValues = [...instrumentsValues];
    newFormValues.forEach((fv, key) => {
      newFormValues[key]['category'] = e;
      newFormValues[key]['sub_category'] = {};
      newFormValues[key]['instrument'] = {};
    })
    HTTP_CLIENT(APIFY("/v1/sub_categories/by_category/view"), {
      instrument_category_uuid: e.value,
    }).then((data) => {
      let instrumentSubCategories = data.sub_instrument_category.map((subCategoy) => {
        return {
          label: subCategoy.category_name,
          value: subCategoy.uuid,
        };
      });
      setInstrumentSubCategories(instrumentSubCategories);

    });
    setInstrumentsValues(newFormValues);
  };

  let handleInstrumentsSubCategorySelectChange = async (i, e) => {
    let newFormValues = [...instrumentsValues];
    if (newFormValues[i] === undefined) {
      newFormValues.push({ category: {}, sub_category: {}, instruments: [], instrument: {}, size: 0, errors: "", uuid: "" })
    }
    newFormValues[i]['sub_category'] = e;
    newFormValues[i]['instrument'] = {};
    let instrumentsList = await HTTP_CLIENT(APIFY("/v1/instruments/by_subcategory/view"), {
      sub_category_uuid: e.value,
    }).then((data) => {
      let instruments = data.instruments.map((instrument) => {
        return {
          label: instrument.name,
          value: instrument.uuid,
        };
      });
      return instruments;
    });
    newFormValues[i]['instruments'] = instrumentsList;
    setInstrumentsValues(newFormValues);
  };

  let handleInstrumentsSelectChange = (i, e) => {
    let newFormValues = [...instrumentsValues];
    newFormValues[i]['instrument'] = e;
    setInstrumentsValues(newFormValues);
  };

  const CheckSize = (params = null) => {
    let totalSize = 0;
    params.forEach(fv => {
      if (fv.size) {
        totalSize = totalSize + parseFloat(fv.size)
      }
    });
    return totalSize;

  }

  let handleInstrumentsChange = (i, value) => {
    if (value >= 0) {
      let newFormValues = [...instrumentsValues];
      newFormValues[i]['size'] = value;
      let totalSize = CheckSize(newFormValues);
      if (formikValue["total_size"] >= totalSize) {
        setInstrumentsValues(newFormValues);
        newFormValues.forEach((fv, key) => {
          newFormValues[key]['errors'] = "";
        })
      } else {
        newFormValues[i]['size'] = instrumentsValues[i]['size'];
        newFormValues[i]['errors'] = "Sum of Instruments size should not be greater than the Total size of the Mandate";
        setInstrumentsValues(newFormValues);
      }
    }
  };

  let addFormFields = () => {
    if (instrumentsValues.length > 0) {
      setInstrumentsValues([
        ...instrumentsValues,
        { category: instrumentsValues[0].category, sub_category: {}, instrument: {}, instruments: [], size: 0, errors: "", uuid: "" },
      ]);
    } else {
      setInstrumentsValues([
        ...instrumentsValues,
        { category: {}, sub_category: {}, instrument: {}, instruments: [], size: 0, errors: "", uuid: "" },
      ]);

    }
  };

  const handleSetFormikValues = (key, options) => {
    setFieldValue(key, options);
  };

  let removeFormFields = (i) => {
    let newFormValues = [...instrumentsValues];
    let totalSize = CheckSize(newFormValues);
    if (formikValue["total_size"] >= totalSize) {
      newFormValues.forEach((fv, key) => {
        newFormValues[key]['errors'] = "";
      })
    } else {
      newFormValues[i]['errors'] = "Sum of Instruments size should not be greater than the Total size of the Mandate";
    }
    if (newFormValues[i].uuid) {
      HTTP_CLIENT(APIFY(`/v1/mandates/edit_transaction_instrument`), {
        params: {
          uuid: newFormValues[i].uuid,
          mandate_uuid: uuid,
          instrument_uuid: newFormValues[i].instrument.value,
          instrument_category_uuid: newFormValues[0].category.value,
          instrument_sub_category_uuid: newFormValues[i].sub_category.value,
          complexity_lavel: null,
          remark: null,
          instrument_listing_status: null,
          instrument_size: FORMATE_NUMBER(newFormValues[i].size),
          is_active: false,
        }
      }).then((responce) => {
        newFormValues.splice(i, 1);
        setInstrumentsValues(newFormValues);

      });
    } else {
      newFormValues.splice(i, 1);
      setInstrumentsValues(newFormValues);
    }
  };

  const getFormData = (mandate_uuid, doc_uuid = null) => {
    const formData = new FormData();
    formData.append("mandate_uuid", mandate_uuid);
    if (doc_uuid) {
      formData.append("uuid", doc_uuid);
    }

    if (document?.part_1) {
      formData.append("mandate_part_1_document", document["part_1"]["file"]);
    }
    if (document?.part_2) {
      formData.append("mandate_part_2_document", document["part_2"]["file"]);
    }
    return formData;
  };

  const prepareMandateData = (mandateData) => {
    return {
      uuid: uuid,
      company_uuid: mandateData.company_uuid.value,
      bd_uuid: mandateData.bd_uuid.value,
      rh_uuid: mandateData.rh_uuid.value,
      gh_uuid: null,
      ra_uuid: null,
      branch_office_uuid: mandateData.branch_office.value,
      mandate_source: mandateData.mandate_source,
      mandate_status: null,
      mandate_date: mandateData.mandate_date,
      mandate_type: mandateData.mandate_type.value,
      total_size: FORMATE_NUMBER(mandateData.total_size),
      initial_fee_charged: FORMATE_NUMBER(mandateData.initial_fee_charged),
      bases_point: FORMATE_NUMBER(mandateData.bases_point),
      surveillance_fee_charged: FORMATE_NUMBER(mandateData.surveillance_fee_charged),
      minimum_surveillance_fee: FORMATE_NUMBER(mandateData.minimum_surveillance_fee),
      surveillance_bases_point: FORMATE_NUMBER(mandateData.surveillance_bases_point),
      received_date: mandateData.received_date,
      is_verified: isSaveAndVerify,
      is_active: mandateData.is_active,
      remark: mandateData.remark,
    }

  }

  let handleFormSubmit = (mandateData) => {
    setIsDisabled(true)
    let data = prepareMandateData(mandateData);
    delete data.uuid
    let isError = instrumentsValues.map((fv, key) => {
      if (key === 0 && (Object.keys(fv.category) === 0 || Object.keys(fv.sub_category) === 0 || Object.keys(fv.instrument) === 0)) {
        return false;
      }
      if (fv.errors.length > 0) {
        return false;
      } else {
        true
      }
    });

    isError = isError.includes(false) ? false : true;
    if (Object.keys(document).length > 0 && isError) {
      HTTP_CLIENT(APIFY(`/v1/companies/assign_mandates`), { params: data })
        .then((response) => {
          if (response["success"]) {

            HTTP_CLIENT(APIFY(`/v1/mandates/assign_documents`), getFormData(response.mandate_uuid), true).catch((err) => {
              setResponse("error");
              setSnackbarOpen(true);
            });
            instrumentsValues.forEach((instrumentsValue) => {
              if (instrumentsValue.category?.value && instrumentsValue.instrument?.value && instrumentsValue.sub_category?.value) {
                HTTP_CLIENT(APIFY(`/v1/mandates/create_transaction_instrument`), {
                  params: {
                    mandate_uuid: response.mandate_uuid,
                    instrument_uuid: instrumentsValue.instrument.value,
                    instrument_category_uuid: instrumentsValue.category.value,
                    instrument_sub_category_uuid: instrumentsValue.sub_category.value,
                    complexity_lavel: null,
                    remark: null,
                    instrument_listing_status: null,
                    instrument_size: FORMATE_NUMBER(instrumentsValue.size)
                  }
                });
              }
            });
            setResponse("success");
            setSnackbarOpen(true);
            navigate(GET_ROUTE_NAME("LIST_MANDATE", { company_uuid: data.company_uuid }), { state: { success: true, type: "CREATE" } });
            return;
          }
        })
        .catch((err) => {
          setSnackbarMessage(err.error?.name ? err.error.name : "Check all required fields!");
          setResponse("error");
          setSnackbarOpen(true);
        });
    } else {
      setSnackbarMessage("Check all required fields!");
      setResponse("error");
      setSnackbarOpen(true);
    }
    setIsDisabled(false)

  };

  let handleEditFormSubmit = (mandateData) => {
    setIsDisabled(true)
    let isError = instrumentsValues.map((fv, key) => {
      if (key === 0 && (Object.keys(fv.category) === 0 || Object.keys(fv.sub_category) === 0 || Object.keys(fv.instrument) === 0)) {
        return false;
      }
      if (fv.errors.length > 0) {
        return false;
      } else {
        true
      }
    });

    isError = isError.includes(false) ? false : true;
    if (isSaveAndVerify) {
      var isVarified = confirm("Are you sure you want to verify this mandate.");
    } else {
      var isVarified = true;
    }
    if (isVarified) {
      if (isError) {
        instrumentsValues.forEach((instrumentsValue) => {
          if (instrumentsValue.category?.value && instrumentsValue.instrument?.value && instrumentsValue.sub_category?.value) {
            if (instrumentsValue.uuid) {
              HTTP_CLIENT(APIFY(`/v1/mandates/edit_transaction_instrument`), {
                params: {
                  uuid: instrumentsValue.uuid,
                  mandate_uuid: uuid,
                  instrument_uuid: instrumentsValue.instrument.value,
                  instrument_category_uuid: instrumentsValue.category.value,
                  instrument_sub_category_uuid: instrumentsValue.sub_category.value,
                  complexity_lavel: null,
                  remark: null,
                  instrument_listing_status: null,
                  instrument_size: FORMATE_NUMBER(instrumentsValue.size)
                }
              });
            } else {
              HTTP_CLIENT(APIFY(`/v1/mandates/create_transaction_instrument`), {
                params: {
                  mandate_uuid: uuid,
                  instrument_uuid: instrumentsValue.instrument.value,
                  instrument_category_uuid: instrumentsValue.category.value,
                  instrument_sub_category_uuid: instrumentsValue.sub_category.value,
                  complexity_lavel: null,
                  remark: null,
                  instrument_listing_status: null,
                  instrument_size: FORMATE_NUMBER(instrumentsValue.size)
                }
              });
            }
          }
        });
        if (Object.keys(document).length > 0) {
          if (mandateDocuments) {
            HTTP_CLIENT(APIFY(`/v1/mandates/assign_documents`), getFormData(uuid, mandateDocuments.uuid), true).catch((err) => {
              setResponse("error");
              setSnackbarOpen(true);
            });
          } else {
            HTTP_CLIENT(APIFY(`/v1/mandates/assign_documents`), getFormData(uuid), true).catch((err) => {
              setResponse("error");
              setSnackbarOpen(true);
            });
          }
        }
        HTTP_CLIENT(APIFY(`/v1/companies/edit_mandates`), { params: prepareMandateData(mandateData) })
          .then((response) => {
            if (response["success"]) {
              setResponse("success");
              setSnackbarOpen(true);
              navigate(GET_ROUTE_NAME("LIST_MANDATE", { company_uuid: mandateData.company_uuid?.value }), { state: { success: true, type: "UPDATE" } });
              return;
            }
          })
          .catch((err) => {
            setResponse("error");
            setSnackbarOpen(true);
          });
      } else {
        setSnackbarMessage("Check all required fields!");
        setResponse("error");
        setSnackbarOpen(true);
      }
    }
    setIsDisabled(false)

  };

  const isFieldValid = (fieldName) => {
    return !!(touched[fieldName] && errors[fieldName]);
  };

  const getMasters = () => {
    HTTP_CLIENT(APIFY("/v1/master"), { group: "MANDATE_TYPE", is_active: true }).then((data) => {
      let masters = data["masters"];
      let mandateType = [];
      masters.forEach((master) => {
        mandateType.push({ label: master["name"], value: master["value"] });
      });
      setMandateTypeOptions(mandateType);
    });
  };
  const getBranchOffice = () => {
    HTTP_CLIENT(APIFY("/v1/branch_offices"), { params: { is_active: true } }).then((data) => {
      let branch_offices = data["branch_offices"];
      let location = [];
      branch_offices.forEach((barnchoffice) => {
        location.push({ label: barnchoffice["name"], value: barnchoffice["uuid"] });
      });
      setLocationOptions(location);
    });
  };

  const handleShowSnackBar = (messageType) => (message) => {
    setSnackbarOpen(true);
    setResponse(messageType);
    setSnackbarMessage(message);
  };
  const onCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const fileIsNotValid = (mimetype) => (size) => {
    if (mimetype != "application/pdf") {
      handleShowSnackBar("error")("Please select only PDF files.");
      return true;
    } else if ((size * 0.001 * 0.001) > 5) {
      handleShowSnackBar("error")("File Size cannot exceed more than 5mb.");
      return true;
    }
  };
  const handleFile = (e, fileType) => {
    const mimetype = e.target.files[0].type;
    const size = e.target.files[0].size;
    if (fileIsNotValid(mimetype)(size)) return;
    setDocument((prev) => {
      return {
        ...prev,
        [fileType]: {
          fileType: fileType,
          fileName: e.target.files[0].name,
          file: e.target.files[0],
        },
      };
    });
  };

  useEffect(() => {

  }, [instrumentsValues])

  useEffect(() => {
    calculateBasesPoint();
  }, [formikValue["total_size"], formikValue["initial_fee_charged"]])
  useEffect(() => {
    calculateSurveillanceBasesPoint();
  }, [formikValue["total_size"], formikValue["surveillance_fee_charged"]])

  useEffect(() => {
    let newFormValues = [...instrumentsValues];
    let totalSize = CheckSize(newFormValues);
    if (formikValue["total_size"] >= totalSize) {
      newFormValues.forEach((fv, key) => {
        newFormValues[key]['errors'] = "";
      })
    } else {
      newFormValues[0]['errors'] = "Sum of Instruments size should not be greater than the Total size of the Mandate";
    }
    setInstrumentsValues(newFormValues);
  }, [formikValue["total_size"]])

  const hendleSaveandVerify = () => {
    setIssaveAndVerify(true)
    handleSubmit()
  }

  const hendleNumberChange = (e, key) => {
    if (e.target.value >= 0) {
      setFieldValue(key, e.target.value);
    }
  }

  useEffect(() => {
    SET_PAGE_TITLE(title);
    let ajaxEvent = true;
    if (ajaxEvent) {
      fetchData();
      getMasters();
      getBranchOffice();
      if (uuid) {
        getMandate()
      }
    }
    return () => {
      ajaxEvent = false;
      setBackdropOpen(false);
    };
  }, []);

  return (
    <>
      <DashboardLayout breadcrumbTitle={title}>

        <ArgonBox component="form" role="form" onSubmit={handleSubmit}>
          <CardWrapper
            headerTitle={title}
            headerActionButton={() => {
              return (
                <HasPermissionButton
                  color="primary"
                  permissions={["/dashboard/company/mandate"]}
                  route={GET_ROUTE_NAME("LIST_MANDATE", { company_uuid: company_uuid || "" })}
                  text={`Back to Mandate`}
                  icon={<ArrowBackRounded />}
                />
              );
            }}
            footerActionButton={() => {
              return (
                <ArgonBox spacing={2} padding="1rem" display="flex" sx={{ marginRight: "15px" }} justifyContent={"flex-end"}>
                  <ArgonButton color="success" type="submit" isDisabled={isDisabled}>
                    {uuid ? "Update" : "Submit"}
                  </ArgonButton>
                  {uuid && formikValue["is_active"] &&
                    <ArgonButton color="success" type="button" sx={{ marginLeft: "15px" }} onClick={hendleSaveandVerify} isDisabled={isDisabled}>
                      Save And Verify
                    </ArgonButton>
                  }
                </ArgonBox>
              );
            }}
          >
            <ArgonBox borderRadius="lg" opacity={1} marginTop={"-30px"} bgColor="white">
              <Grid
                item
                container
                sx={{ height: "calc(100vh - 32vh)", overflowY: "scroll" }}
              >
                <Grid item xs={12} px={3}>
                  <ArgonTypography paddingTop="10px">Mandate Details</ArgonTypography>
                  <Grid item container xs={12}>
                    <Grid item xs={3} sm={6} md={4} pr={2} mt={0.5} position="relative">
                      <ArgonTypography
                        component="label"
                        variant="caption"
                        fontWeight="bold"
                        textTransform="capitalize"
                        sx={{
                          marginBottom: "5px",
                          display: "block",
                        }}
                      >
                        Company Name*
                      </ArgonTypography>
                      <ArgonSelect
                        options={companies}
                        placeholder="Select Company Name"
                        value={CHECK_IF_OBJECT_EMPTY(formikValue["company_uuid"])}
                        sx={{
                          borderColor: `${isFieldValid("company_uuid") ? "red" : "lightgray"}`,
                        }}
                        onChange={(options) => handleSetFormikValues("company_uuid", options)}
                        required
                      />
                      {isFieldValid("company_uuid") && (
                        <ErrorTemplate message={"Company Name is Required."} />
                      )}
                    </Grid>
                    <Grid item xs={3} sm={6} md={4} pr={2} mb={2} position="relative">
                      <ArgonBox mb={1} ml={0.5} lineHeight={0}>
                        <ArgonTypography
                          component="label"
                          variant="caption"
                          fontWeight="bold"
                          textTransform="capitalize"
                        >
                          Mandate Date*
                        </ArgonTypography>
                      </ArgonBox>
                      <LocalizationProvider dateAdapter={AdapterMoment}>
                        <DatePicker
                          inputFormat="MM/DD/YYYY"
                          disableFuture={true}
                          className={"date-picker-width"}
                          name="mandate_date"
                          value={formikValue["mandate_date"]}
                          onChange={(newValue) => handleSetFormikValues("mandate_date", newValue)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              sx={{
                                ".MuiOutlinedInput-root": {
                                  paddingLeft: "0px",
                                  borderRadius: "2px",
                                  display: "flex",
                                  justifyContent: "space-between !important",
                                  borderColor: `${isFieldValid("mandate_date") ? "red" : "lightgray"
                                    }`,
                                },
                              }}
                            />
                          )}
                        />
                      </LocalizationProvider>
                      {isFieldValid("mandate_date") && (
                        <ErrorTemplate message={errors.mandate_date} />
                      )}
                    </Grid>
                    <Grid item xs={3} sm={6} md={4} pr={2} mb={2} position="relative">
                      <ArgonBox mb={1} ml={0.5} lineHeight={0}>
                        <ArgonTypography
                          component="label"
                          variant="caption"
                          fontWeight="bold"
                          textTransform="capitalize"
                        >
                          Received Date*
                        </ArgonTypography>
                      </ArgonBox>
                      <LocalizationProvider dateAdapter={AdapterMoment}>
                        <DatePicker
                          inputFormat="MM/DD/YYYY"
                          disableFuture={true}
                          className={"date-picker-width"}
                          name="received_date"
                          minDate={moment(formikValue["mandate_date"]).format("L")}
                          value={formikValue["received_date"]}
                          onChange={(newValue) => handleSetFormikValues("received_date", newValue)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              sx={{
                                ".MuiOutlinedInput-root": {
                                  paddingLeft: "0px",
                                  borderRadius: "2px",
                                  display: "flex",
                                  justifyContent: "space-between !important",
                                  borderColor: `${isFieldValid("received_date") ? "red" : "lightgray"
                                    }`,
                                },
                              }}
                            />
                          )}
                        />
                      </LocalizationProvider>
                      {isFieldValid("received_date") && (
                        <ErrorTemplate message={errors.received_date} />
                      )}
                    </Grid>
                    <Grid item xs={3} sm={6} md={4} pr={2} pt={1} position="relative">
                      <ArgonTypography
                        component="label"
                        variant="caption"
                        fontWeight="bold"
                        textTransform="capitalize"
                        sx={{ marginBottom: "5px", display: "block" }}
                      >
                        BD Name*
                      </ArgonTypography>
                      <ArgonSelect
                        placeholder="Select BD Name"
                        options={BDUsers}
                        value={CHECK_IF_OBJECT_EMPTY(formikValue["bd_uuid"])}
                        sx={{
                          borderColor: `${isFieldValid("bd_uuid") ? "red" : "lightgray"}`,
                        }}
                        onChange={(options) => handleSetFormikValues("bd_uuid", options)}
                        required
                      />
                      {isFieldValid("bd_uuid") && (
                        <ErrorTemplate message={"BD Name is Required."} />
                      )}
                    </Grid>
                    <Grid item xs={3} sm={6} md={4} pr={2} pt={1} position="relative">
                      <ArgonTypography
                        component="label"
                        variant="caption"
                        fontWeight="bold"
                        textTransform="capitalize"
                        sx={{ marginBottom: "5px", display: "block" }}
                      >
                        Rating Head*
                      </ArgonTypography>
                      <ArgonSelect
                        placeholder="Select Rating Head"
                        options={RTHUsers}
                        value={CHECK_IF_OBJECT_EMPTY(formikValue["rh_uuid"])}
                        sx={{
                          borderColor: `${isFieldValid("rh_uuid") ? "red" : "lightgray"}`,
                        }}
                        onChange={(options) => handleSetFormikValues("rh_uuid", options)}
                        required
                      />
                      {isFieldValid("rh_uuid") && (
                        <ErrorTemplate message={"Rating Team Head is Required."} />
                      )}
                    </Grid>
                    <Grid item xs={3} sm={6} md={4} pr={2} position="relative">
                      <FormField
                        label="Mandate Source*"
                        type="text"
                        placeholder="Mandate Source"
                        name="mandate_source"
                        value={formikValue["mandate_source"]}
                        sx={{
                          borderColor: `${isFieldValid("mandate_source") ? "red" : "lightgray"}`,
                        }}
                        onChange={handleChange}
                      />
                      {isFieldValid("mandate_source") && (
                        <ErrorTemplate message={errors.mandate_source} />
                      )}
                    </Grid>
                    <Grid item xs={3} sm={6} md={4} pr={2} pt={1} position="relative">
                      <ArgonTypography
                        component="label"
                        variant="caption"
                        fontWeight="bold"
                        textTransform="capitalize"
                        sx={{ marginBottom: "5px", display: "block" }}
                      >
                        Branch Office*
                      </ArgonTypography>
                      <ArgonSelect
                        placeholder="Select Branch Office"
                        options={locationOption}
                        value={CHECK_IF_OBJECT_EMPTY(formikValue["branch_office"])}
                        sx={{
                          borderColor: `${isFieldValid("branch_office") ? "red" : "lightgray"}`,
                        }}
                        onChange={(options) => handleSetFormikValues("branch_office", options)}
                        required
                      />
                      {isFieldValid("branch_office") && (
                        <ErrorTemplate message={"Branch Office is Required"} />
                      )}
                    </Grid>
                  </Grid>
                  <ArgonTypography paddingTop="20px">
                    Type of Mandate and Fee detail
                  </ArgonTypography>
                  <Grid item container xs={12} marginTop={"10px"}>
                    <Grid item xs={3} sm={6} md={3} pr={2} position="relative">
                      <ArgonTypography
                        component="label"
                        variant="caption"
                        fontWeight="bold"
                        textTransform="capitalize"
                        sx={{ display: "block" }}
                        paddingBottom={0.5}
                      >
                        Type of Mandate*
                      </ArgonTypography>
                      <ArgonSelect
                        placeholder="Select Type of Mandate"
                        options={mandateTypeOptions}
                        value={CHECK_IF_OBJECT_EMPTY(formikValue["mandate_type"])}
                        onChange={handleMandateType}
                        sx={{
                          borderColor: `${isFieldValid("mandate_type") ? "red" : "lightgray"}`,
                        }}
                        required
                      />
                      {isFieldValid("mandate_type") && (
                        <ErrorTemplate message={"Mandate Type is Required."} />
                      )}
                    </Grid>

                    <Grid item xs={3} sm={6} md={3} pr={2} position="relative">
                      <ArgonTypography
                        component="label"
                        variant="caption"
                        fontWeight="bold"
                        textTransform="capitalize"
                      >
                        Total Size* (in Cr.)
                      </ArgonTypography>
                      <>
                        <ArgonInput
                          type="number"
                          name="total_size"
                          placeholder="Enter Total Size"
                          onChange={(e) => hendleNumberChange(e, 'total_size')}
                          value={formikValue["total_size"]}
                          sx={{
                            borderColor: `${isFieldValid("total_size") ? "red" : "lightgray"}`,
                          }}
                          required
                        />
                        {isFieldValid("total_size") && (
                          <ErrorTemplate message={errors.total_size} />
                        )}
                      </>
                    </Grid>
                    <Grid item xs={3} sm={6} md={3} pr={2} position="relative">
                      <ArgonTypography
                        component="label"
                        variant="caption"
                        fontWeight="bold"
                        textTransform="capitalize"
                      >
                        Initial Fee Charged* (in INR)
                      </ArgonTypography>
                      <>
                        <ArgonInput
                          type="number"
                          placeholder="Initial Fee Charged"
                          name="initial_fee_charged"
                          onChange={handleChange}
                          value={formikValue["initial_fee_charged"]}
                          sx={{
                            borderColor: `${isFieldValid("initial_fee_charged") ? "red" : "lightgray"
                              }`,
                          }}
                          required
                        />
                        {isFieldValid("initial_fee_charged") && (
                          <ErrorTemplate message={errors.initial_fee_charged} />
                        )}
                      </>
                    </Grid>
                    <Grid item xs={3} sm={6} md={3} position="relative">
                      <ArgonTypography
                        component="label"
                        variant="caption"
                        fontWeight="bold"
                        textTransform="capitalize"
                      >
                        Basis Point
                      </ArgonTypography>
                      <>
                        <ArgonInput
                          type="number"
                          placeholder="Basis Point"
                          name="bases_point"
                          value={formikValue["bases_point"]}
                          sx={{
                            borderColor: `${isFieldValid("bases_point") ? "red" : "lightgray"
                              }`,
                          }}
                          onChange={(e) => hendleNumberChange(e, 'bases_point')}
                        />
                        {isFieldValid("bases_point") && (
                          <ErrorTemplate message={errors.bases_point} />
                        )}
                      </>
                    </Grid>
                  </Grid>
                  <Grid item container xs={12} marginTop={"10px"}>
                    <Grid item xs={3} sm={6} md={4} pr={2} position="relative">
                      <ArgonTypography
                        component="label"
                        variant="caption"
                        fontWeight="bold"
                        textTransform="capitalize"
                      >
                        Surveillance Fee Charged (in INR)
                      </ArgonTypography>
                      <ArgonInput
                        type="number"
                        name="surveillance_fee_charged"
                        placeholder="Surveillance Fee Charged"
                        onChange={(e) => hendleNumberChange(e, 'surveillance_fee_charged')}
                        value={formikValue["surveillance_fee_charged"]}
                      />
                      {isFieldValid("surveillance_fee_charged") && (
                        <ErrorTemplate message={errors.surveillance_fee_charged} />
                      )}
                    </Grid>
                    <Grid item xs={3} sm={6} md={4} pr={2} position="relative">
                      <ArgonTypography
                        component="label"
                        variant="caption"
                        fontWeight="bold"
                        textTransform="capitalize"
                      >
                        Surveillance Basis Point
                      </ArgonTypography>
                      <ArgonInput
                        type="number"
                        name="surveillance_bases_point"
                        placeholder="Surveillance Basis Point"
                        sx={{
                          borderColor: `${isFieldValid("surveillance_bases_point") ? "red" : "lightgray"
                            }`,
                        }}
                        onChange={handleChange}
                        value={formikValue["surveillance_bases_point"]}
                      />

                      {isFieldValid("surveillance_bases_point") && (
                        <ErrorTemplate message={errors.surveillance_bases_point} />
                      )}
                    </Grid>
                    <Grid item xs={3} sm={6} md={4}>
                      <ArgonTypography
                        component="label"
                        variant="caption"
                        fontWeight="bold"
                        textTransform="capitalize"
                      >
                        Minimum Surveillance Fee (in INR)
                      </ArgonTypography>
                      <ArgonInput
                        type="number"
                        name="minimum_surveillance_fee"
                        placeholder="Minimum Surveillance Fee"
                        value={formikValue["minimum_surveillance_fee"]}
                        onChange={(e) => hendleNumberChange(e, 'minimum_surveillance_fee')}
                      />
                    </Grid>
                  </Grid>
                  <ArgonTypography paddingTop="20px">Instrument/Facility Details</ArgonTypography>
                  <Grid item container xs={12} spacing={3} mb={3}>
                    {instrumentsValues.map((element, index) => (
                      <React.Fragment key={element.id}>
                        <Grid item container xs={12} spacing={3} >
                          <Grid item xs={12} sm={6} md={3}>
                            <ArgonTypography
                              component="label"
                              variant="caption"
                              fontWeight="bold"
                              textTransform="capitalize"
                            >
                              Category*
                            </ArgonTypography>
                            <ArgonSelect
                              placeholder="Select Category"
                              options={instrumentCategories}
                              name="category"
                              value={CHECK_IF_OBJECT_EMPTY(instrumentsValues[0].category)}
                              onChange={(ev) => handleInstrumentsCategorySelectChange(index, ev)}
                              isDisabled={index > 0 ? true : false}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <ArgonTypography
                              component="label"
                              variant="caption"
                              fontWeight="bold"
                              textTransform="capitalize"
                            >
                              Sub Category*
                            </ArgonTypography>
                            <ArgonSelect
                              placeholder="Select Sub Category"
                              options={instrumentSubCategories}
                              name="sub_category"
                              value={CHECK_IF_OBJECT_EMPTY(element.sub_category)}
                              onChange={(ev) => handleInstrumentsSubCategorySelectChange(index, ev)}
                              required={true}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <ArgonTypography
                              component="label"
                              variant="caption"
                              fontWeight="bold"
                              textTransform="capitalize"
                            >
                              Instrument*
                            </ArgonTypography>
                            <ArgonSelect
                              placeholder="Select Instrument"
                              options={element.instruments}
                              name="instrument"
                              value={CHECK_IF_OBJECT_EMPTY(element.instrument)}
                              onChange={(ev) => handleInstrumentsSelectChange(index, ev)}
                              required
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <ArgonTypography
                              component="label"
                              variant="caption"
                              fontWeight="bold"
                              textTransform="capitalize"
                            >
                              Size* (in Cr.)
                            </ArgonTypography>
                            <ArgonInput
                              type="number"
                              name="size"
                              placeholder="Enter Size"
                              value={element.size}
                              onChange={(ev) => handleInstrumentsChange(index, ev.target.value)}
                              required
                            />
                            {element.errors && (
                              <ErrorTemplate message={element.errors} />
                            )}
                          </Grid>
                          {index ? (
                            <Button
                              sx={{ marginLeft: "15px", color: "#c20e3c" }}
                              size="large"
                              color="error"
                              onClick={() => removeFormFields(index)}
                            >
                              <Close title="close" /> Remove
                            </Button>
                          ) : null}
                        </Grid>
                      </React.Fragment>
                    ))}
                  </Grid>
                  <Grid item xs={3} sm={6} md={4}>
                    <Button
                      sx={{ color: "#11cdef", border: "1px solid #11cdef" }}
                      mt={1}
                      onClick={() => addFormFields()}
                    >
                      <Add /> Add
                    </Button>
                  </Grid>

                  <ArgonTypography paddingTop="20px">Files</ArgonTypography>
                  <Grid item container xs={12} spacing={3} sx={{ marginBottom: "2rem" }}>
                    <Grid item xs={3} sm={6} md={4} pr={2} pt={1} position="relative">
                      <ArgonTypography
                        component="label"
                        variant="caption"
                        fontWeight="bold"
                        textTransform="capitalize"
                      >
                        {`Duly Signed Mandate${uuid ? '' : '*'}`}
                      </ArgonTypography>
                      <input
                        style={{ border: "0.0625rem solid rgb(210, 214, 218)", display: "block", padding: "5px 10px", width: "100%", borderRadius: "4px" }}
                        type="file"
                        name="part_1"
                        label={`Duly Signed Mandate${uuid ? '' : '*'}`}
                        onChange={(e) => handleFile(e, "part_1")}
                        accept=".pdf"
                        required={uuid ? false : true}
                      />

                      {touched?.part_1 && errors?.part_1 && (
                        <ErrorTemplate message={errors?.part_1} />
                      )}
                      {mandateDocuments?.mandate_part_1_document &&
                        <span
                          className="hover-effect"
                          style={{
                            height: "100%",
                            width: "100%",
                            fontSize: "12px",
                            overflow: "hidden",
                            textAlign: "end",
                            cursor: "pointer",
                            textOverflow: "ellipsis",
                            marginRight: "6px",
                          }}
                          onClick={() => window.open(mandateDocuments.mandate_part_1_document, "_blank")}
                        >
                          mandate-document-part-1.pdf
                        </span>
                      }
                    </Grid>
                    <Grid item xs={3} sm={6} md={4} pr={2} pt={1} position="relative">
                      <ArgonTypography
                        component="label"
                        variant="caption"
                        fontWeight="bold"
                        textTransform="capitalize"
                      >
                        {`Part Signed Mandate`}
                      </ArgonTypography>
                      <input
                        style={{ border: "0.0625rem solid rgb(210, 214, 218)", display: "block", padding: "5px 10px", width: "100%", borderRadius: "4px" }}
                        type="file"
                        name="part_2"
                        onChange={(e) => handleFile(e, "part_2")}
                        accept=".pdf"
                        label="Part Signed mandate"
                      />

                      {touched?.part_2 && errors?.part_2 && (
                        <ErrorTemplate message={errors?.part_2} />
                      )}
                      {mandateDocuments?.mandate_part_2_document &&
                        <span
                          className="hover-effect"
                          style={{
                            height: "100%",
                            width: "100%",
                            cursor: "pointer",
                            fontSize: "12px",
                            overflow: "hidden",
                            textAlign: "end",
                            textOverflow: "ellipsis",
                            marginRight: "6px",
                          }}
                          onClick={() => window.open(mandateDocuments.mandate_part_2_document, "_blank")}
                        >
                          mandate-document-part-2.pdf
                        </span>
                      }
                    </Grid>
                    {uuid && (
                      <Grid item container xs={12} spacing={3} sx={{ marginBottom: "2rem" }}>
                        <Grid item paddingLeft={3} marginTop={4} xs={12} sm={3} display="flex">
                          <ArgonBox mr={1}>
                            <Switch
                              name="is_active"
                              checked={formikValue["is_active"]}
                              onChange={handleChange}
                            />
                            {formikValue["is_active"] ? "  Active" : "  Inactive"}
                          </ArgonBox>
                        </Grid>
                        {!formikValue["is_active"] &&
                          <Grid item xs={3} sm={6} md={4} pr={2} position="relative">
                            <FormField
                              label="Remark"
                              type="text"
                              placeholder="Remark"
                              name="remark"
                              value={formikValue["remark"]}
                              sx={{
                                borderColor: `${isFieldValid("remark") ? "red" : "lightgray"}`,
                              }}
                              onChange={handleChange}
                            />
                            {isFieldValid("remark") && (
                              <ErrorTemplate message={errors.remark} />
                            )}
                          </Grid>
                        }
                      </Grid>
                    )}
                  </Grid>


                </Grid>
                <ArgonSnackbar
                  color={response}
                  icon={response ? response : "error"}
                  title={response === "success" ? "Success" : response === "error" ? "Error" : ""}
                  content={snackbarMessage}
                  translate="yes"
                  dateTime=""
                  open={snackbarOpen}
                  close={onCloseSnackbar}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                />
              </Grid>
            </ArgonBox>
          </CardWrapper>

        </ArgonBox>
      </DashboardLayout>
    </>
  );
}

export default CompanyMandateAdd;
