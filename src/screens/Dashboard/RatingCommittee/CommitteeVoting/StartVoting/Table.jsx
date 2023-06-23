import * as React from 'react'
import Box from '@mui/material/Box'
import { DataGrid } from '@mui/x-data-grid'
import Button from '@mui/material/Button'
import Menu from './Menu'
import PropTypes from 'prop-types'
import { ClickAwayListener, Stack } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import colors from 'assets/theme/base/colors'
import CreateMinutesModal from './ModalForm'
import { useState } from 'react'
import { useEffect } from 'react'
import { HTTP_CLIENT } from 'helpers/Api'
import { APIFY } from 'helpers/Api'
import { GET_DATA } from 'helpers/Base'
import { GET_QUERY } from 'helpers/Base'
import { ArgonSnackbar } from 'components/ArgonTheme'

export default function Table({
  openVotingForm,
  setVotingList,
  VotingList,
  setClickedCompany,
  SelectedMeeting,
  setEditable,
  ChairMan,
  setChairMan,
  fetchVotingCompanies,
}) {
  const user = GET_DATA('user')
  const navigate = useNavigate()
  const [open, setOpen] = React.useState(false)
  const [Active, setActive] = React.useState(0)
  const [URL, setURL] = useState({})
  const [rowData, setRowData] = useState({})
  const committeeMeetingUUID = GET_QUERY('uuid')
  const [response, setResponse] = useState(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('Please check all required fields')

  const handleOpen = (data) => {
    setOpen(true)
    setRowData(data)
  }
  const handleClose = () => setOpen(false)
  const [isSnackbarOpen, setIsSnackbarOpen] = useState({ open: false, result: '', title: '' })
  // const onCloseSnackbar = () => {
  //   setIsSnackbarOpen({ open: false, result: '', title: '' })
  // }
  //  const getMeetingData = () => {
  //    HTTP_CLIENT(APIFY("/v1/rating_committee_meetings/view"), { params: { uuid: committeeMeetingUUID, is_active: true } })
  //      .then((data) => {
  //        console.log(data);
  //        if (data["success"]) {
  //          const { rating_committee_meeting } = data;
  //          setSelectedVotingData(...rating_committee_meeting)

  //        }
  //      })
  //      .catch((err) => {
  //        console.log(err);
  //      });
  //  };
  const onCloseSnackbar = () => {
    setSnackbarOpen(false)
  }

  // const fetchVotingCompanies = async (rcm_id) => {
  //   HTTP_CLIENT(APIFY('/v1/member/meeting/voting_list'), {
  //     params: { member_uuid: user.uuid, rating_committee_meeting_uuid: rcm_id || committeeMeetingUUID },
  //   }).then((response) => {
  //     if (response['success']) {
  //       const voting_list = response['voting_list']
  //       if (voting_list[0] == null) setVotingList([])
  //       else {
  //         setVotingList([...voting_list])
  //       }
  //     }
  //   })
  // }

  const downloadDocuments = async (company_uuid) => {
    HTTP_CLIENT(APIFY('/v1/rating_committee_data/view_documents'), {
      params: { company_uuid },
    }).then((response) => {
      if (response['success']) {
        const committee_metadata_document = response['committee_metadata_document']
        setURL({ ...committee_metadata_document })
      }
    })
  }

  useEffect(() => {
    fetchVotingCompanies(SelectedMeeting?.value)
  }, [SelectedMeeting])

  const columns = [
    {
      field: 'company_name',
      headerName: 'Company',
      headerAlign: 'center',
      align: 'left',
      width: 320,
    },
    {
      field: 'docs',
      headerName: 'Docs',
      width: 150,
      renderCell: (params) => {
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
            {Active == params.row?.company_uuid && (
              <div style={{ position: 'fixed', zIndex: '1600', marginTop: '150px' }}>
                <Menu URL={URL} setActive={setActive}></Menu>
              </div>
            )}
            <label
              style={{ color: 'slateblue', cursor: 'pointer' }}
              onClick={() => {
                if (Active === params.row?.company_uuid) setActive(0)
                else setActive(params.row?.company_uuid)

                downloadDocuments(params.row.company_uuid)
              }}
            >
              <u>View</u>
            </label>
          </>
        )
      },
    },
    {
      field: 'voting_status',
      headerName: 'Voting Status',
      width: 220,
      renderCell: (params) => {
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
                background:
                  params.row.voting_status === 'Live'
                    ? '#008000'
                    : params.row.voting_status === 'Completed'
                    ? 'slateblue'
                    : 'yellow',
                width: '15px',
                height: '15px',
                borderRadius: '10px',
              }}
            ></div>
            {params.row.voting_status}
          </div>
        )
      },
    },
    {
      field: 'action',
      headerName: 'Action',
      headerAlign: 'center',
      flex: 1,
      align: 'center',
      renderCell: (params) => {
        return (
          <div style={{ width: '100%', display: 'flex' }}>
            <div style={{ margin: 'auto 20px' }}>
              {(params.row.voting_status === 'Live' || 'Completed') && GET_DATA('active_role').name == 'Committee Member' && (
                <Button
                  variant="contained"
                  sx={{
                    'backgroundColor': colors.primary.main,
                    'color': 'white !important',
                    'padding': '2px 15px',
                    'fontSize': '13px !important',
                    '&:hover': {
                      backgroundColor: '#4159de',
                    },
                  }}
                  onClick={() => {
                    setClickedCompany(params.row)
                    openVotingForm()
                  }}
                >
                  {params.row.voting_status === 'Live' ? `Start Voting` : `View My Vote`}
                </Button>
              )}
              {GET_DATA('active_role').name == 'Compliance' &&
                (params.row.voting_status === 'Completed' || params.row.voting_status === 'Live') && (
                  <Button
                    variant="outlined"
                    // disabled={params.row.voting_status === 'Completed' ? false : true}
                    sx={{
                      'textTransform': 'none',
                      'color': 'grey',
                      'border': '1px solid grey',
                      'padding': '2px 15px',
                      'fontSize': '13px !important',
                      '&:hover': {
                        // backgroundColor: '#4159de',
                        color: 'black !important',
                      },
                    }}
                    onClick={() => handleOpen(params.row)}
                  >
                    Write Minutes
                  </Button>
                )}
            </div>
          </div>
        )
      },
    },
  ]
  return (
    <Box sx={{ height: 470, width: '100%' }}>
      {open && (
        <CreateMinutesModal
          setResponse={setResponse}
          setSnackbarMessage={setSnackbarMessage}
          setSnackbarOpen={setSnackbarOpen}
          committeeMeetingUUID={SelectedMeeting?.value}
          data={rowData}
          open={open}
          setOpen={setOpen}
        />
      )}

      <DataGrid
        className="MuiDataGridCssAdjust"
        sx={{ fontSize: '13px !important' }}
        rows={VotingList}
        getRowId={(row) => row.company_uuid}
        hideFooter
        components={{
          NoRowsOverlay: () => (
            <Stack height="100%" alignItems="center" justifyContent="center">
              No data to show. Select from above options.
            </Stack>
          ),
        }}
        columns={columns}
        disableMultipleSelection
        disableRowSelectionOnClick
      />
      {/* <ArgonSnackbar
        color={response}
        icon={response ? response : 'error'}
        title={response === 'success' ? 'Success' : response === 'error' ? 'Error' : ''}
        content={snackbarMessage}
        translate="yes"
        dateTime=""
        open={snackbarOpen}
        close={onCloseSnackbar}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      /> */}
    </Box>
  )
}
Table.propTypes = {
  openVotingForm: PropTypes.any,
  setVotingList: PropTypes.func,
  VotingList: PropTypes.arrayOf(PropTypes.object),
  ClickedCompany: PropTypes.object,
  setClickedCompany: PropTypes.func,
  SelectedMeeting: PropTypes.object,
  setEditable: PropTypes.func,
  ChairMan: PropTypes.string,
  setChairMan: PropTypes.func,
  fetchVotingCompanies: PropTypes.func,
}
