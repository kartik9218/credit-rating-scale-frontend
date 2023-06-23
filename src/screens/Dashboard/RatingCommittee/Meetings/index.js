import React, { useState, useEffect } from 'react'
import { Box, Button, ButtonGroup, Grid, Stack } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { darken, lighten, styled } from '@mui/material/styles'
import ArgonSelect from 'components/ArgonSelect'
import DashboardLayout from 'layouts/DashboardLayout'
import CardWrapper from 'slots/Cards/CardWrapper'
import DeleteWarning from './Modals/DeleteWarning'
import { SET_PAGE_TITLE } from 'helpers/Base'
import AddIcon from '@mui/icons-material/Add'
import RatingCommitteeSchedule from './Modals/RatingCommitteeSchedule'
import { Link, useNavigate } from 'react-router-dom'
import { GET_ROUTE_NAME } from 'helpers/Base'
import { HTTP_CLIENT } from 'helpers/Api'
import { APIFY } from 'helpers/Api'
import { ArgonSnackbar } from 'components/ArgonTheme'
import { HAS_PERMISSIONS } from 'helpers/Base'
import EditIcon from '@mui/icons-material/Edit'

const options = [
  { value: 'Live', label: 'Live' },
  { value: 'Upcoming', label: 'Upcoming' },
  { value: 'Completed', label: 'Completed' },
  { value: '', label: 'All' },
]

const getBackgroundColor = (color, mode) => (mode === 'dark' ? darken(color, 0.7) : lighten(color, 0.7))

const getHoverBackgroundColor = (color, mode) => (mode === 'dark' ? darken(color, 0.6) : lighten(color, 0.6))

const getSelectedBackgroundColor = (color, mode) => (mode === 'dark' ? darken(color, 0.5) : lighten(color, 0.5))

const getSelectedHoverBackgroundColor = (color, mode) => (mode === 'dark' ? darken(color, 0.4) : lighten(color, 0.4))
const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  '& .super-app-theme--completed': {
    'backgroundColor': getBackgroundColor('#dfe2e5', 'light'),
    '&:hover': {
      backgroundColor: getHoverBackgroundColor('#dfe2e5', 'light'),
    },
    '&.Mui-selected': {
      'backgroundColor': getSelectedBackgroundColor('#dfe2e5', 'light'),
      '&:hover': {
        backgroundColor: getSelectedHoverBackgroundColor('#dfe2e5', 'light'),
      },
    },
  },
}))

const MeetingStatus = () => {
  const [isSnackbarOpen, setIsSnackbarOpen] = useState({ open: false, result: '', title: '' })
  const [AddOrEdit, setAddOrEdit] = useState('add')
  const actionBtns = [
    {
      title: 'Committee Members',
      route: '/dashboard/rating-committee/meetings/committee-member',
      uuid_route_name: 'VIEW COMMITTEE MEETING MEMBERS',
    },
    {
      title: 'View Agenda',
      route: '/dashboard/rating-committee/meetings/view-agenda',
      uuid_route_name: 'VIEW_COMMITTEE_AGENDA',
    },
    {
      title: 'Voting',
      route: '/dashboard/rating-committee/meetings/committee-voting',
      uuid_route_name: 'VIEW COMMITTEE VOTING',
    },
    {
      title: 'Register',
      route: '/dashboard/rating-committee/meetings/rating-register',
      uuid_route_name: 'VIEW COMMITTEE RATING REGISTER',
    },
    {
      title: 'Minutes',
      route: '/dashboard/rating-committee/meetings/view-committee-minutes',
      uuid_route_name: 'VIEW COMMITTEE MINUTES',
    },
  ]
  const GET_MEETING_PAGE_ROUTE = (route_name, uuid) => {
    return GET_ROUTE_NAME(route_name, { uuid })
  }

  const [open, setOpen] = useState(false)
  const [openCommitteeSchedule, setOpenCommitteeSchedule] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [rows, setRows] = useState([])
  const [ClickedObj, setClickedObj] = useState({})
  const navigate = useNavigate()

  const [Progress, setProgress] = useState({ value: '', label: 'All' })

  useEffect(() => {
    SET_PAGE_TITLE('Meetings')
  }, [])

  const getMeetings = () => {
    HTTP_CLIENT(APIFY('/v1/rating_committee_meetings'), { params: { is_active: true } })
      .then((data) => {
        const { rating_committee_meetings } = data
        let temp = []
        temp = rating_committee_meetings
          .filter((val) => {
            if (val.is_active == false) {
              return false
            } else {
              return true
            }
          })
          .map((val) => {
            if (val.is_active == true) {
              return {
                ...val,

                meet_committeeType: val.rating_committee_type ? val.rating_committee_type.name : '',
                meet_category: val.rating_committee_meeting_category ? val.rating_committee_meeting_category.name : '',
              }
            }
          })

        setRows(temp)
      })
      .catch((err) => {})
  }

  useEffect(() => {
    getMeetings()
  }, [])
  const columns = [
    {
      field: 'created_at',
      headerName: '',
    },
    {
      field: 'progress',
      headerName: 'Status',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        let mystatus = params.row?.status
        return (
          <div
            style={{
              display: 'flex',
              gap: '6px',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <div
              style={{
                background: mystatus == 'Upcoming' ? 'yellow' : mystatus == 'Live' ? 'green' : 'red',
                width: '15px',
                height: '15px',
                borderRadius: '10px',
              }}
            ></div>
            {params.row?.status}
          </div>
        )
      },
    },
    {
      field: 'meeting_at',
      headerName: 'Date / Time',
      width: 150,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        let time = new Date()
        time.setHours(Number(params.value.substr(11, 2)))
        time.setMinutes(Number(params.value.substr(14, 2)))

        return (
          <p>{`${params.value.substr(0, 10)} ${time.toLocaleString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
          })} `}</p>
        )
      },
    },
    {
      field: 'meet_committeeType',
      headerName: 'Committee Type',
      width: 140,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'meet_category',
      headerName: 'Category',
      width: 110,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'number_of_cases',
      headerName: 'No. of Cases',
      description: 'Number of cases',
      sortable: true,
      width: 120,
      align: 'center',
      headerAlign: 'center',
      valueGetter: (params) => `${params.row?.number_of_cases}`,
    },
    {
      field: 'action',
      headerName: 'Action',
      headerAlign: 'center',
      align: 'center',
      description: 'Actions to be taken',
      width: 420,
      sortable: false,
      renderCell: (params) => {
        return (
          <>
            <Box
              sx={{
                whiteSpace: 'normal',
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                alignItems: 'center',
              }}
            >
              <ButtonGroup size="small" variant="text">
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
                  {actionBtns.map((action, id) => {
                    return (
                      <>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                          {HAS_PERMISSIONS([action.route]) ? (
                            <Button
                              sx={{
                                'my': '-0.2rem',
                                'padding': '0',
                                'fontSize': '13px',
                                'color': '#3479FF',
                                '&:hover': {
                                  color: '#3479FF',
                                },
                              }}
                              disabled={
                                action.title == 'Voting'
                                  ? params.row?.status === 'Upcoming'
                                    ? true
                                    : false
                                  : action.title == 'Committee Members'
                                  ? params.row?.status === 'Completed'
                                    ? true
                                    : false
                                  : false
                              }
                              onClick={() => navigate(GET_MEETING_PAGE_ROUTE(action.uuid_route_name, params.row?.uuid))}
                            >
                              {action.title}
                              {actionBtns.length - 1 > id && ' /'}
                            </Button>
                          ) : (
                            <div></div>
                          )}
                        </Box>
                      </>
                    )
                  })}
                </Box>
              </ButtonGroup>
            </Box>
          </>
        )
      },
    },
    {
      field: '',
      headerName: '',
      width: 85,
      sortable: false,

      renderCell: (params) => {
        return (
          <>
            {params.row?.status === 'Upcoming' ? (
              <Button
                disabled={params.row?.status === 'Upcoming' ? false : true}
                onClick={() => {
                  setAddOrEdit('edit')

                  params.row.rating_committee_type.label = params.row.rating_committee_type.name
                  params.row.rating_committee_type.value = params.row.rating_committee_type.uuid
                  params.row.rating_committee_meeting_category.label = params.row.rating_committee_meeting_category.name
                  params.row.rating_committee_meeting_category.value = params.row.rating_committee_meeting_category.uuid
                  setClickedObj(params.row)
                  setOpenCommitteeSchedule(true)
                }}
              >
                <EditIcon
                  sx={{
                    ml: '0.8rem',
                    color: 'gray',
                    cursor: 'pointer',
                    transform: 'scale(1.4)',
                    float: 'right',
                  }}
                />
              </Button>
            ) : (
              <div></div>
            )}
          </>
        )
      },
    },
  ]

  const onCloseSnackbar = () => {
    setIsSnackbarOpen({ open: false, result: '', title: '' })
  }
  return (
    <>
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
      <DashboardLayout>
        <CardWrapper
          headerTitle="Meetings"
          headerActionButton={() => {
            return (
              <div style={{ margin: '10px 10px', display: 'flex', alignItems: 'center' }}>
                <Box
                  onClick={() => {
                    setAddOrEdit('add')
                    setClickedObj({})
                    setOpenCommitteeSchedule(true)
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Button
                    variant="contained"
                    sx={{
                      'marginBottom': '10px',
                      'color': 'white !important',
                      'backgroundColor': '#3c5cd2',
                      '&:hover': {
                        backgroundColor: '#3c5cd2',
                      },
                    }}
                  >
                    <AddIcon sx={{ stroke: 'white', strokeWidth: '2.5' }} />
                    Add new meeting
                  </Button>
                </Box>
              </div>
            )
          }}
          headerBtn={() => {
            return <div style={{ border: '1px solid' }}></div>
          }}
        >
          <Grid sx={{ height: 525, width: '100%', px: '0.8rem', marginTop: '-20px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '83%' }}>
              <div style={{ width: '15%', marginTop: -72 }}>
                <ArgonSelect
                  options={options}
                  value={Progress}
                  onChange={(value) => setProgress(value)}
                  sx={{ '&>div>input': { fontSize: '14px !important' } }}
                />
              </div>
            </div>
            <StyledDataGrid
              className="MuiDataGridCssAdjust"
              components={{
                NoRowsOverlay: () => (
                  <Stack height="100%" alignItems="center" justifyContent="center">
                    No meetings to show. Create new meeting by clicking add(+) button.
                  </Stack>
                ),
              }}
              columnVisibilityModel={{ created_at: false }}
              hideFooterSelectedRowCount
              initialState={{
                sorting: {
                  sortModel: [{ field: 'created_at', sort: 'desc' }],
                  pagination: {
                    paginationModel: { pageSize: 250, page: 0 },
                  },
                },
              }}
              getRowId={(row) => row.uuid}
              sx={{ fontSize: '13px' }}
              rows={[
                ...rows.filter((val) => {
                  if (Progress.value == '') return true
                  else if (Progress.value == val.status) return true
                }),
              ]}
              columns={columns}
              pageSize={8}
              rowsPerPageOptions={[5]}
            />
          </Grid>

          <DeleteWarning
            deleteModal={deleteModal}
            setDeleteModal={setDeleteModal}
            ClickedObj={ClickedObj}
            getMeetings={getMeetings}
          />
          {openCommitteeSchedule && (
            <RatingCommitteeSchedule
              getMeetings={getMeetings}
              setIsSnackbarOpen={setIsSnackbarOpen}
              open={openCommitteeSchedule}
              setOpen={setOpenCommitteeSchedule}
              ClickedObj={ClickedObj}
              setClickedObj={setClickedObj}
              AddOrEdit={AddOrEdit}
              setAddOrEdit={setAddOrEdit}
            />
          )}
        </CardWrapper>
      </DashboardLayout>
    </>
  )
}

export default MeetingStatus
