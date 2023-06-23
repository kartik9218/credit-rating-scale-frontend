import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Box, Grid, Stack } from "@mui/material";
import { AddBox, Edit, Visibility } from "@mui/icons-material";
import { DataGrid, GridToolbar, GridToolbarContainer } from "@mui/x-data-grid";
import PropTypes from "prop-types";
import { DashboardLayout } from "layouts";
import { SET_PAGE_TITLE, GET_ROUTE_NAME, FORMATE_NUMBER, FORMATE_DATE, FORMATE_USER_NAME, GET_QUERY } from "helpers/Base";
import { APIFY, HTTP_CLIENT } from "helpers/Api";
import { ArgonBox, ArgonTypography, ArgonSnackbar } from "components/ArgonTheme";
import HasPermissionButton from "slots/Custom/Buttons/HasPermissionButton";
import CardWrapper from "slots/Cards/CardWrapper";
import Select from "react-select";
import ArgonBadge from "components/ArgonBadge";

const CustomToolbar = ({ setFilterButtonEl }) => {
  return (
    <GridToolbarContainer sx={{ width: "50%", marginLeft: "auto" }}>
      <GridToolbar ref={setFilterButtonEl} className="data-grid-tools" />
    </GridToolbarContainer>
  );
};

CustomToolbar.propTypes = {
  setFilterButtonEl: PropTypes.func.isRequired,
};
function CompanyMandate() {
  var { state } = useLocation();
  const company_uuid = GET_QUERY("company-uuid");
  const [showMsg, setShowMsg] = useState(false);
  const [rows, setRows] = useState([]);
  const [Companies, setCompanies] = useState([{ label: "Select Company", value: "" }]);

  const [filterButtonEl, setFilterButtonEl] = useState(null);
  const [snackbarParams, setSnackbarParams] = useState({
    success: false,
    type: "",
    company: {},
  });

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [CompanyName, setCompanyName] = useState("");
  const columns = [
    {
      field: "mandate_id", headerName: "Mandate Id",
      width: 200,
    },
    {
      field: "business_developer",
      headerName: "Business Developer",
      width: 200,
      renderCell: (row) => {
        return <>{row.value?.full_name + " (" + row.value?.employee_code + ")"}</>;
      },
    },
    { field: "mandate_source", headerName: "Source" },
    { field: "mandate_type", headerName: "Type" },
    {
      field: "total_size",
      headerName: "Total Size (in Cr.)",
      align: "center",
      width: 150,
      renderCell: (row) => {
        return <>{FORMATE_NUMBER(row.value)}</>;
      },
    },
    {
      field: "bases_point",
      headerName: "Base Point (in %)",
      align: "center",
      renderCell: (row) => {
        return <>{FORMATE_NUMBER(row.value)}</>;
      },
    },
    {
      field: "rating_head",
      headerName: "Rating Head",
      width: 200,
      renderCell: (row) => {
        return <>{FORMATE_USER_NAME(row.value)}</>;
      },
    },
    {
      field: "mandate_date",
      headerName: "Mandate Date ",
      renderCell: (row) => {
        return <>{FORMATE_DATE(row.value)}</>;
      },
    },
    {
      field: "received_date",
      headerName: "Received Date",
      renderCell: (row) => {
        return <>{FORMATE_DATE(row.value)}</>;
      },
    },
    {
      field: "branch_office",
      headerName: "Branch Office",
      width: 250,
      renderCell: (row) => {
        return <>{row.value?.name}</>;
      },
    },
    {
      field: "is_active",
      headerName: "Status",
      renderCell: (row) => {
        return (
          <>
            {row.value ? (
              <>
                <ArgonBadge badgeContent="Active" color="success" container />
              </>
            ) : (
              <>
                <ArgonBadge badgeContent="Inactive" color="error" container />
              </>
            )}
          </>
        );
      },
    },
    {
      field: "remark", headerName: "Remark", width: 150, renderCell: (row) => {
        return (
          <>
            {row.row.is_active ? "" : row.value}
          </>
        );
      },
    },
    {
      field: "uuid",
      headerName: "Action",
      align: "right",
      sortable: false,
      width: 200,
      renderCell: (row) => {
        return (
          <>
            <ArgonBox display="flex" flexDirection="row" justifyContent="flex-end">
              <HasPermissionButton color="primary" permissions={["/dashboard/company/mandate/view"]} route={GET_ROUTE_NAME("VIEW_MANDATE", { uuid: row.value, company_uuid: selectedCompany?.value || company_uuid })} text={``} icon={<Visibility />} />
              {!row.row.is_verified &&
                <HasPermissionButton color="primary" permissions={["/dashboard/company/mandate/edit"]} route={GET_ROUTE_NAME("EDIT_MANDATE", { uuid: row.value, company_uuid: selectedCompany?.value || company_uuid })} text={``} icon={<Edit />} />
              }
            </ArgonBox>
          </>
        );
      },
    },
  ];
  const fetchMandates = (opt) => {
    if (opt.value) {
      HTTP_CLIENT(APIFY("/v1/companies/view_mandates"), {
        company_uuid: opt.value,
      }).then((data) => {
        setRows(data["mandates"]);
        if (data["mandates"].length === 0) {
          setShowMsg(true);
        } else {
          setShowMsg(false);
        }
      });
    }else{
      setRows([]);
    }
    setCompanyName(opt.label);
    setSelectedCompany(opt);
  };

  const fetchData = () => {
    HTTP_CLIENT(APIFY("/v1/companies"), {}).then((data) => {
      let result = data.companies.map((company) => {
        if (company_uuid !== undefined && company.uuid === company_uuid) {
          fetchMandates({
            label: company.name,
            value: company.uuid,
          })
        }
        return {
          label: company.name,
          value: company.uuid,
        };
      });
      setCompanies([...Companies, ...result]);
    });
  };

  const handleSuccessState = () => {
    const { success, type, company } = state;

    setSnackbarParams({
      success: success,
      type: type
    });
    state = null;
  };

  useEffect(() => {
    fetchData();
  }, [company_uuid])

  useEffect(() => {
    SET_PAGE_TITLE("Mandates");

    let isSubscribed = true;
    if (isSubscribed) {
      fetchData();
      if (state) {
        handleSuccessState();
      }
    }
    return () => {
      isSubscribed = false;
    };
  }, []);

  const onCloseSnackbar = () => {
    setSnackbarParams({
      success: false,
      type: "",
    });
  };

  return (
    <>
      <DashboardLayout breadcrumbTitle="Mandate">
        <CardWrapper
          headerTitle={"Mandates"}
          headerActionButton={() => {
            return <HasPermissionButton color="primary" route={GET_ROUTE_NAME("ADD_MANDATE", { company_uuid: selectedCompany?.value || '' })} permissions={["/dashboard/company/mandate/create"]} text={`Add New Mandate`} icon={<AddBox />} />;
          }}
        >
          <Box sx={{ margin: "-25px 20px 20px 15px" }}>
            <Grid item xs={12} sm={4}>
              <ArgonBox mb={1} lineHeight={0} display="inline-block">
                <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
                  Select Company to view respective mandates
                </ArgonTypography>
              </ArgonBox>

              <Select sx={{ width: "100%", borderRadius: "10px" }} placeholder="Select Company" value={selectedCompany} options={Companies} onChange={fetchMandates} required />
            </Grid>
            <Grid sx={{ height: "500px", width: "100%" }} item padding="10px">
              <DataGrid
                rows={rows}
                columns={columns}
                className={"datagrid-font"}
                components={{
                  Toolbar: CustomToolbar,
                  NoRowsOverlay: () => (
                    <Stack height="100%" alignItems="center" justifyContent="center">
                      Please Select Company to Get Mandates.
                    </Stack>
                  ),
                }}
                pageSize={10}
                rowsPerPageOptions={[10]}
                componentsProps={{
                  panel: {
                    anchorEl: filterButtonEl,
                  },
                  toolbar: {
                    setFilterButtonEl,
                  },
                }}
              />
            </Grid>

            <ArgonSnackbar
              color={"success"}
              title={snackbarParams.type === "CREATE" ? "Mandate Created Successfully" : snackbarParams.type === "UPDATE" ? "Mandate Updated Successfully" : ""}
              content=""
              translate="yes"
              dateTime=""
              open={snackbarParams.success}
              close={onCloseSnackbar}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
            />
          </Box>
        </CardWrapper>
      </DashboardLayout>
    </>
  );
}
export default CompanyMandate;
