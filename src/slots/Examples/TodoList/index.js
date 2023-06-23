import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import {Table, TableBody, TableContainer, TableHead, TableRow} from '@mui/material';
import TableCell from '@mui/material/TableCell';

//  MUI components
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonBadge from "components/ArgonBadge";

function TodoList({ rows }) {
  return (
    <Card sx={{ height: "100%", overflow: "hidden" }}>
      <ArgonBox p={3}>
        <ArgonTypography variant="h5">
          List of Activities
        </ArgonTypography>
      </ArgonBox>
      <ArgonBox pb={3} px={3}>
        <TableContainer>
          <Table sx={{width:"100%"}}>
            <TableHead sx={{width:"100%",padding:0, display:"contents"}}>
              <TableRow sx={{width:"100%"}}>
                <TableCell sx={{width:"100%"}} component="th">Name of Task</TableCell>
                <TableCell sx={{width:"100%"}} component="th">Number</TableCell>
                <TableCell sx={{width:"100%"}} component="th">Priority</TableCell>
              </TableRow>
            </TableHead>
            <TableBody sx={{width:"100%"}}>
              {rows.map((row) => (
                <TableRow key={row.name_of_task} sx={{width:"100%"}}>
                  <TableCell>
                    {row.name_of_task}
                  </TableCell>
                  <TableCell>
                    {row.count}
                  </TableCell>
                  <TableCell>
                    <ArgonBadge sx={{display:"block"}} badgeContent={row.priority} container />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </ArgonBox>
    </Card>
  );
}

TodoList.propTypes = {
  rows: PropTypes.bool,
};

export default TodoList;
