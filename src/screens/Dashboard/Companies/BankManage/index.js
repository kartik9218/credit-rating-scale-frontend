import { useEffect, useState } from "react";
import { Box, Button, Grid, Switch, TextField } from "@mui/material";
import { ArrowBackRounded, Edit } from "@mui/icons-material";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { HTTP_CLIENT, APIFY } from "helpers/Api";
import { SET_PAGE_TITLE, GET_ROUTE_NAME, GET_QUERY, FORMATE_NUMBER, FORMATE_DATE, CHECK_IF_OBJECT_EMPTY, INPUT_DATE_FORMATE } from "helpers/Base";
import { DashboardLayout } from "layouts";
import { ArgonBox, ArgonTypography, ArgonButton, ArgonSnackbar } from "components/ArgonTheme";
import HasPermissionButton from "slots/Custom/Buttons/HasPermissionButton";
import FormField from "slots/FormField";
import ArgonSelect from "components/ArgonSelect";
import DataTable from "slots/Tables/DataTable";
import ArgonBadge from "components/ArgonBadge";
import ErrorTemplate from "slots/Custom/ErrorTemplate";

function BankManage() {
  const uuid = GET_QUERY("uuid");
  const company_uuid = GET_QUERY("company-uuid");
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [banks, setBanks] = useState([]);
  const [isBank, setIsBank] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [instrumentDetailUUID, setInstrumentDetailUUID] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [ISINerror, setISINerror] = useState(false);
  const [instrumentData, setInstrumentData] = useState(undefined);
  const [selectedBank, setSelectedBank] = useState(undefined);
  const [title, setTitle] = useState("Add Banker/Lender");

  const [response, setResponse] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [params, setParams] = useState({
    transaction_instrument_uuid: uuid,
    bank_uuid: null,
    rated_amount: 0,
    outstanding_amount: 0,
    sanction_amount: 0,
    interest_rate: 0,
    instrument_size: 0,
    coupon_rate: 0,
    isin_number: null,
    interest_due_date: null,
    maturity_date: null,
    issuance_date: null,
    remark: "",
    asset_classification: "",
    purpose: "",
    repayment_terms: "",
    is_active: true,
  });

  const updateParams = (key, value, type = null) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const hendleNumberChange = (e, key) => {
    e.target.value = e.target.value >= 0 ? e.target.value : null
    updateParams(key, e.target.value);
  }
  const handelEdit = (instrumentDetailData) => {
    updateParams("uuid", instrumentDetailData.uuid);
    updateParams("asset_classification", instrumentDetailData.asset_classification);
    updateParams("purpose", instrumentDetailData.purpose);
    updateParams("repayment_terms", instrumentDetailData.repayment_terms);
    updateParams("instrument_size", instrumentDetailData.instrument_size);
    updateParams("issuance_date", INPUT_DATE_FORMATE(instrumentDetailData.issuance_date));
    if (isBank) {
      hendleBank({
        label: instrumentDetailData.bank,
        value: instrumentDetailData.bank_uuid
      })
      updateParams("interest_rate", FORMATE_NUMBER(instrumentDetailData.interest_rate));
      updateParams("isin_number", instrumentDetailData.isin_number);
      updateParams("is_active", instrumentDetailData.is_active);
      updateParams("outstanding_amount", instrumentDetailData.outstanding_amount);
      updateParams("sanction_amount", instrumentDetailData.sanction_amount);
    } else {
      updateParams("coupon_rate", instrumentDetailData.coupon_rate);
      updateParams("interest_due_date", instrumentDetailData.interest_due_date);
      updateParams("maturity_date", instrumentDetailData.maturity_date);
    }
    setIsEdit(true);
    setSizeError(false)
  };

  const fetchData = () => {

    HTTP_CLIENT(APIFY("/v1/transaction_instrument/view_instrument_details"), {
      params: {
        transaction_instrument_uuid: uuid,
        is_active: true
      }
    }).then((data) => {
      if (isBank) {

        setColumns([
          {
            accessor: "bank",
            Header: "Bank Name",
          },
          {
            accessor: "instrument_size",
            Header: "Instrument Size (in Cr.)",
            Cell: (row) => {
              return (
                <>
                  {FORMATE_NUMBER(row.cell.value)}
                </>
              );
            },
          },
          {
            accessor: "outstanding_amount",
            Header: "Outstanding Amount",
            Cell: (row) => {
              return (
                <>
                  {FORMATE_NUMBER(row.cell.value)}
                </>
              )
            }
          },
          {
            accessor: "sanction_amount",
            Header: "Sanction Amount",
            Cell: (row) => {
              return (
                <>
                  {FORMATE_NUMBER(row.cell.value)}
                </>
              )
            }
          },
          {
            accessor: "interest_rate",
            Header: "Interest Rate",
            Cell: (row) => {
              return (
                <>
                  {FORMATE_NUMBER(row.cell.value)}
                </>
              )
            }
          },
          {
            accessor: "asset_classification",
            Header: "Asset Classification",
          },
          {
            accessor: "purpose",
            Header: "Purpose",
            Cell: (row) => <Box sx={{ width: "200px" }}>{row.cell.value}</Box>,
          },
          {
            accessor: "repayment_terms",
            Header: "Repayment Terms",
            Cell: (row) => <Box sx={{ width: "200px" }}>{row.cell.value}</Box>,
          },
          {
            accessor: "issuance_date",
            Header: "Issuance Date",
            Cell: (row) => {
              return (
                <>
                  {FORMATE_DATE(row.cell.value)}
                </>
              );
            },
          },
          {
            accessor: "is_active",
            Header: "Status",
            Cell: (row) => {
              return (
                <>
                  {row.cell.value ? (
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
          }, {
            accessor: "uuid",
            Header: "Action",
            align: "right",
            Cell: (row) => {
              return (
                <ArgonBox display="Flex" flexDirection="row" justifyContent="space-between">
                  <Button onClick={() => handelEdit(row.row.original)}>
                    <Edit />
                  </Button>
                </ArgonBox>
              );
            },
          },
        ]);
      } else {
        setColumns([
          {
            accessor: "instrument_size",
            Header: "Instrument Size (in Cr.)",
            Cell: (row) => {
              return (
                <>
                  {FORMATE_NUMBER(row.cell.value)}
                </>
              );
            },
          },
          {
            accessor: "coupon_rate",
            Header: "Coupon Rate",
          },
          {
            accessor: "interest_due_date",
            Header: "Interest Due Date",
            Cell: (row) => {
              return (
                <>
                  {FORMATE_DATE(row.cell.value)}
                </>
              );
            },
          },
          {
            accessor: "maturity_date",
            Header: "Maturity Date",
            Cell: (row) => {
              return (
                <>
                  {FORMATE_DATE(row.cell.value)}
                </>
              );
            },
          },
          {
            accessor: "issuance_date",
            Header: "Issuance Date",
            Cell: (row) => {
              return (
                <>
                  {FORMATE_DATE(row.cell.value)}
                </>
              );
            },
          },
          {
            accessor: "asset_classification",
            Header: "Coupon Rate",
          },
          {
            accessor: "purpose",
            Header: "Purpose",
            Cell: (row) => <Box sx={{ width: "200px" }}>{row.cell.value}</Box>,
          },
          {
            accessor: "repayment_terms",
            Header: "Repayment Terms",
            Cell: (row) => <Box sx={{ width: "200px" }}>{row.cell.value}</Box>,
          },
          {
            accessor: "is_active",
            Header: "Status",
            Cell: (row) => {
              return (
                <>
                  {row.cell.value ? (
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
            accessor: "uuid",
            Header: "Action",
            align: "right",
            Cell: (row) => {
              return (
                <ArgonBox display="Flex" flexDirection="row" justifyContent="space-between">
                  <Button onClick={() => handelEdit(row.row.original)}>
                    <Edit />
                  </Button>
                </ArgonBox>
              );
            },
          },
        ]);
      }
      data["instrument_details"].forEach(instrumentDetail => {
        if (instrumentDetail.is_active) {
          setInstrumentDetailUUID(instrumentDetail.uuid)
          HTTP_CLIENT(APIFY("/v1/transaction_instrument/view_banker_lenders"), {
            params: {
              instrument_detail_uuid: instrumentDetail.uuid,
              is_active: true
            }
          }).then((data) => {
            setRows(data["banker_lenders"]);
          });
        }
      })
    });
  };

  const CopyBankAndLanders = () => {

    HTTP_CLIENT(APIFY("/v1/transaction_instrument/copy_banker_lenders"), {
      params: {
        instrument_detail_uuid: instrumentDetailUUID,
      }
    }).then((data) => {
      fetchData()
    });
  };

  const reSetParam = () => {
    setParams({
      transaction_instrument_uuid: uuid,
      bank_uuid: null,
      rated_amount: 0,
      outstanding_amount: 0,
      sanction_amount: 0,
      interest_rate: 0,
      instrument_size: 0,
      isin_number: null,
      coupon_rate: 0,
      interest_due_date: null,
      maturity_date: null,
      remark: "",
      asset_classification: "",
      purpose: "",
      repayment_terms: "",
      is_active: true,
    })
    setSelectedBank(undefined)
  }

  const hendleBank = (ev) => {
    updateParams("bank_uuid", ev.value)
    setSelectedBank(ev);
  }

  const getInstrument = () => {
    HTTP_CLIENT(APIFY("/v1/transaction_instruments/view"), {
      params: {
        uuid: uuid
      }
    }).then((data) => {
      let instrument = data.transaction_instrument.length > 0 ? data['transaction_instrument'][0] : null;

      setInstrumentData(instrument)
      if (instrument?.instrument_category?.category_name === "Bank Facilities") {
        setIsBank(true);
        setTitle("Add Banker/Lender")
      } else {
        setIsBank(false);
        setTitle("Add Instrument Details")
      }

    });
  };
  const getBanker = () => {
    HTTP_CLIENT(APIFY("/v1/tags"), {}).then(async (data) => {
      let banker = [];
      for (let index in data['tags']) {
        let tag = data['tags'][index];
        if (tag.name === "BANKING") {
          await HTTP_CLIENT(APIFY(`/v1/companies?tags=${tag.uuid}`), {}).then((tagData) => {
            banker = tagData['companies'];
            setBanks(tagData['companies'].map(company => {
              return {
                label: company.name,
                value: company.uuid,
              }
            }))
          });
        }
      }
    });
  };

  const calculateSize = (ev) => {
    ev.value = ev.value >= 0 ? ev.value : null;
    if (ev.value) {
      let totalSize = 0;
      rows.forEach(row => {
        if (row.is_active && (!isEdit || params['uuid'] !== row.uuid)) {
          totalSize = parseFloat(totalSize) + parseFloat(row.instrument_size);
        }
      });
      totalSize = parseFloat(totalSize) + parseFloat(ev.value);
      if (parseFloat(totalSize) <= parseFloat(instrumentData.instrument_size)) {
        setSizeError(false)
      } else {
        setSizeError("size must be less than or equal to " + FORMATE_NUMBER(instrumentData.instrument_size))
      }
    } else {
      setSizeError(false)
    }
    updateParams("instrument_size", parseFloat(ev.value))
  }

  const onFormSubmit = async (ev) => {
    setIsDisabled(true);
    ev.preventDefault();
    if (!sizeError && !ISINerror) {
      let url = isEdit ? "/v1/transaction_instrument/edit_banker_lender" : "/v1/transaction_instrument/create_banker_lender";
      params.instrument_detail_uuid = instrumentDetailUUID
      if (!isEdit) {
        delete params.uuid;
      }
      HTTP_CLIENT(APIFY(url), {
        params: params
      })
        .then((response) => {
          if (response["success"]) {
            fetchData();
            reSetParam();
            setIsEdit(false);
            setIsDisabled(false);
            setResponse("success");
            setSnackbarOpen(true);
            return;
          }
        })
        .catch((err) => {
          setResponse("error");
          setSnackbarOpen(true);
        });
    } else {
      setResponse("error");
      setSnackbarOpen(true);
    }

    setIsDisabled(false);

  };

  useEffect(() => {
    fetchData();
  }, [isBank])


  const calculateInterestRate = (ev) => {
    if (parseFloat(ev.target.value) >= 0 && parseFloat(ev.target.value) <= 100) {
      updateParams("interest_rate", ev.target.value, "number")
    } else {
      updateParams("interest_rate", null, "number")
    }
  };
  const hendleISINNumber = (ev) => {
    let pattern = /^[A-Z]{2}([A-Z0-9]){9}[0-9]$/gm;
    let result = ev.match(pattern);
    if (result) {
      updateParams("isin_number", result[0]);
      setISINerror(false);
    } else {
      updateParams("isin_number", ev)
      setISINerror("Please enter a valid ISIN number");
    }
    if (ev == '') {
      setISINerror(false);
    }
  };

  const handleDateValues = (key, options) => {
    updateParams(key, options)
  };

  const onCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    SET_PAGE_TITLE(title);
    let isSubscribed = true;
    if (isSubscribed) {
      getBanker();
      getInstrument();
    }
    return () => {
      isSubscribed = false;
    };
  }, []);

  return (
    <>
      <DashboardLayout breadcrumbTitle={title}>
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
                  {title}
                </ArgonTypography>
                <ArgonBox paddingRight="10px">
                  <HasPermissionButton
                    color="primary"
                    permissions={["/dashboard/company/instruments"]}
                    route={GET_ROUTE_NAME("LIST_INSTRUMENTS", { company_uuid: company_uuid })}
                    text={`Back to Instruments`}
                    icon={<ArrowBackRounded />}
                  />
                </ArgonBox>
              </ArgonBox>
              <ArgonBox component="form" role="form" onSubmit={onFormSubmit}>
                <Grid item xs={12} px={2}>
                  {instrumentData && <>
                    <Grid item xs={3} sm={6} md={4} pr={2} pb={2}>
                      <ArgonBox mr={1}>
                        <ArgonTypography
                          component="span"
                          variant="caption"
                          fontWeight="medium"
                          textTransform="capitalize"
                          fontSize={15}
                        > Total Instrument Size (in Cr.) : {FORMATE_NUMBER(instrumentData.instrument_size)}</ArgonTypography>
                      </ArgonBox>
                    </Grid>
                  </>}
                  <Grid item container xs={12}>
                    {isBank && (
                      <>
                        <Grid item xs={12} sm={6} md={4} pr={2} mt={0.1}>
                          <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
                            <ArgonTypography
                              component="label"
                              variant="caption"
                              fontWeight="bold"
                              textTransform="capitalize"
                            >
                              Select Banker/Lender*
                            </ArgonTypography>
                          </ArgonBox>

                          <ArgonSelect
                            placeholder="Select Bank/Lender"
                            name="bank_uuid"
                            options={banks}
                            value={CHECK_IF_OBJECT_EMPTY(selectedBank)}
                            onChange={hendleBank}
                            required
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} pr={2}>
                          <FormField
                            type="number"
                            label="Instrument size (in Cr.)"
                            placeholder="Instrument size"
                            value={params["instrument_size"]}
                            name="instrument_size"
                            onChange={(ev) => calculateSize(ev.target)}
                          />
                          {sizeError && (
                            <ErrorTemplate message={sizeError} />
                          )}

                        </Grid>
                        <Grid item xs={12} sm={6} md={4} pr={2}>
                          <FormField
                            type="number"
                            name="outstanding_amount"
                            value={params["outstanding_amount"]}
                            label="Outstanding amount (in Cr.)"
                            placeholder="Outstanding amount (in Cr.)"
                            onChange={(ev) => hendleNumberChange(ev, "outstanding_amount")}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} pr={2} mt={1}>
                          <FormField
                            type="number"
                            name="sanction_amount"
                            value={params["sanction_amount"]}
                            label="Sanction amount (in Cr.)"
                            placeholder="Sanction amount (in Cr.)"
                            onChange={(ev) => hendleNumberChange(ev, "sanction_amount")}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} pr={2} mt={1}>
                          <FormField
                            type="number"
                            name="interest_rate"
                            value={params["interest_rate"]}
                            label="Interest Rate (in %)"
                            placeholder="Interest Rate (in %)"
                            onChange={(ev) => calculateInterestRate(ev)}
                          />
                        </Grid>
                      </>
                    )}
                    {!isBank && (
                      <>
                        <Grid item xs={12} sm={6} md={4} pr={2} mt={1}>
                          <FormField
                            type="number"
                            label="Instrument size (in Cr.)"
                            placeholder="Instrument size"
                            value={params["instrument_size"]}
                            name="instrument_size"
                            onChange={(ev) => calculateSize(ev.target)}
                          />
                          {sizeError && (
                            <ErrorTemplate message={sizeError} />
                          )}
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} pr={2} mt={1}>
                          <FormField
                            type="number"
                            label="Coupon rate"
                            placeholder="Coupon rate"
                            value={params["coupon_rate"]}
                            name="coupon_rate"
                            onChange={(ev) => hendleNumberChange(ev, "coupon_rate")}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} pr={2} mt={2}>
                          <ArgonBox mb={0.7} ml={0.5} lineHeight={0}>
                            <ArgonTypography
                              component="label"
                              variant="caption"
                              fontWeight="bold"
                              textTransform="capitalize"
                            >
                              Interest due date
                            </ArgonTypography>
                          </ArgonBox>
                          <LocalizationProvider dateAdapter={AdapterMoment}>
                            <DatePicker
                              inputFormat="MM/DD/YYYY"
                              // disableFuture={true}
                              className={"date-picker-width"}
                              name="interest_due_date"
                              value={params['interest_due_date']}
                              onChange={(newValue) => handleDateValues("interest_due_date", newValue)}
                              renderInput={(params) => (
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
                              )}
                            />
                          </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} pr={2} mt={2}>
                          <ArgonBox mb={0.7} ml={0.5} lineHeight={0}>
                            <ArgonTypography
                              component="label"
                              variant="caption"
                              fontWeight="bold"
                              textTransform="capitalize"
                            >
                              Maturity Date
                            </ArgonTypography>
                          </ArgonBox>
                          <LocalizationProvider dateAdapter={AdapterMoment}>
                            <DatePicker
                              inputFormat="MM/DD/YYYY"
                              // disableFuture={true}
                              className={"date-picker-width"}
                              name="maturity_date"
                              value={params['maturity_date']}
                              onChange={(newValue) => handleDateValues("maturity_date", newValue)}
                              renderInput={(params) => (
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
                              )}
                            />
                          </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} pr={2} mt={1}>
                          <FormField
                            type="text"
                            name="isin_number"
                            value={params["isin_number"]}
                            label="ISIN"
                            placeholder="ISIN"
                            onChange={(ev) => hendleISINNumber(ev.target.value)}
                          />
                          {ISINerror && (
                            <ErrorTemplate message={ISINerror} />
                          )}
                        </Grid>
                      </>
                    )}
                    <Grid item xs={12} sm={6} md={4} pr={2} mt={1}>
                      <FormField
                        type="text"
                        name="asset_classification"
                        value={params["asset_classification"]}
                        label="Asset Classification"
                        placeholder="Asset Classification"
                        onChange={(ev) => updateParams("asset_classification", ev.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} pr={2} mt={1}>
                      <FormField
                        type="text"
                        label="Purpose"
                        placeholder="Purpose"
                        name="purpose"
                        value={params["purpose"]}
                        onChange={(ev) => updateParams("purpose", ev.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} pr={2} mt={1}>
                      <FormField
                        type="text"
                        label="Repayment Terms"
                        placeholder="Repayment Terms"
                        name="repayment_terms"
                        value={params["repayment_terms"]}
                        onChange={(ev) => updateParams("repayment_terms", ev.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={4} pr={2} mt={2}>
                      <ArgonBox mb={0.7} ml={0.5} lineHeight={0}>
                        <ArgonTypography
                          component="label"
                          variant="caption"
                          fontWeight="bold"
                          textTransform="capitalize"
                        >
                          Issuance Date
                        </ArgonTypography>
                      </ArgonBox>
                      <LocalizationProvider dateAdapter={AdapterMoment}>
                        <DatePicker
                          inputFormat="MM/DD/YYYY"
                          // disableFuture={true}
                          className={"date-picker-width"}
                          name="issuance_date"
                          value={params['issuance_date']}
                          onChange={(newValue) => handleDateValues("issuance_date", newValue)}
                          renderInput={(params) => (
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
                          )}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} pr={2} mt={1}>
                      <FormField
                        type="text"
                        label="Remark (if any)"
                        placeholder="Remark (if any)"
                        name="remark"
                        value={params["remark"]}
                        onChange={(ev) => updateParams("remark", ev.target.value)}
                      />
                    </Grid>
                    {isEdit &&
                      <Grid item xs={3} sm={6} md={4} pr={2} mt={5}>
                        <ArgonBox mr={1}>
                          <ArgonBox mr={1}>
                            <Switch
                              name="is_active"
                              checked={params["is_active"]}
                              onChange={(e) => updateParams("is_active", e.target.checked)}
                            />
                            {params["is_active"] ? "  Active" : "  Inactive"}
                          </ArgonBox>
                        </ArgonBox>
                      </Grid>
                    }

                  </Grid>
                  <Grid item xs={12} my={"20px"}>
                    <ArgonButton color="success" type="submit" isDisabled={isDisabled}>
                      Submit
                    </ArgonButton>
                    <ArgonButton color="info" type="button" sx={{ marginLeft: "20px" }} onClick={CopyBankAndLanders}>
                      Copy last Banker/lander
                    </ArgonButton>
                  </Grid>
                </Grid>
              </ArgonBox>
              <ArgonBox sx={{ marginTop: "20px" }}>
                <DataTable
                  table={{
                    columns: columns,
                    rows: rows,
                  }}
                  canSearch={true}
                  entriesPerPage={false}
                />
              </ArgonBox>
            </Grid>
          </Grid>

          <ArgonSnackbar
            color={response}
            icon={response ? response : "error"}
            title={response === "success" ? "Success" : response === "error" ? "Error" : ""}
            content={response === "success" ? "Banker/Lender Successfully Created" : "Banker/Lander creation failed!!"}
            translate="yes"
            dateTime=""
            open={snackbarOpen}
            close={onCloseSnackbar}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
          />
        </ArgonBox>
      </DashboardLayout>
    </>
  );
}
export default BankManage;
