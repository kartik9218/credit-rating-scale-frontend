import React, { useEffect, useState } from "react";
import DashboardLayout from "layouts/DashboardLayout";
import CardWrapper from "slots/Cards/CardWrapper";
import moment from "moment/moment";
import { SET_PAGE_TITLE } from "helpers/Base";
import HasPermissionButton from "slots/Custom/Buttons/HasPermissionButton";
import { GET_ROUTE_NAME } from "helpers/Base";
import { GET_QUERY } from "helpers/Base";
import { Add, ArrowBackRounded } from "@mui/icons-material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { ArgonSnackbar } from "components/ArgonTheme";
import { Autocomplete, Box, Button, ButtonGroup, Divider, Grid, TextField, Typography } from "@mui/material";
import Select from "react-select";
import { HTTP_CLIENT } from "helpers/Api";
import { APIFY } from "helpers/Api";
import { useFormik } from "formik";
import { getDiligenceValidations } from "helpers/validationSchema";
import { getDiligenceSchema } from "helpers/formikSchema";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";

const DueDiligenceEntity = () => {
  const uuid = GET_QUERY("uuid");
  const [companyOptions, setCompanyOptions] = useState([]);
  const [interactiontypeOptions, setInteractionTypesOptions] = useState([]);
  const [meetingTypeOptions, setMeetingTypeOptions] = useState([]);
  const [diligenceQuestions, setDiligenceQuestions] = useState([]);
  const [stakeHolderOptions, setStakeHolderOptions] = useState([]);
  const [contactOptions, setContactOptions] = useState([]);
  const [isAddQuestionTemplateVisible, setIsAddQuestionTemplateVisible] = useState(false);
  const [diligenceCustomQuestion, setDiligenceCustomQuestion] = useState("");

  const formik = useFormik({
    initialValues: getDiligenceSchema(),
    validationSchema: getDiligenceValidations(),
    onSubmit: (values) => handleSubmitDiligence(values),
  });
  const { errors, touched, setFieldValue, handleSubmit, handleChange, values: formikValue } = formik;

  useEffect(() => {
    getCompanyOptions();
    getInteractionTypeOptions();
    getMeetingTypeOptions();
  }, []);

  useEffect(() => {
    getContactDetails();
  }, [formikValue["company"].value]);

  useEffect(() => {
    getDiligenceQustions();
  }, [formikValue["interactionType"].value]);

  const getCompanyOptions = () => {
    HTTP_CLIENT(APIFY("/v1/companies"), {
      params: "",
    })
      .then((data) => {
        const { companies } = data;
        const options = [];
        companies.forEach(({ uuid, name }) => {
          options.push({ label: name, value: uuid });
        });
        setCompanyOptions([...options]);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const getInteractionTypeOptions = () => {
    HTTP_CLIENT(APIFY("/v1/interaction_type"), { params: "" })
      .then((data) => {
        const { interaction_type } = data;
        const options = [];
        interaction_type.forEach(({ uuid, name }) => {
          options.push({ label: name, value: uuid });
        });
        setInteractionTypesOptions([...options]);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const getMeetingTypeOptions = () => {
    HTTP_CLIENT(APIFY("/v1/master"), {
      group: "meeting_type",
    })
      .then((data) => {
        const { masters } = data;
        const options = [];
        masters.forEach(({ uuid, name }) => {
          options.push({ label: name, value: uuid });
        });
        setMeetingTypeOptions([...options]);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const getContactDetails = () => {
    HTTP_CLIENT(APIFY("/v1/companies/view_contact_details"), {
      company_uuid: formikValue.company.value,
    })
      .then((data) => {
        const { contact_details } = data;
        const options = [];
        // if (formikValue.selectedInteractionType.label !== "Banker" && formikValue.selectedInteractionType.label !== "Auditor" && formikValue.selectedInteractionType.label !== "IPA Trustee") {
        contact_details?.forEach(({ name, email }) => {
          options.push({ value: name + ` (${email})`, label: name + ` (${email})` });
        });
        setContactOptions([...options]);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const getDiligenceQustions = () => {
    HTTP_CLIENT(APIFY("/v1/interactions/view_questions"), {
      params: { interaction_type_uuid: formikValue.interactionType.value },
    })
      .then((data) => {
        const { interaction_questions } = data;
        interaction_questions.forEach(({ question }) => question.name.length > 1 && question.name.flat(100));
        setDiligenceQuestions([...interaction_questions]);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleSubmitDiligence = (data) => {};

  const handleSetFormikValues = (key, options) => {
    setFieldValue(key, options);
  };
  
  const handleAddDiligenceCustomQuestion = () => {
    function generate_uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
        function(c) {
           const uuid = Math.random() * 16 | 0, v = c == 'x' ? uuid : (uuid & 0x3 | 0x8);
           return uuid.toString(16);
        });
     }
    const oldDiligenceQuestions = JSON.parse(JSON.stringify(diligenceQuestions));
    oldDiligenceQuestions.push(Object.assign({},{
        question:{
            name:[diligenceCustomQuestion],
            uuid:generate_uuidv4(),
        }
    }))
    setDiligenceQuestions([...oldDiligenceQuestions]);
    setIsAddQuestionTemplateVisible(false);
    setDiligenceCustomQuestion("");
  }

  const renderInteractionTypesComponent = () => {
    switch (formikValue["interactionType"].label) {
      case "Banker":
        return (
          <>
            <Grid item xs={6}>
              <Box display={"flex"} justifyContent={"space-evenly"} alignItems={"center"} gap="20px">
                <Typography fontSize={"14px"} width={"20%"}>
                  Branch *
                </Typography>
                <Box width={"60%"}>
                  <TextField
                    placeholder="Phone"
                    onChange={handleChange}
                    value={formikValue["phone"]}
                    name="phone"
                    sx={{
                      ".MuiOutlinedInput-root": {
                        borderRadius: "4px !important",
                      },
                      "&>div>input": {
                        width: "100% !important",
                      },
                    }}
                    fullWidth
                  />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box display={"flex"} justifyContent={"space-evenly"} alignItems={"center"} gap="20px">
                <Typography fontSize={"14px"} width={"20%"}>
                  Bank Name *
                </Typography>
                <Box width={"60%"}>
                  <Select options={[]} />
                </Box>
              </Box>
            </Grid>
          </>
        );
      case "Auditor":
        return (
          <Grid item xs={6}>
            <Box display={"flex"} justifyContent={"space-evenly"} alignItems={"center"} gap="20px">
              <Typography fontSize={"14px"} width={"20%"}>
                Auditor *
              </Typography>
              <Box width={"60%"}>
                <Select options={[]} />
              </Box>
            </Box>
          </Grid>
        );
      case "IPA Trustee":
        return (
          <Grid item xs={6}>
            <Box display={"flex"} justifyContent={"space-evenly"} alignItems={"center"} gap="20px">
              <Typography fontSize={"14px"} width={"20%"}>
                Trust Name *
              </Typography>
              <Box width={"60%"}>
                <Select options={[]} />
              </Box>
            </Box>
          </Grid>
        );
      case "Plant Visit":
        return (
          <Grid item xs={6}>
            <Box display={"flex"} justifyContent={"space-evenly"} alignItems={"center"} gap="20px">
              <Typography fontSize={"14px"} width={"20%"}>
                Plant Visit *
              </Typography>
              <Box width={"60%"}>
                <TextField
                  placeholder=""
                  sx={{
                    ".MuiOutlinedInput-root": {
                      borderRadius: "4px !important",
                    },
                    "&>div>input": {
                      width: "100% !important",
                    },
                  }}
                  fullWidth
                />
              </Box>
            </Box>
          </Grid>
        );
      default:
        null;
    }
  };
  

  return (
    <DashboardLayout>
      <CardWrapper
        headerTitle={`Due Diligence Create`}
        headerActionButton={() => {
          return (
            <>
              <HasPermissionButton color="primary" permissions={["/dashboard/due-diligence/history"]} route={GET_ROUTE_NAME("LIST_DILIGENCE")} text={`Back to Due Diligence History`} icon={<ArrowBackRounded />} />
            </>
          );
        }}
      >
        <form onSubmit={handleSubmit}>
          <Box
            sx={{
              px: "2rem",
              display: "flex",
              flexDirection: "column",
              overflow: "auto",
              height: "calc(100vh - 30vh)",
            }}
          >
            <Grid container spacing={"20"}>
              <Grid item xs={6}>
                <Box display={"flex"} justifyContent={"space-evenly"} alignItems={"center"} gap="20px">
                  <Typography fontSize={"14px"} width={"20%"}>
                    Company *
                  </Typography>
                  <Box width={"60%"}>
                    <Select options={companyOptions} value={formikValue["company"]} onChange={(value) => handleSetFormikValues("company", value)} />
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box display={"flex"} justifyContent={"space-evenly"} alignItems={"center"} gap="20px">
                  <Typography fontSize={"14px"} width={"20%"}>
                    Date & Time *
                  </Typography>
                  <Box width={"60%"}>
                    <LocalizationProvider dateAdapter={AdapterMoment}>
                      <DateTimePicker
                        disableFuture
                        inputFormat="MM/DD/YYYY h:m a"
                        className={"date-picker-width"}
                        name="interactionDateTime"
                        value={formikValue["interactionDateTime"]}
                        onChange={(value) => handleSetFormikValues("interactionDateTime", value)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            sx={{
                              ".MuiOutlinedInput-root": {
                                paddingLeft: "0px",
                                borderRadius: "4px !important",
                                display: "flex",
                                justifyContent: "space-between !important",
                              },
                            }}
                          />
                        )}
                      />
                    </LocalizationProvider>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={6}>
                <Box display={"flex"} justifyContent={"space-evenly"} alignItems={"center"} gap="20px">
                  <Typography fontSize={"14px"} width={"20%"}>
                    Interaction *
                  </Typography>
                  <Box width={"60%"}>
                    <Select options={interactiontypeOptions} value={formikValue["interactionType"]} onChange={(value) => handleSetFormikValues("interactionType", value)} />
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box display={"flex"} justifyContent={"space-evenly"} alignItems={"center"} gap="20px">
                  <Typography fontSize={"14px"} width={"20%"}>
                    Phone *
                  </Typography>
                  <Box width={"60%"}>
                    <TextField
                      placeholder="Phone"
                      onChange={handleChange}
                      value={formikValue["phone"]}
                      name="phone"
                      sx={{
                        ".MuiOutlinedInput-root": {
                          borderRadius: "4px !important",
                        },
                        "&>div>input": {
                          width: "100% !important",
                        },
                      }}
                      fullWidth
                    />
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={6}>
                <Box display={"flex"} justifyContent={"space-evenly"} alignItems={"center"} gap="20px">
                  <Typography fontSize={"14px"} width={"20%"}>
                    Meeting Type *
                  </Typography>
                  <Box width={"60%"}>
                    <Select 
                     options={meetingTypeOptions} 
                     value={formikValue["meetingType"]} 
                     onChange={(value) => handleSetFormikValues("meetingType", value)} 
                    />
                  </Box>
                </Box>
              </Grid>

              {renderInteractionTypesComponent()}

              <Grid item xs={12}>
                <Box display={"flex"} justifyContent={"space-around"} alignItems={"center"}>
                  <Typography fontSize={"14px"} width={"auto"} ml={-1}>
                    Contact Person *
                  </Typography>
                  <Box width={"80%"}>
                    <Autocomplete
                      multiple
                      options={contactOptions}
                      renderInput={(params) => {
                        return <TextField multiline rows={2} sx={{ display: "flex", alignItems: "flex-start" }} {...params} variant="outlined" />;
                      }}
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>

            <hr
              style={{
                backgroundColor: "#e9e9e9",
                margin: "2.5rem 0",
                height: "0.8px",
              }}
            />
            {formikValue["interactionType"].value && (
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography sx={{ fontSize: "18px", fontWeight: "500", color: "#344767" }}>Question</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography sx={{ fontSize: "18px", fontWeight: "500", color: "#344767" }}>Auditor Response</Typography>
                </Grid>

                {diligenceQuestions.length &&
                  diligenceQuestions.map(({ question }, index) => {
                    return question.name.map((question) => {
                      return (
                        <Grid
                          item
                          xs={12}
                          key={question.uuid}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                            borderBottom: `${index < diligenceQuestions.length - 1 ? "1.8px solid" : "none"} `,
                            borderColor: "#e9e9e9",
                            padding: "2rem",
                          }}
                        >
                          <Box width={"60%"} display={"flex"}>
                            <Typography
                              sx={{
                                mr: "0.5rem",
                                color: "#4F4F52",
                                fontSize: "14px",
                              }}
                            >
                              Q{index + 1}.
                            </Typography>
                            <Typography fontSize={"14px"}>{question} *</Typography>
                          </Box>
                          <Box width={"33%"}>
                            <TextField
                              multiline
                              sx={{
                                width: "100% !important",
                              }}
                            ></TextField>
                          </Box>
                        </Grid>
                      );
                    });
                  })}

                {isAddQuestionTemplateVisible && (
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        border: "1px solid",
                        borderRadius: "4px",
                        display: "flex",
                        width: "100%",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        my: "1.4rem",
                        p: "1rem 0.6rem",
                      }}
                    >
                      <TextField
                        variant="outlined"
                        value={diligenceCustomQuestion}
                        autoComplete="off"
                        multiline
                        minRows={2}
                        placeholder="Enter your question"
                        onChange={(e) => setDiligenceCustomQuestion(e.target.value)}
                        sx={{ width: "70%" }}
                      />
                      <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                        <Button
                          sx={{
                            backgroundColor: "#3c5cd2",
                            color: "#ffffff",
                            borderRadius: "0.25rem",
                            padding: "0.4rem 0.8rem",
                            "&:hover": {
                              backgroundColor: "#3c5cd2",
                              color: "#ffffff",
                            },
                          }}
                          startIcon={<Add />}
                          onClick={handleAddDiligenceCustomQuestion}
                        >
                          Add
                        </Button>
                        <Button
                          sx={{
                            border: "1px solid #404040",
                            color: "#414141",
                            ml: "1rem",
                            padding: "0.4rem 0.8rem",
                            borderRadius: "0.25rem",
                            "&:hover": {
                              color: "#414141",
                            },
                          }}
                          onClick={() => setIsAddQuestionTemplateVisible(false)}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  </Grid>
                )}

                <Grid item xs={12} display={"flex"} justifyContent={"end"}>
                  <Button
                    variant={"contained"}
                    startIcon={<Add />}
                    onClick={() => setIsAddQuestionTemplateVisible(true)}
                    sx={{
                      marginRight: "33px",
                      color: "white !important",
                      backgroundColor: "#5e72e3",
                      ":hover": { backgroundColor: "#5466cc" },
                      ":active": { backgroundColor: "#5466cc" },
                      ":focus:not(:hover)": {
                        backgroundColor: "#5466cc",
                        boxShadow: "0rem 0rem 0rem 0.2rem #a2aef3",
                      },
                    }}
                  >
                    Add Question
                  </Button>
                </Grid>
              </Grid>
            )}

            <Grid container spacing={4} marginTop={"10px"}>
                <Grid item xs={12} display={"flex"} flexDirection={"column"} gap={"10px"}>
                <Typography sx={{ fontSize: "18px", fontWeight: "500", color: "#344767" }}>Upload Document</Typography>
                <label
                  style={{
                    cursor: "pointer",
                    border: "1px solid",
                    borderColor: "#999db3",
                    backgroundColor: "#f4f7ff",
                    display: "flex",
                    alignItems: "center",
                    padding: "0.6rem 1rem",
                    width: "fit-content",
                    borderRadius: "0.5rem",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    marginRight:"33px"
                  }}
                >
                  <input accept="application/pdf" type="file" />
                  <UploadFileIcon sx={{ mr: "0.4rem" }} />
                  Upload
                </label>
                </Grid>
 

              <Grid item xs={12} display={"flex"} flexDirection={"column"} gap={"10px"}>
                <Typography sx={{ fontSize: "18px", fontWeight: "500", color: "#344767" }}>Remarks</Typography>
                <TextField multiline minRows="2" placeholder="Remark" name="remark" />
              </Grid>

              <Grid item xs={12} display={"flex"} flexDirection={"column"} gap={"10px"}>
                <Typography sx={{ fontSize: "18px", fontWeight: "500", color: "#344767" }}>Emails *</Typography>
                <Autocomplete
                  multiple
                  options={[]}
                  renderInput={(params) => {
                    return <TextField multiline rows={2} sx={{ display: "flex", alignItems: "flex-start" }} {...params} variant="outlined" />;
                  }}
                />
              </Grid>

              <Grid item xs={12} display="flex" justifyContent={"end"}>
                <Box display={"flex"} gap="10px" marginRight={"29px"}>
                  <Button
                    variant={"contained"}
                    disabled={true}
                    sx={{
                      marginRight: "30px",
                      color: "white !important",
                      backgroundColor: "#5e72e3",
                      ":hover": { backgroundColor: "#5466cc" },
                      ":active": { backgroundColor: "#5466cc" },
                      ":focus:not(:hover)": {
                        backgroundColor: "#5466cc",
                        boxShadow: "0rem 0rem 0rem 0.2rem #a2aef3",
                      },
                    }}
                  >
                    Send MOM
                  </Button>
                  <Button
                    variant="contained"
                    sx={{
                      color: "white !important",
                      backgroundColor: "#2dce8a",
                      ":hover": { backgroundColor: "#56d7a1" },
                      ":active": { backgroundColor: "#56d7a1" },
                      ":focus:not(:hover)": {
                        backgroundColor: "#56d7a1",
                        color: "white !important",
                        boxShadow: "0rem 0rem 0rem 0.2rem #56d7a1",
                      },
                    }}
                  >
                    Submit
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
          {/* <ArgonSnackbar
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
          /> */}
        </form>
      </CardWrapper>
    </DashboardLayout>
  );
};

export default DueDiligenceEntity;
