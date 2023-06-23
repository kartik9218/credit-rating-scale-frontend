import React, { useState, useEffect } from 'react'
import { DashboardLayout } from 'layouts'
import { ArgonBox } from 'components/ArgonTheme'
import Typography from '@mui/material/Typography'
import CardWrapper from 'slots/Cards/CardWrapper'
import Select from 'react-select'
import {
  Backdrop,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Input,
  Modal,
  Switch,
  Tooltip,
} from '@mui/material'
import ArgonBadge from 'components/ArgonBadge'
import DataTable from 'slots/Tables/DataTable'
import { CloseOutlined, EditOutlined, AddBox } from '@mui/icons-material'
import { ArgonButton } from 'components/ArgonTheme'
import { HTTP_CLIENT } from 'helpers/Api'
import { APIFY } from 'helpers/Api'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import ErrorTemplate from 'slots/Custom/ErrorTemplate'
import { ArgonSnackbar } from 'components/ArgonTheme'

const WorkflowMaintenance = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [ratingProcessOptions, setRatingProcessOptions] = useState([])
  const [response, setResponse] = useState(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('Please check all required fields')
  const [activities, setActivites] = useState([])
  const [selectedRatingProcess, setSelectedRatingProcess] = useState({ label: 'Select Rating Process...', value: '' })
  const [rolesOptions, setRolesOptions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [uuid, setUuid] = useState('')
  const [rows, setRows] = useState([])
  const formik = useFormik({
    initialValues: {
      ratingProcess: { label: 'Select...', value: '' },
      currentActivity: { label: 'Select...', value: '' },
      serailNo: '',
      assignerRole: { label: 'Select...', value: '' },
      isActive: true,
      performerRole: { label: 'Select...', value: '' },
      nextActivity: { label: 'Select...', value: '' },
      tat: '',
      isLastActivity: false,
    },
    validationSchema: Yup.object().shape({
      ratingProcess: Yup.object().shape({
        label: Yup.string().required(''),
        value: Yup.string().required('Rating Process is required'),
      }),
      currentActivity: Yup.object().shape({
        label: Yup.string().required(''),
        value: Yup.string().required('Current Activity is required'),
      }),
      serailNo: Yup.number().required('Serail No is required'),
      assignerRole: Yup.object().shape({
        label: Yup.string().required(''),
        value: Yup.string().required('Assigner Role is required'),
      }),
      isActive: Yup.boolean(),
      performerRole: Yup.object().shape({
        label: Yup.string(),
        value: Yup.string(),
      }),
      nextActivity: Yup.object().shape({
        label: Yup.string(),
        value: Yup.string(),
      }),
      tat: Yup.number(),
      isLastActivity: Yup.boolean(),
    }),
    onSubmit: (values) => handlePerformAjaxRqst(values),
  })

  const { errors, touched, setFieldValue, handleSubmit, handleChange, handleReset, values: formikValue } = formik

  useEffect(() => {
    getRatingProcessOptions()
    getAllActivities()
    getAllRoles()
  }, [])

  useEffect(() => {
    selectedRatingProcess.value && getWorkflowConfigListing()
  }, [selectedRatingProcess.value])

  const handleModalState = () => {
    setIsModalOpen((prev) => !prev)
    handleReset()
  }

  const Columns = [
    {
      accessor: 'rating_process_name',
      Header: 'Rating Process',
    },
    {
      accessor: 'current_activity_code',
      Header: 'Activity Code - Label',
      Cell: (row) => {
        return (
          <Tooltip title={`${row.cell.value + ' - ' + row.cell.row.original.current_activity_name}`}>
            <Chip
              sx={{ width: '270px' }}
              variant={'outlined'}
              size={'small'}
              label={`${row.cell.value + ' - ' + row.cell.row.original.current_activity_name}`}
              color="primary"
            />
          </Tooltip>
        )
      },
    },
    {
      accessor: 'serial_number',
      Header: 'Serial Number',
    },
    {
      accessor: 'assigner_role_name',
      Header: 'Assigner Role',
    },
    {
      accessor: 'is_active',
      Header: 'Status',
      Cell: (row) => (
        <ArgonBadge badgeContent={row.cell.value ? 'Active' : 'InActive'} color={row.cell.value ? 'success' : 'error'} />
      ),
    },
    {
      accessor: 'performer_role_name',
      Header: 'Assignee Role',
    },
    {
      accessor: 'next_activity_code',
      Header: 'Next Activity Code - Label',
      Cell: (row) => {
        return (
          <Tooltip title={`${row.cell.value + ' - ' + row.cell.row.original.next_activity_name}`}>
            <Chip
              sx={{ width: '270px' }}
              variant={'outlined'}
              size={'small'}
              label={`${row.cell.value + ' - ' + row.cell.row.original.next_activity_name}`}
              color="primary"
            />
          </Tooltip>
        )
      },
    },
    {
      accessor: 'tat',
      Header: 'TAT(in Days)',
    },
    {
      accessor: 'is_last_activity',
      Header: 'Is Last Activity',
      Cell: (row) => <>{row.cell.value ? 'Yes' : 'No'}</>,
    },
    {
      accessor: 'uuid',
      Header: 'Action',
      Cell: (row) => {
        return (
          <Box>
            <IconButton color={'primary'}>
              <EditOutlined onClick={() => handleEditWorkflowConfig(row.cell.row.original)} />
            </IconButton>
          </Box>
        )
      },
    },
  ]

  const handleEditWorkflowConfig = (data) => {
    setIsModalOpen(true)
    setUuid(data.uuid)
    setFieldValue('ratingProcess', { label: data['rating_process_name'], value: data['rating_process_uuid'] })
    setFieldValue('currentActivity', { label: data['current_activity_code'], value: data['current_activity_uuid'] })
    setFieldValue('serailNo', +data['serial_number'])
    setFieldValue('assignerRole', { label: data['assigner_role_name'], value: data['assigner_role_uuid'] })
    setFieldValue('isActive', data['is_active'])
    setFieldValue('performerRole', { label: data['performer_role_name'], value: data['performer_role_uuid'] })
    setFieldValue('nextActivity', { label: data['next_activity_code'], value: data['next_activity_uuid'] })
    setFieldValue('tat', data['tat'])
    setFieldValue('isLastActivity', data['is_last_activity'])
  }

  const getAllActivities = () => {
    HTTP_CLIENT(APIFY('/v1/activity'), { params: {} }).then((success) => {
      const { activities } = success
      setActivites(() => {
        return activities.map((activity) =>
          Object.assign({}, { label: activity?.code + ' - ' + activity?.name, value: activity?.uuid }),
        )
      })
    })
  }

  const getRatingProcessOptions = () => {
    HTTP_CLIENT(APIFY('/v1/rating_process'), { params: {} })
      .then((success) => {
        const { rating_processes } = success
        setRatingProcessOptions(() => {
          return rating_processes.map((process) =>
            Object.assign({}, { label: process?.name, value: process?.id, uuid: process?.uuid }),
          )
        })
      })
      .catch((err) => console.error(err))
  }

  const getWorkflowConfigListing = () => {
    setIsLoading(true)
    HTTP_CLIENT(APIFY('/v1/workflow_config'), {
      params: {
        rating_process_uuid: selectedRatingProcess.uuid,
      },
    })
      .then((success) => {
        const { activities } = success
        setRows(() => [...activities])
        setIsLoading(false)
      })
      .catch((err) => console.error(err))
  }

  const getAllRoles = () => {
    HTTP_CLIENT(APIFY('/v1/roles'), {
      params: {
        is_Active: true,
      },
    })
      .then((success) => {
        const { roles } = success
        setRolesOptions(() => {
          return roles.map((role) =>
            Object.assign(
              {},
              {
                label: role.name,
                value: role.uuid,
              },
            ),
          )
        })
      })
      .catch((err) => console.error(err))
  }

  const handleSetFormikValues = (key, value) => {
    setFieldValue(key, value)
  }

  const handleShowSnackBar = (messageType) => (message) => {
    setSnackbarOpen(true)
    setResponse(messageType)
    setSnackbarMessage(message)
  }

  const handlePerformAjaxRqst = (data) => {
    if (uuid) {
      HTTP_CLIENT(APIFY('/v1/workflow_config/edit'), { params: processApiData(data) })
        .then((success) => {
          handleModalState()
          handleShowSnackBar('success')(`Workflow Config updated successfully`)
          getWorkflowConfigListing()
          setUuid('')
        })
        .catch((err) => {
          console.error(err)
          handleShowSnackBar('error')(`Workflow Config Updation failed`)
        })
      return
    }
    HTTP_CLIENT(APIFY('/v1/workflow_config/create'), { params: processApiData(data) })
      .then((success) => {
        handleModalState()
        handleShowSnackBar('success')(`Workflow Config created successfully`)
        getWorkflowConfigListing()
      })
      .catch((err) => {
        console.error(err)
        handleShowSnackBar('error')(`Workflow Config creation failed`)
      })
  }

  const processApiData = (data) => {
    const processedData = {
      current_activity_uuid: data['currentActivity'].value || null,
      serial_number: `${data['serailNo']}`,
      assigner_role_uuid: data['assignerRole'].value || null,
      is_active: data['isActive'],
      performer_role_uuid: data['performerRole'].value || null,
      next_activity_uuid: data['nextActivity'].value || null,
      tat: data['tat'] || null,
      is_last_activity: data['isLastActivity'],
    }
    if (uuid) {
      return Object.assign(processedData, { uuid, rating_process_uuid: data['ratingProcess'].value })
    }
    return Object.assign(processedData, {
      rating_process_uuid: ratingProcessOptions.find(({ value }) => value === data['ratingProcess'].value).uuid || null,
    })
  }

  const isFieldNotValid = (field) => errors[field] && touched[field]

  const modifyTableData = (data) => {
    return data.map((val) => {
      delete val.rating_process_uuid
      delete val.next_activity_uuid
      delete val.assigner_role_id
      delete val.assigner_role_uuid
      delete val.current_activity_id
      delete val.current_activity_uuid
      delete val.performer_role_id
      delete val.performer_role_uuid
      delete val.rating_process_id
      delete val.rating_process_uuid
      delete val.serial_number
      delete val.uuid
      delete val.workflow_config_id
      delete val.updated_at
      delete val.created_at
      return val
    })
  }
  const REMOVE_CAMEL_CASE = (str) => {
    const arr = str.split(' ')
    for (let i = 0; i < arr.length; i++) {
      arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1)
    }
    return arr.join(' ')
  }

  const DOWNLOAD_CSV = (data) => {
    const blob = new Blob([data], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('href', url)
    a.setAttribute('download', 'download.csv')
    a.click()
  }

  const CSV_MAKER = function (data) {
    const filteredData = modifyTableData(data)
    const CONVERT_TO_CAMEL_CASE = (str) => {
      const arr = str.split(' ')
      for (let i = 0; i < arr.length; i++) {
        arr[i] = arr[i].charAt(0).toLowerCase() + arr[i].slice(1)
      }
      return arr.join('_')
    }
    const csvRows = []
    const headers = Object.keys(filteredData[0])
      .map((words) => words.split('_').join(' '))
      .map((str) => REMOVE_CAMEL_CASE(str))
    csvRows.push(headers.join(','))
    for (const row of filteredData) {
      const values = headers.map((header) => {
        let val = row[CONVERT_TO_CAMEL_CASE(header)]
        return `"${val}"`
      })
      csvRows.push(values.join(','))
    }
    return csvRows.join('\n')
  }

  const handleDownloadCSV = () => {
    if (!rows.length > 0) return
    DOWNLOAD_CSV(CSV_MAKER(rows))
  }

  return (
    <DashboardLayout>
      <CardWrapper
        headerTitle="Workflow Maintenance"
        headerSubtitle="Workflow Management"
        headerActionButton={() => {
          return (
            <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Button
                variant="contained"
                sx={{
                  'background': '#5e72e3',
                  'color': 'white !important',
                  ':hover': {
                    background: '#697ef0',
                  },
                }}
                startIcon={<AddBox />}
                onClick={handleModalState}
              >
                Add Workflow Configuration
              </Button>
              <ArgonButton color={'primary'} onClick={handleDownloadCSV} isDisabled={!rows.length}>
                Export as CSV
              </ArgonButton>
            </Box>
          )
        }}
      >
        <Box sx={{ display: 'flex', gap: '20px', alignItems: 'center', paddingX: '15px' }}>
          <Typography fontSize="16px" fontWeight={500}>
            Select Rating Process :
          </Typography>
          <Box sx={{ width: '300px' }}>
            <Select
              placeholder="Select Rating Process..."
              options={ratingProcessOptions}
              onChange={(value) => setSelectedRatingProcess(value)}
              value={selectedRatingProcess}
            />
          </Box>
        </Box>
        <ArgonBox
          sx={{
            background: 'white !important',
            height: 'calc(100vh - 40vh)',
            borderRadius: '20px',
            padding: '10px',
            marginTop: '-15px',
          }}
        >
          <ArgonBox padding="10px">
            <DataTable
              table={{
                columns: Columns,
                rows: rows,
              }}
              isPaginationVisible={false}
              canSearch={true}
              entriesPerPage={{ entries: rows.length, defaultValue: rows.length }}
            />
          </ArgonBox>
        </ArgonBox>
      </CardWrapper>
      <Modal open={isModalOpen} onClose={handleModalState} className="modal-wrapper">
        <form onSubmit={handleSubmit}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 600,
              height: 700,
              border: 'none !important',
              outline: 'none !important',
              bgcolor: 'background.paper',
              borderRadius: '10px',
              boxShadow: 24,
              p: 1,
            }}
          >
            <Grid container spacing={2} padding={'.8rem'}>
              <Grid item xs={12}>
                <Box display={'flex'} justifyContent="space-between" borderBottom="1px solid lightgray">
                  <Typography fontSize={'26px'} fontWeight={'600'}>
                    Workflow Configuration
                  </Typography>
                  <IconButton size={'large'} onClick={handleModalState}>
                    <CloseOutlined />
                  </IconButton>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box display={'flex'} alignItems={'center'}>
                  <Typography sx={{ flex: '2' }} fontSize={'14px'}>
                    Rating Process *
                  </Typography>
                  <Box sx={{ flex: '4.2' }} position={'relative'}>
                    <Select
                      options={ratingProcessOptions}
                      onChange={(value) => handleSetFormikValues('ratingProcess', value)}
                      value={formikValue['ratingProcess']}
                      styles={{
                        control: (baseStyle) => {
                          return {
                            ...baseStyle,
                            borderRadius: '7px',
                            borderColor: `${isFieldNotValid('ratingProcess') ? 'red' : 'lightgray'}`,
                            color: 'lightgray !important',
                          }
                        },
                      }}
                    />
                    {isFieldNotValid('ratingProcess') && <ErrorTemplate message={errors['ratingProcess'].value} />}
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box display={'flex'} alignItems={'center'}>
                  <Typography sx={{ flex: '2' }} fontSize={'14px'}>
                    Current Activity *
                  </Typography>
                  <Box sx={{ flex: '4.2' }}>
                    <Select
                      options={activities}
                      onChange={(value) => handleSetFormikValues('currentActivity', value)}
                      value={formikValue['currentActivity']}
                      styles={{
                        control: (baseStyle) => {
                          return {
                            ...baseStyle,
                            borderRadius: '7px',
                            borderColor: `${isFieldNotValid('currentActivity') ? 'red' : 'lightgray'}`,
                            color: 'lightgray',
                          }
                        },
                      }}
                    />
                    {isFieldNotValid('currentActivity') && <ErrorTemplate message={errors['currentActivity'].value} />}
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box display={'flex'} alignItems={'center'}>
                  <Typography sx={{ flex: '2' }} fontSize={'14px'}>
                    Serial Number *
                  </Typography>
                  <Box sx={{ flex: '4.2' }}>
                    <Input
                      disableUnderline={true}
                      sx={{
                        'borderColor': `${isFieldNotValid('assignerRole') ? 'red' : 'lightgray'}`,
                        '.MuiInputBase-input': { width: '100% !important' },
                      }}
                      type="number"
                      name="serailNo"
                      value={formikValue['serailNo']}
                      onChange={handleChange}
                      placeholder="Serial No."
                    />
                    {isFieldNotValid('serailNo') && <ErrorTemplate message={errors['serailNo']} />}
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box display={'flex'} alignItems={'center'}>
                  <Typography sx={{ flex: '2' }} fontSize={'14px'}>
                    Assigner Role *
                  </Typography>
                  <Box sx={{ flex: '4.2' }}>
                    <Select
                      name={'assignerRole'}
                      options={rolesOptions}
                      value={formikValue['assignerRole']}
                      onChange={(value) => handleSetFormikValues('assignerRole', value)}
                      styles={{
                        control: (baseStyle) => {
                          return {
                            ...baseStyle,
                            borderRadius: '7px',
                            borderColor: `${isFieldNotValid('assignerRole') ? 'red' : 'lightgray'}`,
                            color: 'lightgray',
                          }
                        },
                      }}
                    />
                    {isFieldNotValid('assignerRole') && <ErrorTemplate message={errors['assignerRole'].value} />}
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box display={'flex'} alignItems={'center'}>
                  <Typography sx={{ flex: '2' }} fontSize={'14px'}>
                    Is Active
                  </Typography>
                  <Box sx={{ flex: '4', display: 'flex', justifyContent: 'start' }}>
                    <Switch name="isActive" checked={formikValue['isActive']} onChange={handleChange} />
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box display={'flex'} alignItems={'center'}>
                  <Typography sx={{ flex: '2' }} fontSize={'14px'}>
                    Performer Role
                  </Typography>
                  <Box sx={{ flex: '4.2' }}>
                    <Select
                      options={rolesOptions}
                      value={formikValue['performerRole']}
                      onChange={(value) => handleSetFormikValues('performerRole', value)}
                      styles={{
                        control: (baseStyle) => {
                          return {
                            ...baseStyle,
                            borderRadius: '7px',
                            borderColor: 'lightgray',
                            color: 'lightgray',
                          }
                        },
                      }}
                    />
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box display={'flex'} alignItems={'center'}>
                  <Typography sx={{ flex: '2' }} fontSize={'14px'}>
                    Next Activity
                  </Typography>
                  <Box sx={{ flex: '4.2' }}>
                    <Select
                      options={activities}
                      onChange={(value) => handleSetFormikValues('nextActivity', value)}
                      value={formikValue['nextActivity']}
                      styles={{
                        control: (baseStyle) => {
                          return {
                            ...baseStyle,
                            borderRadius: '7px',
                            borderColor: 'lightgray',
                            color: 'lightgray',
                          }
                        },
                      }}
                    />
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box display={'flex'} alignItems={'center'}>
                  <Typography sx={{ flex: '2' }} fontSize={'14px'}>
                    TAT
                  </Typography>
                  <Input
                    disableUnderline={true}
                    sx={{ 'flex': '4', '.MuiInputBase-input': { width: '100% !important' } }}
                    type="number"
                    name="tat"
                    placeholder="TAT"
                    value={formikValue['tat']}
                    onChange={handleChange}
                  />
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box display={'flex'} alignItems={'center'}>
                  <Typography sx={{ flex: '2' }} fontSize={'14px'}>
                    Is Last Activity
                  </Typography>
                  <Box sx={{ flex: '4', display: 'flex', justifyContent: 'start' }}>
                    <Switch name="isLastActivity" checked={formikValue['isLastActivity']} onChange={handleChange} />
                  </Box>
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ position: 'inherit', bottom: '8px', right: '19px' }}>
              <ArgonButton variant="contained" color="success" type={'submit'}>
                Confirm
              </ArgonButton>
            </Box>
          </Box>
          {response === 'error' && snackbarOpen && (
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
          )}
        </form>
      </Modal>
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {response === 'success' && snackbarOpen && (
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
      )}
    </DashboardLayout>
  )
}

export default WorkflowMaintenance
