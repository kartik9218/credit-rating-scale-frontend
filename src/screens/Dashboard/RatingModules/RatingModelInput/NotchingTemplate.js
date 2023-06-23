import React, { useEffect } from 'react'
import PropTypes from "prop-types";
import { styled } from '@mui/material/styles';
import { TableContainer, TableHead, TableRow, Paper, FormControl, NativeSelect, TableBody, Table, Box, Grid, Button } from '@mui/material';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import { FORMATE_NUMBER } from 'helpers/Base';
import { KeyboardDoubleArrowLeft, KeyboardDoubleArrowRight } from '@mui/icons-material';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#0000000f",
    color: "#000000",
    borderRadius: 0,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    borderRadius: 0,
  },
}));

const ParameterDropdown = (params) => {
  const { updateNotchingFactor, riskIndex, factorIndex, notchingIndex } = params;
  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <NativeSelect
          className="parameter-dropdown"
          // defaultValue={30}
          inputProps={{
            name: 'Parameter',
            id: `uncontrolled-native${params.key}`,
          }}
          sx={{ border: 0, minWidth: "100%" }}
          onChange={(e) => updateNotchingFactor(e, riskIndex, factorIndex, notchingIndex)}
        >
          {params.parameters.map((para, key) => {
            return <option key={key} value={para.score}>{para.name}</option>
          })}
        </NativeSelect>
      </FormControl>
    </Box>
  );
}

NotchingTemplate.propTypes = {
  key: PropTypes.any.isRequired,
  parameters: PropTypes.any.isRequired,
  factorIndex: PropTypes.any.isRequired,
  riskIndex: PropTypes.any.isRequired,
  updateNotchingFactor: PropTypes.any.isRequired,
  notchingIndex: PropTypes.any.isRequired,
};

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  marginBottom: "5px",
  '&:nth-of-type(odd)': {
    backgroundColor: "#ffffff",
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

function NotchingTemplate(props) {
  const { risk, index, updateNotchingFactor, notchingIndex, handleChange, notchingKey } = props;

  return (
    <TableContainer component={Paper} sx={{ borderRadius: "0", padding: "20px 0" }}>
      <Table aria-label="customized table" sx={{ padding: 0, width: "100%", display: "block", borderRadius: "0" }}>
        <TableHead sx={{ padding: 0, width: "100%", borderRadius: "0" }}>
          <TableRow>
            <StyledTableCell sx={{ width: 550 }}>Question</StyledTableCell>
            <StyledTableCell sx={{ width: 300 }}>Choose Parameter</StyledTableCell>
            <StyledTableCell sx={{ width: 100 }}>Score</StyledTableCell>
            <StyledTableCell sx={{ width: 270 }}>Weighted assigned Score</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody sx={{ padding: 0, width: "100%" }}>
          {risk.factors && risk?.factors.map((factor, key) => (
            <StyledTableRow key={factor.question} sx={{ padding: 0, width: "100%" }}>
              <StyledTableCell component="th" sx={{ width: 550 }}>
                {factor.question}
              </StyledTableCell>
              <StyledTableCell sx={{ width: 300 }}><ParameterDropdown key={key + 1} parameters={factor.factor_parameters} updateNotchingFactor={updateNotchingFactor} factorIndex={key} riskIndex={index} notchingIndex={notchingIndex} /></StyledTableCell>
              <StyledTableCell sx={{ width: 100 }}>{factor?.score || 0}</StyledTableCell>
              <StyledTableCell sx={{ width: 270 }}>{factor.coefficient ? FORMATE_NUMBER(factor.coefficient) : 0}</StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
      <Grid item sx={{ float: "right", padding: "10px 20px" }}>
        <Button
          variant="outlined"
          color="success"
          className='backButton'
          sx={{ padding: "12px", minWidth: "0", marginLeft: "15px", marginRight: "15px" }}

          onClick={() => handleChange(notchingKey - 1)}
        >
          <KeyboardDoubleArrowLeft />
          Back
        </Button>
        <Button
          variant="contained"
          color="success"
          className='nextButton'
          sx={{ padding: "12px", minWidth: "0", marginLeft: "15px" }}
          onClick={() => handleChange(notchingKey + 1)}
        >
          Next
          <KeyboardDoubleArrowRight />
        </Button>
      </Grid>
    </TableContainer>
  );
}

NotchingTemplate.propTypes = {
  risk: PropTypes.any.isRequired,
  index: PropTypes.any.isRequired,
  updateNotchingFactor: PropTypes.any.isRequired,
  notchingIndex: PropTypes.any.isRequired,
  handleChange: PropTypes.any.isRequired,
  notchingKey: PropTypes.any.isRequired,
};
export default NotchingTemplate;