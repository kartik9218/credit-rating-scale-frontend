import React from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";
import { Button } from "@mui/material";
import MuiAccordion from "@mui/material/Accordion";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import { Add, Delete } from "@mui/icons-material";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import { ArgonTypography, ArgonBox, ArgonButton } from "components/ArgonTheme";
import { HTTP_CLIENT, APIFY } from "helpers/Api";
import ChildAccordion from "./ChildAccordion";

const Accordion = styled((props) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  "&:not(:last-child)": {
    borderBottom: 0,
  },
  "&:before": {
    display: "none",
  },
}));

const AccordionSummary = styled((props) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon color="white" sx={{ fontSize: "0.9rem" }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark" ? "rgba(255, 255, 255, .05)" : "rgba(0, 0, 0, .03)",
  flexDirection: "row-reverse",
  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
    transform: "rotate(90deg)",
  },
  "& .MuiAccordionSummary-content": {
    marginLeft: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
}));

function ConfiguratorTreeView(props) {
  const [expanded, setExpanded] = React.useState("");
  const { fectors, factorChange, getFactors, AddNewQuestion, setResponse, setSnackbarOpen, setMsg, selectedModal, onChangeModel, notchingMaster } = props;
  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  const deleteFactor = (question) => {
    var confirmDelete = confirm("Are you sure you want to delete this question?");
    if (confirmDelete) {
      let data = {
        uuid: question.uuid,
        question: question.question,
        coefficient: question.coefficient,
        max_score: question.max_score
      };
      HTTP_CLIENT(APIFY("/v1/rating_models/edit_risk_type_factors"), { params: data })
        .then((response) => {

          setResponse("success");
          setMsg("Factor Deleted successfully");
          setSnackbarOpen(true);

          onChangeModel(selectedModal)
          return;
        });
    } else {
      return false;
    }
  }

  return (
    <>
      <ArgonBox container pr={2} py={2}>
        <ArgonTypography variant="h5" marginBottom="1rem">
          Factor
        </ArgonTypography>
        {fectors.map((fector, riskKey) => {
          return <>
            {fector.name === "Notching" ?
              <Accordion
                className="factor-tab-summary"
                expanded={expanded === `panel${riskKey + 1}`}
                onChange={handleChange(`panel${riskKey + 1}`)}
                key={riskKey + 1}
              >
                <AccordionSummary
                  className="factor-tab-summary-inner"
                  aria-controls={`panel${riskKey + 1}d-content`}
                  id={`panel${riskKey + 1}d-header`}
                >
                  <ArgonTypography>{fector.name}</ArgonTypography>
                </AccordionSummary>
                <AccordionDetails className="factor-tab-summary-inner-detail">
                  <ChildAccordion notchingMaster={notchingMaster} notchingProps={props} />
                </AccordionDetails>
              </Accordion>
              :
              <Accordion
                className="factor-tab-summary"
                expanded={expanded === `panel${riskKey + 1}`}
                onChange={handleChange(`panel${riskKey + 1}`)}
                key={riskKey + 1}
              >
                <AccordionSummary
                  className="factor-tab-summary-inner"
                  aria-controls={`panel${riskKey + 1}d-content`}
                  id={`panel${riskKey + 1}d-header`}
                >
                  <ArgonTypography>{fector.name}</ArgonTypography>
                </AccordionSummary>
                <AccordionDetails className="factor-tab-summary-inner-detail">
                  {fector?.factors && fector.factors.length > 0 && fector.factors.map((questions, key) => {
                    return (
                      <>
                        <ArgonBox
                          container
                          pr={0.5}
                          py={0.5}
                          display="flex"
                          alignItems="center"
                          flexDirection="row"
                          justifyContent="space-between"
                          key={key + 1}
                        >
                          <Button onClick={() => factorChange(questions.uuid, { label: fector.name, value: fector.uuid })} key={key} sx={{ padding: "0", margin: "0", minWidth: "0", width: "95%" }}>
                            <ArgonTypography sx={{ textAlign: "left", marginBottom: "10px", marginLeft: "0", width: "100%" }}>{key + 1 + ". "} {questions.question}</ArgonTypography>
                          </Button>
                          <Button onClick={() => deleteFactor(questions)}>
                            <Delete title="Remove" color="disabled" />
                          </Button>
                        </ArgonBox>
                      </>
                    );
                  })}
                </AccordionDetails>
                <ArgonButton
                  color="success"
                  sx={{ padding: "12px", minWidth: "0", marginLeft: "15px", float: "right" }}
                  onClick={() => { AddNewQuestion(); getFactors({ label: fector.name, value: fector.uuid }) }}
                >
                  <Add /> Add Question
                </ArgonButton>
              </Accordion>
            }
          </>;
        })}
      </ArgonBox>
    </>
  );
}

ConfiguratorTreeView.propTypes = {
  factorChange: PropTypes.any.isRequired,
  AddNewQuestion: PropTypes.any.isRequired,
  fectors: PropTypes.any.isRequired,
  getFactors: PropTypes.any.isRequired,
  setResponse: PropTypes.any.isRequired,
  setSnackbarOpen: PropTypes.any.isRequired,
  setMsg: PropTypes.any.isRequired,
  onChangeModel: PropTypes.any.isRequired,
  selectedModal: PropTypes.any.isRequired,
  notchingMaster: PropTypes.any,
};

export default ConfiguratorTreeView;
