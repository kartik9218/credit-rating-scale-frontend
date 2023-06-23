import React from 'react'
import PropTypes from 'prop-types'
import { Button, Dialog, DialogActions, DialogTitle, Typography } from '@mui/material'
import { HTTP_CLIENT } from 'helpers/Api'
import { APIFY } from 'helpers/Api'

const ConfirmModal = ({
  OpenConfirmModal,
  setOpenConfirmModal,
  ClickedMemberUUID,
  LocalRows,
  setLocalRows,
  setPayloadRows,
  PayloadRows,
  Action,
}) => {
  const deleteAttendanceConf = async () => {
    if ([...LocalRows].map((rowval) => rowval.member?.uuid).indexOf(ClickedMemberUUID.member.uuid) >= 0) {
      setLocalRows([...LocalRows].filter((rowval) => rowval.member?.uuid != ClickedMemberUUID.member.uuid))
      PayloadRows.map((val) => {
        if (val.member?.uuid == ClickedMemberUUID.member?.uuid) {
          val.is_active = false
        }
      })
    }
  }

  const chairmanAttendanceConf = async () => {
    console.log(LocalRows,"LocalRows")
    console.log(PayloadRows, 'PayloadRows')
    console.log(ClickedMemberUUID)
    let newRows = [...LocalRows].map((val) => {
      if (val.member?.uuid == ClickedMemberUUID.member?.uuid) {
        val.is_chairman = true
        return(val)
      } else {val.is_chairman = false
        return(val)}
    })

      
    setLocalRows(newRows)
    PayloadRows=newRows
  }

  return (
    <>
      {OpenConfirmModal && (
        <Dialog sx={{ zIndex: '1600' }} open={OpenConfirmModal} onClose={() => setOpenConfirmModal(false)}>
          <DialogTitle sx={{ textAlign: 'center', fontSize: '14px' }}>{'Are you sure ?'}</DialogTitle>
          <DialogActions sx={{ display: 'flex', justifyContent: 'space-around' }}>
            <Button
              variant="contained"
              color="primary"
              sx={{
                'backgroundColor': '#3c5cd2',
                'color': '#ffffff',
                'fontSize': '14px',
                'display': 'flex',
                'alignItems': 'center',
                '&:hover': {
                  backgroundColor: '#3c5cd2',
                  color: '#ffffff',
                },
              }}
              onClick={() => setOpenConfirmModal(false)}
            >
              No
            </Button>
            <Button
              variant="contained"
              color="error"
              sx={{
                'border': '1px solid',
                // 'color': '#d32f2f',
                'fontSize': '14px',
                '&:hover': {
                  color: '#d32f2f',
                },
              }}
              onClick={() => {
                Action == 'Delete' ? deleteAttendanceConf() : chairmanAttendanceConf()
                setOpenConfirmModal(false)
              }}
              autoFocus
            >
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  )
}

export default ConfirmModal
ConfirmModal.propTypes = {
  OpenConfirmModal: PropTypes.bool,
  setOpenConfirmModal: PropTypes.func,
  ClickedMemberUUID: PropTypes.object,
  LocalRows: PropTypes.array,
  setLocalRows: PropTypes.func,
  PayloadRows: PropTypes.arrayOf(PropTypes.object),
  setPayloadRows: PropTypes.func,
  fetchAttendanceConf: PropTypes.func,
  AlreadyHaveChairman: PropTypes.number,
  setAlreadyHaveChairman: PropTypes.func,
  Action: PropTypes.string,
}
