import React, { useState } from "react";
import { DashboardLayout } from "layouts";
import { ArgonBox } from "components/ArgonTheme";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CardWrapper from "slots/Cards/CardWrapper";
import { DataGrid } from "@mui/x-data-grid";
import ArgonSelect from "components/ArgonSelect";
import { ArgonTypography } from "components/ArgonTheme";
import Select from "react-select";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  Input,
  Modal,
  Switch,
} from "@mui/material";
import ArgonBadge from "components/ArgonBadge";
import DataTable from "slots/Tables/DataTable";
import {
  FilterAltOutlined,
  CloseOutlined,
  EditOutlined,
  VisibilityOutlined,
  ErrorOutlined,
  CabinOutlined,
  ArrowBackRounded,
  RotateLeftOutlined,
} from "@mui/icons-material";
import { ArgonButton } from "components/ArgonTheme";
import { GET_ROUTE_NAME } from "helpers/Base";
import { useNavigate } from "react-router-dom";
import { GET_QUERY } from "helpers/Base";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const WorkflowView = () => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const MySwal = withReactContent(Swal);

  const [rows, setRows] = useState([
    {
      activity_id: "W01_2023_04_005",
      description: "Assigned mandate to Rating Head",
      performed_by: "BD_Rakul@infomerics.com",
      assigned_by: "system",
      case_type: "Initial",
      status: "Completed",
      created_at:"",
      uuid:"893-3248-2348"
    },
  ]);

  const handleSetFormikValues = () => {};

  const handleDialogBoxState = () => setIsDialogOpen((prev) => !prev);

  const Columns = [
    {
      accessor: "activity_id",
      Header: "Activity ID",
    },
    {
      accessor: "description",
      Header: "Description",
    },
    {
      accessor: "performed_by",
      Header: "Performed By",
    },
    {
      accessor: "assigned_by",
      Header: "Assigned By",
    },
    {
      accessor: "status",
      Header: "Status",
      Cell: (row) => (
        <ArgonBadge
          badgeContent={row.cell.value}
          color={row.cell.value === "Completed" ? "success" : "error"}
        />
      ),
    },
    {
        accessor: "created_at", //created At
        Header:"Created At",
    },
    {
      accessor: "uuid",
      Header: "Action",
      Cell: (row) => {
        
        return (
          <Box display={"flex"} gap={"4px"}>
            <ArgonButton 
              size={"small"} 
              variant={"contained"} 
              color={"primary"}
              >
              <CabinOutlined/> 
              <ArgonBox marginX={"4px"}/>
               Log
            </ArgonButton>
            <ArgonButton 
              size={"small"} 
              variant={"contained"} 
              color={"primary"}
              padding={"0px !important"}
              onClick={handleDialogBoxState}
              >
              <RotateLeftOutlined/> 
              <ArgonBox marginX={"4px"}/>
               Revoke
            </ArgonButton>
          </Box>
        );
      },
    },
  ];

  return (
    <DashboardLayout>
      <CardWrapper
        headerTitle={GET_QUERY("uuid")}
        headerSubtitle="Workflow Instances"
        headerActionButton={() => {
          return (
            <Box display={"flex"} gap={"10px"}>
            <ArgonButton 
            variant={"contained"}  
            color="primary"
            onClick={() =>{}}
           >
             View At Camunda
           </ArgonButton>
           <ArgonButton 
            variant={"contained"}  
            color="primary"
            onClick={() => navigate("/dashboard/workflow-management/workflow-maintenance")}
           >
            <ArrowBackRounded />
             <Box marginX={"5px"}/>
             Back
           </ArgonButton>
           </Box>
          );
        }}
      >
        <ArgonBox
          sx={{
            background: "white !important",
            height: "calc(100vh - 17vh)",
            borderRadius: "20px",
            padding: "10px",
          }}
        >
          <ArgonBox padding="10px">
            <DataTable
              table={{
                columns: Columns,
                rows: rows,
              }}
              canSearch={false}
              entriesPerPage={false}
            />
          </ArgonBox>
        </ArgonBox>
      </CardWrapper>
      <Dialog open={isDialogOpen} onClose={handleDialogBoxState}>
      {/* <DialogTitle sx={{textAlign:"center"}}>
      </DialogTitle> */}
        <DialogContent>
          <DialogContentText sx={{display:"flex", alignItems:"center"}}>
          <ErrorOutlined sx={{marginRight:"9px", color:"tomato"}}/>  Are You sure you want to perform this action ? 
          </DialogContentText>
          </DialogContent>
          <DialogActions>
          <Button onClick={handleDialogBoxState}>Cancel</Button>
          <Button onClick={handleDialogBoxState}>Ok</Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default WorkflowView;
