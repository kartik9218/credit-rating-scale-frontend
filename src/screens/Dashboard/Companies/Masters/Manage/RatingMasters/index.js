import React, { useState, useEffect } from "react";
import { Add, Edit } from "@mui/icons-material";
import { Backdrop, CircularProgress, Box, Grid, Typography } from "@mui/material";
import { GET_ROUTE_NAME } from "helpers/Base";
import DashboardLayout from "layouts/DashboardLayout";
import DataTable from "slots/Tables/DataTable";
import CardWrapper from "slots/Cards/CardWrapper";
import HasPermissionButton from "slots/Custom/Buttons/HasPermissionButton";
import Select from "react-select";
import { HTTP_CLIENT } from "helpers/Api";
import { APIFY } from "helpers/Api";
import { ArgonBox } from "components/ArgonTheme";
import ArgonBadge from "components/ArgonBadge";
import moment from "moment";
import { FORMATE_DATE } from "helpers/Base";

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

const RatingMaster = () => {
  const [selectedRatingType, setSelectedRatingType] = useState(ratingSymbolOptions[0]);
  const [ratingSymbolData, setRatingSymbolData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    handlePerformAjaxRqst();
  }, [selectedRatingType.value]);

  const handlePerformAjaxRqst = () => {
    switch (selectedRatingType.value) {
      case "Rating Symbol Master": {
        setIsLoading(true);
        getRatingListing("/v1/rating_symbol_master")("rating_symbol_master");
        setColumns([
          {
            accessor: "rating_symbol",
            Header: "Rating Symbol",
          },
          {
            accessor: "weightage",
            Header: "Weightage",
            Cell: (row) => <>{row?.cell?.value?.toFixed(2)}</>,
          },
          {
            accessor: "grade",
            Header: "Grade",
          },
          {
            accessor: "rating_scale",
            Header: "Scale",
            Cell: (row) => <>{row?.cell?.value?.name}</>,
          },
          {
            accessor: "is_active",
            Header: "Status",
            Cell: (row) => <ArgonBadge badgeContent={`${row.cell.value ? "Active" : "Inactive"}`} color={`${row.cell.value ? "success" : "error"}`} container />,
          },
          {
            accessor: "uuid",
            Header: "",
            align: "right",
            Cell: (row) => {
              return (
                <ArgonBox display="flex" flexDirection="row" justifyContent="space-between">
                  <HasPermissionButton color="primary" permissions={["/dashboard/company/master/rating-symbol/edit"]} route={GET_ROUTE_NAME("EDIT_RATING_SYMBOL", { uuid: row.cell.value, type: "master" })} text={`Edit`} icon={<Edit />} />
                </ArgonBox>
              );
            },
          },
        ]);
        break;
      }
      case "Rating Symbol Category": {
        setIsLoading(true);
        getRatingListing("/v1/rating_symbol_category")("rating_symbol_category");
        setColumns([
          {
            accessor: "symbol_type_category",
            Header: "Category",
          },
          {
            accessor: "created_at",
            Header: "Created At",
            Cell: (row) => <>{FORMATE_DATE(row.cell.value)}</>,
          },
          {
            accessor: "is_active",
            Header: "Status",
            Cell: (row) => <ArgonBadge badgeContent={`${row.cell.value ? "Active" : "Inactive"}`} color={`${row.cell.value ? "success" : "error"}`} container />,
          },
          {
            accessor: "uuid",
            Header: "",
            align: "right",
            Cell: (row) => {
              return (
                <ArgonBox display="flex" flexDirection="row" justifyContent="space-between">
                  <HasPermissionButton color="primary" permissions={["/dashboard/company/master/rating-symbol/edit"]} route={GET_ROUTE_NAME("EDIT_RATING_SYMBOL", { uuid: row.cell.value, type: "category" })} text={`Edit`} icon={<Edit />} />
                </ArgonBox>
              );
            },
          },
        ]);
        break;
      }
      case "Rating Symbol Mapping": {
        setIsLoading(true);
        getRatingListing("/v1/rating_symbol_mapping")("rating_symbol_mapping");
        setColumns([
          {
            accessor: "final_rating",
            Header: "Final Rating",
          },
          {
            accessor: "prefix",
            Header: "Prefix",
          },
          {
            accessor: "suffix",
            Header: "Suffix",
            Cell: (row) => <>{row.cell.value || "-"}</> 
          },
          {
            accessor: "rating_symbol_master",
            Header: "Rating Symbol Master",
            Cell: (row) => <>{row.cell?.value?.rating_symbol}</>
          },
          {
            accessor: "rating_symbol_category",
            Header: "Rating Symbol Category",
            Cell: (row) => <>{row.cell?.value?.symbol_type_category}</>
          },
          {
            accessor: "is_active",
            Header: "Status",
            Cell: (row) => <ArgonBadge badgeContent={`${row.cell.value ? "Active" : "Inactive"}`} color={`${row.cell.value ? "success" : "error"}`} container />,
          },
          {
            accessor: "uuid",
            Header: "",
            align: "right",
            Cell: (row) => {
              return (
                <ArgonBox display="flex" flexDirection="row" justifyContent="space-between">
                  <HasPermissionButton color="primary" permissions={["/dashboard/company/master/rating-symbol/edit"]} route={GET_ROUTE_NAME("EDIT_RATING_SYMBOL", { uuid: row.cell.value, type: "mapping" })} text={`Edit`} icon={<Edit />} />
                </ArgonBox>
              );
            },
          },
        ]);
      }
      default: null;
    }
  };

  const getRatingListing = (uri) => (key) => {
    HTTP_CLIENT(APIFY(uri), { params: {} })
      .then((success) => {
        if (success) {
          setRatingSymbolData([...success[key]]);
          setIsLoading(false);
        }
      })
      .catch((err) => console.error(err));
  };

  return (
    <DashboardLayout>
      <CardWrapper
        headerTitle="Rating Symbol"
        headerActionButton={() => {
          return <HasPermissionButton color="primary" permissions={[GET_ROUTE_NAME("RATING_SYMBOL_CREATE")]} route={GET_ROUTE_NAME("RATING_SYMBOL_CREATE")} text={`Add`} icon={<Add />} />;
        }}
      >
        <Grid container spacing={2} padding={"2rem"}>
          <Grid item xs={12} marginTop={"-30px"}>
            <Box sx={{ display: "flex", gap: "20px", alignItems: "center" }}>
              <Typography fontSize="15px" fontWeight={500}>
                Select Rating Symbol Type
              </Typography>
              <Box sx={{ width: "400px" }}>
                <Select value={selectedRatingType} options={ratingSymbolOptions} onChange={(value) => setSelectedRatingType(value)} />
              </Box>
            </Box>
          </Grid>
        </Grid>
        <Grid item xs={12} marginTop={"-40px"}>
        <ArgonBox
          sx={{
            background: "white !important",
            height: "calc(100vh - 35vh)",
            overflow: "hidden",
            overFlowY:"scroll",
            padding: "10px",
          }}
        >
          <ArgonBox padding="10px">
          <DataTable
            table={{
              columns: columns,
              rows: ratingSymbolData,
            }}
            isPaginationVisible={false}
            canSearch={true}
            entriesPerPage={{ entries: ratingSymbolData.length, defaultValue: ratingSymbolData.length }}
          />
          </ArgonBox>
          </ArgonBox>
        </Grid>
        {/* <ArgonSnackbar
        color={"success"}
        icon="success"
        title={""}
        content=""
        translate="yes"
        dateTime=""
        open={}
        close={}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      /> */}
      </CardWrapper>
      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </DashboardLayout>
  );
};

export default RatingMaster;
