import React, { useEffect, useState } from 'react'
import { Checkbox, FormControlLabel, Grid, Input, Stack, TextField } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DataGrid } from '@mui/x-data-grid';
import Select from "react-select";
import { DashboardLayout } from 'layouts';
import { ArgonSnackbar, ArgonBox, ArgonTypography, ArgonButton } from 'components/ArgonTheme';
import { INPUT_DATE_FORMATE, SET_PAGE_TITLE, GET_USER_PROPS, CHECK_IF_OBJECT_EMPTY, FORMATE_NUMBER } from 'helpers/Base';
import { HTTP_CLIENT, APIFY } from 'helpers/Api';

export default function InitiateRatingCycle() {

  const [rows, setRows] = useState([]);
  const [SelectedIDs, setSelectedIDs] = useState([]);
  const [Companies, setCompanies] = useState([]);
  const [RAUsers, setRAUsers] = useState([]);
  const [financialYear, setFinancialYear] = useState([]);
  const [ratingProcesses, setRatingProcesses] = useState([]);
  const [FinancialResults, setFinancialResults] = useState([]);
  const [RuarterlyResults, setRuarterlyResults] = useState([]);
  const [yearAndDate, setYearAndDate] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [response, setResponse] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [params, setParams] = useState({
    companies: {},
    ra_user: {},
    rating_cycle: {},
    financial_year: {},
    financial_result: {},
    quarterly_result: {},
  })

  const columns = [
    {
      field: "mandate_id",
      headerName: "Mandate",
      width: 200,
    },
    {
      field: "instrument_category_name",
      headerName: "Category",
      width: 200,
    },
    {
      field: "instrument_sub_category_name",
      headerName: "Sub Category",
      width: 200,
    },
    {
      field: "instrument",
      headerName: "Instrument",
      width: 200,
    },
    {
      field: "instrument_size",
      headerName: "Instrument Size (in Cr.)",
      width: 200,
      valueGetter: (params) => FORMATE_NUMBER(params.value),
    },
    {
      field: "reduce_enhance",
      headerName: "Reduce/Enhance (in Cr.)",
      width: 200,
      renderCell: (params) => {
        return <>
          <Input
            type="number"
            name="size"
            placeholder="Enter Size"
            value={params.value}
            onChange={(ev) => handleInstrumentsChange(ev.target.value, params)}
          />
        </>
      },
    },
    {
      field: "total_instrument",
      headerName: "Total Instrument (in Cr.)",
      width: 200,
      valueGetter: (params) => FORMATE_NUMBER(params.value),
    },
    {
      field: "rating_cycle",
      headerName: "Rating Cycle",
      width: 200,
    },
    {
      field: "financial_year",
      headerName: "Financial Year",
      width: 200,
    },
    {
      field: "agendaType",
      headerName: "Agenda Type",
      width: 200,
    },
  ];



  let handleInstrumentsChange = (value, instrumentDetail) => {
    let row = rows;
    if (value) {
      row[instrumentDetail.row.id - 1].total_instrument = parseFloat(value) + parseFloat(instrumentDetail.row.instrument_size);
      row[instrumentDetail.row.id - 1].reduce_enhance = value;
    } else {
      row[instrumentDetail.row.id - 1].total_instrument = instrumentDetail.row.instrument_size;
      row[instrumentDetail.row.id - 1]['reduce_enhance'] = value;
    }

    setRows([...row]);
  }

  const onFormSubmit = async (ev) => {
    ev.preventDefault();
    if (CHECK_IF_OBJECT_EMPTY(params['companies'])) {
      let url = "/v1/view_surveillance/mandates";

      HTTP_CLIENT(APIFY(url), {
        params: {
          company_uuid: params['companies'].value
        }
      })
        .then((response) => {
          let ids = []
          response['mandates'].forEach((mandate, key) => {
            response['mandates'][key].id = key + 1;
            ids.push(key + 1)
            response['mandates'][key].rating_cycle = params['rating_cycle'].label;
            response['mandates'][key].financial_year = params['financial_year'].label;
            response['mandates'][key].reduce_enhance = null;
            response['mandates'][key].total_instrument = mandate.instrument_size;
          })
          dataSelect(ids);
          setRows(response['mandates'])

        })
        .catch((err) => {
          setResponse("error");
          setSnackbarOpen(true);
        });
    }
  };


  const hendleStartCycle = async (ev) => {
    ev.preventDefault();

    let param = rows.filter((rowEl) => SelectedIDs.findIndex((arrEl) => arrEl === rowEl.id) > -1)
      .map((rowEl) => {
        return {
          transaction_instrument_uuid: rowEl.transaction_instrument_uuid,
          mandate_uuid: rowEl.mandate_uuid,
          instrument_size: rowEl.total_instrument
        }
      })

    let url = "/v1/initiate/rating_cycle";

    HTTP_CLIENT(APIFY(url), {
      company_uuid: params['companies'].value,
      financial_result: params['financial_result'].value,
      quarterly_result: params['quarterly_result'].value,
      rating_analyst_uuid: params['ra_user'].value,
      rating_cycle_uuid: params['rating_cycle'].value,
      params: param
    })
      .then((response) => {
        setParams({
          companies: {},
          ra_user: {},
          rating_cycle: {},
          financial_year: {},
          financial_result: {},
          quarterly_result: {},
        })
        setRows([]);
      })
      .catch((err) => {
        setResponse("error");
        setSnackbarOpen(true);
      });

  };

  const fetchCompanies = () => {
    HTTP_CLIENT(APIFY("/v1/companies/based_on_roles"), {
      params: {
        user_uuid: GET_USER_PROPS("uuid"),
        role_uuid: GET_USER_PROPS("uuid", "active_role"),
        is_last_activity: true
      }
    }).then((data) => {
      let result = data.companies.map((company) => {
        return {
          label: company.company_name,
          value: company.company_uuid,
        };
      });
      setCompanies(result);

    });
  }
  const fetchData = () => {
    HTTP_CLIENT(APIFY("/v1/roles/view_users"), {
      role: "Rating Analyst",
    }).then((data) => {
      let RAdata = data.role?.users || [];
      let RAUsers = RAdata.map((user) => {
        return {
          label: user.full_name,
          value: user.uuid,
        };
      });
      setRAUsers(RAUsers);
    });
    HTTP_CLIENT(APIFY("/v1/financial_year"), {
      params: { is_active: true },
    }).then((data) => {
      let financial_Year = data.financial_year.map((year) => {
        return {
          label: year.reference_date,
          value: year.uuid,
        };
      });
      setFinancialYear(financial_Year);
    });
    HTTP_CLIENT(APIFY("/v1/rating_process"), {
      params: { is_active: true },
    }).then((data) => {
      let rating_processes = []
      data.rating_processes.map((year) => {
        if (year.name !== 'Initial') {
          rating_processes.push({
            label: year.name,
            value: year.uuid,
          });
        }
      });
      setRatingProcesses(rating_processes);
    });
  };

  const dataSelect = (checked_ids) => {
    let unchecked_id = [...SelectedIDs].filter((arrEl1) => {
      return [...checked_ids].findIndex((arrEl2) => arrEl1 === arrEl2) == -1
    })

    if (unchecked_id?.length > 0) {
      let unSelectedDataIds = [...rows]
        .filter((rowEl) => unchecked_id.findIndex((arrEl) => arrEl === rowEl.id) > -1)
        .map((rowEl) => rowEl.id)

      let newSelectedDataIds = [...SelectedIDs]

      for (let i = 0; i < unSelectedDataIds.length; i++) {
        let index = newSelectedDataIds.indexOf(unSelectedDataIds[i])
        if (index > -1) {
          newSelectedDataIds.splice(index, 1)
        }
      }
      setSelectedIDs(newSelectedDataIds)
    } else {
      let selectedDataIds = [...rows]
        .filter((rowEl) => checked_ids.findIndex((arrEl) => arrEl === rowEl.id) > -1)
        .map((rowEl) => rowEl.id)
      setSelectedIDs(selectedDataIds)
    }
  }

  const getMasters = () => {
    HTTP_CLIENT(APIFY("/v1/master"), {}).then((data) => {
      let masters = data["masters"];
      let financial_results = [];
      let quarterly_results = [];
      masters.forEach((master) => {
        if (master["group"] === "FINANCIAL_RESULTS") {
          financial_results.push({ label: master["name"], value: master["value"] });
        }
        if (master["group"] === "QUARTERLY_RESULTS") {
          quarterly_results.push({ label: master["name"], value: master["value"] });
        }
      });
      setFinancialResults(financial_results);
      setRuarterlyResults(quarterly_results);
    });
  };

  const hendleSelect = (key, opt) => {
    setParams((prev) => ({
      ...prev,
      [key]: opt,
    }));
  };

  const onCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    if (SelectedIDs.length > 0) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [SelectedIDs]);

  useEffect(() => {

  }, [rows, params, SelectedIDs]);

  useEffect(() => {
    SET_PAGE_TITLE("Initiate Rating Cycle");
    let ajaxEvent = true;
    if (ajaxEvent) {
      fetchCompanies();
      fetchData();
      getMasters();
    }

    return () => {
      ajaxEvent = false;
    };
  }, []);

  return (
    <DashboardLayout breadcrumbTitle="Initiate Rating Cycle">
      <ArgonBox borderRadius="lg" shadow="lg" opacity={1} py={3} mt={3} bgColor="white">
        <Grid
          item
          container
          spacing={3}
          sx={{ height: "calc(100vh - 20vh)", overflowY: "scroll" }}
        >
          <Grid item xs={12}>
            <ArgonBox display="flex" flexDirection="row" justifyContent="space-between">
              <ArgonTypography fontWeight="bold" paddingLeft="15px">
                Initiate Rating Cycle
              </ArgonTypography>
            </ArgonBox>
            <ArgonBox component="form" role="form" onSubmit={onFormSubmit}>
              <Grid item xs={12} px={3} py={2}>
                <Grid item container xs={12}>
                  <Grid item xs={12} sm={6} pr={2} py={1}>
                    <Grid item container xs={12}>
                      <Grid item sm={5} pr={2} alignItems={"center"} display={"flex"}>
                        <ArgonTypography
                          component="label"
                          variant="caption"
                          fontWeight="bold"
                          textTransform="capitalize"
                          fontSize={15}
                          sx={{ marginBottom: "5px" }}
                        >
                          Company*
                        </ArgonTypography>
                      </Grid>
                      <Grid item sm={7} pr={2} >
                        <Select
                          placeholder="Select Company"
                          sx={{ width: "100%" }}
                          options={Companies}
                          value={CHECK_IF_OBJECT_EMPTY(params['companies'])}
                          onChange={(e) => hendleSelect('companies', e)}
                          required
                        />
                      </Grid>

                    </Grid>
                  </Grid>
                  <Grid item xs={12} sm={6} pr={2} py={1}>
                    <Grid item container xs={12}>
                      <Grid item sm={5} pr={2} alignItems={"center"} display={"flex"}>
                        <ArgonTypography
                          component="label"
                          variant="caption"
                          fontWeight="bold"
                          textTransform="capitalize"
                          fontSize={15}
                          sx={{ marginBottom: "5px" }}
                        >
                          Rating Analyst*
                        </ArgonTypography>
                      </Grid>
                      <Grid item sm={7} pr={2} >
                        <Select
                          placeholder="Select Rating Analyst"
                          sx={{ width: "100%" }}
                          options={RAUsers}
                          value={CHECK_IF_OBJECT_EMPTY(params['ra_user'])}
                          onChange={(e) => hendleSelect('ra_user', e)}
                          required
                        />
                      </Grid>

                    </Grid>
                  </Grid>
                  <Grid item xs={12} sm={6} pr={2} py={1}>
                    <Grid item container xs={12}>
                      <Grid item sm={5} pr={2} alignItems={"center"} display={"flex"}>
                        <ArgonTypography
                          component="label"
                          variant="caption"
                          fontWeight="bold"
                          textTransform="capitalize"
                          fontSize={15}
                          sx={{ marginBottom: "5px" }}
                        >
                          Rating Cycle*
                        </ArgonTypography>
                      </Grid>
                      <Grid item sm={7} pr={2} >
                        <Select
                          placeholder="Select Rating Cycle"
                          sx={{ width: "100%" }}
                          options={ratingProcesses}
                          value={CHECK_IF_OBJECT_EMPTY(params['rating_cycle'])}
                          onChange={(e) => hendleSelect('rating_cycle', e)}
                          required
                        />
                      </Grid>

                    </Grid>
                  </Grid>
                  <Grid item xs={12} sm={6} pr={2} py={1}>
                    <Grid item container xs={12}>
                      <Grid item sm={5} pr={2} alignItems={"center"} display={"flex"}>
                        <ArgonTypography
                          component="label"
                          variant="caption"
                          fontWeight="bold"
                          textTransform="capitalize"
                          fontSize={15}
                          sx={{ marginBottom: "5px" }}
                        >
                          Financial Year*
                        </ArgonTypography>
                      </Grid>
                      <Grid item sm={7} pr={2} >
                        <Select
                          placeholder="Select Financial Year"
                          sx={{ width: "100%" }}
                          options={financialYear}
                          value={CHECK_IF_OBJECT_EMPTY(params['financial_year'])}
                          onChange={(e) => hendleSelect('financial_year', e)}
                          required
                        />
                      </Grid>

                    </Grid>
                  </Grid>
                  <Grid item xs={12} sm={6} pr={2} py={1}>
                    <Grid item container xs={12}>
                      <Grid item sm={5} pr={2} alignItems={"center"} display={"flex"}>
                        <ArgonTypography
                          component="label"
                          variant="caption"
                          fontWeight="bold"
                          textTransform="capitalize"
                          fontSize={15}
                          sx={{ marginBottom: "5px" }}
                        >
                          Financial Result*
                        </ArgonTypography>
                      </Grid>
                      <Grid item sm={7} pr={2} >
                        <Select
                          placeholder="Select Financial Result"
                          sx={{ width: "100%" }}
                          options={FinancialResults}
                          value={CHECK_IF_OBJECT_EMPTY(params['financial_result'])}
                          onChange={(e) => hendleSelect('financial_result', e)}
                          required
                        />
                      </Grid>

                    </Grid>
                  </Grid>
                  <Grid item xs={12} sm={6} pr={2} py={1}>
                    <Grid item container xs={12}>
                      <Grid item sm={5} pr={2} alignItems={"center"} display={"flex"}>
                        <ArgonTypography
                          component="label"
                          variant="caption"
                          fontWeight="bold"
                          textTransform="capitalize"
                          fontSize={15}
                          sx={{ marginBottom: "5px" }}
                        >
                          Year end Date
                        </ArgonTypography>
                      </Grid>
                      <Grid item sm={7} pr={2} alignItems={"center"} display={"flex"}>
                        <LocalizationProvider dateAdapter={AdapterMoment}>
                          <DatePicker
                            inputFormat="MM/DD/YYYY"
                            disableFuture={true}
                            className={"date-picker-width"}
                            name="year_and_date"
                            value={INPUT_DATE_FORMATE(yearAndDate)}
                            onChange={(newValue) => setYearAndDate(newValue)}
                            renderInput={(params) => (
                              <>
                                <TextField
                                  {...params}
                                  sx={{
                                    ".MuiOutlinedInput-root": {
                                      paddingLeft: "0px",
                                      borderRadius: "2px",
                                      display: "flex",
                                      justifyContent: "space-between !important",
                                    },
                                  }}
                                />
                              </>
                            )}
                          />
                        </LocalizationProvider>
                      </Grid>

                    </Grid>
                  </Grid>
                  <Grid item xs={12} sm={6} pr={2} py={1}>
                    <Grid item container xs={12}>
                      <Grid item sm={5} pr={2} alignItems={"center"} display={"flex"}>
                        <ArgonTypography
                          component="label"
                          variant="caption"
                          fontWeight="bold"
                          textTransform="capitalize"
                          fontSize={15}
                          sx={{ marginBottom: "5px" }}
                        >
                          Quarterly Result*
                        </ArgonTypography>
                      </Grid>
                      <Grid item sm={7} pr={2} >
                        <Select
                          placeholder="Select Quarterly Result"
                          sx={{ width: "100%" }}
                          options={RuarterlyResults}
                          value={CHECK_IF_OBJECT_EMPTY(params['quarterly_result'])}
                          onChange={(e) => hendleSelect('quarterly_result', e)}
                          required
                        />
                      </Grid>

                    </Grid>
                  </Grid>

                </Grid>
                <Grid item container xs={12}>
                  <Grid item xs={12} sm={6} pr={2} py={1}>
                    <Grid item container xs={12}>
                      <FormControlLabel value="start"
                        control={<Checkbox
                        // defaultChecked
                        />} label="Auto Select Prev. Analyst"
                        labelPlacement="start" />
                    </Grid>
                  </Grid>
                  <Grid item xs={12} sm={6} pr={2} py={1}>
                    <ArgonButton color="info" type="submit">
                      View
                    </ArgonButton>
                    <ArgonButton color="success" sx={{ marginLeft: "15px" }} onClick={hendleStartCycle} isDisabled={isDisabled}>
                      Start Cycle
                    </ArgonButton>
                  </Grid>
                </Grid>
              </Grid>
            </ArgonBox>
            <ArgonBox sx={{ height: 450, width: "95.5%", paddingLeft: "20px", marginBottom: "20px" }}>
              <DataGrid
                rowHeight={50}
                rows={rows}
                onCellKeyDown={(params, events) => events.stopPropagation()}

                columns={columns}
                components={{
                  NoRowsOverlay: () => (
                    <Stack height="100%" alignItems="center" justifyContent="center">
                      No Mandates to Start Cycle.
                    </Stack>
                  ),
                }}
                hideFooter
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 10000, page: 0 },
                  },
                }}
                sx={{ fontSize: "13px" }}
                getRowId={(row) => row?.id}
                onSelectionModelChange={(ids) => {
                  dataSelect(ids)
                }}
                rowSelectionModel={SelectedIDs}
                checkboxSelection
              // disableRowSelectionOnClick
              />
            </ArgonBox>
          </Grid>
        </Grid>
      </ArgonBox>
      <ArgonSnackbar
        color={response}
        icon={response ? response : "error"}
        title={response === "success" ? "Success" : response === "error" ? "Error" : ""}
        content={response === "success" ? "Cycle Start Successfully" : "Please Check requried fields!!"}
        translate="yes"
        dateTime=""
        open={snackbarOpen}
        close={onCloseSnackbar}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      />
    </DashboardLayout>
  )
}
