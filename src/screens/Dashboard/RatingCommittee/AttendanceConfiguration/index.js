import { Alert, Autocomplete, Box, Button, Menu, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { APIFY } from 'helpers/Api'
import { HTTP_CLIENT } from 'helpers/Api'
import { SET_PAGE_TITLE } from 'helpers/Base'
import { DashboardLayout } from 'layouts'
import React, { useEffect, useState } from 'react'
import CardWrapper from 'slots/Cards/CardWrapper'
import AddModal from './AddModal'
import { Link } from 'react-router-dom'
import ConfirmModal from './ConfirmModal'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { HAS_PERMISSIONS } from 'helpers/Base'
import { GET_ROUTE_NAME } from 'helpers/Base'
import { ArgonSnackbar } from 'components/ArgonTheme'

function AttendanceConfiguration() {
  const [rows, setRows] = useState([])
  const [LocalRows, setLocalRows] = useState([])
  const [committeeTypes, setCommitteeTypes] = useState([])
  const [committeeCategories, setCommitteeCategories] = useState([])
  const [SelectedCommitteeType, setSelectedCommitteeType] = useState({})
  const [SelectedCommitteeCategory, setSelectedCommitteeCategory] = useState({})
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const [SelectedDay, setSelectedDay] = useState('')
  const [ClickedMemberUUID, setClickedMemberUUID] = useState({})
  const [OpenConfirmModal, setOpenConfirmModal] = useState(false)
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [AlreadyHaveChairman, setAlreadyHaveChairman] = useState(0)
  const open = Boolean(anchorEl)
  const [PayloadRows, setPayloadRows] = useState([])
  const [Action, setAction] = useState('')
  const [isSnackbarOpen, setIsSnackbarOpen] = useState({ open: false, result: '', title: '' })
  const onCloseSnackbar = () => {
    setIsSnackbarOpen({ open: false, result: '', title: '' })
  }
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  const columnsData = [
    {
      field: 'id',
      headerName: '#',
    },

    {
      field: 'member',
      headerName: 'Member Name',
      width: 280,
      renderCell: (params) => {
        return (
          <Box>
            {HAS_PERMISSIONS(['/dashboard/users/view']) ? (
              <Link to={GET_ROUTE_NAME('VIEW_USER', { uuid: params.row?.member.uuid })} target="_blank">
                {params.row?.member?.full_name}
              </Link>
            ) : (
              params.row?.member?.full_name
            )}
          </Box>
        )
      },
    },
    {
      field: 'Employeecode',
      headerName: 'Employee Code',
      width: 280,
      valueGetter: (params) => `${params.row?.member?.employee_code}` || '',
    },
    {
      field: 'is_chairman',
      headerName: 'Is Chairperson',
      width: 280,
        renderCell: (params) => {
         
        return <> {params.row?.is_chairman == true ? <label>yes</label> : <label>no</label>}</>
    }},
    {
      field: '',
      headerName: 'Actions',
      width: 280,
      renderCell: (params) => {
        return (
          <div>
            <Button
              id="basic-button"
              aria-controls={open ? 'basic-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              onClick={handleClick}
            >
              <MoreVertIcon
                onClick={() => {
                  setClickedMemberUUID(params.row)
                }}
              ></MoreVertIcon>
            </Button>
            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'basic-button',
              }}
            >
              <MenuItem
                onClick={() => {
                  handleClose()
                  setOpenConfirmModal(true)
                  setAction('Delete')
                }}
              >
                Delete
              </MenuItem>

              <MenuItem
                onClick={() => {
                  handleClose()
                  setOpenConfirmModal(true)
                  setAction("Chairman")
                }}
              >
                Select as Chairman
              </MenuItem>
            </Menu>
          </div>
        )
      },
    },
  ]
  const createAttendanceConf = async () => {
    let temp = [...PayloadRows].map((val) => {
      let myObj = { member_id: val.member.id, is_chairman: val.is_chairman, is_active: val.is_active }
      if (val.uuid) myObj = { ...myObj, uuid: val.uuid }

      return myObj
    })
    let data = {
      rating_committee_meeting_category_uuid: SelectedCommitteeCategory.value,
      rating_committee_type_uuid: SelectedCommitteeType.value,
      conf_day: SelectedDay,
      params: [...temp],
    }
    if (rows.length === 0) {
      HTTP_CLIENT(APIFY('/v1/rating_committee_meeting_attendence_confs/create'), data)
        .then((response) => {
          if (response['success']) {
            fetchAttendanceConf()
            setIsSnackbarOpen({ open: true, result: 'success', title: 'Updated successfully' })
          }
        })
        .catch((error) => {
          setIsSnackbarOpen({ open: true, result: 'error', title: 'Attendance configuration not updated' })
        })
    } else {
      HTTP_CLIENT(APIFY('/v1/rating_committee_meeting_attendence_confs/edit'), data)
        .then((response) => {
          if (response['success']) {
            fetchAttendanceConf()
            setIsSnackbarOpen({ open: true, result: 'success', title: 'Updated successfully' })
          }
        })
        .catch((error) => {
          setIsSnackbarOpen({ open: true, result: 'error', title: 'Attendance configuration not updated' })
        })
    }
  }
  const fetchAttendanceConf = async () => {
    HTTP_CLIENT(APIFY('/v1/rating_committee_meeting_attendence_confs'), {
      params: {
        rating_committee_meeting_category_uuid: SelectedCommitteeCategory.value,
        rating_committee_type_uuid: SelectedCommitteeType.value,
        conf_day: SelectedDay,
        is_active: true,
      },
    }).then((response) => {
      if (response['success']) {
        const { rating_committee_meeting_attendence_confs } = response

        let temp = [...rating_committee_meeting_attendence_confs].map((val, idx) => {
          return {
            uuid: val.uuid,
            is_chairman: val.is_chairman,
            is_active: val.is_active,
            member_id: val.member_id,
            member: {
              uuid: val.member.uuid,
              id: val.member_id,
              employee_code: val.member.employee_code,
              full_name: val.member.full_name,
            },
          }
        })
        setRows([...temp])
        setLocalRows([...temp])
        setPayloadRows([...temp])
      }
    })
  }

  const fetchRatingCommitteeCategories = async () => {
    HTTP_CLIENT(APIFY('/v1/rating_committee_meeting_categories'), {
      params: { is_active: true },
    }).then((response) => {
      const rating_committee_meeting_categories = response['rating_committee_meeting_categories']
      let temp = []
      temp.push(
        rating_committee_meeting_categories.map((val) => {
          return {
            label: val?.name,
            value: val?.uuid,
          }
        }),
      )
      setCommitteeCategories(...temp)
    })
  }

  const fetchRatingCommitteeTypes = async () => {
    HTTP_CLIENT(APIFY('/v1/rating_committee_types'), { params: { is_active: true } }).then((response) => {
      const rating_committee_types = response['rating_committees']
      let temp = []
      temp.push(
        rating_committee_types.map((val) => {
          return {
            label: val?.name,
            value: val?.uuid,
          }
        }),
      )
      setCommitteeTypes(...temp)
    })
  }

  useEffect(() => {
    fetchRatingCommitteeTypes()
    fetchRatingCommitteeCategories()
    SET_PAGE_TITLE('Attendance Configuration')

  }, [])

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
        <CardWrapper headerTitle="Attendance Configuration">
          <Box sx={{ paddingLeft: '20px', marginTop: '-40px' }}>
            <Box sx={{ display: 'flex', margin: '10px 0px', justifyContent: 'space-between', width: '98%' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', width: '250px', margin: '20px 40px 20px 0px' }}>
                <Typography component="label" variant="caption" fontWeight="bold" sx={{ marginBottom: '10px' }}>
                  Rating Committee Type
                </Typography>
                <Autocomplete
                  disablePortal
                  disableClearable
                  options={committeeTypes}
                  onChange={(e, val) => {
                    setSelectedCommitteeType(val)
                  }}
                  sx={{ width: 220 }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select Committee Type"
                      sx={{ '&>div': { fontSize: '12px !important', height: '35px !important', width: '235px !important' } }}
                    />
                  )}
                />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', width: '250px', margin: '20px 40px 20px 0px' }}>
                <Typography
                  component="label"
                  variant="caption"
                  fontWeight="bold"
                  sx={{ marginBottom: '10px', marginLeft: '0px' }}
                >
                  Rating Committee Category
                </Typography>
                <Autocomplete
                  disablePortal
                  disableClearable
                  options={committeeCategories}
                  onChange={(e, val) => {
                    setSelectedCommitteeCategory(val)
                  }}
                  sx={{ width: 220 }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select Committee Category"
                      sx={{ '&>div': { fontSize: '12px !important', height: '35px !important', width: '235px !important' } }}
                    />
                  )}
                />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', width: '250px', margin: '20px 40px 20px 0px' }}>
                <Typography
                  component="label"
                  variant="caption"
                  fontWeight="bold"
                  sx={{ marginBottom: '10px', marginLeft: '0px' }}
                >
                  Day
                </Typography>
                <Autocomplete
                  disablePortal
                  disableClearable
                  options={days}
                  value={SelectedDay}
                  onChange={(e, val) => {
                    setSelectedDay(val)
                  }}
                  sx={{ width: 220 }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select Day"
                      sx={{ '&>div': { fontSize: '12px !important', height: '35px !important', width: '235px !important' } }}
                    />
                  )}
                />
              </Box>
              <Button
                sx={{ background: '#5e72e4 !important', color: 'white !important', margin: '38px 25px' }}
                variant="contained"
                disabled={
                  Object.keys(SelectedCommitteeCategory)?.length > 0 &&
                  Object.keys(SelectedCommitteeType)?.length > 0 &&
                  SelectedDay !== ''
                    ? false
                    : true
                }
                onClick={() => {
                  fetchAttendanceConf()
                }}
              >
                View
              </Button>
            </Box>

            <Box
              className="MuiDataGridCssAdjust"
              sx={{ height: 325, width: '97.5%', paddingLeft: '5px', marginBottom: '20px' }}
            >
              <DataGrid
                rowHeight={30}
                rows={LocalRows}
                onRowsScrollEnd
                disableSelectionOnClick
                columnVisibilityModel={{ id: false }}
                columns={columnsData}
                rowsPerPageOptions={[5]}
                sx={{ fontSize: '13px' }}
                getRowId={(row) => row?.member.uuid}
                components={{
                  NoRowsOverlay: () => (
                    <Stack height="100%" alignItems="center" justifyContent="center">
                      No members to show. Select above three options first.
                    </Stack>
                  ),
                }}
              />
            </Box>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '95.5%', padding: '0px 10px' }}>
              <AddModal
                SelectedCommitteeCategory={SelectedCommitteeCategory}
                SelectedCommitteeType={SelectedCommitteeType}
                SelectedDay={SelectedDay}
                fetchAttendanceConf={fetchAttendanceConf}
                AlreadyHaveChairman={AlreadyHaveChairman}
                setAlreadyHaveChairman={setAlreadyHaveChairman}
                rows={rows}
                setLocalRows={setLocalRows}
                setPayloadRows={setPayloadRows}
                PayloadRows={PayloadRows}
                LocalRows={LocalRows}
              ></AddModal>
              <Button
                onClick={createAttendanceConf}
                sx={{ background: '#5e72e4 !important', color: 'white !important' }}
                variant="contained"
                disabled={
                  Object.keys(SelectedCommitteeCategory)?.length > 0 &&
                  Object.keys(SelectedCommitteeType)?.length > 0 &&
                  SelectedDay !== ''
                    ? false
                    : true
                }
              >
                Save Template
              </Button>
            </div>

            <ConfirmModal
              fetchAttendanceConf={fetchAttendanceConf}
              OpenConfirmModal={OpenConfirmModal}
              setOpenConfirmModal={setOpenConfirmModal}
              Action={Action}
              ClickedMemberUUID={ClickedMemberUUID}
              setLocalRows={setLocalRows}
              setPayloadRows={setPayloadRows}
              PayloadRows={PayloadRows}
              LocalRows={LocalRows}
              AlreadyHaveChairman={AlreadyHaveChairman}
              setAlreadyHaveChairman={setAlreadyHaveChairman}
            />
          </Box>
        </CardWrapper>
      </DashboardLayout>
    </>
  )
}

export default AttendanceConfiguration
