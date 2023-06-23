import * as React from "react";
import Paper from "@mui/material/Paper";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import { useNavigate } from "react-router-dom";
import { GET_ROUTE_NAME } from "helpers/Base";



export default function Menu() {
  const navigate=useNavigate();
  return (
    <Paper sx={{ width: "fit-content", maxWidth: "100%" }}>
      <div>
        <MenuList>
          <MenuItem
            onClick={() => {
              navigate(GET_ROUTE_NAME("ADD_INSTRUMENT_CREATE"));
            }}
          >
            <label>Add Instrument</label>
          </MenuItem>
          <MenuItem
            onClick={() => {
              navigate(GET_ROUTE_NAME("BANK_LENDER_MANAGE"));
            }}
          >
            <label>Manage Banker/Ledger</label>
          </MenuItem>
        </MenuList>
      </div>
    </Paper>
  );
}
