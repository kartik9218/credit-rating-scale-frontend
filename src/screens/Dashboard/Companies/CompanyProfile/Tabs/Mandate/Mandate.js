import React, { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { SET_PAGE_TITLE } from "helpers/Base";
import { ArgonBox } from "components/ArgonTheme";
import Table from "slots/Tables/Table";
import { ArgonTypography } from "components/ArgonTheme";
import HasPermissionButton from "slots/Custom/Buttons/HasPermissionButton";
import { GET_ROUTE_NAME } from "helpers/Base";
import { AddBox } from "@mui/icons-material";

function Mandate() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(!open);

  const Accordion = styled((props) => (
    <MuiAccordion disableGutters elevation={0} square {...props} />
  ))(({ theme }) => ({
    "&:not(:last-child)": {
      borderBottom: 0,
    },
    "&:before": {
      display: "none",
    },
  }));

  const AccordionSummary = styled((props) => (
    <MuiAccordionSummary
      expandIcon={
        expanded === "panel1" || expanded === "panel2" ? (
          <RemoveIcon sx={{ fontSize: "1.2rem" }} />
        ) : (
          <AddIcon sx={{ fontSize: "0.9rem" }} />
        )
      }
      {...props}
    />
  ))(({ theme }) => ({
    backgroundColor:
      theme.palette.mode === "light" ? "rgba(255, 255, 255, .05)" : "rgba(0, 0, 0, .03)",
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
    paddingLeft: theme.spacing(6),
  }));
  useEffect(() => {
    SET_PAGE_TITLE("Mandates");
  }, []);
  const [expanded, setExpanded] = React.useState("");

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };
  return (
    <ArgonBox>
      <ArgonBox display="Flex" flexDirection="row" justifyContent="space-between">
        <ArgonTypography fontWeight="bold" fontSize={16} marginTop="20px">
          Mandate Details
        </ArgonTypography>
      </ArgonBox>
      <Accordion expanded={expanded === "panel1"} onChange={handleChange("panel1")}>
        <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
          <Table
            columns={[
              { name: "Mandate ID", align: "left" },
              { name: "Category", align: "left" },
              { name: "Subcategory", align: "left" },
              { name: "Instrument", align: "center" },
              { name: "Size (in Cr)", align: "center" },
              { name: "Current Rating", align: "center" },
              { name: "Mandate Status", align: "center" },
            ]}

            rows={[
              {
                "Mandate ID": "2020-2021/1/1001",
                Category: "Long Term Instrument",
                Subcategory: "Debenture",
                Instrument: "Non Convertable Debenture",
                "Size (in Cr)": "1000",
                "Current Rating": "AAA",
                "Mandate Status": "Completed",
              },
            ]}
          />
        </AccordionSummary>
        <AccordionDetails>
          <Table
            columns={[
              { name: "Rating Cycle", align: "left" },
              { name: "Meeting Date", align: "left" },
              { name: "Rating", align: "left" },
              { name: "Outlook", align: "center" },
              { name: "Rating Acceptance", align: "center" },
              { name: "Date", align: "center" },
              { name: "Press Release", align: "center" },
              { name: "Action", align: "center" },
            ]}
            rows={[
              {
                "Rating Cycle": "Initial",
                "Meeting Date": "02-02-2021",
                Rating: "AA+",
                Outlook: "Stable",
                "Rating Acceptance": "Yes",
                Date: "04-02-2021",
                "Press Release": "05-02-2021",
                Action: "New",
              },
            ]}
          />
        </AccordionDetails>
      </Accordion>
      <Accordion expanded={expanded === "panel2"} onChange={handleChange("panel2")}>
        <AccordionSummary aria-controls="panel2d-content" id="panel2d-header">
          <Table
            columns={[
              { name: "Mandate ID", align: "left" },
              { name: "Category", align: "left" },
              { name: "Subcategory", align: "left" },
              { name: "Instrument", align: "center" },
              { name: "Size (in Cr)", align: "center" },
              { name: "Current Rating", align: "center" },
              { name: "Mandate Status", align: "center" },
            ]}
            rows={[
              {
                "Mandate ID": "2020-2021/1/1001",
                Category: "Long Term Instrument",
                Subcategory: "Debenture",
                Instrument: "Non Convertable Debenture",
                "Size (in Cr)": "1000",
                "Current Rating": "AAA",
                "Mandate Status": "Completed",
              },
            ]}
          />
        </AccordionSummary>
        <AccordionDetails>
          <Table
            columns={[
              { name: "Rating Cycle", align: "left" },
              { name: "Meeting Date", align: "left" },
              { name: "Rating", align: "left" },
              { name: "Outlook", align: "center" },
              { name: "Rating Acceptance", align: "center" },
              { name: "Date", align: "center" },
              { name: "Press Release", align: "center" },
              { name: "Action", align: "center" },
            ]}
            rows={[
              {
                "Rating Cycle": "Initial",
                "Meeting Date": "02-02-2021",
                Rating: "AA+",
                Outlook: "Stable",
                "Rating Acceptance": "Yes",
                Date: "04-02-2021",
                "Press Release": "05-02-2021",
                Action: "New",
              },
            ]}
          />
        </AccordionDetails>
      </Accordion>
    </ArgonBox>
  );
}
export default Mandate;
