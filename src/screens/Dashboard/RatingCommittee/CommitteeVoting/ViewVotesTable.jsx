import * as React from 'react'
import ColumnHeader from './ColumnHeader'
import PropTypes from 'prop-types'
import { HTTP_CLIENT } from 'helpers/Api'
import { APIFY } from 'helpers/Api'
import { Box, Stack } from '@mui/material'
import { GET_DATA } from 'helpers/Base'
import { GET_QUERY } from 'helpers/Base'
import { DataGrid } from '@mui/x-data-grid'
import { useState } from 'react'

const user = GET_DATA('user')

export default function ViewVotesTable({ Rows }) {
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
        let response = ''
        params.row.display_proposed_rating === params.row.display_assigned_rating
          ? (response = 'Agree')
          : params.row.display_assigned_rating.indexOf('Not Voted')>=0
          ? (response = 'Not Voted')
          : (response = 'Disagree')
        return <label>{response}</label>
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
      field: 'dissent_remarks',
      headerName: 'Dissent Remark',
      width: 170,
      headerAlign: 'center',
      align: 'center',
      headerClassName: 'voting-header-class',
    },
    {
      field: 'display_final_rating',
      headerName: 'Final Rating',
      width: 170,
      headerAlign: 'center',
      align: 'center',
      headerClassName: 'voting-header-class',

      //   renderCell: (params) => {
      //     return <label>{params.row.final_rating + '(' + params.row.final_outlook + ')'}</label>
      //   },
    },
  ]

  return (
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
        hideFooter
        className="MuiDataGridCssAdjust"
        components={{
          NoRowsOverlay: () => (
            <Stack height="100%" alignItems="center" justifyContent="center">
              No votes to display
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
  )
}
ViewVotesTable.propTypes = {
  Editable: PropTypes.bool,
  mandate_uuid: PropTypes.string,
  ClickedCompany: PropTypes.object,
  committee_registers: PropTypes.object,
  setCommittee_registers: PropTypes.func,
  ClickedMember: PropTypes.object,
  SelectedVotingData: PropTypes.object,
  setGhRaList: PropTypes.func,
  Rows: PropTypes.arrayOf(PropTypes.object),
  setRows: PropTypes.func,
}
