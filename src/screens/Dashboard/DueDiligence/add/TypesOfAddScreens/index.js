import React, { useEffect, useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined'
import { DatePicker, DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
// import { DemoContainer } from '@mui/x-date-pickers/internals/index'

import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import { Box } from '@mui/system'
import { useFormik } from 'formik'
import Select from 'react-select'
import { dueDiligenceAddSchema } from 'helpers/formikSchema'
import { getDueDiligenceAddSchema } from 'helpers/validationSchema'
import { APIFY, HTTP_CLIENT } from 'helpers/Api'
import ErrorTemplate from 'slots/Custom/ErrorTemplate'
import ArgonSnackbar from 'components/ArgonSnackbar'
import PropTypes from 'prop-types'
import { useLocation, useNavigate } from 'react-router-dom'
import moment from 'moment/moment'
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined'
import CreatableSelect from 'react-select/creatable'
import { styled } from '@mui/system'
import CancelIcon from '@mui/icons-material/Cancel'

const Input = styled(TextField)(({ theme }) => ({
  '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
    display: 'none',
  },
  '& input[type=number]': {
    MozAppearance: 'textfield',
  },
}))

const DiligenceResponse = ({ uuid, operation, setCompanyAndInteractionData, companyAndInteractionData, state }) => {
  const navigate = useNavigate()

  const [interactionTypesOptions, setInteractionTypesOptions] = useState([])
  const [companiesOptions, setCompaniesOptions] = useState([])
  const [contactEmailsOptions, setContactEmailsOptions] = useState([])
  const [stakeHolderOptions, setStakeHolderOptions] = useState([])
  const [meetingTypeOptions, setMeetingTypeOptions] = useState([])
  const [contactNamesOptions, setContactNamesOptions] = useState([])
  const [allQuestions, setAllQuestions] = useState([])
  const [addQuestionStatus, setAddQuestionStatus] = useState(false)
  const [addQuestion, setAddQuestion] = useState('')
  const [answers, setAnswers] = useState([])
  const [viewResponse, setViewResponse] = useState([])
  const [viewDoc, setViewDoc] = useState({})
  const [deleteQuestionKey, setDeleteQuestionKey] = useState({ uuid: '', key: null })
  const [deleteQuestionModal, setDeleteQuestionModal] = useState(false)
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState({ status: false, id: '' })
  const [extraQuestions, setExtraQuestions] = useState([])
  const [document, setDocument] = useState({})
  const [currentInteractionType, setCurrentInteractionType] = useState('')
  const [response, setResponse] = useState(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('Please check all required fields')
  const formik = useFormik({
    initialValues: dueDiligenceAddSchema(currentInteractionType),
    validationSchema: getDueDiligenceAddSchema(currentInteractionType, allQuestions.length),
    onSubmit: (values) => {
      if (operation === 'edit') {
        updateData()
      } else {
        createDiligenceQuestion(values)
      }
    },
  })
  const { errors, touched, setFieldValue, handleSubmit, handleChange, values: formikValue } = formik
  const isFieldValid = (fieldName) => {
    return !!(touched[fieldName] && errors[fieldName])
  }

  const handleSetFormikValues = (key, options) => {
    setFieldValue(key, options)
  }
  const processApiData = () => {
    const processedData = {
      interaction_type_uuid: formikValue.selectedInteractionType.value,
      company_uuid: formikValue.selectedCompanyName.value,
      branch: formikValue.branchName ? formikValue.branchName : null,
      meeting_type: formikValue.selectedMeetingType.label !== 'Select ...' ? formikValue.selectedMeetingType.label : null,
      time_of_interaction: `${new Date(formikValue.interactionDate).toISOString()}`,
      place_of_visit: formikValue.placeOfVisit ? formikValue.placeOfVisit : null,
      phone_number: formikValue.phone ? `${formikValue.phone}` : null,
      stakeholder_uuid: formikValue.selectedStakeholderName?.value ? formikValue.selectedStakeholderName?.value : null,
      contact_person: formikValue?.contactNames ? formikValue?.contactNames : null,
      contact_email: formikValue?.contactEmail ? formikValue?.contactEmail : null,
      params: operation === 'edit' ? viewResponse?.due_diligence_responses : answers.length > 0 ? answers : null,
      // params: allQuestions || null,
      remarks: formikValue.remark,
      is_active: true,
    }
    if (operation === 'edit') {
      return Object.assign(processedData, {
        uuid,
      })
    }
    return processedData
  }
  function getDocument() {
    HTTP_CLIENT(APIFY('/v1/due_diligences/view_documents'), { params: { diligence_data_uuid: uuid } })
      .then((data) => {
        const { diligence_document } = data
        setViewDoc(diligence_document)
      })
      .catch((err) => {
        console.error(err)
      })
  }
  function updateData() {
    HTTP_CLIENT(APIFY('/v1/due_diligence/edit'), {
      uuid: uuid,
      interaction_type_uuid: formikValue.selectedInteractionType.value,
      company_uuid: formikValue.selectedCompanyName.value,
      branch: formikValue.branchName ? formikValue.branchName : null,
      meeting_type: formikValue.selectedMeetingType.label !== 'Select ...' ? formikValue.selectedMeetingType.label : null,
      time_of_interaction: `${new Date(formikValue.interactionDate).toISOString()}`,
      place_of_visit: formikValue.placeOfVisit ? formikValue.placeOfVisit : null,
      phone_number: formikValue.phone ? `${formikValue.phone}` : null,
      stakeholder_uuid: formikValue.selectedStakeholderName?.value ? formikValue.selectedStakeholderName?.value : null,
      contact_person: formikValue?.contactNames ? formikValue?.contactNames : null,
      contact_email: formikValue?.contactEmail ? formikValue?.contactEmail : null,
      params: allQuestions.length > 0 ? allQuestions : viewResponse?.due_diligence_responses,
      remarks: formikValue.remark,
      is_active: true,
    })
      .then((data) => {
        const {} = data
        if (data && formikValue.document) {
          sendDocuments()
        }
        if (data && !formikValue.document) {
          navigate('/dashboard/due-diligence/history', {
            state: { companyAndInteractionData, success: true, type: uuid ? 'UPDATE' : 'CREATE' },
          })
          // navigate('/dashboard/due-diligence/history', {
          //   snackBarState: { success: true, type: 'UPDATE' },
          // })
        }
        // setSnackbarOpen(true);
        // setResponse("success");
        // setSnackbarMessage(`Due Diligence Updated Successfully`);
        // navigate("/dashboard/due-diligence/history");
      })
      .catch((err) => console.error(err))
  }
  function getStakeHolder() {
    HTTP_CLIENT(APIFY('/v1/companies/view_stakeholders'), {
      company_uuid: formikValue.selectedCompanyName?.value,
      stakeholder_type: formikValue.selectedInteractionType?.label,
    })
      .then((data) => {
        const { stakeholders } = data
        // setStakeHolder(stakeholders);
        let contactNamesArr = []
        let contactEmailArr = []
        let stakeHolderArr = []

        data.stakeholders?.map((i) => {
          stakeHolderArr.push({ label: i.name, value: i.uuid })
          if (
            formikValue.selectedInteractionType.label === 'Banker' ||
            formikValue.selectedInteractionType.label === 'Auditor' ||
            formikValue.selectedInteractionType.label === 'IPA Trustee'
          ) {
            if (i.uuid === formikValue.selectedStakeholderName?.value) {
              contactNamesArr.push({ label: i.contact_name + ` (${i.email})`, value: i.uuid })
              contactEmailArr.push({ label: i.email, value: i.uuid })
            }
          }
        })
        setContactNamesOptions(contactNamesArr)
        setContactEmailsOptions(contactEmailArr)
        setStakeHolderOptions(stakeHolderArr)
      })
      .catch((err) => {
        console.error(err)
      })
  }
  function createDiligenceQuestion() {
    HTTP_CLIENT(APIFY('/v1/due_diligences/create'), processApiData())
      .then((data) => {
        const { due_diligence } = data
        if (data && formikValue.document) {
          sendDocuments(data.diligence_data_uuid)
        }
        if (data && !formikValue.document) {
          navigate('/dashboard/due-diligence/history', {
            state: {
              companyAndInteractionData: {
                companyData: formikValue.selectedCompanyName?.value,
              },
              success: true,
              type: uuid ? 'UPDATE' : 'CREATE',
            },
          })
        }
      })
      .catch((err) => {
        setSnackbarOpen(true)
        setResponse('error')
        setSnackbarMessage(`Something went wrong!`)
        console.error(err)
      })
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
  const getFormData = (id) => {
    const formData = new FormData()
    formData.append('document', document['document']['file'])

    if (operation === 'edit' && viewDoc) {
      formData.append('diligence_data_uuid', uuid)
      formData.append('uuid', viewDoc.uuid)
    } else if (operation === 'edit') {
      formData.append('diligence_data_uuid', uuid)
    } else {
      formData.append('diligence_data_uuid', id)
    }
    return formData
  }
  function sendDocuments(id) {
    HTTP_CLIENT(APIFY('/v1/due_diligences/assign_documents'), getFormData(id), true)
      .then((data) => {
        const { companies } = data
        setSnackbarOpen(true)
        setResponse('success')
        setSnackbarMessage(`Due Diligence Created Successfully`)
        navigate('/dashboard/due-diligence/history', {
          state: { companyAndInteractionData, success: true, type: uuid ? 'UPDATE' : 'CREATE' },
        })
      })
      .catch((err) => {
        setSnackbarOpen(true)
        setResponse('error')
        setSnackbarMessage(`Document not submitted`)
        console.error(err)
      })
  }
  const getInteractionTypes = () => {
    HTTP_CLIENT(APIFY('/v1/interaction_type'), { params: { is_active: true } })
      .then((data) => {
        const { interaction_type } = data

        let interactionTypeArr = []
        if (interactionTypesOptions.length === 0) {
          data.interaction_type.map((i) => {
            interactionTypeArr.push({ label: i.name, value: i.uuid })
          })
          setInteractionTypesOptions(interactionTypeArr)
        }
      })
      .catch((err) => {
        console.error(err)
      })
  }
  const getCompanies = () => {
    HTTP_CLIENT(APIFY('/v1/companies/based_on_roles'), {
      params: { user_uuid: '', role_uuid: '' },
    })
      .then((data) => {
        const { companies } = data
        let companyArr = []
        if (companiesOptions.length === 0) {
          companies.map((i) => {
            companyArr.push({ label: i.company_name, value: i.company_uuid })
          })
          setCompaniesOptions(companyArr)
        }
      })
      .catch((err) => {
        console.error(err)
      })
  }
  const getDiligence = () => {
    HTTP_CLIENT(APIFY('/v1/interactions/view_questions'), {
      params: {
        interaction_type_uuid: formikValue.selectedInteractionType.value,
        is_active: true,
      },
    })
      .then((data) => {
        const { interaction_questions } = data
        setAllQuestions(interaction_questions)
      })
      .catch((err) => {
        console.error(err)
      })
  }
  const setAnswersVal = () => {
    let tempAnswer = []
    let temp = [...allQuestions]
    for (let i = 0; i < temp.length; i++) {
      tempAnswer.push({ question: temp[i]['question'].name[0], response: temp[i]['question']['response'] })
    }
    setAnswers(tempAnswer)
  }
  const handleAnswerChange = (e, key, uuid) => {
    // let answer = [...answers]
    let temp = [...allQuestions]
    // let tempAnswer = []
    // if (answer.length > 0 && answer[key] !== undefined && answer[key].question === e.target.name) {
    //   answer[key]['response'] = e.target.value
    // } else {
    //   answer[key] = {
    //     question: e.target.name,
    //     response: e.target.value,
    //   }
    // }

    if (temp.length > 0 && temp[key] !== undefined && temp[key].question.name[0] === e.target.name) {
      temp[key]['question']['response'] = e.target.value
    } else {
      temp[key].question = {
        // question: e.target.name,
        ...temp[key].question,
        response: e.target.value,
      }
    }
    setAllQuestions(temp, 'key')

    // setAnswers(tempAnswer)
    setAnswersVal()
    // setAnswers(answer)
  }
  const getMeetingType = () => {
    HTTP_CLIENT(APIFY('/v1/master'), {
      group: 'meeting_type',
    })
      .then((data) => {
        const { masters } = data
        // setMeetingTypeOpt(masters);
        let meetingTypeArr = []
        if (meetingTypeOptions.length === 0) {
          data.masters.map((i) => {
            meetingTypeArr.push({ label: i.name, value: i.uuid })
          })
          setMeetingTypeOptions(meetingTypeArr)
        }
      })
      .catch((err) => {
        console.error(err)
      })
  }
  const getResponseData = () => {
    HTTP_CLIENT(APIFY('/v1/due_diligences/responses'), {
      params: {
        diligence_data_uuid: uuid,
      },
    })
      .then((data) => {
        const { diligence_data } = data
        setViewResponse(diligence_data)
        setAllQuestions(diligence_data?.due_diligence_responses)
      })
      .catch((err) => {
        console.error(err)
      })
  }
  const deleteDocument = () => {
    HTTP_CLIENT(APIFY('/v1/due_diligence/delete_documents'), {
      params: { due_diligence_uuid: uuid },
    })
      .then((data) => {
        const {} = data
        handleShowSnackBar('success')('Due Diligence document deleted Successfully')
        setViewDoc(null)
      })
      .catch((err) => {
        console.error(err)
        handleShowSnackBar('error')('Something went wrong')
      })
  }
  const setResponseValues = () => {
    setCompanyAndInteractionData({
      companyData: { label: viewResponse?.company?.name, value: viewResponse?.company?.uuid },
    })
    setFieldValue('selectedInteractionType', {
      label: viewResponse?.interaction_type?.name,
      value: viewResponse?.interaction_type?.uuid,
    })
    setFieldValue('selectedCompanyName', { label: viewResponse?.company?.name, value: viewResponse?.company?.uuid })
    setFieldValue('branchName', viewResponse?.branch)
    setFieldValue('interactionDate', viewResponse?.time_of_interaction)
    setFieldValue('placeOfVisit', viewResponse?.place_of_visit)
    setFieldValue('phone', viewResponse?.phone_number)
    setFieldValue('contactNames', viewResponse?.contact_person)
    setFieldValue('contactEmail', viewResponse?.contact_email)
    setFieldValue('remark', viewResponse?.remarks)
    setFieldValue('selectedMeetingType', {
      label: viewResponse?.meeting_type,
      value: viewResponse?.meeting_type,
    })
    setCurrentInteractionType(viewResponse?.interaction_type?.name)
  }
  const onCloseSnackbar = () => {
    setSnackbarOpen(false)
  }
  const handleShowSnackBar = (messageType) => (message) => {
    setSnackbarOpen(true)
    setResponse(messageType)
    setSnackbarMessage(message)
  }
  function getContactDetails() {
    HTTP_CLIENT(APIFY('/v1/companies/view_contact_details'), {
      company_uuid: formikValue.selectedCompanyName?.value,
    })
      .then((data) => {
        let contactNamesArr = []
        let contactEmailArr = []
        if (
          formikValue.selectedInteractionType.label !== 'Banker' &&
          formikValue.selectedInteractionType.label !== 'Auditor' &&
          formikValue.selectedInteractionType.label !== 'IPA Trustee'
        ) {
          data.contact_details?.map((i) => {
            contactNamesArr.push({ label: i.name + ` (${i.email})`, value: i.uuid })
            contactEmailArr.push({ label: i.email, value: i.uuid })
          })
        }
        setContactNamesOptions(contactNamesArr)
        setContactEmailsOptions(contactEmailArr)
      })
      .catch((err) => {
        console.error(err)
      })
  }
  const handleDeleteQuestion = () => {
    if (operation === 'edit') {
      setAllQuestions(
        [...allQuestions].map((val) => {
          if (val.uuid == deleteQuestionKey.uuid) val.is_active = false
          return val
        }),
      )
    } else {
      let temp = [...allQuestions]
      temp.splice(deleteQuestionKey, 1)
      setAllQuestions(temp)
      answers.splice(deleteQuestionKey, 1)
    }
  }
  const currentTime = moment(new Date()).format('HH')

  useEffect(() => {
    if (formikValue.selectedStakeholderName?.label) {
      getStakeHolder()
    }
  }, [formikValue.selectedStakeholderName?.label])
  useEffect(() => {
    if (uuid) {
      getResponseData()
      getDocument()
    }
  }, [])
  useEffect(() => {
    if (operation === 'edit') {
      setResponseValues()
    }
    if (operation === 'view') {
      setCompanyAndInteractionData({
        companyData: { label: viewResponse?.company?.name, value: viewResponse?.company?.uuid },
        interactionData: {
          label: viewResponse?.interaction_type?.name,
          value: viewResponse?.interaction_type?.uuid,
        },
      })
    }
  }, [viewResponse])
  useEffect(() => {
    if (formikValue['selectedStakeholderName']?.value) {
      setFieldValue('selectedStakeholderName', formikValue['selectedStakeholderName'])
    } else {
      setFieldValue('selectedStakeholderName', {
        label: viewResponse?.stakeholder?.name,
        value: viewResponse?.stakeholder?.uuid,
      })
    }
  }, [stakeHolderOptions])
  useEffect(() => {
    if (formikValue.selectedInteractionType?.value && operation !== 'edit') {
      // setContactEmailsOptions([]);
      // setContactNamesOptions([]);
      if (
        formikValue.selectedInteractionType?.label === 'Banker' ||
        formikValue.selectedInteractionType?.label === 'Auditor' ||
        formikValue.selectedInteractionType?.label === 'IPA Trustee'
      ) {
        setStakeHolderOptions([])
        formikValue.selectedStakeholderName = {}
      }
      // if (formikValue.selectedCompanyName?.value !== '') {
      //   getDiligence()
      // }

      setCurrentInteractionType(formikValue.selectedInteractionType?.label)
    }
    if (formikValue.selectedInteractionType?.value && formikValue.selectedCompanyName?.value && !operation) {
      getDiligence()
    }
    getCompanies()
    if (
      formikValue.selectedCompanyName?.value !== '' &&
      (formikValue.selectedInteractionType?.label === 'Management' ||
        formikValue.selectedInteractionType?.label === 'Plant Visit' ||
        formikValue.selectedInteractionType?.label === 'Audit Committee')
    ) {
      getContactDetails()
      getMeetingType()
    }

    if (
      (formikValue.selectedCompanyName?.value !== '' && formikValue.selectedInteractionType?.label === 'Banker') ||
      formikValue.selectedInteractionType?.label === 'Auditor' ||
      formikValue.selectedInteractionType?.label === 'IPA trustee'
    ) {
      getStakeHolder()
      getMeetingType()
    }
    getInteractionTypes()

    return () => {
      if (!operation) {
        setAllQuestions([])
      }
    }
  }, [formikValue.selectedCompanyName, formikValue.selectedInteractionType])
  useEffect(() => {
    if (state) {
      const { companyData } = state
      setCompanyAndInteractionData({
        companyData: { label: companyData?.label, value: companyData?.value },
        // interactionData: {
        //   label: interactionData.interaction_types,
        //   value: interactionData.uuid,
        // },
      })
      // setFieldValue('selectedInteractionType', {
      //   label: interactionData.interaction_types || 'Select Interaction Type...',
      //   value: interactionData.uuid || '',
      // })
      setFieldValue('selectedCompanyName', {
        label: companyData?.label || '',
        value: companyData?.value || '',
      })
    }
  }, [state])
  return (
    <>
      <form onSubmit={handleSubmit}>
        <Box
          sx={{
            px: '2rem',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
            height: 'calc(100vh - 30vh)',
          }}
        >
          <Box>
            <Grid container justifyContent="space-between">
              <Grid item xs={5}>
                <Grid container alignItems="center" mb="1.4rem">
                  {uuid && operation === 'view' && viewResponse ? (
                    <Grid item xs={3.5}>
                      <Typography sx={{ fontSize: '18px' }} component="h5" variant="h5">
                        Company:
                      </Typography>
                    </Grid>
                  ) : (
                    <Grid item xs={3}>
                      <Typography sx={{ fontSize: '14px' }}>Company*</Typography>
                    </Grid>
                  )}
                  {uuid && operation === 'view' && viewResponse ? (
                    <Grid item xs={8}>
                      <Typography sx={{ fontSize: '18px' }}>{viewResponse?.company?.name}</Typography>
                    </Grid>
                  ) : (
                    <Grid item xs={8}>
                      <Select
                        isClearable={!operation ? true : false}
                        placeholder="Select Company..."
                        options={companiesOptions}
                        value={formikValue['selectedCompanyName']?.value && formikValue['selectedCompanyName']}
                        sx={{
                          borderColor: `${isFieldValid('selectedCompanyName') ? 'red' : 'lightgray'}`,
                        }}
                        onMenuOpen={() => {
                          // if (allQuestions.length > 0) {
                          //   setOpen(true)
                          // }
                          if (operation === 'edit') {
                            setOpen(true)
                          }
                        }}
                        onChange={(options) => {
                          handleSetFormikValues('selectedCompanyName', options)
                        }}
                      />
                      {isFieldValid('selectedCompanyName') && <ErrorTemplate message={'Company name is required'} />}
                    </Grid>
                  )}
                </Grid>
                <Grid container alignItems="center" mb="1.4rem">
                  {uuid && operation === 'view' && viewResponse ? (
                    <Grid item xs={3.5}>
                      <Typography sx={{ fontSize: '18px' }} component="h5" variant="h5">
                        Interaction:
                      </Typography>
                    </Grid>
                  ) : (
                    <Grid item xs={3}>
                      <Typography sx={{ fontSize: '14px' }}>Interaction*</Typography>
                    </Grid>
                  )}
                  {uuid && operation === 'view' && viewResponse ? (
                    <Grid item xs={8}>
                      <Typography sx={{ fontSize: '18px' }}>{viewResponse?.interaction_type?.name}</Typography>
                    </Grid>
                  ) : (
                    <Grid item xs={8}>
                      <Select
                        isClearable={!operation ? true : false}
                        placeholder="Select Interaction Type..."
                        options={interactionTypesOptions}
                        value={formikValue['selectedInteractionType']?.value && formikValue['selectedInteractionType']}
                        sx={{
                          borderColor: `${isFieldValid('selectedInteractionType') ? 'red' : 'lightgray'}`,
                        }}
                        onMenuOpen={() => {
                          // if (allQuestions.length > 0) {
                          //   setOpen(true)
                          // }
                          if (operation === 'edit') {
                            setOpen(true)
                          }
                        }}
                        onChange={(options) => {
                          handleSetFormikValues('selectedInteractionType', options)
                        }}
                      />
                      {isFieldValid('selectedInteractionType') && (
                        <ErrorTemplate message={'Interaction type is required.'} />
                      )}
                    </Grid>
                  )}
                </Grid>
                {(formikValue?.selectedInteractionType?.label === 'Banker' ||
                  viewResponse?.interaction_type?.name === 'Banker' ||
                  formikValue?.selectedInteractionType?.label === 'IPA Trustee' ||
                  viewResponse?.interaction_type?.name === 'IPA Trustee' ||
                  formikValue?.selectedInteractionType?.label === 'Auditor' ||
                  viewResponse?.interaction_type?.name === 'Auditor') && (
                  <>
                    <Grid container alignItems="center" mb="1.4rem">
                      {uuid && operation === 'view' && viewResponse ? (
                        <Grid item xs={3.5}>
                          <Typography sx={{ fontSize: '18px' }} variant="h5" component="h5">
                            {viewResponse?.interaction_type?.name === 'Banker' ||
                            formikValue?.selectedInteractionType?.label === 'Banker'
                              ? 'Bank Name:'
                              : viewResponse?.interaction_type?.name === 'IPA Trustee' ||
                                formikValue?.selectedInteractionType?.label === 'IPA Trustee'
                              ? 'Trust Name:'
                              : (viewResponse?.interaction_type?.name === 'Auditor' ||
                                  formikValue?.selectedInteractionType?.label === 'Auditor') &&
                                'Auditor:'}
                          </Typography>
                        </Grid>
                      ) : (
                        <Grid item xs={3}>
                          <Typography sx={{ fontSize: '14px' }}>
                            {viewResponse?.interaction_type?.name === 'Banker' ||
                            formikValue?.selectedInteractionType?.label === 'Banker'
                              ? 'Bank Name*'
                              : viewResponse?.interaction_type?.name === 'IPA Trustee' ||
                                formikValue?.selectedInteractionType?.label === 'IPA Trustee'
                              ? 'Trust Name*'
                              : (viewResponse?.interaction_type?.name === 'Auditor' ||
                                  formikValue?.selectedInteractionType?.label === 'Auditor') &&
                                'Auditor*'}
                          </Typography>
                        </Grid>
                      )}
                      {uuid && operation === 'view' && viewResponse ? (
                        <Grid item xs={8}>
                          <Typography sx={{ fontSize: '18px' }}>{viewResponse?.stakeholder?.name}</Typography>
                        </Grid>
                      ) : (
                        <Grid item xs={8}>
                          <Select
                            isClearable={true}
                            placeholder={
                              formikValue?.selectedInteractionType?.label === 'Banker'
                                ? 'Select Bank Name...'
                                : formikValue?.selectedInteractionType?.label === 'IPA Trustee'
                                ? 'Select Trust Name...'
                                : formikValue?.selectedInteractionType?.label === 'Auditor' && 'Select Auditor...'
                            }
                            options={stakeHolderOptions}
                            value={formikValue['selectedStakeholderName']?.value && formikValue['selectedStakeholderName']}
                            sx={{
                              borderColor: `${isFieldValid('selectedStakeholderName') ? 'red' : 'lightgray'}`,
                            }}
                            onChange={(options) => handleSetFormikValues('selectedStakeholderName', options)}
                          />
                          {isFieldValid('selectedStakeholderName') && (
                            <ErrorTemplate
                              message={`${
                                formikValue.selectedInteractionType?.label === 'Banker'
                                  ? 'Bank'
                                  : formikValue.selectedInteractionType?.label === 'Auditor'
                                  ? 'Auditor'
                                  : 'Trust'
                              } name is required`}
                            />
                          )}
                        </Grid>
                      )}
                    </Grid>
                  </>
                )}
                {(formikValue?.selectedInteractionType?.label === 'Banker' ||
                  viewResponse?.interaction_type?.name === 'Banker') && (
                  <Grid container alignItems="center" mb="1.4rem">
                    {uuid && operation === 'view' && viewResponse ? (
                      <Grid item xs={3.5}>
                        <Typography sx={{ fontSize: '18px' }} component="h5" variant="h5">
                          Branch:
                        </Typography>
                      </Grid>
                    ) : (
                      <Grid item xs={3}>
                        <Typography sx={{ fontSize: '14px' }}>Branch*</Typography>
                      </Grid>
                    )}
                    {uuid && operation === 'view' && viewResponse ? (
                      <Grid item xs={8}>
                        <Typography sx={{ fontSize: '18px' }}>{viewResponse?.branch}</Typography>
                      </Grid>
                    ) : (
                      <Grid item xs={8}>
                        <TextField
                          placeholder="Branch"
                          name="branchName"
                          type="text"
                          sx={{
                            '&>div>input': {
                              width: '100% !important',
                              paddingLeft: 0,
                            },
                          }}
                          value={formikValue['branchName']}
                          onChange={handleChange}
                          fullWidth
                          style={{
                            borderColor: `${touched?.branchName && errors?.branchName ? 'red' : 'lightgray'}`,
                          }}
                          required
                        />
                        {isFieldValid('branchName') && <ErrorTemplate message={`Branch name is required`} />}
                      </Grid>
                    )}
                  </Grid>
                )}

                {(formikValue?.selectedInteractionType?.label === 'Plant Visit' ||
                  viewResponse?.interaction_type?.name === 'Plant Visit' ||
                  formikValue?.selectedInteractionType?.label === 'Audit Committee' ||
                  viewResponse?.interaction_type?.name === 'Audit Committee' ||
                  formikValue?.selectedInteractionType?.label === 'Management' ||
                  viewResponse?.interaction_type?.name === 'Management') && (
                  <Grid container alignItems="center" mb="1.4rem">
                    {uuid && operation === 'view' && viewResponse ? (
                      <Grid item xs={3.5}>
                        <Typography sx={{ fontSize: '18px' }} component="h5" variant="h5">
                          Phone:
                        </Typography>
                      </Grid>
                    ) : (
                      <Grid item xs={3}>
                        <Typography sx={{ fontSize: '14px' }}>Phone*</Typography>
                      </Grid>
                    )}
                    {uuid && operation === 'view' && viewResponse ? (
                      <Grid item xs={8}>
                        <Typography sx={{ fontSize: '18px' }}>{viewResponse?.phone_number}</Typography>
                      </Grid>
                    ) : (
                      <Grid item xs={8}>
                        <Input
                          type="number"
                          placeholder="Phone"
                          name="phone"
                          sx={{
                            '&>div>input': {
                              width: '100% !important',
                              paddingLeft: 0,
                            },
                          }}
                          value={formikValue['phone']}
                          onChange={handleChange}
                          fullWidth
                          style={{
                            borderColor: `${touched?.phone && errors?.phone ? 'red' : 'lightgray'}`,
                          }}
                        />
                        {isFieldValid('phone') && (
                          <ErrorTemplate
                            message={
                              formikValue['phone'].length === 0
                                ? `Phone number is required`
                                : `Please enter a valid phone number`
                            }
                          />
                        )}
                      </Grid>
                    )}
                  </Grid>
                )}
              </Grid>
              <Grid item xs={5} sx={{ '&>div': { justifyContent: 'flex-end' } }}>
                {formikValue?.selectedInteractionType?.label !== 'Plant Visit' &&
                  viewResponse?.interaction_type?.name !== 'Plant Visit' && (
                    <Grid container alignItems="center" mb="1.4rem">
                      {uuid && operation === 'view' && viewResponse ? (
                        <Grid item xs={4}>
                          <Typography sx={{ fontSize: '18px' }} component="h5" variant="h5">
                            Meeting Type:
                          </Typography>
                        </Grid>
                      ) : (
                        <Grid item xs={3}>
                          <Typography sx={{ fontSize: '14px' }}>Meeting Type*</Typography>
                        </Grid>
                      )}
                      {uuid && operation === 'view' && viewResponse ? (
                        <Grid item xs={7}>
                          <Typography sx={{ fontSize: '18px' }}>{viewResponse?.meeting_type}</Typography>
                        </Grid>
                      ) : (
                        <Grid item xs={8}>
                          <Select
                            isClearable={true}
                            placeholder="Select Meeting Type..."
                            options={meetingTypeOptions}
                            value={formikValue['selectedMeetingType']?.value && formikValue['selectedMeetingType']}
                            sx={{
                              borderColor: `${isFieldValid('selectedMeetingType') ? 'red' : 'lightgray'}`,
                            }}
                            onChange={(options) => handleSetFormikValues('selectedMeetingType', options)}
                          />
                          {isFieldValid('selectedMeetingType') && <ErrorTemplate message={'Meeting type is required'} />}
                        </Grid>
                      )}
                    </Grid>
                  )}
                {(formikValue?.selectedInteractionType?.label === 'Plant Visit' ||
                  viewResponse?.interaction_type?.name === 'Plant Visit') && (
                  <Grid container alignItems="center" mb="1.4rem">
                    {uuid && operation === 'view' && viewResponse ? (
                      <Grid item xs={4}>
                        <Typography sx={{ fontSize: '18px' }} component="h5" variant="h5">
                          Place of Visit:
                        </Typography>
                      </Grid>
                    ) : (
                      <Grid item xs={3}>
                        <Typography sx={{ fontSize: '14px' }}>Place of Visit*</Typography>
                      </Grid>
                    )}
                    {uuid && operation === 'view' && viewResponse ? (
                      <Grid item xs={7}>
                        <Typography sx={{ fontSize: '18px' }}>{viewResponse?.place_of_visit}</Typography>
                      </Grid>
                    ) : (
                      <Grid item xs={8}>
                        <TextField
                          placeholder="Place of Visit"
                          name="placeOfVisit"
                          value={formikValue['placeOfVisit']}
                          onChange={handleChange}
                          fullWidth
                          type="text"
                          sx={{
                            '&>div>input': {
                              width: '100% !important',
                              paddingLeft: 0,
                            },
                          }}
                          style={{
                            borderColor: `${touched?.placeOfVisit && errors?.placeOfVisit ? 'red' : 'lightgray'}`,
                          }}
                        />
                        {isFieldValid('placeOfVisit') && <ErrorTemplate message={'Place of visit is required'} />}
                      </Grid>
                    )}
                  </Grid>
                )}
                {(formikValue?.selectedInteractionType?.label === 'Plant Visit' ||
                  viewResponse?.interaction_type?.name === 'Plant Visit') && (
                  <Grid container alignItems="center" mb="1.4rem">
                    {uuid && operation === 'view' && viewResponse ? (
                      <Grid item xs={4}>
                        <Typography sx={{ fontSize: '18px' }} component="h5" variant="h5">
                          Date of Visit:
                        </Typography>
                      </Grid>
                    ) : (
                      <Grid item xs={3}>
                        <Typography sx={{ fontSize: '14px' }}>Date of Visit*</Typography>
                      </Grid>
                    )}
                    {uuid && operation === 'view' && viewResponse ? (
                      <Grid item xs={7}>
                        <Typography sx={{ fontSize: '18px' }}>
                          {moment(viewResponse?.time_of_interaction).format('DD-MM-YYYY')}
                        </Typography>
                      </Grid>
                    ) : (
                      <Grid item xs={8}>
                        <LocalizationProvider dateAdapter={AdapterMoment}>
                          <DatePicker
                            disableFuture
                            className={'date-picker-width'}
                            name="interactionDate"
                            value={formikValue['interactionDate']}
                            onChange={(newValue) => handleSetFormikValues('interactionDate', newValue)}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                inputProps={{
                                  ...params.inputProps,
                                  placeholder: 'DD/MM/YYYY',
                                }}
                                sx={{
                                  '.MuiOutlinedInput-root': {
                                    paddingLeft: '0px',
                                    borderRadius: '2px',
                                    display: 'flex',
                                    justifyContent: 'space-between !important',
                                  },
                                }}
                              />
                            )}
                          />
                        </LocalizationProvider>
                        {isFieldValid('interactionDate') && <ErrorTemplate message={'Date is required'} />}
                      </Grid>
                    )}
                  </Grid>
                )}
                {formikValue?.selectedInteractionType?.label !== 'Plant Visit' &&
                  viewResponse?.interaction_type?.name !== 'Plant Visit' && (
                    <Grid container alignItems="center" mb="1.4rem">
                      {uuid && operation === 'view' && viewResponse ? (
                        <Grid item xs={4}>
                          <Typography sx={{ fontSize: '18px' }} component="h5" variant="h5">
                            Date & Time:
                          </Typography>
                        </Grid>
                      ) : (
                        <Grid item xs={3}>
                          <Typography sx={{ fontSize: '14px' }}>Date & Time*</Typography>
                        </Grid>
                      )}
                      {uuid && operation === 'view' && viewResponse ? (
                        <Grid item xs={7}>
                          <Typography sx={{ fontSize: '18px' }}>
                            {moment(viewResponse?.time_of_interaction).format('DD-MM-YYYY')}
                            {' / '}
                            {new Date(viewResponse?.time_of_interaction).toLocaleString('en-US', {
                              hour: 'numeric',
                              minute: 'numeric',
                              hour12: true,
                            })}
                          </Typography>
                        </Grid>
                      ) : (
                        <Grid item xs={8}>
                          <LocalizationProvider dateAdapter={AdapterMoment}>
                            {/* <DemoContainer components={['DateTimePicker']}> */}
                            <DateTimePicker
                              disableFuture
                              maxDateTime={moment().set('hour', currentTime)}
                              className={'date-picker-width'}
                              name="interactionDate"
                              value={formikValue['interactionDate']}
                              onChange={(newValue) => handleSetFormikValues('interactionDate', newValue)}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  inputProps={{
                                    ...params.inputProps,
                                    placeholder: 'DD/MM/YYYY hh:mm',
                                  }}
                                  sx={{
                                    '.MuiOutlinedInput-root': {
                                      paddingLeft: '0px',
                                      borderRadius: '2px',
                                      display: 'flex',
                                      justifyContent: 'space-between !important',
                                    },
                                  }}
                                />
                              )}
                            />
                            {/* </DemoContainer> */}
                          </LocalizationProvider>
                          {isFieldValid('interactionDate') && <ErrorTemplate message={'Date and time is required'} />}
                        </Grid>
                      )}
                    </Grid>
                  )}
                {(formikValue?.selectedInteractionType?.label === 'Banker' ||
                  viewResponse?.interaction_type?.name === 'Banker' ||
                  formikValue?.selectedInteractionType?.label === 'Auditor' ||
                  viewResponse?.interaction_type?.name === 'Auditor' ||
                  formikValue?.selectedInteractionType?.label === 'IPA Trustee' ||
                  viewResponse?.interaction_type?.name === 'IPA Trustee') && (
                  <Grid container alignItems="center" mb="1.4rem">
                    {uuid && operation === 'view' && viewResponse ? (
                      <Grid item xs={4}>
                        <Typography sx={{ fontSize: '18px' }} component="h5" variant="h5">
                          Phone:
                        </Typography>
                      </Grid>
                    ) : (
                      <Grid item xs={3}>
                        <Typography sx={{ fontSize: '14px' }}>Phone*</Typography>
                      </Grid>
                    )}
                    {uuid && operation === 'view' && viewResponse ? (
                      <Grid item xs={7}>
                        <Typography sx={{ fontSize: '18px' }}>{viewResponse?.phone_number}</Typography>
                      </Grid>
                    ) : (
                      <Grid item xs={8}>
                        <Input
                          type="number"
                          placeholder="Phone"
                          name="phone"
                          sx={{
                            '&>div>input': {
                              width: '100% !important',
                              paddingLeft: 0,
                            },
                          }}
                          value={formikValue['phone']}
                          onChange={handleChange}
                          fullWidth
                          style={{
                            borderColor: `${touched?.phone && errors?.phone ? 'red' : 'lightgray'}`,
                          }}
                        />
                        {isFieldValid('phone') && (
                          <ErrorTemplate
                            message={
                              formikValue['phone'].length === 0
                                ? `Phone number is required`
                                : `Please enter a valid phone number`
                            }
                          />
                        )}
                      </Grid>
                    )}
                  </Grid>
                )}
              </Grid>
            </Grid>

            <Grid container justifyContent="space-between" alignItems="flex-start">
              {uuid && operation === 'view' && viewResponse ? (
                <Grid item xs={1.6}>
                  <Typography sx={{ fontSize: '18px' }} component="h5" variant="h5">
                    Contact Person:
                  </Typography>
                </Grid>
              ) : (
                <Grid item xs={1}>
                  <Typography sx={{ fontSize: '14px' }}>Contact Person*</Typography>
                </Grid>
              )}
              {uuid && operation === 'view' && viewResponse ? (
                <Grid item xs={10.4}>
                  <Typography sx={{ fontSize: '18px' }}>
                    {viewResponse?.contact_person?.map((name, id) => {
                      return (
                        <React.Fragment key={name?.value}>
                          {viewResponse?.contact_person.length - 1 > id ? `${name?.label}, ` : `${name?.label}`}
                        </React.Fragment>
                      )
                    })}
                  </Typography>
                </Grid>
              ) : (
                <Grid item xs={10.75}>
                  <CreatableSelect
                    placeholder="Select Contact Person..."
                    value={formikValue['contactNames']}
                    sx={{
                      borderColor: `${isFieldValid('contactNames') ? 'red' : 'lightgray'}`,
                    }}
                    onChange={(options) => handleSetFormikValues('contactNames', options)}
                    isMulti
                    options={contactNamesOptions}
                    required
                  />
                  {isFieldValid('contactNames') && <ErrorTemplate message={`Contact name is required`} />}
                </Grid>
              )}
            </Grid>
            <hr
              style={{
                backgroundColor: 'gray',
                margin: '2.5rem 0',
                border: 'none',
                height: '0.8px',
                color: '#c9c9c9',
              }}
            />
            {(uuid || allQuestions.length > 0) && (
              <Box>
                <Grid container>
                  <Grid item xs={8.5}>
                    <Typography sx={{ fontSize: '18px', fontWeight: '500', color: '#344767' }}>Question</Typography>
                  </Grid>
                  <Grid item xs={3.5}>
                    {uuid ? (
                      <Typography sx={{ fontSize: '18px', fontWeight: '500', color: '#344767' }}>
                        {viewResponse?.interaction_type?.name} Response
                      </Typography>
                    ) : (
                      <Typography sx={{ fontSize: '18px', fontWeight: '500', color: '#344767' }}>
                        {formikValue.selectedInteractionType?.label !== 'Select Interaction Type...' &&
                          formikValue.selectedInteractionType?.label}{' '}
                        Response
                      </Typography>
                    )}
                  </Grid>
                </Grid>
                <Grid container>
                  {viewResponse.length !== 0 ? (
                    <>
                      {[...allQuestions]
                        .filter((val) => !(val.is_active === false))
                        .map((question, key) => {
                          return (
                            <React.Fragment key={question.uuid}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  width: '100%',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  borderBottom: key < allQuestions.length - 1 ? '1.8px solid' : 'none',
                                  borderColor: '#e9e9e9',
                                  padding: '1.6rem 0',
                                }}
                              >
                                <Box
                                  sx={{
                                    width: '100%',
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'flex-start',
                                      width: '100%',
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        mr: '0.25rem',
                                        color: '#4F4F52',
                                        fontSize: '14px',
                                      }}
                                    >
                                      Q{key + 1}.
                                    </Typography>
                                    {/* {allQuestions.map((q) => {
                                    
                                    if (q.question.name[0] === question.question) {
                                      console.log("true");
                                    } else {
                                      console.log("false");
                                    }
                                  })} */}
                                    <Box sx={{ width: '100%' }}>
                                      {/* {q.question ? ( */}
                                      <Box
                                        sx={{
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          width: '100%',
                                          color: '#4f4f4f',
                                          fontSize: '14px',
                                        }}
                                      >
                                        <Box sx={{ width: '84%', display: 'flex', alignItems: 'flex-start' }}>
                                          {/* <Typography
                                            contentEditable
                                            onInput={(e) => {
                                              let temp = [...allQuestions]
                                              // temp[key].response = e.target.value
                                              temp = temp.map((val) => {
                                                if (val.uuid === question.uuid) {
                                                  val.question = e.target.innerHTML
                                                }
                                                return val
                                              })
                                              setAllQuestions([...temp])
                                            }}
                                            sx={{ width: '84%', fontSize: '14px' }}
                                          >
                                            {question?.question}
                                          </Typography> */}
                                          {operation === 'view' ? (
                                            <Typography sx={{ width: '84%', fontSize: '14px' }}>
                                              {question?.question}
                                            </Typography>
                                          ) : operation === 'edit' && question?.is_master ? (
                                            <Typography sx={{ width: '84%', fontSize: '14px' }}>
                                              {question?.question}
                                            </Typography>
                                          ) : (
                                            <Tooltip title={`Click and edit`}>
                                              <TextField
                                                multiline
                                                minRows={1}
                                                sx={{
                                                  'width': '100%',
                                                  '&>div': {
                                                    padding: 0,
                                                    paddingTop: '0.14rem',
                                                    border: edit.status && edit.id === question.uuid ? '' : 'none',
                                                  },
                                                  '&>div>textarea': {
                                                    paddingRight: '0px !important',
                                                    width: '100% !important',
                                                  },
                                                }}
                                                onFocus={() => setEdit({ status: true, id: question.uuid })}
                                                onBlur={() => {
                                                  setEdit({ status: false, id: '' })
                                                }}
                                                // onKeyUp={textAreaAdjust(this)}
                                                value={question.question}
                                                onChange={(e) => {
                                                  let temp = [...allQuestions]
                                                  temp = temp.map((val) => {
                                                    if (val.uuid === question.uuid) {
                                                      val.question = e.target.value
                                                    }
                                                    return val
                                                  })
                                                  setAllQuestions(temp)
                                                }}
                                                required
                                              />
                                            </Tooltip>
                                          )}
                                          {/* <textarea
                                            rows={1}
                                            // onKeyUp={textAreaAdjust(this)}

                                            style={{
                                              'border': 'none',
                                              'width': '100%',
                                              'paddingTop': '0.14rem',
                                              'color': '#4F4F52',
                                              'fontSize': '14px',
                                              'resize': 'vertical',
                                              'minHeight': '20px',
                                              '&::WebkitScrollbar': { width: 0, height: 0 },
                                            }}
                                            // alignContent="center"
                                            // primary="List Text"
                                            // sx={{ fontSize: '14px' }}
                                            value={question.question}
                                            onChange={(e) => {
                                              let temp = [...allQuestions]
                                              temp = temp.map((val) => {
                                                if (val.uuid === question.uuid) {
                                                  val.question = e.target.value
                                                }
                                                return val
                                              })
                                              setAllQuestions(temp)
                                            }}
                                            required
                                          /> */}

                                          {operation === 'edit' && !question.is_master && (
                                            <>
                                              {/* <IconButton onClick={() => setEdit({ status: true, id: question.uuid })}>
                                                <EditIcon />
                                              </IconButton> */}
                                              <IconButton
                                                onClick={() => {
                                                  setDeleteQuestionKey({ uuid: question.uuid, key: key })
                                                  setDeleteQuestionModal(true)
                                                }}
                                              >
                                                <DeleteForeverOutlinedIcon />
                                              </IconButton>
                                            </>
                                          )}
                                        </Box>
                                        <TextField
                                          minRows={2}
                                          multiline
                                          name={question.response}
                                          disabled={operation === 'view' ? true : false}
                                          value={question.response}
                                          sx={{
                                            'width': '40%',
                                            'ml': '4rem',
                                            '&>div>textarea': {
                                              paddingRight: '0px !important',
                                              width: '100% !important',
                                            },
                                          }}
                                          id="outlined"
                                          variant="outlined"
                                          onChange={(e) => {
                                            let temp = [...allQuestions]
                                            // temp[key].response = e.target.value
                                            temp = temp.map((val) => {
                                              if (val.uuid === question.uuid) val.response = e.target.value
                                              return val
                                            })
                                            setAllQuestions([...temp])
                                          }}
                                          required
                                        />
                                      </Box>
                                    </Box>
                                  </Box>
                                </Box>
                              </Box>
                            </React.Fragment>
                          )
                        })}
                      {addQuestionStatus && (
                        <>
                          <Box
                            sx={{
                              border: '1px solid',
                              borderRadius: '4px',
                              display: 'flex',
                              width: '100%',
                              alignItems: 'flex-start',
                              justifyContent: 'space-between',
                              my: '1.4rem',
                              p: '1rem 0.6rem',
                            }}
                          >
                            <TextField
                              id="outlined"
                              variant="outlined"
                              value={addQuestion}
                              autoComplete="off"
                              multiline
                              minRows={2}
                              placeholder="Enter your question"
                              onChange={(e) => setAddQuestion(e.target.value)}
                              sx={{
                                '&>div>textarea': {
                                  paddingRight: '0px !important',
                                  width: '100% !important',
                                },
                                'width': '70%',
                              }}
                            />
                            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                              <Button
                                sx={{
                                  'backgroundColor': '#3c5cd2',
                                  'color': '#ffffff',
                                  'borderRadius': '0.25rem',
                                  'padding': '0.4rem 0.8rem',
                                  '&:hover': {
                                    backgroundColor: '#3c5cd2',
                                    color: '#ffffff',
                                  },
                                }}
                                onClick={() => {
                                  if (addQuestionStatus && addQuestion.length > 0) {
                                    allQuestions.push({
                                      question: addQuestion,
                                      response: '',
                                      is_active: true,
                                      is_master: false,
                                      uuid: Math.random().toString(16).slice(2),
                                    })

                                    // extraQuestions.push(addQuestion)
                                    setAddQuestion('')
                                    setAddQuestionStatus(false)
                                  }
                                }}
                              >
                                Add
                              </Button>
                              <Button
                                sx={{
                                  'border': '1px solid #404040',
                                  'color': '#414141',
                                  // mt: "1rem",
                                  'ml': '1rem',
                                  'padding': '0.4rem 0.8rem',
                                  'borderRadius': '0.25rem',
                                  '&:hover': {
                                    color: '#414141',
                                  },
                                }}
                                onClick={() => {
                                  setAddQuestionStatus(false)
                                  setAddQuestion('')
                                }}
                              >
                                Cancel
                              </Button>
                            </Box>
                          </Box>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {allQuestions?.map(({ question }, key) => {
                        return (
                          <React.Fragment key={question.uuid}>
                            <Box
                              sx={{
                                display: 'flex',
                                width: '100%',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderBottom: key < allQuestions.length - 1 ? '1.8px solid' : 'none',
                                borderColor: '#e9e9e9',
                                padding: '1.6rem 0',
                              }}
                            >
                              <Box
                                sx={{
                                  width: '100%',
                                }}
                              >
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'start',
                                    width: '100%',
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      '.css-i2t0sh-MuiTypography-root': {
                                        fontSize: '0.8rem',
                                      },
                                      'mr': '0.25rem',
                                      'color': '#4F4F52',
                                      'fontSize': '14px',
                                    }}
                                  >
                                    Q{key + 1}.
                                  </Typography>
                                  <Box sx={{ width: '100%' }}>
                                    {/* {q.question ? ( */}
                                    <Box
                                      sx={{
                                        'display': 'flex',
                                        'justifyContent': 'space-between',
                                        'alignItems': 'start',
                                        'width': '100%',
                                        'color': '#4f4f4f',
                                        'fontSize': '14px !important',
                                        '.css-8m9tug-MuiTypography-root': {
                                          fontSize: '14px',
                                        },
                                      }}
                                    >
                                      <Box sx={{ width: '84%' }}>
                                        {question.name.length === 1 ? (
                                          <>
                                            {/* <Typography primary="List Text" sx={{ fontSize: "14px" }}></Typography> */}
                                            {/* {question.name[0]}{" "} */}
                                            {/* {extraQuestions.map(
                                              (q) =>
                                              allQuestions.includes(q) && (
                                                <>
                                                <EditOutlinedIcon />
                                                </>
                                            )
                                          )} */}

                                            {extraQuestions.some((q) => q.question.uuid === question.uuid) ? (
                                              <>
                                                <Box
                                                  display="flex"
                                                  alignItems="flex-start"
                                                  width="100%"
                                                  justifyContent="space-between"
                                                >
                                                  <Tooltip title={`Click and edit`}>
                                                    <TextField
                                                      multiline
                                                      minRows={1}
                                                      sx={{
                                                        'width': '100%',
                                                        '&>div': {
                                                          padding: 0,
                                                          paddingTop: '0.14rem',
                                                          border: edit.status && edit.id === question.uuid ? '' : 'none',
                                                        },
                                                        '&>div>textarea': {
                                                          paddingRight: '0px !important',
                                                          width: '100% !important',
                                                        },
                                                      }}
                                                      onFocus={() => setEdit({ status: true, id: question.uuid })}
                                                      onBlur={() => {
                                                        setEdit({ status: false, id: '' })
                                                      }}
                                                      value={question.name[0]}
                                                      onChange={(e) => {
                                                        let temp = [...allQuestions]
                                                        temp = temp.map((val) => {
                                                          if (val.question.uuid === question.uuid) {
                                                            val.question.name[0] = e.target.value
                                                          }
                                                          return val
                                                        })
                                                        setAnswersVal()
                                                        setAllQuestions([...temp])
                                                      }}
                                                    />
                                                  </Tooltip>

                                                  {/* <IconButton
                                                      onClick={() => {
                                                        setAddQuestionStatus(true)
                                                        setAddQuestion()
                                                      }}
                                                      size="small"
                                                    >
                                                      <EditIcon />
                                                    </IconButton> */}

                                                  {/* <input
                                                    style={{ border: 'none' }}
                                                    // alignContent="center"
                                                    // primary="List Text"
                                                    // sx={{ fontSize: '14px' }}
                                                    value={question.name[0]}
                                                    onChange={(e) => {
                                                      let temp = [...allQuestions]

                                                      temp = temp.map((val) => {
                                                        if (val.question.uuid === question.uuid) {
                                                          val.question.name[0] = e.target.value
                                                        }
                                                        return val
                                                      })
                                                      setAllQuestions(temp)
                                                      // setExtraQuestions(temp)
                                                    }}
                                                  /> */}
                                                  {/* <IconButton
                                                    onClick={() => {
                                                      setAddQuestionStatus(true)
                                                      setAddQuestion()
                                                    }}
                                                    size="small"
                                                  >
                                                    <EditIcon />
                                                  </IconButton> */}
                                                  <Grid>
                                                    <IconButton
                                                      onClick={() => {
                                                        setDeleteQuestionKey(key)
                                                        setDeleteQuestionModal(true)
                                                      }}
                                                    >
                                                      <DeleteForeverOutlinedIcon />
                                                    </IconButton>
                                                  </Grid>
                                                </Box>
                                              </>
                                            ) : (
                                              <>
                                                <Typography primary="List Text" sx={{ fontSize: '14px' }}>
                                                  {question.name[0]}{' '}
                                                </Typography>
                                              </>
                                            )}
                                          </>
                                        ) : (
                                          question.name.map((q) => {
                                            return (
                                              <React.Fragment key={q}>
                                                <Typography sx={{ fontSize: '14px' }}>{q} </Typography>
                                              </React.Fragment>
                                            )
                                          })
                                        )}
                                      </Box>
                                      <TextField
                                        required
                                        multiline
                                        minRows={2}
                                        value={answers[key]?.response}
                                        sx={{
                                          'width': '40%',
                                          'ml': '4rem',
                                          '&>div>textarea': {
                                            paddingRight: '0px !important',
                                            width: '100% !important',
                                          },
                                        }}
                                        id="outlined"
                                        variant="outlined"
                                        name={question.name}
                                        onChange={(e) => handleAnswerChange(e, key, question.uuid)}
                                      />
                                    </Box>
                                  </Box>
                                </Box>
                              </Box>
                            </Box>
                          </React.Fragment>
                        )
                      })}
                      {addQuestionStatus && (
                        <>
                          <Box
                            sx={{
                              border: '1px solid',
                              borderRadius: '4px',
                              display: 'flex',
                              width: '100%',
                              alignItems: 'flex-start',
                              justifyContent: 'space-between',
                              my: '1.4rem',
                              p: '1rem 0.6rem',
                            }}
                          >
                            <TextField
                              id="outlined"
                              variant="outlined"
                              value={addQuestion}
                              autoComplete="off"
                              multiline
                              minRows={2}
                              placeholder="Enter your question"
                              onChange={(e) => setAddQuestion(e.target.value)}
                              sx={{
                                '&>div>textarea': {
                                  paddingRight: '0px !important',
                                  width: '100% !important',
                                },
                                'width': '70%',
                              }}
                            />
                            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                              <Button
                                sx={{
                                  'backgroundColor': '#3c5cd2',
                                  'color': '#ffffff',
                                  'borderRadius': '0.25rem',
                                  'padding': '0.4rem 0.8rem',
                                  '&:hover': {
                                    backgroundColor: '#3c5cd2',
                                    color: '#ffffff',
                                  },
                                }}
                                onClick={() => {
                                  let uuid = Math.random().toString(16).slice(2)
                                  if (addQuestionStatus && addQuestion.length > 0) {
                                    allQuestions.push({
                                      question: {
                                        name: [addQuestion],
                                        uuid: uuid,
                                        is_master: false,
                                      },
                                    })
                                    extraQuestions.push({
                                      question: {
                                        name: [addQuestion],
                                        uuid: uuid,
                                      },
                                    })
                                    setAddQuestion('')
                                    setAddQuestionStatus(false)
                                  }
                                }}
                              >
                                Add
                              </Button>
                              <Button
                                sx={{
                                  'border': '1px solid #404040',
                                  'color': '#414141',
                                  // mt: "1rem",
                                  'ml': '1rem',
                                  'padding': '0.4rem 0.8rem',
                                  'borderRadius': '0.25rem',
                                  '&:hover': {
                                    color: '#414141',
                                  },
                                }}
                                onClick={() => {
                                  setAddQuestionStatus(false)
                                }}
                              >
                                Cancel
                              </Button>
                            </Box>
                          </Box>
                        </>
                      )}
                    </>
                  )}
                  {operation !== 'view' && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <label
                        style={{
                          cursor: 'pointer',
                          border: '1px solid',
                          borderColor: '#999db3',
                          backgroundColor: '#f4f7ff',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0.6rem 1rem',
                          width: 'fit-content',
                          borderRadius: '0.5rem',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          marginTop: '1rem',
                        }}
                      >
                        <input onClick={() => setAddQuestionStatus(true)} type="button" style={{ display: 'none' }} />
                        <AddIcon sx={{ strokeWidth: '2.4', stroke: '#344767', mr: '0.4rem' }} />
                        Add Question
                      </label>
                    </Box>
                  )}
                </Grid>
              </Box>
            )}
            {operation === 'view' ? (
              <Grid
                container
                sx={{
                  my: operation !== 'view' ? '1.4rem' : '1.6rem',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                {!viewDoc || viewDoc === null ? (
                  'No Document'
                ) : (
                  <a className="hover-effect" href={viewDoc.document}>
                    Due Diligence Document{' '}
                  </a>
                )}
              </Grid>
            ) : operation === 'edit' ? (
              <>
                <Grid
                  container
                  sx={{
                    my: '1.6rem',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  {/* <Typography sx={{ color: "#000000", fontSize: "1rem", fontWeight: 600, mr: "1.6rem" }}>Download Document</Typography> */}
                  {/* {viewDoc !== null ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Button>
                        <a href={viewDoc.document}>Download Document</a>
                      </Button>
                      <Tooltip title="Delete Document">
                        <CancelIcon onClick={deleteDocument} />
                      </Tooltip>
                    </Box>
                  ) : (
                    <Typography sx={{ color: '#000000', fontSize: '1rem', fontWeight: 600, mr: '1.6rem' }}>
                      Upload Document
                    </Typography>
                  )} */}
                  {viewDoc === null ? (
                    <>
                      <Typography sx={{ color: '#000000', fontSize: '1rem', fontWeight: 600, mr: '1.6rem' }}>
                        Upload Document
                      </Typography>
                    </>
                  ) : (
                    <></>
                  )}
                  <Grid sx={{ width: '100%' }}>
                    {/* {viewDoc ? (
                      <Button sx={{ padding: "" }}>
                        <a href={viewDoc.document}>Download Document</a>
                      </Button>
                    ) : (
                      <Typography>Update Document</Typography>
                    )} */}
                    {viewDoc && (
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Button
                            sx={{
                              'color': '#344767',
                              '&:hover': {
                                color: '#11ccf0',
                              },
                              'pl': 0,
                            }}
                          >
                            <a className="hover-effect" href={viewDoc.document}>
                              Due Diligence Document{' '}
                            </a>
                          </Button>
                          <Tooltip title="Delete Document">
                            <CancelIcon onClick={deleteDocument} />
                          </Tooltip>
                        </Box>
                      </>
                    )}
                    <label
                      style={{
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: '#999db3',
                        backgroundColor: '#f4f7ff',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.6rem 1rem ',
                        width: '180px',
                        borderRadius: '0.5rem',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                      }}
                    >
                      <input
                        accept="application/pdf"
                        type="file"
                        value={document.fileName}
                        name={formikValue['document']}
                        onChange={(e) => {
                          handleFile(e, 'document')
                          setFieldValue('document', e.currentTarget.files[0])
                        }}
                        style={{ display: !document.fileName === '' ? 'none' : '' }}
                      />
                      {/* <UploadFileIcon sx={{ mr: '0.4rem' }} /> */}
                    </label>
                  </Grid>
                </Grid>
              </>
            ) : (
              <Box
                sx={{
                  my: '1.4rem',
                  display: 'flex',
                  width: 'fit-content',
                  flexDirection: 'column',
                }}
              >
                <Typography sx={{ color: '#000000', fontSize: '1rem', fontWeight: 600 }}>Upload Document</Typography>
                <Box sx={{ cursor: 'pointer !important', mt: '0.2rem' }}>
                  <label
                    style={{
                      border: '1px solid',
                      borderColor: '#999db3',
                      backgroundColor: '#f4f7ff',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.6rem 1rem',
                      width: '180px',

                      borderRadius: '0.5rem',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                    }}
                  >
                    <input
                      accept="application/pdf"
                      type="file"
                      value={document.fileName}
                      name={formikValue['document']}
                      onChange={(e) => {
                        handleFile(e, 'document')
                        setFieldValue('document', e.currentTarget.files[0])
                      }}
                      style={{ display: !document.fileName === '' ? 'none' : '' }}
                    />
                  </label>
                </Box>
              </Box>
            )}
            <Grid
              container
              sx={{
                mb: operation === 'view' ? '0.8rem' : '1.6rem',
              }}
              alignItems="flex-start"
            >
              {uuid && operation === 'view' && viewResponse ? (
                <Grid item xs={1.2}>
                  <Typography
                    sx={{
                      mb: '0.4rem',
                      fontSize: '18px',
                    }}
                    component="h5"
                    variant="h5"
                  >
                    Remarks:
                  </Typography>
                </Grid>
              ) : (
                <Grid item xs={1}>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      mb: '0.4rem',
                      fontSize: '18px',
                      color: '#344767',
                      fontWeight: '500',
                    }}
                  >
                    Remarks
                  </Typography>
                </Grid>
              )}
              {uuid && operation === 'view' && viewResponse ? (
                <Grid item xs={10}>
                  <Typography
                    sx={{
                      fontSize: '18px',
                      mb: '0.4rem',
                    }}
                  >
                    {viewResponse.remarks}
                  </Typography>
                </Grid>
              ) : (
                <Grid item xs={12}>
                  <TextField
                    sx={{
                      '&>div>textarea': {
                        paddingRight: '0px !important',
                        width: '100% !important',
                      },
                    }}
                    multiline
                    minRows="2"
                    placeholder="Remark"
                    name="remark"
                    value={operation === 'view' ? viewResponse.remarks : formikValue['remark']}
                    onChange={handleChange}
                    fullWidth
                    type="text"
                  />
                </Grid>
              )}
            </Grid>
            <Grid container alignItems="flex-start">
              {uuid && operation === 'view' && viewResponse ? (
                <Grid item xs={1.2}>
                  <Typography
                    component="h5"
                    variant="h5"
                    sx={{
                      mb: '0.4rem',
                      fontSize: '18px',
                      color: '#344767',
                    }}
                  >
                    Emails:
                  </Typography>
                </Grid>
              ) : (
                <Grid item xs={2}>
                  <Typography
                    sx={{
                      mb: '0.4rem',
                      fontSize: '18px',
                      color: '#344767',
                      fontWeight: '500',
                    }}
                  >
                    Emails*
                  </Typography>
                </Grid>
              )}
              {uuid && operation === 'view' && viewResponse ? (
                <Grid mb="1rem" item xs={10}>
                  <Typography sx={{ fontSize: '18px' }}>
                    {viewResponse?.contact_email?.map((email, id) => (
                      <React.Fragment key={email?.value}>
                        {viewResponse?.contact_email?.length - 1 > id ? `${email?.label}, ` : `${email?.label}`}{' '}
                      </React.Fragment>
                    ))}
                  </Typography>
                </Grid>
              ) : (
                <Grid mb="1rem" item xs={12}>
                  <CreatableSelect
                    placeholder="Select Emails"
                    value={formikValue['contactEmail']}
                    sx={{
                      borderColor: `${isFieldValid('contactEmail') ? 'red' : 'lightgray'}`,
                    }}
                    onChange={(options) => {
                      handleSetFormikValues('contactEmail', options)
                    }}
                    isMulti
                    options={contactEmailsOptions}
                    required
                  />
                  {isFieldValid('contactEmail') && (
                    <ErrorTemplate
                      message={formikValue['contactEmail'].length === 0 ? `Email is required` : `Please enter a valid email`}
                    />
                  )}
                </Grid>
              )}
            </Grid>
            {operation !== 'view' && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  my: '2rem',
                }}
              >
                <Button
                  disabled={formikValue.contactEmail?.length === 0 ? true : false}
                  sx={{
                    'backgroundColor': '#3c5cd2',
                    'color': '#ffffff',
                    'ml': '2rem',
                    'borderRadius': '0.5rem',
                    'padding': '0.6rem 1.4rem',
                    '&:hover': {
                      backgroundColor: '#3c5cd2',
                      color: '#ffffff',
                    },
                  }}
                >
                  Send MOM
                </Button>
                <Button
                  type="submit"
                  sx={{
                    'backgroundColor': '#2dce89',
                    'color': '#ffffff',
                    'ml': '2rem',
                    'borderRadius': '0.5rem',
                    'padding': '0.6rem 1.4rem',
                    '&:hover': {
                      backgroundColor: '#2dce89',
                      color: '#ffffff',
                    },
                  }}
                >
                  {operation === 'edit' ? 'Update' : 'Save'}
                </Button>
              </Box>
            )}
          </Box>
        </Box>
        {open && operation === 'edit' ? (
          <Dialog
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            disableEscapeKeyDown
            open={open}
            onClose={() => setOpen(false)}
            sx={{ zIndex: 1600 }}
          >
            <DialogTitle textAlign="center" fontWeight="400">
              Save data before changing Interaction type or Company name
            </DialogTitle>

            <DialogActions>
              <Button
                variant="contained"
                color="primary"
                sx={{
                  'backgroundColor': '#3c5cd2',
                  'color': '#ffffff',
                  'ml': '2rem',
                  'display': 'flex',
                  'alignItems': 'center',
                  '&:hover': {
                    backgroundColor: '#3c5cd2',
                    color: '#ffffff',
                  },
                }}
                onClick={() => setOpen(false)}
              >
                Back
              </Button>
            </DialogActions>
          </Dialog>
        ) : (
          ''
        )}
        {deleteQuestionModal && (
          <>
            <Dialog
              disableEscapeKeyDown
              open={deleteQuestionModal}
              onClose={() => setDeleteQuestionModal(false)}
              sx={{ zIndex: 1600 }}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title" fontWeight="400">
                Do you want to delete the response
              </DialogTitle>
              <DialogContent></DialogContent>
              <DialogActions>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    'backgroundColor': '#3c5cd2',
                    'color': '#ffffff',
                    'ml': '2rem',
                    'display': 'flex',
                    'alignItems': 'center',
                    '&:hover': {
                      backgroundColor: '#3c5cd2',
                      color: '#ffffff',
                    },
                  }}
                  onClick={() => setDeleteQuestionModal(false)}
                >
                  No
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    'backgroundColor': '#3c5cd2',
                    'color': '#ffffff',
                    'ml': '2rem',
                    'display': 'flex',
                    'alignItems': 'center',
                    '&:hover': {
                      backgroundColor: '#3c5cd2',
                      color: '#ffffff',
                    },
                  }}
                  onClick={() => {
                    handleDeleteQuestion()
                    setDeleteQuestionModal(false)
                  }}
                >
                  Yes
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
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
    </>
  )
}

export default DiligenceResponse

DiligenceResponse.propTypes = {
  uuid: PropTypes.string,
  operation: PropTypes.string,
  companyAndInteractionData: PropTypes.object,
  setCompanyAndInteractionData: PropTypes.func,
  state: PropTypes.object,
}
