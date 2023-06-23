import React, { useState } from "react";
import PropTypes from "prop-types";
import { Grid } from "@mui/material";
import Divider from "@mui/material/Divider";
import { ArgonBox } from "components/ArgonTheme";
import { ArgonTypography } from "components/ArgonTheme";
import moment from "moment";
import { DataGrid } from "@mui/x-data-grid";
import ArgonBadge from "components/ArgonBadge";
function Overview({ company }) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(!open);
  const companyInfoPrimary = [
    {
      key: "Address",
      value: "-",
    },
    {
      key: "Primary GST",
      value: company["gst"],
    },
    {
      key: "CIN",
      value: company["cin"],
    },
    {
      key: "PAN",
      value: company["pan"],
    },
    {
      key: "TAN",
      value: company["tan"],
    },
  ];

  const companyInfoSecondary = [
    {
      key: "Macro Economic Indicator",
      value: company["company_macro_economic_indicator"]?.name,
    },
    {
      key: "Sector",
      value: company["company_sector"]?.name,
    },
    {
      key: "Industry",
      value: company["company_industry"]?.name,
    },
    {
      key: "Sub Industry",
      value: company["company_sub_industry"]?.name,
    },
    {
      key: "Legal Status",
      value: company["legal_status"],
    },
    {
      key: "Group",
      value: company["group"] || "-",
    },
  ];

  const companyInfoTertiary = [
    {
      key: "Date of Incorporation",
      value: moment(company["date_of_incorporation"]).format("DD/MM/YYYY") || "-",
    },
    {
      key: "Controlling Office",
      value: company["controlling_office"],
    },
    {
      key: "Website",
      value: company["website"] || "-",
    },
    {
      key: "Former Name",
      value: company["former_name"] || "-",
    },
    {
      key: "SEZ",
      value: company["sez"] ? "Yes" : "No",
    },
  ];

  const contactDetailColumn = [
    { field: "name", headerName: "Contact Name", width: 280, headerClassName: "header-box" },
    { field: "email", headerName: "Email", width: 280, headerClassName: "header-box" },
    { field: "mobile", headerName: "Phone Number", width: 280, headerClassName: "header-box" },
    { field: "designation", headerName: "Designation", width: 280, headerClassName: "header-box", flex: 1 },
  ];

  const addressDetailColumn = [
    { field: "type", headerName: "Address Type", width: 180, headerClassName: "header-box" },
    { field: "address_1", headerName: "Address 1", width: 180, headerClassName: "header-box", valueGetter: (params) => params.value.name || "-" },
    { field: "address_2", headerName: "Address 2", width: 150, headerClassName: "header-box", valueGetter: (params) => params.value.name || "-" },
    { field: "landmark", headerName: "Landmark", width: 150, headerClassName: "header-box", valueGetter: (params) => params.value.name || "-" },
    { field: "pincode", headerName: "Pincode", width: 120, headerClassName: "header-box" },
    {
      field: "company_country",
      headerName: "Country",
      valueGetter: (params) => params.value.name,
      width: 130,
      headerClassName: "header-box",
    },
    {
      field: "company_state",
      headerName: "State",
      valueGetter: (params) => params.value.name,
      width: 160,
      headerClassName: "header-box",
    },
    {
      field: "company_city",
      headerName: "City",
      valueGetter: (params) => params.value.name,
      width: 160,
      headerClassName: "header-box",
      flex: 1,
    },
  ];

  const listingDetailColumn = [
    { field: "exchange", headerName: "Exchange Name", width: 280, headerClassName: "header-box" },
    { field: "scrip_code", headerName: "Scrip Code", width: 280, headerClassName: "header-box" },
    { field: "isin", headerName: "Isin", width: 280, headerClassName: "header-box" },
    {
      field: "listed_status",
      headerName: "Listing Status",
      width: 280,
      headerClassName: "header-box",
      flex: 1,
    },
  ];

  const directorDetailColumn = [
    { field: "name", headerName: "Director Name", width: 280, headerClassName: "header-box" },
    {
      field: "director_function",
      headerName: "Director Function",
      width: 280,
      headerClassName: "header-box",
    },
    { field: "position", headerName: "Position", width: 280, headerClassName: "header-box" },
    { field: "din", headerName: "Din", width: 280, headerClassName: "header-box", flex: 1 },
  ];

  const stakeholderColumn = [
    { field: "name", headerName: "Stakeholder Name", width: 200, headerClassName: "header-box" },
    { field: "type", headerName: "Stakeholder Type", width: 200, headerClassName: "header-box" },
    { field: "designation", headerName: "Designation", width: 200, headerClassName: "header-box" },
    { field: "mobile", headerName: "Mobile", width: 200, headerClassName: "header-box" },
    {
      field: "is_active",
      headerName: "Status",
      width: 200,
      headerClassName: "header-box",
      renderCell: ({ value }) => {
        return <ArgonBadge badgeContent={value ? "Active" : "InActive"} color={value ? "success" : "error"} container />;
      },
    },
    { field: "email", headerName: "Email", width: 200, headerClassName: "header-box" },
  ];

  return (
    <ArgonBox>
      <ArgonTypography fontWeight="bold" fontSize={18} marginTop="20px">
        Information
      </ArgonTypography>
      <ArgonTypography fontSize={14} fontWeight="regular" marginTop="20px">
        {company["description"]}
      </ArgonTypography>
      <Grid container marginTop="20px">
        <Grid item xs={4}>
          {companyInfoPrimary.map((value) => {
            return (
              <ArgonBox key={value.key} display="flex" flex-direction="row" alignItems="center" marginTop="10px">
                <ArgonBox width={"50%"}>
                  <ArgonTypography fontSize={14} fontWeight="bold">
                    {value.key}
                  </ArgonTypography>
                </ArgonBox>

                <ArgonBox
                  width={"50%"}
                  display="flex"
                  alignItems="flex-start"
                  marginLeft={"-20px"}
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  <ArgonTypography fontSize={14} fontWeight="regular">
                    {value.value}
                  </ArgonTypography>
                </ArgonBox>
              </ArgonBox>
            );
          })}
        </Grid>
        <Grid item xs={4}>
          {companyInfoSecondary.map((value, index) => {
            return (
              <ArgonBox key={index} display="flex" flex-direction="row" alignItems="flex-start" marginTop="10px">
                <ArgonBox width={"50%"}>
                  <ArgonTypography fontSize={14} fontWeight="bold">
                    {value.key}
                  </ArgonTypography>
                </ArgonBox>
                <ArgonBox
                  width={"50%"}
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  display="flex"
                  alignItems="flex-start"
                  marginLeft="15px"
                >
                  <ArgonTypography fontSize={14} fontWeight="regular" color="#7B809A">
                    {value.value}
                  </ArgonTypography>
                </ArgonBox>
              </ArgonBox>
            );
          })}
        </Grid>
        <Grid item xs={4}>
          {companyInfoTertiary.map((value, index) => {
            return (
              <ArgonBox key={index} display="flex" flex-direction="row" alignItems="flex-start" marginTop="10px">
                <ArgonBox width={"50%"}>
                  <ArgonTypography fontSize={14} fontWeight="bold" width="150px">
                    {value.key}
                  </ArgonTypography>
                </ArgonBox>
                <ArgonBox
                  width={"50%"}
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  display="flex"
                  alignItems="flex-start"
                  marginLeft="15px"
                >
                  <ArgonTypography fontSize={14} fontWeight="regular" color="#7B809A">
                    {value.value}
                  </ArgonTypography>
                </ArgonBox>
              </ArgonBox>
            );
          })}
        </Grid>
      </Grid>

      <Divider sx={{ fontWeight: "bold" }} />
      <ArgonBox display="Flex" flexDirection="row" justifyContent="space-between">
        <ArgonTypography fontWeight="bold" fontSize={18} marginTop="20px">
          Contact Details
        </ArgonTypography>
      </ArgonBox>
      <ArgonBox marginTop="20px">
        <div style={{ height: 300, width: "100%" }}>
          <DataGrid rows={company["contactdetails"]?.map((item) => Object.assign({}, { ...item, id: item.uuid }))} columns={contactDetailColumn} pageSize={4} headerHeight={45} rowsPerPageOptions={[5]} checkboxSelection={false} />
        </div>
      </ArgonBox>

      <Divider sx={{ fontWeight: "bold" }} />
      <ArgonBox display="Flex" flexDirection="row" justifyContent="space-between">
        <ArgonTypography fontWeight="bold" fontSize={18} marginTop="20px">
          {" "}
          Address Details
        </ArgonTypography>
      </ArgonBox>
      <ArgonBox marginTop="20px">
        <div style={{ height: 300, width: "100%" }}>
          <DataGrid rows={company["company_addresses"].map((item) => Object.assign({}, { ...item, id: item.uuid }))} columns={addressDetailColumn} headerHeight={45} pageSize={5} rowsPerPageOptions={[5]} checkboxSelection={false} />
        </div>
      </ArgonBox>

      <Divider sx={{ fontWeight: "bold" }} />
      <ArgonBox display="Flex" flexDirection="row" justifyContent="space-between">
        <ArgonTypography fontWeight="bold" fontSize={18} marginTop="20px">
          Listing Details
        </ArgonTypography>
      </ArgonBox>
      <ArgonBox marginTop="20px">
        <div style={{ height: 300, width: "100%" }}>
          <DataGrid rows={company["listingdetails"].map((item) => Object.assign({}, { ...item, id: item.uuid }))} columns={listingDetailColumn} headerHeight={45} pageSize={5} rowsPerPageOptions={[5]} checkboxSelection={false} />
        </div>
      </ArgonBox>

      <Divider sx={{ fontWeight: "bold" }} />
      <ArgonBox display="Flex" flexDirection="row" justifyContent="space-between">
        <ArgonTypography fontWeight="bold" fontSize={18} marginTop="20px">
          Board of Directors
        </ArgonTypography>
      </ArgonBox>
      <ArgonBox marginTop="20px">
        <div style={{ height: 300, width: "100%" }}>
          <DataGrid rows={company["boardofdirectors"].map((item) => Object.assign({}, { ...item, id: item.uuid }))} columns={directorDetailColumn} pageSize={5} headerHeight={45} rowsPerPageOptions={[5]} checkboxSelection={false} />
        </div>
      </ArgonBox>

      <Divider sx={{ fontWeight: "bold" }} />
      <ArgonBox display="Flex" flexDirection="row" justifyContent="space-between">
        <ArgonTypography fontWeight="bold" fontSize={18} marginTop="20px">
          Stakeholder Details
        </ArgonTypography>
      </ArgonBox>
      <ArgonBox marginTop="20px">
        <div style={{ height: 380, width: "100%" }}>
          <DataGrid rows={company["stakeholders"].map((item) => Object.assign({}, { ...item, id: item.uuid }))} columns={stakeholderColumn} pageSize={5} headerHeight={45} rowsPerPageOptions={[5]} checkboxSelection={false} />
        </div>
      </ArgonBox>
    </ArgonBox>
  );
}

Overview.propTypes = {
  company: PropTypes.object.isRequired,
};
export default Overview;
