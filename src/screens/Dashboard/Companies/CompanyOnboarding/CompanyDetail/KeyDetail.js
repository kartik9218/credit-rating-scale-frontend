import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import ArgonTypography from 'components/ArgonTypography'
import { ArgonBox } from 'components/ArgonTheme'
import FormField from 'slots/FormField'
import ArgonSelect from 'components/ArgonSelect'
import { Grid, FormControlLabel, Switch, Button } from '@mui/material'
import DataTable from 'slots/Tables/DataTable'
import ArgonButton from 'components/ArgonButton'
import { keyContactDetailsSchema } from 'helpers/formikSchema'
import { getCompanyOnboardingSchema } from 'helpers/validationSchema'
import ErrorTemplate from 'slots/Custom/ErrorTemplate'
import { useFormik } from 'formik'
import { ArgonSnackbar } from 'components/ArgonTheme'
import { HTTP_CLIENT, APIFY } from 'helpers/Api'
import { GET_QUERY } from 'helpers/Base'
import { EditOutlined } from '@mui/icons-material'
import { TAB } from 'helpers/constants'
import { DEBOUNCE } from 'helpers/Base'

const KeyDetail = (props) => {
  const { designationOptions, departmentOptions, companyUuid } = props
  const uuid = GET_QUERY('uuid')
  const [response, setResponse] = useState(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('Please check all required fields')
  const [keyDetailUuid, setKeyDetailUuid] = useState('')
  const [mode, setMode] = useState('ADD')
  const formik = useFormik({
    initialValues: keyContactDetailsSchema,
    validationSchema: getCompanyOnboardingSchema(TAB.KEYCONTACT_DETAILS),
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
    { accessor: 'name', Header: 'Contact Person Name' },
    { accessor: 'email', Header: 'Email Id' },
    { accessor: 'mobile', Header: 'Mobile' },
    { accessor: 'landline', Header: 'Landline', Cell: (row) => <>{row.cell.value || '-'}</> },
    {
      accessor: 'department',
      Header: 'Department',
      Cell: (row) => {
        return <>{row.cell.value?.name ?? '-'}</>
      },
    },
    {
      accessor: 'designation',
      Header: 'Designation',
      Cell: (row) => {
        return <>{row.cell?.value ?? '-'}</>
      },
    },
    {
      accessor: 'is_primary_contact',
      Header: 'Primary Contact',
      Cell: (row) => <>{row.cell.value ? 'yes' : 'no'}</>,
    },
    {
      accessor: 'send_provisional_communication_letter',
      Header: 'Provisional Communication Letter',
      Cell: (row) => <>{row.cell.value ? 'yes' : 'no'}</>,
    },
    {
      accessor: 'send_rating_letter',
      Header: 'Rating Letter',
      Cell: (row) => <>{row.cell.value ? 'yes' : 'no'}</>,
    },
    {
      accessor: 'send_nds_email',
      Header: 'NDS Emails',
      Cell: (row) => <>{row.cell.value ? 'yes' : 'no'}</>,
    },
    {
      accessor: 'send_press_release',
      Header: 'Press Release',
      Cell: (row) => <>{row.cell.value ? 'yes' : 'no'}</>,
    },
    {
      accessor: 'is_key_managerial_person',
      Header: 'Managerial Person',
      Cell: (row) => <>{row.cell.value ? 'yes' : 'no'}</>,
    },
  ]
  const [rows, setRows] = useState([])

  useEffect(() => {
    if (!uuid) return
    getAllKeyDetailList()
  }, [])

  const handleSetFormikValues = (key, options) => {
    setFieldValue(key, options ?? {label:"", value:""})
  }

  const onCloseSnackbar = () => {
    setSnackbarOpen(false)
  }

  const handleResetStates = () => {
    handleReset()
    setMode('ADD')
  }
  console.log(formik)
  const handlePerformAjaxRqst = (keyDetailData) => {
    if (uuid && mode === 'EDIT') {
      HTTP_CLIENT(APIFY('/v1/companies/edit_contact_details'), {
        params: processApiData(keyDetailData),
      })
        .then((success) => {
          setResponse('success')
          setSnackbarOpen(true)
          setSnackbarMessage('Key Details updated successfully')
          handleResetStates()
          getAllKeyDetailList()
        })
        .catch((err) => {
          console.error(err)
          setResponse('error')
          setSnackbarOpen(true)
          setSnackbarMessage('Something went wrong!')
        })
      setMode('ADD')
      return
    }
    HTTP_CLIENT(APIFY('/v1/companies/assign_contact_details'), {
      params: processApiData(keyDetailData),
    })
      .then((success) => {
        setResponse('success')
        setSnackbarOpen(true)
        setSnackbarMessage('Key Details added successfully')
        handleResetStates()
        getAllKeyDetailList()
      })
      .catch((error) => {
        console.error(error)
        setResponse('error')
        setSnackbarOpen(true)
        setSnackbarMessage('Something went wrong!')
      })
    setMode('ADD')
  }

  const getAllKeyDetailList = () => {
    HTTP_CLIENT(APIFY('/v1/companies/view_contact_details'), {
      company_uuid: uuid,
    })
      .then((response) => {
        const { contact_details } = response
        setRows([...contact_details])
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const handleSetFieldValues = (data) => {
    setMode('EDIT')
    const getDesignation = () => {
      const designation = designationOptions.find((option) => option.value === data['designation'])
      return { label: designation?.name ?? "Select Designation...", value: designation?.value ?? "" }
    }
    const getDepartment = (val) => Object.assign({}, { label: val?.name ?? 'Select Department...', value: val?.uuid ?? '' })
    setKeyDetailUuid(data.uuid)
    setFieldValue('contact_person_name', data['name'])
    setFieldValue('email', data['email'])
    setFieldValue('mobile', data['mobile'])
    setFieldValue('landline', data['landline'] || '')
    setFieldValue('designation', getDesignation())
    setFieldValue('department', getDepartment(data['department']))
    setFieldValue('primary_contact', data['is_primary_contact'] ?? false)
    setFieldValue('provisional_communication_letter', data['send_provisional_communication_letter'] ?? false)
    setFieldValue('rating_letter', data['send_rating_letter'] ?? false)
    setFieldValue('nds_emails', data['send_nds_email'] ?? false)
    setFieldValue('press_release', data['send_press_release'] ?? false)
    setFieldValue('is_key_managerial_person', data['is_key_managerial_person'] ?? false)
  }
  const processApiData = (data) => {
    const processedData = {
      department_uuid: data['department']?.value || "",
      company_uuid: companyUuid,
      name: data['contact_person_name'],
      email: data['email'],
      mobile: data['mobile'],
      landline: data['landline'],
      designation: data['designation']?.value || "",
      is_primary_contact: data['primary_contact'],
      send_provisional_communication_letter: data['provisional_communication_letter'],
      send_rating_letter: data['rating_letter'],
      send_nds_email: data['nds_emails'],
      send_press_release: data['press_release'],
      is_key_managerial_person: data['is_key_managerial_person'],
      stakeholder_uuid: null,
      type: 'COMPANY',
    }
    if (uuid) {
      return Object.assign(processedData, {
        uuid: keyDetailUuid,
        company_uuid: uuid,
      })
    }
    return processedData
  }

  const debounceHandler = DEBOUNCE(handleSubmit, 300)
  console.log(formik)
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        debounceHandler(e)
      }}
    >
      <Grid container spacing={3} marginTop={'1px'} paddingLeft="1rem" paddingRight="1rem">
        <Grid item xs={12} sm={6} md={4} position="relative">
          <FormField
            type="text"
            name="contact_person_name"
            label="Contact Person Name *"
            placeholder="Contact Person Name"
            value={formikValue.contact_person_name}
            onChange={handleChange}
            style={{
              borderColor: `${touched?.contact_person_name && errors.contact_person_name ? 'red' : 'lightgray'}`,
            }}
          />
          {touched.contact_person_name && errors.contact_person_name && (
            <ErrorTemplate message={errors?.contact_person_name} />
          )}
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
            <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
              Department
            </ArgonTypography>
          </ArgonBox>
          <ArgonSelect
            isClearable={true}
            placeholder="Select Department..."
            name="department"
            value={formikValue.department}
            onChange={(options) => handleSetFormikValues('department', options)}
            defaultValue={{ value: '', label: '' }}
            options={departmentOptions}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
            <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
              Designation
            </ArgonTypography>
          </ArgonBox>
          <ArgonSelect
            isClearable={true}
            placeholder="Select Designation..."
            name="designation"
            value={formikValue.designation}
            onChange={(options) => handleSetFormikValues('designation', options)}
            defaultValue={{ value: '', label: '' }}
            options={designationOptions.map(({ name, value }) => {
              return { label: name, value: value }
            })}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} position="relative">
          <FormField
            type="text"
            name="email"
            label="Email Id *"
            value={formikValue.email}
            onChange={handleChange}
            placeholder="Email Address"
            style={{
              borderColor: `${touched?.email && errors.email ? 'red' : 'lightgray'}`,
            }}
          />
          {touched.email && errors.email && <ErrorTemplate message={errors?.email} />}
        </Grid>
        <Grid item xs={12} sm={6} md={4} position="relative">
          <FormField
            type="text"
            name="mobile"
            value={formikValue.mobile}
            onChange={handleChange}
            label="Mobile"
            placeholder="Mobile Number"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FormField
            type="text"
            name="landline"
            value={formikValue.landline}
            onChange={handleChange}
            label="Landline"
            placeholder="Landline"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControlLabel
            sx={{ paddingLeft: '20px' }}
            control={<Switch name="primary_contact" onChange={handleChange} checked={formikValue['primary_contact']} />}
            label="Primary Contact"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControlLabel
            sx={{ paddingLeft: '20px' }}
            control={
              <Switch
                name="is_key_managerial_person"
                onChange={handleChange}
                checked={formikValue['is_key_managerial_person']}
              />
            }
            label="Is Key Managerial Person"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControlLabel
            sx={{ paddingLeft: '20px' }}
            control={<Switch name="rating_letter" onChange={handleChange} checked={formikValue['rating_letter']} />}
            label="Send Rating Letter"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControlLabel
            sx={{ paddingLeft: '20px' }}
            control={<Switch name="nds_emails" onChange={handleChange} checked={formikValue['nds_emails']} />}
            label="Send NDS Emails"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControlLabel
            sx={{ paddingLeft: '20px' }}
            control={<Switch name="press_release" onChange={handleChange} checked={formikValue['press_release']} />}
            label="Send Press Release"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <FormControlLabel
            sx={{ display: 'flex', marginLeft: '10px' }}
            control={
              <Switch
                name="provisional_communication_letter"
                onChange={handleChange}
                checked={formikValue['provisional_communication_letter']}
              />
            }
            label="Send Provisional Communication Letter"
          />
        </Grid>
      </Grid>

      <Grid
        container
        md={12}
        paddingRight="1rem"
        sx={{ display: 'flex', justifyContent: 'end', gap: '10px', marginTop: '4px' }}
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

KeyDetail.propTypes = {
  departmentOptions: PropTypes.array,
  designationOptions: PropTypes.array,
  companyUuid: PropTypes.string,
}

export default KeyDetail
