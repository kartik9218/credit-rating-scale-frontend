import { Box, Typography } from '@mui/material'
import React from 'react'
import emptybox from "assets/images/empty.png";
import PropTypes from "prop-types";

const EmptyBoxCard = (props) => {
  const { label = "No Data", style = {} } = props;  
  return (
    <Box sx={{
        display:"grid",
        placeItems:"center",
        height:"70vh",
        ...style
    }}>
      <Box sx={{display:"flex", flexDirection:"column" ,justifyContent:"center", alignItems:"center"}}>
      <img style={{opacity:'.7'}} src={emptybox} alt="empty" height="250" width={"250"}/>
      <Typography color={"gray"}>{label}</Typography>
      </Box>
    </Box>
  )
}

export default EmptyBoxCard;

EmptyBoxCard.propTypes = {
    label: PropTypes.string,
    style: PropTypes.object
}