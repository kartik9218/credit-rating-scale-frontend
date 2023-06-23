import * as React from 'react'
import PropTypes from 'prop-types'
import { HTTP_CLIENT } from 'helpers/Api'
import { APIFY } from 'helpers/Api'
import { Box, FormControlLabel, Radio, RadioGroup, Stack, TextField } from '@mui/material'
import { GET_DATA } from 'helpers/Base'
import { GET_QUERY } from 'helpers/Base'
import { DataGrid } from '@mui/x-data-grid'
import { useState } from 'react'
import RadioModal from './RadioModal'
import { useEffect } from 'react'

const user = GET_DATA('user')

export default function VotingTable({
  Editable,
  mandate_uuid,
  ClickedCompany,
  committee_registers,
  SelectedVotingData,
  setCommittee_registers,
  ClickedMember,
  setGhRaList,
  Rows,
  setRows,
  AgreeRemark,
  DisagreeRemark,
  DissentRemark,
  setDisagreeRemark,
  setAgreeRemark,
  setDissentRemark,
}) {
  const [OpenRadioModal, setOpenRadioModal] = useState(false)
  const [Response, setResponse] = useState(true)

  const [RowModalParams, setRowModalParams] = useState([])
  const handleOpen = () => {
    setOpenRadioModal(true)
  }

  useEffect(() => {
    console.log(SelectedVotingData, 'SelectedVotingData')
  }, [])

  const columnsData = [
    {
      field: 'mandate_id',
      headerName: 'Mandate ID',
      width: 180,
      headerAlign: 'center',
      align: 'center',
      headerClassName: 'voting-header-class',
    },
    {
      field: 'instrument_text',
      headerName: 'Instrument',
      width: 180,
      headerAlign: 'center',
      align: 'center',
      headerClassName: 'voting-header-class',
    },
    {
      field: 'instrument_size_number',
      headerName: 'Value(in Cr.)',
      width: 86,
      headerAlign: 'center',
      align: 'center',
      headerClassName: 'voting-header-class',
    },
    {
      field: 'display_proposed_rating',
      headerName: 'Proposed Rating',
      width: 180,
      headerAlign: 'center',
      align: 'center',
      headerClassName: 'voting-header-class',
    },
    {
      field: 'display_response',
      headerName: 'Agree/Disagree',
      width: 180,
      headerAlign: 'center',
      align: 'center',
      headerClassName: 'voting-header-class',
      renderCell: (params) => {
        return (
          <RadioGroup
            className="MUIRadioButtonCSSAdjust"
            sx={{ width: '200px', display: 'flex', flexDirection: 'row', justifyContent: 'center' }}
          >
            <FormControlLabel
              sx={{ flex: 1 }}
              control={<Radio checked={params.row.display_proposed_rating === params.row.display_assigned_rating} />}
              label="Agree"
              onClick={() => {
                params.row.temp_response = true
                setRowModalParams({ ...params.row })
                handleOpen()

                console.log(params.row)
              }}
            />
            <FormControlLabel
              sx={{ flex: 1 }}
              control={<Radio checked={params.row.display_proposed_rating !== params.row.display_assigned_rating} />}
              label="Disagree"
              onClick={() => {
                params.row.temp_response = false
                setRowModalParams({ ...params.row })
                handleOpen()
                console.log(params.row)
              }}
            />
          </RadioGroup>
        )
      },
    },
    {
      field: 'display_assigned_rating',
      headerName: 'Assigned Rating',
      width: 250,
      headerAlign: 'center',
      align: 'center',
      headerClassName: 'voting-header-class',
    },
    {
      field: 'remarks',
      headerName: 'Remarks',
      width: 170,
      headerAlign: 'center',
      align: 'center',
      headerClassName: 'voting-header-class',
      renderCell: (params) => {
        if (params.row.display_proposed_rating === params.row.display_assigned_rating) return <div>{AgreeRemark}</div>
        else return <div>{DisagreeRemark}</div>
      },
    },
    {
      field: 'dissent',
      headerName: 'Dissent',
      width: 80,
      headerAlign: 'center',
      align: 'center',
      headerClassName: 'voting-header-class',
    },
    {
      field: 'dissent_remark',
      headerName: 'Dissent Remark',
      width: 170,
      headerAlign: 'center',
      align: 'center',
      headerClassName: 'voting-header-class',
      renderCell: (params) => {
        if (params.row.dissent == true)
          return (
            <>
              {
                <TextField
                  multiline
                  maxRows={2}
                  value={DissentRemark}
                  onChange={(e) => {
                    setDissentRemark(e.target.value)
                  }}
                ></TextField>
              }
            </>
          )
      },
    },
    {
      field: 'display_final_rating',
      headerName: 'Final Rating',
      width: 170,
      headerAlign: 'center',
      align: 'center',
      headerClassName: 'voting-header-class',
    },
  ]
  return (
    <>
      <Box
        sx={{
          'height': 300,
          'width': '100%',
          '& .voting-header-class': {
            backgroundColor: 'rgb(240,248,255)',
          },
        }}
      >
        <DataGrid
          rowHeight={50}
          rows={[...Rows]}
          onCellKeyDown={(params, events) => events.stopPropagation()}
          disableSelectionOnClick
          getRowId={(row) => row?.instrument_detail_uuid}
          columns={columnsData}
          columnVisibilityModel={{
            display_final_rating:
              ClickedCompany.voting_status === 'Live' && GET_DATA('active_role').name == 'Committee Member' ? false : true,
          }}
          hideFooter
          className="MuiDataGridCssAdjust"
          components={{
            NoRowsOverlay: () => (
              <Stack height="100%" alignItems="center" justifyContent="center">
                No instrument for voting
              </Stack>
            ),
          }}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 250, page: 0 },
            },
          }}
          sx={{ fontSize: '13px' }}
        />
      </Box>

      <RadioModal
        RowModalParams={RowModalParams}
        setResponse={setResponse}
        OpenRadioModal={OpenRadioModal}
        setOpenRadioModal={setOpenRadioModal}
        setRowModalParams={setRowModalParams}
        Rows={Rows}
        setRows={setRows}
        AgreeRemark={AgreeRemark}
        DisagreeRemark={DisagreeRemark}
        DissentRemark={DissentRemark}
        setAgreeRemark={setAgreeRemark}
        setDisagreeRemark={setDisagreeRemark}
        setDissentRemark={setDisagreeRemark}
      ></RadioModal>
    </>
  )
}
VotingTable.propTypes = {
  Rows: PropTypes.arrayOf(PropTypes.object),
  setRows: PropTypes.func,
  Editable: PropTypes.bool,
  mandate_uuid: PropTypes.string,
  ClickedCompany: PropTypes.object,
  committee_registers: PropTypes.object,
  setCommittee_registers: PropTypes.func,
  ClickedMember: PropTypes.object,
  SelectedVotingData: PropTypes.object,
  setGhRaList: PropTypes.func,
  AgreeRemark: PropTypes.string,
  DisagreeRemark: PropTypes.string,
  DissentRemark: PropTypes.string,
  setDisagreeRemark: PropTypes.func,
  setAgreeRemark: PropTypes.func,
  setDissentRemark: PropTypes.func,
}
