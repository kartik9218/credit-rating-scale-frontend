import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Chip, Grid } from '@mui/material'
import Tooltip from '@mui/material/Tooltip'
import { DashboardLayout } from 'layouts'
import React, { useEffect, useState } from 'react'
import CardWrapper from 'slots/Cards/CardWrapper'

import Table from './StartVoting/Table'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import VotingForm from './VotingForm'
import { SET_PAGE_TITLE } from 'helpers/Base'
import { APIFY } from 'helpers/Api'
import { HTTP_CLIENT } from 'helpers/Api'
import { GET_QUERY } from 'helpers/Base'
import { ArgonSnackbar } from 'components/ArgonTheme'
import { GET_DATA } from 'helpers/Base'
import { Link } from 'react-router-dom'

function CommitteeVoting() {
  const user = GET_DATA('user')
  const [Editable, setEditable] = useState(true)
  const [AddedMembers, setAddedMembers] = useState({})
  const [Active, setActive] = useState(true)
  const [FilterMeetingOptions, setFilterMeetingOptions] = useState([])
  const [MeetingOptions, setMeetingOptions] = useState([])
  const [committeeTypeOptions, setCommitteeTypeOptions] = useState([])
  const [committeeCategories, setCommitteeCategories] = useState([])
  const [SelectedCommitteeType, setSelectedCommitteeType] = useState('')
  const [SelectedCommitteeCategory, setSelectedCommitteeCategory] = useState('')
  const [SelectedMeeting, setSelectedMeeting] = useState('')
  const [SelectedIDs, setSelectedIDs] = useState([])
  const [ClickedCompany, setClickedCompany] = useState({})
  const [SelectedVotingData, setSelectedVotingData] = useState({})
  const [VotingList, setVotingList] = useState([])
  const committeeMeetingUUID = GET_QUERY('uuid')
  const [isSnackbarOpen, setIsSnackbarOpen] = useState({ open: false, result: '', title: '' })
  const [ChairMan, setChairMan] = useState('')
  const active_role = GET_DATA('active_role')
  const [ThisMemberVote, setThisMemberVote] = useState([])

  const onCloseSnackbar = () => {
    setIsSnackbarOpen({ open: false, result: '', title: '' })
  }
  const fetchRatingCommitteeTypes = async () => {
    HTTP_CLIENT(APIFY('/v1/rating_committee_types'), { params: { is_active: true } }).then((response) => {
      const rating_committee_types = response['rating_committees']
      let temp = []
      temp.push(
        rating_committee_types.map((val) => {
          return {
            label: val?.name,
            value: val.uuid,
          }
        }),
      )
      setCommitteeTypeOptions(...temp)
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
  const getMeetingMembers = () => {
    HTTP_CLIENT(APIFY('/v1/rating_committee_meetings/view_members'), {
      params: {
        rating_committee_meeting_uuid: committeeMeetingUUID,
      },
    })
      .then((data) => {
        if (data['success']) {
          const { members } = data
          let obj = {}
          for (let i = 0; i < members.length; i++) {
            members[i].label = members[i].full_name
            members[i].value = members[i].uuid
            obj[members[i].uuid] = members[i]
          }

          let chMan = Object.keys({ ...obj }).filter((key) => {
            if (obj[key].is_chairman) return true
          })
          if (chMan.length > 0) {
            setChairMan(chMan[0])
          }

          setAddedMembers({ ...obj })
        }
      })
      .catch((err) => {})
  }
  const getMeetings = () => {
    HTTP_CLIENT(APIFY('/v1/rating_committee_meetings'), { params: { is_active: true } })
      .then((data) => {
        const { rating_committee_meetings } = data
        let temp = []
        temp = rating_committee_meetings.map((val) => {
          let time = new Date()

          time.setHours(Number(val.meeting_at.substr(11, 2)))
          time.setMinutes(Number(val.meeting_at.substr(14, 2)))

          return {
            ...val,
            value: val.uuid,
            label: `${val.meeting_at.substr(0, 10)} ${time.toLocaleString('en-US', {
              hour: 'numeric',
              minute: 'numeric',
              hour12: true,
            })} `,
          }
        })
        setMeetingOptions([...temp])
      })
      .catch((err) => {})
  }

  const fetchVotingCompanies = async (rcm_id) => {
    HTTP_CLIENT(APIFY('/v1/member/meeting/voting_list'), {
      params: { member_uuid: user.uuid, rating_committee_meeting_uuid: rcm_id || committeeMeetingUUID },
    }).then((response) => {
      if (response['success']) {
        const voting_list = response['voting_list']
        if (voting_list[0] == null) setVotingList([])
        else {
          setVotingList([...voting_list])
        }
      }
    })
  }
  const fetchRatingCommitteeCategories = async () => {
    HTTP_CLIENT(APIFY('/v1/rating_committee_meeting_categories'), {
      params: { is_active: true },
    })
      .then((response) => {
        const rating_committee_meeting_categories = response['rating_committee_meeting_categories']
        let temp = []
        temp.push(
          rating_committee_meeting_categories.map((val) => {
            return {
              label: val?.name,
              value: val.uuid,
            }
          }),
        )
        setCommitteeCategories(...temp)
      })
      .catch((err) => {})
  }

  useEffect(() => {
    fetchRatingCommitteeTypes()
    fetchRatingCommitteeCategories()
    getMeetings()
    getMeetingInfo()
    getMeetingMembers()

    SET_PAGE_TITLE('Committee Voting')
  }, [])
  useEffect(() => {
    setFilterMeetingOptions(
      [...MeetingOptions]?.filter((val) => {
        if (
          SelectedCommitteeCategory?.label == val.rating_committee_meeting_category?.name &&
          SelectedCommitteeType?.label == val.rating_committee_type?.name
        ) {
          return val
        }
      }),
    )
  }, [SelectedCommitteeCategory, SelectedCommitteeType])

  return (
    <>
      {Active ? (
        <div style={{ minHeight: 'fit-content' }}>
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
              headerTitle="Committee Voting"
              headerActionButton={() => {
                return (
                  <>
                    {SelectedMeeting?.status && (
                      <Grid container xs={12} md={12} lg={7} sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
                        <Grid item sm={6} md={6}>
                          <label style={{ fontSize: '15px' }}>Meeting Status:</label>
                        </Grid>

                        <Grid item sm={6} md={5} sx={{ width: '2px !important',ml:1 }}>
                          <Tooltip title={SelectedMeeting?.status}>
                            <Chip
                              label={SelectedMeeting?.status}
                              variant="outlined"
                              sx={{
                                backgroundColor: '#435572 !important',
                                color: 'white !important',
                              }}
                            />
                          </Tooltip>
                        </Grid>
                      </Grid>
                    )}
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
              <div style={{ padding: '20px' }}>
                <div
                  style={{ display: 'flex', gap: '0px 100px', marginBottom: '25px' }}
                  className="MuiAutoCompleteCssAdjust"
                >
                  <Autocomplete
                    disableClearable
                    disabled={!(GET_DATA('active_role').name == 'Compliance' || GET_DATA('user').is_super_account)}
                    id="combo-box-demo"
                    value={SelectedCommitteeType}
                    options={committeeTypeOptions}
                    onChange={(e, val) => {
                      setSelectedCommitteeType(val)
                    }}
                    sx={{ width: 300 }}
                    renderInput={(params) => <TextField {...params} placeholder="Committee Type" />}
                  />
                  <Autocomplete
                    disableClearable
                    disabled={!(GET_DATA('active_role').name == 'Compliance' || GET_DATA('user').is_super_account)}
                    id="combo-box-demo"
                    value={SelectedCommitteeCategory}
                    options={committeeCategories}
                    onChange={(e, val) => {
                      setSelectedCommitteeCategory(val)
                    }}
                    sx={{ width: 300 }}
                    renderInput={(params) => <TextField {...params} placeholder="Committee Category" />}
                  />
                  <Autocomplete
                    disableClearable
                    disabled={!(GET_DATA('active_role').name == 'Compliance' || GET_DATA('user').is_super_account)}
                    value={SelectedMeeting}
                    id="combo-box-demo"
                    options={[...FilterMeetingOptions].sort((a, b) => new Date(b.label) - new Date(a.label))}
                    onChange={(e, value) => {
                      setSelectedMeeting(value)
                    }}
                    sx={{ width: 300 }}
                    renderInput={(params) => <TextField {...params} placeholder="Date & Time" />}
                  />
                </div>

                <Table
                  fetchVotingCompanies={fetchVotingCompanies}
                  openVotingForm={() => setActive(false)}
                  setVotingList={setVotingList}
                  VotingList={VotingList}
                  setClickedCompany={setClickedCompany}
                  ClickedCompany={ClickedCompany}
                  SelectedMeeting={SelectedMeeting}
                  setEditable={setEditable}
                  ChairMan={ChairMan}
                  setChairMan={setChairMan}
                  ThisMemberVote={ThisMemberVote}
                />
              </div>
            </CardWrapper>
          </DashboardLayout>
        </div>
      ) : (
        <VotingForm
          setIsSnackbarOpen={setIsSnackbarOpen}
          closeVotingForm={() => {
            setActive(true)
          }}
          setSelectedVotingData={setSelectedVotingData}
          SelectedVotingData={SelectedVotingData}
          VotingList={VotingList}
          ClickedCompany={ClickedCompany}
          Editable={Editable}
          setEditable={setEditable}
          ChairMan={ChairMan}
          setChairMan={setChairMan}
          AddedMembers={AddedMembers}
          setAddedMembers={setAddedMembers}
          ThisMemberVote={ThisMemberVote}
          fetchVotingCompanies={fetchVotingCompanies}
        />
      )}
    </>
  )
}

export default CommitteeVoting
