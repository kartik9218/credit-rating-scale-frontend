import React, { useCallback, useEffect, useState } from 'react'
import { DashboardLayout } from 'layouts'
import CardWrapper from 'slots/Cards/CardWrapper'
import ArgonSelect from 'components/ArgonSelect'
import { HTTP_CLIENT } from 'helpers/Api'
import { APIFY } from 'helpers/Api'
import { Backdrop, Box, Button, CircularProgress, Grid, Modal, Tab, Tabs, Typography } from '@mui/material'
import { ArgonTypography } from 'components/ArgonTheme'
import DataTable from 'slots/Tables/DataTable'
import { ArgonButton } from 'components/ArgonTheme'
import { CloseOutlined } from '@mui/icons-material'
import moment from 'moment'
import InfomericButton from 'slots/Buttons'
import { GENERATE_UUID } from 'helpers/Base'

const MandateLifeCycle = () => {
  const [selectedCompany, setSelectedCompany] = useState({ label: 'Select Company...', value: '' })
  const [companies, setCompanies] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('Initial')
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState([])
  const [logData, setLogData] = useState([])
  const [lifeCycleObj, setLifeCycleObj] = useState({ name: '', id: '' })
  const [tabs, setTabs] = useState([])

  const { name, id } = lifeCycleObj
  const columns = [
    {
      accessor: 'mandate_id',
      Header: 'Mandate ID',
      Cell: (row) => {
        return (
          <ArgonTypography
            onClick={() =>
              handleViewMandateLifeCycle(
                row.cell.row.original.company_name,
                row.cell.value,
                row.cell.row.original.mandate_uuid,
              )
            }
            sx={{ cursor: 'pointer', fontSize: '16px', textDecoration: 'underline', color: 'blue' }}
          >
            {row.cell.value}
          </ArgonTypography>
        )
      },
    },
    {
      accessor: 'activity_to_be_performed',
      Header: 'Current Status',
      Cell: (row) => <Box sx={{ width: '200px' }}>{row.cell.value}</Box>,
    },
    {
      accessor: 'gh_name',
      Header: 'Group Head',
      Cell: (row) => <>{row.cell.value ?? '-'}</>,
    },
    {
      accessor: 'ra_name',
      Header: 'Rating Analyst',
      Cell: (row) => <>{row.cell.value ?? '-'}</>,
    },
    {
      accessor: 'bd_name',
      Header: 'BD',
    },
    {
      accessor: 'mandate_date',
      Header: 'Mandate Date',
      Cell: (row) => <>{moment(row.cell.value).format('DD/MM/YYYY')}</>,
    },
    {
      accessor: 'received_date',
      Header: 'Recieved Date',
      Cell: (row) => <>{moment(row.cell.value).format('DD/MM/YYYY')}</>,
    },
  ]

  const logColumn = [
    { accessor: 'code', Header: 'Activity Code' },
    {
      accessor: 'name',
      Header: 'Activity',
      Cell: (row) => <Box sx={{ width: '200px' }}>{row.cell.value}</Box>,
    },
    {accessor: 'rating_process', Header: 'Process'},
    { accessor: 'performed_by_user', Header: 'Performed by User' },
    { accessor: 'performer_role', Header: 'Performed By' },
    { accessor: 'assigner_role', Header: ' Assigneer Role' },
    {
      accessor: 'created_at',
      Header: 'Created At',
      Cell: (row) => <>{moment(row.cell.value).format('DD/MM/YYYY h:m:ss A')}</>,
    },
  ]

  useEffect(() => {
    getAllCompanies()
  }, [])

  useEffect(() => {
    if (!selectedCompany.value) return
    getCompanyMandateLifeCycle()
  }, [selectedCompany.value])

  const getCompanyMandateLifeCycle = () => {
    setIsLoading(true)
    HTTP_CLIENT(APIFY('/v1/mandate_lifecycle'), { params: { company_uuid: selectedCompany.value } })
      .then((response) => {
        if (response.success) {
          const { company_mandates } = response
          setData([...company_mandates])
          setIsLoading(false)
        }
      })
      .catch((err) => console.log(err))
  }

  const handleChangeActiveTab = (event, newValue) => {
    setActiveTab(newValue)
  }
  const getAllCompanies = () => {
    HTTP_CLIENT(APIFY('/v1/companies'))
      .then((response) => {
        const { companies } = response
        const options = []
        companies.forEach(({ name, uuid }) => {
          options.push({ label: name, value: uuid })
        })
        setCompanies([...options])
      })
      .catch((error) => {
        console.error(error)
      })
  }

  const handleModalState = () => {
    setIsModalOpen((prev) => !prev)
    setLogData([])
  }

  const getLogRow = useCallback(() => {
    return logData.filter(row => row.rating_process === activeTab)
  },[activeTab, logData])

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
    const CONVERT_TO_CAMEL_CASE = (str) => {
      const arr = str.split(' ')
      for (let i = 0; i < arr.length; i++) {
        arr[i] = arr[i].charAt(0).toLowerCase() + arr[i].slice(1)
      }
      return arr.join('_')
    }
    const csvRows = []
    const headers = Object.keys(data[0])
      .map((words) => words.split('_').join(' '))
      .map((str) => REMOVE_CAMEL_CASE(str))
    csvRows.push(headers.join(','))
    for (const row of data) {
      const values = headers.map((header) => {
        let val = row[CONVERT_TO_CAMEL_CASE(header)]
        return `"${val}"`
      })
      csvRows.push(values.join(','))
    }
    return csvRows.join('\n')
  }

  const handleDownloadCSV = () => {
    if (!getLogRow().length > 0) return
    DOWNLOAD_CSV(CSV_MAKER(getLogRow()))
  }

  const handleViewMandateLifeCycle = (name, id, mandate_uuid) => {
    setLifeCycleObj({ name, id })
    setIsModalOpen(true)
    HTTP_CLIENT(APIFY('/v1/mandate_lifecycle/view'), { params: { mandate_uuid } })
      .then((response) => {
        if (response.success) {
          const { mandate_status, rating_processes } = response
          setTabs(() => {
            return rating_processes.map(process => Object.assign({},{
              name:process,
              id:GENERATE_UUID()
            }))
           })
        
          setLogData([...mandate_status])
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }

  return (
    <DashboardLayout>
      <CardWrapper
        headerSubtitle={'Workflow Management'}
        headerTitle={'Mandate Life Cycle'}
        headerActionButton={() => {
          return (
            <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <ArgonTypography fontSize={'16px'}>Select Company</ArgonTypography>
              <Box sx={{ width: '300px' }}>
                <ArgonSelect
                  value={selectedCompany}
                  onChange={(options) => setSelectedCompany(options)}
                  options={companies}
                />
              </Box>
            </Box>
          )
        }}
      >
        <Box sx={{ padding: '10px', marginTop: '-40px' }}>
          <DataTable
            table={{
              columns: columns,
              rows: data,
            }}
            isPaginationVisible={false}
            canSearch={true}
            entriesPerPage={{ entries: data.length, defaultValue: data.length }}
          />
        </Box>
      </CardWrapper>
      <Modal open={isModalOpen} onClose={handleModalState} className="modal-wrapper">
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 1300,
            height: 700,
            border: 'none !important',
            outline: 'none !important',
            bgcolor: 'background.paper',
            borderRadius: '10px',
            boxShadow: 24,
            overflow: 'hidden',
            overflowY: 'scroll',
            p: 1,
          }}
        >
          <Box display={'flex'} justifyContent={'flex-end'}>
            <CloseOutlined onClick={handleModalState} sx={{ fontSize: '20px !important', cursor: 'pointer' }} />
          </Box>
          <Grid container padding=".6rem" marginTop={'10px'} spacing={1}>
            <Grid item xs={12} marginTop={'-20px'}>
              <ArgonTypography sx={{ fontWeight: '500' }}>Mandate Life Cycle</ArgonTypography>
            </Grid>
            <Grid item xs={12} display="flex" justifyContent={'space-between'} alignItems={'center'}>
              <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <ArgonTypography sx={{ fontSize: '17px', fontWeight: '500' }}>Company Name</ArgonTypography>
                  <span style={{ fonteSize: '15px' }}>: {name}</span>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <ArgonTypography sx={{ fontSize: '17px', fontWeight: '500' }}>Mandate ID</ArgonTypography>
                  <span style={{ fonteSize: '15px' }}>: {id}</span>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: '', alignItems: 'center' }}>
                <ArgonButton color={'primary'} onClick={handleDownloadCSV}>
                  Export as CSV
                </ArgonButton>
              </Box>
            </Grid>

            <Grid item xs={12} display={'flex'} gap={'50px'}>
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'start', gap: '10px' }}>
                {tabs.map(({ name, uuid }) => (
                  <ArgonButton
                    sx={{
                      'borderRadius': '20px',
                      'opacity': name !== activeTab && '.6',
                      'transition': 'ease opacity 1ms',
                      ':active': {
                        border: 'none !important',
                      },
                    }}
                    onClick={() => setActiveTab(name)}
                    key={uuid}
                    color={'primary'}
                  >
                    {name}
                  </ArgonButton>
                ))}
              </Box>
              <Box
                sx={{
                  marginTop: '1px',
                  padding: '10px',
                  border: '1px solid lightgray',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                <DataTable
                  table={{
                    columns: logColumn,
                    rows: getLogRow(),
                  }}
                  sx={{
                    fontWeight: '500 !important',
                  }}
                  customHeight={'calc(100vh - 26vh)'}
                  isPaginationVisible={false}
                  canSearch={false}
                  entriesPerPage={{ entries: getLogRow().length, defaultValue: getLogRow().length }}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Modal>
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </DashboardLayout>
  )
}

export default MandateLifeCycle
