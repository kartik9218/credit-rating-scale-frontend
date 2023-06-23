import { useState } from 'react'
import Popover from '@mui/material/Popover'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import ImportExportOutlinedIcon from '@mui/icons-material/ImportExportOutlined'
import colors from 'assets/theme/base/colors'
import PropTypes from 'prop-types'

export default function ExportPopover({ logData, setPdfState }) {
  const [anchorEl, setAnchorEl] = useState(null)

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const modifyTableData = (data) => {
    return data.map((val) => {
      delete val.uuid
      Object.assign(val, { 'Agenda Type': '' })
      return val
    })
  }

  const REMOVE_CAMEL_CASE = (str) => {
    const arr = str.split(' ')
    for (let i = 0; i < arr.length; i++) {
      arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1)
    }
    return arr.join(' ')
  }

  const DOWNLOAD_CSV = (data) => {
    const blob = new Blob([data], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('href', url)
    a.setAttribute('download', 'doc.csv')
    a.click()
  }

  const CSV_MAKER = function (data) {
    const filteredData = modifyTableData(data)
    const CONVERT_TO_CAMEL_CASE = (str) => {
      const arr = str.split(' ')
      for (let i = 0; i < arr.length; i++) {
        arr[i] = arr[i].charAt(0).toLowerCase() + arr[i].slice(1)
      }
      return arr.join('_')
    }
    const csvRows = []
    const headers = Object.keys(filteredData[0])
      .map((words) => words.split('_').join(' '))
      .map((str) => REMOVE_CAMEL_CASE(str))

    csvRows.push(headers.join(','))
    for (const row of filteredData) {
      const values = headers.map((header) => {
        let val = row[CONVERT_TO_CAMEL_CASE(header)]
        return `"${val}"`
      })
      csvRows.push(values.join(','))
    }
    return csvRows.join('\n')
  }

  const handleDownloadCSV = () => {
    if (!logData.length > 0) return
    DOWNLOAD_CSV(CSV_MAKER(logData))
  }

  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

  return (
    <div>
      <Button
        variant="contained"
        sx={{
          'margin': '5px 5px',
          'backgroundColor': colors.primary.main,
          'color': 'white !important',
          'padding': '2px 15px',
          'fontSize': '13px !important',
          '&:hover': {
            backgroundColor: '#4159de',
          },
        }}
        onClick={handleClick}
      >
        <ImportExportOutlinedIcon sx={{ mr: '0.25rem' }} />
        Export
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Typography
          sx={{ fontSize: '14px', padding: ' 2px 2px', width: '70px', textAlign: 'center' }}
          onClick={handleDownloadCSV}
        >
          Excel
        </Typography>
        <Typography
          sx={{ fontSize: '14px', padding: ' 2px 2px', width: '70px', textAlign: 'center' }}
          onClick={() => setPdfState(true)}
        >
          PDF
        </Typography>
      </Popover>
    </div>
  )
}

ExportPopover.propTypes = {
  logData: PropTypes.array,
  setPdfState: PropTypes.func,
}
