import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Grid, IconButton, Modal } from '@mui/material'
import { DashboardLayout } from 'layouts'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import React, { useEffect, useState } from 'react'
import CardWrapper from 'slots/Cards/CardWrapper'

import SendIcon from '@mui/icons-material/Send'

import CollapseTable from './CollapseTable'
import colors from 'assets/theme/base/colors'

import PropTypes from 'prop-types'
import { HTTP_CLIENT } from 'helpers/Api'
import { APIFY } from 'helpers/Api'
import { GET_QUERY } from 'helpers/Base'
import { GET_USER_PROPS } from 'helpers/Base'
import { GET_DATA } from 'helpers/Base'
import { useNavigate } from 'react-router-dom'
import VotingTable from './VotingTable'
import ViewVotesTable from './ViewVotesTable'
import { ArgonSnackbar } from 'components/ArgonTheme'

const style = {
  position: 'absolute',
  top: '20%',
  left: '90%',
  transform: 'translate(-50%, -50%)',
  width: 180,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 2,
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
}
function VotingForm({
  closeVotingForm,
  SelectedVotingData,
  setSelectedVotingData,
  VotingList,
  ClickedCompany,
  // setIsSnackbarOpen,
  Editable,
  setEditable,
  ChairMan,
  setChairMan,
  AddedMembers,
  fetchVotingCompanies,
}) {
  const [isSnackbarOpen, setIsSnackbarOpen] = useState({ open: false, result: '', title: '' })
  const onCloseSnackbar = () => {
    setIsSnackbarOpen({ open: false, result: '', title: '' })
  }
  const [meetingData, setMeetingData] = useState({})
  const [Active, setActive] = useState(0)
  const [GhRaList, setGhRaList] = useState({ gh: '', ra: '' })
  const [open, setOpen] = React.useState(false)
  const navigate = useNavigate()
  const handleClose = () => setOpen(false)
  const [ClickedMember, setClickedMember] = useState({})
  const [committee_registers, setCommittee_registers] = React.useState({})
  const [Rows, setRows] = useState([])
  const [newRows, setNewRows] = useState([])
  const [AgreeRemark, setAgreeRemark] = useState('')
  const [DisagreeRemark, setDisagreeRemark] = useState('')
  const [DissentRemark, setDissentRemark] = useState('')
  const handleOpen = () => {
    setOpen(true)
  }
  const committeeMeetingUUID = GET_QUERY('uuid')
  const role_uuid = GET_USER_PROPS('uuid', 'active_role')
  const user = GET_DATA('user')

  const showMemVotes = (ClickedMemberID) => {
    
      console.log(ClickedMemberID, 'calledmemvote1')
      // if (newRows.length) {
      let MemVotes = [...newRows].filter((val) => {
        if (val.member.uuid === ClickedMemberID) {
          return val
        }
      })
      console.log(MemVotes, 'calledmemvote2')
      if (MemVotes.length > 0) {
        for (let i = 0; i < Rows.length; i++) {
          let MemInsVote = MemVotes.find((val) => {
            return val.instrument_detail.uuid === Rows[i].instrument_detail_uuid
          })
          console.log(MemInsVote, 'called2')
          // console.log(Rows[i], 'check1')
          Rows[i] = {
            ...Rows[i],
            voted_rating: MemInsVote?.voted_rating,
            voted_outlook: MemInsVote?.voted_outlook,
            remarks: MemInsVote?.remarks,
            dissent_remark: MemInsVote?.dissent_remark,
            dissent: MemInsVote?.dissent,
            display_assigned_rating: Rows[i].rating_committee_voting_uuid
              ? Rows[i].is_long_term && Rows[i].is_short_term
                ? `${Rows[i]?.voted_rating?.split('/')[0]}(${Rows[i].voted_outlook})/${Rows[i]?.voted_rating?.split('/')[1]}`
                : Rows[i].is_long_term
                ? `${Rows[i].voted_rating}(${Rows[i].voted_outlook})`
                : `${Rows[i].voted_rating}`
              : Rows[i].display_proposed_rating,
          }
          // console.log(Rows[i], 'check2')
          setRows([...Rows])
        }
      } else {
        Rows.map((val) => {
          val.voted_rating = 'Not Voted'
          val.voted_outlook = 'Not Voted'
          val.remarks = 'Not Voted'
          val.dissent_remarks = 'Not Voted'
          val.dissent = 'Not Voted'
          val.display_assigned_rating = 'Not Voted'
        })

        setRows([...Rows])
      }
    
  }
  const getMeetingData = () => {
    HTTP_CLIENT(APIFY('/v1/rating_committee_meetings/view'), { params: { uuid: committeeMeetingUUID, is_active: true } })
      .then((data) => {
        if (data['success']) {
          const { rating_committee_meeting } = data

          setSelectedVotingData({ ...rating_committee_meeting })
        }
      })
      .catch((err) => {})
  }

  // const fetchMemberVote = async () => {
  //   HTTP_CLIENT(APIFY('/v1/rating_committee_voting/view'), {
  //     params: { rating_committee_meeting_uuid: committeeMeetingUUID },
  //   })
  //     .then((response) => {
  //       if (response['success']) {
  //         const { rating_committee_voting } = response
  //         if(rating_committee_voting)
  //         setVoted(true)

  //       }
  //     })
  //     .catch((err) => {})
  // }

  const getVotingData = (ratingProcessUuid) => {
    HTTP_CLIENT(APIFY('/v1/chairman/view_votes'), {
      params: {
        rating_committee_meeting_uuid: committeeMeetingUUID,
        company_uuid: ClickedCompany.company_uuid,
        rating_process_uuid: ratingProcessUuid,
      },
    })
      .then((data) => {
        if (data['success']) {
          const { rating_committee_voting } = data
          setNewRows(rating_committee_voting)
        }
      })
      .catch((err) => {})
  }
  const fetchMandateData = async () => {
    return HTTP_CLIENT(APIFY('/v1/voting/companies'), {
      params: { company_uuid: ClickedCompany.company_uuid, rating_committee_meeting_uuid: GET_QUERY('uuid') },
    }).then((response) => {
      if (response['success']) {
        let voting_instruments = response['committee_registers']
        voting_instruments = voting_instruments.map((val) => {
          !DissentRemark && val.dissent && val.dissent_remarks && setDissentRemark(val.dissent_remarks)
          let myObj = {}
          myObj.display_proposed_rating =
            val.is_long_term && val.is_short_term
              ? `${val.long_term_rating_recommendation}(${val.long_term_outlook_recommendation})/${val.short_term_rating_recommendation}`
              : val.is_long_term
              ? `${val.long_term_rating_recommendation}(${val.long_term_outlook_recommendation})`
              : `${val.short_term_rating_recommendation}`
          myObj.voted_rating = !val.rating_committee_voting_uuid
            ? val.is_long_term
              ? val.is_short_term
                ? `${val.long_term_rating_recommendation}/${val.short_term_rating_recommendation}`
                : `${val.long_term_rating_recommendation}`
              : `${val.short_term_rating_recommendation}`
            : val.voted_rating

          myObj.voted_outlook = !val.rating_committee_voting_uuid
            ? val.is_long_term
              ? `${val.long_term_outlook_recommendation}`
              : ''
            : val.voted_outlook
          myObj.display_assigned_rating = val.rating_committee_voting_uuid
            ? val.is_long_term && val.is_short_term
              ? `${val?.voted_rating?.split('/')[0]}(${val?.voted_outlook})/${val?.voted_rating?.split('/')[1]}`
              : val.is_long_term
              ? `${val?.voted_rating}(${val?.voted_outlook})`
              : `${val?.voted_rating}`
            : myObj.display_proposed_rating

          myObj.display_final_rating = val.final_rating
            ? val.is_long_term && val.is_short_term
              ? `${val?.final_rating?.split('/')[0]}(${val?.final_outlook})/${val?.final_rating?.split('/')[1]}`
              : val.is_long_term
              ? `${val?.final_rating}(${val?.final_outlook})`
              : `${val?.final_rating}`
            : ''

          !AgreeRemark &&
            myObj.display_proposed_rating === myObj.display_assigned_rating &&
            val?.remarks &&
            setAgreeRemark(val.remarks)
          !DisagreeRemark &&
            myObj.display_proposed_rating !== myObj.display_assigned_rating &&
            val.remarks &&
            setDisagreeRemark(val.remarks)
          return {
            ...val,
            ...myObj,
          }
        })
        setRows(voting_instruments)

        if (ChairMan === user.uuid && voting_instruments.length) getVotingData(voting_instruments[0].rating_process_uuid)
        let gh_list = []
        let ra_list = []
        voting_instruments.map((val) => {
          if (gh_list.findIndex((el) => el == val['gh_name']) < 0) gh_list.push(val['gh_name'])
          if (ra_list.findIndex((el) => el == val['ra_name']) < 0) ra_list.push(val['ra_name'])
        })
        gh_list = gh_list.toString()
        ra_list = ra_list.toString()

        let myObj = { gh: gh_list, ra: ra_list }

        setGhRaList(myObj)
      }
    })
  }
  const createVoting = (params) => {
    let myPromise = params.rating_committee_voting_uuid
      ? HTTP_CLIENT(APIFY('/v1/rating_committee_voting/edit'), {
          params: {
            uuid: params.rating_committee_voting_uuid,
            instrument_detail_uuid: params.instrument_detail_uuid,
            rating_committee_type_uuid: SelectedVotingData.rating_committee_type?.uuid,
            rating_committee_meeting_uuid: committeeMeetingUUID,
            voted_rating: params.voted_rating,
            remarks: params.remarks,
            dissent: params.dissent,
            dissent_remarks: DissentRemark,
            voted_outlook: params.voted_outlook,
            is_chairman: ChairMan === user.uuid,
          },
        })
          .then((response) => {
            if (response['success']) {
              setIsSnackbarOpen({ open: true, result: 'success', title: 'Vote changed successfully' })
            }
          })
          .catch((error) => {
            setIsSnackbarOpen({ open: true, result: 'error', title: 'Unable to change vote' })
          })
      : HTTP_CLIENT(APIFY('/v1/rating_committee_voting/create'), {
          params: {
            transaction_instrument_uuid: params.transaction_instrument_uuid,
            instrument_detail_uuid: params.instrument_detail_uuid,
            rating_committee_type_uuid: SelectedVotingData.rating_committee_type?.uuid,
            rating_committee_meeting_category_uuid: SelectedVotingData.rating_committee_meeting_category?.uuid,
            rating_committee_meeting_uuid: committeeMeetingUUID,
            voted_rating: params.voted_rating,
            remarks: params.remarks,
            dissent: params.dissent,
            dissent_remarks: params.dissent_remarks,
            voted_outlook: params.voted_outlook,
            is_chairman: ChairMan === user.uuid,
          },
        })
          .then((response) => {
            if (response['success']) {
              setIsSnackbarOpen({ open: true, result: 'success', title: 'Vote submitted successfully' })
            }
          })
          .catch((error) => {
            setIsSnackbarOpen({ open: true, result: 'error', title: 'Unable to submit vote' })
          })
    return myPromise
  }

  const ChairmanAction = (mandates, code, ratingProcessUuid) => {
    // 10500 mark as given
    if (code == '10500') {
      // Check dissent if mark as rating given clicked
      HTTP_CLIENT(APIFY('/v1/dissent_members'), {
        params: {
          rating_committee_meeting_uuid: GET_QUERY('uuid'),
          company_uuid: ClickedCompany.company_uuid,
        },
      })
        .then((data) => {
          if (data['success']) {
            const { dissent_members, has_voted } = data
            // if all members have not voted, cannot be marked
            if (!has_voted) alert('All members have not submitted vote yet')
            // all voted and no dissent then forward
            else if (dissent_members.length == 0) assignToUser(mandates, code, ratingProcessUuid)
            // if member dissent, calculate without remark
            else if (dissent_members.length > 0) {
              let pendingVotes = dissent_members.map((val) => {
                if (val.dissent && val.dissent_remark == null) {
                  return val
                }
              })
              // more than 0 pending remark
              let message = ''
              if (pendingVotes.length > 0) {
                pendingVotes.map((val) => {
                  message += `${val.full_name}(${val.employee_code}), `
                })

                alert(`${message} need to fill dissent remark before forwarding rating for GH verfication`)
              }

              //  0 pending remark
              else assignToUser(mandates, code, ratingProcessUuid)
            }
          }
        })
        .catch((err) => {
          console.log(err)
        })
    }
    // 10550 send back
    else assignToUser(mandates, code, ratingProcessUuid)
  }

  const assignToUser = (mandates, code, ratingProcessUuid) => {
    HTTP_CLIENT(APIFY('/v1/inbox/execution/assign_to_user'), {
      params: {
        mandate_id: [...mandates],
        user_uuid: null,
        code: code,
        rating_process_uuid: ratingProcessUuid,
      },
    })
      .then((data) => {
        if (data['success']) {
          setIsSnackbarOpen({ open: true, result: 'success', title: 'Action performed successfully' })
          fetchVotingCompanies()
        } else {
          setIsSnackbarOpen({ open: true, result: 'error', title: 'Unable to perform this action' })
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }

  useEffect(() => {
    getMeetingData()
    let initClickedMemUuid = Object.keys(AddedMembers).find((key) => {
      if (AddedMembers[key].uuid === GET_DATA('user').uuid) {
        setActive(key)
        return AddedMembers[key].uuid === GET_DATA('user').uuid
      }
    })
    setClickedMember(AddedMembers[initClickedMemUuid])
    fetchMandateData()
    ClickedCompany.voting_status!=="Live" && setEditable(false)
    console.log(ClickedCompany, 'ClickedCompany')
  }, [])

  return (
    <div>
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          {Editable && (
            <div
              disabled
              style={{ cursor: 'pointer' }}
              onClick={async () => {
                console.log(Rows)

                if (
                  (Rows.findIndex((val) => val.display_proposed_rating === val.display_assigned_rating) >= 0 &&
                    !AgreeRemark) ||
                  (Rows.findIndex((val) => val.display_proposed_rating !== val.display_assigned_rating) >= 0 &&
                    !DisagreeRemark)
                ) {
                  alert('Kindly provide remarks for Agree/Disagree by clicking on radio buttons ')
                  handleClose()
                  return
                } else if (Rows.findIndex((val) => val.dissent == true) >= 0 && !DissentRemark) {
                  alert('Remarks for dissent are mandatory')
                  handleClose()
                  return
                } else {
                  Rows.map(async (params, idx) => {
                    await createVoting(params)
                    idx === Rows.length - 1 && (await fetchMandateData())
                  })
                  handleClose()
                }
              }}
            >
              Submit my Vote
            </div>
          )}

          {ChairMan === user.uuid && (
            <>
              <div
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  let mandates = new Set()
                  ;[...Rows].map((params) => {
                    // createVoting(params)
                    // resaving chairman votes
                    mandates.add(params.mandate_id) // Assigning mandate Ids to GH
                  })

                  const mandatesArr = Array.from(mandates)
                  let ratingProcessUuid = Rows[0].rating_process_uuid
                  ChairmanAction(mandatesArr, '10500', ratingProcessUuid)
                  handleClose()
                  fetchMandateData()
                }}
              >
                Mark as rating given
              </div>
              <div
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  let mandates = new Set()
                  ;[...Rows].map((params) => {
                    mandates.add(val.mandate_id)
                  })

                  const mandatesArr = Array.from(mandates)
                  let ratingProcessUuid = Rows[0].rating_process_uuid
                  ChairmanAction(mandatesArr, '10550', ratingProcessUuid)
                }}
              >
                Send back as deffered
              </div>
            </>
          )}
        </Box>
      </Modal>
      <DashboardLayout>
        <CardWrapper
          headerTitle="Committee Voting"
          headerActionButton={() => {
            return (
              <div style={{ display: 'flex'}}>
                <Button
                  sx={{
                    'color': 'white !important',
                    'background': colors.primary.main,
                    'height': '40px',
                    'fontWeight': 'normal !important',
                    'px': 3,
                    'fontWeight': 'bold',

                    '&:hover': {
                      color: 'white !important',
                      background: colors.primary.main,
                    },
                  }}
                  onClick={() => {
                    closeVotingForm()
                    setEditable(true)
                  }}
                >
                  {'Back'}
                </Button>
                {ClickedCompany.voting_status === 'Live' &&
                <IconButton
                  sx={{
                    'color': 'white !important',
                    'background': colors.primary.main,
                    'height': '40px',
                    'borderRadius': '5px',
                    'p': 2,
                    'ml':2,
                    '&:hover': {
                      color: 'white !important',
                      background: colors.primary.main,
                    },
                  }}
                  
                  onClick={handleOpen}
                >
                  
                  <SendIcon size="large" />
                </IconButton>}
              </div>
            )
          }}
        >
          <div style={{ padding: '20px', fontSize: '14px' }}>
            <Grid container xs={12}>
              <Grid container xs={12} md={6}>
                <Grid container xs={12} md={12} lg={8} spacing={1}>
                  <Grid item sm={6} md={6} lg={5}>
                    <label style={{ color: 'grey', fontWeight: 'bold' }}>Committee/Category:</label>
                  </Grid>
                  <Grid item sm={6} md={6} lg={5}>
                    <label>
                      {SelectedVotingData.rating_committee_type?.name}/
                      {SelectedVotingData.rating_committee_meeting_category?.name}
                    </label>
                  </Grid>
                </Grid>

                <Grid container xs={12} md={12} lg={4} spacing={1}>
                  <Grid item sm={6} md={6} lg={3}>
                    <label style={{ color: 'grey', fontWeight: 'bold' }}>Date:</label>
                  </Grid>
                  <Grid item sm={6} md={6} lg={5}>
                    <label>{SelectedVotingData?.meeting_at?.substr(0, 10)}</label>
                  </Grid>
                </Grid>
              </Grid>
              <Grid container xs={12} md={6}>
                <Grid container xs={5} md={5} lg={4} spacing={1}>
                  <Grid item sm={6} md={6} lg={3}>
                    <label style={{ color: 'grey', fontWeight: 'bold' }}>Time:</label>
                  </Grid>
                  <Grid item sm={6} md={6} lg={5}>
                    <label>{SelectedVotingData?.meeting_at?.substr(11, 5)}</label>
                  </Grid>
                </Grid>

                <Grid container xs={7} md={7} lg={7} spacing={2} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Grid item sm={6} md={6} lg={5}>
                    <label style={{ color: 'grey', fontWeight: 'bold' }}>Chairman Name:</label>
                  </Grid>
                  <Grid item sm={6} md={6} lg={5}>
                    {Object.keys({ ...AddedMembers }).map((key) => {
                      if (AddedMembers[key].is_chairman) return <label>{AddedMembers[key].full_name}</label>
                    })}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <h3 style={{ marginTop: '50px' }}>Committee Members</h3>
            <hr style={{ color: '#ccc', height: '2px', background: '#ccc', border: 'none' }} />
            <div style={{ display: 'flex' }}>
              {Object.keys(AddedMembers).map((key) => {
                return (
                  <Button
                    id={key}
                    key={key}
                    disabled={user.uuid !== ChairMan}
                    onClick={(e) => {
                      setClickedMember(AddedMembers[key])
                      setActive(key)
                      if (
                        ClickedCompany.voting_status == 'Live' &&
                        AddedMembers[key].uuid == ChairMan &&
                        ChairMan == GET_DATA('user').uuid
                      )
                        setEditable(true)
                      else {
                        user.uuid !== setEditable(false)
                        showMemVotes(AddedMembers[key].uuid)
                      }
                    }}
                    sx={{
                      'cursor': 'pointer',
                      'backgroundColor': Active === key ? colors.dark.main : colors.light.main,
                      'color': Active === key ? 'white !important' : '#344767 !important',
                      'fontWeight': '700',
                      'fontSize': '13px',
                      'width': '200px !important',
                      'height': '38px',
                      'display': 'flex',
                      'alignItems': 'center',
                      'justifyContent': 'center',
                      'borderRadius': '5px',
                      'margin': '20px',
                      ':hover': {
                        backgroundColor: Active === key ? colors.dark.main : colors.light.main,
                        color: Active === key ? 'white !important' : '#344767 !important',
                      },
                    }}
                  >
                    {`${AddedMembers[key].full_name} (${AddedMembers[key].employee_code})`}
                  </Button>
                )
              })}
            </div>

            <div style={{ marginTop: '10px', marginBottom: '20px', display: 'flex' }}>
              <div style={{ display: 'flex', flex: '1', marginRight: 10 }}>
                <label style={{ color: 'grey', fontWeight: 'bold', marginRight: 5 }}>Company Name:</label>

                <label>{ClickedCompany?.company_name}</label>
              </div>
              <div style={{ display: 'flex', flex: '1', marginRight: 10 }}>
                <label style={{ color: 'grey', fontWeight: 'bold', marginRight: 5 }}>Group Head:</label>

                <label>{GhRaList?.gh}</label>
              </div>
              <div style={{ display: 'flex', flex: '1', marginRight: 10 }}>
                <label style={{ color: 'grey', fontWeight: 'bold', marginRight: 5 }}>Rating Analyst:</label>

                <label>{GhRaList?.ra}</label>
              </div>
            </div>

            <Box>
              {/* <CollapseTable
                Editable={Editable}
                ClickedCompany={ClickedCompany}
                mandate_uuid={SelectedVotingData?.mandate?.uuid}
                SelectedVotingData={SelectedVotingData}
                committee_registers={committee_registers}
                setCommittee_registers={setCommittee_registers}
                ClickedMember={ClickedMember}
              /> */}
              {Editable ? (
                <VotingTable
                  setGhRaList={setGhRaList}
                  Editable={Editable}
                  AgreeRemark={AgreeRemark}
                  DisagreeRemark={DisagreeRemark}
                  DissentRemark={DissentRemark}
                  setAgreeRemark={setAgreeRemark}
                  setDisagreeRemark={setDisagreeRemark}
                  setDissentRemark={setDissentRemark}
                  ClickedCompany={ClickedCompany}
                  mandate_uuid={SelectedVotingData?.mandate?.uuid}
                  SelectedVotingData={SelectedVotingData}
                  committee_registers={committee_registers}
                  setCommittee_registers={setCommittee_registers}
                  ClickedMember={ClickedMember}
                  Rows={Rows}
                  setRows={setRows}
                ></VotingTable>
              ) : (
                <ViewVotesTable
                  setGhRaList={setGhRaList}
                  Editable={Editable}
                  ClickedCompany={ClickedCompany}
                  mandate_uuid={SelectedVotingData?.mandate?.uuid}
                  SelectedVotingData={SelectedVotingData}
                  committee_registers={committee_registers}
                  setCommittee_registers={setCommittee_registers}
                  ClickedMember={ClickedMember}
                  Rows={Rows}
                  setRows={setRows}
                ></ViewVotesTable>
              )}

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
            </Box>
          </div>
        </CardWrapper>
      </DashboardLayout>
    </div>
  )
}
VotingForm.propTypes = {
  closeVotingForm: PropTypes.any,
  SelectedVotingData: PropTypes.object,
  setSelectedVotingData: PropTypes.func,
  VotingList: PropTypes.arrayOf(PropTypes.object),
  ClickedCompany: PropTypes.object,
  // setIsSnackbarOpen: PropTypes.func,
  Editable: PropTypes.bool,
  setEditable: PropTypes.func,
  ChairMan: PropTypes.string,
  setChairMan: PropTypes.func,
  AddedMembers: PropTypes.object,
  setAddedMembers: PropTypes.func,
  fetchVotingCompanies: PropTypes.func,
}

export default VotingForm
