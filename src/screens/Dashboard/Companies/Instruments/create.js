import React, { useEffect, useState } from "react";
import { ArrowBackRounded, Edit } from "@mui/icons-material";
import { Button, Grid, Switch, TextField } from "@mui/material";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import Select from "react-select";
import { SET_PAGE_TITLE, GET_ROUTE_NAME, GET_QUERY, CHECK_IF_OBJECT_EMPTY, FORMATE_NUMBER, FORMATE_DATE, INPUT_DATE_FORMATE } from "helpers/Base";
import { HTTP_CLIENT, APIFY } from "helpers/Api";
import { DashboardLayout } from "layouts";
import HasPermissionButton from "slots/Custom/Buttons/HasPermissionButton";
import FormField from "slots/FormField";
import DataTable from "slots/Tables/DataTable";
import { ArgonBox, ArgonTypography, ArgonButton, ArgonSnackbar } from "components/ArgonTheme";
import ArgonBadge from "components/ArgonBadge";
import ErrorTemplate from "slots/Custom/ErrorTemplate";

function CompanyInstrumentsAdd() {

  const uuid = GET_QUERY("uuid");
  const company_uuid = GET_QUERY("company-uuid");

  const [selectedSubCategory, setSelectedSubCategory] = useState({});
  const [selectedInstrument, setSelectedInstrument] = useState({});
  const [instruments, setInstruments] = useState([]);
  const [InstrumentListingStatus, setInstrumentListingStatus] = useState([{ label: "Select Company", value: "" }]);
  const [complexitylavel, setComplexitylavel] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [mandate, setMandate] = useState(undefined);
  const [isDisabled, setIsDisabled] = useState(false);
  const [selectedInstrumentListingStatus, setSelectedInstrumentListingStatus] = useState({});
  const [selectedcomplexityLevel, setSelectedcomplexityLevel] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [response, setResponse] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [rows, setRows] = useState([]);
  const [backdropOpen, setBackdropOpen] = useState(false);
  const [params, setParams] = useState({
    uuid: "",
    mandate_uuid: "",
    mandate_id: "",
    category: {},
    sub_category: {},
    instrument: {},
    remark: "",
    size: 0,
    complexity_level: "",
    instrument_listing_status: "",
    placed_date: null,
    is_active: "",
  });

  const updateParams = (key, value) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handelEdit = (instrumentData) => {
    updateParams("uuid", instrumentData.uuid);
    updateParams("name", instrumentData.name);
    updateParams("size", FORMATE_NUMBER(instrumentData.instrument_size));
    updateParams("remark", instrumentData.remark);
    updateParams("is_active", instrumentData.is_active);
    updateParams("mandate_uuid", instrumentData.mandate.uuid);
    updateParams("placed_date", INPUT_DATE_FORMATE(instrumentData.placed_date));
    if (instrumentData.instrument_listing_status) {
      setSelectedInstrumentListingStatus({
        label: instrumentData.instrument_listing_status,
        value: instrumentData.instrument_listing_status
      });
    } else {
      setSelectedInstrumentListingStatus({})
    }
    if (instrumentData.complexity_level) {
      hendleComplexityLevel({
        label: instrumentData.complexity_level,
        value: instrumentData.complexity_level
      });
    } else {
      setSelectedcomplexityLevel({})
    }
    hendleSelect({
      label: instrumentData.instrument_sub_category.category_name,
      value: instrumentData.instrument_sub_category.uuid,
    })
    fetchSubCategory({
      label: instrumentData.instrument_category.category_name,
      value: instrumentData.instrument_category.uuid,
    })
    hendleInstrumentSelect({
      label: instrumentData.instrument.name,
      value: instrumentData.instrument.uuid,
    })
    setIsEdit(true);
  };

  const columns = [
    {
      accessor: "instrument_category", Header: "Category", Cell: (row) => {
        return (
          <>
            {row.cell.value?.category_name}
          </>
        );
      },
    },
    {
      accessor: "instrument_sub_category", Header: "Sub Category", Cell: (row) => {
        return (
          <>
            {row.cell.value?.category_name}
          </>
        );
      },
    },
    {
      accessor: "instrument", Header: "Instrument", Cell: (row) => {
        return (
          <>
            {row.cell.value?.name}
          </>
        );
      },
    },
    {
      accessor: "instrument_size", Header: "Size", Cell: (row) => {
        return (
          <>
            {FORMATE_NUMBER(row.cell.value)}
          </>
        );
      }
    },
    { accessor: "complexity_level", Header: "Complexity Level" },
    {
      accessor: "instrument_listing_status", Header: "Listing Status"
    },
    {
      accessor: "placed_date", Header: "Placed Date",
      Cell: (row) => {
        return (
          <>
            {FORMATE_DATE(row.cell.value)}
          </>
        );
      },
    },
    { accessor: "remark", Header: "Remark" },
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
  ];

  const onFormSubmit = async (ev) => {
    setIsDisabled(true);
    ev.preventDefault();
    if (!sizeError) {
      let url = isEdit ? "/v1/mandates/edit_transaction_instrument" : "/v1/mandates/create_transaction_instrument";
      if (!isEdit) {
        delete params.uuid;
        delete params.is_active;
      }

      HTTP_CLIENT(APIFY(url), {
        params: {
          uuid: params.uuid,
          mandate_uuid: mandate.uuid,
          instrument_uuid: selectedInstrument.value,
          instrument_category_uuid: params.category.uuid,
          instrument_sub_category_uuid: selectedSubCategory.value,
          complexity_level: params.complexity_level,
          remark: params.remark,
          instrument_listing_status: params.instrument_listing_status,
          placed_date: params.placed_date,
          instrument_size: FORMATE_NUMBER(params.size),
          is_active: params.is_active
        }
      })
        .then((response) => {
          if (response["success"]) {
            setResponse("success");
            setSnackbarOpen(true);
            fetchInstrument();
            setIsEdit(false);
            updateParams("uuid", "");
            updateParams("name", "");
            updateParams("size", "");
            updateParams("remark", "");
            updateParams("is_active", "");
            updateParams("mandate_uuid", "");
            updateParams("placed_date", null);
            setSelectedInstrumentListingStatus({})
            setSelectedcomplexityLevel({})
            setSelectedSubCategory({})
            setSelectedInstrument({})

            setIsDisabled(false);
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

  };


  const getMasters = () => {
    HTTP_CLIENT(APIFY("/v1/master"), {}).then((data) => {
      let masters = data["masters"];
      let complexitylavel = [];
      let InstrumentListing = InstrumentListingStatus;
      masters.forEach((master) => {
        if (master["group"] === "COMPLEXITY_LAVEL") {
          complexitylavel.push({ label: master["name"], value: master["value"] });
        }
        if (master["group"] === "instrument_listing_status") {
          InstrumentListing.push({ label: master["name"], value: master["value"] });
        }
      });
      setComplexitylavel(complexitylavel);
      setInstrumentListingStatus(InstrumentListing);
    });
  };

  const fetchSubCategory = async (obj) => {
    HTTP_CLIENT(APIFY("/v1/sub_categories/by_category/view"), {
      instrument_category_uuid: obj.value,
      is_active: true
    }).then((response) => {
      const sub_instrument_categories = response["sub_instrument_category"];
      let subCategories = sub_instrument_categories.map((subCategory) => {
        return {
          label: subCategory.category_name,
          value: subCategory.uuid,
        };
      })
      setSubCategories(subCategories);
    });
  };

  const fetchData = async () => {
    HTTP_CLIENT(APIFY("/v1/transaction_instruments/view"), {
      params: {
        uuid: uuid
      }
    }).then((response) => {
      let tInstruments = response.transaction_instrument.length > 0 ? response.transaction_instrument[0] : [];
      updateParams("mandate_id", tInstruments.mandate.mandate_id);
      updateParams("category", tInstruments.instrument_category);

      fetchSubCategory({
        label: tInstruments.instrument_category.category_name,
        value: tInstruments.instrument_category.uuid,
      })
      setMandate(tInstruments.mandate)
    });
  };

  const hendleSelect = (obj) => {
    updateParams("instrument_sub_category_uuid", obj.value);

    updateParams("instrument", {});
    setSelectedInstrument({});
    HTTP_CLIENT(APIFY("/v1/instruments/by_subcategory/view"), {
      sub_category_uuid: obj.value,
      is_active: true
    }).then((data) => {
      let instruments = data.instruments.map((instrument) => {
        return {
          label: instrument.name,
          value: instrument.uuid,
        };
      });
      setInstruments(instruments);

    });
    setSelectedSubCategory(obj);
  };


  const hendleInstrumentSelect = (obj) => {
    updateParams("instrument", obj.value);

    setSelectedInstrument(obj);
  };

  const fetchInstrument = async () => {

    setBackdropOpen(true);
    if (mandate) {
      HTTP_CLIENT(APIFY("/v1/transaction_instruments"), {
        params: {
          mandate_uuid: [mandate.uuid]
        }
      }).then((response) => {
        const instruments = response["transaction_instruments"];

        setRows(instruments);
      });
    }
    setBackdropOpen(false);
  };


  const onCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  const hendleComplexityLevel = (ev) => {
    updateParams("complexity_level", ev.value)
    setSelectedcomplexityLevel(ev)
  };
  const hendleInstrumentListingStatus = (ev) => {
    if(ev.value){
      updateParams("instrument_listing_status", ev.value)
      setSelectedInstrumentListingStatus(ev)
    }else{
      updateParams("instrument_listing_status", "")
      setSelectedInstrumentListingStatus({})
    }
  };

  const checkSize = (amount) => {
    amount = amount >= 0 ? amount : null;
    if (amount && amount >= 0) {
      let totalSize = 0;
      let instrumentSize = 0;
      rows.forEach((row, key) => {
        console.log(params['uuid']);
        console.log(row.uuid);
        if (row.is_active && (!isEdit || params['uuid'] !== row.uuid)) {
          console.log(row.instrument_size);
          totalSize = parseFloat(totalSize) + parseFloat(row.instrument_size)
          instrumentSize = parseFloat(instrumentSize) + parseFloat(row.instrument_size)
        }
      })
      console.log(instrumentSize);
      instrumentSize = parseFloat(mandate.total_size) - parseFloat(instrumentSize);
      totalSize = parseFloat(totalSize) + parseFloat(amount);
      if (totalSize <= mandate.total_size) {

        updateParams("size", parseFloat(amount))
        setSizeError(false)
      } else {
        updateParams("size", parseFloat(amount))
        setSizeError("Instrument Size must be less than or equal to " + FORMATE_NUMBER(instrumentSize))
      }
    } else {
      updateParams("size", parseFloat(amount))
      setSizeError(false)
    }
  };


  const handlePlaceDateValues = (key, options) => {
    updateParams("placed_date", options)
  };

  useEffect(() => {
    fetchInstrument();
  }, [mandate]);

  useEffect(() => {
    SET_PAGE_TITLE("Add Instrument");
    let ajaxEvent = true;
    if (ajaxEvent) {
      if (uuid) {
        fetchData();
      }

      getMasters();
    }

    return () => {
      ajaxEvent = false;
    };
  }, []);

  return (
    <>
      <DashboardLayout breadcrumbTitle="Add Instrument">
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
                  Add Instrument
                </ArgonTypography>
                <ArgonBox paddingRight="10px">
                  <HasPermissionButton
                    color="primary"
                    permissions={["/dashboard/company/instruments"]}
                    route={GET_ROUTE_NAME("LIST_INSTRUMENTS", {company_uuid: company_uuid})}
                    text={`Back to Instruments`}
                    icon={<ArrowBackRounded />}
                  />
                </ArgonBox>
              </ArgonBox>
              <ArgonBox component="form" role="form" onSubmit={onFormSubmit}>
                <Grid item xs={12} px={3}>
                  {mandate && <>
                    <Grid item sm={12} pr={2} pb={2}>
                      <ArgonBox mr={1}>
                        <ArgonTypography
                          component="span"
                          variant="caption"
                          fontWeight="medium"
                          textTransform="capitalize"
                          fontSize={15}
                        > Total Size (in Cr.) : {FORMATE_NUMBER(mandate.total_size)}</ArgonTypography>
                      </ArgonBox>
                    </Grid>
                  </>}
                  <Grid item container xs={12}>
                    <Grid item xs={3} sm={6} md={4} pr={2}>
                      <FormField
                        type="text"
                        label="Mandate Id*"
                        placeholder="2020-2021/1/1001"
                        value={params['mandate_id']}
                        readOnly
                        disabled
                      />
                    </Grid>
                    <Grid item xs={3} sm={6} md={4} pr={2}>
                      <FormField
                        type="text"
                        label="Category"
                        placeholder="Category"
                        value={params['category']['category_name']}
                        readOnly
                        disabled
                      />
                    </Grid>
                    <Grid item xs={3} sm={6} md={4} pr={2}>
                      <ArgonTypography
                        component="label"
                        variant="caption"
                        fontWeight="bold"
                        textTransform="capitalize"
                        sx={{ marginBottom: "5px", display: "block" }}
                        mt={1}
                      >
                        Sub Category*
                      </ArgonTypography>
                      <Select
                        options={subCategories}
                        value={CHECK_IF_OBJECT_EMPTY(selectedSubCategory)}
                        onChange={hendleSelect}
                        placeholder="Select Category"
                        required
                      />
                    </Grid>
                    <Grid item xs={3} sm={6} md={4} pr={2}>
                      <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
                        <ArgonTypography
                          component="label"
                          variant="caption"
                          fontWeight="bold"
                          textTransform="capitalize"
                        >
                          Instrument*
                        </ArgonTypography>
                      </ArgonBox>
                      <Select
                        sx={{ width: "100%", borderRadius: "10px" }}
                        placeholder="Select Instrument"
                        options={instruments}
                        value={CHECK_IF_OBJECT_EMPTY(selectedInstrument)}
                        onChange={hendleInstrumentSelect}
                        required
                      />
                    </Grid>
                    <Grid item xs={3} sm={6} md={4} pr={2} mb={2}>
                      <FormField
                        type="text"
                        name="remark"
                        label="Remark"
                        placeholder="Remark"
                        value={params['remark']}
                        onChange={(ev) => updateParams("remark", ev.target.value)}
                      />
                    </Grid>
                    <Grid item xs={3} sm={6} md={4} pr={2} mb={2}>
                      <FormField
                        type="number"
                        name="size"
                        label="Size (in Cr.)"
                        placeholder="Size (in Cr.)"
                        value={params['size']}
                        onChange={(ev) => checkSize(ev.target.value)}
                      />
                      {sizeError && (
                        <ErrorTemplate message={sizeError} />
                      )}
                    </Grid>
                    <Grid item xs={3} sm={6} md={4} pr={2}>
                      <ArgonTypography
                        component="label"
                        variant="caption"
                        fontWeight="bold"
                        textTransform="capitalize"
                        sx={{ marginBottom: "5px", display: "block" }}
                      >
                        Complexity Level*
                      </ArgonTypography>
                      <Select
                        options={complexitylavel}
                        value={CHECK_IF_OBJECT_EMPTY(selectedcomplexityLevel)}
                        onChange={hendleComplexityLevel}
                        placeholder="Select Complexity Level"
                        required
                      />
                    </Grid>
                    <Grid item xs={3} sm={6} md={4} pr={2}>
                      <ArgonTypography
                        component="label"
                        variant="caption"
                        fontWeight="bold"
                        textTransform="capitalize"
                        sx={{ marginBottom: "5px", display: "block" }}
                      >
                        Instrument Listing Status
                      </ArgonTypography>
                      <Select
                        options={InstrumentListingStatus}
                        value={CHECK_IF_OBJECT_EMPTY(selectedInstrumentListingStatus)}
                        onChange={hendleInstrumentListingStatus}
                        placeholder="Select Instrument Listing Status"
                      />
                    </Grid>
                    <Grid item xs={3} sm={6} md={4} pr={2} mb={2}>
                      <ArgonBox mb={0.5} ml={0.5} lineHeight={0}>
                        <ArgonTypography
                          component="label"
                          variant="caption"
                          fontWeight="bold"
                          textTransform="capitalize"
                        >
                          Placed Date
                        </ArgonTypography>
                      </ArgonBox>
                      <LocalizationProvider dateAdapter={AdapterMoment}>
                        <DatePicker
                          inputFormat="MM/DD/YYYY"
                          // disableFuture={true}
                          className={"date-picker-width"}
                          name="placed_date"
                          value={params['placed_date']}
                          onChange={(newValue) => handlePlaceDateValues("received_date", newValue)}
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
                    {isEdit &&
                      <Grid item xs={3} sm={6} md={4} pr={2} mb={2}>
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
                  </Grid>
                </Grid>
              </ArgonBox>
              <ArgonBox sx={{ marginTop: "20px" }}>
                <DataTable
                  table={{
                    columns: columns,
                    rows: rows,
                  }}
                  canSearch={false}
                  entriesPerPage={false}
                />
              </ArgonBox>
            </Grid>
          </Grid>
        </ArgonBox>
        <ArgonSnackbar
          color={response}
          icon={response ? response : "error"}
          title={response === "success" ? "Success" : response === "error" ? "Error" : ""}
          content={response === "success" ? "Instrument Successfully Created" : "Instrument creation failed!!"}
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
    </>
  );
}

export default CompanyInstrumentsAdd;
