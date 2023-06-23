import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { Autocomplete, Box, FormControlLabel, Switch, Typography } from "@mui/material";
import { useState } from "react";
import { HTTP_CLIENT } from "helpers/Api";
import { APIFY } from "helpers/Api";
import PropTypes, { object } from "prop-types";

export default function AddModal({ SelectedCommitteeCategory, SelectedCommitteeType, SelectedDay, setPayloadRows, PayloadRows, fetchAttendanceConf, AlreadyHaveChairman, setAlreadyHaveChairman, rows, setLocalRows, LocalRows }) {
  const [UserData, setUserData] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [SelectedUser, setSelectedUser] = useState({});
  const [isChairman, setIsChairman] = useState(false);


  const fetchUserData = () => {
    HTTP_CLIENT(APIFY('/v1/roles/view_users'), { role: 'Committee Member' }).then((data) => {
      const users = data.role.users
     
      let temp = [...users]
   
      temp = temp.map((val) => {
        return { ...val, label: val.full_name, value: val.uuid }
      })
      setUserData([...temp])
    })
  }
  const addAttToLocalGrid = () => {
    if ([...LocalRows].filter((val) => val.is_chairman).length === 1 && isChairman) {
      alert("Only one person can be chairman");
      return;
    } else {
      let newObj = {
        is_chairman: isChairman,
        is_active: true,
        member: {
          uuid: SelectedUser.uuid,
          id: SelectedUser.id,
          employee_code: SelectedUser?.employee_code,
          full_name: SelectedUser.full_name,
        },
      };
      setLocalRows([...LocalRows, newObj]);
      setPayloadRows([...PayloadRows, newObj]);
      let temp = [...PayloadRows, newObj];
    }
  };

  React.useEffect(() => {
    fetchUserData();
  }, []);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setIsChairman(false);
  };

  return (
    <div>
      <Button sx={{ background: "#5e72e4 !important", color: "white !important" }} variant="contained" disabled={Object.keys(SelectedCommitteeCategory)?.length > 0 && Object.keys(SelectedCommitteeType)?.length > 0 && SelectedDay !== "" ? false : true} onClick={handleClickOpen}>
        Assign members
      </Button>
      <Dialog open={open} onClose={handleClose} PaperProps={{ sx: { width: "30%", height: "60%", padding: 1 } }}>
        <DialogTitle>Assign member</DialogTitle>
        <DialogContent>
          <DialogContentText>Select member to add</DialogContentText>
      
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography component="label" variant="caption" fontWeight="bold" sx={{ margin: "20px 20px" }}>
              Member Name
            </Typography>
            <Autocomplete
              disablePortal
              disableClearable
              options={[...UserData].filter((userval) => [...rows, ...LocalRows].map((rowval) => rowval?.member?.uuid).indexOf(userval.value) == -1)}
              onChange={(e, val) => {
                setSelectedUser(val);
              }}
              ListboxProps={{ style: { maxHeight: 190 } }}
              sx={{ width: 220 }}
              renderInput={(params) => <TextField {...params} placeholder="Select Member" sx={{ "&>div": { fontSize: "12px !important", height: "35px !important", width: "235px !important" } }} />}
            />
          </Box>
          <div style={{ margin: "20px 5px" }}>
            <FormControlLabel onChange={() => setIsChairman(!isChairman)} control={<Switch color="primary" />} label="Chairman" labelPlacement="start" />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={() => {
              addAttToLocalGrid();

              handleClose();
            }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
AddModal.propTypes = {
  SelectedCommitteeCategory: PropTypes.object,
  SelectedCommitteeType: PropTypes.object,
  SelectedDay: PropTypes.string,
  fetchAttendanceConf: PropTypes.func,
  AlreadyHaveChairman: PropTypes.number,
  rows: PropTypes.arrayOf(PropTypes.object),
  setLocalRows: PropTypes.func,
  LocalRows: PropTypes.arrayOf(PropTypes.object),
  setAlreadyHaveChairman: PropTypes.func,
  PayloadRows: PropTypes.arrayOf(PropTypes.object),
  setPayloadRows: PropTypes.func,
};
