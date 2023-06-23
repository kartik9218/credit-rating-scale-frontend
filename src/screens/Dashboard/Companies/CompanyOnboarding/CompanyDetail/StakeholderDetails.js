import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Grid, FormControlLabel, Switch, Button } from '@mui/material'
import ArgonButton from 'components/ArgonButton'
import ArgonTypography from 'components/ArgonTypography'
import { ArgonBox } from 'components/ArgonTheme'
import ArgonBadge from 'components/ArgonBadge'
import FormField from 'slots/FormField'
import ArgonSelect from 'components/ArgonSelect'
import DataTable from 'slots/Tables/DataTable'
import { HTTP_CLIENT, APIFY } from 'helpers/Api'
import { stakeHolderSchema } from 'helpers/formikSchema'
import { getCompanyOnboardingSchema } from 'helpers/validationSchema'
import { ArgonSnackbar } from 'components/ArgonTheme'
import ErrorTemplate from 'slots/Custom/ErrorTemplate'
import { useFormik } from 'formik'
import { GET_QUERY } from 'helpers/Base'
import { EditOutlined } from '@mui/icons-material'
import { TAB } from 'helpers/constants'
import CreatableSelect from 'react-select/creatable'
import { DEBOUNCE } from 'helpers/Base'

const StakeholderDetails = (props) => {
  const { companyUuid, departmentOptions, designationOptions, stakeholderOptions, countryOptions, genderOptions } = props
  const uuid = GET_QUERY('uuid')
  const [response, setResponse] = useState(null)
  const [snackbarMessage, setSnackbarMessage] = useState('Please check all required fields')
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [stakeholderUuid, setStakeholderUuid] = useState('')
  const [stateOptions, setStateOptions] = useState([])
  const [cityOptions, setCityOptions] = useState([])
  const [mode, setMode] = useState('ADD')
  const [rows, setRows] = useState([])
  const [stakeholderNameOptions, setStakeholderNameOptions] = useState([])

  const formik = useFormik({
    initialValues: stakeHolderSchema,
    validationSchema: getCompanyOnboardingSchema(TAB.STAKEHOLDER_DETAILS),
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
    { accessor: "type", Header: "Stakeholder Type" },
    { accessor: "name", Header: "Stakeholder Name" },
    { accessor: "contact_name", Header: "Conatct Name" },
    { accessor: "stakeholder_department", Header: "Department", Cell: row => {
       return <>{row.cell.value?.name ?? "-"}</> 
      }},
    { accessor: "designation", Header: "Designation", Cell: row => row.cell.value ?? "-"},
    { accessor: "email", Header: "Email" },
    { accessor: "gender", Header: "Gender" },
    { accessor: "mobile", Header: "Mobile" },
    { accessor: "landline", Header: "Landline", Cell: row => <>{row.cell.value || "-"}</> },
    { accessor: "stakeholder_country", Header: "Country", Cell: row => <>{row.cell.value?.name}</> },
    { accessor: "stakeholder_state", Header: "State",  Cell: row => <>{row.cell.value?.name}</> },
    { accessor: "stakeholder_city", Header: "City" ,  Cell: row => <>{row.cell.value?.name ?? "-"}</>},
    {
      accessor: 'is_active',
      Header: 'Status',
      Cell: (row) => (
        <>
          {row.cell.value ? (
            <ArgonBadge badgeContent="Active" color="success" container />
          ) : (
            <ArgonBadge badgeContent="InActive" color="error" container />
          )}
        </>
      ),
    },
  ]
  const { errors, touched, setFieldValue, handleSubmit, handleChange, handleReset, values: formikValue } = formik

  useEffect(() => {
    if (!uuid) return
    getAllStakeholderList()
  }, [])

  useEffect(() => {
    if (!formikValue.stakeholder_type?.value) return
    stakeholderOptions.forEach(({ value, master_common_tags }) => {
      if (value === formikValue.stakeholder_type['value']) {
        getStakeholderNames(master_common_tags.map(({ uuid }) => uuid))
      }
    })
  }, [formikValue['stakeholder_type']?.value])

  useEffect(() => {
    if (!formikValue['country']?.value) return
    getStateOptions()
  }, [formikValue.country?.value])

  useEffect(() => {
    if (!formikValue['state']?.value) return
    getCityOptions()
  }, [formikValue.state?.value])

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
  const getStakeholderNames = (uuidList) => {
    setStakeholderNameOptions([])
    HTTP_CLIENT(APIFY('/v1/tags/view'), { tags_uuid: uuidList }).then((response) => {
      const { tags } = response
      tags.forEach(({ tag_companies }) => {
        setStakeholderNameOptions([...tag_companies])
      })
    })
  }

  const handleSetFormikValues = (key, value) => {
    setFieldValue(key, value ?? {label:"", value:""})
  }

  const onCloseSnackbar = () => setSnackbarOpen(false)

  const handleShowSnackbar = (type) => (message) => {
    setSnackbarOpen(true)
    setResponse(type)
    setSnackbarMessage(message)
  }

  const handlePerformAjaxRqst = (stakeHolderData) => {
    if (uuid && mode === 'EDIT') {
      HTTP_CLIENT(APIFY('/v1/companies/edit_stakeholders'), {
        params: processApiData(stakeHolderData),
      })
        .then((success) => {
          handleShowSnackbar('success')('stakeholder Details updated successfully')
          handleReset()
          getAllStakeholderList()
        })
        .catch((err) => {
          handleShowSnackbar('error')('Something went wrong')
        })
      setMode('ADD')
      return
    }
    HTTP_CLIENT(APIFY('/v1/companies/assign_stakeholders'), {
      params: processApiData(stakeHolderData),
    })
      .then((success) => {
        handleShowSnackbar('success')('stakeholder Details updated successfully')
        handleReset()
        getAllStakeholderList()
      })
      .catch((err) => {
        console.error(err)
        handleShowSnackbar('error')('Something went wrong')
      })
    setMode('ADD')
  }

  const getAllStakeholderList = () => {
    HTTP_CLIENT(APIFY('/v1/companies/view_stakeholders'), {
      company_uuid: uuid,
    })
      .then((response) => {
        const { stakeholders } = response
        setRows([...stakeholders])
      })
      .catch((err) => {
        console.error(err)
      })
  }

  const handleSetFieldValues = (data) => {
    setMode('EDIT')
    const getDesignation = () => {
      const designation = designationOptions.find(
       (option) => option?.value === data?.designation
     )
     if(designation) {
     return {label:designation?.name, value:designation?.value};
     } else return {label:"Select Designation...", value:""};
   };
   const getGender = () => {
     const gender = genderOptions.find(gender => gender?.value === data?.gender);
     return {label:gender.name, value:gender.value};
    }
    const getstakeholderOptions = () => {
      const stakeholder = stakeholderOptions?.find((stakeholder) => stakeholder.name === data['type'])
      return { label: stakeholder.name, value: stakeholder.uuid }
    }
   const getOptions = items => {
    return Object.assign({}, {label:items?.name, value:items?.uuid})
  }
    setStakeholderUuid(data.uuid);
    setFieldValue("stakeholder_type", getstakeholderOptions());
    setFieldValue("contact_name", data.contact_name);
    setFieldValue("gender", data?.gender ? getGender() : {label:"", value:""});
    setFieldValue("email", data.email);
    setFieldValue("is_active", data.is_active)
    setFieldValue("mobile", data.mobile)
    setFieldValue("landline", data.landline);
    setFieldValue("designation", getDesignation());
    setFieldValue("stakeholder_name", {value: data?.stakeholder_company?.uuid || "", label: data?.stakeholder_company?.name || ""});
    setFieldValue("department", data?.stakeholder_department ? getOptions(data?.stakeholder_department) : {label: "Select Department...", value:""}),
    setFieldValue("country" , data?.stakeholder_country ?  getOptions(data?.stakeholder_country) : {label: "Select Country...", value:""});
    setFieldValue("state", data?.stakeholder_state ? getOptions(data?.stakeholder_state) : {label: "Select State...", value:""});
    setFieldValue("city", data?.stakeholder_city ?  getOptions(data?.stakeholder_city) : {label: "Select City...", value:""});
  }

  const processApiData = (data) => {
    const processedData = {
      company_uuid: uuid,
      name: data.stakeholder_name.label,
      type: data.stakeholder_type.label,
      stakeholder_company_uuid:data.stakeholder_name.value,
      contact_name: data["contact_name"],
      gender: data.gender?.value || null,
      email: data["email"],
      country_uuid: data?.country?.value || null,
      state_uuid: data?.state?.value || null,
      department_uuid: data.department?.value || null,
      designation: data.designation?.label != "Select Designation..." ? data.designation?.label : "",
      city_uuid: data?.city?.value || null,
      is_active: data["is_active"],
      mobile: data["mobile"],
      landline:data["landline"]
    };
    if(uuid && mode === "EDIT") {
      return Object.assign(processedData, {
        uuid: stakeholderUuid,
        company_uuid: uuid,
      })
    } else return Object.assign(processedData, { company_uuid: uuid || companyUuid })
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
          <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
            <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
              Stakeholder Type *
            </ArgonTypography>
          </ArgonBox>
          <ArgonSelect
            isClearable={true}
            placeholder="Select Stakeholder Type..."
            name={'stakeholder_type'}
            value={formikValue['stakeholder_type']}
            onChange={(options) => handleSetFormikValues('stakeholder_type', options)}
            options={stakeholderOptions.map(({ name, value }) => Object.assign({}, { label: name, value }))}
            isInvalid={touched.stakeholder_type && errors.stakeholder_type}
          />
          {touched.stakeholder_type && errors.stakeholder_type && <ErrorTemplate message={errors?.stakeholder_type.value} />}
        </Grid>

        <Grid item xs={12} sm={6} md={4} position="relative">
          <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
            <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
              Stakeholder Name *
            </ArgonTypography>
          </ArgonBox>
          <ArgonSelect
            name={'stakeholder_name'}
            isClearable
            placeholder="Select Stakeholder Name..."
            options={stakeholderNameOptions.map(({ name, uuid }) => Object.assign({}, { label: name, value: uuid }))}
            value={formikValue['stakeholder_name']}
            onChange={(options) => handleSetFormikValues('stakeholder_name', options)}
            styles={{
              control: (baseStyles, state) => ({
                ...baseStyles,
                borderColor: touched.stakeholder_name?.value && errors.stakeholder_name?.value ? 'red' : 'lightgrey',
              }),
            }}
            // isInvalid={touched.stakeholder_name?.value && errors.stakeholder_name?.value}
          />
          {touched.stakeholder_name && errors.stakeholder_name && (
            <ErrorTemplate message={errors?.stakeholder_name?.value} />
          )}
        </Grid>

        <Grid item xs={12} sm={6} md={4} position="relative">
          <FormField
            type="text"
            name="contact_name"
            value={formikValue['contact_name']}
            onChange={handleChange}
            label="Contact Name *"
            placeholder="Contact Name"
            style={{
              borderColor: `${touched?.contact_name && errors.contact_name ? 'red' : 'lightgray'}`,
            }}
          />
          {touched.contact_name && errors.contact_name && <ErrorTemplate message={errors?.contact_name} />}
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
            <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
              Gender
            </ArgonTypography>
          </ArgonBox>
          <ArgonSelect
            isClearable={true}
            placeholder="Select Gender..."
            name={'gender'}
            options={genderOptions.map(({ name, value }) => {
              return { value, label: name }
            })}
            value={formikValue['gender']}
            onChange={(options) => handleSetFormikValues('gender', options)}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} position="relative">
          <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
            <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
              Department
            </ArgonTypography>
          </ArgonBox>

          <ArgonSelect
            isClearable={true}
            placeholder="Select Department..."
            name={'department'}
            options={departmentOptions}
            value={formikValue['department']}
            // isInvalid={touched.department && errors.department}
            onChange={(options) => handleSetFormikValues('department', options)}
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
            options={designationOptions.map(({ name, value }) => {
              return { label: name, value: value }
            })}
            name={'designation'}
            value={formikValue['designation']}
            onChange={(options) => handleSetFormikValues('designation', options)}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} position="relative">
          <FormField
            type="email"
            name="email"
            value={formikValue['email']}
            onChange={handleChange}
            label="Email *"
            style={{
              borderColor: `${touched?.email && errors.email ? 'red' : 'lightgray'}`,
            }}
            placeholder="Email / UPN"
          />
          {touched.email && errors.email && <ErrorTemplate message={errors?.email} />}
        </Grid>

        <Grid item xs={12} sm={6} md={4} position="relative">
          <FormField
            type="text"
            label="Mobile"
            name="mobile"
            value={formikValue['mobile']}
            onChange={handleChange}
            placeholder="Mobile Number"
            style={{
              borderColor: `${touched?.mobile && errors.mobile ? 'red' : 'lightgray'}`,
            }}
          />
          {touched.mobile && errors.mobile && <ErrorTemplate message={errors?.mobile} />}
        </Grid>

        <Grid item xs={12} sm={6} md={4} position="relative">
          <FormField
            type="text"
            label="Landline"
            name="landline"
            value={formikValue['landline']}
            onChange={handleChange}
            placeholder="Landline"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
            <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
              Country
            </ArgonTypography>
          </ArgonBox>
          <ArgonSelect
            isClearable={true}
            placeholder="Select Country..."
            name="country"
            value={formikValue['country']}
            onChange={(options) => handleSetFormikValues('country', options)}
            options={countryOptions.map(({ uuid, name }) => {
              return { value: uuid, label: name }
            })}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
            <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
              State
            </ArgonTypography>
          </ArgonBox>
          <ArgonSelect
            isClearable={true}
            placeholder="Select State..."
            name="state"
            // isDisabled={!stateOptions.length}
            defaultValue={{ value: '', label: '' }}
            value={formikValue['state']}
            onChange={(options) => handleSetFormikValues('state', options)}
            options={stateOptions.map(({ name, uuid }) => {
              return { value: uuid, label: name }
            })}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
            <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
              City
            </ArgonTypography>
          </ArgonBox>
          <ArgonSelect
            isClearable={true}
            placeholder="Select City..."
            name="city"
            defaultValue={{ value: '', label: '' }}
            value={formikValue['city']}
            // isDisabled={!cityOptions.length}
            onChange={(options) => handleSetFormikValues('city', options)}
            options={cityOptions.map(({ name, uuid }) => {
              return { value: uuid, label: name }
            })}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <FormControlLabel
            sx={{ paddingLeft: '20px', paddingTop: '35px' }}
            control={<Switch name="is_active" onChange={handleChange} checked={formikValue['is_active']} />}
            label="Is Active"
          />
        </Grid>
      </Grid>
      <Grid container md={12} paddingRight="1rem" sx={{ display: 'flex', justifyContent: 'end', gap: '10px' }}>
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

StakeholderDetails.propTypes = {
  companyUuid: PropTypes.string,
  departmentOptions: PropTypes.array,
  designationOptions: PropTypes.array,
  stakeholderOptions: PropTypes.array,
  countryOptions: PropTypes.array,
  genderOptions: PropTypes.array,
  selectedTags: PropTypes.array,
}

export default StakeholderDetails

