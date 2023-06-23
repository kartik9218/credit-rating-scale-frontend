import React, { useState, useEffect } from 'react'
import { Autocomplete, Avatar, Box } from '@mui/material'
import PropTypes, { object } from 'prop-types'
import ArgonTypography from 'components/ArgonTypography'
import CloseIcon from '@mui/icons-material/Close'

const ShowUser = ({
  addedMembers,
  setAddedMembers,
  deleteAttendanceConf
}) => {
  function stringToColor(string) {
    let hash = 0
    let i

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash)
    }

    let color = '#'

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff
      color += `00${value.toString(16)}`.slice(-2)
    }
    /* eslint-enable no-bitwise */

    return color
  }

  function stringAvatar(addedMembers) {
    return {
      sx: {
        bgcolor: stringToColor(addedMembers),
        width: '24px !important',
        height: '24px !important',
        fontSize: '13px',
      },
      children: `${addedMembers.split(' ')[0][0]}${addedMembers.split(' ')[1][0]}`,
    }
  }


  const handleFilterUsers = (member) => {
    let filteredMembersArr = { ...addedMembers }
    delete filteredMembersArr[member]
    setAddedMembers({ ...filteredMembersArr })
    deleteAttendanceConf(member)
  }

  return (
    <>
      {Object.keys(addedMembers)?.map((member) => {
        return (
          <React.Fragment key={member}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid',
                borderRadius: '1rem',
                borderColor: '#C9CBCE',
                m: '0.5rem',
                pr: '0.5rem',
              }}
            >
              <Avatar {...stringAvatar(addedMembers[member].label)} />
              <ArgonTypography sx={{ mx: '0.8rem', fontSize: '14px' }}>
                {addedMembers[member].label +
                  ' ' +
                  addedMembers[member].employee_code +
                  (addedMembers[member].is_chairman == true ? '(C)' : '')}
              </ArgonTypography>

              <CloseIcon
                sx={{ cursor: 'pointer' }}
                onClick={() => {
              
                  handleFilterUsers(member)
                }}
              />
            </Box>
          </React.Fragment>
        )
      })}
    </>
  )
}

ShowUser.propTypes = {
  addedMembers: PropTypes.object,
  setAddedMembers: PropTypes.func,
  deleteAttendanceConf: PropTypes.func,
  
}

export default ShowUser
