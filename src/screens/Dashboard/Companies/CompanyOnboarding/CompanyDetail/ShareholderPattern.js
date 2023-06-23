import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import ArgonTypography from 'components/ArgonTypography'
import { ArgonBox } from 'components/ArgonTheme'
import FormField from 'slots/FormField'
import ArgonSelect from 'components/ArgonSelect'
import ArgonBadge from 'components/ArgonBadge'
import { Grid, TextField, Button, FormControlLabel, Switch } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import DataTable from 'slots/Tables/DataTable'
import ArgonButton from 'components/ArgonButton'
import { HTTP_CLIENT, APIFY } from 'helpers/Api'
import { EditOutlined } from '@mui/icons-material'
import { useFormik } from 'formik'
import { getCompanyOnboardingSchema } from 'helpers/validationSchema'
import { shareholderPatternSchema } from 'helpers/formikSchema'
import { ArgonSnackbar } from 'components/ArgonTheme'
import ErrorTemplate from 'slots/Custom/ErrorTemplate'
import moment from 'moment'
import { GET_QUERY } from 'helpers/Base'
import { TAB } from 'helpers/constants'
import { PercentOutlined } from '@mui/icons-material'
import { DEBOUNCE } from 'helpers/Base'
import { FORMATE_DATE } from 'helpers/Base'

const ShareholderPattern = (props) => {
  const { companyUuid, holdingTypeOptions } = props
  const uuid = GET_QUERY('uuid')
  const [response, setResponse] = useState(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('Please check all required fields')
  const [shareHolderUuid, setShareHolderUuid] = useState('')
  const [existingShareHoldingDates, setExistingShareHoldingDates] = useState([])
  const [total, setTotal] = useState(0.0)
  const [mode, setMode] = useState('ADD')
  const [rows, setRows] = useState([])
  const formik = useFormik({
    initialValues: shareholderPatternSchema,
    validationSchema: getCompanyOnboardingSchema(TAB.SHAREHOLDER_PATTERN),
    onSubmit: (values) => handlePerformAjaxRqst(values),
  })
  const {
    errors,
    setFieldTouched,
    setFieldError,
    touched,
    setFieldValue,
    handleSubmit,
    handleChange,
    handleReset,
    values: formikValue,
  } = formik
  const columns = [
    {
      accessor: 'action',
      Header: 'Action',
      Cell: (row) => (
        <Button
          onClick={() => {
            handleReset()
            handleSetFieldValues(row.row.original)
          }}
        >
          <EditOutlined />
        </Button>
      ),
    },
    {
      accessor: 'as_on_date',
      Header: 'As on Date',
      Cell: (row) => {
        return <span style={{ cursor: 'pointer', fontWeight: '800' }}>{FORMATE_DATE(row.cell.value)}</span>
      },
    },
    { accessor: 'holding_type', Header: 'Holding' },
    { accessor: 'holder_name', Header: 'Shareholder Name' },
    { accessor: 'holding_percentage', Header: 'Percentage', Cell: (row) => <>{row.cell.value.toFixed(2)}</> },
    { accessor: 'pledge_share', Header: 'Pledge' },
  ]

  // useEffect(() => {
  //   if (!uuid) return;
  //   getAllShareholdingList();
  // }, []);

  useEffect(() => {
    getAllShareholdingList()
  }, [moment(formikValue['as_on_date']).format('yyyy-MM-dd')])

  useEffect(() => {
   getShareHoldingDates()
  }, [])

  const getShareHoldingDates = async () => {
    try {
      const { shareholding_dates } = await HTTP_CLIENT(APIFY('/v1/companies/view_shareholding_dates'), {
        company_uuid: uuid,
      })
      setExistingShareHoldingDates(() => {
        return shareholding_dates.map(({ as_on_date }) =>
          Object.assign({}, { label: moment(as_on_date).format('DD/MM/YYYY'), value: as_on_date }),
        )
      })
    } catch (err) {
      console.error(err)
    }
  }

  const handleSetFormikValues = (key, value) => setFieldValue(key, value ?? {label:"", value:""})

  const onCloseSnackbar = () => setSnackbarOpen(false)

  const handleShowSnackBar = (messageType) => (message) => {
    setSnackbarOpen(true)
    setResponse(messageType)
    setSnackbarMessage(message)
  }

  const handlePerformAjaxRqst = (shareholderData) => {
    if (uuid && mode === 'EDIT') {
      HTTP_CLIENT(APIFY('/v1/companies/edit_shareholdings'), {
        params: processApiData(shareholderData),
      })
        .then((success) => {
          handleShowSnackBar('success')('ShareHolder Details updated successfully')
          // handleResetStates();
          getAllShareholdingList()
          handleReset()
          setMode('ADD')
        })
        .catch((error) => {
          console.error(error)
          // handleShowSnackBar("error")("Something went wrong!");
          handleShowSnackBar('error')(error.response.data.error)
          setMode('EDIT')
        })
      return
    }
    HTTP_CLIENT(APIFY('/v1/companies/assign_shareholdings'), {
      params: processApiData(shareholderData),
    })
      .then((data) => {
        const { success } = data
        if (success) {
          handleShowSnackBar('success')('ShareHolder Details added successfully')
          // handleResetStates();
          handleReset()
          getAllShareholdingList()
          getShareHoldingDates()
        }
      })
      .catch((error) => {
        handleShowSnackBar('error')(error.response.data.error)
      })
    setMode('ADD')
  }

  const getAllShareholdingList = () => {
    const getApiString = () => {
      if (formikValue['as_on_date']) {
        return `/v1/companies/view_shareholdings?as_on_date=${moment(formikValue['as_on_date']).format('YYYY-MM-DD')}`
      }
      return '/v1/companies/view_shareholdings'
    }
    HTTP_CLIENT(APIFY(getApiString()), {
      company_uuid: uuid,
    })
      .then((response) => {
        const { shareholdings } = response
        let totalPercentage = 0
        shareholdings.forEach(({ holding_percentage }) => {
          totalPercentage += holding_percentage
        })
        !!shareholdings.length && setFieldValue('as_on_date', shareholdings[0].as_on_date)
        setTotal(totalPercentage)
        setRows(shareholdings)
      })
      .catch((error) => {
        console.error(error)
      })
  }

  const handleSetFieldValues = (data) => {
    setMode('EDIT')
    const getHoldingOptions = () => {
      const { value, name } = holdingTypeOptions.find(({ name }) => name === data['holding_type'])
      return { value, label: name }
    }
    setShareHolderUuid(data.uuid)
    setFieldValue('holding_type', getHoldingOptions())
    setFieldValue('holder_name', data.holder_name)
    setFieldValue('pledge_share', data?.pledge_share ? data?.pledge_share + '' : '')
    setFieldValue('holding_percentage', Number(data.holding_percentage.toFixed(2)))
    setFieldValue('as_on_date', data['as_on_date'])
  }

  const processApiData = (data) => {
    const processedData = {
      company_uuid: companyUuid || uuid,
      holding_type: data['holding_type']?.label,
      holder_name: data['holder_name'],
      pledge_share: data['pledge_share'] ? +data['pledge_share'] : null,
      holding_percentage: +data['holding_percentage'],
      as_on_date: moment(data['as_on_date']).format('YYYY/MM/DD'),
      is_active: data['is_active'],
    }
    if (uuid && mode === 'EDIT') {
      return Object.assign(processedData, {
        uuid: shareHolderUuid,
        company_uuid: uuid || companyUuid,
      })
    }
    return processedData
  }

  const handlePopulateValues = () => {
    const date = formikValue['existing_shareholder_details'].value
    const getParams = () => {
      return {
        company_uuid: uuid,
        as_on_date: moment(date).format('YYYY-MM-DD'),
        assigned_as_on_date: moment(formikValue['as_on_date']).format('YYYY-MM-DD'),
      }
    }
    if (!formikValue['as_on_date']) {
      setFieldError('as_on_date', 'Please Select as on date')
      setFieldTouched('as_on_date')
      return
    }
    HTTP_CLIENT(APIFY(`/v1/companies/copy_shareholdings`), {
      params: getParams(),
    })
      .then((response) => {
        if (response.success) {
          getAllShareholdingList()
          handleShowSnackBar('success')('ShareHolders copied successfully')
        }
      })
      .catch((err) => {
        console.error(err)
      })
  }

  const debounceHandler = DEBOUNCE(handleSubmit, 300)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        debounceHandler(e)
      }}
    >
      <Grid container spacing={1} marginTop={'1px'} paddingLeft="1rem" paddingRight="1rem">
        <Grid item xs={12}>
          <ArgonBox border="1px solid lightgrey" padding="1rem" paddingBottom="1.2rem" borderRadius="10px">
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={6}>
                <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
                  <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
                    Existing Shareholding Details
                  </ArgonTypography>
                </ArgonBox>
                <ArgonSelect
                  isClearable={true}
                  placeholder="Select Date..."
                  name={'existing_shareholder_details'}
                  value={formikValue['existing_shareholder_details']}
                  options={existingShareHoldingDates}
                  onChange={(options) => handleSetFormikValues('existing_shareholder_details', options)}
                />
                <Button
                  variant="contained"
                  onClick={handlePopulateValues}
                  sx={{
                    'color': 'white !important',
                    'background': '#2fcea2',
                    'borderRadius': '20px',
                    'fontSize': '12px',
                    'margin': '4px 0px',
                    'position': 'relative',
                    'zIndex': '0',
                    ':hover': { background: '#30ccb4 !important' },
                    ':active': { background: '#30ccb4 !important' },
                  }}
                >
                  Copy Existing ShareHolding Pattern
                </Button>
              </Grid>

              <Grid item xs={12} sm={6} md={6} mt={0.6} position="relative">
                <ArgonBox mb={1} ml={0.5} lineHeight={0}>
                  <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
                    As on Date*
                  </ArgonTypography>
                </ArgonBox>
                <LocalizationProvider dateAdapter={AdapterMoment}>
                  <DatePicker
                    inputFormat="DD/MM/YYYY"
                    className={'date-picker-width'}
                    name="as_on_date"
                    value={formikValue['as_on_date']}
                    clearable
                    onChange={(newValue) => handleSetFormikValues('as_on_date', newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        sx={{
                          '.MuiOutlinedInput-root': {
                            display: 'flex',
                            borderRadius: '3px',
                            paddingLeft: '0px',
                            justifyContent: 'space-between !important',
                            borderColor: `${touched.as_on_date && errors.as_on_date ? 'red' : 'lightgray'}`,
                          },
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
                {touched.as_on_date && errors.as_on_date && (
                  <ArgonTypography
                    component="label"
                    variant="caption"
                    fontWeight="bold"
                    textTransform="capitalize"
                    position="absolute"
                    bottom="23px"
                    left="28px"
                    style={{ color: 'red' }}
                  >
                    {errors.as_on_date}
                  </ArgonTypography>
                )}
              </Grid>
            </Grid>
          </ArgonBox>
        </Grid>

        <Grid item mt={2} xs={12}>
          <ArgonBox border="1px solid lightgrey" padding=".8rem" borderRadius="10px">
            <Grid container xs={12} paddingX={'1rem'} spacing={3}>
              <Grid item xs={12} sm={6} md={4} position={'relative'}>
                <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
                  <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
                    Holding Type *
                  </ArgonTypography>
                </ArgonBox>
                <ArgonSelect
                  isClearable={true}
                  placeholder="Select Holding Type"
                  name="holding_type"
                  defaultValue={{ value: '', label: '' }}
                  options={holdingTypeOptions.map(({ name, value }) => Object.assign({}, { value, label: name }))}
                  value={formikValue['holding_type']}
                  onChange={(options) => handleSetFormikValues('holding_type', options)}
                  isInvalid={touched.holding_type && errors.holding_type}
                />
                {touched.holding_type && errors.holding_type && <ErrorTemplate message={errors?.holding_type.value} />}
              </Grid>

              <Grid item xs={12} sm={6} md={4} position="relative">
                <FormField
                  type="text"
                  name="holder_name"
                  label="Shareholder Name"
                  placeholder="Shareholder Name"
                  value={formikValue['holder_name']}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4} position="relative">
                <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
                  Percentage *
                </ArgonTypography>
                <ArgonBox
                  sx={{
                    border: '1px solid lightgray',
                    display: 'flex',
                    borderRadius: '5px',
                    alignItems: 'center',
                    marginTop: '7px',
                    borderColor: `${touched?.holding_percentage && errors?.holding_percentage ? 'red' : 'lightgray'}`,
                  }}
                  style={{
                    borderColor: `${touched?.holding_percentage && errors.holding_percentage ? 'red' : 'lightgray'}`,
                  }}
                >
                  <FormField
                    type="number"
                    name="holding_percentage"
                    placeholder="Percentage"
                    value={formikValue['holding_percentage']}
                    onChange={handleChange}
                    // onChange={(val) => {
                    //   handleSetPercentage(val)
                    // }}
                    sx={{ border: 'none' }}
                  />
                  <PercentOutlined sx={{ color: 'gray', marginRight: '4px' }} />
                </ArgonBox>
                {touched.holding_percentage && errors.holding_percentage && (
                  <ErrorTemplate message={errors.holding_percentage} />
                )}
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormField
                  type="string"
                  name="pledge_share"
                  label="Pledge"
                  placeholder="Pledge"
                  value={formikValue['pledge_share']}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4} display={'flex'} justifyContent={''}>
                <ArgonBox mb={1} ml={''} lineHeight={0} display="flex" flexDirection="column">
                  <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
                    Total %
                  </ArgonTypography>
                  <ArgonTypography variant="p" padding="1rem" paddingLeft="0">
                    <ArgonBadge
                      badgeContent={`${total.toFixed(2)}` + '%'}
                      color={`${total.toFixed(2) < 100 ? 'error' : 'success'}`}
                      container
                    />
                  </ArgonTypography>
                </ArgonBox>

                <FormControlLabel
                  sx={{ display: 'flex', marginLeft: '60px', marginTop: '10px' }}
                  control={<Switch name="is_active" onChange={handleChange} checked={formikValue['is_active']} />}
                  label={formikValue['is_active'] ? 'Active' : 'Inactive'}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}></Grid>
            </Grid>
          </ArgonBox>
        </Grid>
      </Grid>

      <Grid
        container
        md={12}
        paddingRight="1rem"
        sx={{ display: 'flex', justifyContent: 'end', gap: '10px', marginTop: '19px' }}
      >
        <ArgonButton
          color="error"
          onClick={() => {
            handleReset()
            setMode('ADD')
          }}
        >
          Reset
        </ArgonButton>
        <ArgonButton color="primary" type={'submit'}>
          {mode === 'EDIT' ? 'Update' : 'Add'}
        </ArgonButton>
      </Grid>
      <ArgonBox sx={{ marginTop: '20px' }}>
        <DataTable
          table={{
            columns: columns,
            rows: rows,
          }}
          canSearch={false}
          entriesPerPage={false}
        />
      </ArgonBox>
      <ArgonSnackbar
        color={response}
        icon={response ? response : 'error'}
        title={response === 'success' ? 'Success' : response === 'error' ? 'Error' : ''}
        content={snackbarMessage}
        translate="yes"
        dateTime=""
        open={snackbarOpen}
        close={onCloseSnackbar}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      />
    </form>
  )
}

ShareholderPattern.propTypes = {
  companyUuid: PropTypes.string,
  holdingTypeOptions: PropTypes.array,
}

export default ShareholderPattern

// const handleAddShareholder = () => {
//   validateForm().then(formFields => {
//   for(const key in formFields) {
//     setFieldError(key, formFields[key]);
//     setFieldTouched(key);
//   }
//    }).catch(err => console.log(err));
//   if(isValid) {
//     setShareHoldersList((prev) => {
//     const {existing_shareholder_details , ...values} =  formikValue;
//     return [...prev, ...values];
//     })
//   }
// }
