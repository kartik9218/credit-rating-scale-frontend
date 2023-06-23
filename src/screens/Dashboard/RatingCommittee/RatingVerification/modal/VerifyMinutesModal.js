import React, { useEffect, useState } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material'
import { Box } from '@mui/system'
import PropTypes from 'prop-types'
import { HTTP_CLIENT } from 'helpers/Api'
import { APIFY } from 'helpers/Api'
import { GET_QUERY } from 'helpers/Base'

const VerifyMinutesModal = ({ open, setOpen, verifyMinutesData }) => {
 
  const uuid = GET_QUERY('company-uuid')
  // const [GH_RAnames, setGH_RAnames] = useState({ GHName: '', RAName: '' })
  const [chairman, setChairman] = useState('')
  const [minutesData, setMinutesData] = useState({})

  const handleVerifyMinutes = () => {
    HTTP_CLIENT(APIFY('/v1/inbox/execution/assign_to_user'), {
      params: {
        mandate_id: [verifyMinutesData.gen_mandate_id],
        user_uuid: null,
      },
    })
      .then((data) => {})
      .catch((err) => {})
    setOpen(false)
  }

  const getMeetingMembers = () => {
    HTTP_CLIENT(APIFY('/v1/rating_committee_meetings/view_members'), {
      params: {
        rating_committee_meeting_uuid: verifyMinutesData?.rating_committee_meeting_uuid,
      },
    })
      .then((data) => {
        if (data['success']) {
          const { members } = data
          setChairman(members[0].full_name)
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }
  const getMinutes = () => {
    HTTP_CLIENT(APIFY('/v1/committee-minutes/view'), {
      params: {
        rating_committee_meeting_uuid: verifyMinutesData?.rating_committee_meeting_uuid,
      },
    })
      .then((data) => {
        const { committee_minutes } = data
        setMinutesData(committee_minutes)
      })
      .catch((err) => console.error(err))
  }
  useEffect(() => {
    getMeetingMembers()
  
    getMinutes()
  }, [])

  return (
    <>
      <Dialog
        disableEscapeKeyDown
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
        <form onSubmit={handleVerifyMinutes}>
          <DialogTitle color="#344767">Verify Minutes</DialogTitle>
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
                  <Typography sx={{ width: '42%', fontSize: '16px' }}>{verifyMinutesData?.company_name}</Typography>
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
                  <TextField value={minutesData?.group_head} placeholder="" />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography
                    sx={{
                      fontSize: '14px',
                    }}
                  >
                    Rating Analyst:
                  </Typography>
                  <TextField value={minutesData?.rating_analyst} placeholder="" />
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
                    rows={4}
                    sx={{
                      'width': '71% !important',
                      '&>div>textarea': {
                        paddingRight: '0px !important',
                        width: '100% !important',
                      },
                    }}
                    placeholder=""
                    value={minutesData?.discussion_paragraph}
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
                    sx={{
                      'width': '71% !important',
                      '&>div>textarea': {
                        paddingRight: '0px !important',
                        width: '100% !important',
                      },
                    }}
                    placeholder=""
                    value={minutesData?.comments_paragraph}
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
              Verify Minutes
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}

export default VerifyMinutesModal

VerifyMinutesModal.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  verifyMinutesData: PropTypes.object,
}
