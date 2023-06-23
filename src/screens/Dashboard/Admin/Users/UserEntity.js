import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Grid from '@mui/material/Grid'
import { ArrowBackRounded } from '@mui/icons-material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { TextField, Switch } from '@mui/material'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { useFormik } from 'formik'
import moment from 'moment'
import { GET_ROUTE_NAME, SET_PAGE_TITLE, GET_QUERY } from 'helpers/Base'
import { HTTP_CLIENT, APIFY } from 'helpers/Api'
import ArgonButton from 'components/ArgonButton'
import ArgonTypography from 'components/ArgonTypography'
import { ArgonBox } from 'components/ArgonTheme'
import FormField from 'slots/FormField'
import ArgonSelect from 'components/ArgonSelect'
import { DashboardLayout } from 'layouts'
import { ArgonSnackbar } from 'components/ArgonTheme'
import HasPermissionButton from 'slots/Custom/Buttons/HasPermissionButton'
import { getUserSchema } from 'helpers/validationSchema'
import ErrorTemplate from 'slots/Custom/ErrorTemplate'
import CardWrapper from 'slots/Cards/CardWrapper'

const UserEntity = () => {
  const navigate = useNavigate()
  const DEFAULT_SNACKBAR_MESSAGE = 'Please check all the required fields'
  const [snackbarMessage, setSnackbarMessage] = useState(DEFAULT_SNACKBAR_MESSAGE)
  const [rolesOption, setRoleOptions] = useState([])
  const [maritalStatusOption, setMaritalStatusOptions] = useState([])
  const [genderOption, setGenderOptions] = useState([])
  const [userTypeOption, setUserTypeOptions] = useState([])
  const [departmentOption, setDepartmentOptions] = useState([])
  const [designationOption, setDesignationOptions] = useState([])
  const [locationOption, setLocationOptions] = useState([])
  const [firstReportingPersonOption, setFirstReportingPersonOptions] = useState([])
  const [response, setResponse] = useState(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [loginType, setLoginType] = useState('AZURE')
  const uuid = GET_QUERY('uuid')
  const formik = useFormik({
    initialValues: {
      full_name: '',
      gender: { label: 'Select Gender...', value: '' },
      date_of_birth: '',
      marital_status: { label: 'Select Marital Status...', value: '' },
      contact_number: '',
      email: '',
      login_type: { label: 'Select Login Type...', value: '' },
      password: '',
      address: '',
      office_address: '',
      employment_status: { label: 'Select Employment Status...', value: '' },
      date_of_joining: '',
      date_of_termination: null,
      selected_role: [],
      department: { label: 'Select Department...', value: '' },
      designation: { label: 'Select Designation...', value: '' },
      location: { label: 'Select Location...', value: '' },
      office_contact_number: '',
      first_reporting_person: { label: 'Select First Reporting Person...', value: '' },
      is_active: false,
    },
    validationSchema: getUserSchema(loginType),
    onSubmit: (values) => handlePerformAjaxRqst(values),
  })
  const { errors, touched, setFieldValue, handleSubmit, handleChange, values: formikValue } = formik

  useEffect(() => {
    SET_PAGE_TITLE(`Add User`)
    let ajaxEvent = true
    if (ajaxEvent) {
      getRoles()
      getDepartments()
      getFirstReportingPerson()
      getMasters()
    }
    return () => {
      ajaxEvent = false
    }
  }, [])

  useEffect(() => {
    if (uuid) {
      SET_PAGE_TITLE(`Edit User`)
      getUserData()
    }
  }, [uuid])

  const handlePerformAjaxRqst = (userData) => {
    if (uuid) {
      HTTP_CLIENT(APIFY('/v1/users/edit'), { params: processUserData(userData) })
        .then((response) => {
          if (response['success']) {
            setResponse('success')
            navigate(GET_ROUTE_NAME('LIST_USER'), { state: { success: true, type: 'UPDATE' } })
            return
          }
        })
        .catch((err) => {
          setResponse('error')
          setSnackbarMessage(`Please Check the required Fields.`)
          setSnackbarOpen(true)
        })
      return
    }
    HTTP_CLIENT(APIFY('/v1/users/create'), { params: processUserData(userData) })
      .then((response) => {
        if (response['success']) {
          setResponse('success')
          formik.resetForm()
          setSnackbarMessage(`User Successfully Created`)
          setSnackbarOpen(true)
          if (snackbarOpen == false) {
            navigate(GET_ROUTE_NAME('LIST_USER'), { state: { success: true, type: 'CREATE' } })
          }
          return
        }
      })
      .catch((err) => {
        setResponse('error')
        setSnackbarMessage(`Please Check the required Fields.`)
        setSnackbarOpen(true)
      })
  }

  const processUserData = (userData) => {
    const processedData = {
      full_name: userData['full_name'],
      email: userData['email'],
      password: userData['password'],
      login_type: userData['login_type']?.value,
      roles_id: userData['selected_role'].length ? userData['selected_role'].map((role) => role.value) : null,
      department_id: [userData['department'].value] || null,
      first_reporting_person_uuid: [userData['first_reporting_person'].value] || null,
      attributes: {
        office_address: userData['office_address'],
        user_name: userData['full_name'],
        employment_status: userData['employment_status']?.value || null,
        gender: userData['gender']?.value || null,
        designation: userData['designation']?.value || null,
        address: userData['address'],
        contact_number: userData['contact_number'],
        office_contact_number: userData['office_contact_number'],
        marital_status: userData['marital_status']?.value || null,
        date_of_birth: userData['date_of_birth'],
        location: userData['location']?.value || null,
        date_of_joining: userData['date_of_joining'],
        date_of_termination: null,
      },
    }
    if (uuid)
      return Object.assign(processedData, {
        uuid,
        is_active: formikValue['is_active'],
        attributes: {
          ...processedData.attributes,
          date_of_termination: userData['date_of_termination'],
        },
      })
    return processedData
  }

  const getRoles = () => {
    HTTP_CLIENT(APIFY('/v1/roles'), { params: { is_active: true } }).then((data) => {
      const roles = data['roles'].map((role) => {
        return {
          label: role['name'],
          value: role['uuid'],
        }
      })
      setRoleOptions(roles)
    })
  }

  const getDepartments = () => {
    HTTP_CLIENT(APIFY('/v1/departments'), { params: { is_active: true } }).then((data) => {
      const department = data['departments'].map((department) => {
        return {
          label: department['name'],
          value: department['uuid'],
        }
      })
      setDepartmentOptions(department)
    })
  }

  const getFirstReportingPerson = () => {
    let where = uuid ? { uuid: uuid } : {}
    HTTP_CLIENT(APIFY('/v1/users/get_user_for_reporting'), { params: where }).then((data) => {
      const first_reporting_person = data['users'].map((rp) => {
        return {
          label: rp['full_name'],
          value: rp['uuid'],
        }
      })
      setFirstReportingPersonOptions(first_reporting_person)
    })
  }

  const getMasters = () => {
    HTTP_CLIENT(APIFY('/v1/master'), {}).then((data) => {
      let masters = data['masters']
      let gender = []
      let maritalStatus = []
      let userType = []
      let designation = []
      let location = []
      masters.forEach((master) => {
        if (master['group'] === 'gender') {
          gender.push({ label: master['name'], value: master['value'] })
        }
        if (master['group'] === 'marital_status') {
          maritalStatus.push({ label: master['name'], value: master['value'] })
        }
        if (master['group'] === 'employment_status') {
          userType.push({ label: master['name'], value: master['value'] })
        }
        if (master['group'] === 'designation') {
          designation.push({ label: master['name'], value: master['value'] })
        }
        if (master['group'] === 'location') {
          location.push({ label: master['name'], value: master['value'] })
        }
      })
      setMaritalStatusOptions(maritalStatus)
      setGenderOptions(gender)
      setUserTypeOptions(userType)
      setDesignationOptions(designation)
      setLocationOptions(location)
    })
  }

  const getUserData = () => {
    HTTP_CLIENT(APIFY('/v1/users/view'), { uuid })
      .then(({ user }) => {
        handleSetAllFieldValues(user)
      })
      .catch((err) => console.log(err))
  }

  const handleSetAllFieldValues = (user) => {
    const convertToLower = (value) => {
      if (value) {
        return value[0] + value.slice(1).toLowerCase()
      } else {
        return false
      }
    }

    const getUserRoles = (roles) => {
      return roles.map((role) => {
        return {
          label: role['name'],
          value: role['uuid'],
        }
      })
    }
    setFieldValue('full_name', user.full_name)
    setFieldValue('email', user.email)
    setFieldValue('login_type', { value: user.login_type, label: convertToLower(user.login_type) })
    setFieldValue('is_active', user.is_active)
    setFieldValue('gender', {
      value: user.user_attribute.gender,
      label: convertToLower(user.user_attribute.gender),
    })
    setFieldValue('date_of_birth', user.user_attribute.date_of_birth)
    setFieldValue('date_of_joining', user.user_attribute.date_of_joining)
    setFieldValue('date_of_termination', user.user_attribute.date_of_termination)
    setFieldValue('marital_status', {
      value: user.user_attribute?.marital_status,
      label: convertToLower(user.user_attribute?.marital_status),
    })
    setFieldValue('selected_role', getUserRoles(user.roles))
    setFieldValue('designation', {
      value: user.user_attribute.designation,
      label: user.user_attribute.designation,
    })
    if (user.departments.length > 0) {
      setFieldValue('department', {
        value: user.departments[0].uuid,
        label: user.departments[0].name,
      })
    }
    setFieldValue('address', user.user_attribute.address)
    setFieldValue('first_reporting_person', {
      label: user?.report_to_user[0]?.full_name,
      value: user?.report_to_user[0]?.uuid,
    })
    setFieldValue('contact_number', user.user_attribute.contact_number)
    setFieldValue('office_contact_number', user.user_attribute.office_contact_number)
    setFieldValue('office_address', user.user_attribute.office_address)
    setFieldValue('employment_status', {
      value: user.user_attribute.employment_status,
      label: convertToLower(user.user_attribute.employment_status),
    })
    setFieldValue('location', {
      value: user.user_attribute.location,
      label: user.user_attribute.location,
    })
  }

  const onCloseSnackbar = () => {
    setSnackbarOpen(false)
  }

  const handleSetFormikValues = (key, options) => {
    setFieldValue(key, options)
  }

  const isFieldValid = (fieldName) => {
    return !!(touched[fieldName] && errors[fieldName])
  }

  const disableYear = (year) => {
    return moment(year) > moment().subtract(18, 'years')
  }

  const disabledDates = (date) => {
    return moment(formikValue['date_of_joining']) >= moment(date)
  }
  console.log(formik)
  return (
    <DashboardLayout breadcrumbTitle="Manage User Master">
      <CardWrapper
        headerTitle={`${uuid ? 'Edit' : 'Add'} User`}
        headerActionButton={() => {
          return (
            <HasPermissionButton
              color="primary"
              permissions={['/dashboard/users']}
              route={GET_ROUTE_NAME('LIST_USER')}
              text={`Back to Users`}
              icon={<ArrowBackRounded />}
            />
          )
        }}
      >
        <ArgonBox sx={{ height: 'calc(100vh - 33.5vh)', overflowY: 'scroll' }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3} paddingLeft="1rem" paddingRight="1rem">
              <Grid item xs={3} sm={6} md={6} position="relative">
                <FormField
                  type="text"
                  name="full_name"
                  label="Full Name*"
                  placeholder="Enter Full Name"
                  style={{
                    borderColor: `${isFieldValid('full_name') ? 'red' : 'lightgray'}`,
                  }}
                  value={formikValue['full_name']}
                  onChange={handleChange}
                />
                {isFieldValid('full_name') && <ErrorTemplate message={errors.full_name} />}
              </Grid>
              <Grid item xs={3} sm={6} md={6}>
                <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
                  <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
                    Gender
                  </ArgonTypography>
                </ArgonBox>

                <ArgonSelect
                  placeholder="Select Gender..."
                  options={genderOption}
                  isClearable={true}
                  style={{
                    borderColor: `${isFieldValid('date_of_birth') ? 'red' : 'lightgray'}}`,
                  }}
                  value={formikValue['gender']}
                  onChange={(options) => handleSetFormikValues('gender', options)}
                />
              </Grid>
              <Grid item xs={3} sm={6} md={6} position="relative">
                <ArgonBox mb={1} ml={0.5} lineHeight={0}>
                  <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
                    Date of Birth*
                  </ArgonTypography>
                </ArgonBox>
                <LocalizationProvider dateAdapter={AdapterMoment}>
                  <DatePicker
                    inputFormat="DD/MM/YYYY"
                    defaultCalendarMonth={moment().subtract(18, 'years')}
                    className={'date-picker-width'}
                    name="date_of_birth"
                    shouldDisableYear={disableYear}
                    disableFuture={true}
                    value={formikValue['date_of_birth']}
                    onChange={(newValue) => handleSetFormikValues('date_of_birth', newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        sx={{
                          '.MuiOutlinedInput-root': {
                            paddingLeft: '0px',
                            borderRadius: '2px',
                            display: 'flex',
                            justifyContent: 'space-between !important',
                            borderColor: `${isFieldValid('date_of_birth') ? 'red' : 'lightgray'}`,
                          },
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
                {isFieldValid('date_of_birth') && <ErrorTemplate message={errors.date_of_birth} />}
              </Grid>
              <Grid item xs={3} sm={6} md={6}>
                <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
                  <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
                    Marital Status
                  </ArgonTypography>
                </ArgonBox>

                <ArgonSelect
                  isClearable={true}
                  placeholder="Select Marital Status..."
                  options={maritalStatusOption}
                  value={formikValue['marital_status']}
                  onChange={(options) => handleSetFormikValues('marital_status', options)}
                />
              </Grid>
              <Grid item xs={3} sm={6} md={6} position="relative">
                <FormField
                  type="text"
                  name="contact_number"
                  label="Contact Number*"
                  placeholder="Contact Number"
                  style={{
                    borderColor: `${isFieldValid('contact_number') ? 'red' : 'lightgray'}`,
                  }}
                  value={formikValue['contact_number']}
                  onChange={handleChange}
                />
                {isFieldValid('contact_number') && <ErrorTemplate message={errors.contact_number} />}
              </Grid>
              <Grid item xs={3} sm={6} md={6} position="relative">
                <FormField
                  type="email"
                  name="email"
                  label="Email / UPN *"
                  placeholder="Enter Email / UPN"
                  value={formikValue['email']}
                  onChange={handleChange}
                  style={{ borderColor: `${isFieldValid('email') ? 'red' : 'lightgray'}` }}
                />
                {isFieldValid('email') && <ErrorTemplate message={errors.email} />}
              </Grid>
              <Grid item xs={3} sm={6} md={6}>
                <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
                  <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
                    Login Type *
                  </ArgonTypography>
                </ArgonBox>

                <ArgonSelect
                  isClearable={true}
                  placeholder="Select Login Type..."
                  value={formikValue['login_type']}
                  onChange={(options) => {
                    handleSetFormikValues('login_type', options), setLoginType(options?.value)
                  }}
                  options={[
                    { label: 'Password', value: 'PASSWORD' },
                    { label: 'Azure', value: 'AZURE' },
                  ]}
                  isInvalid={isFieldValid('login_type')}
                />
                {isFieldValid('login_type') && <ErrorTemplate message={errors.login_type?.value} />}
              </Grid>
              {formikValue['login_type']?.value === 'PASSWORD' && (
                <Grid item xs={3} sm={6} md={6} position="relative">
                  <FormField
                    type="password"
                    name="password"
                    label="Password*"
                    placeholder="Enter Password for User Login"
                    value={formikValue['password']}
                    onChange={handleChange}
                    style={{
                      borderColor: `${isFieldValid('password') ? 'red' : 'lightgray'}`,
                    }}
                  />
                  {isFieldValid('password') && <ErrorTemplate message={errors.password} />}
                </Grid>
              )}
              <Grid item xs={3} sm={6} md={6}>
                <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
                  <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
                    Employment Type
                  </ArgonTypography>
                </ArgonBox>

                <ArgonSelect
                  isClearable={true}
                  placeholder="Select Employment Status..."
                  value={formikValue['employment_status']}
                  onChange={(options) => handleSetFormikValues('employment_status', options)}
                  options={userTypeOption}
                />
              </Grid>
              <Grid item xs={3} sm={6} md={6} position="relative">
                <ArgonBox mb={1} ml={0.5} lineHeight={0}>
                  <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
                    Date of Joining*
                  </ArgonTypography>
                </ArgonBox>
                <LocalizationProvider dateAdapter={AdapterMoment}>
                  <DatePicker
                    inputFormat="DD/MM/YYYY"
                    className={'date-picker-width'}
                    name="date_of_joining"
                    value={formikValue['date_of_joining']}
                    onChange={(newValue) => handleSetFormikValues('date_of_joining', newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        sx={{
                          '.MuiOutlinedInput-root': {
                            marginTop: '4px',
                            borderRadius: '2px',
                            display: 'flex',
                            paddingLeft: '0px',
                            justifyContent: 'space-between !important',

                            borderColor: `${isFieldValid('date_of_joining') ? 'red' : 'lightgray'}`,
                          },
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
                {isFieldValid('date_of_joining') && <ErrorTemplate message={errors.date_of_joining} />}
              </Grid>
              <Grid item xs={3} sm={6} md={6} position="relative">
                <FormField
                  type="text"
                  name="address"
                  label="Address*"
                  placeholder="Enter address"
                  value={formikValue['address']}
                  onChange={handleChange}
                  style={{ borderColor: `${isFieldValid('address') ? 'red' : 'lightgray'}` }}
                />
                {isFieldValid('address') && <ErrorTemplate message={errors.address} />}
              </Grid>
              <Grid item xs={3} sm={6} md={6}>
                <FormField
                  type="text"
                  name="office_address"
                  label="Office Address"
                  placeholder="Enter Office Address"
                  value={formikValue['office_address']}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={3} sm={6} md={6}>
                <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
                  <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
                    Select Role(s)
                  </ArgonTypography>
                </ArgonBox>
                <ArgonSelect
                  isClearable={true}
                  placeholder="Select Role(s)"
                  value={formikValue['selected_role']}
                  onChange={(options) => handleSetFormikValues('selected_role', options)}
                  options={rolesOption}
                  isMulti={true}
                />
              </Grid>

              <Grid item xs={3} sm={6} md={6}>
                <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
                  <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
                    Department
                  </ArgonTypography>
                </ArgonBox>

                <ArgonSelect
                  isClearable={true}
                  placeholder="Select Department..."
                  options={departmentOption}
                  value={formikValue['department']}
                  onChange={(options) => handleSetFormikValues('department', options)}
                />
              </Grid>
              <Grid item xs={3} sm={6} md={6}>
                <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
                  <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
                    Designation
                  </ArgonTypography>
                </ArgonBox>

                <ArgonSelect
                  isClearable={true}
                  placeholder="Select Designation..."
                  options={designationOption}
                  onChange={(options) => handleSetFormikValues('designation', options)}
                  value={formikValue['designation']}
                />
              </Grid>
              <Grid item xs={3} sm={6} md={6}>
                <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
                  <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
                    Location
                  </ArgonTypography>
                </ArgonBox>

                <ArgonSelect
                  isClearable={true}
                  placeholder="Select Location..."
                  options={locationOption}
                  style={{
                    borderColor: `${isFieldValid('location') ? 'red' : 'lightgray'}}`,
                  }}
                  value={formikValue['location']}
                  onChange={(options) => handleSetFormikValues('location', options)}
                />
              </Grid>
              <Grid item xs={3} sm={6} md={6}>
                <FormField
                  type="text"
                  name="office_contact_number"
                  label="Office Number"
                  placeholder="Enter Office Number"
                  value={formikValue['office_contact_number']}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={3} sm={6} md={6}>
                <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
                  <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
                    First Reporting Person
                  </ArgonTypography>
                </ArgonBox>

                <ArgonSelect
                  isClearable={true}
                  placeholder="Select First Reporting Person..."
                  options={firstReportingPersonOption}
                  value={formikValue['first_reporting_person']}
                  onChange={(options) => handleSetFormikValues('first_reporting_person', options)}
                />
              </Grid>

              {uuid && (
                <>
                  <Grid item xs={3} sm={6} md={6}>
                    <ArgonBox mb={1} ml={0.5} lineHeight={0}>
                      <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
                        Date of Termination
                      </ArgonTypography>
                    </ArgonBox>
                    <LocalizationProvider dateAdapter={AdapterMoment}>
                      <DatePicker
                        inputFormat="DD/MM/YYYY"
                        className={'date-picker-width'}
                        name="date_of_termination"
                        value={formikValue['date_of_termination']}
                        shouldDisableDate={disabledDates}
                        // disablePast={true}
                        onChange={(newValue) => handleSetFormikValues('date_of_termination', newValue)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            sx={{
                              '.MuiOutlinedInput-root': {
                                marginTop: '4px',
                                borderRadius: '2px',
                                display: 'flex',
                                paddingLeft: '0px',
                                justifyContent: 'space-between !important',
                                borderColor: `${isFieldValid('date_of_termination') ? 'red' : 'lightgray'}`,
                              },
                            }}
                          />
                        )}
                      />
                    </LocalizationProvider>
                    {isFieldValid('date_of_termination') && <ErrorTemplate message={errors.date_of_termination} />}
                  </Grid>
                  <Grid item xs={3} sm={6} md={6}>
                    <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
                      Status
                    </ArgonTypography>
                    <ArgonBox mt={1} display={'flex'} gap={'8px'} alignItems={'center'}>
                      <Switch name="is_active" checked={formikValue['is_active']} onChange={handleChange} />
                      <ArgonTypography
                        component="label"
                        variant="caption"
                        fontWeight="bold"
                        fontSize={19}
                        textTransform="capitalize"
                      >
                        {formikValue['is_active'] ? 'Active' : '  Inactive'}
                      </ArgonTypography>
                    </ArgonBox>
                  </Grid>
                </>
              )}
            </Grid>
            <ArgonBox spacing={3} padding="1rem" sx={{ display: 'flex', justifyContent: 'end' }}>
              <ArgonButton color="success" type="submit">
                Submit
              </ArgonButton>
            </ArgonBox>
          </form>
        </ArgonBox>
      </CardWrapper>
      <ArgonSnackbar
        color={response}
        icon={response ? response : 'error'}
        title={response === 'success' ? 'User Created Successfully' : response === 'error' ? 'User Creation Failed' : ''}
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
    </DashboardLayout>
  )
}
export default UserEntity
