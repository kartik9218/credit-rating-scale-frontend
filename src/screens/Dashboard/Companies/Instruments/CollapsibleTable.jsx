import * as React from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import TableContainer from '@mui/material/TableContainer'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { DataGrid } from '@mui/x-data-grid'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import {
  ClickAwayListener,
  Paper,
  MenuList,
  Menu,
  Button,
  MenuItem,
  Box,
  Collapse,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from '@mui/material'
import { GET_ROUTE_NAME, FORMATE_NUMBER, FORMATE_USER_NAME } from 'helpers/Base'
import { ArgonInput } from 'components/ArgonTheme'

function Row(props) {
  const navigate = useNavigate()
  const [ClickedRowID, setClickedRowID] = React.useState(0)
  const { row, company } = props
  const [open, setOpen] = React.useState(false)

  const [anchorSubTableEl, setAnchorSubTableEl] = React.useState(null)
  const [anchorTableEl, setAnchorTableEl] = React.useState(null)
  const SubTableOpen = Boolean(anchorSubTableEl)
  const TableOpen = Boolean(anchorTableEl)
  const handleSubTableClick = (event) => {
    setAnchorSubTableEl(event.currentTarget)
  }
  const handleSubTableClose = () => {
    setAnchorSubTableEl(null)
  }
  const handleTableClick = (event) => {
    setAnchorTableEl(event.currentTarget)
  }
  const handleTableClose = () => {
    setAnchorTableEl(null)
  }

  let handleInstrumentsChange = (value, instrumentDetail) => {
    console.log(value, instrumentDetail)
    // if (value >= 0) {
    //   let newFormValues = [...instrumentsValues];
    //   newFormValues[i]['size'] = value;
    //   let totalSize = CheckSize(newFormValues);
    //   if (formikValue["total_size"] >= totalSize) {
    //     setInstrumentsValues(newFormValues);
    //     newFormValues.forEach((fv, key) => {
    //       newFormValues[key]['errors'] = "";
    //     })
    //   } else {
    //     newFormValues[i]['size'] = instrumentsValues[i]['size'];
    //     newFormValues[i]['errors'] = "Sum of Instruments size should not be greater than the Total size of the Mandate";
    //     setInstrumentsValues(newFormValues);
    //   }
    // }
  }

  const gridColumn = [
    {
      field: 'rating_cycle',
      headerName: 'Rating Cycle',
      width: 120,
    },
    {
      field: 'meeting_date',
      headerName: 'Meeting Date',
      width: 200,
    },
    {
      field: 'rating',
      headerName: 'Rating',
      width: 120,
    },
    {
      field: 'instrument_size',
      headerName: 'Size',
      width: 150,
      renderCell: (params) => {
        return (
          <>
            <ArgonInput
              type="number"
              name="size"
              placeholder="Enter Size"
              value={FORMATE_NUMBER(params.value)}
              onChange={(ev) => handleInstrumentsChange(ev.target.value, params)}
              required
            />
            {}
          </>
        )
      },
    },
    {
      field: 'outlook',
      headerName: 'Outlook',
      width: 120,
    },
    {
      field: 'rating_acceptance',
      headerName: 'Rating Acceptance',
      width: 180,
    },
    {
      field: 'press_release',
      headerName: 'Press Release',
      width: 120,
    },
    {
      field: 'instrument_details_uuid',
      headerName: 'Action',
      width: 120,
      align: 'right',
      sortable: false,
      renderCell: (params) => {
        return (
          <>
            <Button
              id={`basic-button${params.value}`}
              aria-controls={SubTableOpen ? 'basic-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={SubTableOpen ? 'true' : undefined}
              onClick={handleSubTableClick}
            >
              <MoreVertIcon />
            </Button>
            <Menu
              id="basic-menu"
              anchorEl={anchorSubTableEl}
              open={SubTableOpen}
              onClose={handleSubTableClose}
              MenuListProps={{
                'aria-labelledby': 'basic-button' + params.value,
              }}
            >
              <MenuItem
                onClick={() => {
                  navigate(GET_ROUTE_NAME('BANK_LENDER_MANAGE', { uuid: params.row.transaction_instrument_uuid,company_uuid:company.value }))
                  handleSubTableClose()
                }}
              >
                Manage Banker/Lender
              </MenuItem>
              <MenuItem>Rating Model</MenuItem>
              <MenuItem>Other Rating Agency</MenuItem>
              <MenuItem>Due Diligence</MenuItem>
              <MenuItem>Corporate Guarantee</MenuItem>
            </Menu>
          </>
        )
      },
    },
  ]

  return (
    <div style={{ width: '75vw', overflowY: 'scroll' }}>
      <TableRow>
        <TableCell sx={{ width: '10px', fontSize: '13px' }}>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ width: '200px', fontSize: '13px', textAlign: 'center' }}>{row.mandate.mandate_id}</TableCell>
        <TableCell sx={{ width: '200px', fontSize: '13px' }}>{row.instrument_category?.category_name}</TableCell>
        <TableCell sx={{ width: '200px', fontSize: '13px' }}>{row.instrument_sub_category?.category_name}</TableCell>
        <TableCell sx={{ width: '200px', fontSize: '13px' }}>{row.instrument?.name}</TableCell>
        <TableCell sx={{ width: '200px', fontSize: '13px', textAlign: 'center' }}>
          {FORMATE_NUMBER(row.instrument_size)}
        </TableCell>
        <TableCell sx={{ width: '200px', fontSize: '13px' }}>{FORMATE_USER_NAME(row.mandate.group_head)}</TableCell>
        <TableCell sx={{ width: '200px', fontSize: '13px' }}>{FORMATE_USER_NAME(row.mandate.rating_head)}</TableCell>
        <TableCell sx={{ width: '200px', fontSize: '13px', textAlign: 'right', color: 'grey' }}>
          <Button
            id={`basic-button${row.id}`}
            aria-controls={TableOpen ? 'basic-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={TableOpen ? 'true' : undefined}
            onClick={handleTableClick}
          >
            <MoreVertIcon />
          </Button>
          <Menu
            id="basic-menu"
            anchorEl={anchorTableEl}
            open={TableOpen}
            onClose={handleTableClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button' + row.id,
            }}
          >
            <MenuItem
              onClick={() => {
                navigate(GET_ROUTE_NAME('ADD_INSTRUMENT_CREATE', { uuid: row.uuid, company_uuid:company.value }))
              }}
              sx={{ cursor: 'pointer' }}
            >
              <label>Add/Edit Instrument</label>
            </MenuItem>
            <MenuItem>
              <label>View Rating Workflow</label>
            </MenuItem>
          </Menu>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ height: 350, width: '100%', margin: '20px 0' }}>
              <DataGrid
                sx={{ fontSize: '13px', textTransform: 'capitalize', width: '100%' }}
                rows={row.metadata}
                columns={gridColumn}
                getRowId={(params) => params.instrument_details_uuid}
                hideFooter
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 1000, page: 0 },
                  },
                }}
              />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </div>
  )
}

Row.propTypes = {
  row: PropTypes.shape({
    mandate: PropTypes.any,
    instrument_category: PropTypes.any,
    instrument_sub_category: PropTypes.any,
    instrument: PropTypes.any,
    instrument_size: PropTypes.number,
    currentRating: PropTypes.any,
    metadata: PropTypes.any,
    uuid: PropTypes.any,
    id: PropTypes.number,
  }).isRequired,
  
  company: PropTypes.any.isRequired,
}

export default function CollapsibleTable(props) {
  const { instruments, company } = props
  return (
    <div style={{ paddingLeft: '20px' }}>
      <TableContainer
        component={Paper}
        sx={{ height: 400, paddingLeft: '20px', width: '76vw', overflowY: 'scroll !important' }}
      >
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow sx={{ textTransform: 'uppercase' }}>
              <TableCell sx={{ width: '10px', fontSize: '13px' }}></TableCell>
              <TableCell sx={{ width: '200px', fontSize: '13px', textAlign: 'center' }}>Mandate ID</TableCell>
              <TableCell sx={{ width: '200px', fontSize: '13px' }}>Category</TableCell>
              <TableCell sx={{ width: '200px', fontSize: '13px' }}>SubCategory</TableCell>
              <TableCell sx={{ width: '200px', fontSize: '13px' }}>Instrument</TableCell>
              <TableCell sx={{ width: '200px', fontSize: '13px', textAlign: 'center' }}>Size (in Cr.)</TableCell>
              {/* <TableCell sx={{ width: '200px', fontSize: '13px' }}>Current Rating</TableCell> */}
              <TableCell sx={{ width: '200px', fontSize: '13px' }}>Group Head</TableCell>
              <TableCell sx={{ width: '200px', fontSize: '13px' }}>Rating Head</TableCell>
              <TableCell sx={{ width: '200px', fontSize: '13px', textAlign: 'right' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {instruments.map((instrument, index) => {
              return (
                <>
                  <Row key={index + 1} row={instrument} company={company} />
                </>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}

CollapsibleTable.propTypes = {
  instruments: PropTypes.any.isRequired,
  company: PropTypes.any.isRequired,
}
