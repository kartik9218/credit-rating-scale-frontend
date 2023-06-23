import React, { useEffect, useState } from 'react'
import { Backdrop, Button, CircularProgress, Dialog, DialogActions, Grid, IconButton, Typography } from '@mui/material'
import DashboardLayout from 'layouts/DashboardLayout'
import CardWrapper from 'slots/Cards/CardWrapper'
import { DataGrid } from '@mui/x-data-grid'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import VerifyMinutesModal from './modal/VerifyMinutesModal'
import PropTypes from 'prop-types'
import { Box } from '@mui/system'
import { SET_PAGE_TITLE } from 'helpers/Base'
import { HTTP_CLIENT } from 'helpers/Api'
import { APIFY } from 'helpers/Api'
import { GET_QUERY } from 'helpers/Base'
import VerifyRatingDialog from './VerifyRatingDialog'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import colors from 'assets/theme/base/colors'
import { ArgonSnackbar } from 'components/ArgonTheme'
import { useNavigate } from 'react-router-dom'

const RatingVerification = () => {
  const navigate = useNavigate()
  const [vmModal, setVMModal] = useState(false)
  const [VerifyRatingBtn, setVerifyRatingBtn] = useState(false)
  // const [rows, setRows] = useState([])
  const [verifyMinutesData, setVerifyMinutesData] = useState({})
  const [SelectedVotingData, setSelectedVotingData] = useState({})
  const [Rows, setRows] = useState([])
  const [Chairman, setChairman] = useState({})
  const [MembersRows, setMembersRows] = useState([])
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('Please check all required fields')
  const [isSnackbarOpen, setIsSnackbarOpen] = useState({ open: false, result: '', title: '' })
  const [backdropOpen, setBackdropOpen] = useState(false)
  const onCloseSnackbar = () => {
    setIsSnackbarOpen({ open: false, result: '', title: '' })
  }

  const getRatingVerification = async () => {
    HTTP_CLIENT(APIFY('/v1/rating/verification/view'), {
      params: {
        company_uuid: GET_QUERY('company-uuid'),
        code: GET_QUERY('code'),
      },
    })
      .then((data) => {
        const { rating_verification } = data

        setRows([...rating_verification])

        getMeetingMembers(rating_verification[0].rating_committee_meeting_uuid)

        getMeetingData(rating_verification[0].rating_committee_meeting_uuid)

        setVerifyMinutesData({ rating_committee_meeting_uuid: rating_verification[0].rating_committee_meeting_uuid })
      })
      .catch((err) => {})
  }

  const getMeetingData = (MID) => {
    HTTP_CLIENT(APIFY('/v1/rating_committee_meetings/view'), {
      params: { uuid: MID },
    })
      .then((data) => {
        if (data['success']) {
          const { rating_committee_meeting } = data

          setSelectedVotingData({ ...rating_committee_meeting })
        }
      })
      .catch((err) => {})
  }
  const handleVerifyRating = () => {
    let mandates = new Set()
    let ar = [...Rows].map((val) => {
      mandates.add(val.mandate_id)
    })

    const mandatesArr = Array.from(mandates)

    HTTP_CLIENT(APIFY('/v1/inbox/execution/assign_to_user'), {
      params: {
        mandate_id: [...mandatesArr],
        user_uuid: null,
        code: GET_QUERY('code'),
        rating_process_uuid: GET_QUERY('rating-uuid'),
      },
    })
      .then((data) => {
        if (data['success']) {
          setIsSnackbarOpen({ open: true, result: 'success', title: 'Rating verified' })
        } else {
          setIsSnackbarOpen({ open: true, result: 'error', title: 'Rating not verified' })
        }
      })
      .catch((err) => {})

    setBackdropOpen(true)
    setTimeout(() => {
      setBackdropOpen(false)
      navigate('/dashboard/inbox')
    }, 1000)
  }

  const getMeetingMembers = (MID) => {
    HTTP_CLIENT(APIFY('/v1/rating_committee_meetings/view_members'), {
      params: {
        rating_committee_meeting_uuid: MID,
      },
    })
      .then((data) => {
        if (data['success']) {
          const { members } = data

          let chMan = [...members].filter((val) => {
            if (val.is_chairman) return true
          })
          if (chMan.length > 0) {
            setChairman(chMan[0])
          }

          setMembersRows([...members])
        }
      })
      .catch((err) => {})
  }

  const MembersColumns = [
    {
      field: 'full_name',
      headerName: 'Member Name',
      width: 280,
    },
    {
      field: 'employee_code',
      headerName: 'Employee Code',
      width: 280,
    },
    {
      field: 'chairman',
      headerName: 'Chairman',
      width: 280,
      align: 'center',
      headerAlign: 'center',
      renderCell: (cell) => {
        return <>{cell.row?.employee_code === Chairman.employee_code && <CheckCircleIcon />}</>
      },
    },
    {
      field: 'attended',
      headerName: 'Attendance',
      width: 280,
      align: 'center',
      headerAlign: 'center',
      renderCell: (cell) => {
        return <>{<CheckCircleIcon />}</>
      },
    },
  ]

  const columns = [
    {
      field: 'company_name',
      headerName: 'Name of Company',
      width: 280,
      renderCell: (cell) => {
        return <>{cell.row?.company_name}</>
      },
    },
    {
      field: 'mandate_id',
      headerName: 'Mandate ID',
      width: 200,
    },
    {
      field: 'instrument_text',
      headerName: 'Instrument',
      width: 200,
    },
    {
      field: 'instrument_size_number',
      headerName: 'Instrument Size(in Cr.)',
      width: 200,
      renderCell: (cell) => {
        return <>{cell.row?.instrument_size_number.toFixed(2)}</>
      },
    },
    {
      field: 'facility',
      headerName: 'Facility Name',
      width: 200,
    },
    {
      field: 'assigned_rating',
      headerName: 'IRCM Rating',
      width: 200,
    },

    {
      field: 'agenda',
      headerName: 'Agenda',
      width: 160,
    },
    {
      field: 'overall_status',
      headerName: 'Stage',
      width: 200,
    },
    {
      field: 'remark',
      headerName: 'Remarks',
      width: 180,
      renderCell: (cell) => {
        return <>{cell.row.remark}</>
      },
    },
  ]

  useEffect(() => {
    // setRows([{ ...OneRow }])
    getRatingVerification()

    SET_PAGE_TITLE('Rating Verification')
  }, [])
  const getDocs = (uuid) => {
    HTTP_CLIENT(APIFY('/v1/rating_committee_data/view_documents'), {
      params: {
        company_uuid: GET_QUERY('company-uuid'),
      },
    })
      .then((data) => {
        const { committee_metadata_document } = data
        downloadPDF(committee_metadata_document?.rating_note)
      })
      .catch((err) => {})
  }

  const downloadPDF = (url) => {
    let a = document.createElement('a')
    a.style = 'display: none'
    a.href = url
    a.download = 'download.pdf'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
  return (
    <>
      <DashboardLayout>
        <CardWrapper headerTitle="Rating Verification">
          <Box sx={{ display: 'flex', justifyContent: 'left', fontSize: '14px' }}>
            <Box sx={{ width: 370, pl: 2 }}>
              <label style={{ marginRight: '10px', fontSize: '13px' }}>
                <b>Committee Type</b>
              </label>
              <label>{SelectedVotingData?.rating_committee_type?.name}</label>
            </Box>
            <Box sx={{ width: 370 }}>
              <label style={{ marginRight: '10px', fontSize: '13px' }}>
                <b>Committee Category</b>
              </label>
              <label> {SelectedVotingData?.rating_committee_meeting_category?.name}</label>
            </Box>
            <Box sx={{ width: 370 }}>
              <label style={{ marginRight: '10px', fontSize: '13px' }}>
                <b>Date and Time</b>
              </label>
              {SelectedVotingData.length && (
                <label>
                  {' '}
                  {`${SelectedVotingData?.meeting_at?.substr(0, 10)} 
                ${SelectedVotingData?.meeting_at
                  ?.toLocaleString('en-US', {
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true,
                  })
                  .substr(11, 5)} `}
                </label>
              )}
            </Box>
          </Box>
          <Box sx={{ height: 200, width: '97%', px: '0.8rem', py: '20px' }}>
            <DataGrid
              rows={MembersRows}
              columns={MembersColumns}
              getRowId={(row) => row?.uuid}
              sx={{ fontSize: '13px' }}
              rowHeight={30}
              hideFooter
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 1000, page: 0 },
                },
              }}
            />
          </Box>
          <Box sx={{ height: 240, width: '97%', px: '0.8rem' }}>
            <DataGrid
              rows={Rows}
              columns={columns}
              rowHeight={40}
              getRowId={(row) => row?.instrument_detail_uuid}
              sx={{ fontSize: '13px' }}
              hideFooter
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 1000, page: 0 },
                },
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'right', width: '99%' }}>
            <Button
              variant="contained"
              sx={{
                'backgroundColor': colors.primary.main,
                'color': 'white !important',
                'padding': '2px 15px',
                'fontSize': '13px !important',
                'margin': '10px 15px ',
                '&:hover': {
                  backgroundColor: '#4159de',
                },
              }}
              onClick={() => {
                setVMModal(true)
              }}
            >
              View Minutes
            </Button>

            <Button
              variant="contained"
              sx={{
                'backgroundColor': colors.primary.main,
                'color': 'white !important',
                'padding': '2px 15px ',
                'margin': '10px 15px ',

                'fontSize': '13px !important',
                '&:hover': {
                  backgroundColor: '#4159de',
                },
              }}
              onClick={() => {
                handleVerifyRating()
              }}
            >
              Verify Rating
            </Button>
          </Box>
          <ArgonSnackbar
            color={isSnackbarOpen.result}
            icon={isSnackbarOpen.result}
            title={isSnackbarOpen.result}
            content={isSnackbarOpen.title}
            translate="yes"
            dateTime=""
            open={isSnackbarOpen.open}
            close={onCloseSnackbar}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
          />
          {vmModal && <VerifyMinutesModal verifyMinutesData={verifyMinutesData} open={vmModal} setOpen={setVMModal} />}

          <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={backdropOpen}>
            <CircularProgress color="inherit" />
          </Backdrop>
        </CardWrapper>
      </DashboardLayout>
    </>
  )
}

export default RatingVerification
