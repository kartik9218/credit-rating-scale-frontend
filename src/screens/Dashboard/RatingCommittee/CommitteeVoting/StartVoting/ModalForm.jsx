import React, { useEffect, useState } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material'
import { Box } from '@mui/system'
import PropTypes from 'prop-types'
import { HTTP_CLIENT } from 'helpers/Api'
import { APIFY } from 'helpers/Api'

const CreateMinutesModal = ({
  open,
  setOpen,
  data,
  committeeMeetingUUID,
  setSnackbarMessage,
  setSnackbarOpen,
  setResponse,
}) => {
  const [MemDiscussion, setMemDiscussion] = useState('')
  const [MemComments, setMemComments] = useState('')
  const [GhRaList, setGhRaList] = useState({ gh: '', ra: '' })
  const [chairman, setChairman] = useState('')
  console.log(committeeMeetingUUID, 'id')
  const handleCreateMinutes = (e) => {
    e.preventDefault()
    HTTP_CLIENT(APIFY('/v1/committee-minutes/create'), {
      params: {
        group_head:GhRaList.gh,
        rating_analyst:GhRaList.ra,
        discussion_paragraph: MemDiscussion,
        comments_paragraph: MemComments,
        rating_committee_meeting_uuid: committeeMeetingUUID,
      },
    })
      .then((data) => {
        if (data['success']) {
          handleShowSnackBar('success')('Minutes of meeting created successfully')
          setOpen(false)
        }
      })
      .catch((err) => {
        console.error(err, 'error')
        handleShowSnackBar('error')('Unable to create minutes for this meeting')
      })
  }
  // const getGHandRAdetails = async () => {
  //   HTTP_CLIENT(APIFY('/v1/voting/companies'), {
  //     params: {
  //       company_uuid: data.company_uuid,
  //       rating_committee_meeting_uuid: committeeMeetingUUID,
  //     },
  //   }).then((response) => {
  //     if (response['success']) {
  //       const { committee_registers } = response
  //       setGH_RAnames({
  //         RAName: committee_registers[0].ra_name,
  //         GHName: committee_registers[0].gh_name,
  //       })
  //     }
  //   })
  // }
  const getMeetingMembers = () => {
    HTTP_CLIENT(APIFY('/v1/rating_committee_meetings/view_members'), {
      params: {
        rating_committee_meeting_uuid: committeeMeetingUUID,
      },
    })
      .then((data) => {
        if (data['success']) {
          const { members } = data
         let chrman= members.find((val)=>val.is_chairman==true)
         setChairman(chrman.full_name)
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const handleShowSnackBar = (messageType) => (message) => {
    setSnackbarOpen(true)
    setResponse(messageType)
    setSnackbarMessage(message)
  }
  const getMinutes = () => {
    HTTP_CLIENT(APIFY('/v1/committee-minutes/view'), {
      params: {
        rating_committee_meeting_uuid: committeeMeetingUUID,
      },
    })
      .then((data) => {
        const { committee_minutes } = data
        console.log(committee_minutes)
        setMemDiscussion(committee_minutes.discussion_paragraph)
        setMemComments(committee_minutes.comments_paragraph)
      })
      .catch((err) => console.error(err))
  }
  const getGhRa = () => {
    HTTP_CLIENT(APIFY('/v1/gh_ra/view'), {
      params: {
        company_uuid: data.company_uuid,
      },
    })
      .then((data) => {
        const { gh_ra_list } = data
        let gh_list = []
        let ra_list = []
        gh_ra_list.map((val) => {
          if (gh_list.findIndex((el) => el == val['group_head']) < 0) gh_list.push(val['group_head'])

          if (ra_list.findIndex((el) => el == val['rating_analyst']) < 0) ra_list.push(val['rating_analyst'])
        })
        gh_list = gh_list.toString()
        ra_list = ra_list.toString()

        let myObj = { gh: gh_list, ra: ra_list }

        setGhRaList(myObj)
      })
      .catch((err) => console.error(err))
  }

  useEffect(() => {
    getMeetingMembers()
    getMinutes()
    getGhRa()

    // getGHandRAdetails()
  }, [])
  return (
    <>
      <Dialog
        fullWidth
        maxWidth="lg"
        sx={{
          'zIndex': '1600',
          '.css-366w5h-MuiPaper-root-MuiDialog-paper': {
            padding: '1rem',
          },
        }}
        open={open}
        onClose={() => setOpen(false)}
      >
        <form onSubmit={handleCreateMinutes}>
          <DialogTitle color="#344767">Create Minutes</DialogTitle>
          <DialogContent>
            <Box sx={{ color: '#343434' }}>
              <Box sx={{ width: '50%' }}>
                <Box
                  sx={{
                    display: 'flex',
                    color: '#344767',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                  }}
                >
                  <Typography sx={{ fontSize: '16px' }}>Name of Rated Entity - </Typography>
                  <Typography sx={{ width: '42%', fontSize: '16px' }}>{data?.company_name}</Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '14px',
                    }}
                  >
                    Chairman Name:
                  </Typography>
                  <TextField value={chairman} placeholder="" />
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    margin: '1.2rem 0',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '14px',
                    }}
                  >
                    Group Head:
                  </Typography>
                  <TextField value={GhRaList.gh} placeholder="" />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography
                    sx={{
                      fontSize: '14px',
                    }}
                  >
                    Rating Analyst:
                  </Typography>
                  <TextField value={GhRaList.ra} placeholder="" />
                </Box>
              </Box>
              <hr
                style={{
                  backgroundColor: '#ebebeb',
                  margin: '2rem 0',
                  border: 'none',
                  height: '1px',
                }}
              />
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Typography
                    sx={{
                      fontSize: '14px',
                    }}
                  >
                    Discussion by Members
                  </Typography>
                  <TextField
                    multiline
                    value={MemDiscussion}
                    rows={4}
                    sx={{
                      'width': '71% !important',
                      '&>div>textarea': {
                        paddingRight: '0px !important',
                        width: '100% !important',
                      },
                    }}
                    placeholder=""
                    fullWidth
                    onChange={(e, val) => {
                      setMemDiscussion(e.target.value)
                    }}
                    required
                  />
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    margin: '1.2rem 0',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '14px',
                    }}
                  >
                    Comments by Members
                  </Typography>
                  <TextField
                    multiline
                    rows={4}
                    value={MemComments}
                    sx={{
                      'width': '71% !important',
                      '&>div>textarea': {
                        paddingRight: '0px !important',
                        width: '100% !important',
                      },
                    }}
                    placeholder=""
                    required
                    onChange={(e) => setMemComments(e.target.value)}
                  />
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '50%',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '14px',
                    }}
                  >
                    Dissent Remark:
                  </Typography>
                  <TextField />
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              type="submit"
              sx={{
                'backgroundColor': '#3c5cd2',
                'color': '#ffffff',
                'ml': '2rem',
                'borderRadius': '0.25rem',
                'padding': '0.6rem 1.4rem',
                '&:hover': {
                  backgroundColor: '#3c5cd2',
                  color: '#ffffff',
                },
              }}
            >
              Create Minutes
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}

export default CreateMinutesModal

CreateMinutesModal.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  data: PropTypes.object,
  committeeMeetingUUID: PropTypes.string,
  setSnackbarMessage: PropTypes.func,
  setSnackbarOpen: PropTypes.func,
  setResponse: PropTypes.func,
}
