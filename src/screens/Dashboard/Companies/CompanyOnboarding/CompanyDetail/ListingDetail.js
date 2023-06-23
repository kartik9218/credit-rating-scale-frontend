import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import ArgonTypography from 'components/ArgonTypography'
import { ArgonBox } from 'components/ArgonTheme'
import FormField from 'slots/FormField'
import ArgonSelect from 'components/ArgonSelect'
import { Grid, Button, FormControlLabel, Switch } from '@mui/material'
import DataTable from 'slots/Tables/DataTable'
import ArgonButton from 'components/ArgonButton'
import { ListingDetailSchema } from 'helpers/formikSchema'
import { HTTP_CLIENT, APIFY } from 'helpers/Api'
import ErrorTemplate from 'slots/Custom/ErrorTemplate'
import { useFormik } from 'formik'
import { ArgonSnackbar } from 'components/ArgonTheme'
import { getCompanyOnboardingSchema } from 'helpers/validationSchema'
import { GET_QUERY } from 'helpers/Base'
import { EditOutlined } from '@mui/icons-material'
import { TAB } from 'helpers/constants'
import { DEBOUNCE } from 'helpers/Base'

const ListingDetail = (props) => {
  const { listingStatusOptions, companyUuid, exchangeNameOpitons } = props
  const uuid = GET_QUERY('uuid')
  const [response, setResponse] = useState(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('Please check all required fields')
  const [rows, setRows] = useState([])
  const [listingDetailUuid, setListingDetailUuid] = useState('')
  const [mode, setMode] = useState('ADD')
  const formik = useFormik({
    initialValues: ListingDetailSchema,
    validationSchema: getCompanyOnboardingSchema(TAB.LISTING_DETAIL),
    onSubmit: (values) => handlePerformAjaxRqst(values),
  })
  const { errors, touched, setFieldValue, handleSubmit, handleChange, handleReset, values: formikValue } = formik
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
      accessor: 'exchange',
      Header: 'Exchange Name',
      Cell: (row) => {
        return (
          <span style={{ cursor: 'pointer', fontWeight: '800' }} onClick={() => handleSetFieldValues(row.row.original)}>
            {row.cell.value}
          </span>
        )
      },
    },
    {
      accessor: 'scrip_code',
      Header: 'Scrip Code',
      Cell: (row) => (
        <span style={{ cursor: 'pointer' }} onClick={() => handleSetFieldValues(row.row.original)}>
          {row.cell.value}
        </span>
      ),
    },
    { accessor: 'isin', Header: 'ISIN' },
    { accessor: 'listed_status', Header: 'Listing Status' },
  ]

  useEffect(() => {
    if (!uuid) return
    getAllListingDetails()
  }, [])

  const handleSetFormikValues = (key, options) => {
    setFieldValue(key, options ?? {label:"", value:""})
  }

  const handleResetStates = () => {
    handleReset()
    setMode('ADD')
  }

  const handlePerformAjaxRqst = (listingDetailData) => {
    if (uuid && mode === 'EDIT') {
      HTTP_CLIENT(APIFY('/v1/companies/edit_listing_details'), {
        params: processApiData(listingDetailData),
      })
        .then((data) => {
          setResponse('success')
          setSnackbarOpen(true)
          setSnackbarMessage('Listing Detail updated successfully')
          handleResetStates()
          getAllListingDetails()
        })
        .catch((error) => {
          console.error(error)
          setResponse('error')
          setSnackbarOpen(true)
          setSnackbarMessage('Something went wrong!')
        })
      setMode('ADD')
      return
    }
    HTTP_CLIENT(APIFY('/v1/companies/assign_listing_details'), {
      params: processApiData(listingDetailData),
    })
      .then((data) => {
        setResponse('success')
        setSnackbarOpen(true)
        setSnackbarMessage('Listing added successfully')
        handleResetStates()
        getAllListingDetails()
      })
      .catch((error) => {
        console.error(error)
        setResponse('error')
        setSnackbarOpen(true)
        setSnackbarMessage('Something went wrong!')
      })
    setMode('ADD')
  }

  const getAllListingDetails = () => {
    HTTP_CLIENT(APIFY('/v1/companies/view_listing_details'), {
      company_uuid: uuid,
    })
      .then((response) => {
        const { listing_details } = response
        setRows([...listing_details])
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const onCloseSnackbar = () => {
    setSnackbarOpen(false)
  }

  const handleSetFieldValues = (data) => {
    setMode('EDIT')
    const getListedOptions = () => {
      const { value, name } =
        data['listed_status'] && listingStatusOptions?.find(({ value }) => value === data['listed_status'])
      return { value, label: name }
    }
    const getExchangedOptions = () => {
      const { value, name } = data['exchange'] && exchangeNameOpitons?.find(({ name }) => name === data['exchange'])
      return { value, label: name }
    }
    setListingDetailUuid(data.uuid)
    setFieldValue('exchange_name', getExchangedOptions())
    setFieldValue('scrip_code', data.scrip_code)
    setFieldValue('isin', data.isin)
    setFieldValue('listing_status', getListedOptions())
  }

  const processApiData = (data) => {
    const processedData = {
      company_uuid: companyUuid || uuid,
      exchange: data['exchange_name'].label,
      scrip_code: data['scrip_code'].trim(),
      isin: data['isin'],
      listed_status: data.listing_status?.value || null,
      is_active: data['is_active'],
    }
    if (uuid && mode === 'EDIT') {
      return Object.assign(processedData, {
        uuid: listingDetailUuid,
        company_uuid: uuid,
      })
    }
    return processedData
  }
  console.log(formik)
  const debounceHandler = DEBOUNCE(handleSubmit, 300)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        debounceHandler(e)
      }}
    >
      <Grid container spacing={3} marginTop={'1px'} paddingLeft="1rem" paddingRight="1rem">
        <Grid item xs={12} sm={6} md={4} position="relative">
          <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
            <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
              Exchange Name *
            </ArgonTypography>
          </ArgonBox>
          <ArgonSelect
            isClearable={true}
            placeholder="Select Exchange Name..."
            name="exchange_name"
            defaultValue={{ value: '', label: '' }}
            options={exchangeNameOpitons.map(({ name, value }) => Object.assign({}, { label: name, value }))}
            value={formikValue['exchange_name']}
            onChange={(options) => handleSetFormikValues('exchange_name', options)}
            isInvalid={touched.exchange_name && errors.exchange_name}
          />
          {touched.exchange_name && errors.exchange_name && <ErrorTemplate message={errors?.exchange_name.value} />}
        </Grid>

        <Grid item xs={12} sm={6} md={4} position={'relative'}>
          <FormField
            type="text"
            name="scrip_code"
            label="Scrip Code *"
            placeholder="Scrip Code"
            value={formikValue['scrip_code']}
            onChange={handleChange}
            style={{
              borderColor: `${touched?.scrip_code && errors.scrip_code ? 'red' : 'lightgray'}`,
            }}
          />
          {touched.scrip_code && errors.scrip_code && <ErrorTemplate message={errors?.scrip_code} />}
        </Grid>

        <Grid item xs={12} sm={6} md={4} position="relative">
          <FormField
            type="text"
            name="isin"
            label="ISIN *"
            placeholder="ISIN"
            value={formikValue['isin']}
            onChange={handleChange}
            style={{
              borderColor: `${touched?.isin && errors.isin ? 'red' : 'lightgray'}`,
            }}
          />
          {touched.isin && errors.isin && <ErrorTemplate message={errors?.isin} />}
        </Grid>

        <Grid item xs={12} sm={6} md={4} position="relative">
          <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
            <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
              Listing Status
            </ArgonTypography>
          </ArgonBox>
          <ArgonSelect
            isClearable={true}
            placeholder="Select Listing Status..."
            name="listing_status *"
            defaultValue={{ value: '', label: '' }}
            options={listingStatusOptions.map(({ value, name }) => {
              return { label: name, value }
            })}
            value={formikValue['listing_status']}
            onChange={(options) => handleSetFormikValues('listing_status', options)}
            isInvalid={touched.listing_status && errors.listing_status}
          />
          {touched.listing_status && errors.listing_status && <ErrorTemplate message={errors?.listing_status.value} />}
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <FormControlLabel
            sx={{ display: 'flex', marginLeft: '10px', marginTop: '36px' }}
            control={<Switch name="is_active" onChange={handleChange} checked={formikValue['is_active']} />}
            label={formikValue['is_active'] ? 'Active' : 'Inactive'}
          />
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

ListingDetail.propTypes = {
  listingStatusOptions: PropTypes.array,
  companyUuid: PropTypes.string,
  exchangeNameOpitons: PropTypes.array,
}

export default ListingDetail
