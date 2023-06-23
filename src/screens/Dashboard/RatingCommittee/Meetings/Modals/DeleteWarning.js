import React from "react";
import PropTypes from "prop-types";
import { Button, Dialog, DialogActions, DialogTitle, Typography } from "@mui/material";
import { HTTP_CLIENT } from "helpers/Api";
import { APIFY } from "helpers/Api";

const DeleteWarning = ({ deleteModal, setDeleteModal, ClickedObj, getMeetings }) => {
  const deleteMeeting = async () => {

    HTTP_CLIENT(APIFY("/v1/rating_committee_meetings/edit"), {
      params: {
        uuid: ClickedObj.uuid,
        rating_committee_type_uuid: ClickedObj.rating_committee_type.uuid,
        rating_committee_meeting_category_uuid: ClickedObj.rating_committee_meeting_category.uuid,
        meeting_at: ClickedObj.meeting_at,
        is_active: false,
      },
    }).then((response) => {
      if (response["success"]) {
        getMeetings();
        
        
        return;
      } else {
       
      }
    });
  };

  return (
    <>
      {deleteModal && (
        <Dialog sx={{ zIndex: "1600" }} open={deleteModal} onClose={() => setDeleteModal(false)}>
          <DialogTitle sx={{ textAlign: "center" }}>
            {"Are you sure you want to perform this action ?"}
            <Typography sx={{ fontSize: "0.8rem", color: "red" }}>This action cannot be undone</Typography>
          </DialogTitle>
          <DialogActions>
            <Button
              variant="contained"
              color="primary"
              sx={{
                backgroundColor: "#3c5cd2",
                color: "#ffffff",
                ml: "2rem",
                display: "flex",
                alignItems: "center",
                "&:hover": {
                  backgroundColor: "#3c5cd2",
                  color: "#ffffff",
                },
              }}
              onClick={() => setDeleteModal(false)}
            >
              No
            </Button>
            <Button
              variant="contained"
              color="error"
              sx={{
                border: "1px solid rgba(211, 47, 47, 0.5)",
                color: "#d32f2f",
                "&:hover": {
                  color: "#d32f2f",
                },
              }}
              onClick={() => {
                deleteMeeting(ClickedObj);
                setDeleteModal(false);
              }}
              autoFocus
            >
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default DeleteWarning;

DeleteWarning.propTypes = {
  deleteModal: PropTypes.bool,
  setDeleteModal: PropTypes.bool,
  ClickedObj: PropTypes.object,
  getMeetings: PropTypes.func,
};
