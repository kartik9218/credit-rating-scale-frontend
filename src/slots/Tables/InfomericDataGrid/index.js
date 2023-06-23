import { Box, Pagination } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import PropTypes from "prop-types";

const InfomericsDataGrid = (props) => {
  const { rows, columns, showPagination = false , showCheckbox = true, getSelectedRowsId = null} = props;
  return (
    <Box sx={{ width: "100%", height: "300px" }}>
      <DataGrid
        // disableRowSelectionOnClick={true} 
        // isRowSelectable={() => false}
        rows={rows}
        columns={columns}
        pageSize={rows.length}
        rowsPerPageOptions={[5]}
        checkboxSelection={showCheckbox}
        hideFooter={true}
        onSelectionModelChange={getSelectedRowsId}
        rowSelection={false}
        getRowId={(row) => row.uuid}
        // getRowHeight={({ model: { roles }, densityFactor }) => {
        //   if (roles?.length) {
        //     return 100 * densityFactor;
        //   }
        //   return null;
        // }}
        className={"data-grid-wrapper"}
      />
      {showPagination && <Pagination />}
    </Box>
  );
};

InfomericsDataGrid.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  showPagination: PropTypes.bool,
  showCheckbox: PropTypes.bool,
  getSelectedRowsId: PropTypes.func,
};

export default InfomericsDataGrid;
