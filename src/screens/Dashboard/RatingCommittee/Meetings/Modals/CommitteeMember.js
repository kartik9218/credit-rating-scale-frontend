import React, { useState, useEffect } from 'react'
import { Autocomplete, Box, Button, Grid, Select, TextField, Typography } from '@mui/material'

import AddIcon from '@mui/icons-material/Add'
import DashboardLayout from 'layouts/DashboardLayout'
import CardWrapper from 'slots/Cards/CardWrapper'
import { Link, useNavigate } from 'react-router-dom'
import { SET_PAGE_TITLE } from 'helpers/Base'
import { HTTP_CLIENT } from 'helpers/Api'
import { APIFY } from 'helpers/Api'
import { GET_QUERY } from 'helpers/Base'
import { ArgonSnackbar } from 'components/ArgonTheme'
import ShowUser from './ShowUser'

const CommitteeMember = () => {
  const navigate = useNavigate()

  const [selected, setSelected] = useState({})
  const [addedMembers, setAddedMembers] = useState({})
  const [PrevChairman, setPrevChairman] = useState({ value: '', label: '' })
  const [SelectedChairman, setSelectedChairman] = useState({ value: '', label: '' })
  const committeeMeetingUUID = GET_QUERY('uuid')

  const [UserData, setUserData] = useState([])
  const [isSnackbarOpen, setIsSnackbarOpen] = useState({ open: false, result: '', title: '' })
  const [SelectedCommitteeType, setSelectedCommitteeType] = useState({})
  const [SelectedCommitteeCategory, setSelectedCommitteeCategory] = useState({})
  const [SelectedMeeting, setSelectedMeeting] = useState({})

  const onCloseSnackbar = () => {
    setIsSnackbarOpen({ open: false, result: '', title: '' })
  }

  const addMemberToList = () => {
    if (selected) {
      addedMembers[selected.uuid] = selected
      createAttendanceConf()
    }
    setSelected({})
  }
  const fetchData = () => {
    HTTP_CLIENT(APIFY('/v1/roles/view_users'), { role: 'Committee Member' }).then((data) => {
      const users = data.role.users

      let temp = [...users]

      temp = temp.map((val) => {
        return { ...val, label: val.full_name + ' (' + val.employee_code + ')', value: val.uuid }
      })

      setUserData([...temp])
    })
  }

  const fetchAttendanceConf = async () => {
    HTTP_CLIENT(APIFY('/v1/rating_committee_meetings/view_members'), {
      params: {
        rating_committee_meeting_uuid: committeeMeetingUUID,
        is_active: true,
      },
    }).then((response) => {
      if (response['success']) {
        const { members } = response
        let data = members

        let obj = {}
        for (let i = 0; i < data.length; i++) {
          data[i].label = data[i].full_name
          data[i].value = data[i].uuid
          obj[data[i].uuid] = data[i]
        }

        setAddedMembers({ ...obj })
      }
    })
  }

  const createAttendanceConf = async () => {
    let params = {
      member_uuid: selected.uuid,
      is_chairman: false,
      rating_committee_meeting_uuid: committeeMeetingUUID,
      is_active: true,
    }

    HTTP_CLIENT(APIFY('/v1/rating_committee_meetings/add_member'), {
      params,
    })
      .then((response) => {
        if (response['success'] == true) {
          fetchAttendanceConf()
          setIsSnackbarOpen({ open: true, result: 'success', title: 'Member added successfully' })
        }
      })
      .catch((err) => {
        setIsSnackbarOpen({ open: true, result: 'error', title: 'Unable to add member' })
      })
  }

  const deleteAttendanceConf = async (member) => {
    HTTP_CLIENT(APIFY('/v1/rating_committee_meetings/delete_member'), {
      params: {
        member_uuid: member,
        is_chairman: false,
        is_active: false,
        rating_committee_meeting_uuid: committeeMeetingUUID,
      },
    }).then((response) => {
      if (response['success']) {
        fetchAttendanceConf()

        setIsSnackbarOpen({ open: true, result: 'success', title: 'Member deleted successfully' })
      }
    })
  }

  const EditAttendanceConf = async () => {
    HTTP_CLIENT(APIFY('/v1/rating_committee_meetings/delete_member'), {
      params: {
        member_uuid: PrevChairman.uuid,
        rating_committee_meeting_uuid: committeeMeetingUUID,
        is_active: true,
        is_chairman: false,
      },
    })
      .then((response) => {
        if (response['success']) {
        }
      })
      .catch((err) => {
        setIsSnackbarOpen({ open: true, result: 'error', title: 'Error in appointing chairman' })
      })

    HTTP_CLIENT(APIFY('/v1/rating_committee_meetings/delete_member'), {
      params: {
        member_uuid: SelectedChairman.uuid,
        rating_committee_meeting_uuid: committeeMeetingUUID,
        is_active: true,
        is_chairman: true,
      },
    })
      .then((response) => {
        if (response['success']) {
          setIsSnackbarOpen({ open: true, result: 'success', title: 'Chairman appointed successfully' })
          fetchAttendanceConf()
        }
      })
      .catch((err) => {
        setIsSnackbarOpen({ open: true, result: 'error', title: 'Error in appointing chairman' })
      })
  }

  const getMeetingInfo = () => {
    HTTP_CLIENT(APIFY('/v1/rating_committee_meetings/view'), {
      params: {
        uuid: committeeMeetingUUID,
      },
    })
      .then((data) => {
        if (data['success']) {
          const { rating_committee_meeting } = data

          setSelectedCommitteeCategory({
            value: rating_committee_meeting.rating_committee_meeting_category.uuid,
            label: rating_committee_meeting.rating_committee_meeting_category.name,
          })

          setSelectedCommitteeType({
            value: rating_committee_meeting.rating_committee_type.uuid,
            label: rating_committee_meeting.rating_committee_type.name,
          })

          let time = new Date()
          time.setHours(Number(rating_committee_meeting.meeting_at.substr(11, 2)))
          time.setMinutes(Number(rating_committee_meeting.meeting_at.substr(14, 2)))

          setSelectedMeeting({
            ...rating_committee_meeting,
            value: rating_committee_meeting.uuid,
            label: `${rating_committee_meeting.meeting_at.substr(0, 10)} ${time.toLocaleString('en-US', {
              hour: 'numeric',
              minute: 'numeric',
              hour12: true,
            })} `,
          })
        }
      })
      .catch((err) => {})
  }
  function refreshChairman() {
    Object.keys(addedMembers)?.map((member) => {
      if (addedMembers[member].is_chairman == true) {
        setPrevChairman({ ...addedMembers[member] })
        setSelectedChairman({ ...addedMembers[member] })
      }
    })
  }

  useEffect(() => {
    fetchData()
    fetchAttendanceConf()
    getMeetingInfo()
    SET_PAGE_TITLE('Committee Attendance')
    refreshChairman()
  }, [])
  useEffect(() => {
    refreshChairman()
  }, [addedMembers])

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
          headerTitle="Committee Attendance"
          headerActionButton={() => {
            return (
              <>
                <Link to="/dashboard/rating-committee/meetings">
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
                  >
                    Back
                  </Button>
                </Link>
              </>
            )
          }}
        >
          <Box
            sx={{
              paddingLeft: '15px',
            }}
          >
            <Box sx={{ display: 'flex', margin: '20px 0px ' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',

                  width: 'calc(100% - 40%)',
                  fontSize: '14px',
                  width: '400px',
                  marginRight: '200px',
                }}
              >
                <label style={{ marginRight: '30px' }}>Committee/Category:</label>

                <label>
                  {SelectedCommitteeType?.label}/{SelectedCommitteeCategory?.label}
                </label>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',

                  width: 'calc(100% - 40%)',
                  fontSize: '14px',
                  width: '400px',
                }}
              >
                <label style={{ marginRight: '30px' }}>Meeting Date and Time:</label>

                <label>{SelectedMeeting?.label}</label>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography sx={{ fontSize: '14px', margin: '15px 30px 20px 0px' }}>Add Members:</Typography>

              <Autocomplete
                disableClearable
                sx={{ width: 320 }}
                value={selected?.label}
                options={[...UserData].filter((val) => {
                  if (val) return !Object.keys(addedMembers).includes(val.uuid)
                })}
                onChange={(e, value) => setSelected(value)}
                renderInput={(params) => {
                  return <TextField multiline rows={1} {...params} variant="outlined" />
                }}
              />
              
              <Button
                disabled={selected?.label ? false : true}
                sx={{
                  'backgroundColor': '#3c5cd2',
                  'color': '#ffffff',
                  'display': 'flex',
                  'alignItems': 'center',
                  'ml': '0.8rem',
                  'borderRadius': '0.25rem',
                  'padding': '0.6rem 0.6rem',
                  '&:hover': {
                    backgroundColor: '#3c5cd2',
                    color: '#ffffff',
                  },
                }}
                onClick={() => {
                  addMemberToList();
                

                }}
              >
                <AddIcon sx={{ stroke: 'white', strokeWidth: '2.5' }} />
              </Button>
            </Box>
          </Box>

          <Box px="0.8rem">
            <Typography mb="0.6rem" sx={{ fontSize: '14px', mt: '20px' }}>
              Committee Members
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                border: '1px solid',
                borderColor: '#C9CBCE',
                borderRadius: '1rem',
                p: '0.6rem',
                minHeight: '50px',
              }}
            >
              <ShowUser
                addedMembers={addedMembers}
                setAddedMembers={setAddedMembers}
                deleteAttendanceConf={deleteAttendanceConf}
              
              />
            </Box>
            <Box sx={{ display: 'flex', marginTop: '20px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '14px', margin: '15px 45px 20px 0px' }}>Chairman:</Typography>

                <Autocomplete
                  id="tags-standard"
                  value={SelectedChairman.label ? SelectedChairman : null}
                  options={Object.keys({ ...addedMembers }).map((key) => addedMembers[key])}
                  onChange={(e, value) => {
                    setSelectedChairman({ ...value })
                  }}
                  renderInput={(params) => {
                    return <TextField {...params} variant="outlined" />
                  }}
                />
                <Button on
                  variant="contained"
                  color="primary"
                  sx={{
                    'width': '80px',
                    'height': '40px',
                    'backgroundColor': '#3c5cd2',
                    'color': '#ffffff',
                    'ml': '1.4rem',
                    'display': 'flex',
                    'alignItems': 'center',
                    '&:hover': {
                      backgroundColor: '#3c5cd2',
                      color: '#ffffff',
                    },
                  }}
                  onClick={() => {
                    EditAttendanceConf()

                    // setTimeout(() => {
                    //   navigate('/dashboard/rating-committee/meetings')
                    // }, 2500)
                  }}
                >
                  Select
                </Button>
              </Box>
            </Box>
          </Box>
        </CardWrapper>
      </DashboardLayout>
    </>
  )
}

export default CommitteeMember
