import { AddBox } from "@mui/icons-material";
import { Autocomplete, Box, Button, ButtonGroup, Grid, Stack, TextField, Typography } from "@mui/material";
import DashboardLayout from "layouts/DashboardLayout";
import React, { useEffect, useState } from "react";
import CardWrapper from "slots/Cards/CardWrapper";
import HasPermissionButton from "slots/Custom/Buttons/HasPermissionButton";
import { GET_ROUTE_NAME } from "helpers/Base";
import { DataGrid } from "@mui/x-data-grid";
import { HTTP_CLIENT } from "helpers/Api";
import { APIFY } from "helpers/Api";
import { SET_PAGE_TITLE } from "helpers/Base";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";
import { useNavigate } from "react-router-dom";

const defaultCol = [
  {
    field: "created_at",
    headerName: "Initiated on",
    width: 220,
    renderCell: (params) => {
      return <label>{params.row.time_of_interaction?.substr(0, 10)}</label>;
    },
    flex: 1,
  },
  {
    field: "time_of_interaction",
    headerName: "Time",
    width: 220,
    renderCell: (params) => {
      return (
        <>
          <label>
            {params.row.time_of_interaction &&
              new Date(params.row.time_of_interaction).toLocaleString("en-US", {
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              })}
          </label>
        </>
      );
    },
    flex: 1,
  },

  {
    field: "contact_person",
    headerName: "Contact Person",
    width: 500,
    flex: 1,
    renderCell: (params) => {
      return (
        <div>
          {params.row.contact_person &&
            JSON.parse(params.row.contact_person).map((val, idx) => {
              if (idx === 0) return <label key={"cp" + idx}>{val} </label>;
              else return <label key={"cp" + idx}>,{val} </label>;
            })}
        </div>
      );
    },
    flex: 1,
  },
  {
    field: "status",
    headerName: "Status",
    width: 220,
    flex: 1,
  },
  {
    field: "action",
    headerName: "Action",
    width: 160,
    flex: 1,
    renderCell: (cell) => {
      return (
        <>
          {/* <HasPermissionButton color="primary" permissions={["/dashboard/due-diligence"]} route={GET_ROUTE_NAME("VIEW_DILIGENCE", { op: "view", uuid: cell.row.uuid })} text={`View`} icon={<RemoveRedEyeOutlinedIcon />} /> */}
          <HasPermissionButton color="green" 
           permissions={["/dashboard/due-diligence"]} 
           route={GET_ROUTE_NAME("EDIT_DILIGENCE", { op: "edit", uuid: cell.row.uuid })} 
           text={`Edit`} icon={<CreateOutlinedIcon />} 
        />
        </>
      );
    },
  },
];

const columns = {
  Banker: [...defaultCol],
  Auditor: [...defaultCol],
  IPATrustee: [...defaultCol],
};

const DueDiligenceHistory = () => {
  const [activeOption, setActiveOption] = useState({});
  const [gridRows, setGridRows] = useState([]);
  const [interactionTypes, setInteractionTypes] = useState([]);
  const [Companies, setCompanies] = useState([]);
  const [SelectedCompany, setSelectedCompany] = useState({});
  const [gridColumn, setGridColumn] = useState([...columns.Banker]);

  useEffect(() => {
    if (SelectedCompany.value?.length > 0 && activeOption.uuid?.length > 0) fetchDiligenceData();
  }, [SelectedCompany, activeOption]);

  useEffect(() => {
    SET_PAGE_TITLE("Diligence");
    fetchCompanyData();
    fetchInteractionTypes();
  }, []);

  const fetchCompanyData = () => {
    HTTP_CLIENT(APIFY("/v1/companies"), {}).then((data) => {
      const companyList = data.companies.map((company) => {
        return {
          label: company.name,
          value: company.uuid,
          industry: company.company_industry,
          subIndustry: company.company_sub_industry,
        };
      });
      setCompanies([...companyList]);
    });
  };

  const fetchDiligenceData = () => {
    HTTP_CLIENT(APIFY("/v1/due_diligences/view"), {
      params: {
        interaction_type_uuid: activeOption.uuid,
        company_uuid: SelectedCompany.value,
      },
    })
      .then((data) => {
        let { due_diligence } = data;
        if (due_diligence == null) {
          setGridRows([]);
          return;
        }
        due_diligence = due_diligence.map((val, idx) => {
          val.id = idx + 1;
          val.companyName = val.company.name;
          return val;
        });
        setGridRows([...due_diligence]);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchInteractionTypes = () => {
    HTTP_CLIENT(APIFY("/v1/interaction_type"), { params: {} }).then((data) => {
      const { interaction_type } = data;
      const myarr = [];
      interaction_type.map((item) => {
        const { uuid, name } = item;
        myarr.push({ uuid, name });
      });
      setInteractionTypes([...myarr]);
      setActiveOption(myarr[0]);
    });
  };

  return (
    <>
      <DashboardLayout>
        <CardWrapper
          headerTitle="Due Diligence History"
          headerActionButton={() => {
            return <HasPermissionButton color="primary" permissions={["/dashboard/due-diligence/create"]} route={GET_ROUTE_NAME("ADD_DILIGENCE")} text={`Add`} icon={<AddBox />} />;
          }}
        >
          <Box>
            <Grid container width="50%" alignItems="center" pl="2rem">
              <Grid item xs={3}>
                <Typography component="label" variant="caption" sx={{ fontSize: "14px" }}>
                  Select Company
                </Typography>
              </Grid>
              <Grid item xs={7}>
                <Autocomplete
                  disablePortal
                  disableClearable
                  options={Companies}
                  onChange={(e, value) => {
                    setSelectedCompany({ ...value });
                  }}
                  renderInput={(params) => <TextField {...params} placeholder="Select Company" />}
                />
              </Grid>
            </Grid>
          </Box>
          <Box
            sx={{
              justifyContent: "space-around",
              display: "flex",
              height: "fit-content",
              padding: "11px",
              overflowX: "auto",
              flexWrap: "wrap",
            }}
          >
            {interactionTypes.map((val, key) => {
              return (
                <Box
                  id={key}
                  key={key}
                  onClick={(e) => {
                    if (columns[val.name.replace(" ", "")] == undefined) {
                      setGridColumn([...defaultCol]);
                    } else setGridColumn([...columns[val.name.replace(" ", "")]]);
                    setActiveOption(val);
                  }}
                  sx={{
                    cursor: "pointer",
                    backgroundColor: val.name == activeOption.name ? "#5e72e4" : "#ebebeb",
                    color: val.name == activeOption.name ? "white !important" : "dark-grey  !important",
                    fontWeight: "700",
                    fontSize: "14px",
                    width: "130px !important",
                    height: "33px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "5px",
                    margin: "10px",
                  }}
                >
                  {val.name}
                </Box>
              );
            })}
          </Box>
          <Box sx={{ height: 400, width: "95%", margin: "20px 30px" }} className="Diligence-data-grid">
            <DataGrid
              components={{
                NoRowsOverlay: () => (
                  <Stack height="100%" alignItems="center" justifyContent="center">
                    No due diligence to show. Create due diligence by clicking add button.
                  </Stack>
                ),
              }}
              sx={{ fontSize: "13px" }}
              getRowId={(row) => row.uuid}
              rows={gridRows}
              columns={gridColumn}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 10,
                  },
                },
              }}
              pageSizeOptions={[10]}
            />
          </Box>
        </CardWrapper>
      </DashboardLayout>
    </>
  );
};

export default DueDiligenceHistory;
