import Paper from "@mui/material/Paper";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import { ClickAwayListener, Link, Tooltip } from "@mui/material";
import PropTypes from "prop-types";

export default function Menu({ setOpen, URL }) {
  return (
    <ClickAwayListener onClickAway={() => setOpen(0)}>
      <Paper sx={{ width: "fit-content", maxWidth: "100%" }}>
        <div>
          <MenuList>
            <Link target="_blank" href={URL.rating_note}>
              <MenuItem>
                <Tooltip title="Click to view document">
                  <label>Rating Note</label>
                </Tooltip>
              </MenuItem>
            </Link>

            <Link target="_blank" href={URL.financial}>
              <MenuItem>
                <Tooltip title="Click to view document">
                  <label>Financial Spread</label>
                </Tooltip>
              </MenuItem>
            </Link>

            <Link target="_blank" href={URL.other_document}>
              <MenuItem>
                <Tooltip title="Click to view document">
                  <label>Rating Model</label>
                </Tooltip>
              </MenuItem>
            </Link>

            <Link target="_blank" href={URL.other_document}>
              <MenuItem>
                <Tooltip title="Click to view document">
                  <label>Other Documents</label>
                </Tooltip>
              </MenuItem>
            </Link>
          </MenuList>
        </div>
      </Paper>
    </ClickAwayListener>
  );
}

Menu.propTypes = {
  setOpen: PropTypes.func,
  URL: PropTypes.obj,
};
