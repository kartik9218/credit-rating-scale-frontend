import React, { useState, useEffect, useCallback, createRef } from 'react'
import PropTypes from 'prop-types'
import { Grid, Button } from '@mui/material'
import ArgonTypography from 'components/ArgonTypography'
import { ArgonBox } from 'components/ArgonTheme'
import FormField from 'slots/FormField'
import ArgonSelect from 'components/ArgonSelect'
import DataTable from 'slots/Tables/DataTable'
import ArgonButton from 'components/ArgonButton'
import { addressDetailSchema } from 'helpers/formikSchema'
import { HTTP_CLIENT, APIFY } from 'helpers/Api'
import ErrorTemplate from 'slots/Custom/ErrorTemplate'
import { useFormik } from 'formik'
import { ArgonSnackbar } from 'components/ArgonTheme'
import { getCompanyOnboardingSchema } from 'helpers/validationSchema'
import { GET_QUERY } from 'helpers/Base'
import { EditOutlined } from '@mui/icons-material'
import { TAB } from 'helpers/constants'
import { DEBOUNCE } from 'helpers/Base'

const AddressDetail = (props) => {
  const { addressTypeOptions, countryOptions, companyUuid } = props
  const [rows, setRows] = useState([])
  const formSubmitCount = createRef(0)
  const [stateOptions, setStateOptions] = useState([])
  const [cityOptions, setCityOptions] = useState([])
  const [response, setResponse] = useState(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [addressUuid, setAddressUuid] = useState('')
  const [snackbarMessage, setSnackbarMessage] = useState('Please check all required fields')
  const [mode, setMode] = useState('ADD')
  const uuid = GET_QUERY('uuid')
  const formik = useFormik({
    initialValues: addressDetailSchema,
    validationSchema: getCompanyOnboardingSchema(TAB.ADDRESS_DETAIL),
    onSubmit: (values) => handlePerformAjaxRqst(values),
  })
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
    { accessor: 'type', Header: 'Address Type' },
    { accessor: 'address', Header: 'Address' },
    { accessor: 'pincode', Header: 'Pincode' },
    {
      accessor: 'company_country',
      Header: 'Country',
      Cell: (row) => {
        return <>{row.cell.value.name}</>
      },
    },
    {
      accessor: 'company_state',
      Header: 'State',
      Cell: (row) => {
        return <>{row.cell.value.name}</>
      },
    },
    {
      accessor: 'company_city',
      Header: 'City',
      Cell: (row) => {
        return <>{row.cell.value.name}</>
      },
    },
  ]

  const { errors, touched, setFieldValue, handleSubmit, handleChange, handleReset, values: formikValue } = formik

  useEffect(() => {
    if (!uuid) return
    getAllAddressList()
  }, [])

  useEffect(() => {
    if (!formikValue.country?.value) return
    getStateOptions()
  }, [formikValue['country']?.value])

  useEffect(() => {
    if (!formikValue.state?.value) return
    getCityOptions()
  }, [formikValue['state']?.value])

  const getStateOptions = () => {
    HTTP_CLIENT(APIFY('/v1/countries/states/view'), { params: { country_uuid: formikValue.country['value'] } })
      .then((data) => {
        const { states } = data
        setStateOptions([...states])
      })
      .catch((error) => {
        console.error(error)
      })
  }

  console.log(formikValue, 'val')

  const getCityOptions = () => {
    HTTP_CLIENT(APIFY('/v1/states/cities/view'), { params: { state_uuid: formikValue.state['value'] } })
      .then((data) => {
        const { cities } = data
        setCityOptions([...cities])
      })
      .catch((error) => {
        console.error(error)
      })
  }

  const handleResetStates = () => {
    handleReset()
    setMode('ADD')
  }

  const handleShowSnackBar = (messageType) => (message) => {
    setSnackbarOpen(true)
    setResponse(messageType)
    setSnackbarMessage(message)
  }

  const handlePerformAjaxRqst = (addressData) => {
    if (uuid && mode === 'EDIT') {
      HTTP_CLIENT(APIFY('/v1/companies/edit_address'), { params: processApiData(addressData) })
        .then((success) => {
          handleShowSnackBar('success')('Address updated successfully')
          handleResetStates()
          getAllAddressList()
        })
        .catch((error) => {
          handleShowSnackBar('error')('Something went wrong!')
        })
      setMode('ADD')
      return
    }
    HTTP_CLIENT(APIFY('/v1/companies/assign_address'), { params: processApiData(addressData) })
      .then((data) => {
        handleShowSnackBar('success')('Address added successfully')
        handleResetStates()
        getAllAddressList()
      })
      .catch((error) => {
        handleShowSnackBar('error')('Something went wrong!')
      })
    setMode('ADD')
  }

  const handleSetFieldValues = (data) => {
    setMode('EDIT')
    const getOptions = (args) => Object.assign({}, { label: args.name, value: args.uuid })
    setAddressUuid(data.uuid)
    setFieldValue('address_1', data?.address_1 || '')
    setFieldValue('address_2', data?.address_2 || '')
    setFieldValue('landmark', data?.landmark || '')
    setFieldValue('pincode', data?.pincode)
    setFieldValue('address_type', { label: data?.type, value: data?.type })
    setFieldValue('country', getOptions(data?.company_country))
    setFieldValue('state', getOptions(data?.company_state))
    setFieldValue('city', getOptions(data?.company_city))
  }

  const getAllAddressList = () => {
    HTTP_CLIENT(APIFY('/v1/companies/view_address'), {
      company_uuid: uuid,
    })
      .then((response) => {
        const { addresses } = response
        setRows([...addresses])
      })
      .catch((err) => {
        console.error(err)
      })
  }

  const processApiData = (data) => {
    const processedData = {
      company_uuid: companyUuid,
      address_2: data['address_2'],
      landmark: data['landmark'],
      address_1: data['address_1'],
      type: data['address_type']?.label,
      lat: 0,
      lng: 0,
      city_uuid: data['city']?.value,
      state_uuid: data['state']?.value,
      country_uuid: data['country']?.value,
      pincode: data['pincode'],
    }
    if (uuid) {
      return Object.assign(processedData, {
        uuid: addressUuid,
        company_uuid: uuid,
      })
    }
    return processedData
  }

  const handleSetFormikValues = (key, options) => {
    setFieldValue(key, options ?? {label:"", value:""})
  }

  const onCloseSnackbar = () => {
    setSnackbarOpen(false)
  }

  const debounceHandler = DEBOUNCE(handleSubmit, 300)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        debounceHandler(e)
      }}
    >
      <Grid container spacing={3} marginTop={'1px'} paddingLeft="1rem" paddingRight="1rem">
        <Grid item xs={3} sm={6} md={4} position={'relative'}>
          <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
            <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
              Address Type*
            </ArgonTypography>
          </ArgonBox>
          <ArgonSelect
            isClearable={true}
            placeholder="Select Address Type..."
            name="address_type"
            value={formikValue['address_type']}
            onChange={(options) => handleSetFormikValues('address_type', options)}
            isInvalid={touched.address_type && errors.address_type}
            options={addressTypeOptions.map(({ value, name }) => {
              return { value: name, label: value }
            })}
          />
          {touched.address_type && errors.address_type && <ErrorTemplate message={errors.address_type.value} />}
        </Grid>

        <Grid item xs={3} sm={6} md={4} position={'relative'}>
          <FormField
            type="text"
            name="address_1"
            value={formikValue['address_1']}
            onChange={handleChange}
            label="Address 1 *"
            placeholder="Adress 1"
            style={{
              borderColor: `${touched?.address_1 && errors.address_1 ? 'red' : 'lightgray'}`,
            }}
          />
          {touched.address_1 && errors.address_1 && <ErrorTemplate message={errors?.address_1} />}
        </Grid>

        <Grid item xs={3} sm={6} md={4} position={'relative'}>
          <FormField
            type="text"
            name="address_2"
            value={formikValue['address_2']}
            onChange={handleChange}
            label="Address 2"
            placeholder="Address 2"
          />
        </Grid>

        <Grid item xs={3} sm={6} md={4} position="relative">
          <FormField
            type="text"
            name="landmark"
            value={formikValue['landmark']}
            onChange={handleChange}
            label="Landmark"
            placeholder="Landmark"
          />
        </Grid>

        <Grid item xs={3} sm={6} md={4} position={'relative'}>
          <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
            <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
              Country*
            </ArgonTypography>
          </ArgonBox>
          <ArgonSelect
            isClearable={true}
            placeholder="Select Country..."
            name="country"
            defaultValue={{ value: '', label: '' }}
            value={formikValue['country']}
            onChange={(options) => handleSetFormikValues('country', options)}
            options={countryOptions.map(({ uuid, name }) => {
              return { value: uuid, label: name }
            })}
            isInvalid={touched.country && errors.country}
          />
          {touched.country && errors.country && <ErrorTemplate message={errors?.country.value} />}
        </Grid>

        <Grid item xs={3} sm={6} md={4} position="relative">
          <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
            <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
              State*
            </ArgonTypography>
          </ArgonBox>
          <ArgonSelect
            placeholder="Select State..."
            isClearable={true}
            name="state"
            // isDisabled={!stateOptions.length}
            defaultValue={{ value: '', label: '' }}
            value={formikValue['state']}
            onChange={(options) => handleSetFormikValues('state', options)}
            options={stateOptions.map(({ name, uuid }) => {
              return { value: uuid, label: name }
            })}
            isInvalid={stateOptions.length && touched.state && errors.state}
          />
          {!!stateOptions.length && stateOptions.length && touched.state && errors.state && (
            <ErrorTemplate message={errors.state.value} />
          )}
        </Grid>

        <Grid item xs={3} sm={6} md={4} position="relative">
          <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
            <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
              City*
            </ArgonTypography>
          </ArgonBox>
          <ArgonSelect
            isClearable={true}
            placeholder="Select City..."
            name="city"
            defaultValue={{ value: '', label: '' }}
            value={formikValue['city']}
            onChange={(options) => handleSetFormikValues('city', options)}
            options={cityOptions.map(({ name, uuid }) => {
              return { value: uuid, label: name }
            })}
            isInvalid={cityOptions.length && touched.city && errors.city}
          />
          {!!cityOptions.length && touched.city && errors.city && <ErrorTemplate message={errors.city.value} />}
        </Grid>
        <Grid item xs={3} sm={6} md={4} position={'relative'}>
          <FormField
            type="text"
            name="pincode"
            value={formikValue['pincode']}
            onChange={handleChange}
            label="Pin Code *"
            placeholder="Pin Code"
            style={{
              borderColor: `${touched.pincode && errors.pincode ? 'red' : 'lightgray'}`,
            }}
          />
          {touched.pincode && errors.pincode && <ErrorTemplate message={errors?.pincode} />}
        </Grid>
      </Grid>

      <Grid
        container
        md={12}
        paddingRight="1rem"
        sx={{ display: 'flex', justifyContent: 'end', gap: '10px', marginTop: '19px' }}
      >
        <ArgonButton color="error" onClick={handleResetStates}>
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

AddressDetail.propTypes = {
  addressTypeOptions: PropTypes.array,
  countryOptions: PropTypes.array,
  companyUuid: PropTypes.string,
}

export default AddressDetail
