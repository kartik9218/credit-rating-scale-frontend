import React, { useState, useEffect, useCallback, useRef, forwardRef } from 'react'
import CardWrapper from 'slots/Cards/CardWrapper'
import {
  Grid,
  Box,
  Typography,
  Chip,
  TextField,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Menu,
  MenuItem,
  Button,
  ClickAwayListener,
} from '@mui/material'
import { ArgonButton } from 'components/ArgonTheme'
import Select from 'react-select'
import { DownloadOutlined, FileOpenOutlined, TextFields } from '@mui/icons-material'
import PropTypes from 'prop-types'
import { HTTP_CLIENT, APIFY } from 'helpers/Api'
import { GET_ROUTE_NAME, FORMATE_NUMBER, SET_PAGE_TITLE, GET_QUERY } from 'helpers/Base'
import InfomericButton from 'slots/Buttons'
import DataTable from 'react-data-table-component'
import { ArgonSnackbar } from 'components/ArgonTheme'
import { useNavigate } from 'react-router-dom'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { ArgonTypography } from 'components/ArgonTheme'
import logo from 'assets/images/logo.png'
import moment from 'moment'

const docsStyle = {
  position: 'absolute',
  left: '0px',
  bottom: '-40px',
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
}

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})
const modfiyOptions = (list) => {
  list.unshift({ label: 'select...', value: 'select...' })
  return list
}
const ActivityExecutor = (props) => {
  const {
    allowonlyMandateSelection = false,
    allowDownloadDocuments = false,
    allowUserSelection = true,
    userType,
    allowUpload = false,
    onUpload,
    activityTitle,
    activityCode,
    companyUuid,
    ratingUuid,
    allowSelectionColumn: isSelectionColumnVisible = false,
  } = props
  const navigate = useNavigate()
  const columnRef = useRef()
  const fileInputRef = useRef(null)
  const [activitiesData, setActivitiesData] = useState([])
  const [selectedRows, setSelectedRows] = useState([])
  const [openfileSnackBar, setOpenfileSnackbar] = useState(false)
  const [toggleCleared, setToggleCleared] = useState(false)
  const [roleOptions, setRoleOptions] = useState([])
  const [response, setResponse] = useState(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [isConsentGiven, setIsConsentGiven] = useState(false)
  const [docs, setDocs] = useState({})
  const [activitySpecificDocs, setActivitySpecificDocs] = useState({})
  const [anchorEl, setAnchorEl] = useState(null)
  const [options, setOptions] = useState({
    quartelyResultOptions: [],
    annualResultOptions: [],
  })
  const [params, setParams] = useState({
    selectedRole: { label: 'Select...', value: '' },
    selectedQuartelyResult: { label: '', value: '' },
    selectedAnnaulResult: { label: '', value: '' },
    selectedAcceptance: { label: '', value: '' },
    selectedDate: '',
  })
  const acceptanceOption = modfiyOptions([
    { label: 'yes', value: 'yes' },
    { label: 'no', value: 'no' },
  ])
  const { quartelyResultOptions, annualResultOptions } = options
  const { selectedRole, selectedQuartelyResult, selectedAnnaulResult, selectedDate, selectedAcceptance } = params

  useEffect(() => {
    SET_PAGE_TITLE(`${GET_QUERY('activity-code')} - ${activityTitle}`)
    navigateAgainstActivityCode()
    getExecutables()
    getUserRoles()
  }, [])

  useEffect(() => {
    ;['QUARTERLY_RESULTS', 'ANNUAL_RESULTS'].forEach((masterType) => getMastersData(masterType))
  }, [])

  useEffect(() => {
    if (!allowDownloadDocuments) return
    activitiesData.length > 0 && getDownloadedDocuments()
  }, [activitiesData])

  useEffect(() => {
    if (!allowDownloadDocuments) return
    selectedRows.length > 0 && getDownloadedDocuments(selectedRows[0]?.mandate_id)
  }, [selectedRows])

  const handleOpenDownloadMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const navigateAgainstActivityCode = () => {
    let timer
    const url = {
      10450: GET_ROUTE_NAME('SEND_TO_COMMITTEE', { company_uuid: companyUuid, code: activityCode, ratingUuid }),
      10600: GET_ROUTE_NAME('LIST_RATING_VERIFICATION', { company_uuid: companyUuid, code: activityCode, ratingUuid }),
    }
    clearTimeout(timer)
    timer = setTimeout(() => {
      typeof url[activityCode] != 'undefined' && navigate(url[activityCode])
    }, 900)
  }

  const columns = [
    {
      name: 'Company Name',
      selector: (row) => row.company_name,
    },
    {
      name: 'Mandate ID',
      selector: (row) => row.mandate_id,
    },
    {
      name: 'Rating Process',
      cell: (row) => {
        return <>{row.rating_process_name}</>
      },
    },
    {
      name: 'Total Size (Cr)',
      selector: (row) => row.total_size,
      cell: (row) => <>{FORMATE_NUMBER(row.total_size)}</>,
    },
    {
      name: 'From',
      selector: (row) => row.from_user + ' ' + row.from_user_code,
      // cell: row =>
    },
    {
      name: 'TAT(Days)',
      selector: (row) => row.tat,
    },
    activityCode === '11100' && {
      name: 'Committee Assigned Ratings',
      width: '189px',
      cell: (row) => {
        return <Box>IVR BB</Box>
      },
    },
    activityCode === '11100' && {
      name: 'Client Provisional Acceptance Status',
      width: '189px',
      cell: (row) => <>Yes</>,
    },
    activityCode === '11100' && {
      name: 'Client Provisional Acceptance Date',
      width: '189px',
      cell: (row) => <>{moment().format('DD/MM/YY')}</>,
    },
    activityCode === '11100' && {
      name: 'Rating Letter Dispatch Date',
      width: '189px',
      cell: (row) => <>{moment().format('DD/MM/YY')}</>,
    },
    activityCode === '11100' && {
      name: 'PR Release Date',
      width: '189px',
      cell: (row) => <>{moment().format('DD/MM/YY')}</>,
    },
    activityCode === '11100' && {
      name: 'Rating Action',
      width: '189px',
      cell: (row) => <>Assigned</>,
    },
    isSelectionColumnVisible &&
      isSelectionColumnVisible?.quartely && {
        name: 'Quartely Result ',
        cell: (row) => {
          return (
            <Box style={{ width: '189px' }}>
              <select
                className="custom-select"
                style={{ width: '100%' }}
                value={selectedQuartelyResult.label}
                onChange={(option) =>
                  handleSetParams('selectedQuartelyResult', { label: option.target.value, value: option.target.value })
                }
              >
                {quartelyResultOptions.map((item) => {
                  return (
                    <option key={item.value} value={item.label}>
                      {item.label}
                    </option>
                  )
                })}
              </select>
            </Box>
          )
        },
      },
    isSelectionColumnVisible &&
      isSelectionColumnVisible?.annualy && {
        name: 'Annual Result *',
        width: '165px',
        cell: (row) => {
          return (
            <Box sx={{ width: '140px', position: 'absolute' }}>
              <select
                className="custom-select"
                style={{ width: '100%' }}
                value={selectedAnnaulResult.label}
                // options={annualResultOptions}
                onChange={(option) =>
                  handleSetParams('selectedAnnaulResult', { label: option.target.value, value: option.target.value })
                }
              >
                <>
                  {annualResultOptions.map((item) => {
                    return (
                      <option key={item.value} value={item.label}>
                        {item.label}
                      </option>
                    )
                  })}
                </>
              </select>
            </Box>
          )
        },
      },
    isSelectionColumnVisible &&
      isSelectionColumnVisible?.dateSelection && {
        name: isSelectionColumnVisible.acceptance ? 'Acceptance Date *' : 'Annual Date *',
        width: '180px',
        cell: (row) => {
          return (
            <Box sx={{ width: '140px', marginLeft: '10px' }}>
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <DatePicker
                  inputFormat="DD-MM-YYYY"
                  className={'date-picker-width'}
                  name="date_of_incorporation"
                  value={selectedDate}
                  onChange={(newValue) => handleSetParams('selectedDate', newValue)}
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
            </Box>
          )
        },
      },
    isSelectionColumnVisible &&
      isSelectionColumnVisible?.acceptance && {
        name: 'Acceptance *',
        cell: (row) => {
          return (
            <Box sx={{ width: '140px', position: 'absolute', marginLeft: '15px' }}>
              <select
                className="custom-select"
                style={{ width: '100%' }}
                value={selectedAcceptance.label}
                // options={annualResultOptions}
                onChange={(option) =>
                  handleSetParams('selectedAcceptance', { label: option.target.value, value: option.target.value })
                }
              >
                <>
                  {acceptanceOption.map((item) => {
                    return (
                      <option key={item.value} value={item.label}>
                        {item.label}
                      </option>
                    )
                  })}
                </>
              </select>
            </Box>
          )
        },
      },
  ]
  if (!isSelectionColumnVisible) {
    Array(activityCode === '11100' ? 4 : 10)
      .fill('')
      .forEach((_) => columns.pop())
  } else if (isSelectionColumnVisible.acceptance && isSelectionColumnVisible.dateSelection) {
    columns.splice(6, 8)
  }

  const handleClose = () => {
    setOpenfileSnackbar((prev) => !prev)
  }

  const getDownloadedDocuments = async (mandate_id = null) => {
    try {
      const { workflow_doc } = await HTTP_CLIENT(APIFY('/v1/inbox/execution/download_doc'), {
        params: {
          mandate_id: mandate_id ?? activitiesData[0].mandate_id,
        },
      })
      handleSetDocs(workflow_doc[0])
      //  setDocs({uri:workflow_doc.document, name:workflow_doc.file_name});
    } catch (err) {
      console.error(err)
    }
  }
  const handleSetDocs = (workflowdoc) => {
    switch (activityCode) {
      case '11100':
        setDocs([
          { uri: workflowdoc.press_release ?? '', name: 'Press Release' },
          { uri: workflowdoc.provisional_communication ?? '', name: 'Provisional Communication' },
          { uri: workflowdoc.rating_letter ?? '', name: 'Rating Letter' },
          { uri: workflowdoc.rating_note ?? '', name: 'Rating Note' },
          { uri: workflowdoc.rating_sheet ?? '', name: 'Rating Sheet' },
        ])
        break
      case '10300':
      case '10400':
        setDocs({ uri: workflowdoc.rating_note, name: 'Rating Note' })
        break
      case '10900':
      case '10950':
      case '11000':
      case '11050':
        setDocs({ uri: workflowdoc.press_release, name: 'Press Release' })
        break
      case '10800':
        setDocs({ uri: workflowdoc.rating_letter, name: 'Rating Letter' })
        break
      case '10650':
        setDocs({ uri: workflowdoc.provisional_communication, name: 'Provisional Communication' })
        break
      default:
        setDocs({ uri: '', name: '' })
    }
  }
  const getMastersData = (masterType) => {
    const assignMaster = (master) => Object.assign({}, { label: master?.name, value: master?.uuid })
    HTTP_CLIENT(APIFY('/v1/master'), {
      group: masterType,
      is_active: true,
    })
      .then((success) => {
        const { masters } = success
        masterType === 'QUARTERLY_RESULTS'
          ? handleSetOptions('quartelyResultOptions', [...masters.map(assignMaster)])
          : handleSetOptions('annualResultOptions', [...masters.map(assignMaster)])
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const getUserRoles = () => {
    const getUserType = userType === 'Rating Head / Quality Control' ? 'Rating Head' : userType
    HTTP_CLIENT(APIFY('/v1/roles/view_users'), {
      role: getUserType,
    }).then((success) => {
      const {
        role: { users },
      } = success
      setRoleOptions((previous) => {
        return users?.map((role) =>
          Object.assign(
            {},
            {
              label: `${role.full_name + ' ' + `(${role.employee_code})`}`,
              value: role.uuid,
            },
          ),
        )
      })
    })
  }

  const checkForNull = (userName) => {
    if (userName.split(' ')[0] === 'null') return 'Select...'
    else return userName
  }
  const getExecutables = () => {
    HTTP_CLIENT(APIFY('/v1/inbox/view_executables'), {
      params: {
        company_uuid: companyUuid,
        code: activityCode,
        rating_process_uuid: ratingUuid,
      },
    })
      .then((success) => {
        const { companies, last_activity_record } = success
        const copied = JSON.parse(JSON.stringify(companies));
        setActivitiesData(() => {
          if(activityCode === "11100") {
            const r = copied.map(company => {
              Object.assign(company, {instrument_detail:[]});
              last_activity_record.forEach((exp) => {
                if(company.mandate_id === exp.mandate_id) {
                 company.instrument_detail.push(exp);
                }
              })
              return company;
            }) 
            return r;
          } else return [...companies];
        })
        if (activityCode === '10300' || activityCode === '10350') return
        userType === 'Group Head'
          ? handleSetParams('selectedRole', {
              label: checkForNull(companies[0]?.gh_name + ' ' + companies[0]?.gh_employee_code),
              value: companies[0]?.gh_uuid ?? '',
            })
          : handleSetParams('selectedRole', {
              label: checkForNull(companies[0]?.ra_name + ' ' + companies[0]?.ra_employee_code),
              value: companies[0]?.ra_uuid ?? '',
            })
      })
      .catch((err) => {
        console.error(err)
      })
  }

  const handleRowSelected = useCallback((state) => {
    setSelectedRows(state.selectedRows)
  }, [])

  const handleSetSelectedRole = (value) => {
    handleSetParams('selectedRole', value)
  }

  const handleSetParams = (key, value) => {
    setParams((previous) => {
      return {
        ...previous,
        [key]: value.value === 'select...' ? { ...value, value: '' } : value,
      }
    })
  }

  const handleSetOptions = (key, value) => {
    setOptions((previous) => {
      return {
        ...previous,
        [key]: modfiyOptions(value),
      }
    })
  }

  const getFormData = () => {
    const getFileName = () => {
      switch (activityCode) {
        case '10650':
          return 'provisional_communication'
        case '10750':
        case '10800':
          return 'rating_letter'
        case '10300':
        case '10250':
        case '10400':
          return 'rating_note'
        case '10900':
        case '10950':
        case '11000':
        case '11050':
        case '10850':
        case '10950':
        case '10900':
        case '11000':
        case '11050':
          return 'press_release'
        default:
          return ''
      }
    }
    const formData = new FormData()
    formData.append(getFileName(), isActivitySpeceific() ? activitySpecificDocs : docs)
    formData.append('user_uuid', selectedRole.value || null)
    formData.append('code', activityCode)
    formData.append('rating_process_uuid', ratingUuid)
    selectedRows.forEach((row) => formData.append('mandate_id[]', row.mandate_id))
    return formData
  }

  const isButtonDisable = () => {
    switch (activityCode) {
      case '10300':
      case '10750':
      case '10650':
      case '10850':
        return selectedRows.length > 0 && selectedRole.value !== '' && docs.name ? false : true
      case '10400':
      case '10800':
      case '11050':
        return selectedRows.length > 0 && selectedRole.value !== '' && docs.name ? false : true
      case '10200':
        return selectedRows.length > 0 && selectedDate && selectedAnnaulResult.value && isConsentGiven ? false : true
      case '10250':
        return selectedRows.length > 0 && isConsentGiven && docs.name ? false : true
      case '10450':
      case '11000':
        return selectedRows.length > 0 && selectedDate && selectedAcceptance.value && isConsentGiven && docs.name
          ? false
          : true
      case '10700':
        return selectedRows.length > 0 &&
          selectedRole.value !== '' &&
          docs.name &&
          selectedDate &&
          selectedAcceptance.value &&
          isConsentGiven
          ? false
          : true
      case '10950':
        return selectedRows.length > 0 && docs.name ? false : true
      default:
        return selectedRows.length > 0 && selectedRole.value !== '' ? false : true
    }
  }

  const getConsentLabel = () => {
    switch (activityCode) {
      case '10100':
      case '10150':
        return `I hereby assign mandate to ${userType}`
      case '10200':
        return `I hereby accept and confirm the ${activityTitle}`
      case '10250':
        return 'I hereby accept to forward the Rating Note and Rating Model Result Sheet to Group Head'
      case '10300':
        return `I hereby accept to ${activityTitle}`
      case '10350':
        return 'I hereby tranfer the Rating Note to another QCT for review'
      case '10400':
        return 'I hereby confirm that I have reviewed the Rating Note'
      case '10600':
        return 'I hereby verify the Committee Rating Voting'
      case '10650':
        return 'I hereby confirm the Provisional Communication with client'
      case '10700':
        return `I hereby ${activityTitle}`
      case '10750':
        return `I hereby forward the Rating Letter to Group Head for review`
      case '10800':
        return 'I hereby accept that I have reviewed the Rating Letter and confirm the same to Rating Analyst and I instruct him/her to dispatch the Rating Letter to the client'
      case '10850':
        return 'I hereby forward the Press Release to Group Head'
      case '10900':
        return 'I hereby confirm that I have reviewed the Press Release and confirm it to Rating Analyst'
      case '10950':
        return 'I hereby send the Press Release to client for acceptance'
      case '11000':
        return 'I hereby approve the Press Release for client'
      case '11100':
        return 'I hereby mark the case as completed'
      default:
        return `I hereby ${activityTitle}`
    }
  }

  const checkUploadExecution = () => {
    isActivitySpeceific() ? (activitySpecificDocs.name ? true : false) : docs.name ? true : false
  }
  const handleUploadDocs = () => {
    HTTP_CLIENT(APIFY('/v1/inbox/execution/upload_doc'), getFormData(), true)
      .then((success) => {
        console.log(success, 'success')
      })
      .catch((err) => handleShowSnackBar('error')('Document upload failed'))
  }

  const handleExecuteTask = (executeImmediately = false) => {
    HTTP_CLIENT(APIFY('/v1/inbox/execution/assign_to_user'), processApiData())
      .then((response) => {
        if (response.success) {
          handleShowSnackBar('success')('Activity executed successfully')
          if (allowUpload) {
            checkUploadExecution() && handleUploadDocs()
          }
          setTimeout(() => {
            navigate('/dashboard/inbox')
          }, 1000)
        }
      })
      .catch((error) => {
        console.error(error)
        handleShowSnackBar('error')('something went wrong')
      })
  }

  const handleShowSnackBar = (messageType) => (message) => {
    setSnackbarOpen(true)
    setResponse(messageType)
    setSnackbarMessage(message)
  }

  const processApiData = () => {
    return {
      params: {
        mandate_id: selectedRows.map((row) => row.mandate_id),
        user_uuid: selectedRole.value || null,
        code: activityCode,
        quarterly_result: selectedQuartelyResult.label || null,
        annual_result: selectedAnnaulResult.label || null,
        annual_result_date: selectedDate ? moment(selectedDate).format('YYYY/MM/DD') : null,
        acceptance_date: selectedDate ? moment(selectedDate).format('YYYY/MM/DD') : null,
        acceptance_status: selectedAcceptance.label === 'yes' ? true : false,
        rating_process_uuid: ratingUuid,
      },
    }
  }

  const handleFileEvent = () => {
    fileInputRef.current.click()
  }

  const fileIsNotValid = (mimetype) => (size) => {
    if (mimetype != 'application/pdf') {
      handleShowSnackBar('error')('Please select only PDF files.')
      return true
    }
  }

  const handleFileUpload = (e) => {
    const mimetype = e.target.files[0].type
    const size = e.target.files[0].size
    const doc = e.target.files[0]
    if (fileIsNotValid(mimetype)(size)) return
    if (isActivitySpeceific()) {
      setActivitySpecificDocs(doc)
      setOpenfileSnackbar(true)
      return
    }
    setDocs(doc)
    setOpenfileSnackbar(true)
  }

  const handleRemoveDoc = (isActivitySpeceific = false) => {
    if (isActivitySpeceific) {
      setActivitySpecificDocs({})
      return
    }
    setDocs({})
  }

  const handleDownloadDocs = (docName = '', uri = null, isActivitySpeceific = false) => {
     const showSnackbarError = () => {
        handleShowSnackBar('error')(`${docName ? docName : docs.name} file not found`)
        setAnchorEl(null)
        return;
     }
    uri === '' && showSnackbarError();
    const link = document.createElement('a')
    const url = uri ??
    (isActivitySpeceific
      ? URL.createObjectURL(activitySpecificDocs)
      : docs instanceof File
      ? URL.createObjectURL(docs)
      : docs.uri);
    url === null && showSnackbarError();
    link.href = url;
    link.download = isActivitySpeceific ? activitySpecificDocs.name : docs.name
    link.dispatchEvent(new MouseEvent('click'))
    if (Boolean(uri)) setAnchorEl(null)
  }

  const defaultSelectAllRows = useCallback((rows) => rows && true, [])

  const allowDelete = () => {
    return (
      activityCode !== '10900' &&
      activityCode !== '10950' &&
      activityCode !== '11000' &&
      activityCode !== '11050' && {
        onDelete: () => handleRemoveDoc(),
      }
    )
  }

  const isActivitySpeceific = () => {
    if (activityCode === '10900' || activityCode === '10950' || activityCode === '11000' || activityCode === '11050') {
      return true
    }
    return false
  }

  const isConsentVisible = () => {
    if (
      activityCode === '10150' ||
      activityCode === '10100' ||
      activityCode === '10300' ||
      activityCode === '10350' ||
      activityCode === '10650' ||
      activityCode === '10750' ||
      activityCode === '10850' ||
      activityCode === '10950' ||
      activityCode === '11050' ||
      activityCode === '11100'
    ) {
      return false
    }
    return true
  }

  const Expandables = (data) => {

    return (
      <p>dsf</p>
    )
  }

  return (
    <CardWrapper
      headerTitle={`#${activityCode} - ${activityTitle}`}
      headerSubtitle={`Execution`}
      headerActionButton={() => {
        return (
          <Box>
            {
              <Box sx={{ display: 'flex', gap: '5px', position: 'relative', alignItems: 'center', flexDirection: 'column' }}>
                <Box>
                  {allowUpload && (
                    <ArgonButton color={'primary'} onClick={handleFileEvent}>
                      <FileOpenOutlined />
                      <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleFileUpload} />
                      <Box margin={'4px'} />
                      Upload Document
                    </ArgonButton>
                  )}
                  <Box display="flex" gap="8px" position="relative">
                    {allowDownloadDocuments && Array.isArray(docs) ? (
                      <>
                        <InfomericButton color="primary" icon={<DownloadOutlined />} onClick={handleOpenDownloadMenu}>
                          Download
                        </InfomericButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl)}
                          onClose={() => setAnchorEl(null)}
                          sx={{
                            '.MuiPaper-root': {
                              top: '173px !important',
                              left: '1290px !important',
                            },
                          }}
                          anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                          }}
                          transformOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                          }}
                        >
                          {docs?.map((doc, idx) => {
                            return (
                              <MenuItem key={idx} onClick={() => handleDownloadDocs(doc.name, doc.uri)}>
                                <DownloadOutlined />
                                <Box margin="6px" />
                                {doc.name}
                              </MenuItem>
                            )
                          })}
                        </Menu>
                      </>
                    ) : (
                      docs.name && (
                        <Box display="flex" width={'180px'} flexDirection={'column'}>
                          <Chip
                            label={
                              <Box display="flex" gap="3px" overflow="hidden" textOverflow={'ellipsis'}>
                                <DownloadOutlined /> {docs.name}
                              </Box>
                            }
                            variant="outlined"
                            sx={docsStyle}
                            onClick={() => handleDownloadDocs('', null)}
                            {...allowDelete()}
                            // onDelete={handleRemoveDoc}
                          />
                          {isActivitySpeceific() && activitySpecificDocs.name && (
                            <Chip
                              label={
                                <Box display="flex" gap="3px" overflow="hidden" textOverflow={'ellipsis'}>
                                  <DownloadOutlined /> {activitySpecificDocs.name}
                                </Box>
                              }
                              variant="outlined"
                              sx={{ ...docsStyle, bottom: '-80px' }}
                              onClick={() => handleDownloadDocs('', null, isActivitySpeceific())}
                              onDelete={() => handleRemoveDoc(isActivitySpeceific())}
                            />
                          )}
                        </Box>
                      )
                    )}
                  </Box>
                </Box>
              </Box>
            }
          </Box>
        )
      }}
      footerActionButton={() => {
        return (
          <Box display={'flex'} justifyContent={'space-between'} padding="1rem">
            {isConsentVisible() ? (
              <Box display="flex" flexDirection={'column'} alignItems={''} gap={'20px'} marginLeft="40px">
                <FormControlLabel
                  control={<Checkbox checked={isConsentGiven} onChange={(e) => setIsConsentGiven(e.target.checked)} />}
                  label={<Box sx={{ maxWidth: '40em', lineHeight: '15px' }}>{getConsentLabel()}</Box>}
                />
              </Box>
            ) : (
              <Box />
            )}
            {activityCode !== "11100" && <Box>
              <InfomericButton onClick={handleExecuteTask} disable={isButtonDisable()} color={'success'}>
                Execute
              </InfomericButton>
            </Box>}
          </Box>
        )
      }}
    >
      <Grid container padding={'.8rem'} spacing={3}>
        {
          <>
            <Grid item xs={12} sx={{ display: 'flex', gap: '20px', marginTop: '-10px' }}>
              {allowUserSelection && (
                <Box sx={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <Typography fontSize="16px" fontWeight={500}>
                    Role :
                  </Typography>
                  <Box sx={{ width: 'auto' }}>
                    <Typography fontSize="16px">
                      <Chip variant={'outlined'} size={'small'} label={userType} color="primary" />
                    </Typography>
                  </Box>
                </Box>
              )}

              {allowUserSelection && (
                <Box sx={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <Typography fontSize="16px" fontWeight={500}>
                    Select {userType}
                  </Typography>
                  <Box sx={{ width: '400px' }}>
                    <Select value={selectedRole} options={roleOptions} onChange={(value) => handleSetSelectedRole(value)} />
                  </Box>
                </Box>
              )}
            </Grid>
          </>
        }
        <Grid item xs={12} sx={{ marginTop: '15px' }}>
          {activityCode === '10450' || activityCode === '10600' ? (
            <>
              <Box sx={{ display: 'grid', placeItems: 'center', marginTop: '10px' }}>
                <Box textAlign={'center'}>
                  <img
                    src={logo}
                    style={{
                      height: '80px',
                    }}
                    alt={'app-logo'}
                  />
                </Box>
                <ArgonTypography
                  fontSize={'24px'}
                  textAlign={'center'}
                  sx={{
                    color: '#a7a7a7',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {activityCode === '10450'
                    ? 'Navigating to Send to Committee screen'
                    : 'Navigating to Rating Verification Screen'}
                  <Box marginRight={'15px'} />
                  <CircularProgress size={28} />
                </ArgonTypography>
              </Box>
            </>
          ) : (
            <Box
              sx={{
                height: 'calc(100vh - 52vh)',
                width: '100%',
                overflow: 'hidden',
                overflowY: 'scroll',
              }}
            >
              {activityCode === "11100" ? 
               <DataTable
               expandableRows
               expandableRowsComponent={Expandables}
               columns={columns.filter(Boolean)}
               data={activitiesData}
               />
              :<DataTable
                selectableRows
                columns={columns.filter(Boolean)}
                data={activitiesData}
                selectableRowSelected={defaultSelectAllRows}
                onSelectedRowsChange={handleRowSelected}
                clearSelectedRows={toggleCleared}
              />}
            </Box>
          )}
        </Grid>
      </Grid>
      <ArgonSnackbar
        color={response}
        icon={response ? response : 'error'}
        title={response === 'success' ? 'Success' : response === 'error' ? 'Error' : ''}
        content={snackbarMessage}
        translate="yes"
        dateTime=""
        open={snackbarOpen}
        close={() => setSnackbarOpen(false)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      />
      <Snackbar open={openfileSnackBar} onClose={handleClose} autoHideDuration={2000}>
        <Alert onClose={handleClose} severity={'success'} sx={{ width: '100%' }}>
          <span
            style={{
              fontSize: '12px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >{`${docs.name} file uploaded successfully`}</span>
        </Alert>
      </Snackbar>
    </CardWrapper>
  )
}

export default ActivityExecutor

ActivityExecutor.propTypes = {
  allowUserSelection: PropTypes.bool,
  allowDownloadDocuments: PropTypes.bool,
  userType: PropTypes.string,
  allowUpload: PropTypes.bool,
  onUpload: PropTypes.func,
  activityTitle: PropTypes.string,
  activityCode: PropTypes.string,
  companyUuid: PropTypes.string,
  ratingUuid: PropTypes.string,
  allowonlyMandateSelection: PropTypes.bool,
  allowSelectionColumn: PropTypes.bool,
}
