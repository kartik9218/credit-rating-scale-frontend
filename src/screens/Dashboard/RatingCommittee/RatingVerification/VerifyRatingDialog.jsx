import * as React from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import PropTypes from 'prop-types'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DialogTitle from '@mui/material/DialogTitle'
import { Autocomplete, Box, Grid } from '@mui/material'
import { useState } from 'react'
import { useEffect } from 'react'
import { HTTP_CLIENT } from 'helpers/Api'
import { APIFY } from 'helpers/Api'
import { DataGrid } from '@mui/x-data-grid'
import { GET_QUERY } from 'helpers/Base'

export default function VerifyRatingDialog({ company_name, rating_committee_meeting_uuid, OneRow }) {
  const [open, setOpen] = React.useState(false)
  const [scroll, setScroll] = React.useState('paper')
  const [SelectedVotingData, setSelectedVotingData] = useState({})
  const [Rows, setRows] = useState([])
  const [Chairman, setChairman] = useState({})
  const [MembersRows, setMembersRows] = useState([])

  const handleClickOpen = (scrollType) => () => {
    setOpen(true)
    setScroll(scrollType)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const descriptionElementRef = React.useRef(null)
  React.useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef
      if (descriptionElement !== null) {
        descriptionElement.focus()
      }
    }
  }, [open])

  const getMeetingData = () => {
   
    HTTP_CLIENT(APIFY('/v1/rating_committee_meetings/view'), {
      params: { uuid: rating_committee_meeting_uuid },
    })
      .then((data) => {
        if (data['success']) {
          const { rating_committee_meeting } = data
          
          setSelectedVotingData({ ...rating_committee_meeting })
        }
      })
      .catch((err) => {
     
      })
  }
  const handleVerifyRating = () => {
    HTTP_CLIENT(APIFY('/v1/inbox/execution/assign_to_user'), {
      params: {
       
        mandate_id: [Rows[0].mandate_id],
        user_uuid: null,
        code: GET_QUERY('code'),
      },
    })
      .then((data) => {
    
      })
      .catch((err) => {
      
      })
  }
  const getMeetingMembers = () => {
    HTTP_CLIENT(APIFY('/v1/rating_committee_meetings/view_members'), {
      params: {
        rating_committee_meeting_uuid: rating_committee_meeting_uuid,
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
      .catch((err) => {
    
      })
  }

  
  const MembersColumns = [
    {
      field: 'full_name',
      headerName: 'Member Name',
      width: 200,
    },
    {
      field: 'employee_code',
      headerName: 'Description',
      width: 200,
    },
    {
      field: 'chairman',
      headerName: 'Chairman',
      width: 200,
      renderCell: (cell) => {
        return <>{cell.row?.employee_code === Chairman.employee_code && <CheckCircleIcon />}</>
      },
    },
    {
      field: 'attended',
      headerName: 'Attendance',
      width: 200,
      renderCell: (cell) => {
        return <>{<CheckCircleIcon />}</>
      },
    },
  ]

  const columns = [
    {
      field: 'company_name',
      headerName: 'Name of Company',
      width: 200,
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
    },
    {
      field: 'facility',
      headerName: 'Facility Name',
      width: 200,
    },
    {
      field: 'assigned_rating',
      headerName: 'IRCM Rating all',
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
    getMeetingData()
    setRows([{ ...OneRow }])
    getMeetingMembers()
    
  }, [])

  return (
    <div>
      <Button onClick={handleClickOpen('paper')}>{company_name}</Button>
       <Dialog
        disableEscapeKeyDown
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: {
            position: 'absolute',
          },
        }}
        xs={{ zIndex: 1600 }}
        open={open}
        onClose={handleClose}
        scroll={scroll}
      >
        <DialogTitle id="scroll-dialog-title">Rating Verification</DialogTitle>
        <DialogContent dividers={scroll === 'paper'}>
          <DialogContentText id="scroll-dialog-description" ref={descriptionElementRef} tabIndex={-1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
              <Box>
                <label style={{ marginRight: '10px' }}>
                  <b>Committee Type</b>
                </label>
                <label>{SelectedVotingData.rating_committee_type?.name}</label>
              </Box>
              <Box>
                <label style={{ marginRight: '10px' }}>
                  <b>Committee Category</b>
                </label>
                <label> {SelectedVotingData.rating_committee_meeting_category?.name}</label>
              </Box>
              <Box>
                <label style={{ marginRight: '10px' }}>
                  <b>Date and Time</b>
                </label>
                <label>{`${SelectedVotingData.meeting_at?.substr(0, 10)} 
                ${SelectedVotingData.meeting_at
                  ?.toLocaleString('en-US', {
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true,
                  })
                  .substr(11, 5)} `}</label>
              </Box>
            </Box>
            <Grid sx={{ height: 240, px: '0.8rem', py: '20px' }}>
              <DataGrid
                rows={MembersRows}
                columns={MembersColumns}
                getRowId={(row) => row?.uuid}
                sx={{ fontSize: '13px', width: '90%' }}
                rowHeight={40}
                hideFooter
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 1000, page: 0 },
                  },
                }}
              />
            </Grid>
            <Grid sx={{ height: 200, width: '100%', px: '0.8rem' }}>
              <DataGrid
                rows={Rows}
                columns={columns}
                getRowId={(row) => row?.instrument_detail_uuid}
                sx={{ fontSize: '13px' }}
             
                hideFooter
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 1000, page: 0 },
                  },
                }}
              />
            </Grid>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Back</Button>
          <Button
            onClick={() => {
              handleVerifyRating()
              handleClose()
            }}
          >
            Verify
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
VerifyRatingDialog.propTypes = {
  company_name: PropTypes.string,
  rating_committee_meeting_uuid: PropTypes.string,
  OneRow: PropTypes.object,
}
