import React, { useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { Grid, FormControlLabel, Switch, TextField, Modal, Box } from '@mui/material'
import ArgonTypography from 'components/ArgonTypography'
import { ArgonBox } from 'components/ArgonTheme'
import FormField from 'slots/FormField'
import ArgonSelect from 'components/ArgonSelect'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { CancelOutlined, FileUploadOutlined } from '@mui/icons-material'
import { styled } from '@mui/material/styles'
import ErrorTemplate from 'slots/Custom/ErrorTemplate'
import { HTTP_CLIENT, APIFY } from 'helpers/Api'
import { basicDetailSchema } from 'helpers/formikSchema'
import { useFormik } from 'formik'
import { ArgonSnackbar } from 'components/ArgonTheme'
import { getCompanyOnboardingSchema } from 'helpers/validationSchema'
import ArgonButton from 'components/ArgonButton'
import { GET_QUERY } from 'helpers/Base'
import { TAB } from 'helpers/constants'
import { useNavigate } from 'react-router-dom'
import { DEBOUNCE } from 'helpers/Base'

const Input = styled('input')({
  display: 'none',
})

const docsStyle = {
  fontFamily: 'Helvetica Neue',
  fontStyle: 'italic',
  color: '',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  position: 'absolute',
  right: '2px',
  bottom: '40px',
  width: '130px',
  height: '15px',
}

const BasicDetail = (props) => {
  const {
    tagsOptions,
    companyTypeOptions,
    groupOptions,
    macroEconomicOptions,
    legalStatusOptions,
    handleSetCompanyUuid,
    handleSetCompanyName,
    handleChangeActiveTab,
  } = props
  const legalStatusRef = useRef([{}])
  const navigate = useNavigate()
  const uuid = GET_QUERY('uuid')
  const [sectorOptions, setSectorOptions] = useState([])
  const [industryOptions, setIndustryOptions] = useState([])
  const [subIndustryOptions, setSubIndustryOptions] = useState([])
  const [response, setResponse] = useState(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('Please check all required fields')
  const [isFieldMandatory, setIsFieldMandatory] = useState({ gst: false, pan: false, cin: false })
  const [document, setDocument] = useState({})
  const [open, setOpen] = useState({ modal: false, file: '' })
  const formik = useFormik({
    initialValues: basicDetailSchema,
    validationSchema: getCompanyOnboardingSchema(TAB.BASIC_DETAIL, legalStatusRef.current[0]),
    onSubmit: (values) => handlePerformAjaxRqst(values),
  })
  const { errors, touched, setFieldValue, handleSubmit, handleChange, values: formikValue } = formik
  const macroIndicatorUuid = formikValue.macro_economic_indicator?.value
  const sectorUuid = formikValue.sector?.value
  const industryUuid = formikValue.industry?.value

  useEffect(() => {
    getSectors()
  }, [macroIndicatorUuid])

  useEffect(() => {
    getIndustries()
  }, [sectorUuid])

  useEffect(() => {
    getSubIndustries()
  }, [industryUuid])

  useEffect(() => {
    if (!uuid) return
    getBasicDetails()
  }, [legalStatusOptions.current])

  useEffect(() => checkIfGstMandatory(), [formikValue['sez'], formikValue['registered']])
  useEffect(() => handleSetMandatoryFields('cin')(!isCinMandatory()), [formikValue['legal_status']?.value])
  useEffect(
    () => handleSetMandatoryFields('pan')(formikValue['is_infomerics_client']),
    [formikValue['is_infomerics_client']],
  )

  const checkIfGstMandatory = () => {
    if (formikValue['registered'] || formikValue['sez']) {
      handleSetMandatoryFields('gst')(true)
      return
    }
    handleSetMandatoryFields('gst')(false)
  }

  const isCinMandatory = () => {
    if (Array.isArray(formikValue['legal_status'])) {
      return (
        formikValue?.legal_status[0]?.label === 'Partnership' ||
        formikValue?.legal_status[0]?.label === 'Proprietorship' ||
        formikValue?.legal_status[0]?.label === 'Limited Liability Partnership' ||
        formikValue?.legal_status[0]?.label === 'Limited Liability Company'
      )
    }
    return (
      formikValue?.legal_status?.label === 'Partnership' ||
      formikValue?.legal_status?.label === 'Proprietorship' ||
      formikValue?.legal_status?.label === 'Limited Liability Partnership' ||
      formikValue?.legal_status?.label === 'Limited Liability Company'
    )
  }

  const handleSetMandatoryFields = (key) => (value) => {
    setIsFieldMandatory((prev) => {
      return {
        ...prev,
        [key]: value,
      }
    })
  }

  const getBasicDetails = async (newuuid = null) => {
    try {
      const { company } = await HTTP_CLIENT(APIFY(`/v1/companies/view`), { uuid: newuuid ?? uuid })
      handleSetFieldValues(company)
      handleSetCompanyName(company.name)
    } catch (err) {
      setSnackbarOpen(true)
      setResponse('error')
      setSnackbarMessage(`Something went wrong!`)
      console.log(err)
    }
  }

  const getSectors = () => {
    if (!macroIndicatorUuid) return
    HTTP_CLIENT(APIFY('/v1/macro_economic_indicator/sectors/view'), {
      params: { macro_economic_indicator_uuid: macroIndicatorUuid },
    })
      .then((data) => {
        const { sectors } = data
        const options = []
        sectors?.forEach(({ name, uuid }) => {
          options.push(Object.assign({ value: uuid, label: name }))
        })
        setSectorOptions([...options])
      })
      .catch((err) => console.log(err))
  }

  const getIndustries = () => {
    if (!sectorUuid) return
    HTTP_CLIENT(APIFY('/v1/sector/industries/view'), { params: { sector_uuid: sectorUuid } })
      .then((success) => {
        const { industry } = success
        const options = []
        industry.forEach(({ name, uuid }) => {
          options.push(Object.assign({ value: uuid, label: name }))
        })
        setIndustryOptions([...options])
      })
      .catch((err) => console.log(err))
  }

  const getSubIndustries = () => {
    if (!industryUuid) return
    HTTP_CLIENT(APIFY('/v1/sub_industries'), { industry_id: industryUuid })
      .then((data) => {
        const { sub_industries } = data
        const options = []
        sub_industries.forEach(({ name, uuid }) => {
          options.push(Object.assign({}, { value: uuid, label: name }))
        })
        setSubIndustryOptions([...options])
      })
      .catch((err) => console.log(err))
  }

  const handleOpen = (fileType) => setOpen({ modal: true, file: fileType })

  const handleClose = () => setOpen({ modal: false, file: '' })

  const handleSetFormikValues = (key, options) => {
    if (key === 'legal_status') {
      legalStatusRef.current = [options]
    }
    setFieldValue(key, options ?? {label:"", value:""})
  }

  const isFieldValid = (params) => (fieldName) => {
    if (typeof errors[params] != 'undefined' && typeof errors[params][fieldName] != 'undefined') {
      return !!(touched[params][fieldName] && errors[params][fieldName])
    }
  }

  const processApiData = (data) => {
    const processedData = {
      name: data['company_name'],
      short_code: data['short_code'] || null,
      sector_uuid: data['sector'].value,
      industry_id: data['industry'].value,
      // company_type: data['company_type'].value || null,
      sub_industry_id: data['sub_industry'].value,
      group: data['group'].label === 'Select...' ? null : data['group'].label,
      sez: data['sez'],
      legal_status: data['legal_status']?.value || null,
      is_infomerics_client: data['is_infomerics_client'],
      cin: data['cin'] || null,
      controlling_office: data['controlling_office'] || null,
      pan: data['pan'],
      tan: data['tan'] || null,
      gst: data['gst'] || null,
      website: data['website'] || null,
      date_of_incorporation: data['date_of_incorporation'] || null,
      is_active: true,
      is_listed: true,
      subsidiary_uuid: null,
      macro_economic_indicator_uuid: data['macro_economic_indicator'].value,
      tags_uuid: data['tags'].map((tag) => tag.value),
      former_name: data['former_name'] || null,
      registered: data['registered'],
    }
    if (uuid) {
      return Object.assign(processedData, {
        uuid,
      })
    }
    return processedData
  }

  const handleShowSnackBar = (messageType) => (message) => {
    setSnackbarOpen(true)
    setResponse(messageType)
    setSnackbarMessage(message)
  }

  const getFormData = () => {
    const formData = new FormData()
    document?.pan?.file && formData.append('pan.pdf', document['pan']['file'])
    document?.tan?.file && formData.append('tan.pdf', document['tan']['file'])
    document?.gst?.file && formData.append('gst.pdf', document['gst']['file'])
    for (const pair of formData.entries()) {
      if (typeof pair[1] != 'object') {
        formData.delete(`${pair[0]}`)
      }
    }
    return formData
  }

  const sendDocs = (uri) => {
    if (Object.keys(document).length > 0 || uuid) {
      HTTP_CLIENT(APIFY(uri), getFormData(), true)
        .then((docs) => {})
        .catch((err) => {
          console.error(err)
        })
    }
  }

  const handlePerformAjaxRqst = (basicDetail) => {
    if (uuid) {
      HTTP_CLIENT(APIFY('/v1/companies/edit'), { params: processApiData(basicDetail) })
        .then((success) => {
          handleShowSnackBar('success')(`Basic Details updated successfully`)
          document?.doc_uuid
            ? sendDocs(`/v1/companies/assign_documents?company_uuid=${uuid}&uuid=${document?.doc_uuid}`)
            : sendDocs(`/v1/companies/assign_documents?company_uuid=${uuid}`)
        })
        .catch((error) => {
          console.error(error, 'err')
          handleShowSnackBar('error')(`Something went wrong!`)
        })
      return
    }
    HTTP_CLIENT(APIFY('/v1/companies/add'), { params: processApiData(basicDetail) })
      .then((success) => {
        const {
          company: { uuid },
        } = success
        handleShowSnackBar('success')(`Basic details added successfully`)
        sendDocs(`/v1/companies/assign_documents?company_uuid=${uuid}`)
        handleSetCompanyUuid(uuid)
        formik.resetForm()
        navigate(`/dashboard/company/edit?uuid=${uuid}`)
        getBasicDetails(uuid)
      })
      .catch((error) => {
        handleShowSnackBar('error')(`Something went wrong!`)
        console.log(error, 'error')
      })
  }

  const onCloseSnackbar = () => {
    setSnackbarOpen(false)
  }

  const handleSetFieldValues = (company) => {
    const { company_industry, company_macro_economic_indicator, company_sector, company_sub_industry, company_document } =
      company

    const getOptions = (type) => {
      const options = []
      if (type === 'legal') {
        legalStatusOptions.current.forEach((legal) => {
          if (legal.value === company.legal_status) {
            options.push(
              Object.assign(
                {},
                {
                  value: legal.value,
                  label: legal.name,
                },
              ),
            )
          }
        })
      } else if (type === 'group') {
        groupOptions.forEach((group) => {
          if (group.name === company.group) {
            options.push(
              Object.assign(
                {},
                {
                  value: group.value,
                  label: group.name,
                },
              ),
            )
          }
        })
      } else if (type === 'company_type') {
        companyTypeOptions.forEach((companyType) => {
          if (companyType.value === company.company_type) {
            options.push(
              Object.assign(
                {},
                {
                  value: companyType.value,
                  label: companyType.name,
                },
              ),
            )
          }
        })
      }
      return options
    }
    handleSetDocs(company_document)
    const getCompanyOptions = ({ name, uuid }) => Object.assign({}, { value: uuid, label: name })
    legalStatusRef.current = getOptions('legal')
    setFieldValue('company_name', company?.name)
    // setFieldValue('company_type', getOptions('company_type'))
    setFieldValue('short_code', company?.short_code)
    setFieldValue('industry', getCompanyOptions(company_industry))
    setFieldValue('sector', getCompanyOptions(company_sector))
    setFieldValue('macro_economic_indicator', getCompanyOptions(company_macro_economic_indicator))
    setFieldValue('sub_industry', getCompanyOptions(company_sub_industry ?? { name: '', uuid: '' }))
    setFieldValue('former_name', company?.former_name)
    setFieldValue('group', getOptions('group'))
    setFieldValue('sez', company?.sez)
    setFieldValue('legal_status', getOptions('legal'))
    setFieldValue('is_infomerics_client', company?.is_infomerics_client)
    setFieldValue('cin', company?.cin ?? '')
    setFieldValue('controlling_office', company?.controlling_office)
    setFieldValue('pan', company?.pan)
    setFieldValue('tan', company?.tan)
    setFieldValue('gst', company?.gst ?? '')
    setFieldValue('website', company?.website)
    setFieldValue('date_of_incorporation', company?.date_of_incorporation)
    setFieldValue('is_active', company?.is_active)
    setFieldValue('is_listed', company?.is_listed)
    setFieldValue('tags', company?.tags?.map(getCompanyOptions))
    setFieldValue('registered', company?.registered ?? false)
    handleSetMandatoryFields('cin', isCinMandatory())
  }

  const handleSetDocs = (company_document) => {
    const docObj = {}
    if (company_document != null) {
      company_document?.pan &&
        Object.assign(docObj, {
          pan: {
            fileType: 'pan',
            fileName: 'pan.pdf',
            file: company_document.pan,
          },
        })
      company_document?.gst &&
        Object.assign(docObj, {
          gst: {
            fileType: 'gst',
            fileName: 'gst.pdf',
            file: company_document.gst,
          },
        })
      company_document?.tan &&
        Object.assign(docObj, {
          tan: {
            fileType: 'tan',
            fileName: 'tan.pdf',
            file: company_document.tan,
          },
        })
      setDocument(docObj)
    }
  }
  const fileIsNotValid = (mimetype) => (size) => {
    if (mimetype != 'application/pdf') {
      handleShowSnackBar('error')('Please select only PDF files.')
      return true
    } else if (size * 0.001 * 0.001 > 5) {
      handleShowSnackBar('error')('File Size cannot exceed more than 5mb.')
      return true
    }
  }
  const handleFile = (e, fileType) => {
    const mimetype = e.target.files[0].type
    const size = e.target.files[0].size
    if (fileIsNotValid(mimetype)(size)) return
    setDocument((prev) => {
      return {
        ...prev,
        [fileType]: {
          fileType: fileType,
          fileName: e.target.files[0].name,
          file: e.target.files[0],
        },
      }
    })
  }

  const getFileUrl = (url) => {
    return typeof url === "object" ? URL.createObjectURL(url) : url
  }

  const handleRemoveFile = (type) => {
    const newDocs = JSON.parse(JSON.stringify(document))
    delete newDocs[type]
    setDocument(newDocs)
    (async function () {
      try {
        const response = await HTTP_CLIENT(APIFY('/v1/company/delete_documents'), {
          params: { company_uuid: uuid, [type]: 1 },
        })
        if (response.success) {
          handleShowSnackBar('success')(`${type} removed successfully`)
        }
      } catch (err) {
        handleShowSnackBar('error')(`Document could not be removed`)
      }
    })()
  }

  const debounceHandler = DEBOUNCE(handleSubmit, 300)
  
  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          debounceHandler(e)
        }}
      >
        <Grid container xs={12} spacing={3} marginTop={'1px'} paddingLeft="2rem" paddingRight="2rem">
          <Grid item xs={3} sm={6} md={4} position="relative">
            <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
              Company Name*
            </ArgonTypography>
            <FormField
              type="text"
              name="company_name"
              value={formikValue['company_name']}
              onChange={handleChange}
              placeholder="Company Name"
              style={{
                borderColor: `${touched?.company_name && errors?.company_name ? 'red' : 'lightgray'}`,
              }}
            />
            {touched?.company_name && errors?.company_name && <ErrorTemplate message={errors.company_name} />}
          </Grid>

          <Grid item xs={3} sm={6} md={4} position="relative">
            <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
              Short Code
            </ArgonTypography>
            <FormField
              type="text"
              name="short_code"
              placeholder="Short Name"
              value={formikValue['short_code']}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={3} sm={6} md={4}>
            <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
              Legal Status/Constitution
            </ArgonTypography>
            <ArgonSelect
              placeholder="Select Legal Status/Constitution..."
              isClearable={true}
              name="legal_status"
              value={formikValue['legal_status']}
              onChange={(options) => handleSetFormikValues('legal_status', options)}
              defaultValue={{ value: '', label: '' }}
              options={legalStatusOptions.current.map(({ value, name }) => {
                return { value, label: name }
              })}
            />
          </Grid>

          <Grid item xs={3} sm={6} md={4} position="relative">
            <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
              CIN (Corporate Identification Number) {isCinMandatory() ? '' : '*'}
            </ArgonTypography>
            <FormField
              type="text"
              name="cin"
              value={formikValue['cin']}
              onChange={handleChange}
              placeholder="CIN"
              style={{
                borderColor: `${touched?.cin && errors?.cin ? 'red' : 'lightgray'}`,
              }}
            />
            {touched?.cin && errors?.cin && <ErrorTemplate message={errors?.cin} />}
          </Grid>

          <Grid item xs={3} sm={6} md={4} position="relative">
            <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
              Macro Economic Indicator*
            </ArgonTypography>
            <ArgonSelect
              isClearable={true}
              name="macro_economic_indicator"
              value={formikValue['macro_economic_indicator']}
              placeholder={'Select Macro Economic Indicator...'}
              onChange={(options) => handleSetFormikValues('macro_economic_indicator', options)}
              options={macroEconomicOptions}
              isInvalid={touched.macro_economic_indicator?.value && errors.macro_economic_indicator?.value}
            />
            {touched?.macro_economic_indicator?.value && errors?.macro_economic_indicator?.value && (
              <ErrorTemplate message={errors?.macro_economic_indicator.value} />
            )}
          </Grid>

          <Grid item xs={3} sm={6} md={4} position="relative">
            <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
              Sector*
            </ArgonTypography>
            <ArgonSelect
              isClearable={true}
              placeholder="Select Sector..."
              name={'sector'}
              value={formikValue['sector']}
              onChange={(options) => handleSetFormikValues('sector', options)}
              defaultValue={{ value: 'Select Sector', label: 'Select Sector' }}
              options={sectorOptions}
              isInvalid={touched?.sector && errors?.sector}
            />
            {touched?.sector && errors?.sector && <ErrorTemplate message={errors?.sector.value} />}
          </Grid>

          <Grid item xs={3} sm={6} md={4} position="relative">
            <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
              Industry*
            </ArgonTypography>
            <ArgonSelect
              isClearable={true}
              placeholder="Select Industry..."
              name="industry"
              value={formikValue['industry']}
              onChange={(options) => handleSetFormikValues('industry', options)}
              options={industryOptions}
              isInvalid={touched.industry && errors.industry}
            />
            {touched.industry && errors?.industry && <ErrorTemplate message={errors.industry.value} />}
          </Grid>

          <Grid item xs={3} sm={6} md={4}>
            <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
              Sub Industry
            </ArgonTypography>
            <ArgonSelect
              isClearable={true}
              placeholder="Select Sub Industry..."
              name="sub_industry"
              value={formikValue['sub_industry']}
              onChange={(options) => handleSetFormikValues('sub_industry', options)}
              defaultValue={{ value: 'Select...', label: 'Select...' }}
              options={subIndustryOptions}
            />
          </Grid>

          <Grid item xs={3} sm={6} md={4}>
            <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
              Group
            </ArgonTypography>
            <ArgonSelect
              isClearable={true}
              placeholder="Select Group..."
              defaultValue={{ value: '', label: '' }}
              name="group"
              value={formikValue['group']}
              onChange={(options) => handleSetFormikValues('group', options)}
              options={groupOptions.map(({ name, value }) => {
                return { value, label: name }
              })}
            />
          </Grid>

          {/* <Grid item xs={3} sm={6} md={4}>
            <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
              Company Type
            </ArgonTypography>
            <ArgonSelect
              isClearable={true}
              placeholder="Select Company Type..."
              name="company_type"
              value={formikValue['company_type']}
              onChange={(options) => handleSetFormikValues('company_type', options)}
              options={companyTypeOptions.map(({ name, value }) => {
                return { value, label: name }
              })}
            />
          </Grid> */}

          <Grid item xs={3} sm={6} md={4}>
            <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
              Former Name
            </ArgonTypography>
            <FormField
              type="text"
              name="former_name"
              value={formikValue['former_name']}
              onChange={handleChange}
              placeholder="Former Name"
            />
          </Grid>

          <Grid item xs={3} sm={6} md={4} position="relative">
            <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
              PAN {isFieldMandatory.pan && '*'}
            </ArgonTypography>

            {document?.pan && (
              <>
                <div style={docsStyle}>
                  <a
                    className="hover-effect"
                    style={{
                      height: '100%',
                      textDecoration: 'none',
                      color: 'black',
                      width: '100%',
                      fontSize: '12px',
                      overflow: 'hidden',
                      textAlign: 'end',
                      textOverflow: 'ellipsis',
                      marginRight: '6px',
                    }}
                    href={getFileUrl(document[`pan`]?.file)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {document?.pan?.fileName}
                  </a>
                  <CancelOutlined onClick={() => handleRemoveFile('pan')} />
                </div>
              </>
            )}

            <ArgonBox
              sx={{
                border: '1px solid lightgray',
                display: 'flex',
                borderRadius: '5px',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                borderColor: `${touched?.pan && errors?.pan ? 'red' : 'lightgray'}`,
              }}
            >
              <FormField
                type="text"
                placeholder="Pan Number"
                name="pan"
                value={formikValue['pan']}
                onChange={handleChange}
                sx={{ border: 'none !important' }}
              />
              <label htmlFor="contained-button-file-pan">
                <Input id="contained-button-file-pan" type="file" value={''} onChange={(e) => handleFile(e, 'pan')} />
                <ArgonBox variant="contained" component={'span'} sx={{ cursor: 'pointer', marginRight: '10px' }}>
                  <FileUploadOutlined />
                </ArgonBox>
              </label>
            </ArgonBox>
            <>
              {touched?.pan && errors?.pan && <ErrorTemplate message={errors?.pan} />}
              <ArgonBox position="absolute" marginTop={'4px'}>
                <div style={{ Color: '#707070', fontSize: '10px', opacity: '.6' }}>please upload your PAN file</div>
              </ArgonBox>
            </>
          </Grid>

          <Grid item xs={3} sm={6} md={4} position="relative">
            <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
              TAN
            </ArgonTypography>
            {document?.tan && (
              <>
                <div style={docsStyle}>
                  <a
                    className="hover-effect"
                    style={{
                      height: '100%',
                      textDecoration: 'none',
                      color: 'black',
                      width: '100%',
                      textAlign: 'end',
                      fontSize: '12px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginRight: '6px',
                    }}
                    href={getFileUrl(document[`tan`]?.file)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {document?.tan?.fileName}
                  </a>
                  <CancelOutlined onClick={() => handleRemoveFile('tan')} />
                </div>
              </>
            )}
            <ArgonBox
              sx={{
                display: 'flex',
                borderRadius: '5px',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                border: '1px solid lightgray',
                borderColor: `${touched?.tan && errors?.tan ? 'red' : 'lightgray'}`,
              }}
            >
              <FormField
                type="text"
                placeholder="Tan"
                name="tan"
                value={formikValue['tan']}
                onChange={handleChange}
                sx={{ border: 'none !important' }}
                style={{
                  borderColor: `${errors?.tan ? 'red' : 'lightgray'}`,
                }}
              />
              <label htmlFor="contained-button-file-tan">
                <Input id="contained-button-file-tan" type="file" value="" onChange={(e) => handleFile(e, 'tan')} />
                <ArgonBox variant="contained" component={'span'} sx={{ cursor: 'pointer', marginRight: '10px' }}>
                  <FileUploadOutlined />
                </ArgonBox>
              </label>
            </ArgonBox>
            <>
              {touched?.tan && errors?.tan && <ErrorTemplate message={errors?.tan} />}
              <ArgonBox position="absolute" marginTop={'4px'}>
                <div style={{ Color: '#707070', fontSize: '10px', opacity: '.6' }}>please upload your TAN file</div>
              </ArgonBox>
            </>
          </Grid>

          <Grid item xs={3} sm={6} md={4} position="relative">
            <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
              Primary GST {isFieldMandatory.gst && '*'}
            </ArgonTypography>
            {document?.gst && (
              <>
                <div style={{...docsStyle, bottom:"59px"}}>
                  <a
                    className="hover-effect"
                    style={{
                      height: '100%',
                      textDecoration: 'none',
                      color: 'black',
                      width: '100%',
                      fontSize: '12px',
                      overflow: 'hidden',
                      textAlign: 'end',
                      textOverflow: 'ellipsis',
                      marginRight: '6px',
                    }}
                    href={getFileUrl(document[`gst`]?.file)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {document?.gst?.fileName}
                  </a>
                  <CancelOutlined onClick={() => handleRemoveFile('gst')} />
                </div>
              </>
            )}
            <ArgonBox
              sx={{
                border: '1px solid lightgray',
                display: 'flex',
                borderRadius: '5px',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                borderColor: `${touched?.gst && errors?.gst ? 'red' : 'lightgray'}`,
              }}
            >
              <FormField
                type="text"
                placeholder="Primary GST"
                name="gst"
                value={formikValue['gst']}
                onChange={handleChange}
                sx={{ border: 'none !important' }}
              />
              <label htmlFor="contained-button-file-gst">
                <Input id="contained-button-file-gst" type="file" value="" onChange={(e) => handleFile(e, 'gst')} />
                <ArgonBox variant="contained" component={'span'} sx={{ border: 'none !important', marginRight: '10px' }}>
                  <FileUploadOutlined />
                </ArgonBox>
              </label>
            </ArgonBox>
            <>
              {touched?.gst && errors?.gst && <ErrorTemplate message={errors?.gst} />}
              <ArgonBox position="absolute" marginTop={'4px'}>
                <div style={{ Color: '#707070', fontSize: '10px', opacity: '.6' }}>please upload your Primary GST file</div>
              </ArgonBox>
            </>
          </Grid>

          <Grid item xs={3} sm={6} md={4} position="relative">
            <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
              Date of Incorporation
            </ArgonTypography>
            <>
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <DatePicker
                  inputFormat="MM/DD/YYYY"
                  className={'date-picker-width'}
                  name="date_of_incorporation"
                  value={formikValue['date_of_incorporation']}
                  onChange={(newValue) => handleSetFormikValues('date_of_incorporation', newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      sx={{
                        '.MuiOutlinedInput-root': {
                          display: 'flex',
                          justifyContent: 'space-between',
                          paddingLeft: '0px',
                          borderRadius: '2px',
                        },
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
            </>
            <ArgonBox position="absolute" marginTop={'4px'}>
              <div style={{ Color: '#707070', fontSize: '10px', opacity: '.6' }}>
                Date of partnership deed (for partnership cases)/ Date of establishment (for proprietorship cases)
              </div>
            </ArgonBox>
          </Grid>

          <Grid item xs={3} sm={6} md={4} marginTop={'18px'}>
            <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
              Controlling Office
            </ArgonTypography>
            <FormField
              type="text"
              name="controlling_office"
              value={formikValue['controlling_office']}
              onChange={handleChange}
              placeholder="Controlling Office"
            />
          </Grid>

          <Grid item xs={3} sm={6} md={4} marginTop={'18px'}>
            <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
              Website
            </ArgonTypography>
            <FormField
              type="text"
              name="website"
              placeholder="https://"
              value={formikValue['website']}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={3} sm={6} md={4} position="relative" marginTop={'11px'}>
            <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
              <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
                Tags
              </ArgonTypography>
            </ArgonBox>
            <ArgonSelect
              placeholder="Select Tags"
              name="tags"
              value={formikValue['tags']}
              onChange={(options) => handleSetFormikValues('tags', options)}
              options={tagsOptions.map(({ name, uuid }) => {
                return { label: name, value: uuid }
              })}
              isMulti={true}
            />
          </Grid>

          <Grid item xs={3} sm={6} md={4} display={'flex'} gap="20px">
            <FormControlLabel
              control={<Switch name="registered" onChange={handleChange} checked={formikValue['registered']} />}
              label="Registered"
            />
            <FormControlLabel
              control={<Switch name="sez" onChange={handleChange} checked={formikValue['sez']} />}
              label="SEZ"
            />
            <FormControlLabel
              sx={{ paddingLeft: '8px' }}
              control={
                <Switch name="is_infomerics_client" onChange={handleChange} checked={formikValue['is_infomerics_client']} />
              }
              label="Is Infomerics Client"
            />
          </Grid>
        </Grid>
        <Grid container justifyContent={'flex-end'}>
          <ArgonBox padding="10px" display={'flex'} gap={'10px'}>
            <ArgonButton variant="contained" color="success" type={'submit'}>
              Submit
            </ArgonButton>
          </ArgonBox>
        </Grid>
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
      <Modal open={open.modal} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            height: 400,
            zIndex: 999999,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}
        ></Box>
      </Modal>
    </>
  )
}

BasicDetail.propTypes = {
  groupOptions: PropTypes.array,
  legalStatusOptions: PropTypes.object,
  companyTypeOptions: PropTypes.array,
  macroEconomicOptions: PropTypes.array,
  tagsOptions: PropTypes.array,
  handleSetCompanyUuid: PropTypes.func,
  handleChangeActiveTab: PropTypes.func,
  handleSetCompanyName: PropTypes.func,
}

export default BasicDetail
